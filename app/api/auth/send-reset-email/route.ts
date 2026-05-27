export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendPasswordResetEmail } from '@/lib/email/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roomx.site'

/**
 * POST /api/auth/send-reset-email
 *
 * Generates a Supabase password recovery link and sends it via Resend.
 * Always returns success to avoid email enumeration attacks.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    const adminSupabase = createAdminClient()

    // Look up the user's name for a personalised email
    let userName: string | undefined
    try {
      const supabase = createClient()
      const { data: userRow } = await supabase
        .from('users')
        .select('name')
        .eq('email', email)
        .maybeSingle()
      userName = userRow?.name || undefined
    } catch { /* non-critical */ }

    // Generate the recovery link via admin API.
    // Redirect straight to /auth/reset-password — the page handles the code exchange itself.
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${APP_URL}/auth/reset-password`,
      },
    })

    if (error) {
      // Log but still return 200 to avoid email enumeration
      console.warn('[ResetEmail] generateLink error (user may not exist):', error.message)
    } else {
      const actionLink = data?.properties?.action_link
      if (actionLink) {
        console.log('[ResetEmail] Sending reset email to:', email)
        await sendPasswordResetEmail({ to: email, name: userName, resetLink: actionLink })
      }
    }

    // Always return success — never reveal whether the email exists
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    console.error('[ResetEmail] Unhandled error:', err)
    return NextResponse.json({ error: 'Request failed. Please try again.' }, { status: 500 })
  }
}
