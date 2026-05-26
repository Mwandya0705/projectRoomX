import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { sendSchedulingInviteEmail } from '@/lib/email/server'

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

    // 3. Send invite email via shared email server
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invite.id}`

    await sendSchedulingInviteEmail({
      to: email,
      recipientName: name,
      senderName: user.name || 'A RoomX Creator',
      activityTitle: activity?.title || 'Sanctuary Session',
      durationMinutes: activity?.duration_minutes || 60,
      personalMessage: message,
      inviteLink,
    })

    return NextResponse.json({
      success: true,
      invite,
    })

  } catch (error: any) {
    console.error('Invitation API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
