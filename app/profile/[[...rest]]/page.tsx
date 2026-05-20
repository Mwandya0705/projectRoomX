import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { UserProfile } from '@clerk/nextjs'
import NavigationClient from '@/components/NavigationClient'

export default async function ProfilePage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationClient />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Account</h1>
          <p className="text-gray-600">
            Update your profile details and security settings in one place.
          </p>
        </div>

        {/* Clerk-managed profile details (including image) and security settings */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0',
              },
            }}
          />
        </div>
      </main>
    </div>
  )
}


