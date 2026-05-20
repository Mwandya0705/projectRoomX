import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getUserByClerkId } from '@/lib/utils/auth'

/**
 * POST /api/invitations/accept
 * Accept an invitation by token (called after user registers)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkId)
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
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      })

      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }

      // Check if user is already a member
      const existingMember = await prisma.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: room.id,
            userId: user.id,
          },
        },
      })

      if (existingMember) {
        return NextResponse.json(
          { message: 'You are already a member of this room', roomId: room.id },
          { status: 200 }
        )
      }

      // Add user as room member
      await prisma.roomMember.create({
        data: {
          roomId: room.id,
          userId: user.id,
          role: 'member',
          invitedBy: inviterId,
        },
      })

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


