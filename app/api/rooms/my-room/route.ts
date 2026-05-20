import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getUserByClerkId } from '@/lib/utils/auth'
import { getUserRoom } from '@/lib/utils/access-control'

/**
 * GET /api/rooms/my-room
 * Get the authenticated user's room (if they are a creator)
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const room = await getUserRoom(user.id)
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Get subscription count
    const subscriberCount = await prisma.subscription.count({
      where: {
        roomId: room.id,
        status: 'active',
      },
    })

    return NextResponse.json({
      room,
      subscriberCount,
    })
  } catch (error) {
    console.error('Error fetching user room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

