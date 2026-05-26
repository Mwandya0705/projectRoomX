import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Check if user already exists in public.users
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()

          if (!existingUser) {
            console.log(`[Auth Callback] Syncing new user: ${user.email} (${user.id})`)
            const adminSupabase = createAdminClient()
            const name = user.user_metadata?.full_name || user.user_metadata?.name || null
            const imageUrl = user.user_metadata?.avatar_url || null

            const { error: upsertError } = await adminSupabase
              .from('users')
              .upsert({
                id: user.id,
                email: user.email!,
                name: name,
                image_url: imageUrl,
                clerk_id: user.id, // fallback to satisfy the NOT NULL constraint if ALTER TABLE clerk_id DROP NOT NULL hasn't run
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'id'
              })

            if (!upsertError) {
              console.log(`[Auth Callback] User synchronized successfully. Sending welcome email.`)
              await sendWelcomeEmail({
                to: user.email!,
                name: name || '',
              })
            } else {
              console.error('[Auth Callback] Error inserting user profile:', upsertError)
            }
          }
        }
      } catch (syncErr) {
        console.error('[Auth Callback] User sync / welcome email process failed:', syncErr)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
