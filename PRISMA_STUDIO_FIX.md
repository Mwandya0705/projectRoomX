# Fixing Prisma Studio White Screen Issue

If Prisma Studio shows only a white screen, try these solutions:

## Solution 1: Clear Browser Cache
1. Open browser Developer Tools (F12 or Cmd+Option+I)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or try incognito/private mode

## Solution 2: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for JavaScript errors
4. Common issues: CORS errors, network errors

## Solution 3: Try Different Port
Stop Prisma Studio (Ctrl+C) and run:
```bash
npx prisma studio --port 5556
```

## Solution 4: Use Different Browser
Try opening Prisma Studio in:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Solution 5: Reinstall Prisma Studio
```bash
npm install -g prisma@latest
npx prisma studio
```

## Solution 6: Check Database Connection
Verify your database is accessible:
```bash
psql postgresql://peter_mwandya:Peter2003@localhost:5432/roomxdb -c "\dt"
```

## Solution 7: Use Alternative Method
Instead of Prisma Studio, use the command line:
```bash
# View users
psql postgresql://peter_mwandya:Peter2003@localhost:5432/roomxdb -c "SELECT * FROM users;"

# View rooms
psql postgresql://peter_mwandya:Peter2003@localhost:5432/roomxdb -c "SELECT * FROM rooms;"

# View all tables
psql postgresql://peter_mwandya:Peter2003@localhost:5432/roomxdb -c "\dt"
```

Or use the provided script:
```bash
chmod +x scripts/view-db.sh
./scripts/view-db.sh
```

## Most Common Fix
**Try opening in an incognito/private window** - this usually resolves browser cache issues.


