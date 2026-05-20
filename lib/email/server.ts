import { Resend } from 'resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/**
 * Generate registration link with invitation token
 */
export function generateInvitationLink(email: string, roomId: string, inviterId: string): string {
  // Create a simple token (in production, use proper token generation)
  const token = Buffer.from(`${email}:${roomId}:${inviterId}:${Date.now()}`).toString('base64')
  return `${APP_URL}/sign-up?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&room=${roomId}`
}

/**
 * Send invitation email using Resend
 */
export async function sendInvitationEmail(params: {
  to: string
  roomTitle: string
  inviterName: string
  invitationLink: string
}): Promise<void> {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY not found. Email not sent, logging to console instead.')
    console.log('📧 Invitation Details:', params)
    return
  }

  try {
    await resend.emails.send({
      from: 'RoomX <onboarding@resend.dev>', // Update to your verified domain in production
      to: params.to,
      subject: `You've been invited to join ${params.roomTitle} on RoomX`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e5e7eb; rounded: 12px;">
          <h2 style="color: #0d2a21; font-size: 24px; margin-bottom: 24px;">Architect your Reality.</h2>
          <p style="color: #4b5563; line-height: 1.6;">Hi there,</p>
          <p style="color: #4b5563; line-height: 1.6;">
            <strong>${params.inviterName}</strong> has invited you to join their private sanctuary: 
            <strong style="color: #10b981;">${params.roomTitle}</strong>
          </p>
          <div style="margin-top: 32px; margin-bottom: 32px;">
            <a href="${params.invitationLink}" style="display: inline-block; padding: 16px 32px; background-color: #0d2a21; color: white; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px;">
              Accept Invitation & Join
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px;">
            If the button above doesn't work, copy and paste this link into your browser:<br/>
            <a href="${params.invitationLink}" style="color: #10b981;">${params.invitationLink}</a>
          </p>
          <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e5e7eb;" />
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
            Sent by RoomX - The Infrastructure of Influence.
          </p>
        </div>
      `,
    })
    console.log(`✅ Invitation email sent to ${params.to}`)
  } catch (error) {
    console.error(`❌ Failed to send email to ${params.to}:`, error)
    throw error
  }
}


