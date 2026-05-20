import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/utils/auth'
import { checkRoomAccess } from '@/lib/utils/access-control'
import { generateLiveKitToken, getLiveKitUrl } from '@/lib/livekit/server'

/**
 * GET /api/rooms/[id]/access-token
 * Generate a LiveKit access token for the room
 * Only returns token if user has access (creator or active subscriber)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check room access
    const { hasAccess, isCreator, subscription } = await checkRoomAccess(
      id,
      user.id
    )

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Please subscribe to access this room.' },
        { status: 403 }
      )
    }

    // Generate LiveKit token
    const role = isCreator ? 'publisher' : 'subscriber'
    const roomName = `room:${id}`
    const userName = user.name || user.email

    const token = await generateLiveKitToken({
      roomName,
      userId: user.id,
      userName,
      role,
    })

    return NextResponse.json({
      token,
      url: getLiveKitUrl(),
      roomName,
      role,
    })
  } catch (error) {
    console.error('Error generating access token:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error('Error details:', errorDetails)
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined 
    }, { status: 500 })
  }
}

