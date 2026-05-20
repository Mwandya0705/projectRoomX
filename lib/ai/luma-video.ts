import LumaAI from 'lumaai'

let lumaInstance: LumaAI | null = null

function getLumaInstance(): LumaAI {
  if (!lumaInstance) {
    lumaInstance = new LumaAI({
      authToken: process.env.LUMAAI_API_KEY || 'dummy-key-for-vercel-build-step',
    })
  }
  return lumaInstance
}

export interface LumaVideoResult {
  videoUrl: string
  thumbnailUrl?: string
}

export async function generateVideoWithLuma(
  prompt: string,
  sourceImageUrl: string
): Promise<LumaVideoResult> {
  const luma = getLumaInstance()
  // Create generation — keyframes vary by SDK version, use any-cast for safety
  const payload: any = {
    prompt,
    loop: false,
    aspect_ratio: '16:9',
    keyframes: {
      frame0: { type: 'image', url: sourceImageUrl },
    },
  }

  const generation = await luma.generations.create(payload)
  const jobId = generation.id
  if (!jobId) throw new Error('Luma AI did not return a job ID')

  // Poll until complete — max 5 min (60 × 5 s)
  for (let attempt = 0; attempt < 60; attempt++) {
    await new Promise((r) => setTimeout(r, 5000))

    const status = await luma.generations.get(jobId)

    if (status.state === 'completed') {
      // Access video URL via any-cast to avoid SDK type variance
      const assets = (status as any).assets ?? {}
      const videoUrl: string | undefined = assets.video
      if (!videoUrl) throw new Error('Luma AI completed but returned no video URL')
      return { videoUrl, thumbnailUrl: assets.thumbnail as string | undefined }
    }

    if (status.state === 'failed') {
      const reason = (status as any).failure_reason ?? 'Unknown error'
      throw new Error(`Luma AI generation failed: ${reason}`)
    }
  }

  throw new Error('Luma AI video generation timed out after 5 minutes')
}
