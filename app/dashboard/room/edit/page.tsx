import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { getUserRoom } from '@/lib/utils/access-control'
import EditRoomForm from '@/components/EditRoomForm'

export default async function EditRoomPage() {
  const supabase = createClient()
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    redirect('/sign-in')
  }

  const dbUser = await getUserByAuthId(authUser.id)
  if (!dbUser) {
    redirect('/sign-in')
  }

  // Get user's room (as creator) or check if user is admin of a room
  let room = await getUserRoom(dbUser.id)
  let roomData = null

  if (room) {
    const { data } = await supabase
      .from('rooms')
      .select('*, admin:users!rooms_admin_id_fkey(id)')
      .eq('id', room.id)
      .single()
    roomData = data
  } else {
    // If user is not creator, check if they're admin of any room
    const { data: adminRoom } = await supabase
      .from('rooms')
      .select('*')
      .eq('admin_id', dbUser.id)
      .limit(1)
      .single()

    if (adminRoom) {
      const { data } = await supabase
        .from('rooms')
        .select('*, admin:users!rooms_admin_id_fkey(id)')
        .eq('id', adminRoom.id)
        .single()
      roomData = data

      if (roomData) {
        room = {
          id: roomData.id,
          creator_id: roomData.creator_id,
          title: roomData.title,
          description: roomData.description,
          is_live: roomData.is_live,
          subscription_price_id: roomData.subscription_price_id,
          subscription_product_id: roomData.subscription_product_id,
          created_at: roomData.created_at,
          updated_at: roomData.updated_at,
        }
      }
    }
  }

  if (!room || !roomData) {
    redirect('/dashboard')
  }

  const isAdmin = (roomData.admin?.id === dbUser.id) || roomData.creatorId === dbUser.id

  if (!isAdmin) {
    redirect('/dashboard')
  }

  // Parse price from subscriptionPriceId (format: "amount:currency")
  const [priceStr, currency] = roomData.subscriptionPriceId?.split(':') || ['0', 'TZS']
  const price = parseFloat(priceStr) || 0

  return (
    <div className="min-h-screen bg-gray-50 ">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 ">
        <div className="mb-8 ">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Room</h1>
          <p className="text-gray-600">Update your room details</p>
        </div>

        <EditRoomForm
          room={{
            id: room.id,
            title: room.title,
            description: room.description,
            price: price,
            capacity: roomData.capacity,
            isPublic: roomData.isPublic,
          }}
        />
      </main>
    </div>
  )
}

