/**
 * GET /api/ai/credits
 * Returns the current user's credit balance and recent transactions.
 */

import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getUserCredits } from '@/lib/ai/credits'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const balance = await getUserCredits(user.id)

    // Fetch last 10 transactions
    const admin = createAdminClient()
    const { data: transactions } = await admin
      .from('ai_credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({ balance, transactions: transactions ?? [] })
  } catch (err) {
    console.error('[AI Credits GET]', err)
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
  }
}
