# RoomX Database Schema

## Supabase PostgreSQL Tables

### 1. `users` Table
Stores user profile information (synced with Clerk).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
```

### 2. `rooms` Table
Stores creator room information.

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_live BOOLEAN DEFAULT false,
  subscription_price_id VARCHAR(255), -- Stripe Price ID
  subscription_product_id VARCHAR(255), -- Stripe Product ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT one_room_per_creator UNIQUE (creator_id)
);

CREATE INDEX idx_rooms_creator_id ON rooms(creator_id);
CREATE INDEX idx_rooms_subscription_product_id ON rooms(subscription_product_id);
```

### 3. `subscriptions` Table
Stores active subscriptions between users and creators.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due, etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_active_subscription UNIQUE (subscriber_id, room_id, status)
    WHERE status = 'active'
);

CREATE INDEX idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX idx_subscriptions_room_id ON subscriptions(room_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_active ON subscriptions(subscriber_id, room_id) 
  WHERE status = 'active';
```

### 4. `room_participants` Table (Optional)
Tracks current participants in a room session. Can be derived from LiveKit, but useful for analytics.

```sql
CREATE TABLE room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  role VARCHAR(50) NOT NULL, -- 'creator' or 'subscriber'
  
  CONSTRAINT unique_active_participation UNIQUE (room_id, user_id) 
    WHERE left_at IS NULL
);

CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX idx_room_participants_active ON room_participants(room_id, user_id) 
  WHERE left_at IS NULL;
```

## Database Functions & Triggers

### Update `updated_at` timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Helper function: Check if user has access to room

```sql
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
```

## Row Level Security (RLS) Policies

Enable RLS on all tables for security:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid()::text = clerk_id);

-- Rooms are publicly readable
CREATE POLICY "Rooms are publicly readable"
  ON rooms FOR SELECT
  USING (true);

-- Users can update their own rooms
CREATE POLICY "Creators can update own rooms"
  ON rooms FOR UPDATE
  USING (creator_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (subscriber_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Note: For MVP, we'll handle most access control in API routes
-- RLS provides additional security layer
```

## Migration File Structure

Create these migrations in order:

1. `001_create_users_table.sql`
2. `002_create_rooms_table.sql`
3. `003_create_subscriptions_table.sql`
4. `004_create_room_participants_table.sql`
5. `005_create_functions_and_triggers.sql`
6. `006_enable_rls_policies.sql`

## Sample Queries

### Get user's created room
```sql
SELECT r.* FROM rooms r
JOIN users u ON r.creator_id = u.id
WHERE u.clerk_id = $1;
```

### Check subscription status
```sql
SELECT s.* FROM subscriptions s
JOIN users u ON s.subscriber_id = u.id
WHERE u.clerk_id = $1 
  AND s.room_id = $2
  AND s.status = 'active'
  AND (s.current_period_end IS NULL OR s.current_period_end > NOW());
```

### Get all active subscribers for a room
```sql
SELECT u.* FROM users u
JOIN subscriptions s ON s.subscriber_id = u.id
WHERE s.room_id = $1
  AND s.status = 'active'
  AND (s.current_period_end IS NULL OR s.current_period_end > NOW());
```

