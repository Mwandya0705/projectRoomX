export type User = {
  id: string
  clerk_id: string
  email: string
  name: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export type Room = {
  id: string
  creator_id: string
  title: string
  description: string | null
  is_live: boolean
  subscription_price_id: string | null
  subscription_product_id: string | null
  created_at: string
  updated_at: string
}

export type Subscription = {
  id: string
  subscriber_id: string
  room_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export type RoomParticipant = {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  left_at: string | null
  role: 'creator' | 'subscriber'
}

