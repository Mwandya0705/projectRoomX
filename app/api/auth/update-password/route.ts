export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // The client sends its current access token so we can identify the user
  // even if the cookie session hasn't propagated yet (PKCE edge case).
  accessToken: z.string().optional(),
})

/**
 * POST /api/auth/update-password
 *
 * Updates the authenticated user's password.
 * Uses admin client so it bypasses session-type restrictions
 * (Supabase sometimes rejects updateUser from non-recovery sessions).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password, accessToken } = schema.parse(body)

    const adminSupabase = createAdminClient()
    let userId: string | null = null

    // Strategy 1 — use the access token the client passed explicitly
    if (accessToken) {
      const { data, error } = await adminSupabase.auth.getUser(accessToken)
      if (!error && data.user) {
        userId = data.user.id
      }
    }

    // Strategy 2 — fall back to the cookie-based session (normal authenticated requests)
    if (!userId) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) userId = user.id
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Session expired. Please request a new password reset link.' },
        { status: 401 }
      )
    }

    // Use admin client — bypasses any "must be recovery session" restrictions
    const { error: updateErr } = await adminSupabase.auth.admin.updateUserById(
      userId,
      { password }
    )

    if (updateErr) {
      console.error('[UpdatePassword] Admin update failed:', updateErr.message)
      return NextResponse.json({ error: updateErr.message }, { status: 400 })
    }

    console.log('[UpdatePassword] Password updated for user:', userId)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 })
    }
    console.error('[UpdatePassword] Unhandled error:', err)
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 })
  }
}
