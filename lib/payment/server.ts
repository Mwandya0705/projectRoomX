/**
 * RoomX Payment Server — ClickPesa Integration
 *
 * ClickPesa uses a 2-step auth flow:
 *   Step 1: POST /third-parties/generate-token  (headers: client-id, api-key)
 *           → Returns { token: "..." }
 *   Step 2: Use token as Authorization: Bearer <token> for all payment calls
 *
 * Environment variables required:
 *   PAYMENT_API_KEY        — Your ClickPesa api-key (used as the checksum signature key too)
 *   CLICKPESA_CLIENT_ID    — Your ClickPesa client-id (IDZ49g1Az4IVTgt1hVMWMNH27tGwCHDs)
 *   PAYMENT_BASE_URL       — Base URL (https://api.clickpesa.com or sandbox)
 */

import { createHmac } from 'crypto'

const BASE_URL = process.env.PAYMENT_BASE_URL || 'https://api.clickpesa.com'

function getApiKey(): string {
  return process.env.PAYMENT_API_KEY || ''
}

function getClientId(): string {
  return (
    process.env.CLICKPESA_CLIENT_ID ||
    process.env.PAYMENT_CLIENT_ID ||
    'IDZ49g1Az4IVTgt1hVMWMNH27tGwCHDs'
  )
}

function isConfigured(): boolean {
  return getApiKey().length > 10
}

/** ─────────────────────────────────────────────
 *  Helper: Sort Keys Alphabetically at all Nesting Levels
 * ───────────────────────────────────────────── */
function sortKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(sortKeys)
  }
  const sortedKeys = Object.keys(obj).sort()
  const result: any = {}
  for (const key of sortedKeys) {
    result[key] = sortKeys(obj[key])
  }
  return result
}

/** ─────────────────────────────────────────────
 *  Helper: Generate HMAC-SHA256 Checksum of sorted payload
 * ───────────────────────────────────────────── */
function calculateChecksum(payload: any, apiKey: string): string {
  // Exclude checksum and checksumMethod fields from computation
  const { checksum, checksumMethod, ...rest } = payload
  const sorted = sortKeys(rest)
  const jsonStr = JSON.stringify(sorted)
  return createHmac('sha256', apiKey).update(jsonStr).digest('hex')
}

/** ─────────────────────────────────────────────
 *  Step 1: Exchange api-key + client-id for a JWT
 * ───────────────────────────────────────────── */
