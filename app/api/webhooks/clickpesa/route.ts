import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyPayment } from '@/lib/clickpesa/server'

/**
 * POST /api/webhooks/clickpesa
 * Handle Click Pesa payment webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[ClickPesa Webhook] Received webhook:', JSON.stringify(body, null, 2))
    
    // Click Pesa webhook payload structure may vary
    // Adjust based on their actual webhook format
    // Try multiple possible field names
    const paymentId = body.paymentId || body.payment_id || body.id || body.transactionId
    
    if (!paymentId) {
      console.error('[ClickPesa Webhook] Missing paymentId in webhook body')
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    }

    console.log('[ClickPesa Webhook] Verifying payment:', paymentId)

    // Verify payment status with Click Pesa
    const payment = await verifyPayment(paymentId)
    console.log('[ClickPesa Webhook] Payment verified:', payment)

    // Extract metadata - try multiple possible locations
    const userId = body.metadata?.userId || payment.metadata?.userId || body.userId
    const roomId = body.metadata?.roomId || payment.metadata?.roomId || body.roomId
    const subscriptionType = body.metadata?.type || payment.metadata?.type || body.type

    if (!userId || !roomId) {
      console.error('[ClickPesa Webhook] Missing userId or roomId:', { userId, roomId, body, payment })
      return NextResponse.json({ error: 'Invalid payment metadata' }, { status: 400 })
    }

    console.log('[ClickPesa Webhook] Processing payment:', { paymentId, userId, roomId, status: payment.status })

    // Handle successful payment
    if (payment.status === 'completed' || payment.status === 'success') {
      // Check if subscription already exists
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          subscriberId: userId,
          roomId: roomId,
        },
      })

      if (existingSubscription) {
        // Update existing subscription
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            cancelAtPeriodEnd: false,
          },
        })
      } else {
        // Create new subscription
        await prisma.subscription.create({
          data: {
            subscriberId: userId,
            roomId: roomId,
            stripeSubscriptionId: paymentId, // Using paymentId as subscription ID
            stripeCustomerId: userId, // Using userId as customer ID
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            cancelAtPeriodEnd: false,
          },
        })
      }
    } else if (payment.status === 'failed' || payment.status === 'cancelled') {
      // Update subscription status if it exists
      const subscription = await prisma.subscription.findFirst({
        where: {
          subscriberId: userId,
          roomId: roomId,
        },
      })

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'cancelled',
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Click Pesa webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

