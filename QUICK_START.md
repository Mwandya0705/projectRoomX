# RoomX Quick Start

## What's Been Built

RoomX is a complete MVP for subscription-based live rooms. Here's what's included:

### ✅ Core Features Implemented

1. **Authentication (Clerk)**
   - Email/password and social login
   - User sync to Supabase via webhooks
   - Protected routes with middleware

2. **Room Management**
   - Creators can create one room
   - Set subscription price
   - Edit room details
   - View subscriber count

3. **Live Streaming (LiveKit)**
   - Screen sharing
   - Camera and microphone
   - Real-time video/audio streaming
   - Role-based access (publisher/subscriber)

4. **Subscription System (Stripe)**
   - Checkout flow
   - Recurring subscriptions
   - Webhook handling for subscription events
   - Access control based on subscription status

5. **Real-time Chat**
   - LiveKit data channels
   - Message display
   - Participant list

6. **Access Control**
   - Subscription verification
   - Creator always has access
   - Non-subscribers redirected to subscribe page

### 📁 Project Structure

```
RoomX/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── rooms/        # Room management
│   │   ├── subscriptions/ # Subscription checkout
│   │   └── webhooks/     # Clerk & Stripe webhooks
│   ├── dashboard/        # Dashboard pages
│   ├── room/            # Live room pages
│   └── subscribe/       # Subscription pages
├── components/          # React components
│   ├── LiveRoom.tsx    # Main live room component
│   └── SubscribeButton.tsx
├── lib/                 # Utilities
│   ├── livekit/        # LiveKit token generation
│   ├── stripe/         # Stripe client/server
│   ├── supabase/       # Supabase client/server
│   ├── types/          # TypeScript types
│   └── utils/          # Helper functions
├── supabase/
│   └── migrations/     # Database migrations
└── Documentation files
```

## Next Steps

### 1. Set Up Services

Follow the [SETUP_GUIDE.md](./SETUP_GUIDE.md) to configure:
- Clerk (authentication)
- Supabase (database)
- LiveKit Cloud (streaming)
- Stripe (payments)

### 2. Run Database Migrations

In Supabase SQL Editor, run these migrations in order:
1. `001_create_users_table.sql`
2. `002_create_rooms_table.sql`
3. `003_create_subscriptions_table.sql`
4. `004_create_room_participants_table.sql`
5. `005_create_functions_and_triggers.sql`
6. `006_enable_rls_policies.sql`

### 3. Configure Environment Variables

Create `.env.local` with all required keys (see SETUP_GUIDE.md)

### 4. Test Locally

```bash
npm install
npm run dev
```

### 5. Set Up Webhooks (for local dev)

Use ngrok to expose local server:
```bash
ngrok http 3000
```

Update webhook URLs in Clerk and Stripe dashboards.

### 6. Deploy

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

## Key Files to Review

- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Database Schema**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **Features**: [FEATURE_BREAKDOWN.md](./FEATURE_BREAKDOWN.md)
- **Build Order**: [BUILD_ORDER.md](./BUILD_ORDER.md)
- **Setup Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## Testing Checklist

- [ ] User can sign up and sign in
- [ ] User data syncs to Supabase
- [ ] Creator can create a room
- [ ] Stripe product/price created
- [ ] Creator can start streaming
- [ ] Subscriber can subscribe
- [ ] Subscriber can watch stream
- [ ] Chat messages work
- [ ] Participant list updates
- [ ] Access control works (non-subscribers redirected)

## Common Issues

**Webhook not working?**
- Check webhook URL is correct
- Verify webhook secret matches
- Use ngrok for local development

**Can't connect to LiveKit?**
- Verify API key, secret, and URL
- Check browser console for errors

**Subscription not working?**
- Check Stripe webhook is configured
- Verify subscription record in database
- Check subscription status is "active"

## Support

Review the documentation files for detailed information:
- Architecture and design decisions
- Database schema and queries
- API endpoints and usage
- Development workflow


