# RoomX Setup Guide

This guide will help you set up RoomX from scratch. Follow these steps in order.

## Prerequisites

- Node.js 18+ and npm installed
- Git installed
- Accounts for:
  - Clerk (authentication)
  - Supabase (database)
  - LiveKit Cloud (live streaming)
  - Stripe (payments)
  - Vercel (hosting, optional for local dev)

## Step 1: Clone and Install

```bash
# If you haven't already, navigate to your project directory
cd RoomX

# Install dependencies
npm install
```

## Step 2: Set Up Clerk (Authentication)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application (or use existing)
3. Configure authentication providers:
   - Enable Email/Password
   - Enable OAuth providers (Google, GitHub, etc.) if desired
4. Copy your API keys:
   - Publishable Key (starts with `pk_test_` or `pk_live_`)
   - Secret Key (starts with `sk_test_` or `sk_live_`)
5. Set up webhook:
   - Go to Webhooks section
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk` (or use ngrok for local dev)
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook signing secret (starts with `whsec_`)

## Step 3: Set Up Supabase (Database)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Wait for project to be ready (takes a few minutes)
4. Go to SQL Editor
5. Run the migrations in order:
   - `supabase/migrations/001_create_users_table.sql`
   - `supabase/migrations/002_create_rooms_table.sql`
   - `supabase/migrations/003_create_subscriptions_table.sql`
   - `supabase/migrations/004_create_room_participants_table.sql`
   - `supabase/migrations/005_create_functions_and_triggers.sql`
   - `supabase/migrations/006_enable_rls_policies.sql`
6. Get your credentials:
   - Go to Settings → API
   - Copy Project URL
   - Copy `anon` `public` key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Copy `service_role` `secret` key (for `SUPABASE_SERVICE_ROLE_KEY`)

## Step 4: Set Up LiveKit Cloud (Live Streaming)

1. Go to [LiveKit Cloud](https://cloud.livekit.io/)
2. Create a new project
3. Get your credentials:
   - Project URL (starts with `wss://`)
   - API Key
   - API Secret
4. Note: LiveKit Cloud has a free tier for testing

## Step 5: Set Up Stripe (Payments)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys:
   - Go to Developers → API keys
   - Copy Publishable key (starts with `pk_test_` or `pk_live_`)
   - Copy Secret key (starts with `sk_test_` or `sk_live_`)
3. Set up webhook:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-domain.com/api/webhooks/stripe` (or use ngrok for local dev)
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret (starts with `whsec_`)

## Step 6: Configure Environment Variables

1. Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LiveKit Cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Replace all placeholder values with your actual credentials

## Step 7: Local Development with Webhooks

For local development, you'll need to expose your local server to receive webhooks:

### Option A: Using ngrok (Recommended)

1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com/)
2. Start your Next.js dev server: `npm run dev`
3. In another terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update webhook URLs in Clerk and Stripe to use this ngrok URL:
   - Clerk: `https://abc123.ngrok.io/api/webhooks/clerk`
   - Stripe: `https://abc123.ngrok.io/api/webhooks/stripe`
6. Update `NEXT_PUBLIC_APP_URL` in `.env.local` to your ngrok URL

### Option B: Using Stripe CLI (For Stripe webhooks only)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Copy the webhook signing secret and update `STRIPE_WEBHOOK_SECRET` in `.env.local`
4. Note: You'll still need ngrok for Clerk webhooks

## Step 8: Run the Application

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 9: Test the Application

### Test Authentication
1. Click "Get Started" or "Sign In"
2. Create a new account
3. Verify you're redirected to `/dashboard`
4. Check Supabase `users` table to see if user was synced

### Test Room Creation
1. Go to Dashboard
2. Click "Create Room"
3. Fill in room details and set a price (e.g., $29.99/month)
4. Submit the form
5. Verify room appears in dashboard
6. Check Stripe dashboard to see if product/price were created

### Test Live Streaming
1. Click "Go to Room" from dashboard
2. Allow camera/microphone permissions
3. Click "Share Screen" to start screen sharing
4. Verify video appears in the room

### Test Subscription Flow
1. Open an incognito window
2. Sign up with a different account
3. Navigate to a creator's room URL (e.g., `/room/[room-id]`)
4. You should be redirected to subscribe page
5. Click "Subscribe Now"
6. Use Stripe test card: `4242 4242 4242 4242`
7. Complete checkout
8. Verify you're redirected to the room
9. Check Supabase `subscriptions` table to see subscription record

## Step 10: Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Add all environment variables from `.env.local`
6. Deploy!

### Post-Deployment

1. Update webhook URLs in Clerk and Stripe to use your production domain:
   - Clerk: `https://your-domain.com/api/webhooks/clerk`
   - Stripe: `https://your-domain.com/api/webhooks/stripe`
2. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to your production URL
3. Test the production deployment

## Troubleshooting

### Clerk Webhook Not Working
- Verify webhook URL is correct
- Check webhook secret matches
- Look at Clerk dashboard → Webhooks → Recent events for errors
- Check server logs for webhook errors

### Stripe Webhook Not Working
- Verify webhook URL is correct
- Check webhook secret matches
- Use Stripe CLI to test: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check Stripe dashboard → Webhooks → Recent events
- Check server logs for webhook errors

### LiveKit Connection Failed
- Verify API key, secret, and URL are correct
- Check browser console for errors
- Ensure LiveKit Cloud project is active
- Check network connectivity

### Database Queries Failing
- Verify Supabase credentials are correct
- Check if migrations were run successfully
- Verify RLS policies are set up correctly
- Check Supabase dashboard for connection issues

### Access Denied Errors
- Verify subscription exists in database
- Check subscription status is "active"
- Verify subscription period hasn't expired
- Check if user is the room creator

## Next Steps

- Review the [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Review the [FEATURE_BREAKDOWN.md](./FEATURE_BREAKDOWN.md) for feature list
- Review the [BUILD_ORDER.md](./BUILD_ORDER.md) for development workflow
- Review the [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for database structure

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error logs in browser console and server logs
3. Verify all environment variables are set correctly
4. Ensure all services (Clerk, Supabase, LiveKit, Stripe) are properly configured


