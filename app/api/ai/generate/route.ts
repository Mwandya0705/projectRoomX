/**
 * POST /api/ai/generate
 *
 * Orchestration entry point for AI generation:
 * 1. Authenticate user
 * 2. Validate input
 * 3. Enhance prompt (OpenAI)
 * 4. Check credits
 * 5. Deduct credits
 * 6. Create job record
 * 7. Process synchronously (for MVP, avoids needing separate worker process)
 *    → For production at scale, swap to queue + worker
 * 8. Return result
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { enhancePrompt } from '@/lib/ai/prompt-enhancer'
import { generateImageWithFal } from '@/lib/ai/fal-image'
import { generateVideoWithLuma } from '@/lib/ai/luma-video'
import { getUserCredits, deductCredits, refundCredits, CREDIT_COSTS } from '@/lib/ai/credits'
import { createAIJob, updateAIJob } from '@/lib/ai/jobs'

const generateSchema = z.object({
  job_type:            z.enum(['image', 'video']),
  prompt:              z.string().min(3).max(1000),
  style:               z.enum(['luxury', 'ecommerce', 'influencer', 'cinematic', 'studio']).default('studio'),
  uploaded_image_url:  z.string().url().optional().nullable(),
  premium:             z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth ──────────────────────────────────────────
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 2. Validate input ─────────────────────────────────
    const body = await request.json()
    const input = generateSchema.parse(body)

    // ── 3. Determine credit cost ──────────────────────────
    let creditCost: number
    if (input.job_type === 'video') {
      creditCost = CREDIT_COSTS.video
    } else if (input.premium) {
      creditCost = CREDIT_COSTS.premium_image
    } else {
      creditCost = CREDIT_COSTS.basic_image
    }

    // ── 4. Credit check ───────────────────────────────────
    const balance = await getUserCredits(user.id)
    if (balance < creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. Need ${creditCost}, you have ${balance}.`,
        credits_needed: creditCost,
        credits_available: balance,
      }, { status: 402 })
    }

    // ── 5. Enhance prompt ─────────────────────────────────
    const enhancedPrompt = await enhancePrompt(input.prompt, input.style, input.job_type)

    // ── 6. Create job record ──────────────────────────────
    const job = await createAIJob({
      userId: user.id,
      jobType: input.job_type,
      prompt: input.prompt,
      style: input.style,
      uploadedImageUrl: input.uploaded_image_url ?? undefined,
      creditCost,
    })

    // ── 7. Deduct credits BEFORE processing ──────────────
    await deductCredits(user.id, creditCost, `AI ${input.job_type} generation (${input.style})`, job.id)
    await updateAIJob(job.id, { status: 'processing', enhanced_prompt: enhancedPrompt })

    // ── 8. AI Generation ──────────────────────────────────
    let resultUrl: string

    try {
      if (input.job_type === 'image') {
        const imageResult = await generateImageWithFal(
          enhancedPrompt,
          input.uploaded_image_url ?? undefined,
          input.premium
        )
        resultUrl = imageResult.imageUrl

      } else {
        // Video: First generate an image, then animate it
        let sourceImageUrl = input.uploaded_image_url ?? undefined

        if (!sourceImageUrl) {
          const imageResult = await generateImageWithFal(enhancedPrompt, undefined, false)
          sourceImageUrl = imageResult.imageUrl
        }

        const videoResult = await generateVideoWithLuma(enhancedPrompt, sourceImageUrl)
        resultUrl = videoResult.videoUrl
      }

      // ── 9. Mark job completed ─────────────────────────
      await updateAIJob(job.id, { status: 'completed', result_url: resultUrl })

      return NextResponse.json({
        status: 'success',
        job_type: input.job_type,
        job_id: job.id,
        enhanced_prompt: enhancedPrompt,
        credit_cost: creditCost,
        credits_remaining: balance - creditCost,
        execution_steps: input.job_type === 'image'
          ? ['enhance_prompt', 'generate_image', 'store_result']
          : ['enhance_prompt', 'generate_image', 'generate_video', 'store_result'],
        result_url: resultUrl,
      })

    } catch (aiError) {
      // Refund credits on failure
      await refundCredits(user.id, creditCost, job.id)
      await updateAIJob(job.id, {
        status: 'failed',
        error_message: aiError instanceof Error ? aiError.message : 'AI generation failed',
      })
      throw aiError
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('[AI Generate] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
