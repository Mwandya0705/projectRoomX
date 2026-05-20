import { prisma } from '@/lib/db/prisma'
import type { Room, Subscription } from '@/lib/types/database'

/**
 * Check if a user has access to a room
 * - Creator always has access
 * - Admin always has access
 * - Room members have access
 * - Active subscribers have access (for public rooms)
 * - Public rooms: anyone authenticated can access
 */
export async function checkRoomAccess(
  roomId: string,
  userId: string
): Promise<{ hasAccess: boolean; isCreator: boolean; isAdmin: boolean; subscription?: Subscription | null }> {
  try {
    console.log('[checkRoomAccess] Checking access for room:', roomId, 'user:', userId)
    
    // Get room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      console.log('[checkRoomAccess] Room not found')
      return { hasAccess: false, isCreator: false, isAdmin: false }
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      console.log('[checkRoomAccess] User not found')
      return { hasAccess: false, isCreator: false, isAdmin: false }
    }

    const isCreator = room.creatorId === userId
    const isAdmin = room.adminId === userId

    // Creator always has access
    if (isCreator) {
      console.log('[checkRoomAccess] User is creator, access granted')
      return { hasAccess: true, isCreator: true, isAdmin: false }
    }

    // Admin always has access
    if (isAdmin) {
      console.log('[checkRoomAccess] User is admin, access granted')
      return { hasAccess: true, isCreator: false, isAdmin: true }
    }

    // Check if user is a room member
    const roomMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: user.id,
        },
      },
    })

    if (roomMember) {
      console.log('[checkRoomAccess] User is a room member, access granted')
      return { hasAccess: true, isCreator: false, isAdmin: roomMember.role === 'admin' }
    }

    // Public rooms: authenticated users can access
    if (room.isPublic) {
      console.log('[checkRoomAccess] Room is public, access granted')
      return { hasAccess: true, isCreator: false, isAdmin: false }
    }

    // For private rooms, check for active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        subscriberId: userId,
        roomId: roomId,
        status: 'active',
      },
    })

    if (!subscription) {
      return { hasAccess: false, isCreator: false, isAdmin: false, subscription: null }
    }

    // Check if subscription period is still valid
    if (subscription.currentPeriodEnd) {
      const periodEnd = new Date(subscription.currentPeriodEnd)
      const now = new Date()
      if (periodEnd < now) {
        return {
          hasAccess: false,
          isCreator: false,
          isAdmin: false,
          subscription: {
            id: subscription.id,
            subscriber_id: subscription.subscriberId,
            room_id: subscription.roomId,
            stripe_subscription_id: subscription.stripeSubscriptionId,
            stripe_customer_id: subscription.stripeCustomerId,
            status: subscription.status as any,
            current_period_start: subscription.currentPeriodStart?.toISOString() || null,
            current_period_end: subscription.currentPeriodEnd?.toISOString() || null,
            cancel_at_period_end: subscription.cancelAtPeriodEnd,
            created_at: subscription.createdAt.toISOString(),
            updated_at: subscription.updatedAt.toISOString(),
          },
        }
      }
    }

    // Subscription is valid - grant access (as subscriber/guest)
    return {
      hasAccess: true,
      isCreator: false,
      isAdmin: false,
      subscription: {
        id: subscription.id,
        subscriber_id: subscription.subscriberId,
        room_id: subscription.roomId,
        stripe_subscription_id: subscription.stripeSubscriptionId,
        stripe_customer_id: subscription.stripeCustomerId,
        status: subscription.status as any,
        current_period_start: subscription.currentPeriodStart?.toISOString() || null,
        current_period_end: subscription.currentPeriodEnd?.toISOString() || null,
        cancel_at_period_end: subscription.cancelAtPeriodEnd,
        created_at: subscription.createdAt.toISOString(),
        updated_at: subscription.updatedAt.toISOString(),
      },
    }
  } catch (error) {
    console.error('Error checking room access:', error)
    return { hasAccess: false, isCreator: false, isAdmin: false }
  }
}

/**
 * Get user's room (if they are a creator)
 */
export async function getUserRoom(userId: string): Promise<Room | null> {
  try {
    const room = await prisma.room.findUnique({
      where: { creatorId: userId },
    })

    if (!room) {
      return null
    }

    // Convert Prisma room to Room type
    return {
      id: room.id,
      creator_id: room.creatorId,
      title: room.title,
      description: room.description,
      is_live: room.isLive,
      subscription_price_id: room.subscriptionPriceId,
      subscription_product_id: room.subscriptionProductId,
      created_at: room.createdAt.toISOString(),
      updated_at: room.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching user room:', error)
    return null
  }
}

/**
 * Get user's active subscriptions
 */
export async function getUserSubscriptions(userId: string) {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        subscriberId: userId,
        status: 'active',
      },
      include: {
        room: true,
      },
    })

    return subscriptions.map((sub) => ({
      ...sub,
      rooms: {
        id: sub.room.id,
        creator_id: sub.room.creatorId,
        title: sub.room.title,
        description: sub.room.description,
        is_live: sub.room.isLive,
        subscription_price_id: sub.room.subscriptionPriceId,
        subscription_product_id: sub.room.subscriptionProductId,
        created_at: sub.room.createdAt.toISOString(),
        updated_at: sub.room.updatedAt.toISOString(),
      },
    }))
  } catch (error) {
    console.error('Error fetching user subscriptions:', error)
    return []
  }
}

