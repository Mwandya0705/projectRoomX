-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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

-- Create helper function to check room access
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

