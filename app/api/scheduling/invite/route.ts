import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_vercel_build')

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserByAuthId(authUser.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { email, name, activityId, message } = await request.json()

  if (!email || !activityId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // 1. Fetch Activity Details for the email
    const { data: activity } = await supabase
      .from('scheduling_events')
      .select('*')
      .eq('id', activityId)
      .single()

    // 2. Record the invitation in the database
    const { data: invite, error } = await supabase
      .from('scheduling_invitations')
      .insert({
        sender_id: user.id,
        event_id: activityId,
        recipient_email: email,
        recipient_name: name,
        personal_message: message,
        status: 'Pending',
      })
      .select()
      .single()

    if (error) throw error

    // 3. REAL DELIVERY via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'RoomX Sanctuary <onboarding@resend.dev>', // Replace with your verified domain in production
      to: email,
      subject: `[Invitation] ${user.name} invited you to ${activity?.title || 'a Sanctuary Activity'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
          <h1 style="color: #0d2a21; font-size: 24px; font-weight: 800; margin-bottom: 20px;">Your Sanctuary Invitation</h1>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Hello, <strong>${user.name}</strong> has invited you to a private <strong>${activity?.title || 'Sanctuary Session'}</strong>.
          </p>
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 30px 0;">
             <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0d2a21; text-transform: uppercase; letter-spacing: 1px;">Activity Details</p>
             <h2 style="margin: 10px 0; font-size: 20px; color: #0d2a21;">${activity?.title}</h2>
             <p style="margin: 0; color: #666; font-size: 14px;">Duration: ${activity?.duration_minutes} Minutes</p>
             <p style="margin: 10px 0 0 0; color: #666; font-size: 14px; font-style: italic;">"${message || 'I would like to invite you to join this private session in the RoomX Sanctuary.'}"</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://roomx.com'}/invite/${invite.id}" 
             style="display: inline-block; background-color: #0d2a21; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px;">
             Accept Invitation
          </a>
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #999; font-size: 12px; text-align: center;">Sent via RoomX Sanctuary Sync Engine.</p>
        </div>
      `
    })

    if (emailError) {
      console.error('Resend delivery error:', emailError)
      // We don't fail the whole request if email fails, but we log it
    }

    return NextResponse.json({ 
      success: true, 
      invite,
      emailId: emailData?.id
    })

  } catch (error: any) {
    console.error('Invitation API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
