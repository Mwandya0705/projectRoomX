/**
 * AI Job Queue — Upstash Redis + BullMQ
 *
 * Jobs flow:
 *  1. API route creates job record in Supabase (status: queued)
 *  2. API route enqueues BullMQ job to Redis
 *  3. Worker picks up job, processes AI calls
 *  4. Worker updates Supabase job record (status: completed/failed)
 *
 * For Upstash Redis, we use the REST adapter via @upstash/redis
 * when running serverless (Vercel/Next.js API routes), and IORedis
 * for the dedicated BullMQ worker process.
 */

import { Queue, Worker, Job } from 'bullmq'

// IORedis connection config — used for BullMQ queue/worker
export function getRedisConnection() {
  const url = process.env.UPSTASH_REDIS_URL
  if (!url) {
    throw new Error('UPSTASH_REDIS_URL is not set. Check your .env.local')
  }
  return {
    url,
    tls: url.startsWith('rediss://') ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }
}

export const QUEUE_NAME = 'roomx_ai_jobs'

export type AIJobPayload = {
  jobId: string          // Supabase ai_jobs row id
  userId: string
  jobType: 'image' | 'video'
  prompt: string
  style: string
  uploadedImageUrl?: string
  premium: boolean
  creditCost: number
}

/**
 * Add a job to the BullMQ queue.
 * Called from the Next.js API route (no long-running worker needed here).
 */
export async function enqueueAIJob(payload: AIJobPayload): Promise<string> {
  const connection = getRedisConnection()
  const queue = new Queue(QUEUE_NAME, { connection } as any)

  const bullJob = await queue.add('process_ai', payload, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  })

  await queue.close()
  return bullJob.id ?? ''
}
