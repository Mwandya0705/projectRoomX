import { fal } from '@fal-ai/client'

// Configure Fal.ai credentials
if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY })
}

export interface FalImageResult {
  imageUrl: string
  width: number
  height: number
}

export async function generateImageWithFal(
  prompt: string,
  uploadedImageUrl?: string,
  premium = false
): Promise<FalImageResult> {
  // Premium: Flux Pro — Higher quality
  // Basic:   Flux Schnell — Fast
  const modelId = premium
    ? 'fal-ai/flux-pro'
    : 'fal-ai/flux/schnell'

  const input: Record<string, any> = {
    prompt,
    image_size: 'landscape_16_9',
    num_inference_steps: premium ? 28 : 4,
    num_images: 1,
    enable_safety_checker: true,
  }

  // Reference image for img2img
  if (uploadedImageUrl) {
    input.image_url = uploadedImageUrl
    input.strength = 0.75
  }

  const result = await fal.subscribe(modelId, {
    input,
    pollInterval: 2000,
  }) as any

  const image = result?.data?.images?.[0] ?? result?.images?.[0] ?? result?.image
  if (!image?.url) throw new Error('No image returned from Fal.ai')

  return {
    imageUrl: image.url,
    width: image.width || 1280,
    height: image.height || 720,
  }
}
