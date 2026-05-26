export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { verifyPayment } from '@/lib/payment/server'

/**
 * GET /api/payments/verify?paymentId=xxx
 * Verify payment status and activate/update subscription.
 * Called when user returns from the hosted payment page.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByAuthId(authUser.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    }

    console.log('[PaymentVerify] Verifying paymentId:', paymentId, '| user:', user.id)

    // ── Real payment status check ──────────────────────────────────────────
    const payment = await verifyPayment(paymentId)

    console.log('[PaymentVerify] Status from payment API:', payment.status)

    if (payment.status !== 'completed' && payment.status !== 'success' && payment.status !== 'approved') {
      return NextResponse.json(
        { error: 'Payment not completed', status: payment.status },
        { status: 402 }
      )
    }

    const userId = payment.metadata?.userId
    const roomId  = payment.metadata?.roomId

    if (!userId || !roomId) {
      return NextResponse.json(
        { error: 'Missing metadata in payment record' },
        { status: 400 }
      )
    }

    // Security: ensure this payment belongs to the authenticated user
    if (userId !== String(user.id)) {
      console.warn('[PaymentVerify] User mismatch. Token user:', user.id, '| Payment user:', userId)
      return NextResponse.json(
        { error: 'Payment does not belong to this user' },
        { status: 403 }
      )
    }

    // Upsert subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('subscriber_id', userId)
      .eq('room_id', roomId)
      .single()

    const periodStart = new Date().toISOString()
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    if (existingSubscription) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          stripe_subscription_id: paymentId,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: false,
        })
        .eq('id', existingSubscription.id)

      console.log('[PaymentVerify] Subscription updated for user:', userId)
    } else {
      await supabase
        .from('subscriptions')
        .insert({
          subscriber_id: userId,
          room_id: roomId,
          stripe_subscription_id: paymentId,
          stripe_customer_id: userId,
          status: 'active',
          current_period_start: periodStart,
          current_period_end: periodEnd,
          cancel_at_period_end: false,
        })

      console.log('[PaymentVerify] Subscription created for user:', userId)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
      roomId,
    })
  } catch (error) {
    console.error('[PaymentVerify] Error:', error instanceof Error ? error.message : error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
