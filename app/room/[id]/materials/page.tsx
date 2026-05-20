import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { checkRoomAccess } from '@/lib/utils/access-control'
import { MaterialsClient } from '@/components/MaterialsClient'

interface PageProps {
  params: {
    id: string
  }
}

export default async function MaterialsPage({ params }: PageProps) {
  const { id: roomId } = params
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) redirect('/sign-in')

  const user = await getUserByAuthId(authUser.id)
  if (!user) redirect('/sign-in')

  // Check access
  const { hasAccess, isCreator, isAdmin } = await checkRoomAccess(roomId, user.id)
  if (!hasAccess) {
    redirect('/dashboard')
  }

  // Fetch room details
  const { data: room } = await supabase
    .from('rooms')
    .select('*, creator:users!creator_id(name)')
    .eq('id', roomId)
    .single()

  if (!room) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#f5f6f2]">
      <MaterialsClient 
        roomId={roomId} 
        roomTitle={room.title} 
        user={user} 
        isCreator={isCreator || isAdmin} 
      />
    </div>
  )
}
