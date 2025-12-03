import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set in environment variables')
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendInvitationEmail({
  to,
  podName,
  invitationLink,
}: {
  to: string
  podName: string
  invitationLink: string
}) {
  if (!resend) {
    const error = 'Resend is not configured. RESEND_API_KEY is missing.'
    console.error(error)
    return { success: false, error: new Error(error) }
  }

  try {
    // Use custom domain if configured, otherwise fall back to Resend test domain
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'WACE <onboarding@resend.dev>'
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `You've been invited to join ${podName} on WACE`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pod Invitation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
              <h1 style="color: #000; margin-top: 0;">You've been invited!</h1>
              <p>You've been invited to join <strong>${podName}</strong> on WACE.</p>
              <p>Click the button below to accept the invitation:</p>
              <a href="${invitationLink}" 
                 style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Accept Invitation
              </a>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This invitation will expire in 7 days. If you didn't request this invitation, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

