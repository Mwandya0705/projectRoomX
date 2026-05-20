import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getUserByClerkId } from '@/lib/utils/auth'
import { z } from 'zod'

const updateRoomSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
})

/**
 * GET /api/rooms/[id]
 * Get a specific room by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const roomData = await prisma.room.findUnique({
      where: { id },
    })

    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Fetch creator separately
    const creator = await prisma.user.findUnique({
      where: { id: roomData.creatorId },
    })

    const room = {
      id: roomData.id,
      creatorId: roomData.creatorId,
      title: roomData.title,
      description: roomData.description,
      isLive: roomData.isLive,
      subscriptionPriceId: roomData.subscriptionPriceId,
      subscriptionProductId: roomData.subscriptionProductId,
      createdAt: roomData.createdAt,
      updatedAt: roomData.updatedAt,
      creator: creator ? {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        imageUrl: creator.imageUrl,
      } : null,
    }

    return NextResponse.json({ room })
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/rooms/[id]
 * Update a room (only admin or creator can update)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = params
    // Verify user is admin or creator of the room
    const room = await prisma.room.findUnique({
      where: { id },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const isCreator = room.creatorId === user.id
    const isAdmin = room.adminId === user.id

    // Only creator or admin can edit the room
    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Only room admins can edit the room' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const updates = updateRoomSchema.parse(body)

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        title: updates.title,
        description: updates.description,
      },
    })

    return NextResponse.json({ room: updatedRoom })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

