import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserByAuthId } from '@/lib/utils/auth'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
})

/**
 * PATCH /api/profile/update
 * Update user profile (name, image)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByAuthId(authUser.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const updates = updateProfileSchema.parse(body)

    // Handle old image cleanup if a new one is provided or removed
    if (updates.imageUrl !== undefined && user.image_url) {
      try {
        const bucketName = 'avatars'
        const oldUrl = user.image_url
        
        // Check if it's a supabase storage URL
        if (oldUrl.includes(`${bucketName}/profiles/`)) {
          const oldPath = oldUrl.split(`${bucketName}/`)[1]
          if (oldPath) {
            console.log('[ProfileUpdate] Cleaning up old sanctuary asset:', oldPath)
            await supabase.storage.from(bucketName).remove([oldPath])
          }
        }
      } catch (cleanupError) {
        console.error('[ProfileUpdate] Failed to cleanup old image:', cleanupError)
        // Don't fail the update just because cleanup failed
      }
    }

    // Update user in database using admin client to bypass RLS policies
    const supabaseAdmin = createAdminClient()
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.imageUrl !== undefined && { image_url: updates.imageUrl }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id, email, name, image_url')
      .single()

    if (error) throw error

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        imageUrl: updatedUser.image_url,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


