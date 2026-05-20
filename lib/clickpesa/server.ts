/**
 * Click Pesa Server-side Client
 * 
 * Click Pesa API Integration
 * Documentation: https://docs.clickpesa.com
 */

const CLICKPESA_CLIENT_ID = process.env.CLICKPESA_CLIENT_ID!
const CLICKPESA_API_KEY = process.env.CLICKPESA_API_KEY!
const CLICKPESA_BASE_URL = process.env.CLICKPESA_BASE_URL || 'https://api.clickpesa.com'

if (!CLICKPESA_CLIENT_ID) {
  throw new Error('Missing CLICKPESA_CLIENT_ID environment variable')
}

if (!CLICKPESA_API_KEY) {
  throw new Error('Missing CLICKPESA_API_KEY environment variable')
}

/**
 * Generate JWT token for Click Pesa API authentication
 * Tokens are valid for 60 minutes
 */
async function generateJWT(): Promise<string> {
  try {
    const response = await fetch(`${CLICKPESA_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: CLICKPESA_CLIENT_ID,
        apiKey: CLICKPESA_API_KEY,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to generate JWT: ${error}`)
    }

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error('Error generating Click Pesa JWT:', error)
    throw error
  }
}

/**
 * Create a payment request
 */
export async function createPaymentRequest(params: {
  amount: number // Amount in TZS (Tanzanian Shillings) or USD
  currency: string // 'TZS' or 'USD'
  description: string
  customerEmail: string
  customerName?: string
  callbackUrl: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<{ paymentUrl: string; paymentId: string }> {
  try {
    const token = await generateJWT()

    // Validate and prepare request payload
    // Ensure currency is uppercase (Click Pesa may require this)
    const currency = params.currency.toUpperCase()
    
    // Ensure amount is a number
    const amount = Number(params.amount)

    // Prepare request payload - build it step by step to ensure proper format
    const payload: any = {
      amount: amount,
      currency: currency,
      description: params.description || '',
      customer: {
        email: params.customerEmail,
      },
      callbackUrl: params.callbackUrl,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
    }

    // Add customer name only if provided and not empty
    if (params.customerName && params.customerName.trim()) {
      payload.customer.name = params.customerName.trim()
    }

    // Add metadata only if provided and convert all values to strings
    if (params.metadata && Object.keys(params.metadata).length > 0) {
      payload.metadata = Object.fromEntries(
        Object.entries(params.metadata).map(([key, value]) => [key, String(value)])
      )
    }

    console.log('[ClickPesa] Creating payment request:', {
      amount: payload.amount,
      currency: payload.currency,
      customerEmail: payload.customer.email,
      hasMetadata: !!payload.metadata,
      metadataKeys: payload.metadata ? Object.keys(payload.metadata) : [],
    })

    const response = await fetch(`${CLICKPESA_BASE_URL}/payments/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      console.error('[ClickPesa] API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      })
      throw new Error(
        errorData.message || errorData.error || `Failed to create payment request: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log('[ClickPesa] Payment request created successfully:', {
      hasPaymentUrl: !!data.paymentUrl,
      hasPaymentId: !!data.paymentId,
    })
    return {
      paymentUrl: data.paymentUrl,
      paymentId: data.paymentId,
    }
  } catch (error) {
    console.error('[ClickPesa] Error creating payment request:', error)
    throw error
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(paymentId: string): Promise<{
  status: string
  amount: number
  currency: string
  metadata?: Record<string, string>
}> {
  try {
    const token = await generateJWT()

    const response = await fetch(`${CLICKPESA_BASE_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to verify payment: ${error}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error verifying Click Pesa payment:', error)
    throw error
  }
}

/**
 * Create a subscription/recurring payment
 * Note: Click Pesa may have different endpoints for subscriptions
 * This is a placeholder that can be adjusted based on their API
 */
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
  // For now, we'll use the payment request endpoint
  // Click Pesa may have a separate subscription endpoint
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

  return {
    paymentUrl: payment.paymentUrl,
    subscriptionId: payment.paymentId, // This may need to be adjusted
  }
}