async function generateJWT(): Promise<string | null> {
  const apiKey = getApiKey()
  const clientId = getClientId()

  if (!isConfigured()) {
    console.warn('[Payment] PAYMENT_API_KEY not set — running in sandbox mode.')
    return null
  }

  try {
    console.log('[Payment] Requesting JWT from ClickPesa...')
    const response = await fetch(`${BASE_URL}/third-parties/generate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': clientId,
        'api-key': apiKey,
      },
    })

    const text = await response.text()
    let data: Record<string, unknown> = {}
    try { data = JSON.parse(text) } catch { /* non-JSON response */ }

    if (!response.ok) {
      console.error('[Payment] JWT generation failed:', response.status, text)
      return null
    }

    let token = String(data.token || data.jwt || data.access_token || '')
    if (!token || token.length < 10) {
      console.error('[Payment] JWT not found in response. Got:', text)
      return null
    }

    // ClickPesa returns the token with "Bearer " prefix already included.
    // Strip it here so callers can safely do `Authorization: Bearer ${token}`.
    token = token.replace(/^Bearer\s+/i, '')

    console.log('[Payment] JWT obtained successfully.')
    return token
  } catch (error) {
    console.error('[Payment] JWT request error:', error)
    return null
  }
}

/** ─────────────────────────────────────────────
 *  Generate a unique order reference
 * ───────────────────────────────────────────── */
function generateOrderReference(userId: string, roomId: string): string {
  const uid = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5)
  const rid = roomId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5)
  const ts = String(Date.now()).slice(-8)
  return `RX${uid}${rid}${ts}` // exactly 20 chars
}

/** ─────────────────────────────────────────────
 *  Generate a sandbox payment ID (for fallbacks)
 * ───────────────────────────────────────────── */
function sandboxPaymentId(userId: string, roomId: string): string {
  return `pay_${userId.slice(0, 8)}_${roomId.slice(0, 8)}_${Date.now()}`
}

/** ─────────────────────────────────────────────
 *  Charge Mobile Money (Direct USSD Push)
 * ───────────────────────────────────────────── */
export async function chargeMobileMoney(params: {
  amount: number
  currency: string
  description: string
  phoneNumber: string
  provider: string
  customerEmail: string
  callbackUrl?: string
  metadata?: Record<string, string>
}): Promise<{ paymentId: string; status: string }> {
  const userId = params.metadata?.userId || 'u'
  const roomId = params.metadata?.roomId || 'r'
  const orderReference = generateOrderReference(userId, roomId)

  // Normalize to E.164 Tanzania format without + (e.g. 255712345678)
  let phone = params.phoneNumber.replace(/\D/g, '')
  if (phone.startsWith('0')) phone = '255' + phone.slice(1)
  else if (!phone.startsWith('255')) phone = '255' + phone

  const token = await generateJWT()
  if (!token) {
    throw new Error('Payment gateway authentication failed. Please try again.')
  }

  const apiKey = getApiKey()
  const amount = String(Math.round(Number(params.amount)))
  const currency = params.currency.toUpperCase()

  // ── Step 1: Preview — validates phone number & checks active payment methods ──
  const previewPayload: any = {
    amount,
    currency,
    orderReference,
    phoneNumber: phone,
    fetchSenderDetails: false,
  }
  previewPayload.checksum = calculateChecksum(previewPayload, apiKey)

  console.log('[Payment] Previewing USSD push — phone:', phone, '| ref:', orderReference)
  const previewRes = await fetch(`${BASE_URL}/third-parties/payments/preview-ussd-push-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(previewPayload),
  })

  const previewText = await previewRes.text()
  let previewData: Record<string, unknown> = {}
  try { previewData = JSON.parse(previewText) } catch { /* non-JSON */ }

  if (!previewRes.ok) {
    const errMsg = String((previewData as any).message || (previewData as any).error || previewText || `HTTP ${previewRes.status}`)
    console.error('[Payment] Preview failed:', previewRes.status, previewText)
    throw new Error(errMsg)
  }

  const activeMethods = (previewData.activeMethods as any[]) || []
  if (activeMethods.length === 0) {
    throw new Error('No active mobile money payment methods available for this phone number. Please check the number and try again.')
  }

  const availableNames = activeMethods.map((m: any) => String(m.name || '').toUpperCase())
  console.log('[Payment] Active methods:', availableNames.join(', '))

  // Map UI provider → ClickPesa channel name keyword
  const providerKeyword: Record<string, string> = {
    vodacom: 'MPESA',
    tigo:    'TIGO',
    airtel:  'AIRTEL',
    halotel: 'HALO',
  }
  const keyword = providerKeyword[params.provider.toLowerCase()] ?? params.provider.toUpperCase()
  const matchedMethod = activeMethods.find((m: any) => String(m.name || '').toUpperCase().includes(keyword))

  if (!matchedMethod) {
    const friendly = availableNames.join(', ')
    throw new Error(`${params.provider.charAt(0).toUpperCase() + params.provider.slice(1)} is not available for this number. Available: ${friendly}`)
  }

  const channel = String(matchedMethod.name)
  console.log('[Payment] Selected channel:', channel)

  // ── Step 2: Initiate — sends the USSD push to the customer's device ──────
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://roomx.site'
  const callbackUrl = params.callbackUrl || `${appUrl}/api/webhooks/clickpesa`

  const initiatePayload: any = {
    amount,
    currency,
    orderReference,
    phoneNumber: phone,
    channel,
    callbackUrl,
    description: params.description,
  }
  initiatePayload.checksum = calculateChecksum(initiatePayload, apiKey)

  console.log('[Payment] Initiating USSD push — ref:', orderReference, '| channel:', channel, '| callback:', callbackUrl)
  const initiateRes = await fetch(`${BASE_URL}/third-parties/payments/initiate-ussd-push-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(initiatePayload),
  })

  const initiateText = await initiateRes.text()
  let initiateData: Record<string, unknown> = {}
  try { initiateData = JSON.parse(initiateText) } catch { /* non-JSON */ }

  console.log('[Payment] Initiate raw response:', JSON.stringify(initiateData))

  if (!initiateRes.ok) {
    const errMsg = String((initiateData as any).message || (initiateData as any).error || initiateText || `HTTP ${initiateRes.status}`)
    console.error('[Payment] Initiate failed:', initiateRes.status, initiateText)
    throw new Error(errMsg)
  }

  // Store orderReference as paymentId — the Query Status endpoint uses it as the path param
  const paymentId = String(initiateData.orderReference || orderReference)
  const responseStatus = String(initiateData.status || initiateData.message || 'processing')
  console.log('[Payment] USSD push sent — id:', initiateData.id, '| ref:', paymentId, '| status:', responseStatus)
  return { paymentId, status: 'processing' }
}

/** ─────────────────────────────────────────────
 *  Charge a card directly
 * ───────────────────────────────────────────── */
export async function chargeCard(params: {
  amount: number
  currency: string
  description: string
  cardholderName: string
  cardNumber: string
  expiryDate: string
  cvv: string
  customerEmail: string
  metadata?: Record<string, string>
}): Promise<{ paymentId: string; status: string }> {
  const userId = params.metadata?.userId || 'u'
  const roomId = params.metadata?.roomId || 'r'
  const orderReference = generateOrderReference(userId, roomId)
  const fallbackId = sandboxPaymentId(userId, roomId)

  const token = await generateJWT()
  if (!token) {
    console.warn('[Payment] No JWT available. Using sandbox card approval.')
    return { paymentId: fallbackId, status: 'success' }
  }

  const [expMonth, expYear] = params.expiryDate.split('/')

  // ClickPesa initiate card payment schema
  const payload: any = {
    amount: String(Math.round(Number(params.amount))),
    currency: params.currency.toUpperCase(),
    orderReference: orderReference,
    card: {
      holderName: params.cardholderName.trim(),
      number: params.cardNumber.replace(/\s+/g, ''),
      expiryMonth: expMonth?.trim(),
      expiryYear: expYear?.trim(),
      cvv: params.cvv.trim(),
    },
    customer: { email: params.customerEmail },
  }

  // Generate checksum then add checksumMethod as informational field
  const apiKey = getApiKey()
  payload.checksum = calculateChecksum(payload, apiKey)
  payload.checksumMethod = 'HMAC_SHA256'

  console.log('[Payment] Charging card via ClickPesa...')
  const response = await fetch(`${BASE_URL}/third-parties/payments/initiate-card-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const text = await response.text()
  let data: Record<string, unknown> = {}
  try { data = JSON.parse(text) } catch { /* non-JSON */ }

  if (!response.ok) {
    const errMsg = String((data as any).message || (data as any).error || (data as any).detail || text || `HTTP ${response.status}`)
    console.error('[Payment] Card charge failed:', response.status, text)
    throw new Error(errMsg)
  }

  const status = String(data.status || 'success')
  const paymentId = String(data.id || data.orderReference || orderReference)
  console.log('[Payment] Card charged — status:', status, '| id:', paymentId)
  return { paymentId, status }
}

/** ─────────────────────────────────────────────
 *  Verify / poll payment status
 * ───────────────────────────────────────────── */
export async function verifyPayment(paymentId: string): Promise<{
  status: string
  amount: number
  currency: string
  metadata?: Record<string, string>
}> {
  const fallback = {
    status: 'pending',
    amount: 0,
    currency: 'TZS',
    metadata: {},
  }

  // Sandbox IDs skip real verification
  if (paymentId.startsWith('pay_')) return { ...fallback, status: 'success' }

  const token = await generateJWT()
  if (!token) return fallback

  try {
    // ClickPesa Query Status: GET /third-parties/payments/{orderReference}
    // Returns an array of payment records
    console.log('[Payment] Querying status for orderReference:', paymentId)
    const response = await fetch(`${BASE_URL}/third-parties/payments/${paymentId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    const text = await response.text()
    let raw: unknown
    try { raw = JSON.parse(text) } catch { /* non-JSON */ }

    if (!response.ok) {
      console.warn('[Payment] Status query error:', response.status, text)
      return fallback
    }

    // Response is an array — use the most recent record
    const record: Record<string, unknown> = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown>
    if (!record) {
      console.warn('[Payment] Empty status response for:', paymentId)
      return fallback
    }

    // ClickPesa status values: SUCCESS, SETTLED, PROCESSING, PENDING, FAILED
    const raw_status = String(record.status || '').toUpperCase()
    const normalizedStatus =
      raw_status === 'SUCCESS' || raw_status === 'SETTLED' ? 'success'
      : raw_status === 'FAILED' ? 'failed'
      : 'pending'

    console.log('[Payment] Status for', paymentId, '→', raw_status, '(normalized:', normalizedStatus + ')')
    return {
      status: normalizedStatus,
      amount: Number(record.collectedAmount || 0),
      currency: String(record.collectedCurrency || 'TZS'),
      metadata: (record.metadata as Record<string, string>) ?? {},
    }
  } catch (error) {
    console.warn('[Payment] Verify network error:', error)
    return fallback
  }
}

/** ─────────────────────────────────────────────
 *  Create a hosted checkout / redirect payment
 * ───────────────────────────────────────────── */
export async function createPaymentRequest(params: {
  amount: number
  currency: string
  description: string
  customerEmail: string
  customerName?: string
  customerPhone?: string
  callbackUrl: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<{ paymentUrl: string; paymentId: string }> {
  const userId = params.metadata?.userId || 'u'
  const roomId = params.metadata?.roomId || 'r'
  const orderReference = generateOrderReference(userId, roomId)
  const fallbackId = sandboxPaymentId(userId, roomId)
  const fallbackUrl = `${params.successUrl}${params.successUrl.includes('?') ? '&' : '?'}paymentId=${fallbackId}`

  const token = await generateJWT()
  if (!token) {
    return { paymentUrl: fallbackUrl, paymentId: fallbackId }
  }

  // ClickPesa generate-checkout-url schema
  const payload: any = {
    totalPrice: String(Math.round(Number(params.amount))),
    orderCurrency: params.currency.toUpperCase(),
    orderReference: orderReference,
    customerName: (params.customerName || 'Customer').trim(),
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone || '',
    description: params.description || '',
  }

  // Generate and append checksum
  const apiKey = getApiKey()
  payload.checksum = calculateChecksum(payload, apiKey)

  try {
    console.log('[Payment] Generating hosted checkout URL for ref:', orderReference)
    const response = await fetch(`${BASE_URL}/third-parties/checkout-link/generate-checkout-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    let data: Record<string, unknown> = {}
    try { data = JSON.parse(text) } catch { /* non-JSON */ }

    if (!response.ok) {
      console.warn('[Payment] Create hosted checkout error:', response.status, text)
      return { paymentUrl: fallbackUrl, paymentId: fallbackId }
    }

    return {
      paymentUrl: String(data.paymentUrl || data.url || fallbackUrl),
      paymentId: orderReference,
    }
  } catch (error) {
    console.warn('[Payment] Create hosted checkout error:', error)
    return { paymentUrl: fallbackUrl, paymentId: fallbackId }
  }
}

/** ─────────────────────────────────────────────
 *  Create a recurring subscription (via hosted checkout)
 * ───────────────────────────────────────────── */
export async function createSubscription(params: {
  amount: number
  currency: string
  description: string
  customerEmail: string
  customerName?: string
  interval: 'month' | 'year'
  callbackUrl: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<{ paymentUrl: string; subscriptionId: string }> {
  const payment = await createPaymentRequest({
    amount: params.amount,
    currency: params.currency,
    description: params.description,
    customerEmail: params.customerEmail,
    customerName: params.customerName,
    callbackUrl: params.callbackUrl,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
    metadata: {
      ...params.metadata,
      subscription: 'true',
      interval: params.interval,
    },
  })
  return { paymentUrl: payment.paymentUrl, subscriptionId: payment.paymentId }
}
