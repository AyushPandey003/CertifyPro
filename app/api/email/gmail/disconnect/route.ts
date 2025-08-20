import { NextResponse } from 'next/server'
import { __clearTokens, getStoredGmailTokens } from '@/app/api/email/gmail/callback/route'
import { google } from 'googleapis'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const tokens = getStoredGmailTokens()
    const refreshToken = tokens?.refresh_token
    const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
    const clientSecret = process.env.GMAIL_CLIENT_SECRET
    const redirectUri = process.env.GMAIL_REDIRECT_URI
    if (refreshToken && clientId && clientSecret && redirectUri) {
      try {
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
        await oauth2Client.revokeToken(refreshToken)
      } catch {
        // ignore revoke failure
      }
    }
    __clearTokens()
    const res = NextResponse.json({ success: true })
    // Clear cookies
    res.cookies.set('gmail_refresh', '', { path: '/', maxAge: 0 })
    res.cookies.set('gmail_connected', '', { path: '/', maxAge: 0 })
    return res
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
