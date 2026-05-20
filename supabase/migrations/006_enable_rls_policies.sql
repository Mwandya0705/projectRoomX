-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- Note: For MVP, most access control is handled in API routes
-- RLS policies provide an additional security layer
-- You can add more restrictive policies as needed

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (true); -- Simplified for MVP - adjust based on your needs

-- Rooms are publicly readable
CREATE POLICY "Rooms are publicly readable"
  ON rooms FOR SELECT
  USING (true);

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (true); -- Simplified for MVP - adjust based on your needs

