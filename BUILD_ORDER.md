# RoomX Build Order Guide

This document provides a step-by-step guide for building the RoomX MVP as a solo developer.

## Phase 1: Project Setup (Day 1)

### 1.1 Initialize Project
- [x] Create Next.js project structure
- [x] Install dependencies (`npm install`)
- [x] Configure TypeScript
- [x] Set up Tailwind CSS
- [x] Create folder structure

### 1.2 Configure Environment Variables
- [ ] Create `.env.local` file
- [ ] Get Clerk API keys
- [ ] Get Supabase credentials
- [ ] Get LiveKit credentials
- [ ] Get Stripe API keys

### 1.3 Version Control
- [ ] Initialize Git repository
- [ ] Create `.gitignore`
- [ ] Make initial commit

---

## Phase 2: Authentication Setup (Day 1-2)

### 2.1 Clerk Integration
- [ ] Install Clerk SDK (`@clerk/nextjs`)
- [ ] Set up Clerk application
- [ ] Configure authentication providers (Email, Google, GitHub)
- [ ] Set up middleware for route protection
- [ ] Test sign-up and sign-in flows

### 2.2 User Sync
- [ ] Set up Clerk webhook endpoint (`/api/webhooks/clerk`)
- [ ] Configure webhook in Clerk dashboard
- [ ] Test user creation/update events
- [ ] Verify user data syncs to Supabase

---

## Phase 3: Database Setup (Day 2)

### 3.1 Supabase Setup
- [ ] Create Supabase project
- [ ] Run database migrations in order:
  1. `001_create_users_table.sql`
  2. `002_create_rooms_table.sql`
  3. `003_create_subscriptions_table.sql`
  4. `004_create_room_participants_table.sql`
  5. `005_create_functions_and_triggers.sql`
  6. `006_enable_rls_policies.sql`
- [ ] Verify tables are created
- [ ] Test database connection

### 3.2 Database Utilities
- [x] Create Supabase client utilities
- [x] Set up database types
- [x] Test database queries

---

## Phase 4: Core UI & Navigation (Day 2-3)

### 4.1 Landing Page
- [x] Create landing page (`/`)
- [ ] Add hero section
- [ ] Add features section
- [ ] Add call-to-action buttons
- [ ] Test navigation

### 4.2 Dashboard
- [x] Create dashboard layout
- [ ] Add creator room section
- [ ] Add subscriber rooms section
- [ ] Add navigation to room management
- [ ] Test authentication redirects

---

## Phase 5: Room Management (Day 3-4)

### 5.1 Room Creation
- [x] Create room creation page (`/dashboard/room/create`)
- [x] Create room creation API (`POST /api/rooms`)
- [ ] Integrate Stripe product/price creation
- [ ] Test room creation flow
- [ ] Handle errors gracefully

### 5.2 Room Display
- [x] Create room detail API (`GET /api/rooms/[id]`)
- [x] Create "my room" API (`GET /api/rooms/my-room`)
- [ ] Create room edit page (optional for MVP)
- [ ] Test room retrieval

### 5.3 Room List
- [x] Create room listing API (`GET /api/rooms`)
- [ ] Create room discovery page (optional for MVP)
- [ ] Test room listing

---

## Phase 6: LiveKit Integration (Day 5-6)

### 6.1 LiveKit Setup
- [ ] Create LiveKit Cloud project
- [ ] Get API key and secret
- [ ] Configure LiveKit server settings
- [ ] Test LiveKit connection

### 6.2 Token Generation
- [x] Create LiveKit token generation API (`GET /api/rooms/[id]/access-token`)
- [x] Implement access control in token generation
- [ ] Test token generation for creators
- [ ] Test token generation for subscribers

### 6.3 Live Room Component
- [x] Create LiveRoom component
- [ ] Install LiveKit React components
- [ ] Set up video/audio streaming
- [ ] Test creator streaming (camera, mic, screen share)
- [ ] Test subscriber viewing

### 6.4 Basic Controls
- [ ] Add start/stop streaming button
- [ ] Add camera toggle
- [ ] Add microphone toggle
- [ ] Add screen share toggle
- [ ] Test all controls

---

## Phase 7: Subscription System (Day 7-8)

### 7.1 Stripe Setup
- [ ] Create Stripe account
- [ ] Get API keys
- [ ] Configure Stripe dashboard
- [ ] Set up webhooks endpoint (`/api/webhooks/stripe`)
- [ ] Test webhook delivery

### 7.2 Subscription Checkout
- [x] Create subscription checkout page (`/subscribe/[creatorId]`)
- [x] Create checkout session API (`POST /api/subscriptions/checkout`)
- [ ] Integrate Stripe Checkout
- [ ] Test checkout flow
- [ ] Handle success/cancel redirects

### 7.3 Webhook Handlers
- [x] Handle `checkout.session.completed`
- [x] Handle `customer.subscription.created`
- [x] Handle `customer.subscription.updated`
- [x] Handle `customer.subscription.deleted`
- [x] Handle `invoice.payment_succeeded`
- [x] Handle `invoice.payment_failed`
- [ ] Test all webhook events

