import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_vercel_build')

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user: creator } } = await supabase.auth.getUser()

  if (!creator) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { assistantId, activityTitle, scheduledDate } = await request.json()

  try {
    // 1. Fetch Assistant Details
    const { data: assistant } = await supabase
      .from('scheduling_assistants')
      .select('*')
      .eq('id', assistantId)
      .single()

    if (!assistant) throw new Error('Assistant not found')

    // 2. Send Notification Email to Assistant
    const { data, error } = await resend.emails.send({
      from: 'RoomX Sanctuary <onboarding@resend.dev>',
      to: assistant.email,
      subject: `[New Assignment] ${activityTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
          <h1 style="color: #0d2a21; font-size: 24px;">New Sanctuary Assignment</h1>
          <p>Hello <strong>${assistant.name}</strong>,</p>
          <p>You have been assigned to handle a new activity on RoomX.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p><strong>Activity:</strong> ${activityTitle}</p>
            <p><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleString()}</p>
          </div>
          <p>Please log in to your dashboard to view full details.</p>
        </div>
      `
    })

    if (error) throw error

    return NextResponse.json({ success: true, message: `Notification sent to ${assistant.name}` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
