import { createClient } from '@/lib/supabase/server'
import type { User } from '@/lib/types/database'

/**
 * Get the current user from Supabase Auth
 */
export async function getCurrentAuthUser() {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return user
  } catch (error) {
    console.error('Error getting current auth user:', error)
    return null
  }
}

/**
 * Get the current user's database ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentAuthUser()
  return user?.id || null
}

/**
 * Get user from Database using their Authed ID
 */
export async function getUserByAuthId(authId: string): Promise<User | null> {
  try {
    const supabase = createClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authId)
      .single()

    if (error || !user) {
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user by Auth ID:', error)
      }
      return null
    }

    return {
      id: user.id,
      clerk_id: user.clerk_id || '', // Maintain compatibility for now
      email: user.email,
      name: user.name,
      image_url: user.image_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  } catch (error) {
    console.error('Error fetching user by Auth ID:', error)
    return null
  }
}

// Re-export as getUserByClerkId for backward compatibility if needed, 
// though we should eventually replace all calls.
export const getUserByClerkId = getUserByAuthId;


