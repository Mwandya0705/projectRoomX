import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import ProfileUpdateForm from '@/components/ProfileUpdateForm'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/sign-in')
  }

  const dbUser = await getUserByAuthId(user.id)

  const currentUser = {
    id: user.id,
    email: user.email!,
    name: dbUser?.name || user.user_metadata?.name || null,
    imageUrl: dbUser?.image_url || null,
    clerkImageUrl: user.user_metadata?.avatar_url || undefined,
  }

  return (
    <div className="min-h-screen bg-[#f5f6f2]">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 space-y-6">
        <div>
          <h1 className="text-3xl lg:text-5xl font-bold font-nanum text-[#0d2a21] mb-2 tracking-tighter">Manage Account</h1>
          <p className="text-[#0d2a21]/60 font-medium">
            Update your profile details and representation.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-black/5 p-8 sm:p-12">
          <ProfileUpdateForm currentUser={currentUser} />
        </div>
      </main>
    </div>
  )
}


