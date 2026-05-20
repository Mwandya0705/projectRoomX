import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { getUserByClerkId } from '@/lib/utils/auth'
import SubscribeButton from '@/components/SubscribeButton'
import NavigationClient from '@/components/NavigationClient'

interface PageProps {
  params: {
    creatorId: string
  }
}

export default async function SubscribePage({ params }: PageProps) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect('/sign-in')
  }

  const user = await getUserByClerkId(clerkId)
  if (!user) {
    redirect('/sign-in')
  }

  // Get creator
  const creator = await prisma.user.findUnique({
    where: { id: params.creatorId },
  })

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Creator not found</p>
      </div>
    )
  }

  // Get creator's room
  const roomData = await prisma.room.findUnique({
    where: { creatorId: params.creatorId },
  })

  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>This creator doesn&apos;t have a room yet.</p>
      </div>
    )
  }

  // Check if user is already subscribed
  const subscription = await prisma.subscription.findFirst({
    where: {
      subscriberId: user.id,
      roomId: roomData.id,
      status: 'active',
    },
  })

  // Check if user is the creator
  const isCreator = roomData.creatorId === user.id

  if (isCreator) {
    redirect(`/room/${roomData.id}`)
  }

  if (subscription) {
    redirect(`/room/${roomData.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationClient />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Subscribe to {creator?.name || 'Room'}
          </h1>
          <p className="text-xl text-gray-600 mb-6">{roomData.title}</p>
          {roomData.description && (
            <p className="text-gray-700 mb-8">{roomData.description}</p>
          )}

          <div className="border-t border-gray-200 pt-8">
            {roomData.subscriptionPriceId ? (
              <>
                <div className="mb-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {(() => {
                      const [priceStr, currency] = roomData.subscriptionPriceId.split(':')
                      const amount = parseFloat(priceStr)
                      return `${new Intl.NumberFormat('en-US').format(amount)} ${currency || 'TZS'}`
                    })()}
                  </p>
                  <p className="text-gray-600">per month</p>
                </div>
                <SubscribeButton roomId={roomData.id} />
              </>
            ) : (
              <p className="text-center text-gray-600">Subscription price not configured</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

