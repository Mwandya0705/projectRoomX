import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import SubscribeClient from '@/components/SubscribeClient'
import type { Room, User } from '@/lib/types/database'

interface PageProps {
  params: {
    id: string
  }
}

export default async function SubscriptionPage({ params }: PageProps) {
  const { id } = params
  const supabase = createClient()
  
  // 1. 🛡️ AUTH CHECK
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  if (authError || !authUser) redirect('/sign-in')

  const user = await getUserByAuthId(authUser.id)
  if (!user) redirect('/sign-in')

  // 2. 🧬 FETCH SANCTUARY DATA
  const { data: roomData, error: roomError } = await supabase
    .from('rooms')
    .select(`*, creator:users!creator_id(*)`)
    .eq('id', id)
    .maybeSingle()

  if (roomError || !roomData) redirect('/dashboard')

  // 3. 🛡️ ACCESS LOGIC
  // Check if user is creator
  const isCreator = roomData.creator_id === user.id
  if (isCreator) redirect(`/room/${id}`)

  // Check if already subscribed
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('subscriber_id', user.id)
    .eq('room_id', id)
    .eq('status', 'active')
    .maybeSingle()

  if (subscription) redirect(`/room/${id}`)

  // 4. 🎭 RENDER AESTHETIC GATEWAY
  // Map data for the client component
  const rd = roomData as any
  const roomInfo = {
    id: rd.id,
    title: rd.title,
    description: rd.description || "Entering a private sanctuary of high-value expertise.",
    price: rd.subscription_price_id?.split(':')[0] || '0',
    creator: rd.creator?.name || 'Unknown Creator'
  }

  return (
    <SubscribeClient room={roomInfo} user={user} />
  )
}
