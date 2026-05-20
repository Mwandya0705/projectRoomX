import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getUserByClerkId } from '@/lib/utils/auth'
import { checkRoomAccess } from '@/lib/utils/access-control'
import dynamic from 'next/dynamic'

// Dynamically import LiveRoom to avoid SSR and chunk loading issues
const LiveRoomWrapper = dynamic(() => import('@/components/LiveRoomWrapper'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
      <p>Loading room...</p>
    </div>
  ),
})
import type { Room, User } from '@/lib/types/database'

interface PageProps {
  params: {
    id: string
  }
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RoomPage({ params, searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const paymentId = resolvedSearchParams?.payment_id as string | undefined
  try {
    const { id } = params
    console.log('[RoomPage] Loading room:', id)
    
    if (!id) {
      console.error('[RoomPage] No room ID provided')
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-xl text-gray-900">Invalid room ID</p>
          </div>
        </div>
      )
    }

    console.log('[RoomPage] Authenticating user...')
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      console.log('[RoomPage] No Clerk ID, redirecting to sign-in')
      redirect('/sign-in')
    }

    console.log('[RoomPage] Getting user from database...')
    const user = await getUserByClerkId(clerkId)
    if (!user) {
      console.log('[RoomPage] User not found, redirecting to sign-in')
      redirect('/sign-in')
    }
    console.log('[RoomPage] User found:', user.id)

    // If payment_id is present, verify payment and create subscription
    if (paymentId && typeof paymentId === 'string') {
      console.log('[RoomPage] Payment ID detected, verifying payment...', paymentId)
      try {
        // Import verifyPayment directly to avoid server-to-server fetch
        const { verifyPayment } = await import('@/lib/clickpesa/server')
        const payment = await verifyPayment(paymentId)
        
        // Check if payment was successful
        if ((payment.status === 'completed' || payment.status === 'success') && payment.metadata) {
          const metadataUserId = payment.metadata.userId
          const metadataRoomId = payment.metadata.roomId
          
          // Verify the payment belongs to this user and room
          if (metadataUserId === user.id && metadataRoomId === id) {
            // Check if subscription already exists
            const existingSubscription = await prisma.subscription.findFirst({
              where: {
                subscriberId: user.id,
                roomId: id,
              },
            })
            
            if (!existingSubscription) {
              // Create subscription if it doesn't exist
              await prisma.subscription.create({
                data: {
                  subscriberId: user.id,
                  roomId: id,
                  stripeSubscriptionId: paymentId,
                  stripeCustomerId: user.id,
                  status: 'active',
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                  cancelAtPeriodEnd: false,
                },
              })
              console.log('[RoomPage] Subscription created from payment verification')
            } else {
              // Update existing subscription
              await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                  status: 'active',
                  stripeSubscriptionId: paymentId,
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  cancelAtPeriodEnd: false,
                },
              })
              console.log('[RoomPage] Subscription updated from payment verification')
            }
          }
        }
      } catch (error) {
        console.error('[RoomPage] Error verifying payment:', error)
        // Continue anyway - webhook might have handled it
      }
    }

    // Get room (adapter doesn't support select, fetch all fields)
    console.log('[RoomPage] Fetching room from database...')
    const roomData = await prisma.room.findUnique({
      where: { id },
    })

    if (!roomData) {
      console.error('[RoomPage] Room not found:', id)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-xl text-gray-900 mb-2">Room not found</p>
            <p className="text-gray-600">Room ID: {id}</p>
          </div>
        </div>
      )
    }
    console.log('[RoomPage] Room found:', roomData.title)

    // Fetch creator separately
    console.log('[RoomPage] Fetching creator...')
    const creator = await prisma.user.findUnique({
      where: { id: roomData.creatorId },
    })

    if (!creator) {
      console.error('[RoomPage] Creator not found:', roomData.creatorId)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-xl text-gray-900">Creator not found</p>
          </div>
        </div>
      )
    }
    console.log('[RoomPage] Creator found:', creator.email)

    // Convert to expected format
    const room: Room & { users: User } = {
      id: roomData.id,
      creator_id: roomData.creatorId,
      title: roomData.title,
      description: roomData.description,
      is_live: roomData.isLive,
      subscription_price_id: roomData.subscriptionPriceId,
      subscription_product_id: roomData.subscriptionProductId,
      created_at: roomData.createdAt.toISOString(),
      updated_at: roomData.updatedAt.toISOString(),
      users: {
        id: creator.id,
        clerk_id: '', // Not needed here
        email: creator.email,
        name: creator.name,
        image_url: creator.imageUrl,
        created_at: '',
        updated_at: '',
      },
    }

    // Check access
    console.log('[RoomPage] Checking room access...')
    const { hasAccess, isCreator, isAdmin } = await checkRoomAccess(id, user.id)
    console.log('[RoomPage] Access check result:', { hasAccess, isCreator, isAdmin })

    if (!hasAccess) {
      console.log('[RoomPage] Access denied')
      // Check if room is public - if not, redirect to subscribe

      const isPublic = roomData.isPublic ?? false
      if (!isPublic) {
        redirect(`/subscribe/${room.creator_id}`)
      } else {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this room.
              </p>
              <a
                href="/dashboard"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        )
      }
    }

    console.log('[RoomPage] Access granted, rendering LiveRoom component')
    try {
      return (
        <div className="min-h-screen bg-gray-900">
          <LiveRoomWrapper roomId={id} room={room} user={user} isCreator={isCreator || isAdmin} />
        </div>
      )
    } catch (renderError) {
      console.error('[RoomPage] Error rendering LiveRoom:', renderError)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Rendering Room</h2>
            <p className="text-gray-600 mb-4">
              {renderError instanceof Error ? renderError.message : 'Failed to render room component'}
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      )
    }
  } catch (error) {
    console.error('[RoomPage] Error loading room page:', error)
    console.error('[RoomPage] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('[RoomPage] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
    })
    
    // Return error UI instead of throwing (error.tsx will catch unhandled errors)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Room</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Check the server console for more details.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }
}

