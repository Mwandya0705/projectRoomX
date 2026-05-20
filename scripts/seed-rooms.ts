/**
 * Script to seed sample rooms
 * Run with: npx tsx scripts/seed-rooms.ts
 */

import { prisma } from '../lib/db/prisma'

const sampleRooms = [
  {
    title: 'Web Development Masterclass',
    description: 'Learn modern web development with React, Next.js, and TypeScript. Perfect for beginners and intermediate developers looking to level up their skills.',
    price: 29900, // TZS
  },
  {
    title: 'Data Science & Machine Learning',
    description: 'Comprehensive course covering Python, pandas, scikit-learn, and deep learning. Build real-world projects and understand the fundamentals of AI.',
    price: 49900,
  },
  {
    title: 'Digital Marketing Strategies',
    description: 'Master SEO, social media marketing, content creation, and analytics. Learn how to grow your brand and reach your target audience effectively.',
    price: 19900,
  },
  {
    title: 'UI/UX Design Fundamentals',
    description: 'Learn design principles, user research, prototyping, and design tools like Figma. Create beautiful and functional user interfaces.',
    price: 24900,
  },
  {
    title: 'Mobile App Development',
    description: 'Build native iOS and Android apps using React Native. Learn app architecture, state management, and deployment strategies.',
    price: 39900,
  },
  {
    title: 'Cloud Computing & DevOps',
    description: 'Master AWS, Docker, Kubernetes, and CI/CD pipelines. Learn infrastructure as code and modern deployment practices.',
    price: 44900,
  },
]

async function seedRooms() {
  try {
    console.log('\n=== Seeding Sample Rooms ===\n')

    // Get all existing users
    const users = await prisma.user.findMany()
    
    if (users.length === 0) {
      console.error('❌ No users found in database.')
      console.error('   Please create at least one user first (sign up through the app).')
      return
    }

    console.log(`Found ${users.length} user(s) in database\n`)

    // Get users who don't have rooms yet
    const existingRooms = await prisma.room.findMany({
      select: { creatorId: true },
    })
    const creatorsWithRooms = new Set(existingRooms.map(r => r.creatorId))
    const availableCreators = users.filter(u => !creatorsWithRooms.has(u.id))

    console.log(`Existing rooms: ${existingRooms.length}`)
    console.log(`Available creators (without rooms): ${availableCreators.length}\n`)

    if (availableCreators.length === 0) {
      console.log('⚠️  All existing users already have rooms.')
      console.log('   To create more rooms, you need more users (each creator can only have one room).\n')
      return
    }

    // Create rooms
    let createdCount = 0
    let skippedCount = 0

    for (let i = 0; i < sampleRooms.length; i++) {
      const roomData = sampleRooms[i]
      
      // Use available creators, cycle if we have fewer creators than rooms
      const creator = availableCreators[i % availableCreators.length]
      
      // Double-check if this creator already has a room (shouldn't happen, but safety check)
      const existingRoom = await prisma.room.findUnique({
        where: { creatorId: creator.id },
      })

      if (existingRoom) {
        console.log(`⚠️  Skipping: User ${creator.name || creator.email} already has a room (${existingRoom.title})`)
        skippedCount++
        continue
      }

      try {
        const room = await prisma.room.create({
          data: {
            creatorId: creator.id,
            title: roomData.title,
            description: roomData.description,
            subscriptionPriceId: `${roomData.price}:TZS`,
            subscriptionProductId: null,
            isLive: false,
          },
        })

        console.log(`✅ Created: "${room.title}"`)
        console.log(`   Creator: ${creator.name || creator.email}`)
        console.log(`   Price: ${roomData.price} TZS`)
        console.log(`   Room ID: ${room.id}\n`)
        createdCount++
      } catch (error) {
        console.error(`❌ Error creating room "${roomData.title}":`, error)
      }
    }

    console.log('\n=== Summary ===')
    console.log(`Created: ${createdCount} rooms`)
    console.log(`Skipped: ${skippedCount} rooms`)
    
    if (createdCount < sampleRooms.length) {
      console.log(`\n⚠️  Note: Only ${createdCount} out of ${sampleRooms.length} rooms were created.`)
      console.log(`   This is because each creator can only have one room.`)
      console.log(`   To create all ${sampleRooms.length} rooms, you need at least ${sampleRooms.length} different users.`)
    }
    
    const finalRooms = await prisma.room.findMany()
    console.log(`\nTotal rooms in database: ${finalRooms.length}\n`)
  } catch (error) {
    console.error('Error seeding rooms:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedRooms()

