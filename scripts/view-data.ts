/**
 * Script to view database data
 * Run with: npx tsx scripts/view-data.ts
 */

import { prisma } from '../lib/db/prisma'

async function viewData() {
  try {
    console.log('\n=== Users ===\n')
    const users = await prisma.user.findMany()
    console.log(`Total users: ${users.length}`)
    users.forEach((user) => {
      console.log(`- ${user.name || 'No name'} (${user.email}) - ID: ${user.id}`)
    })

    console.log('\n=== Rooms ===\n')
    const rooms = await prisma.room.findMany()
    console.log(`Total rooms: ${rooms.length}`)
    rooms.forEach((room) => {
      console.log(`- ${room.title} - ID: ${room.id}`)
      console.log(`  Creator ID: ${room.creatorId}`)
      console.log(`  Price: ${room.subscriptionPriceId}`)
      console.log(`  Live: ${room.isLive}`)
    })

    console.log('\n=== Subscriptions ===\n')
    const subscriptions = await prisma.subscription.findMany()
    console.log(`Total subscriptions: ${subscriptions.length}`)
    subscriptions.forEach((sub) => {
      console.log(`- Subscription ID: ${sub.id}`)
      console.log(`  Subscriber: ${sub.subscriberId}`)
      console.log(`  Room: ${sub.roomId}`)
      console.log(`  Status: ${sub.status}`)
    })

    console.log('\n=== Room Participants ===\n')
    const participants = await prisma.roomParticipant.findMany()
    console.log(`Total participants: ${participants.length}`)
    participants.forEach((p) => {
      console.log(`- User ${p.userId} in Room ${p.roomId} (${p.role})`)
    })
  } catch (error) {
    console.error('Error viewing data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

viewData()


