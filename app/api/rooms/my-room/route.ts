import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { getUserRooms } from '@/lib/utils/access-control'

/**
 * GET /api/rooms/my-room
 * Get the authenticated user's rooms (if they are a creator)
 */
export async function GET() {
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

    const rooms = await getUserRooms(user.id)

    // Get subscriber counts for all rooms
    const roomsWithStats = await Promise.all(rooms.map(async (room: any) => {
      const { count, error } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .eq('status', 'active')

      return {
        ...room,
        subscriberCount: count || 0,
      }
    }))

    return NextResponse.json({
      rooms: roomsWithStats,
    })
  } catch (error) {
    console.error('Error fetching user rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

