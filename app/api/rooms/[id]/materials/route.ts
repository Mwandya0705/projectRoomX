import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { checkRoomAccess } from '@/lib/utils/access-control'

/**
 * GET /api/rooms/[id]/materials
 * Fetch all materials for a specific room
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: roomId } = params
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByAuthId(authUser.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check if user has access to the room
    const { hasAccess } = await checkRoomAccess(roomId, user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this sanctuary' }, { status: 403 })
    }

    const { data: materials, error } = await supabase
      .from('room_materials')
      .select('*, uploader:users!uploader_id(name, image_url)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ materials })
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/rooms/[id]/materials
 * Register a new material upload in the database
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: roomId } = params
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByAuthId(authUser.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check if user has access to the room
    const { hasAccess } = await checkRoomAccess(roomId, user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this sanctuary' }, { status: 403 })
    }

    const body = await request.json()
    const { title, fileUrl, filePath, fileType, fileSize, description, category, phase } = body

    if (!title || !fileUrl || !filePath) {
      return NextResponse.json({ error: 'Missing required file details' }, { status: 400 })
    }

    const { data: material, error } = await supabase
      .from('room_materials')
      .insert({
        room_id: roomId,
        uploader_id: user.id,
        title,
        file_url: fileUrl,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
        description: description || null,
        category: category || 'General',
        phase: phase || 'Phase 1',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ material })
  } catch (error) {
    console.error('Error registering material:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
