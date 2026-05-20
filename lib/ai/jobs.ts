/**
 * AI Job Storage — Supabase CRUD for ai_jobs table
 * All operations use the admin client to bypass RLS.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface AIJob {
  id: string
  user_id: string
  job_type: 'image' | 'video'
  status: JobStatus
  prompt: string
  enhanced_prompt?: string | null
  style?: string | null
  uploaded_image_url?: string | null
  result_url?: string | null
  credit_cost: number
  error_message?: string | null
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export async function createAIJob(data: {
  userId: string
  jobType: 'image' | 'video'
  prompt: string
  style: string
  uploadedImageUrl?: string
  creditCost: number
}): Promise<AIJob> {
  const supabase = createAdminClient()

  const { data: job, error } = await supabase
    .from('ai_jobs')
    .insert({
      user_id: data.userId,
      job_type: data.jobType,
      status: 'queued',
      prompt: data.prompt,
      style: data.style,
      uploaded_image_url: data.uploadedImageUrl ?? null,
      credit_cost: data.creditCost,
    })
    .select()
    .single()

  if (error) throw error
  return job as AIJob
}

export async function updateAIJob(
  jobId: string,
  updates: Partial<Pick<AIJob, 'status' | 'enhanced_prompt' | 'result_url' | 'error_message' | 'metadata'>>
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('ai_jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', jobId)
  if (error) throw error
}

export async function getAIJob(jobId: string): Promise<AIJob | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('ai_jobs')
    .select('*')
    .eq('id', jobId)
    .single()
  if (error) return null
  return data as AIJob
}

export async function getUserJobs(
  userId: string,
  limit = 20
): Promise<AIJob[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('ai_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as AIJob[]
}
