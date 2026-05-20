-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_live BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  capacity SMALLINT,
  subscription_price_id VARCHAR(255),
  subscription_product_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT one_room_per_creator UNIQUE (creator_id)
);

CREATE INDEX IF NOT EXISTS idx_rooms_admin_id ON rooms(admin_id);

CREATE INDEX IF NOT EXISTS idx_rooms_creator_id ON rooms(creator_id);
CREATE INDEX IF NOT EXISTS idx_rooms_subscription_product_id ON rooms(subscription_product_id);

