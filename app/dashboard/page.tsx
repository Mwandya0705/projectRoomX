import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { getUserByClerkId } from '@/lib/utils/auth'
import { getUserRoom, getUserSubscriptions } from '@/lib/utils/access-control'
import NavigationClient from '@/components/NavigationClient'
import dynamic from 'next/dynamic'

// Dynamically import InviteMemberButton to avoid SSR issues
const InviteMemberButton = dynamic(() => import('@/components/InviteMemberButton'), {
  ssr: false,
})

export default async function DashboardPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect('/sign-in')
  }

  const user = await currentUser()
  let dbUser = await getUserByClerkId(clerkId)

  // Auto-create user if they don't exist (webhook might not have fired yet)
  if (!dbUser && user) {
    try {
      // Get email - required field, so we need to ensure it exists
      const primaryEmail = user.emailAddresses[0]?.emailAddress
      if (!primaryEmail) {
        throw new Error('No email address found in your account. Please add an email to your Clerk account.')
      }
      
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || null
      
      // Use upsert to handle potential race conditions
      const newUser = await prisma.user.upsert({
        where: { clerkId: clerkId },
        update: {
          email: primaryEmail,
          name: name,
          imageUrl: user.imageUrl || null, // Sync image from Clerk
        },
        create: {
          clerkId: clerkId,
          email: primaryEmail,
          name: name,
          imageUrl: user.imageUrl || null, // Store Clerk profile image
        },
      })

      // Convert to User type
      dbUser = {
        id: newUser.id,
        clerk_id: newUser.clerkId,
        email: newUser.email,
        name: newUser.name,
        image_url: newUser.imageUrl,
        created_at: newUser.createdAt.toISOString(),
        updated_at: newUser.updatedAt.toISOString(),
      }

      console.log(`[Dashboard] User auto-created/synced: ${primaryEmail} (${dbUser.id})`)
    } catch (error: any) {
      console.error('Error creating user:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
      })
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Setup Error</h2>
            <p className="text-red-600 mb-4">
              {error?.message || 'Error setting up your account. Please try again.'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              If this persists, please contact support or try signing out and back in.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Home
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Retry
              </Link>
            </div>
          </div>
        </div>
      )
    }
  }

  // If user exists, sync image from Clerk if it's different
  if (dbUser && user && user.imageUrl && dbUser.image_url !== user.imageUrl) {
    try {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { imageUrl: user.imageUrl },
      })
      // Refresh dbUser data
      dbUser.image_url = user.imageUrl
    } catch (error) {
      console.error('Error syncing user image:', error)
      // Non-critical error, continue
    }
  }

  if (!dbUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Check if user has a room
  const room = await getUserRoom(dbUser.id)

  // Get room members if user is admin or creator
  let roomMembers: any[] = []
  let isAdmin = false
  if (room) {
    try {
      // First, try to get basic room info with admin
      const roomData = await prisma.room.findUnique({
        where: { id: room.id },
        include: {
          admin: {
            select: {
              id: true,
            },
          },
        },
      })
      
      if (roomData) {
        isAdmin = (roomData.admin?.id === dbUser.id) || roomData.creatorId === dbUser.id
        
        // Try to fetch members separately if user is admin/creator
        // Use direct query on RoomMember to avoid Prisma Client cache issues
        if (isAdmin) {
          try {
            const directMembers = await prisma.roomMember.findMany({
              where: { roomId: room.id },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    imageUrl: true,
                  },
                },
              },
            })
            roomMembers = directMembers.map((member: any) => ({
              id: member.id,
              userId: member.userId,
              role: member.role,
              joinedAt: member.joinedAt,
              user: member.user,
            }))
          } catch (directError) {
            console.error('[Dashboard] Could not fetch members:', directError)
            // Members list will remain empty - this might happen if Prisma Client needs restart
          }
        }
      }
    } catch (error) {
      console.error('[Dashboard] Error fetching room data:', error)
      // Continue without members list
    }
  }

  // Get user's subscriptions if they're a subscriber
  const subscriptions = await getUserSubscriptions(dbUser.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationClient />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Creator Section */}
        {room ? (
          <section className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">My Room</h2>
              {isAdmin && <InviteMemberButton roomId={room.id} />}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900">{room.title}</h3>
                {room.description && (
                  <p className="text-gray-600 mt-2">{room.description}</p>
                )}
              </div>
              <div className="flex gap-4">
                <Link
                  href={`/room/${room.id}`}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Room
                </Link>
                {isAdmin && (
                  <Link
                    href={`/dashboard/room/edit`}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Edit Room
                  </Link>
                )}
              </div>

              {/* Room Members Section (for admins) */}
              {isAdmin && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Room Members ({roomMembers.length})
                  </h3>
                  {roomMembers.length > 0 ? (
                    <div className="space-y-3">
                      {roomMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {member.user.imageUrl ? (
                              <img
                                src={member.user.imageUrl}
                                alt={member.user.name || 'Member'}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                {member.user.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.user.name || 'Anonymous'}
                              </p>
                              <p className="text-sm text-gray-600">{member.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              member.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {member.role === 'admin' ? 'Admin' : 'Member'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No members yet. Use the "Invite Member" button to invite people to your room.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Create Your Room</h2>
            <p className="text-gray-600 mb-4">
              Create a live room to start monetizing your content.
            </p>
            <Link
              href="/dashboard/room/create"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Room
            </Link>
          </section>
        )}

        {/* Subscriptions Section */}
        {subscriptions && subscriptions.length > 0 && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Subscriptions</h2>
            <div className="space-y-4">
              {subscriptions.map((sub: any) => (
                <div
                  key={sub.id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {(sub.rooms as any).title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {(sub.rooms as any).description}
                    </p>
                  </div>
                  <Link
                    href={`/room/${(sub.rooms as any).id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Join Room
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

