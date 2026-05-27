export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/debug-ussd
 *
 * Debug endpoint — runs the full ClickPesa USSD push flow and returns
 * every raw API response so you can see exactly what is failing.
 *
 * Body: { phoneNumber: "255XXXXXXXXX", provider: "airtel"|"tigo"|"halotel"|"vodacom", amount?: number }
 *
 * ⚠️  REMOVE THIS ENDPOINT BEFORE GOING TO PRODUCTION
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const BASE_URL = process.env.PAYMENT_BASE_URL || 'https://api.clickpesa.com'
const API_KEY  = process.env.PAYMENT_API_KEY  || ''
const CLIENT_ID = process.env.CLICKPESA_CLIENT_ID || ''
const APP_URL   = process.env.NEXT_PUBLIC_APP_URL  || 'https://roomx.site'

function sortKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(sortKeys)
  return Object.keys(obj).sort().reduce((acc: any, k) => { acc[k] = sortKeys(obj[k]); return acc }, {})
}

function checksum(payload: any): string {
  const { checksum: _c, checksumMethod: _m, ...rest } = payload
  return createHmac('sha256', API_KEY).update(JSON.stringify(sortKeys(rest))).digest('hex')
}

async function fetchJson(url: string, init: RequestInit) {
  const res = await fetch(url, init)
  const text = await res.text()
  let json: unknown = null
  try { json = JSON.parse(text) } catch { /* non-JSON */ }
  return { status: res.status, ok: res.ok, text, json, headers: Object.fromEntries(res.headers.entries()) }
}

export async function POST(req: NextRequest) {
  const log: Record<string, unknown>[] = []

  try {
    const body = await req.json()
    const rawPhone: string = body.phoneNumber || ''
    const provider: string = (body.provider || 'airtel').toLowerCase()
    const amount = String(body.amount || 1000)
    const currency = 'TZS'

    // Normalise phone to E.164 Tanzania (no +)
    let phone = rawPhone.replace(/\D/g, '')
    if (phone.startsWith('0'))   phone = '255' + phone.slice(1)
    else if (!phone.startsWith('255')) phone = '255' + phone

    log.push({ step: 'input', phone, provider, amount, currency })

    // ── Step 1: Get JWT ──────────────────────────────────────────────────────
    const tokenResult = await fetchJson(`${BASE_URL}/third-parties/generate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': CLIENT_ID,
        'api-key': API_KEY,
      },
    })
    log.push({ step: '1_generate_token', ...tokenResult })

    if (!tokenResult.ok) {
      return NextResponse.json({ error: 'JWT generation failed', log }, { status: 200 })
    }

    let token = String((tokenResult.json as any)?.token || '')
    token = token.replace(/^Bearer\s+/i, '')

    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'No token in JWT response', log }, { status: 200 })
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }

    // ── Step 2: Preview USSD push ────────────────────────────────────────────
    const orderReference = `RXDBG${Date.now().toString().slice(-13)}`  // 18 chars total
    const previewPayload: any = { amount, currency, orderReference, phoneNumber: phone, fetchSenderDetails: false }
    previewPayload.checksum = checksum(previewPayload)

    const previewResult = await fetchJson(
      `${BASE_URL}/third-parties/payments/preview-ussd-push-request`,
      { method: 'POST', headers: authHeaders, body: JSON.stringify(previewPayload) }
    )
    log.push({ step: '2_preview', payload: previewPayload, ...previewResult })

    if (!previewResult.ok) {
      return NextResponse.json({ error: 'Preview failed', log }, { status: 200 })
    }

    const activeMethods: any[] = (previewResult.json as any)?.activeMethods || []
    const availableNames = activeMethods.map((m: any) => String(m.name || '').toUpperCase())

    const providerKeyword: Record<string, string> = {
      vodacom: 'MPESA', tigo: 'TIGO', airtel: 'AIRTEL', halotel: 'HALO',
    }
    const keyword = providerKeyword[provider] ?? provider.toUpperCase()
    const matchedMethod = activeMethods.find((m: any) =>
      String(m.name || '').toUpperCase().includes(keyword)
    )

    log.push({
      step: '2b_method_selection',
      availableMethods: availableNames,
      searchKeyword: keyword,
      matchedMethod: matchedMethod || null,
    })

    if (!matchedMethod) {
      return NextResponse.json({
        error: `Provider "${provider}" not found. Available: ${availableNames.join(', ')}`,
        log,
      }, { status: 200 })
    }

    const channel = String(matchedMethod.name)

    // ── Step 3: Initiate USSD push ───────────────────────────────────────────
    const callbackUrl = `${APP_URL}/api/webhooks/clickpesa`
    const initiatePayload: any = {
      amount,
      currency,
      orderReference,
      phoneNumber: phone,
      channel,
      callbackUrl,
      description: 'Debug USSD push test',
    }
    initiatePayload.checksum = checksum(initiatePayload)

    const initiateResult = await fetchJson(
      `${BASE_URL}/third-parties/payments/initiate-ussd-push-request`,
      { method: 'POST', headers: authHeaders, body: JSON.stringify(initiatePayload) }
    )
    log.push({ step: '3_initiate', payload: initiatePayload, ...initiateResult })

    // ── Step 4: Query Status immediately ─────────────────────────────────────
    await new Promise(r => setTimeout(r, 2000)) // wait 2s for status to update

    const statusResult = await fetchJson(
      `${BASE_URL}/third-parties/payments/${orderReference}`,
      { method: 'GET', headers: authHeaders }
    )
    log.push({ step: '4_query_status', orderReference, ...statusResult })

    return NextResponse.json({
      success: true,
      orderReference,
      channel,
      initiateStatus: initiateResult.ok ? 'ok' : 'failed',
      initiateResponse: initiateResult.json,
      statusResponse: statusResult.json,
      log,
    })
  } catch (err: any) {
    log.push({ step: 'exception', message: err.message, stack: err.stack })
    return NextResponse.json({ error: err.message, log }, { status: 200 })
  }
}
