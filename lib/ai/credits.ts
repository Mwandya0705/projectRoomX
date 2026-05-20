/**
 * AI Credits Service — SERVER ONLY
 * All write operations use admin client to bypass RLS.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export const CREDIT_COSTS = {
  basic_image:   parseInt(process.env.AI_STUDIO_BASIC_IMAGE_CREDITS   || '20'),
  premium_image: parseInt(process.env.AI_STUDIO_PREMIUM_IMAGE_CREDITS || '50'),
  video:         parseInt(process.env.AI_STUDIO_VIDEO_CREDITS          || '250'),
  refine:        parseInt(process.env.AI_STUDIO_REFINE_CREDITS         || '5'),
} as const

export type CreditType = keyof typeof CREDIT_COSTS

/** Get balance — auto-creates wallet for new users */
export async function getUserCredits(userId: string): Promise<number> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ai_credits')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (error?.code === 'PGRST116') {
    // New user — seed wallet with starting credits
    const starting = parseInt(process.env.AI_STUDIO_NEW_USER_CREDITS || '500')
    await supabase.from('ai_credits').insert({
      user_id: userId,
      balance: starting,
      total_earned: starting,
      total_spent: 0,
    })
    return starting
  }

  if (error) throw error
  return data?.balance ?? 0
}

/** Deduct credits before processing. Throws if balance is insufficient. */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  jobId?: string
): Promise<void> {
  const supabase = createAdminClient()
  const balance = await getUserCredits(userId)

  if (balance < amount) {
    throw new Error(`Insufficient credits. Need ${amount}, you have ${balance}.`)
  }

  await supabase
    .from('ai_credits')
    .update({
      balance: balance - amount,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  // Log transaction for billing history
  await supabase.from('ai_credit_transactions').insert({
    user_id: userId,
    amount: -amount,
    type: 'debit',
    description,
    job_id: jobId ?? null,
  })
}

/** Refund credits when a job fails */
export async function refundCredits(
  userId: string,
  amount: number,
  jobId: string
): Promise<void> {
  const supabase = createAdminClient()
  const balance = await getUserCredits(userId)

  await supabase
    .from('ai_credits')
    .update({
      balance: balance + amount,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  await supabase.from('ai_credit_transactions').insert({
    user_id: userId,
    amount: +amount,
    type: 'refund',
    description: 'Refund for failed AI job',
    job_id: jobId,
  })
}
