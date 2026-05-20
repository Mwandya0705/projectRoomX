import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import NavigationClient from '@/components/NavigationClient'

export default async function RoomsPage() {
  // Fetch all rooms with their creators (Prisma 6 supports standard queries)
  const rooms = await prisma.room.findMany({
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Format rooms for display
  const formattedRooms = rooms.map(room => ({
    id: room.id,
    title: room.title,
    description: room.description,
    isLive: room.isLive,
    isPublic: room.isPublic,
    capacity: room.capacity,
    createdAt: room.createdAt,
    creator: room.creator ? {
      id: room.creator.id,
      name: room.creator.name,
      email: room.creator.email,
      imageUrl: room.creator.imageUrl,
    } : {
      id: room.creatorId,
      name: null,
      email: 'Unknown',
      imageUrl: null,
    },
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationClient />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Rooms</h1>
          <p className="text-gray-600">Discover live rooms from creators</p>
        </div>

        {formattedRooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No rooms available yet.</p>
            <Link
              href="/dashboard/room/create"
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create the First Room
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {room.title}
                      </h3>
                      {room.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {room.isLive && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                          LIVE
                        </span>
                      )}
                      {room.isPublic ? (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                          PUBLIC
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded">
                          {room.capacity ? `${room.capacity} Members` : 'PRIVATE'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    {room.creator.imageUrl ? (
                      <img
                        src={room.creator.imageUrl}
                        alt={room.creator.name || 'Creator'}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {room.creator.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {room.creator.name || 'Anonymous Creator'}
                      </p>
                      <p className="text-xs text-gray-500">{room.creator.email}</p>
                    </div>
                  </div>

                  <Link
                    href={room.isPublic ? `/room/${room.id}` : `/subscribe/${room.creator.id}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {room.isPublic ? 'Join Room' : 'View Room'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

