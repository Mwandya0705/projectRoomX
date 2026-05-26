export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPayment } from '@/lib/payment/server'

/**
 * POST /api/webhooks/payment
 * Handle incoming payment status webhooks from the payment provider.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Accept multiple possible field names from different payment providers
    const paymentId =
      body.paymentId || body.payment_id || body.id || body.transactionId

    if (!paymentId) {
      console.error('[Webhook] Missing paymentId in webhook body')
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    }

    console.log('[Webhook] Received payment webhook for paymentId:', paymentId)

    // ── Verify payment status with the real payment API ────────────────────
    const payment = await verifyPayment(paymentId)
    console.log('[Webhook] Payment status:', payment.status, '| paymentId:', paymentId)

    const userId = body.metadata?.userId || payment.metadata?.userId || body.userId
    const roomId  = body.metadata?.roomId  || payment.metadata?.roomId  || body.roomId

    if (!userId || !roomId) {
      console.error('[Webhook] Missing userId or roomId in metadata')
      return NextResponse.json({ error: 'Invalid payment metadata' }, { status: 400 })
    }

    if (payment.status === 'completed' || payment.status === 'success' || payment.status === 'approved') {
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
        console.log('[Webhook] Subscription updated for user:', userId)
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
        console.log('[Webhook] Subscription created for user:', userId)
      }
    } else if (payment.status === 'failed' || payment.status === 'cancelled') {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('subscriber_id', userId)
        .eq('room_id', roomId)
        .single()

      if (subscription) {
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', subscription.id)
        console.log('[Webhook] Subscription cancelled for user:', userId, '| status:', payment.status)
      }
    } else {
      console.log('[Webhook] Unhandled payment status:', payment.status, '— no DB action taken')
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
