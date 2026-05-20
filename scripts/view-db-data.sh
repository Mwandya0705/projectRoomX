#!/bin/bash

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

DB_URL=${DATABASE_URL}

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL not set in .env.local"
  exit 1
fi

echo "========================================="
echo "RoomX Database Viewer"
echo "========================================="
echo ""

echo "=== Users ==="
psql $DB_URL -c "SELECT id, email, name, clerk_id, created_at FROM users ORDER BY created_at DESC;" 2>&1
echo ""

echo "=== Rooms ==="
psql $DB_URL -c "SELECT id, title, description, creator_id, is_live, is_public, capacity, subscription_price_id, created_at FROM rooms ORDER BY created_at DESC;" 2>&1
echo ""

echo "=== Subscriptions ==="
psql $DB_URL -c "SELECT id, subscriber_id, room_id, status, stripe_subscription_id, created_at FROM subscriptions ORDER BY created_at DESC;" 2>&1
echo ""

echo "=== Room Members ==="
psql $DB_URL -c "SELECT rm.id, rm.room_id, rm.user_id, rm.role, u.email as member_email, u.name as member_name, rm.invited_by, rm.joined_at FROM room_members rm JOIN users u ON rm.user_id = u.id ORDER BY rm.joined_at DESC;" 2>&1
echo ""

echo "=== Room Participants ==="
psql $DB_URL -c "SELECT id, room_id, user_id, role, joined_at, left_at FROM room_participants ORDER BY joined_at DESC LIMIT 20;" 2>&1
echo ""

echo "========================================="
echo "Statistics"
echo "========================================="
echo ""
psql $DB_URL -c "SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM rooms) as total_rooms,
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
  (SELECT COUNT(*) FROM room_members) as total_room_members;" 2>&1
echo ""


