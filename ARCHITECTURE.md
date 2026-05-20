# RoomX Architecture & Design

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Next.js Frontend │  │   LiveKit Client │                │
│  │   (App Router)    │  │   (WebRTC)       │                │
│  └──────────────────┘  └──────────────────┘                │
└────────────┬─────────────────────────┬──────────────────────┘
             │                         │
             │ HTTPS/REST              │ WebRTC
             │                         │
┌────────────▼─────────────────────────▼──────────────────────┐
│                    Vercel (Edge Network)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Next.js API Routes & Server Actions           │ │
│  │  • Authentication middleware                           │ │
│  │  • Room management endpoints                           │ │
│  │  • Access control logic                                │ │
│  │  • Stripe webhook handlers                             │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────┬─────────────────────────────────────────────────┘
             │
             │ API Calls
             │
┌────────────▼─────────────────────────────────────────────────┐
│                    External Services                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Clerk   │  │  Stripe  │  │ LiveKit  │  │ Supabase │    │
│  │   Auth   │  │ Payments │  │  Cloud   │  │ Database │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Core System Components

### 1. Frontend (Next.js App Router)
- **Pages:**
  - `/` - Landing page
  - `/dashboard` - Creator/subscriber dashboard
  - `/room/[id]` - Live room interface
  - `/subscribe/[creatorId]` - Subscription checkout
  - `/auth/*` - Authentication flows (handled by Clerk)

### 2. Backend Services
- **Next.js API Routes:**
  - `/api/rooms/*` - Room CRUD operations
  - `/api/rooms/[id]/access-token` - LiveKit access token generation
  - `/api/subscriptions/*` - Subscription management
  - `/api/webhooks/stripe` - Stripe webhook handler
  - `/api/users/[id]/room` - Get user's created room

### 3. Database Schema (Supabase/PostgreSQL)

**Tables:**
- `users` - User profiles (synced with Clerk)
- `rooms` - Creator rooms
- `subscriptions` - Active subscriptions
- `room_participants` - Current session participants (optional, can use LiveKit)

### 4. Authentication Flow (Clerk)
- Email/password registration
- Social OAuth (Google, GitHub, etc.)
- Session management
- User metadata stored in Supabase

### 5. Live Streaming (LiveKit Cloud)
- Creator publishes video/screen share
- Subscribers consume stream
- Real-time chat via LiveKit data channels
- Access tokens generated server-side with subscription verification

### 6. Payments (Stripe Subscriptions)
- Subscription product creation
- Checkout flow
- Webhook handling for subscription events
- Access control based on subscription status

## Data Flow: Room Creation & Access

### Creator Flow:
1. User authenticates via Clerk
2. User creates a room via `/api/rooms` (POST)
3. Room record created in Supabase
4. Stripe product/price created for subscription
5. Creator navigates to `/room/[id]`
6. Server generates LiveKit token with "publisher" role
7. Creator starts streaming

### Subscriber Flow:
1. User discovers creator/room
2. User clicks subscribe → `/subscribe/[creatorId]`
3. Stripe Checkout session created
4. User completes payment
5. Webhook creates subscription record in database
6. User navigates to `/room/[id]`
7. Server verifies subscription → generates LiveKit token with "subscriber" role
8. User joins room and watches stream

### Access Control:
- Room owner: Always has access (publisher role)
- Active subscribers: Have access (subscriber role)
- Others: Redirected to subscribe page

## Security Considerations

1. **Authentication:**
   - All API routes protected by Clerk middleware
   - User identity verified on every request

2. **Access Control:**
   - Subscription status checked before LiveKit token generation
   - Room owner verified via database query
   - Token expiration set appropriately (1-2 hours)

3. **API Security:**
   - Rate limiting on API routes (Vercel Edge Config or Upstash)
   - Input validation and sanitization
   - SQL injection prevention (Supabase uses parameterized queries)

4. **Payment Security:**
   - Stripe webhooks verified using webhook secret
   - Subscription status always verified server-side
   - Never trust client-side subscription claims

5. **LiveKit Security:**
   - Access tokens signed with API secret (never exposed)
   - Tokens include room name and user permissions
   - Room names should be non-guessable (use UUIDs)

## Scalability Considerations (MVP → Future)

### MVP Stage:
- Single database instance (Supabase free tier)
- LiveKit Cloud (auto-scales)
- Vercel serverless (auto-scales)
- No caching layer needed initially

### Future Optimizations:
- Redis for session/rate limiting cache
- CDN for static assets (Vercel Edge Network)
- Database read replicas if needed
- Room analytics aggregation

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14+ (App Router) | UI framework |
| Styling | Tailwind CSS | Utility-first CSS |
| Authentication | Clerk | User auth & session management |
| Database | Supabase (PostgreSQL) | Data persistence |
| Live Streaming | LiveKit Cloud | WebRTC streaming & chat |
| Payments | Stripe Subscriptions | Payment processing |
| Hosting | Vercel | Frontend & API hosting |
| Type Safety | TypeScript | Type checking |

## Environment Variables Required

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LiveKit
NEXT_PUBLIC_LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Build Order (Recommended)

1. **Project Setup** (Day 1)
   - Initialize Next.js project
   - Configure Tailwind CSS
   - Set up TypeScript
   - Create folder structure

2. **Authentication** (Day 1-2)
   - Integrate Clerk
   - Create auth pages
   - Set up middleware
   - User profile sync to Supabase

3. **Database** (Day 2)
   - Create Supabase project
   - Set up database schema
   - Create migrations
   - Set up database client

4. **Room Management** (Day 3-4)
   - Room creation API
   - Room listing/display
   - Room owner dashboard
   - Basic room UI

5. **LiveKit Integration** (Day 5-6)
   - Set up LiveKit Cloud project
   - Token generation API
   - Basic streaming UI
   - Screen share implementation

6. **Subscription System** (Day 7-8)
   - Stripe integration
   - Product/price creation
   - Checkout flow
   - Webhook handlers

7. **Access Control** (Day 8-9)
   - Subscription verification
   - Token generation with access control
   - Room access middleware
   - Redirect logic

8. **Chat System** (Day 9-10)
   - LiveKit data channel setup
   - Chat UI component
   - Message display

9. **Polish & Testing** (Day 10-12)
   - Member list display
   - Error handling
   - Loading states
   - Basic testing
   - Deploy to Vercel

## Trade-offs & Decisions

1. **Clerk vs Auth.js:**
   - **Chosen: Clerk** - Faster setup, better social OAuth, managed service
   - **Trade-off:** Vendor lock-in vs. time saved

2. **LiveKit Cloud vs Self-hosted:**
   - **Chosen: Cloud** - No infrastructure management, scales automatically
   - **Trade-off:** Cost vs. complexity reduction

3. **Supabase vs Prisma + PostgreSQL:**
   - **Chosen: Supabase** - Simpler setup, built-in auth sync, real-time capabilities if needed later
   - **Trade-off:** Less flexibility vs. faster development

4. **Stripe Subscriptions vs One-time payments:**
   - **Chosen: Subscriptions** - Built-in recurring billing, customer portal, better for creators
   - **Trade-off:** More complex webhook handling vs. recurring revenue

5. **No recording/replay:**
   - **Decision:** MVP focuses on live experience only
   - **Future:** Can add recording later using LiveKit E2E recording

