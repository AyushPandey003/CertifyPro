import { NextResponse, type NextRequest } from 'next/server'
import { getStoredGmailTokens, __setTokens } from '@/app/api/email/gmail/callback/route'
import { google } from 'googleapis'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const stored = getStoredGmailTokens()
  const refreshCookie = req.cookies.get('gmail_refresh')?.value
  const connectedCookie = req.cookies.get('gmail_connected')?.value === '1'
  let connected = Boolean(stored) || connectedCookie
  let hasRefresh = Boolean(stored?.refresh_token || refreshCookie)

  // If no in-memory token but we have refresh token cookie, attempt silent refresh to reconstruct state
  if (!stored && refreshCookie) {
    const refreshToken = Buffer.from(refreshCookie, 'base64').toString('utf-8')
    const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
    const clientSecret = process.env.GMAIL_CLIENT_SECRET
    const redirectUri = process.env.GMAIL_REDIRECT_URI
    if (clientId && clientSecret && redirectUri) {
      try {
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
        oauth2Client.setCredentials({ refresh_token: refreshToken })
        const { credentials } = await oauth2Client.refreshAccessToken()
        if (credentials.access_token) {
          __setTokens({ access_token: credentials.access_token, refresh_token: credentials.refresh_token || refreshToken, expiry_date: credentials.expiry_date ?? undefined })
          connected = true
          hasRefresh = true
        }
      } catch {
        // silent fail
      }
    }
  }
  return NextResponse.json({ connected, hasRefresh })
}
