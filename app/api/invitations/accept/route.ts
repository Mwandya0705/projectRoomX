import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'

/**
 * POST /api/invitations/accept
 * Accept an invitation by token (called after user registers)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByAuthId(authUser.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Missing invitation token' }, { status: 400 })
    }

    // Decode invitation token (format: email:roomId:inviterId:timestamp)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [email, roomId, inviterId] = decoded.split(':')

      // Verify email matches
      if (email !== user.email) {
        return NextResponse.json(
          { error: 'Invitation email does not match your account email' },
          { status: 403 }
        )
      }

      // Get room
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', room.id)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        return NextResponse.json(
          { message: 'You are already a member of this room', roomId: room.id },
          { status: 200 }
        )
      }

      // Add user as room member
      const { error: insertError } = await supabase
        .from('room_participants')
        .insert({
          room_id: room.id,
          user_id: user.id,
          role: 'member'
        })

      if (insertError) throw insertError

      return NextResponse.json(
        {
          message: 'Invitation accepted successfully',
          roomId: room.id,
        },
        { status: 200 }
      )
    } catch (error) {
      console.error('Error decoding invitation token:', error)
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


