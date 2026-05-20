import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { getUserCredits } from '@/lib/ai/credits'
import { getUserJobs } from '@/lib/ai/jobs'
import AIStudioClient from './AIStudioClient'

export const metadata = { title: 'AI Studio — RoomX Creative Engine' }

export default async function AIStudioPage() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/sign-in')

  const dbUser = await getUserByAuthId(user.id)
  if (!dbUser) redirect('/dashboard')

  // Fetch initial credits and jobs server-side for instant paint
  const [credits, jobs] = await Promise.all([
    getUserCredits(user.id).catch(() => 500),
    getUserJobs(user.id, 20).catch(() => []),
  ])

  return (
    <AIStudioClient
      user={{ id: dbUser.id, name: dbUser.name, email: dbUser.email, imageUrl: dbUser.image_url }}
      initialCredits={credits}
      initialJobs={jobs}
    />
  )
}
