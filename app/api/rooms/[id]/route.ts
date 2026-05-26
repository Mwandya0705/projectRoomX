import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { z } from 'zod'

const updateRoomSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  is_public: z.boolean().optional(),
  price: z.number().nonnegative().optional(),
})

/**
 * GET /api/rooms/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createClient()
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*, creator:users!rooms_creator_id_fkey(*)')
      .eq('id', id)
      .single()

    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const room = {
      id: roomData.id,
      creatorId: roomData.creator_id,
      title: roomData.title,
      description: roomData.description,
      isLive: roomData.is_live,
      subscriptionPriceId: roomData.subscription_price_id,
      subscriptionProductId: roomData.subscription_product_id,
      createdAt: roomData.created_at,
      updatedAt: roomData.updated_at,
      creator: roomData.creator ? {
        id: roomData.creator.id,
        name: roomData.creator.name,
        email: roomData.creator.email,
        imageUrl: roomData.creator.image_url,
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
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const { data: room } = await supabase.from('rooms').select('*').eq('id', id).single()

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.creator_id !== user.id && room.admin_id !== user.id) {
      return NextResponse.json({ error: 'Only room admins can edit the room' }, { status: 403 })
    }

    const body = await request.json()
    const updates = updateRoomSchema.parse(body)

    const { data: updatedRoom, error } = await supabase
      .from('rooms')
      .update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.is_public !== undefined && { is_public: updates.is_public }),
        ...(updates.price !== undefined && { subscription_price_id: `${updates.price}:TZS` }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ room: updatedRoom })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/rooms/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const { data: room, error: roomError } = await supabase.from('rooms').select('creator_id').eq('id', id).maybeSingle()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.creator_id !== user.id) {
      return NextResponse.json({ error: 'Only creator can delete room' }, { status: 403 })
    }

    const { error: deleteError } = await supabase.from('rooms').delete().eq('id', id)
    if (deleteError) throw deleteError

    return NextResponse.json({ message: 'Sanctuary successfully archived and deleted' })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
