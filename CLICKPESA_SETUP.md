# Click Pesa Integration Setup

## Environment Variables

Add these to your `.env.local` file:

```env
# Click Pesa Configuration
CLICKPESA_CLIENT_ID=IDZ49g1Az4IVTgt1hVMWMNH27tGwCHDs
CLICKPESA_API_KEY=your_api_key_here
CLICKPESA_BASE_URL=https://api.clickpesa.com
```

## Getting Your API Key

1. Log in to your [Click Pesa Dashboard](https://dashboard.clickpesa.com)
2. Navigate to **Settings** → **Developers**
3. Find your application or create a new one
4. Click **Manage API Keys**
5. Copy your **API Key** (you'll only see it once, so save it securely)

## API Client ID

Your Client ID is: `IDZ49g1Az4IVTgt1hVMWMNH27tGwCHDs`

## Webhook Configuration

1. In your Click Pesa dashboard, set up a webhook URL:
   - **Development**: `http://localhost:3000/api/webhooks/clickpesa`
   - **Production**: `https://yourdomain.com/api/webhooks/clickpesa`

2. The webhook will receive payment status updates and automatically:
   - Create subscriptions when payments succeed
   - Update subscription status
   - Handle payment failures

## Testing

Click Pesa provides a test environment. Make sure to:
- Use test credentials during development
- Switch to production credentials before going live

## Currency

The application is configured to use **TZS (Tanzanian Shillings)** by default. Prices are stored in the format: `amount:currency` (e.g., `29900:TZS`).


