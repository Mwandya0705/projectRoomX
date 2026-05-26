/**
 * RoomX Payment Server
 *
 * Uses PAYMENT_API_KEY as a direct Bearer token.
 * No mock / simulation — all paths hit the real payment API.
 */

const PAYMENT_BASE_URL =
  process.env.PAYMENT_BASE_URL || 'https://api.clickpesa.com'

function getApiKey(): string {
  const key = process.env.PAYMENT_API_KEY
  if (!key || key === 'dummy-payment-key-for-build') {
    throw new Error(
      'PAYMENT_API_KEY is not configured. Please add it to your environment variables.'
    )
  }
  return key
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getApiKey()}`,
  }
}

/** ─────────────────────────────────────────────
 *  Create a payment / charge request
 * ───────────────────────────────────────────── */
export async function createPaymentRequest(params: {
  amount: number
  currency: string
  description: string
  customerEmail: string
  customerName?: string
  callbackUrl: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<{ paymentUrl: string; paymentId: string }> {
  const currency = params.currency.toUpperCase()
  const amount = Math.round(Number(params.amount))

  const payload: Record<string, unknown> = {
    amount,
    currency,
    description: params.description || '',
    customer: { email: params.customerEmail },
    callbackUrl: params.callbackUrl,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
  }

  if (params.customerName?.trim()) {
    ;(payload.customer as Record<string, string>).name = params.customerName.trim()
  }

  if (params.metadata && Object.keys(params.metadata).length > 0) {
    payload.metadata = Object.fromEntries(
      Object.entries(params.metadata).map(([k, v]) => [k, String(v)])
    )
  }

  const response = await fetch(`${PAYMENT_BASE_URL}/payments/request`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorData: { message?: string; error?: string }
    try { errorData = JSON.parse(errorText) } catch { errorData = { message: errorText } }
    console.error('[Payment] API error creating payment request:', {
      status: response.status,
      error: errorData,
    })
    throw new Error(
      errorData.message ||
        errorData.error ||
        `Payment request failed: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  console.log('[Payment] Payment request created successfully')
  return { paymentUrl: data.paymentUrl, paymentId: data.paymentId }
}

/** ─────────────────────────────────────────────
 *  Charge a card directly (card-present flow)
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
  const currency = params.currency.toUpperCase()
  const amount = Math.round(Number(params.amount))

  const [expMonth, expYear] = params.expiryDate.split('/')

  const payload: Record<string, unknown> = {
    amount,
    currency,
    description: params.description || '',
    card: {
      holderName: params.cardholderName.trim(),
      number: params.cardNumber.replace(/\s+/g, ''),
      expiryMonth: expMonth?.trim(),
      expiryYear: expYear?.trim(),
      cvv: params.cvv.trim(),
    },
    customer: { email: params.customerEmail },
  }

  if (params.metadata && Object.keys(params.metadata).length > 0) {
    payload.metadata = Object.fromEntries(
      Object.entries(params.metadata).map(([k, v]) => [k, String(v)])
    )
  }

  console.log('[Payment] Initiating card charge:', {
    amount,
    currency,
    customerEmail: params.customerEmail,
    // Card details deliberately omitted from logs
  })

  const response = await fetch(`${PAYMENT_BASE_URL}/payments/charge`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorData: { message?: string; error?: string }
    try { errorData = JSON.parse(errorText) } catch { errorData = { message: errorText } }
    console.error('[Payment] Card charge failed:', {
      status: response.status,
      error: errorData,
    })
    throw new Error(
      errorData.message ||
        errorData.error ||
        `Card charge failed: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  console.log('[Payment] Card charge response received:', {
    paymentId: data.paymentId || data.id,
    status: data.status,
  })

  return {
    paymentId: data.paymentId || data.id,
    status: data.status,
  }
}

/** ─────────────────────────────────────────────
 *  Charge Mobile Money directly (USSD Push / Mobile Bill)
 * ───────────────────────────────────────────── */
export async function chargeMobileMoney(params: {
  amount: number
  currency: string
  description: string
  phoneNumber: string
  provider: string // 'vodacom' | 'tigo' | 'airtel' | 'halotel'
  customerEmail: string
  metadata?: Record<string, string>
}): Promise<{ paymentId: string; status: string }> {
  const currency = params.currency.toUpperCase()
  const amount = Math.round(Number(params.amount))

  // Clean phone number (convert 075... or +25575... to 25575...)
  let cleanPhone = params.phoneNumber.replace(/\D/g, '')
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '255' + cleanPhone.slice(1)
  } else if (cleanPhone.startsWith('7')) {
    cleanPhone = '255' + cleanPhone
  } else if (!cleanPhone.startsWith('255') && cleanPhone.length === 9) {
    cleanPhone = '255' + cleanPhone
  }

  const payload: Record<string, unknown> = {
    amount,
    currency,
    description: params.description || '',
    mobile: {
      phoneNumber: cleanPhone,
      provider: params.provider.toLowerCase(),
    },
    customer: { email: params.customerEmail },
  }

  if (params.metadata && Object.keys(params.metadata).length > 0) {
    payload.metadata = Object.fromEntries(
      Object.entries(params.metadata).map(([k, v]) => [k, String(v)])
    )
  }

  console.log('[Payment] Initiating mobile money charge:', {
    amount,
    currency,
    provider: params.provider,
    phoneNumber: cleanPhone.substring(0, 6) + 'XXXX',
    customerEmail: params.customerEmail,
  })

  const response = await fetch(`${PAYMENT_BASE_URL}/payments/charge`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorData: { message?: string; error?: string }
    try { errorData = JSON.parse(errorText) } catch { errorData = { message: errorText } }
    console.error('[Payment] Mobile money charge failed:', {
      status: response.status,
      error: errorData,
    })
    throw new Error(
      errorData.message ||
        errorData.error ||
        `Mobile money charge failed: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  console.log('[Payment] Mobile money charge response received:', {
    paymentId: data.paymentId || data.id,
    status: data.status,
  })

  return {
    paymentId: data.paymentId || data.id,
    status: data.status,
  }
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
  const response = await fetch(`${PAYMENT_BASE_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: authHeaders(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to verify payment ${paymentId}: ${error}`)
  }

  return await response.json()
}

/** ─────────────────────────────────────────────
 *  Create a recurring subscription
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
