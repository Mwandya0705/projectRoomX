# RoomX Project Structure

## Directory Overview

```
RoomX/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── rooms/               # Room management endpoints
│   │   │   ├── [id]/           # Room-specific routes
│   │   │   │   ├── access-token/ # LiveKit token generation
│   │   │   │   └── route.ts
│   │   │   ├── my-room/        # Get user's room
│   │   │   └── route.ts        # List/create rooms
│   │   ├── subscriptions/       # Subscription endpoints
│   │   │   └── checkout/       # Create checkout session
│   │   └── webhooks/           # Webhook handlers
│   │       ├── stripe/         # Stripe webhooks
│   │       └── clerk/          # Clerk webhooks
│   ├── dashboard/              # Dashboard pages
│   │   ├── room/              # Room management
│   │   │   └── create/        # Create room page
│   │   └── page.tsx           # Main dashboard
│   ├── room/                  # Live room pages
│   │   └── [id]/             # Room page by ID
│   ├── subscribe/            # Subscription pages
│   │   └── [creatorId]/      # Subscribe to creator
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
├── components/                # React components
│   ├── LiveRoom.tsx          # Main live room component
│   └── SubscribeButton.tsx   # Subscription button
├── lib/                      # Utility libraries
│   ├── livekit/             # LiveKit utilities
│   │   └── server.ts        # Token generation
│   ├── stripe/              # Stripe utilities
│   │   ├── client.ts        # Client-side Stripe
│   │   └── server.ts        # Server-side Stripe
│   ├── supabase/            # Supabase utilities
│   │   ├── client.ts        # Client-side Supabase
│   │   └── server.ts        # Server-side Supabase
│   ├── types/               # TypeScript types
│   │   └── database.ts      # Database types
│   └── utils/               # Helper functions
│       ├── access-control.ts # Access control logic
│       └── auth.ts          # Authentication helpers
├── supabase/                # Database migrations
│   └── migrations/          # SQL migration files
├── middleware.ts            # Next.js middleware (Clerk)
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies
└── README.md                # Project documentation
```

## File Descriptions

### App Router (`app/`)

#### Pages
- `page.tsx` - Landing page with hero and features
- `layout.tsx` - Root layout with Clerk provider
- `dashboard/page.tsx` - Creator/subscriber dashboard
- `dashboard/room/create/page.tsx` - Room creation form
- `room/[id]/page.tsx` - Live room interface
- `subscribe/[creatorId]/page.tsx` - Subscription checkout

#### API Routes
- `api/rooms/route.ts` - List and create rooms
- `api/rooms/[id]/route.ts` - Get and update room
- `api/rooms/[id]/access-token/route.ts` - Generate LiveKit token
- `api/rooms/my-room/route.ts` - Get user's created room
- `api/subscriptions/checkout/route.ts` - Create Stripe checkout
- `api/webhooks/stripe/route.ts` - Handle Stripe webhooks
- `api/webhooks/clerk/route.ts` - Handle Clerk webhooks

### Components (`components/`)

- `LiveRoom.tsx` - Main live streaming component with LiveKit integration
- `SubscribeButton.tsx` - Button to initiate subscription checkout

### Libraries (`lib/`)

#### LiveKit (`lib/livekit/`)
- `server.ts` - Server-side token generation with access control

#### Stripe (`lib/stripe/`)
- `client.ts` - Client-side Stripe.js initialization
- `server.ts` - Server-side Stripe SDK initialization

#### Supabase (`lib/supabase/`)
- `client.ts` - Client-side Supabase client (for browser)
- `server.ts` - Server-side Supabase admin client (bypasses RLS)

#### Types (`lib/types/`)
- `database.ts` - TypeScript types for database tables

#### Utils (`lib/utils/`)
- `access-control.ts` - Functions to check room access and subscriptions
- `auth.ts` - Authentication helper functions

### Database (`supabase/migrations/`)

- `001_create_users_table.sql` - Users table
- `002_create_rooms_table.sql` - Rooms table
- `003_create_subscriptions_table.sql` - Subscriptions table
- `004_create_room_participants_table.sql` - Room participants table
- `005_create_functions_and_triggers.sql` - Database functions and triggers
- `006_enable_rls_policies.sql` - Row Level Security policies

### Configuration Files

- `middleware.ts` - Next.js middleware for Clerk authentication
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

## Key Patterns

### Server Components vs Client Components

**Server Components (default):**
- Dashboard pages
- Room pages (initial load)
- API routes

**Client Components (`'use client'`):**
- Interactive forms
- LiveKit components
- Real-time UI updates

### API Route Pattern

All API routes follow this pattern:
1. Authenticate user (Clerk)
2. Get user from database
3. Perform action with authorization
4. Return response

### Access Control Pattern

```typescript
// Check access before granting token
const { hasAccess, isCreator } = await checkRoomAccess(roomId, userId)
if (!hasAccess) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 })
}
```

### Database Query Pattern

```typescript
// Server-side queries use admin client (bypasses RLS)
const { data, error } = await supabaseAdmin
  .from('table')
  .select('*')
  .eq('column', value)
```

## Routing Structure

### Public Routes
- `/` - Landing page
- `/sign-in` - Sign in (Clerk)
- `/sign-up` - Sign up (Clerk)

### Protected Routes
- `/dashboard` - User dashboard
- `/dashboard/room/create` - Create room
- `/room/[id]` - Live room (with access control)
- `/subscribe/[creatorId]` - Subscribe to creator

### API Routes
- All API routes are protected by Clerk middleware
- Webhook routes are public (verified by signatures)

## Component Hierarchy

```
RootLayout (ClerkProvider)
  ├── LandingPage
  ├── Dashboard
  │   ├── RoomSection (creator)
  │   └── SubscriptionsSection (subscriber)
  ├── CreateRoomPage
  ├── RoomPage
  │   └── LiveRoom
  │       ├── VideoConference
  │       ├── Chat
  │       └── ParticipantsList
  └── SubscribePage
      └── SubscribeButton
```

## Data Flow

### Creator Flow
1. User signs up/in (Clerk)
2. Clerk webhook syncs user to Supabase
3. User creates room → API creates room in DB + Stripe product
4. User goes to room → API checks access → generates LiveKit token
5. User streams via LiveKit

### Subscriber Flow
1. User signs up/in (Clerk)
2. User clicks subscribe → API creates Stripe checkout session
3. User completes payment → Stripe webhook creates subscription
4. User goes to room → API checks subscription → generates LiveKit token
5. User watches stream via LiveKit

