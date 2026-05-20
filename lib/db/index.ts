// Unified database client that works with local PostgreSQL or Supabase
// Note: Prisma is available via @/lib/db/prisma for direct use
import { db as postgresDb, insert, update, deleteRows, query } from './postgres'
import { createClient } from '@supabase/supabase-js'

const useLocalPostgres = !!process.env.DATABASE_URL

if (useLocalPostgres) {
  // Export PostgreSQL client (compatible with existing Supabase-style queries)
  export const supabaseAdmin = postgresDb
  export { insert, update, deleteRows, query }
} else {
  // Use Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Either set DATABASE_URL for local PostgreSQL or set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for Supabase.'
    )
  }

  export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Re-export Supabase methods as compatible functions
  export async function insert(table: string, data: Record<string, any>) {
    const result = await supabaseAdmin.from(table).insert(data).select().single()
    return result
  }

  export async function update(
    table: string,
    data: Record<string, any>,
    where: Record<string, any>
  ) {
    let query = supabaseAdmin.from(table).update(data)
    for (const [key, value] of Object.entries(where)) {
      query = query.eq(key, value)
    }
    return await query.select()
  }

  export async function deleteRows(table: string, where: Record<string, any>) {
    let query = supabaseAdmin.from(table).delete()
    for (const [key, value] of Object.entries(where)) {
      query = query.eq(key, value)
    }
    return await query.select()
  }
}

