import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getUserByClerkId } from '@/lib/utils/auth'
import { getUserRoom } from '@/lib/utils/access-control'
import NavigationClient from '@/components/NavigationClient'
import EditRoomForm from '@/components/EditRoomForm'

export default async function EditRoomPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect('/sign-in')
  }

  const dbUser = await getUserByClerkId(clerkId)
  if (!dbUser) {
    redirect('/sign-in')
  }

  // Get user's room (as creator) or check if user is admin of a room
  let room = await getUserRoom(dbUser.id)
  let roomData = null

  if (room) {
    roomData = await prisma.room.findUnique({
      where: { id: room.id },
      include: {
        admin: {
          select: {
            id: true,
          },
        },
      },
    })
  } else {
    // If user is not creator, check if they're admin of any room
    const adminRoom = await prisma.room.findFirst({
      where: { adminId: dbUser.id },
    })

    if (adminRoom) {
      roomData = await prisma.room.findUnique({
        where: { id: adminRoom.id },
        include: {
          admin: {
            select: {
              id: true,
            },
          },
        },
      })

      if (roomData) {
        room = {
          id: roomData.id,
          creator_id: roomData.creatorId,
          title: roomData.title,
          description: roomData.description,
          is_live: roomData.isLive,
          subscription_price_id: roomData.subscriptionPriceId,
          subscription_product_id: roomData.subscriptionProductId,
          created_at: roomData.createdAt.toISOString(),
          updated_at: roomData.updatedAt.toISOString(),
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
    <div className="min-h-screen bg-gray-50">
      <NavigationClient />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
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

