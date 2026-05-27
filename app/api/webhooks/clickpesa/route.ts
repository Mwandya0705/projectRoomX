export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPayment } from '@/lib/payment/server'

/**
 * POST /api/webhooks/clickpesa
 * Handle Click Pesa payment webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    console.log('[ClickPesa Webhook] Received webhook:', JSON.stringify(body, null, 2))
    
    // Click Pesa webhook payload structure may vary
    // Adjust based on their actual webhook format
    // ClickPesa webhook uses orderReference as the identifier
    const paymentId = body.orderReference || body.order_reference || body.paymentId || body.payment_id || body.id || body.transactionId

    if (!paymentId) {
      console.error('[ClickPesa Webhook] Missing paymentId in webhook body')
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    }

    console.log('[ClickPesa Webhook] Verifying payment:', paymentId)

    // Verify payment status with Click Pesa
    const payment = await verifyPayment(paymentId)
    console.log('[ClickPesa Webhook] Payment verified:', payment)

    // Extract metadata - try multiple possible locations
    const userId = body.metadata?.userId || payment.metadata?.userId || body.userId
    const roomId = body.metadata?.roomId || payment.metadata?.roomId || body.roomId
    const subscriptionType = body.metadata?.type || payment.metadata?.type || body.type

    if (!userId || !roomId) {
      console.error('[ClickPesa Webhook] Missing userId or roomId:', { userId, roomId, body, payment })
      return NextResponse.json({ error: 'Invalid payment metadata' }, { status: 400 })
    }

    console.log('[ClickPesa Webhook] Processing payment:', { paymentId, userId, roomId, status: payment.status })

    // Handle successful payment (verifyPayment normalizes SUCCESS/SETTLED → 'success')
    if (payment.status === 'success') {
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
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false,
          })
          .eq('id', existingSubscription.id)
      } else {
        // Create new subscription
        await supabase
          .from('subscriptions')
          .insert({
            subscriber_id: userId,
            room_id: roomId,
            stripe_subscription_id: paymentId, // Using paymentId as subscription ID
            stripe_customer_id: userId, // Using userId as customer ID
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false,
          })
      }
    } else if (payment.status === 'failed' || payment.status === 'cancelled') {
      // Update subscription status if it exists
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('subscriber_id', userId)
        .eq('room_id', roomId)
        .single()

      if (subscription) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
          })
          .eq('id', subscription.id)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Click Pesa webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

