import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db/prisma'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!

/**
 * POST /api/webhooks/clerk
 * Handle Clerk webhook events to sync user data to database
 */
export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Missing Clerk webhook secret' },
      { status: 500 }
    )
  }

  // Get the Svix headers for verification
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Error occurred -- no svix headers' },
      { status: 400 }
    )
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return NextResponse.json(
      { error: 'Error occurred during verification' },
      { status: 400 }
    )
  }

  // Handle the webhook
  const eventType = evt.type

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data

      const email = email_addresses[0]?.email_address
      const name = [first_name, last_name].filter(Boolean).join(' ') || null

      // Upsert user in database using Prisma
      const dbUser = await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email: email || '',
          name: name,
          imageUrl: image_url || null,
          updatedAt: new Date(),
        },
        create: {
          clerkId: id,
          email: email || '',
          name: name,
          imageUrl: image_url || null,
        },
      })

      // If this is a new user, check for pending invitations by email
      if (eventType === 'user.created' && email) {
        // Find pending invitations for this email
        // Note: We'll store invitations in a table, but for now, we'll check if there are any rooms
        // where this user should be added based on email matching
        // This is a simple approach - in production, you'd have an invitations table
        
        console.log(`[Clerk Webhook] User created: ${email} (${dbUser.id}). Checking for pending invitations...`)
        // Pending invitations will be handled when user signs in for the first time
      }
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data

      // Delete user from database
      await prisma.user.deleteMany({
        where: { clerkId: id },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

