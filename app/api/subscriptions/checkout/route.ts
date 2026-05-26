export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { chargeCard, createSubscription } from '@/lib/payment/server'
import { z } from 'zod'

const checkoutSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  cardholderName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  currency: z.string().optional(),
})

/**
 * POST /api/subscriptions/checkout
 * Create a payment request or direct card charge for room subscription.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByAuthId(authUser.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse and validate body (card details never logged)
    const body = await request.json()
    const { roomId, cardholderName, cardNumber, expiryDate, cvv, currency } =
      checkoutSchema.parse(body)

    console.log('[Checkout] Initiated for roomId:', roomId, '| user:', user.id)

    if (!roomId || typeof roomId !== 'string') {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 })
    }

    // Fetch room
    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.creator_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot subscribe to your own room' },
        { status: 400 }
      )
    }

    // Check existing active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('subscriber_id', user.id)
      .eq('room_id', roomId)
      .eq('status', 'active')
      .single()

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription to this room' },
        { status: 400 }
      )
    }

    // ── Direct card payment flow ──────────────────────────────────────────
    if (cardNumber) {
      if (!cardholderName || !expiryDate || !cvv) {
        return NextResponse.json(
          { error: 'Missing card details: cardholderName, expiryDate, and cvv are required' },
          { status: 400 }
        )
      }

      // Resolve amount & currency from room price or fallback
      const [priceStr, roomCurrency] = (room.subscription_price_id || '29900:TZS').split(':')
      const amount = Math.round(parseFloat(priceStr))
      const paymentCurrency = (currency || roomCurrency || 'TZS').toUpperCase()

      if (isNaN(amount) || amount <= 0) {
        return NextResponse.json({ error: 'Invalid subscription price' }, { status: 400 })
      }

      console.log('[Checkout] Charging card for room:', roomId, '| amount:', amount, paymentCurrency)

      // Charge the card via real payment API
      const charge = await chargeCard({
        amount,
        currency: paymentCurrency,
        description: `Monthly subscription to ${room.title}`,
        cardholderName,
        cardNumber,
        expiryDate,
        cvv,
        customerEmail: user.email,
        metadata: {
          userId: String(user.id),
          roomId: String(room.id),
          type: 'subscription',
        },
      })

      // ── Payment status gate — only activate if charge succeeded ──────────
      if (charge.status !== 'completed' && charge.status !== 'success' && charge.status !== 'approved') {
        console.warn('[Checkout] Card charge not approved. Status:', charge.status)
        return NextResponse.json(
          { error: `Payment was not approved. Status: ${charge.status}` },
          { status: 402 }
        )
      }

      console.log('[Checkout] Card charge approved. Creating subscription for user:', user.id)

      const { createAdminClient } = await import('@/lib/supabase/admin')
      const adminSupabase = createAdminClient()

      const { error: insertError } = await adminSupabase
        .from('subscriptions')
        .insert({
          subscriber_id: user.id,
          room_id: room.id,
          stripe_subscription_id: charge.paymentId,
          stripe_customer_id: user.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          cancel_at_period_end: false,
        })

      if (insertError) {
        console.error('[Checkout] Subscription insert error after successful charge:', insertError)
        return NextResponse.json(
          { error: 'Payment successful but failed to activate subscription. Contact support.' },
          { status: 500 }
        )
      }

      console.log('[Checkout] Subscription activated for user:', user.id, '| paymentId:', charge.paymentId)

      return NextResponse.json({
        success: true,
        message: 'Payment successful and subscription activated',
        redirectUrl: `/room/${room.id}`,
        paymentId: charge.paymentId,
      })
    }

    // ── Redirect-based payment flow (no card in request) ─────────────────
    if (!room.subscription_price_id) {
      return NextResponse.json(
        { error: 'Room does not have a subscription price configured' },
        { status: 400 }
      )
    }

    const [priceStr, roomCurrency] = room.subscription_price_id.split(':')
    const amount = parseFloat(priceStr)
    const paymentCurrency = (currency || roomCurrency || 'TZS').toUpperCase()

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid subscription price' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(user.email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const callbackUrl = `${appUrl}/api/webhooks/payment`
    const successUrl = `${appUrl}/room/${roomId}`
    const cancelUrl = `${appUrl}/subscribe/${room.creator_id}`

    try {
      new URL(callbackUrl); new URL(successUrl); new URL(cancelUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL configuration. Check NEXT_PUBLIC_APP_URL.' },
        { status: 500 }
      )
    }

    console.log('[Checkout] Creating redirect payment for room:', roomId, '| amount:', amount, paymentCurrency)

    const subscription = await createSubscription({
      amount: Math.round(amount),
      currency: paymentCurrency,
      description: `Monthly subscription to ${room.title}`,
      customerEmail: user.email,
      customerName: user.name || undefined,
      interval: 'month',
      callbackUrl,
      successUrl,
      cancelUrl,
      metadata: {
        userId: String(user.id),
        roomId: String(room.id),
        type: 'subscription',
      },
    })

    return NextResponse.json({
      paymentUrl: subscription.paymentUrl,
      subscriptionId: subscription.subscriptionId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('[Checkout] Unhandled error:', error instanceof Error ? error.message : error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.stack : String(error))
          : undefined,
      },
      { status: 500 }
    )
  }
}
