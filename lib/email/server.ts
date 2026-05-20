/**
 * Email Utility Functions
 * For sending invitation emails
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Generate registration link with invitation token
 */
export function generateInvitationLink(email: string, roomId: string, inviterId: string): string {
  // Create a simple token (in production, use proper token generation)
  const token = Buffer.from(`${email}:${roomId}:${inviterId}:${Date.now()}`).toString('base64')
  return `${APP_URL}/sign-up?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&room=${roomId}`
}

/**
 * Send invitation email (placeholder - integrate with your email service)
 * For MVP, you can use:
 * - Resend (recommended)
 * - SendGrid
 * - AWS SES
 * - Nodemailer with SMTP
 */
export async function sendInvitationEmail(params: {
  to: string
  roomTitle: string
  inviterName: string
  invitationLink: string
}): Promise<void> {
  // TODO: Integrate with your email service
  // For now, just log the email details
  console.log('📧 Invitation Email (to be sent):', {
    to: params.to,
    subject: `You've been invited to join ${params.roomTitle}`,
    body: `
      Hi,
      
      ${params.inviterName} has invited you to join their room: ${params.roomTitle}
      
      Click the link below to register and join:
      ${params.invitationLink}
      
      If you already have an account, sign in and the invitation will be automatically applied.
      
      Best regards,
      RoomX Team
    `,
  })

  // Example with Resend (uncomment and configure when ready):
  /*
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  await resend.emails.send({
    from: 'RoomX <onboarding@yourdomain.com>',
    to: params.to,
    subject: `You've been invited to join ${params.roomTitle}`,
    html: `
      <div>
        <h2>You've been invited!</h2>
        <p>${params.inviterName} has invited you to join their room: <strong>${params.roomTitle}</strong></p>
        <p>
          <a href="${params.invitationLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            Accept Invitation & Register
          </a>
        </p>
        <p>If you already have an account, <a href="${APP_URL}/sign-in">sign in here</a> and the invitation will be automatically applied.</p>
      </div>
    `,
  })
  */
}


