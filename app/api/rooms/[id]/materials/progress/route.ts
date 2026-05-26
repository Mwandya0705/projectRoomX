import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getUserByAuthId } from '@/lib/utils/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: roomId } = params
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserByAuthId(authUser.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { materialId, isCompleted } = await request.json()

  if (!materialId) {
    return NextResponse.json({ error: 'Missing materialId' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('member_material_progress')
    .upsert({
      user_id: user.id,
      material_id: materialId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    }, {
      onConflict: 'user_id,material_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Progress update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, progress: data })
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await getUserByAuthId(authUser.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: progress, error } = await supabase
    .from('member_material_progress')
    .select('material_id, is_completed')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ progress })
}
