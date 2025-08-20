import { type NextRequest, NextResponse } from "next/server"
import { google } from 'googleapis'
import { getStoredGmailTokens, __setTokens } from '@/app/api/email/gmail/callback/route'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

interface ApiAttachment { filename: string; content: string; contentType: string }
interface SendPayload { to: string; subject: string; body?: string; attachments?: ApiAttachment[] }

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body = '', attachments }: SendPayload = await request.json()
    const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
    const clientSecret = process.env.GMAIL_CLIENT_SECRET
    const redirectUri = process.env.GMAIL_REDIRECT_URI
    let tokens = getStoredGmailTokens()
    // Reconstruct from refresh token cookie if missing
    if (!tokens) {
      const cookieStore = await cookies()
      const refreshCookie = cookieStore.get('gmail_refresh')?.value
      if (refreshCookie && clientId && clientSecret && redirectUri) {
        try {
          const refreshToken = Buffer.from(refreshCookie, 'base64').toString('utf-8')
          const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
          oauth2Client.setCredentials({ refresh_token: refreshToken })
          const { credentials } = await oauth2Client.refreshAccessToken()
          if (credentials.access_token) {
            tokens = { access_token: credentials.access_token, refresh_token: credentials.refresh_token || refreshToken, expiry_date: credentials.expiry_date ?? undefined }
            __setTokens(tokens)
          }
        } catch {
          console.warn('[gmail] failed silent refresh from cookie')
        }
      }
    }
    if (!(tokens && clientId && clientSecret && redirectUri)) {
      return NextResponse.json({ success: false, simulated: true, error: 'Gmail not connected' }, { status: 200 })
    }
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
    // Refresh if near expiry (within 60s)
    if (tokens.expiry_date && Date.now() > tokens.expiry_date - 60_000 && tokens.refresh_token) {
      try {
        oauth2Client.setCredentials({ refresh_token: tokens.refresh_token })
        const { credentials } = await oauth2Client.refreshAccessToken()
        if (credentials.access_token) {
          tokens = { access_token: credentials.access_token, refresh_token: credentials.refresh_token || tokens.refresh_token, expiry_date: credentials.expiry_date ?? undefined }
          __setTokens(tokens)
        }
      } catch {
        console.warn('[gmail] refresh attempt failed, using existing token')
      }
    }
    oauth2Client.setCredentials(tokens)
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    const boundary = 'CERTIFYPRO_BOUNDARY'
    const parts: string[] = []
    parts.push('MIME-Version: 1.0')
    parts.push(`To: ${to}`)
    parts.push(`Subject: ${subject}`)
    parts.push(`Content-Type: multipart/mixed; boundary=${boundary}\n`)
    parts.push(`--${boundary}`)
    parts.push('Content-Type: text/plain; charset="UTF-8"')
    parts.push('Content-Transfer-Encoding: 7bit\n')
    parts.push(body)
    if (attachments) {
      for (const att of attachments) {
        parts.push(`--${boundary}`)
        parts.push(`Content-Type: ${att.contentType}; name="${att.filename}"`)
        parts.push('Content-Transfer-Encoding: base64')
        parts.push(`Content-Disposition: attachment; filename="${att.filename}"\n`)
        parts.push(att.content)
      }
    }
    parts.push(`--${boundary}--`)
    const raw = Buffer.from(parts.join('\n')).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
    const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } })
    return NextResponse.json({ success: true, messageId: res.data.id })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to send email'
    console.error('[email] error', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
