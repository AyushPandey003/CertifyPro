import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'
import { sendBulkCertificateEmails, type GmailCredentials } from '@/lib/email-service'
import type { OAuth2Client } from 'google-auth-library'

// Helper to send a single email via Gmail API using googleapis
async function sendViaGmailAPI(
  to: string,
  subject: string,
  body: string,
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>,
  oauth2Client?: OAuth2Client
) {
  if (!oauth2Client) return { success: false, error: 'Missing OAuth2 client' }
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  // Build MIME message
  const boundary = 'foo_bar_baz'
  let mime = ''
  mime += `From: Me <me>` + "\r\n"
  mime += `To: ${to}` + "\r\n"
  mime += `Subject: ${subject}` + "\r\n"
  mime += 'MIME-Version: 1.0' + "\r\n"
  if (attachments && attachments.length > 0) {
    mime += `Content-Type: multipart/mixed; boundary="${boundary}"` + "\r\n\r\n"
    mime += `--${boundary}\r\n`
    mime += 'Content-Type: text/plain; charset="UTF-8"\r\n\r\n'
    mime += body + "\r\n"
    for (const att of attachments) {
      const contentBase64 = att.content.toString('base64')
      mime += `--${boundary}\r\n`
      mime += `Content-Type: ${att.contentType}; name="${att.filename}"\r\n`
      mime += 'Content-Transfer-Encoding: base64\r\n'
      mime += `Content-Disposition: attachment; filename="${att.filename}"\r\n\r\n`
      mime += contentBase64 + "\r\n"
    }
    mime += `--${boundary}--`
  } else {
    mime += 'Content-Type: text/plain; charset="UTF-8"\r\n\r\n'
    mime += body
  }

  const raw = Buffer.from(mime).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } })
  return { success: true, messageId: res.data.id }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      recipients, 
      subject, 
      body: emailBody, 
      credentials 
    }: {
      recipients: Array<{
        email: string
        name: string
        certificateBuffer: string // Base64 encoded certificate
        customFields?: Record<string, string>
      }>
      subject: string
      body: string
      credentials?: GmailCredentials
    } = body

    // Validate input
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      )
    }

    // Generate batch ID
    const batchId = crypto.randomUUID()

    // Convert base64 certificates to buffers
    type RecipientWithBuffer = {
      email: string
      name: string
      certificateBuffer: Buffer
      customFields?: Record<string, string>
    }
    const recipientsWithBuffers: RecipientWithBuffer[] = recipients.map(recipient => ({
      ...recipient,
      certificateBuffer: Buffer.from(recipient.certificateBuffer, 'base64')
    }))

    // If Gmail credentials are provided and token is present, use direct Gmail API send here (immediate send)
    let batch
    const storeDir = path.join(process.cwd(), 'CertifyPro', '.gmail')
    const tokenPath = path.join(storeDir, 'token.json')
    const envClientId = process.env.CLIENT_ID
    const envClientSecret = process.env.CLIENT_SECRET
    const envRedirect = `${process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/callback`
    const haveToken = fs.existsSync(tokenPath)
    if (credentials && haveToken && (envClientId && envClientSecret)) {
      const savedCreds = { clientId: envClientId!, clientSecret: envClientSecret!, redirectUri: envRedirect }
      const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'))

      const oauth2Client = new google.auth.OAuth2(savedCreds.clientId, savedCreds.clientSecret, savedCreds.redirectUri)
      oauth2Client.setCredentials(tokens)

      for (const r of recipientsWithBuffers) {
        const personalizedSubject = subject.replace(/\{\{name\}\}/g, r.name)
        const personalizedBody = emailBody.replace(/\{\{name\}\}/g, r.name)
        await sendViaGmailAPI(
          r.email,
          personalizedSubject,
          personalizedBody,
          [{ filename: `${r.name}_certificate.png`, content: r.certificateBuffer as Buffer, contentType: 'image/png' }],
          oauth2Client
        )
        // small delay to respect rate limits
        await new Promise(res => setTimeout(res, 200))
      }
      batch = { batchId }
    } else {
      // Fallback to background batch simulator
      batch = await sendBulkCertificateEmails(
        batchId,
        recipientsWithBuffers,
        subject,
        emailBody,
        credentials
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        batchId: batch.batchId,
        message: 'Email batch started successfully'
      }
    })

  } catch (error) {
    console.error('Error sending certificate emails:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send certificate emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
