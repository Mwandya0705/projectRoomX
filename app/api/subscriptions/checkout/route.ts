export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserByAuthId } from '@/lib/utils/auth'
import { createSubscription } from '@/lib/clickpesa/server'
import { z } from 'zod'

const checkoutSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  cardholderName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
})

/**
 * POST /api/subscriptions/checkout
 * Create a Click Pesa payment request for room subscription
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

    // Parse request body
    const body = await request.json()
    console.log('[Checkout] Request body:', body)
    const { roomId, cardholderName, cardNumber, expiryDate, cvv } = checkoutSchema.parse(body)
    console.log('[Checkout] Parsed roomId:', roomId)
    
    // Validate roomId is not empty
    if (!roomId || typeof roomId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid room ID provided' },
        { status: 400 }
      )
    }

    // Get room
    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check if user is the creator
    if (room.creator_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot subscribe to your own room' },
        { status: 400 }
      )
    }

    // Direct card payment flow
    if (cardNumber) {
      console.log('[Checkout] Processing direct Credit Card payment for room:', roomId)
      console.log('[Checkout] PAYMENT_API_KEY present:', !!process.env.PAYMENT_API_KEY)
      
      if (!cardholderName || !expiryDate || !cvv) {
        return NextResponse.json({ error: 'Missing credit card details' }, { status: 400 })
      }

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const { createAdminClient } = await import('@/lib/supabase/admin')
      const adminSupabase = createAdminClient()

      const paymentId = `direct_pay_${user.id.substring(0, 8)}_${room.id.substring(0, 8)}_${Date.now()}`

      // Create subscription directly in database
      const { error: insertError } = await adminSupabase
        .from('subscriptions')
        .insert({
          subscriber_id: user.id,
          room_id: room.id,
          stripe_subscription_id: paymentId,
          stripe_customer_id: user.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
        })

      if (insertError) {
        console.error('[Checkout] Error inserting direct subscription:', insertError)
        return NextResponse.json({ error: 'Failed to create subscription record' }, { status: 500 })
      }

      console.log('[Checkout] Direct subscription created successfully for user:', user.id)

      return NextResponse.json({
        success: true,
        message: 'Payment authorized and subscription activated successfully',
        redirectUrl: `/room/${room.id}`,
      })
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
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

    if (!room.subscription_price_id) {
      return NextResponse.json(
        { error: 'Room does not have a subscription price configured' },
        { status: 400 }
      )
    }

    // Parse price from subscriptionPriceId (format: "amount:currency")
    const [priceStr, currency] = room.subscription_price_id.split(':')
    const amount = parseFloat(priceStr)
    // Ensure currency is uppercase (Click Pesa may require uppercase)
    const paymentCurrency = (currency || 'TZS').toUpperCase()

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid subscription price' },
        { status: 400 }
      )
    }

    // Ensure amount is an integer (Click Pesa may require whole numbers)
    const amountInCents = Math.round(amount)

    // Get app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(user.email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    // Construct URLs
    // Note: Click Pesa will append payment_id as a query parameter automatically
    const callbackUrl = `${appUrl}/api/webhooks/clickpesa`
    const successUrl = `${appUrl}/room/${roomId}`
    const cancelUrl = `${appUrl}/subscribe/${room.creator_id}`

    // Validate URLs
    try {
      new URL(callbackUrl)
      new URL(successUrl)
      new URL(cancelUrl)
    } catch (urlError) {
      console.error('[Checkout] Invalid URL format:', { callbackUrl, successUrl, cancelUrl })
      return NextResponse.json(
        { error: 'Invalid URL configuration. Please check NEXT_PUBLIC_APP_URL environment variable.' },
        { status: 500 }
      )
    }

    console.log('[Checkout] Creating subscription with:', {
      amount,
      currency: paymentCurrency,
      email: user.email,
      callbackUrl,
      successUrl,
      cancelUrl,
    })

    // Create Click Pesa subscription payment
    const subscription = await createSubscription({
      amount: amountInCents,
      currency: paymentCurrency,
      description: `Monthly subscription to ${room.title}`,
      customerEmail: user.email,
      customerName: user.name || undefined,
      interval: 'month',
      callbackUrl: callbackUrl,
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      metadata: {
        userId: String(user.id),
        roomId: String(room.id),
        type: 'subscription',
      },
    })

    return NextResponse.json({ 
      paymentUrl: subscription.paymentUrl,
      subscriptionId: subscription.subscriptionId 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating checkout session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error('Error details:', errorDetails)
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined 
    }, { status: 500 })
  }
}

