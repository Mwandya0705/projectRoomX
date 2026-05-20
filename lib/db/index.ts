import { db as postgresDb, insert as pgInsert, update as pgUpdate, deleteRows as pgDeleteRows, query as pgQuery } from './postgres'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const useSupabase = !!supabaseUrl && !!supabaseKey

let supabaseAdmin: any
let insert: any
let update: any
let deleteRows: any
let query: any

if (!useSupabase) {
  // Export PostgreSQL client (compatible with existing Supabase-style queries)
  supabaseAdmin = postgresDb
  insert = pgInsert
  update = pgUpdate
  deleteRows = pgDeleteRows
  query = pgQuery
} else {
  // Use Supabase
  supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  insert = async (table: string, data: Record<string, any>) => {
    const result = await supabaseAdmin.from(table).insert(data).select().single()
    return result
  }

  update = async (
    table: string,
    data: Record<string, any>,
    where: Record<string, any>
  ) => {
    let query = supabaseAdmin.from(table).update(data)
    for (const [key, value] of Object.entries(where)) {
      query = query.eq(key, value)
    }
    return await query.select()
  }

  deleteRows = async (table: string, where: Record<string, any>) => {
    let query = supabaseAdmin.from(table).delete()
    for (const [key, value] of Object.entries(where)) {
      query = query.eq(key, value)
    }
    return await query.select()
  }

  query = async (sql: string, params: any[]) => {
     console.warn('Direct SQL query not supported through Supabase SDK client. Please use from().select() instead.')
     return { data: null, error: 'SQL queries not supported' }
  }
}

export { supabaseAdmin, insert, update, deleteRows, query }
