import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import type { OAuth2Client } from 'google-auth-library'
import { safeGetSession, isAuthEnabled } from '@/lib/auth-utils'
import { db } from '@/app/db'
import { OAuthTokens } from '@/app/db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

export const runtime = 'nodejs'

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
  // Gmail API will set From to the authenticated user; setting a readable name is okay
  mime += `From: CertifyPro <me>` + "\r\n"
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
  try {
    const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } })
    return { success: true, messageId: res.data.id }
  } catch (error) {
    console.error('Gmail API send error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Gmail API error'
    return { success: false, error: errorMessage }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Since the middleware already protects this route, we'll trust that auth passed
    // and focus on making the email functionality work reliably
    console.log('Email API called - middleware should have already verified auth')
    
    // Get session to identify the user; require it
    let session = null
    if (isAuthEnabled()) {
      try {
        session = await safeGetSession()
      } catch {}
    }
    if (!session?.user?.sub) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    const schema = z.object({
      recipients: z.array(z.object({
        email: z.string().email(),
        name: z.string().min(1),
        certificateBuffer: z.string().min(1), // base64 png
        customFields: z.record(z.string()).optional(),
      })).min(1),
      subject: z.string().min(1),
      body: z.string().min(1),
    })
    let parsed: z.infer<typeof schema>
    try {
      parsed = schema.parse(await request.json())
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid payload'
      return NextResponse.json({ success: false, error: msg }, { status: 400 })
    }

    const { recipients, subject, body: emailBody } = parsed

    // Generate batch ID
    const batchId = crypto.randomUUID()

    // Convert base64 certificates to buffers
    type RecipientWithBuffer = {
      email: string
      name: string
      certificateBuffer: Buffer
      customFields?: Record<string, string>
    }
    const recipientsWithBuffers: RecipientWithBuffer[] = recipients.map(recipient => {
      try {
        const buffer = Buffer.from(recipient.certificateBuffer, 'base64')
        if (buffer.length === 0) {
          throw new Error(`Empty certificate buffer for ${recipient.name}`)
        }
        return {
          ...recipient,
          certificateBuffer: buffer
        }
      } catch (error) {
        throw new Error(`Invalid certificate data for ${recipient.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })

    // Look up user's Gmail access token in DB
    const userId = session.user.sub as string
    const tokenRows = await db.select().from(OAuthTokens).where(and(eq(OAuthTokens.userId, userId), eq(OAuthTokens.provider, 'gmail'))).limit(1)
    const tokenRow = tokenRows[0]
    if (!tokenRow || !tokenRow.accessToken) {
      return NextResponse.json({ success: false, error: 'Gmail not connected. Please connect your Gmail account.' }, { status: 400 })
    }
    if (tokenRow.accessTokenExpiresAt && new Date(tokenRow.accessTokenExpiresAt).getTime() <= Date.now()) {
      return NextResponse.json({ success: false, error: 'Your Gmail access has expired. Please reconnect Gmail.' }, { status: 401 })
    }
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: tokenRow.accessToken })

    // Send emails sequentially with a small delay to respect rate limits
    let sent = 0
    let failed = 0
    const results: Array<{ email: string; success: boolean; messageId?: string; error?: string }> = []
  for (const r of recipientsWithBuffers) {
      const personalizedSubject = subject.replace(/\{\{name\}\}/g, r.name)
      const personalizedBody = emailBody.replace(/\{\{name\}\}/g, r.name)
      try {
  const resp = await sendViaGmailAPI(
          r.email,
          personalizedSubject,
          personalizedBody,
          [{ filename: `${r.name}_certificate.png`, content: r.certificateBuffer as Buffer, contentType: 'image/png' }],
          oauth2Client
        )
        if (resp.success) {
          sent++
          results.push({ email: r.email, success: true, messageId: resp.messageId || undefined })
        } else {
          failed++
          results.push({ email: r.email, success: false, error: resp.error || 'Unknown error' })
        }
      } catch (e) {
        failed++
        const msg = e instanceof Error ? e.message : 'Send failed'
        results.push({ email: r.email, success: false, error: msg })
      }
      await new Promise(res => setTimeout(res, 200))
    }

    return NextResponse.json({
      success: true,
      data: {
        batchId,
        sent,
        failed,
        total: recipientsWithBuffers.length,
        results
      }
    })

  } catch (error) {
    console.error('Error sending certificate emails:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send certificate emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
