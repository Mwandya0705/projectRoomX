import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/utils/auth'
import { verifyPayment } from '@/lib/clickpesa/server'
import { prisma } from '@/lib/db/prisma'

/**
 * GET /api/payments/verify
 * Verify payment status and create/update subscription
 * Called when user returns from Click Pesa payment page
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    }

    // Verify payment with Click Pesa
    const payment = await verifyPayment(paymentId)

    // Check if payment was successful
    if (payment.status !== 'completed' && payment.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment not completed', status: payment.status },
        { status: 400 }
      )
    }

    // Extract metadata
    const userId = payment.metadata?.userId
    const roomId = payment.metadata?.roomId

    if (!userId || !roomId) {
      return NextResponse.json(
        { error: 'Missing metadata in payment' },
        { status: 400 }
      )
    }

    // Verify the user matches (security check)
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Payment does not belong to this user' },
        { status: 403 }
      )
    }

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
          stripeSubscriptionId: paymentId,
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
          stripeSubscriptionId: paymentId,
          stripeCustomerId: userId,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          cancelAtPeriodEnd: false,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription created',
      roomId: roomId,
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


