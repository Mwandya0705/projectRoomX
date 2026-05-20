import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import type { User } from '@/lib/types/database'

/**
 * Get the current user's Clerk ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

/**
 * Get user from Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    })

    if (!user) {
      return null
    }

    // Convert Prisma user to User type
    return {
      id: user.id,
      clerk_id: user.clerkId,
      email: user.email,
      name: user.name,
      image_url: user.imageUrl,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching user by Clerk ID:', error)
    return null
  }
}

