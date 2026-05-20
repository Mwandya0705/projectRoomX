# Clerk Authentication Setup

## Error: Publishable key not valid

This error occurs when your Clerk keys are placeholders or invalid. Follow these steps to fix it:

## Step 1: Get Your Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application (or create a new one)
3. Go to **API Keys** in the sidebar
4. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

## Step 2: Update .env.local

### Option A: Manual Edit

Open `.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### Option B: Use the Update Script

Run the helper script:

```bash
./update-clerk-keys.sh
```

Follow the prompts to enter your keys.

### Option C: Direct Terminal Update

```bash
# Update publishable key
sed -i '' 's|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY|' .env.local

# Update secret key
sed -i '' 's|CLERK_SECRET_KEY=.*|CLERK_SECRET_KEY=sk_test_YOUR_KEY|' .env.local

# Update webhook secret (optional, for webhook setup)
sed -i '' 's|CLERK_WEBHOOK_SECRET=.*|CLERK_WEBHOOK_SECRET=whsec_YOUR_SECRET|' .env.local
```

## Step 3: Verify Keys

Check that your keys are updated:

```bash
grep CLERK .env.local
```

Make sure the values are NOT placeholders (not `pk_test_...` or `sk_test_...`).

## Step 4: Restart Dev Server

After updating the keys, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 5: Set Up Webhook (Optional but Recommended)

For user sync to work properly:

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - Local: Use ngrok: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Production: `https://your-domain.com/api/webhooks/clerk`
4. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** and add it to `.env.local` as `CLERK_WEBHOOK_SECRET`

## Key Format

Valid Clerk keys should look like:
- Publishable: `pk_test_51AbC123...` (much longer)
- Secret: `sk_test_51XyZ789...` (much longer)
- Webhook: `whsec_...` (much longer)

If your keys are short or just `pk_test_...`, they're placeholders and need to be replaced.

## Troubleshooting

**Still getting "Publishable key not valid"?**
- Make sure there are no extra spaces or quotes around the key
- Verify the key starts with `pk_test_` or `pk_live_`
- Check that you copied the entire key (they're quite long)
- Restart the dev server after updating

**Keys look correct but still not working?**
- Clear Next.js cache: `rm -rf .next`
- Restart the dev server
- Check for typos in the key


