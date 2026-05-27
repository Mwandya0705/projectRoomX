export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserByAuthId } from '@/lib/utils/auth'
import { verifyPayment } from '@/lib/payment/server'

/**
 * GET /api/subscriptions/status?roomId=xxx
 *
 * Polls subscription status for the authenticated user + room.
 * If status is pending, actively verifies with ClickPesa and
 * self-heals to active when payment is confirmed — so a missed or
 * delayed webhook never leaves the user stuck on the countdown.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: authUser }, error } = await supabase.auth.getUser()

    if (error || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByAuthId(authUser.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const roomId = new URL(request.url).searchParams.get('roomId')
    if (!roomId) {
      return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, status, stripe_subscription_id')
      .eq('subscriber_id', user.id)
      .eq('room_id', roomId)
      .maybeSingle()

    if (!sub) {
      return NextResponse.json({ status: 'none' })
    }

    // Already active — nothing more to do
    if (sub.status === 'active') {
      return NextResponse.json({ status: 'active' })
    }

    // Self-heal: if pending, verify directly with ClickPesa
    // Covers cases where the webhook was missed, delayed, or rejected
    if (sub.status === 'pending' && sub.stripe_subscription_id) {
      try {
        const payment = await verifyPayment(sub.stripe_subscription_id)
        console.log('[SubscriptionStatus] Self-heal check for', sub.stripe_subscription_id, '→', payment.status)

        if (payment.status === 'success') {
          const adminSupabase = createAdminClient()
          await adminSupabase
            .from('subscriptions')
            .update({
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              cancel_at_period_end: false,
            })
            .eq('id', sub.id)

          console.log('[SubscriptionStatus] Self-healed subscription to active:', sub.id)
          return NextResponse.json({ status: 'active' })
        }

        if (payment.status === 'failed') {
          const adminSupabase = createAdminClient()
          await adminSupabase
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('id', sub.id)
          return NextResponse.json({ status: 'cancelled' })
        }
      } catch (verifyErr) {
        // ClickPesa unreachable — return current DB status and let polling retry
        console.warn('[SubscriptionStatus] verifyPayment error (will retry):', verifyErr)
      }
    }

    return NextResponse.json({ status: sub.status ?? 'none' })
  } catch (err) {
    console.error('[SubscriptionStatus]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
