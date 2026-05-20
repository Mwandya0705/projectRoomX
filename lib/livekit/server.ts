import { AccessToken } from 'livekit-server-sdk'

// Don't throw at module load time - check in functions instead
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL

function validateLiveKitConfig() {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
    const missing = []
    if (!LIVEKIT_API_KEY) missing.push('LIVEKIT_API_KEY')
    if (!LIVEKIT_API_SECRET) missing.push('LIVEKIT_API_SECRET')
    if (!LIVEKIT_URL) missing.push('NEXT_PUBLIC_LIVEKIT_URL')
    throw new Error(`Missing LiveKit environment variables: ${missing.join(', ')}`)
  }
}

export type TokenRole = 'publisher' | 'subscriber'

export interface GenerateTokenOptions {
  roomName: string
  userId: string
  userName: string
  role: TokenRole
}

/**
 * Generate a LiveKit access token for a user
 */
export async function generateLiveKitToken({
  roomName,
  userId,
  userName,
  role,
}: GenerateTokenOptions): Promise<string> {
  validateLiveKitConfig()
  
  const at = new AccessToken(LIVEKIT_API_KEY!, LIVEKIT_API_SECRET!, {
    identity: userId,
    name: userName,
  })

  // Grant permissions based on role
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: role === 'publisher',
    canSubscribe: true,
    canPublishData: true, // For chat
    canUpdateOwnMetadata: true,
  })

  return await at.toJwt()
}

export function getLiveKitUrl(): string {
  validateLiveKitConfig()
  return LIVEKIT_URL!
}

