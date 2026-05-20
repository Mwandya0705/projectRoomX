# Prisma Studio White Screen - Complete Fix Guide

## Problem
Prisma Studio shows a white screen even though the server is running correctly.

## Root Cause
The JavaScript modules (`databrowser.js`, `index.js`, etc.) may not be loading correctly in your browser. This is often a browser security or module resolution issue.

## Solutions (Try in Order)

### Solution 1: Use Alternative Browser Access Method

1. **Stop Prisma Studio** (Ctrl+C in terminal)

2. **Try accessing via IP instead of localhost:**
   ```bash
   npx prisma studio --port 5555
   ```
   Then open: `http://127.0.0.1:5555` instead of `http://localhost:5555`

3. **Check browser console for errors:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for errors about module loading or CORS

### Solution 2: Use Command Line Database Viewer (RECOMMENDED)

Instead of Prisma Studio, use the provided script:

```bash
chmod +x scripts/view-db-data.sh
./scripts/view-db-data.sh
```

This shows:
- All users
- All rooms  
- All subscriptions
- All room members
- All room participants
- Statistics

### Solution 3: Direct PostgreSQL Queries

Use `psql` directly:

```bash
# Connect to database
psql postgresql://peter_mwandya:Peter2003@localhost:5432/roomxdb

# Then run queries:
SELECT * FROM users;
SELECT * FROM rooms;
SELECT * FROM room_members;
SELECT * FROM subscriptions;
\q  # to exit
```

### Solution 4: Browser-Specific Fixes

**For Chrome/Edge:**
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Reload the page
5. Check if JavaScript files are loading (200 status)

**For Safari:**
1. Safari → Preferences → Advanced
2. Enable "Show Develop menu"
3. Develop → Disable Local File Restrictions
4. Reload Prisma Studio

**For Firefox:**
1. Open DevTools (F12)
2. Go to Network tab
3. Check for blocked requests
4. Check Console for errors

### Solution 5: Reinstall Prisma

```bash
npm uninstall prisma @prisma/client
npm install prisma@latest @prisma/client@latest
npx prisma generate
npx prisma studio
```

### Solution 6: Check Node.js Version

Prisma Studio requires Node.js 16+. Check your version:
```bash
node --version
```

If outdated, update Node.js.

## Quick Alternative Commands

View specific data quickly:

```bash
# View users
psql postgresql://peter_mwandya:Peter2003@localhost:5432/roomxdb -c "SELECT * FROM users;"

# View rooms
psql postgresql://peter_mwandya:Peter2003@localhost:5432/roomxdb -c "SELECT * FROM rooms;"

# View room members
psql postgresql://peter_mwandya:Peter2003@localhost:5432/roomxdb -c "SELECT rm.*, u.email, u.name FROM room_members rm JOIN users u ON rm.user_id = u.id;"

# Count records
psql postgresql://peter_mwandya:Peter2003@localhost:5432/roomxdb -c "SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM rooms) as rooms,
  (SELECT COUNT(*) FROM room_members) as members;"
```

## Why This Happens

Prisma Studio uses ES modules that need proper browser support. Common causes:
- Browser security policies blocking module loading
- Cached broken assets
- Node.js/Prisma version compatibility issues
- Network/firewall blocking asset requests

## Recommendation

**Use the command-line script** (`./scripts/view-db-data.sh`) - it's faster, more reliable, and shows all your data clearly without browser issues.


