import OpenAI from 'openai'

let openaiInstance: OpenAI | null = null

function getOpenAIInstance(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-vercel-build-step',
    })
  }
  return openaiInstance
}

const STYLE_DIRECTIVES: Record<string, string> = {
  luxury:      'ultra-luxury editorial, high-end fashion photography, golden hour lighting, bokeh background, premium product presentation, Vogue magazine aesthetic',
  ecommerce:   'clean white studio background, professional product photography, sharp focus, e-commerce ready, Amazon listing quality, neutral lighting',
  influencer:  'lifestyle photography, warm tones, Instagram-worthy, aspirational, natural light, authentic feel, social media optimized',
  cinematic:   'cinematic widescreen, dramatic moody lighting, film grain, Hollywood production quality, anamorphic lens flare, color graded',
  studio:      'professional studio photography, controlled lighting, clean backdrop, commercial quality, brand-ready, sharp and vibrant',
}

export async function enhancePrompt(
  rawPrompt: string,
  style: string,
  jobType: 'image' | 'video'
): Promise<string> {
  const styleDirective = STYLE_DIRECTIVES[style] || STYLE_DIRECTIVES.studio
  const mediaType = jobType === 'video' ? 'motion video scene' : 'photorealistic image'

  const systemPrompt = `You are a world-class AI creative director specializing in ${mediaType} generation prompts.
Your task: Transform a basic user idea into a cinematic, marketing-grade generation prompt.
Style: ${styleDirective}
Rules:
- Output ONLY the enhanced prompt, no explanations
- Keep it under 200 words
- Include lighting, composition, mood, and technical camera details
- Make it visually stunning and commercially valuable
- Optimize for Flux/SDXL image generation quality`

  const openai = getOpenAIInstance()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: rawPrompt },
    ],
    max_tokens: 300,
    temperature: 0.8,
  })

  return response.choices[0]?.message?.content?.trim() || rawPrompt
}
