export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendConfirmationEmail } from '@/lib/email/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://roomx.site'

/**
 * POST /api/auth/signup
 *
 * Creates a Supabase user via admin, generates the confirmation link,
 * and sends it through Resend for reliable delivery.
 * This bypasses Supabase's own SMTP which has poor deliverability.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = schema.parse(body)

    const adminSupabase = createAdminClient()

    // Generate the email confirmation link via admin API
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error('[Signup] Admin generateLink error:', error.message)
      // Distinguish "already registered" from other errors
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const actionLink = data?.properties?.action_link
    if (!actionLink) {
      console.error('[Signup] No action_link in generateLink response')
      return NextResponse.json({ error: 'Failed to generate confirmation link.' }, { status: 500 })
    }

    console.log('[Signup] Sending confirmation email to:', email)
    await sendConfirmationEmail({ to: email, name: name || '', confirmLink: actionLink })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || 'Invalid input' }, { status: 400 })
    }
    console.error('[Signup] Unhandled error:', err)
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 })
  }
}
