import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getUserByClerkId } from '@/lib/utils/auth'
import { z } from 'zod'

const createRoomSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative().optional(), // Price in TZS, optional for public rooms
  role: z.enum(['admin', 'member']),
  adminEmail: z.string().email().optional().nullable(),
  capacity: z.number().int().min(2).max(8).optional().nullable(),
  isPublic: z.boolean().default(false),
})

/**
 * POST /api/rooms
 * Create a new room for the authenticated creator
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

    // Check if user already has a room
    const existingRoom = await prisma.room.findUnique({
      where: { creatorId: user.id },
    })

    if (existingRoom) {
      return NextResponse.json(
        { error: 'You already have a room. Only one room per creator is allowed.' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { title, description, price, role, adminEmail, capacity, isPublic } = createRoomSchema.parse(body)

    // Validate role and admin email
    if (role === 'member' && !adminEmail) {
      return NextResponse.json(
        { error: 'Admin email is required when role is member' },
        { status: 400 }
      )
    }

    // Find admin user if role is member
    let adminId: string | null = null
    if (role === 'member' && adminEmail) {
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      })
      if (!adminUser) {
        return NextResponse.json(
          { error: 'Admin user not found. Please ensure the admin has an account.' },
          { status: 404 }
        )
      }
      adminId = adminUser.id
    } else if (role === 'admin') {
      adminId = user.id
    }

    // Validate price for non-public rooms
    if (!isPublic && (!price || price <= 0)) {
      return NextResponse.json(
        { error: 'Price is required for private rooms' },
        { status: 400 }
      )
    }

    // Create room in database
    try {
      const room = await prisma.room.create({
        data: {
          creatorId: user.id,
          adminId: adminId,
          title,
          description,
          isPublic: isPublic || false,
          capacity: capacity || null,
          // Store price as a string in subscriptionPriceId for Click Pesa
          // Format: "amount:currency" e.g., "29900:TZS" or "29.99:USD"
          subscriptionPriceId: price && price > 0 ? `${price}:TZS` : null,
          subscriptionProductId: null, // Not needed for Click Pesa
          isLive: false,
        },
      })

      // Add creator as a room member
      await prisma.roomMember.create({
        data: {
          roomId: room.id,
          userId: user.id,
          role: role === 'admin' ? 'admin' : 'member',
          invitedBy: null,
        },
      })

      // If admin is different from creator, add admin as member too
      if (adminId && adminId !== user.id) {
        await prisma.roomMember.create({
          data: {
            roomId: room.id,
            userId: adminId,
            role: 'admin',
            invitedBy: user.id,
          },
        })
      }

      return NextResponse.json({ room }, { status: 201 })
    } catch (error) {
      console.error('Error creating room:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room'
      const errorDetails = error instanceof Error ? error.stack : String(error)
      console.error('Error details:', errorDetails)
      return NextResponse.json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined 
      }, { status: 500 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating room:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error('Error details:', errorDetails)
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined 
    }, { status: 500 })
  }
}

/**
 * GET /api/rooms
 * Get all rooms (public endpoint for discovery)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get('creatorId')

    // Fetch rooms with creators (Prisma 6 supports standard queries)
    const rooms = await prisma.room.findMany({
      where: creatorId ? { creatorId } : undefined,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

