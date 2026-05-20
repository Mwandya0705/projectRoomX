import { Pool, QueryResult } from 'pg'

// Get PostgreSQL connection string from environment
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'roomx'}`

// Create connection pool
const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Helper to execute queries
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now()
  try {
    const res = await pool.query<T>(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error', { text, error })
    throw error
  }
}

// Helper to get a client from the pool (for transactions)
export async function getClient() {
  return await pool.connect()
}

// Parse Supabase-style select with joins (e.g., "*, users:creator_id(id, name)")
function parseSelect(selectString: string, mainTable: string): { mainFields: string; joins: any[] } {
  const joins: any[] = []
  let mainFields = '*'

  // Check for join syntax: "table:foreign_key(fields)"
  const joinRegex = /(\w+):(\w+)\(([^)]+)\)/g
  let match

  while ((match = joinRegex.exec(selectString)) !== null) {
    const [, joinTable, foreignKey, fields] = match
    joins.push({
      table: joinTable,
      foreignKey,
      fields: fields.split(',').map((f: string) => f.trim()),
    })
  }

  // Extract main table fields (everything before joins)
  const mainPart = selectString.split(',').find((part) => !part.includes(':')) || '*'
  mainFields = mainPart.trim()

  return { mainFields, joins }
}

// Supabase-like query builder wrapper
export class PostgresQueryBuilder {
  private table: string
  private selectString: string = '*'
  private whereConditions: { field: string; operator: string; value: any }[] = []
  private orderByField?: string
  private orderByDirection: 'ASC' | 'DESC' = 'ASC'
  private limitCount?: number
  private singleResult = false

  constructor(table: string) {
    this.table = table
  }

  select(fields: string | string[]) {
    if (typeof fields === 'string') {
      this.selectString = fields
    } else {
      this.selectString = fields.join(', ')
    }
    return this
  }

  eq(field: string, value: any) {
    this.whereConditions.push({ field, operator: '=', value })
    return this
  }

  neq(field: string, value: any) {
    this.whereConditions.push({ field, operator: '!=', value })
    return this
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderByField = field
    this.orderByDirection = options?.ascending === false ? 'DESC' : 'ASC'
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  single() {
    this.singleResult = true
    return this
  }

  async execute<T = any>(): Promise<{ data: T[] | T | null; error: any }> {
    try {
      const { mainFields, joins } = parseSelect(this.selectString, this.table)
      const params: any[] = []
      let paramIndex = 1

      // Build SELECT clause with joins
      const selectFields: string[] = []
      if (mainFields === '*') {
        selectFields.push(`${this.table}.*`)
      } else {
        // Parse main fields (could be comma-separated)
        mainFields.split(',').forEach((f) => {
          const trimmed = f.trim()
          if (trimmed && trimmed !== '*') {
            selectFields.push(`${this.table}.${trimmed}`)
          } else if (trimmed === '*') {
            selectFields.push(`${this.table}.*`)
          }
        })
      }

      const fromClause = `FROM ${this.table}`
      const joinClauses: string[] = []

      // Add joined fields
      for (const join of joins) {
        const joinFields = join.fields.map((f: string) => `${join.table}.${f} AS ${join.table}_${f}`).join(', ')
        selectFields.push(joinFields)
        // Join on foreign key (e.g., rooms.creator_id = users.id)
        joinClauses.push(
          `LEFT JOIN ${join.table} ON ${this.table}.${join.foreignKey} = ${join.table}.id`
        )
      }

      const selectClause = `SELECT ${selectFields.join(', ')}`

      // Build WHERE clause
      let whereClause = ''
      if (this.whereConditions.length > 0) {
        const whereParts = this.whereConditions.map((condition) => {
          const param = `$${paramIndex++}`
          params.push(condition.value)
          return `${condition.field} ${condition.operator} ${param}`
        })
        whereClause = ` WHERE ${whereParts.join(' AND ')}`
      }

      // Build ORDER BY clause
      let orderClause = ''
      if (this.orderByField) {
        orderClause = ` ORDER BY ${this.orderByField} ${this.orderByDirection}`
      }

      // Build LIMIT clause
      let limitClause = ''
      if (this.singleResult) {
        limitClause = ' LIMIT 1'
      } else if (this.limitCount) {
        limitClause = ` LIMIT ${this.limitCount}`
      }

      const sql = `${selectClause} ${fromClause} ${joinClauses.join(' ')}${whereClause}${orderClause}${limitClause}`

      const result = await query<T>(sql, params)

      // Transform results to match Supabase format (nested objects for joins)
      let transformedRows = result.rows

      if (joins.length > 0) {
        transformedRows = result.rows.map((row: any) => {
          const transformed: any = {}
          
          // Copy main table fields
          for (const key in row) {
            if (!key.includes('_') || !joins.some((j) => key.startsWith(`${j.table}_`))) {
              transformed[key] = row[key]
            }
          }

          // Create nested objects for joins (matching Supabase format)
          for (const join of joins) {
            const joinData: any = {}
            let hasData = false
            for (const field of join.fields) {
              const alias = `${join.table}_${field}`
              if (row[alias] !== undefined && row[alias] !== null) {
                joinData[field] = row[alias]
                hasData = true
              }
            }
            // Use the join table name as the key (e.g., "users" for the join)
            // But we need to match Supabase's format which uses the relation name
            // For "users:creator_id", Supabase returns it as "users" object
            transformed[join.table] = hasData ? joinData : null
          }
          return transformed
        })
      }

      if (this.singleResult) {
        return { data: transformedRows[0] || null, error: null }
      }

      return { data: transformedRows, error: null }
    } catch (error) {
      console.error('Query execution error:', error)
      return { data: null, error }
    }
  }
}

// Supabase-like API
export const db = {
  from: (table: string) => new PostgresQueryBuilder(table),
  query: query,
}

// Insert helper
export async function insert<T = any>(
  table: string,
  data: Record<string, any>
): Promise<{ data: T | null; error: any }> {
  try {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`
    
    const result = await query<T>(sql, values)
    return { data: result.rows[0] || null, error: null }
  } catch (error) {
    console.error('Insert error:', error)
    return { data: null, error }
  }
}

// Update helper
export async function update<T = any>(
  table: string,
  data: Record<string, any>,
  where: Record<string, any>
): Promise<{ data: T[] | null; error: any }> {
  try {
    const setClauses: string[] = []
    const whereClauses: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // Build SET clause
    for (const [key, value] of Object.entries(data)) {
      setClauses.push(`${key} = $${paramIndex++}`)
      params.push(value)
    }

    // Build WHERE clause
    for (const [key, value] of Object.entries(where)) {
      whereClauses.push(`${key} = $${paramIndex++}`)
      params.push(value)
    }

    const sql = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')} RETURNING *`
    const result = await query<T>(sql, params)
    return { data: result.rows, error: null }
  } catch (error) {
    console.error('Update error:', error)
    return { data: null, error }
  }
}

// Delete helper
export async function deleteRows<T = any>(
  table: string,
  where: Record<string, any>
): Promise<{ data: T[] | null; error: any }> {
  try {
    const whereClauses: string[] = []
    const params: any[] = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(where)) {
      whereClauses.push(`${key} = $${paramIndex++}`)
      params.push(value)
    }

    const sql = `DELETE FROM ${table} WHERE ${whereClauses.join(' AND ')} RETURNING *`
    const result = await query<T>(sql, params)
    return { data: result.rows, error: null }
  } catch (error) {
    console.error('Delete error:', error)
    return { data: null, error }
  }
}

// Close pool (for cleanup)
export async function closePool() {
  await pool.end()
}

