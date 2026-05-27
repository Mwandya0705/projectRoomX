export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPayment } from '@/lib/payment/server'

/**
 * POST /api/webhooks/clickpesa
 *
 * ClickPesa calls this URL when a USSD payment status changes.
 * Expected body (based on ClickPesa status API shape):
 *   { id, orderReference, status, channel, collectedAmount, ... }
 *
 * We find the subscription by stripe_subscription_id = orderReference
 * and update it. We use the admin client because this is an
 * unauthenticated server-to-server call — no user session exists.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, any> = {}

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log('[ClickPesa Webhook] Received:', JSON.stringify(body))

  // ── 1. Extract the order reference ──────────────────────────────────────
  // ClickPesa sends the same orderReference we generated at checkout time.
  // We store it as stripe_subscription_id in our subscriptions table.
  const orderReference: string =
    body.orderReference || body.order_reference || body.orderRef || ''

  if (!orderReference) {
    console.error('[ClickPesa Webhook] No orderReference in payload')
    // Return 200 so ClickPesa doesn't keep retrying a bad payload
    return NextResponse.json({ received: true, warning: 'no orderReference' })
  }

  // ── 2. Re-verify with ClickPesa (don't trust payload status alone) ───────
  let paymentStatus: string
  try {
    const payment = await verifyPayment(orderReference)
    paymentStatus = payment.status // 'success' | 'failed' | 'pending'
    console.log('[ClickPesa Webhook] Verified status:', paymentStatus, '| ref:', orderReference)
  } catch (err) {
    console.error('[ClickPesa Webhook] verifyPayment error:', err)
    // Fall back to the status ClickPesa sent in the webhook body
    const rawStatus = String(body.status || '').toUpperCase()
    paymentStatus =
      rawStatus === 'SUCCESS' || rawStatus === 'SETTLED' ? 'success'
      : rawStatus === 'FAILED' ? 'failed'
      : 'pending'
    console.log('[ClickPesa Webhook] Using webhook body status:', paymentStatus)
  }

  // ── 3. Look up subscription by orderReference ────────────────────────────
  // We stored orderReference as stripe_subscription_id at checkout time.
  const adminSupabase = createAdminClient()

  const { data: subscription, error: lookupErr } = await adminSupabase
    .from('subscriptions')
    .select('id, subscriber_id, room_id, status')
    .eq('stripe_subscription_id', orderReference)
    .maybeSingle()

  if (lookupErr) {
    console.error('[ClickPesa Webhook] DB lookup error:', lookupErr.message)
  }

  if (!subscription) {
    console.warn('[ClickPesa Webhook] No subscription found for ref:', orderReference)
    // Still 200 — ClickPesa shouldn't retry; we just haven't seen this ref
    return NextResponse.json({ received: true, warning: 'subscription not found' })
  }

  console.log('[ClickPesa Webhook] Found subscription:', subscription.id, '| current status:', subscription.status)

  // ── 4. Update subscription status ────────────────────────────────────────
  if (paymentStatus === 'success' && subscription.status !== 'active') {
    const { error: updateErr } = await adminSupabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
      })
      .eq('id', subscription.id)

    if (updateErr) {
      console.error('[ClickPesa Webhook] Failed to activate subscription:', updateErr.message)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    console.log('[ClickPesa Webhook] ✅ Subscription activated:', subscription.id,
      '| user:', subscription.subscriber_id, '| room:', subscription.room_id)

  } else if ((paymentStatus === 'failed') && subscription.status === 'pending') {
    await adminSupabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscription.id)

    console.log('[ClickPesa Webhook] Subscription cancelled (payment failed):', subscription.id)
  } else {
    console.log('[ClickPesa Webhook] No action needed. paymentStatus:', paymentStatus, '| subStatus:', subscription.status)
  }

  return NextResponse.json({ received: true })
}
