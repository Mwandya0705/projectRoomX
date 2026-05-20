import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { getUserByClerkId } from '@/lib/utils/auth'
import { createSubscription } from '@/lib/clickpesa/server'
import { z } from 'zod'

const checkoutSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
})

/**
 * POST /api/subscriptions/checkout
 * Create a Click Pesa payment request for room subscription
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    console.log('[Checkout] Request body:', body)
    const { roomId } = checkoutSchema.parse(body)
    console.log('[Checkout] Parsed roomId:', roomId)
    
    // Validate roomId is not empty
    if (!roomId || typeof roomId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid room ID provided' },
        { status: 400 }
      )
    }

    // Get room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check if user is the creator
    if (room.creatorId === user.id) {
      return NextResponse.json(
        { error: 'You cannot subscribe to your own room' },
        { status: 400 }
      )
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        subscriberId: user.id,
        roomId: roomId,
        status: 'active',
      },
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription to this room' },
        { status: 400 }
      )
    }

    if (!room.subscriptionPriceId) {
      return NextResponse.json(
        { error: 'Room does not have a subscription price configured' },
        { status: 400 }
      )
    }

    // Parse price from subscriptionPriceId (format: "amount:currency")
    const [priceStr, currency] = room.subscriptionPriceId.split(':')
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
    const cancelUrl = `${appUrl}/subscribe/${room.creatorId}`

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

