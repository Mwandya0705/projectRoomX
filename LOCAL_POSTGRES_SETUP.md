# Local PostgreSQL Setup Guide

This guide will help you set up RoomX to use a local PostgreSQL database instead of Supabase.

## Prerequisites

- PostgreSQL installed locally (version 12+)
- Node.js and npm installed

## Step 1: Install PostgreSQL

### macOS (using Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
Download and install from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)

## Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE roomx;

# Create user (optional, you can use default 'postgres' user)
CREATE USER roomx_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE roomx TO roomx_user;

# Exit psql
\q
```

## Step 3: Run Migrations

Connect to your database and run the migration files in order:

```bash
psql -d roomx -f supabase/migrations/001_create_users_table.sql
psql -d roomx -f supabase/migrations/002_create_rooms_table.sql
psql -d roomx -f supabase/migrations/003_create_subscriptions_table.sql
psql -d roomx -f supabase/migrations/004_create_room_participants_table.sql
psql -d roomx -f supabase/migrations/005_create_functions_and_triggers.sql
psql -d roomx -f supabase/migrations/006_enable_rls_policies.sql
```

Or run them all at once:
```bash
psql -d roomx < supabase/migrations/001_create_users_table.sql
psql -d roomx < supabase/migrations/002_create_rooms_table.sql
psql -d roomx < supabase/migrations/003_create_subscriptions_table.sql
psql -d roomx < supabase/migrations/004_create_room_participants_table.sql
psql -d roomx < supabase/migrations/005_create_functions_and_triggers.sql
psql -d roomx < supabase/migrations/006_enable_rls_policies.sql
```

## Step 4: Configure Environment Variables

Add to your `.env.local` file:

```env
# Local PostgreSQL Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/roomx

# Or with custom user:
# DATABASE_URL=postgresql://roomx_user:your_password@localhost:5432/roomx

# Alternative: Individual connection parameters
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=roomx
```

**Important:** When `DATABASE_URL` is set, the app will use local PostgreSQL. If you want to use Supabase instead, remove `DATABASE_URL` and set the Supabase variables.

## Step 5: Test Connection

You can test the connection by running:

```bash
npm run dev
```

The app should connect to your local PostgreSQL database.

## Step 6: Verify Tables

Connect to your database and verify tables were created:

```bash
psql -d roomx

# List tables
\dt

# Check a table structure
\d users
\d rooms
\d subscriptions

# Exit
\q
```

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check PostgreSQL is listening on port 5432: `lsof -i :5432` (macOS/Linux)

### Authentication Failed
- Verify username and password in `DATABASE_URL`
- Check PostgreSQL authentication settings in `pg_hba.conf`

### Database Does Not Exist
- Create the database: `createdb roomx` or `psql -c "CREATE DATABASE roomx;"`

### Migration Errors
- Make sure you're running migrations in order
- Check if tables already exist (you may need to drop them first)
- Verify PostgreSQL version is 12+

## Using Both Local and Supabase

The codebase supports both:
- **Local PostgreSQL**: Set `DATABASE_URL` environment variable
- **Supabase**: Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

The app will automatically use local PostgreSQL if `DATABASE_URL` is set, otherwise it falls back to Supabase.

## Next Steps

1. Set up other services (Clerk, LiveKit, Stripe) as described in `SETUP_GUIDE.md`
2. Run the development server: `npm run dev`
3. Test the application with your local database


