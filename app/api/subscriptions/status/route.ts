export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'

/**
 * GET /api/subscriptions/status?roomId=xxx
 *
 * Lightweight endpoint the UI polls after a USSD push is sent.
 * Returns the subscription status for the authenticated user + room.
 * The webhook at /api/webhooks/clickpesa updates the DB when ClickPesa confirms.
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
      .select('status')
      .eq('subscriber_id', user.id)
      .eq('room_id', roomId)
      .maybeSingle()

    return NextResponse.json({ status: sub?.status ?? 'none' })
  } catch (err) {
    console.error('[SubscriptionStatus]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
