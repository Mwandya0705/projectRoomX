# PostgreSQL Migration Summary

The codebase has been updated to support **local PostgreSQL** in addition to Supabase.

## What Changed

1. **New Database Client** (`lib/db/postgres.ts`)
   - Direct PostgreSQL connection using `pg` library
   - Supabase-compatible query builder API
   - Supports joins, where clauses, ordering, etc.

2. **Unified Database Interface** (`lib/db/index.ts`)
   - Automatically detects whether to use local PostgreSQL or Supabase
   - Uses local PostgreSQL if `DATABASE_URL` is set
   - Falls back to Supabase if `DATABASE_URL` is not set

3. **Updated Server Client** (`lib/supabase/server.ts`)
   - Now uses the unified database interface
   - Works with both local PostgreSQL and Supabase

## How to Use

### Use Local PostgreSQL

1. Set `DATABASE_URL` in `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/roomx
   ```

2. The app will automatically use local PostgreSQL.

### Use Supabase (Cloud)

1. Remove or don't set `DATABASE_URL`
2. Set Supabase variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. The app will use Supabase.

## Database Connection Format

The `DATABASE_URL` uses the standard PostgreSQL connection string format:

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Examples:
- Default local: `postgresql://postgres:postgres@localhost:5432/roomx`
- Custom user: `postgresql://roomx_user:mypassword@localhost:5432/roomx`
- Remote: `postgresql://user:pass@db.example.com:5432/roomx`

## Features Supported

The local PostgreSQL client supports:
- ✅ Basic queries (SELECT, INSERT, UPDATE, DELETE)
- ✅ WHERE clauses (eq, neq)
- ✅ ORDER BY
- ✅ LIMIT
- ✅ Single result queries
- ✅ Joins (Supabase-style syntax)
- ✅ Transaction support (via `getClient()`)

## Limitations

Some Supabase-specific features are not available with local PostgreSQL:
- Real-time subscriptions (would need PostgREST + Realtime)
- Storage API (not used in this project)
- Auth API (using Clerk instead)

## Testing

To test the local PostgreSQL setup:

1. Make sure PostgreSQL is running
2. Create the database and run migrations (see `LOCAL_POSTGRES_SETUP.md`)
3. Set `DATABASE_URL` in `.env.local`
4. Run `npm run dev`
5. The app should connect to your local database

## Troubleshooting

**Connection errors:**
- Verify PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check connection string format
- Verify database exists: `psql -l`

**Query errors:**
- Make sure migrations have been run
- Check table names match (case-sensitive in PostgreSQL)
- Verify foreign key relationships

**Join errors:**
- The join syntax `users:creator_id(id, name)` assumes the foreign key is `creator_id` and it references `users.id`
- Adjust join logic in `lib/db/postgres.ts` if your schema differs


