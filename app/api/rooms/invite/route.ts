import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { generateInvitationLink, sendInvitationEmail } from '@/lib/email/server'
import { z } from 'zod'

const inviteSchema = z.object({
  roomId: z.string().uuid(),
  email: z.string().email(),
})

/**
 * POST /api/rooms/invite
 * Invite a member to a room (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByAuthId(authUser.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { roomId, email } = inviteSchema.parse(body)

    // Get room and check if user is admin or creator
    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const isAdmin = room.admin_id === user.id
    const isCreator = room.creator_id === user.id

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'Only room admins can invite members' },
        { status: 403 }
      )
    }

    // Check room capacity
    if (!room.is_public && room.capacity) {
      const { count: currentMembers } = await supabase
        .from('room_members')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)

      if (currentMembers !== null && currentMembers >= room.capacity) {
        return NextResponse.json(
          { error: `Room is full. Maximum capacity is ${room.capacity} members.` },
          { status: 400 }
        )
      }
    }

    // Find user to invite
    const { data: inviteUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    // Check if user is already a member (if they exist)
    if (inviteUser) {
      const { data: existingMember } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', room.id)
        .eq('user_id', inviteUser.id)
        .maybeSingle()

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this room' },
          { status: 400 }
        )
      }

      // User exists - add them as member immediately
      const { data: roomMember, error: insertError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: inviteUser.id,
          role: 'member',
          invited_by: user.id
        })
        .select('*, user:users(*)')
        .maybeSingle()
        
      if (insertError) {
        console.error('[InviteAPI] Insert error:', insertError)
        throw insertError
      }

      return NextResponse.json(
        {
          message: 'Member invited successfully',
          member: roomMember,
        },
        { status: 201 }
      )
    } else {
      // User doesn't exist - send invitation email with registration link
      const inviterName = user.name || 'A room admin'
      const invitationLink = generateInvitationLink(email, room.id, user.id)
      
      try {
        await sendInvitationEmail({
          to: email,
          roomTitle: room.title,
          inviterName: inviterName,
          invitationLink: invitationLink,
        })

        return NextResponse.json(
          {
            message: 'Invitation email sent successfully. The user will receive a registration link.',
            emailSent: true,
          },
          { status: 201 }
        )
      } catch (error) {
        console.error('Error sending invitation email:', error)
        return NextResponse.json(
          {
            error: 'Failed to send invitation email. User added to pending invites.',
            emailSent: false,
          },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error inviting member:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

