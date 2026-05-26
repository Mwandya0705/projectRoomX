import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserByAuthId } from '@/lib/utils/auth'
import { getUserRooms, getUserSubscriptions } from '@/lib/utils/access-control'
import { sendWelcomeEmail } from '@/lib/email/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/sign-in')
  }

  let dbUser = await getUserByAuthId(user.id)

  // Auto-sync user profile to public users table if they don't exist
  if (!dbUser && user) {
    try {
      // Use admin client to bypass RLS for initial user creation
      const adminSupabase = createAdminClient()
      const { data: newUser, error: upsertError } = await adminSupabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata.full_name || user.user_metadata.name || null,
          image_url: user.user_metadata.avatar_url || null,
          clerk_id: user.id, // fallback to satisfy clerk_id UNIQUE NOT NULL if migration hasn't run
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })
        .select()
        .single()

      if (upsertError) throw upsertError

      // Send welcome email since they are a newly synced user
      await sendWelcomeEmail({
        to: user.email!,
        name: user.user_metadata.full_name || user.user_metadata.name || '',
      })

      dbUser = {
        id: newUser.id,
        clerk_id: newUser.clerk_id || '',
        email: newUser.email,
        name: newUser.name,
        image_url: newUser.image_url,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      }
    } catch (error) {
      console.error('Error syncing user:', error)
    }
  }

  if (!dbUser) {
    return <div className="min-h-screen flex items-center justify-center p-6 bg-[#f5f6f2] font-nanum text-2xl">Initializing your Control Center...</div>
  }


  // Get user's rooms
  const rooms = await getUserRooms(dbUser.id)

  // Get room details using Supabase
  const roomsWithDetails = await Promise.all(rooms.map(async (room) => {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('admin_id, creator_id')
      .eq('id', room.id)
      .single()
    
    let members: any[] = []
    let isAdminInRoom = false
    
    if (roomData) {
      isAdminInRoom = (roomData.admin_id === dbUser.id) || roomData.creator_id === dbUser.id
      if (isAdminInRoom) {
        const { data: directMembers } = await supabase
          .from('room_members')
          .select('id, user_id, role, user:users(id, name, email, image_url)')
          .eq('room_id', room.id)
        
        members = (directMembers || []).map((m: any) => ({
          id: m.id,
          userId: m.user_id,
          role: m.role,
          user: m.user,
        }))
      }
    }

    return {
      ...room,
      members,
      isAdmin: isAdminInRoom
    }
  }))

  // Get user's subscriptions
  const subscriptions = await getUserSubscriptions(dbUser.id)

  return (
    <DashboardClient 
      dbUser={dbUser}
      rooms={roomsWithDetails}
      subscriptions={subscriptions}
    />
  )
}
