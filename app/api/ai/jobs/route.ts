/**
 * GET /api/ai/jobs
 * Returns the current user's AI job history.
 *
 * GET /api/ai/jobs?id=:jobId
 * Returns a single job's status (for polling).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserJobs, getAIJob } from '@/lib/ai/jobs'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('id')

    if (jobId) {
      const job = await getAIJob(jobId)
      if (!job || job.user_id !== user.id) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }
      return NextResponse.json(job)
    }

    const jobs = await getUserJobs(user.id, 30)
    return NextResponse.json({ jobs })
  } catch (err) {
    console.error('[AI Jobs GET]', err)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
