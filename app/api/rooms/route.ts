import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { z } from 'zod'

const createRoomSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  category: z.string().optional().default('Other'),
  price: z.number().nonnegative().optional(), // Price in TZS, optional for public rooms
  role: z.enum(['admin', 'member']),
  adminEmail: z.string().email().optional().nullable(),
  capacity: z.number().int().min(2).max(8).optional().nullable(),
  isPublic: z.boolean().default(false),
  inviteEmails: z.array(z.string().email()).optional().default([]),
})

/**
 * POST /api/rooms
 * Create a new room for the authenticated creator
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database using their Supabase ID
    const user = await getUserByAuthId(authUser.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { title, description, category, price, role, adminEmail, capacity, isPublic } = createRoomSchema.parse(body)

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
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('id')
        .eq('email', adminEmail)
        .single()

      if (adminError || !adminUser) {
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
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          creator_id: user.id,
          admin_id: adminId,
          title,
          description,
          category,
          is_public: isPublic || false,
          capacity: capacity || null,
          subscription_price_id: price && price > 0 ? `${price}:TZS` : null,
          is_live: false,
        })
        .select()
        .single()

      if (roomError || !room) {
        throw new Error(roomError?.message || 'Failed to create room')
      }

      // Add creator as a room member
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: user.id,
          role: role === 'admin' ? 'admin' : 'member',
        })

      if (memberError) throw memberError

      // If admin is different from creator, add admin as member too
      if (adminId && adminId !== user.id) {
        await supabase
          .from('room_members')
          .insert({
            room_id: room.id,
            user_id: adminId,
            role: 'admin',
            invited_by: user.id,
          })
      }

      // NEW: Handle additional early invitees
      const inviteEmails = (body as any).inviteEmails as string[]
      if (inviteEmails && inviteEmails.length > 0) {
        const { generateInvitationLink, sendInvitationEmail } = await import('@/lib/email/server')
        
        const invitePromises = inviteEmails.map(async (email) => {
          try {
            // Use maybeSingle to prevent unnecessary throws if user doesn't exist yet
            const { data: inviteUser, error: userFetchError } = await supabase
              .from('users')
              .select('id')
              .eq('email', email)
              .maybeSingle()
            
            if (userFetchError) {
              console.error(`[RoomsAPI] Error fetching guest profile for ${email}:`, userFetchError)
            }

            if (inviteUser) {
              const { error: joinError } = await supabase.from('room_members').insert({
                room_id: room.id,
                user_id: inviteUser.id,
                role: 'member',
                invited_by: user.id
              })
              if (joinError) console.error(`[RoomsAPI] Error auto-joining ${email}:`, joinError)
            } else {
              const link = generateInvitationLink(email, room.id, user.id)
              await sendInvitationEmail({
                to: email,
                roomTitle: room.title,
                inviterName: user.name || 'A room creator',
                invitationLink: link
              })
            }
          } catch (e) {
            console.error(`[RoomsAPI] Critical failure inviting ${email}:`, e)
          }
        })
        await Promise.allSettled(invitePromises)
      }

      return NextResponse.json({ room }, { status: 201 })
    } catch (error) {
      console.error('Error creating room:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room'
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    const supabase = createClient()

    let query = supabase
      .from('rooms')
      .select('*, creator:users(id, name, email, image_url)')
      .order('created_at', { ascending: false })

    if (creatorId) {
      query = query.eq('creator_id', creatorId)
    }

    const { data: rooms, error } = await query

    if (error) throw error

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

