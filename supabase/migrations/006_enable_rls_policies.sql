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

-- Rooms Policies
CREATE POLICY "Rooms are publicly readable"
  ON rooms FOR SELECT
  USING (true);

CREATE POLICY "Users can create rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own rooms"
  ON rooms FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Room Members Policies
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room members are readable by everyone"
  ON room_members FOR SELECT
  USING (true);

CREATE POLICY "Users can add themselves to rooms"
  ON room_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can add members to their rooms"
  ON room_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = room_id AND rooms.creator_id = auth.uid()
    )
  );

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (true); -- Simplified for MVP