### 7.4 Subscription Status
- [x] Implement subscription verification
- [ ] Test subscription status checks
- [ ] Handle expired subscriptions
- [ ] Handle canceled subscriptions

---

## Phase 8: Access Control (Day 8-9)

### 8.1 Access Verification
- [x] Create access control utilities
- [x] Implement room access checks
- [ ] Test creator access
- [ ] Test subscriber access
- [ ] Test non-subscriber access (should redirect)

### 8.2 Room Access API
- [x] Protect room access token endpoint
- [ ] Test access control in API routes
- [ ] Add proper error messages
- [ ] Test redirects to subscribe page

---

## Phase 9: Chat System (Day 9-10)

### 9.1 Chat Integration
- [x] Set up LiveKit data channels for chat
- [ ] Create chat UI component
- [ ] Display message history
- [ ] Add message input
- [ ] Test chat functionality

### 9.2 Chat Features
- [ ] Add sender name/avatar to messages
- [ ] Add timestamps to messages
- [ ] Add message character limit (500 chars)
- [ ] Auto-scroll to latest message
- [ ] Test with multiple users

---

## Phase 10: Member List (Day 10)

### 10.1 Participant Display
- [ ] Get participant list from LiveKit
- [ ] Display participant names/avatars
- [ ] Distinguish creator from subscribers
- [ ] Show participant count
- [ ] Update list in real-time

---

## Phase 11: Polish & Testing (Day 11-12)

### 11.1 Error Handling
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add error messages
- [ ] Test error scenarios

### 11.2 UI/UX Improvements
- [ ] Improve responsive design (desktop-first)
- [ ] Add loading spinners
- [ ] Add empty states
- [ ] Improve typography and spacing
- [ ] Test all user flows

### 11.3 Testing
- [ ] Test creator flow (create room → stream)
- [ ] Test subscriber flow (subscribe → watch)
- [ ] Test access control
- [ ] Test payment flow
- [ ] Test chat functionality
- [ ] Test with multiple concurrent users

### 11.4 Performance
- [ ] Optimize images
- [ ] Check bundle size
- [ ] Test page load times
- [ ] Optimize API calls

---

## Phase 12: Deployment (Day 12)

### 12.1 Pre-Deployment
- [ ] Review all environment variables
- [ ] Test in production mode locally
- [ ] Run build command (`npm run build`)
- [ ] Fix any build errors
- [ ] Review security considerations

### 12.2 Vercel Deployment
- [ ] Create Vercel project
- [ ] Connect GitHub repository
- [ ] Add environment variables
- [ ] Deploy to staging
- [ ] Test staging deployment

### 12.3 Post-Deployment
- [ ] Configure custom domain (optional)
- [ ] Set up production webhooks (Clerk, Stripe)
- [ ] Test production deployment
- [ ] Monitor for errors
- [ ] Document deployment process

---

## Daily Checklist

Use this checklist to track your daily progress:

### Day 1
- [ ] Project setup complete
- [ ] Authentication working
- [ ] Basic UI structure in place

### Day 2
- [ ] Database schema created
- [ ] User sync working
- [ ] Dashboard page functional

### Day 3-4
- [ ] Room creation working
- [ ] Room management APIs complete
- [ ] Basic room UI complete

### Day 5-6
- [ ] LiveKit integrated
- [ ] Live streaming working
- [ ] Basic controls functional

### Day 7-8
- [ ] Stripe integrated
- [ ] Subscription checkout working
- [ ] Webhooks handling events

### Day 9-10
- [ ] Access control implemented
- [ ] Chat system working
- [ ] Member list displaying

### Day 11-12
- [ ] Error handling complete
- [ ] UI polished
- [ ] Testing complete
- [ ] Deployed to production

---

## Quick Reference

### Key Endpoints

**Authentication:**
- Sign up: `/sign-up`
- Sign in: `/sign-in`
- Dashboard: `/dashboard`

**Rooms:**
- Create room: `/dashboard/room/create`
- View room: `/room/[id]`
- Subscribe: `/subscribe/[creatorId]`

**APIs:**
- Create room: `POST /api/rooms`
- Get room: `GET /api/rooms/[id]`
- Get access token: `GET /api/rooms/[id]/access-token`
- Checkout: `POST /api/subscriptions/checkout`
- Webhooks: `POST /api/webhooks/stripe`, `POST /api/webhooks/clerk`

### Testing Accounts

Create test accounts for:
- Creator (with room)
- Subscriber (subscribed to room)
- Non-subscriber (for access control testing)

### Common Issues & Solutions

1. **Clerk webhook not working**: Check webhook secret and URL
2. **Stripe webhook not working**: Verify webhook secret and endpoint URL
3. **LiveKit connection failed**: Check API key, secret, and URL
4. **Database queries failing**: Verify Supabase credentials and connection
5. **Access denied errors**: Check subscription status in database

---

## Next Steps After MVP

Once MVP is complete, consider:
1. Analytics dashboard for creators
2. Email notifications
3. Better error messages and UI feedback
4. Room scheduling (future feature)
5. Multiple pricing tiers
6. Creator profile pages
7. Search/discovery features
8. Mobile responsiveness improvements

