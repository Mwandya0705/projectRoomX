-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🌐 ROOMX SUPABASE POSTGRESQL INITIAL DATABASE SCHEMA & POLICIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Paste this script into your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- to instantiate the entire DB schema with perfect foreign keys, performance indices,
-- automated updated_at triggers, and Row Level Security (RLS) policies.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────────────────
-- 1. TABLES CREATION
-- ──────────────────────────────────────────────────────────────────────────

-- Users Table (Synced from Clerk via webhook or route sync)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms Table (Private sanctuaries of creators)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'Other',
  is_live BOOLEAN DEFAULT false,
  subscription_price_id VARCHAR(255), -- Stored in format: "amount:currency" (e.g. "29900:TZS")
  subscription_product_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT one_room_per_creator UNIQUE (creator_id)
);

-- Subscriptions Table (Secures access passes for rooms)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL, -- Stored as Payment ID
  stripe_customer_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'active', 'pending', 'cancelled'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_active_subscription UNIQUE (subscriber_id, room_id, status)
    WHERE status = 'active'
);

-- Room Participants Table
CREATE TABLE IF NOT EXISTS room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  role VARCHAR(50) NOT NULL, -- 'creator' or 'subscriber'
  
  CONSTRAINT unique_active_participation UNIQUE (room_id, user_id) 
    WHERE left_at IS NULL
);


-- ──────────────────────────────────────────────────────────────────────────
-- 2. PERFORMANCE INDEXING
-- ──────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_rooms_creator_id ON rooms(creator_id);
CREATE INDEX IF NOT EXISTS idx_rooms_category ON rooms(category);

CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_room_id ON subscriptions(room_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(subscriber_id, room_id) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_active ON room_participants(room_id, user_id) 
  WHERE left_at IS NULL;


-- ──────────────────────────────────────────────────────────────────────────
-- 3. AUTOMATED TRIGGER FUNCTIONS (For Keeping updated_at Clean)
-- ──────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ──────────────────────────────────────────────────────────────────────────
-- 4. UTILITY ACCESS CONTROL FUNCTIONS
-- ──────────────────────────────────────────────────────────────────────────

-- Helper function: Check if user has access to room
CREATE OR REPLACE FUNCTION user_has_room_access(
  p_user_id UUID,
  p_room_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_creator BOOLEAN;
  v_has_active_subscription BOOLEAN;
BEGIN
  -- Check if user is the creator
  SELECT EXISTS(
    SELECT 1 FROM rooms 
    WHERE id = p_room_id AND creator_id = p_user_id
  ) INTO v_is_creator;
  
  IF v_is_creator THEN
    RETURN true;
  END IF;
  
  -- Check if user has active subscription
  SELECT EXISTS(
    SELECT 1 FROM subscriptions
    WHERE subscriber_id = p_user_id
      AND room_id = p_room_id
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > NOW())
  ) INTO v_has_active_subscription;
  
  RETURN v_has_active_subscription;
END;
$$ LANGUAGE plpgsql;


-- ──────────────────────────────────────────────────────────────────────────
-- 5. SECURITY & ROW LEVEL SECURITY (RLS) POLICIES
-- ──────────────────────────────────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- Users Policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid()::text = clerk_id);

-- Rooms Policies
DROP POLICY IF EXISTS "Rooms are publicly readable" ON rooms;
CREATE POLICY "Rooms are publicly readable"
  ON rooms FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Creators can update own rooms" ON rooms;
CREATE POLICY "Creators can update own rooms"
  ON rooms FOR UPDATE
  USING (creator_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Subscriptions Policies
DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (subscriber_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
