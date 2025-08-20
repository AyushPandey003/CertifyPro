import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { __setTokens } from '@/app/api/email/gmail/callback/route'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const redirectUri = process.env.GMAIL_REDIRECT_URI || `${url.origin}/api/auth/callback/google`
  if (!clientId || !clientSecret || !redirectUri) return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  try {
    const { tokens } = await oauth2Client.getToken(code)
    if (!tokens.access_token) throw new Error('No access_token returned')
    __setTokens({
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token || undefined,
      expiry_date: tokens.expiry_date || undefined
    })
    const res = NextResponse.redirect(`${url.origin}/generate?gmail=connected`)
    if (tokens.refresh_token) {
      const encoded = Buffer.from(tokens.refresh_token, 'utf-8').toString('base64')
      res.cookies.set('gmail_refresh', encoded, {
        path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60*60*24*30
      })
    }
    res.cookies.set('gmail_connected', '1', {
      path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60*60*24*30
    })
    return res
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'OAuth error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
