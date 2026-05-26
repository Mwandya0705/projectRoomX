import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/webhooks/resend
 *
 * Resend calls this URL to notify you about email delivery events.
 * Paste this URL in your Resend dashboard → Webhooks:
 *   http://localhost:3000/api/webhooks/resend  (dev)
 *   https://yourdomain.com/api/webhooks/resend  (production)
 *
 * Events handled:
 *   - email.sent         → email was accepted by Resend
 *   - email.delivered    → email was delivered to the recipient's inbox
 *   - email.delivery_delayed → delivery is delayed (e.g. greylisting)
 *   - email.bounced      → email bounced (bad address)
 *   - email.complained   → recipient marked email as spam
 *   - email.opened       → recipient opened the email (requires tracking)
 *   - email.clicked      → recipient clicked a link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { type, data } = body

    console.log(`[Resend Webhook] Event: ${type}`)

    switch (type) {
      case 'email.sent':
        console.log(`[Resend] ✅ Email sent — ID: ${data?.email_id} | To: ${data?.to}`)
        break

      case 'email.delivered':
        console.log(`[Resend] 📬 Email delivered — ID: ${data?.email_id} | To: ${data?.to}`)
        break

      case 'email.delivery_delayed':
        console.warn(`[Resend] ⏳ Delivery delayed — ID: ${data?.email_id} | To: ${data?.to}`)
        break

      case 'email.bounced':
        console.error(`[Resend] ❌ Email bounced — ID: ${data?.email_id} | To: ${data?.to} | Reason: ${data?.bounce?.message}`)
        break

      case 'email.complained':
        console.warn(`[Resend] ⚠️ Spam complaint — ID: ${data?.email_id} | To: ${data?.to}`)
        break

      case 'email.opened':
        console.log(`[Resend] 👁️ Email opened — ID: ${data?.email_id} | To: ${data?.to}`)
        break

      case 'email.clicked':
        console.log(`[Resend] 🖱️ Link clicked — ID: ${data?.email_id} | To: ${data?.to}`)
        break

      default:
        console.log(`[Resend Webhook] Unhandled event type: ${type}`, data)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[Resend Webhook] Error processing event:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
