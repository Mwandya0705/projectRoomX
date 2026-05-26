/**
 * RoomX Email Server — Powered by Resend
 *
 * IMPORTANT: Resend's free `onboarding@resend.dev` sender can ONLY
 * send to the email address you used to sign up for Resend.
 * To send to ANY email address, verify your domain in Resend:
 *   https://resend.com/domains
 *
 * Once verified, update RESEND_FROM_EMAIL in your .env.local:
 *   RESEND_FROM_EMAIL=noreply@yourdomain.com
 *
 * Until then, emails will only work to your own Resend account email.
 */
import { Resend } from 'resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const FROM_NAME = 'RoomX'
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set. Emails will not be sent.')
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

// ─── Shared email styles ────────────────────────────────────────────────────
const styles = {
  wrapper: `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;`,
  header: `background: #0d2a21; padding: 40px 48px; border-radius: 16px 16px 0 0;`,
  body: `padding: 40px 48px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;`,
  heading: `color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;`,
  subheading: `color: #10b981; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin: 8px 0 0 0;`,
  text: `color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;`,
  button: `display: inline-block; padding: 14px 32px; background-color: #0d2a21; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 700; font-size: 14px; letter-spacing: 0.05em;`,
  card: `background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0;`,
  footer: `color: #9ca3af; font-size: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6;`,
}

/**
 * Generate invitation link with token
 */
export function generateInvitationLink(email: string, roomId: string, inviterId: string): string {
  const token = Buffer.from(`${email}:${roomId}:${inviterId}:${Date.now()}`).toString('base64')
  return `${APP_URL}/sign-up?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&room=${roomId}`
}

// ─────────────────────────────────────────────────────────────────────────────
//  Welcome Email — sent when a user creates an account
// ─────────────────────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(params: {
  to: string
  name: string
}): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const displayName = params.name || 'Creator'

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `Welcome to RoomX, ${displayName} 🌿`,
      html: `
        <div style="${styles.wrapper}">
          <div style="${styles.header}">
            <p style="${styles.subheading}">Welcome to the Sanctuary</p>
            <h1 style="${styles.heading}">You're in, ${displayName}.</h1>
          </div>
          <div style="${styles.body}">
            <p style="${styles.text}">
              Your RoomX account is ready. You now have access to the Infrastructure of Influence — 
              private rooms, live collaboration, AI studio, and more.
            </p>

            <div style="${styles.card}">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #0d2a21; text-transform: uppercase; letter-spacing: 0.08em;">What you can do now</p>
              <ul style="margin: 0; padding: 0 0 0 16px; color: #4b5563; font-size: 14px; line-height: 2;">
                <li>Create your first private <strong>Room</strong></li>
                <li>Invite collaborators and subscribers</li>
                <li>Go live with real-time 4K streaming</li>
                <li>Generate content with the AI Studio</li>
              </ul>
            </div>

            <a href="${APP_URL}/dashboard" style="${styles.button}">
              Open RoomX Dashboard →
            </a>

            <p style="${styles.footer}">
              You're receiving this because you just created a RoomX account.<br/>
              RoomX — The Infrastructure of Influence.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[Email] Welcome email failed:', error)
    } else {
      console.log(`[Email] ✅ Welcome email sent to ${params.to}`)
    }
  } catch (err) {
    console.error('[Email] Welcome email error:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Invitation Email — sent when a creator invites someone to a room
// ─────────────────────────────────────────────────────────────────────────────
export async function sendInvitationEmail(params: {
  to: string
  roomTitle: string
  inviterName: string
  invitationLink: string
}): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.log('[Email] Invitation details (not sent):', params)
    return
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `${params.inviterName} invited you to join "${params.roomTitle}" on RoomX`,
      html: `
        <div style="${styles.wrapper}">
          <div style="${styles.header}">
            <p style="${styles.subheading}">Private Sanctuary Invitation</p>
            <h1 style="${styles.heading}">You've been invited.</h1>
          </div>
          <div style="${styles.body}">
            <p style="${styles.text}">
              <strong>${params.inviterName}</strong> has given you exclusive access to their private sanctuary on RoomX:
            </p>

            <div style="${styles.card}">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">Room</p>
              <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #0d2a21;">${params.roomTitle}</h2>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">By ${params.inviterName}</p>
            </div>

            <a href="${params.invitationLink}" style="${styles.button}">
              Accept Invitation &amp; Join →
            </a>

            <p style="margin-top: 20px; ${styles.text}">
              Or paste this link in your browser:<br/>
              <a href="${params.invitationLink}" style="color: #10b981; font-size: 13px;">${params.invitationLink}</a>
            </p>

            <p style="${styles.footer}">
              You received this invitation because ${params.inviterName} added your email.<br/>
              RoomX — The Infrastructure of Influence.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[Email] Invitation email failed:', error)
    } else {
      console.log(`[Email] ✅ Invitation email sent to ${params.to}`)
    }
  } catch (err) {
    console.error('[Email] Invitation email error:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Scheduling Invite Email — sent for scheduling events/sessions
// ─────────────────────────────────────────────────────────────────────────────
export async function sendSchedulingInviteEmail(params: {
  to: string
  recipientName?: string
  senderName: string
  activityTitle: string
  durationMinutes: number
  personalMessage?: string
  inviteLink: string
}): Promise<void> {
  const resend = getResend()
  if (!resend) return

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `[Invitation] ${params.senderName} invited you to "${params.activityTitle}"`,
      html: `
        <div style="${styles.wrapper}">
          <div style="${styles.header}">
            <p style="${styles.subheading}">Sanctuary Session Invitation</p>
            <h1 style="${styles.heading}">Your session awaits.</h1>
          </div>
          <div style="${styles.body}">
            <p style="${styles.text}">
              Hello${params.recipientName ? `, <strong>${params.recipientName}</strong>` : ''},<br/>
              <strong>${params.senderName}</strong> has invited you to a private session.
            </p>

            <div style="${styles.card}">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">Activity</p>
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0d2a21;">${params.activityTitle}</h2>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">Duration: ${params.durationMinutes} minutes</p>
              ${params.personalMessage ? `<p style="margin: 12px 0 0 0; font-size: 14px; color: #374151; font-style: italic;">"${params.personalMessage}"</p>` : ''}
            </div>

            <a href="${params.inviteLink}" style="${styles.button}">
              Accept Session Invite →
            </a>

            <p style="${styles.footer}">
              Sent via RoomX Sanctuary Sync Engine.<br/>
              RoomX — The Infrastructure of Influence.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[Email] Scheduling invite email failed:', error)
    } else {
      console.log(`[Email] ✅ Scheduling invite sent to ${params.to}`)
    }
  } catch (err) {
    console.error('[Email] Scheduling invite error:', err)
  }
}
