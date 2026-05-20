import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { checkRoomAccess } from '@/lib/utils/access-control'
import dynamic from 'next/dynamic'

// Dynamically import LiveRoom to avoid SSR and chunk loading issues
const LiveRoomWrapper = dynamic(() => import('@/components/LiveRoomWrapper'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center text-white bg-[#0d2a21]">
       <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin" />
          <p className="text-sm font-black text-white/40 uppercase tracking-[0.2em]">Synchronizing Studio...</p>
       </div>
    </div>
  ),
})
import type { Room, User } from '@/lib/types/database'

interface PageProps {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function RoomPage({ params, searchParams }: PageProps) {
  const paymentId = searchParams?.payment_id as string | undefined
  try {
    const { id } = params
    
    if (!id) redirect('/dashboard')

    const supabase = createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) redirect('/sign-in')

    const user = await getUserByAuthId(authUser.id)
    if (!user) redirect('/sign-in')

    // 🛡️ PAYMENT VERIFICATION
    if (paymentId && typeof paymentId === 'string') {
      try {
        const { verifyPayment } = await import('@/lib/clickpesa/server')
        const payment = await verifyPayment(paymentId)
        
        if ((payment.status === 'completed' || payment.status === 'success') && payment.metadata) {
          if (payment.metadata.userId === user.id && payment.metadata.roomId === id) {
            // Check if subscription already exists
            const { data: existingSubscription } = await supabase
              .from('subscriptions')
              .select('id')
              .eq('subscriber_id', user.id)
              .eq('room_id', id)
              .single()
            
            if (!existingSubscription) {
              await supabase.from('subscriptions').insert({
                subscriber_id: user.id,
                room_id: id,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              })
            }
          }
        }
      } catch (error) {
        console.error('[RoomPage] Error verifying payment:', error)
      }
    }

    // 🧬 FETCH ROOM ARCHITECTURE
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select(`*, creator:users!creator_id(*)`)
      .eq('id', id)
      .maybeSingle()

    if (roomError || !roomData) redirect('/dashboard')

    const rd = roomData as any
    const room: Room & { users: User } = {
      id: rd.id,
      creator_id: rd.creator_id,
      title: rd.title,
      description: rd.description,
      is_live: rd.is_live,
      subscription_price_id: rd.subscription_price_id,
      subscription_product_id: rd.subscription_product_id || null,
      created_at: rd.created_at,
      updated_at: rd.updated_at,
      users: {
        id: rd.creator?.id || rd.creator_id,
        clerk_id: rd.creator?.clerk_id || '',
        email: rd.creator?.email || '',
        name: rd.creator?.name || 'Unknown Creator',
        image_url: rd.creator?.image_url || null,
        created_at: rd.creator?.created_at || new Date().toISOString(),
        updated_at: rd.creator?.updated_at || new Date().toISOString(),
      },
    }

    // 🛡️ THE SANCTUARY GUARD
    const { hasAccess, isCreator, isAdmin } = await checkRoomAccess(id, user.id)

    if (!hasAccess) {
      const is_public = roomData.is_public ?? false
      const priceId = roomData.subscription_price_id
      const hasPrice = priceId && priceId.length > 0

      // If the room is private OR has a set price, redirect to the Aesthetic Subscription Gate
      if (!is_public || hasPrice) {
        redirect(`/subscribe/${id}`)
      } else {
        // Fallback for generic access issues
        redirect('/dashboard')
      }
    }

    // 🎬 ACCESS GRANTED: Enter Studio
    return (
      <div className="min-h-screen bg-black">
        <LiveRoomWrapper roomId={id} room={room} user={user} isCreator={isCreator || isAdmin} />
      </div>
    )

  } catch (error) {
    console.error('[RoomPage] Critical Error:', error)
    redirect('/dashboard')
  }
}
