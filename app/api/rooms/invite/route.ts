import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getUserByClerkId } from '@/lib/utils/auth'
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
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { roomId, email } = inviteSchema.parse(body)

    // Get room and check if user is admin or creator
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const isAdmin = room.adminId === user.id
    const isCreator = room.creatorId === user.id

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'Only room admins can invite members' },
        { status: 403 }
      )
    }

    // Check room capacity
    if (!room.isPublic && room.capacity) {
      const currentMembers = await prisma.roomMember.count({
        where: { roomId: room.id },
      })

      if (currentMembers >= room.capacity) {
        return NextResponse.json(
          { error: `Room is full. Maximum capacity is ${room.capacity} members.` },
          { status: 400 }
        )
      }
    }

    // Find user to invite
    const inviteUser = await prisma.user.findUnique({
      where: { email },
    })

    // Check if user is already a member (if they exist)
    if (inviteUser) {
      const existingMember = await prisma.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: room.id,
            userId: inviteUser.id,
          },
        },
      })

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this room' },
          { status: 400 }
        )
      }

      // User exists - add them as member immediately
      const roomMember = await prisma.roomMember.create({
        data: {
          roomId: room.id,
          userId: inviteUser.id,
          role: 'member',
          invitedBy: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      })

      return NextResponse.json(
        {
          message: 'Member invited successfully',
          member: {
            id: roomMember.id,
            userId: roomMember.userId,
            role: roomMember.role,
            user: roomMember.user,
          },
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

