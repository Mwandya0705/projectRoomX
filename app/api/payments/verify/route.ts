export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { verifyPayment } from '@/lib/clickpesa/server'

/**
 * GET /api/payments/verify
 * Verify payment status and create/update subscription
 * Called when user returns from Click Pesa payment page
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

    // Verify payment with Click Pesa
    const payment = await verifyPayment(paymentId)

    // Check if payment was successful
    if (payment.status !== 'completed' && payment.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment not completed', status: payment.status },
        { status: 400 }
      )
    }

    // Extract metadata
    const userId = payment.metadata?.userId
    const roomId = payment.metadata?.roomId

    if (!userId || !roomId) {
      return NextResponse.json(
        { error: 'Missing metadata in payment' },
        { status: 400 }
      )
    }

    // Verify the user matches (security check)
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Payment does not belong to this user' },
        { status: 403 }
      )
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscriber_id', userId)
      .eq('room_id', roomId)
      .single()

    if (existingSubscription) {
      // Update existing subscription
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          stripe_subscription_id: paymentId,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false
        })
        .eq('id', existingSubscription.id)
    } else {
      // Create new subscription
      await supabase
        .from('subscriptions')
        .insert({
          subscriber_id: userId,
          room_id: roomId,
          stripe_subscription_id: paymentId,
          stripe_customer_id: userId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false
        })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription created',
      roomId: roomId,
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


