import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// NOTE: For demo purposes tokens kept in-memory. Replace with DB in production.
interface StoredGmailTokens { access_token: string; refresh_token?: string; expiry_date?: number }
let gmailTokens: StoredGmailTokens | null = null

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const redirectUri = process.env.GMAIL_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'Gmail OAuth env vars missing' }, { status: 500 })
  }
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  try {
    const { tokens } = await oauth2Client.getToken(code)
    if (!tokens.access_token) throw new Error('No access_token returned')
    gmailTokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date || undefined
    }
    const origin = new URL(req.url).origin
    const target = `${origin}/generate?gmail=connected`
    const res = NextResponse.redirect(target)
    // Persist refresh token (dev/demo only – encrypt for production)
    if (tokens.refresh_token) {
      const encoded = Buffer.from(tokens.refresh_token, 'utf-8').toString('base64')
      res.cookies.set('gmail_refresh', encoded, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
      })
    }
    res.cookies.set('gmail_connected', '1', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
    })
    return res
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Token exchange failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export function getStoredGmailTokens() { return gmailTokens }
// Optional setter for alternate callback path reuse
export function __setTokens(tokens: { access_token: string; refresh_token?: string; expiry_date?: number } | null) { gmailTokens = tokens }
export function __clearTokens() { gmailTokens = null }
