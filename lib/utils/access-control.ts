import { createClient } from '@/lib/supabase/server'
import type { Room, Subscription } from '@/lib/types/database'

/**
 * Check if a user has access to a room
 */
export async function checkRoomAccess(
  roomId: string,
  userId: string
): Promise<{ hasAccess: boolean; isCreator: boolean; isAdmin: boolean; subscription?: Subscription | null }> {
  try {
    const supabase = createClient()
    
    // Get room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomError || !room) {
      return { hasAccess: false, isCreator: false, isAdmin: false }
    }

    const isCreator = room.creator_id === userId
    const isAdmin = room.admin_id === userId

    // Creator or Admin always has access
    if (isCreator || isAdmin) {
      return { hasAccess: true, isCreator, isAdmin }
    }

    // Check if user is a room member
    const { data: roomMember } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single()

    if (roomMember) {
      return { hasAccess: true, isCreator: false, isAdmin: roomMember.role === 'admin' }
    }

    // Public rooms: authenticated users can access
    if (room.is_public) {
      return { hasAccess: true, isCreator: false, isAdmin: false }
    }

    // For private rooms, check for active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscriber_id', userId)
      .eq('room_id', roomId)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return { hasAccess: false, isCreator: false, isAdmin: false, subscription: null }
    }

    // Check if subscription period is still valid
    if (subscription.current_period_end) {
      const periodEnd = new Date(subscription.current_period_end)
      const now = new Date()
      if (periodEnd < now) {
        return { hasAccess: false, isCreator: false, isAdmin: false, subscription: subscription as any }
      }
    }

    return { hasAccess: true, isCreator: false, isAdmin: false, subscription: subscription as any }
  } catch (error) {
    console.error('Error checking room access:', error)
    return { hasAccess: false, isCreator: false, isAdmin: false }
  }
}

/**
 * Get user's primary room
 */
export async function getUserRoom(userId: string): Promise<Room | null> {
  const rooms = await getUserRooms(userId)
  return rooms.length > 0 ? rooms[0] : null
}

/**
 * Get user's rooms
 */
export async function getUserRooms(userId: string): Promise<Room[]> {
  try {
    const supabase = createClient()
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (rooms || []).map(room => ({
      id: room.id,
      creator_id: room.creator_id,
      title: room.title,
      description: room.description,
      is_live: room.is_live,
      subscription_price_id: room.subscription_price_id,
      subscription_product_id: room.subscription_product_id,
      created_at: room.created_at,
      updated_at: room.updated_at,
    }))
  } catch (error) {
    console.error('Error fetching user rooms:', error)
    return []
  }
}

/**
 * Get user's active subscriptions
 */
export async function getUserSubscriptions(userId: string) {
  try {
    const supabase = createClient()
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*, room:rooms(*)')
      .eq('subscriber_id', userId)
      .eq('status', 'active')

    if (error) throw error

    return (subscriptions || []).map((sub: any) => ({
      ...sub,
      rooms: {
        id: sub.room.id,
        creator_id: sub.room.creator_id,
        title: sub.room.title,
        description: sub.room.description,
        is_live: sub.room.is_live,
        subscription_price_id: sub.room.subscription_price_id,
        subscription_product_id: sub.room.subscription_product_id,
        created_at: sub.room.created_at,
        updated_at: sub.room.updated_at,
      },
    }))
  } catch (error) {
    console.error('Error fetching user subscriptions:', error)
    return []
  }
}

