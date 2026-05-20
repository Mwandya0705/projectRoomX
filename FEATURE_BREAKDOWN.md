# RoomX MVP Feature Breakdown

## Core Features

### 1. User Authentication
**Priority: P0 (Critical)**

- [x] Email/password registration
- [x] Email/password login
- [x] Social OAuth (Google, GitHub)
- [x] User profile page
- [x] Session management
- [x] Logout functionality
- [x] User sync to Supabase on first login

**Implementation:**
- Use Clerk for all auth functionality
- Webhook to sync user data to Supabase on signup/login
- Middleware to protect routes

---

### 2. Room Management (Creator)
**Priority: P0 (Critical)**

- [x] Create a room (one per creator)
- [x] Edit room details (title, description)
- [x] View room dashboard
- [x] Set subscription price
- [x] View subscriber count
- [x] Delete room (cancels subscriptions)

**Implementation:**
- `/dashboard/room` - Creator room management page
- API: `POST /api/rooms` - Create room
- API: `PATCH /api/rooms/[id]` - Update room
- API: `DELETE /api/rooms/[id]` - Delete room
- API: `GET /api/rooms/my-room` - Get creator's room

---

### 3. Subscription System
**Priority: P0 (Critical)**

- [x] Creator sets subscription price (one-time setup)
- [x] Stripe product/price creation for room
- [x] Checkout page for subscribers
- [x] Stripe Checkout session creation
- [x] Success/cancel redirects
- [x] Webhook to handle subscription events
- [x] Subscription status tracking

**Implementation:**
- `/subscribe/[creatorId]` - Subscription checkout page
- API: `POST /api/subscriptions/checkout` - Create checkout session
- API: `POST /api/webhooks/stripe` - Handle webhooks
- Subscription status checked before room access

**Stripe Events to Handle:**
- `checkout.session.completed` - Subscription created
- `customer.subscription.created` - Subscription activated
- `customer.subscription.updated` - Subscription status changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Payment succeeded
- `invoice.payment_failed` - Payment failed

---

### 4. Live Video & Screen Sharing
**Priority: P0 (Critical)**

- [x] Creator can start/stop streaming
- [x] Creator can share screen
- [x] Creator can enable/disable camera
- [x] Creator can enable/disable microphone
- [x] Subscribers can watch live stream
- [x] Video quality controls (auto)
- [x] Connection status indicators

**Implementation:**
- LiveKit Cloud integration
- Token generation with proper roles:
  - Creator: `publisher` role (can publish video/audio)
  - Subscriber: `subscriber` role (can only consume)
- Room name: `room:{roomId}`
- Client-side: LiveKit React hooks for video rendering

---

### 5. Real-time Chat
**Priority: P0 (Critical)**

- [x] Send messages in room
- [x] Display message history
- [x] Show sender name/avatar
- [x] Timestamp on messages
- [x] Scroll to latest message
- [x] Message character limit (500 chars)

**Implementation:**
- LiveKit data channels for chat
- Store messages in LiveKit room (ephemeral, not persisted)
- Chat UI component with message list
- Creator can participate in chat

---

### 6. Member List
**Priority: P0 (Critical)**

- [x] Display current room participants
- [x] Show participant count
- [x] Show participant names/avatars
- [x] Distinguish creator from subscribers
- [x] Real-time updates (join/leave)

**Implementation:**
- LiveKit participant tracking
- Display list in sidebar or overlay
- Update in real-time via LiveKit events

---

### 7. Access Control
**Priority: P0 (Critical)**

- [x] Verify subscription before generating LiveKit token
- [x] Room owner always has access
- [x] Redirect non-subscribers to subscribe page
- [x] Check subscription status on every room join
- [x] Handle expired subscriptions gracefully

**Implementation:**
- Middleware: `checkRoomAccess(roomId, userId)`
- API: `GET /api/rooms/[id]/access-token` - Returns token only if access granted
- Frontend: Redirect to subscribe page if no access

---

### 8. Pricing Tiers
**Priority: P0 (Critical)**

**MVP Pricing Model:**
- **Free Viewer:** Can see room preview (title, description, subscriber count), but cannot join
- **Paid Subscriber:** Full access to live room, chat, and member list

**Future (Not MVP):**
- Multiple pricing tiers per room
- Free trial periods
- Discount codes

**Implementation:**
- Single subscription price per room
- Creator sets price during room creation (can edit later)
- Price stored as Stripe Price ID in database

---

## User Flows

### Creator Flow:
1. Sign up / Log in
2. Navigate to Dashboard
3. Create Room (if not exists)
4. Set subscription price
5. Start streaming from dashboard
6. View subscriber count
7. Manage room settings

### Subscriber Flow:
1. Discover room (via creator link or search)
2. View room preview (if not subscribed)
3. Click "Subscribe" button
4. Complete Stripe Checkout
5. Redirected to room after successful payment
6. Watch live stream
7. Participate in chat
8. View member list

### Access Denied Flow:
1. User tries to access `/room/[id]`
2. System checks subscription status
3. If no access: Redirect to `/subscribe/[creatorId]` with message
4. If access granted: Generate token and load room

---

## Non-Features (Explicitly Excluded from MVP)

- ❌ Recordings or replays
- ❌ Multiple room types
- ❌ File or resource uploads
- ❌ AI features
- ❌ Mobile apps
- ❌ Advanced analytics
- ❌ Moderation systems
- ❌ Chat message history persistence
- ❌ Multiple subscription tiers per room
- ❌ Room scheduling
- ❌ Notifications system

---

## UI/UX Requirements

### Desktop-First Design:
- Optimized for 1920x1080 minimum
- Side-by-side layouts (video + chat)
- Keyboard shortcuts (future consideration)
- Large, clickable buttons
- Clear visual hierarchy

### Key Pages:

1. **Landing Page (`/`)**
   - Hero section
   - Features overview
   - Call-to-action buttons
   - Pricing information

2. **Dashboard (`/dashboard`)**
   - Creator: Room management
   - Subscriber: Subscribed rooms list
   - Navigation to room

3. **Room Page (`/room/[id]`)**
   - Video player (large, centered)
   - Chat sidebar
   - Member list
   - Controls for creator (start/stop stream, screen share toggle)

4. **Subscribe Page (`/subscribe/[creatorId]`)**
   - Creator info
   - Subscription price
   - Stripe Checkout button
   - Terms of service link

5. **Profile Page (`/profile`)**
   - User information
   - Subscription management
   - Account settings

---

## Technical Implementation Priorities

### Phase 1: Foundation (Days 1-3)
- Project setup
- Authentication
- Database schema
- Basic UI components

### Phase 2: Core Features (Days 4-7)
- Room management
- LiveKit integration
- Basic streaming UI

### Phase 3: Monetization (Days 8-10)
- Stripe integration
- Subscription flows
- Access control

### Phase 4: Polish (Days 11-12)
- Chat system
- Member list
- Error handling
- Testing
- Deployment

---

## Success Metrics (Post-MVP)

Once MVP is complete, consider tracking:
- Number of active creators
- Number of active subscribers
- Average session duration
- Subscription conversion rate
- Revenue per creator

These can be added later as analytics features.

