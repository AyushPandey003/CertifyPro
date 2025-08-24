import { type NextRequest, NextResponse } from "next/server"
import { google } from 'googleapis'
import { rateLimit, csrfGuard, maskEmail, redisRateLimit } from '@/lib/security'
import { auth0 } from '@/lib/auth0'
import { z } from 'zod'
import { db } from '@/app/db'
import { OAuthTokens } from '@/app/db/schema'
import { eq, and } from 'drizzle-orm'

export const runtime = 'nodejs'


const attachmentSchema = z.object({
  filename: z.string().max(128),
  content: z.string().base64(),
  contentType: z.string().max(100)
})
const sendSchema = z.object({
  to: z.string().email().max(254),
  subject: z.string().min(1).max(180),
  body: z.string().max(10_000).optional(),
  attachments: z.array(attachmentSchema).max(5).optional()
})

export async function POST(request: NextRequest) {
  try {
    // CSRF / origin check
    const csrf = csrfGuard(request)
    if (csrf) return csrf

    // Auth guard (must have valid Auth0 session)
    const session = await auth0.getSession(request)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit per user + route
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'ip:unknown'
    const rlKey = `send:${session.user.sub}:${ip}`
    // Try distributed limiter first; fallback to in-memory
    const dist = await redisRateLimit(rlKey, 40, 300) // 40 emails per 5 min window per user
    if (dist) {
      if (!dist.allowed) return NextResponse.json({ success: false, error: 'Rate limit exceeded (global)' }, { status: 429 })
    } else {
      if (!rateLimit(rlKey, { capacity: 20, refillRatePerSec: 0.2 })) { // 20 req burst, ~12/min
        return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 })
      }
    }

    let jsonBody: unknown
    try {
      jsonBody = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
    }
    const parsed = sendSchema.safeParse(jsonBody)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { to, subject, body = '', attachments } = parsed.data
    // Fetch the user's saved Gmail access token from DB (no fallbacks)
    const rows = await db.select().from(OAuthTokens).where(and(eq(OAuthTokens.userId, session.user.sub as string), eq(OAuthTokens.provider, 'gmail'))).limit(1)
    const row = rows[0]
    if (!row || !row.accessToken) {
      return NextResponse.json({ success: false, error: 'Gmail not connected. Please connect your Gmail account.' }, { status: 400 })
    }
    // Check expiry if available; require reconnect if expired
    if (row.accessTokenExpiresAt && new Date(row.accessTokenExpiresAt).getTime() <= Date.now()) {
      return NextResponse.json({ success: false, error: 'Your Gmail access has expired. Please reconnect Gmail.' }, { status: 401 })
    }
    // Use access token directly for sending
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: row.accessToken })
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
  return NextResponse.json({ success: true, messageId: res.data.id, to: maskEmail(to) })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to send email'
    console.error('[email] error', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
