import { NextResponse } from 'next/server'
import { getStoredGmailTokens, __clearTokens } from '@/app/api/email/gmail/callback/route'
import { google } from 'googleapis'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const tokens = getStoredGmailTokens()
    if (!tokens) return NextResponse.json({ success: false, error: 'Not connected' }, { status: 400 })
    const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
    const clientSecret = process.env.GMAIL_CLIENT_SECRET
    const redirectUri = process.env.GMAIL_REDIRECT_URI
    if (!(clientId && clientSecret && redirectUri)) {
      return NextResponse.json({ success: false, error: 'Env missing' }, { status: 500 })
    }
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
    if (tokens.refresh_token) {
      await oauth2Client.revokeToken(tokens.refresh_token)
    } else {
      await oauth2Client.revokeToken(tokens.access_token)
    }
    __clearTokens()
    const res = NextResponse.json({ success: true, revoked: true })
    res.cookies.set('gmail_refresh', '', { path: '/', maxAge: 0 })
    res.cookies.set('gmail_connected', '', { path: '/', maxAge: 0 })
    return res
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
