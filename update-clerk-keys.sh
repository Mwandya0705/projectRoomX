#!/bin/bash

# Script to update Clerk keys in .env.local
# Usage: ./update-clerk-keys.sh

echo "Updating Clerk keys in .env.local..."
echo ""
echo "Please provide your Clerk keys from https://dashboard.clerk.com"
echo ""

read -p "Enter NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: " PUBLISHABLE_KEY
read -p "Enter CLERK_SECRET_KEY: " SECRET_KEY
read -p "Enter CLERK_WEBHOOK_SECRET (optional, press Enter to skip): " WEBHOOK_SECRET

# Update the .env.local file
cd "/Users/pro/iCloud Drive (Archive)/Documents/RoomX"

# Backup original
cp .env.local .env.local.backup

# Update publishable key
if [ ! -z "$PUBLISHABLE_KEY" ]; then
  sed -i '' "s|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$PUBLISHABLE_KEY|" .env.local
  echo "✓ Updated NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
fi

# Update secret key
if [ ! -z "$SECRET_KEY" ]; then
  sed -i '' "s|CLERK_SECRET_KEY=.*|CLERK_SECRET_KEY=$SECRET_KEY|" .env.local
  echo "✓ Updated CLERK_SECRET_KEY"
fi

# Update webhook secret if provided
if [ ! -z "$WEBHOOK_SECRET" ]; then
  sed -i '' "s|CLERK_WEBHOOK_SECRET=.*|CLERK_WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env.local
  echo "✓ Updated CLERK_WEBHOOK_SECRET"
fi

echo ""
echo "Keys updated! Restart your dev server for changes to take effect."
echo "Backup saved to .env.local.backup"


