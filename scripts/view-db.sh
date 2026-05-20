#!/bin/bash
# Quick script to view database data
# Usage: ./scripts/view-db.sh

DB_URL="postgresql://peter_mwandya:Peter2003@localhost:5432/roomxdb"

echo "=== USERS ==="
psql "$DB_URL" -c "SELECT id, email, name, clerk_id, created_at FROM users ORDER BY created_at DESC;"

echo -e "\n=== ROOMS ==="
psql "$DB_URL" -c "SELECT id, title, creator_id, is_live, subscription_price_id, created_at FROM rooms ORDER BY created_at DESC;"

echo -e "\n=== SUBSCRIPTIONS ==="
psql "$DB_URL" -c "SELECT id, subscriber_id, room_id, status, created_at FROM subscriptions ORDER BY created_at DESC;"

echo -e "\n=== SUMMARY ==="
psql "$DB_URL" -c "SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM rooms) as rooms,
  (SELECT COUNT(*) FROM subscriptions) as subscriptions,
  (SELECT COUNT(*) FROM room_participants) as participants;"


