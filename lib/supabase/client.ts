import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient() {
  if (client) return client

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-supabase-url-for-build.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'dummy-supabase-key-for-vercel-build',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'roomx-sanctuary-auth-token',
      },
      global: {
        headers: { 'x-application-name': 'roomx-sanctuary' },
      },
    }
  )
  
  return client
}
