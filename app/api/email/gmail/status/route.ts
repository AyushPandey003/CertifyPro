import { NextResponse, type NextRequest } from 'next/server'
import { getStoredGmailTokens, __setTokens } from '@/app/api/email/gmail/callback/route'
import { google } from 'googleapis'
import { isAuthEnabled, safeGetSession } from '@/lib/auth-utils'
// import { db } from '@/app/db'
// import { OAuthTokens } from '@/app/db/schema'
// import { decrypt } from '@/lib/crypto'
// import { eq, and } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  let stored = getStoredGmailTokens()
  const connectedCookie = req.cookies.get('gmail_connected')?.value === '1'
  let connected = Boolean(stored) || connectedCookie
  let hasRefresh = Boolean(stored?.refresh_token)

  // If no in-memory tokens, try to use environment refresh token
  if (!stored) {
    const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
    const clientSecret = process.env.GMAIL_CLIENT_SECRET
    const redirectUri = process.env.GMAIL_REDIRECT_URI
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN

    console.log('Attempting to refresh token from env:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRedirectUri: !!redirectUri,
      hasRefreshToken: !!refreshToken
    })

    if (clientId && clientSecret && redirectUri && refreshToken) {
      try {
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
        oauth2Client.setCredentials({ refresh_token: refreshToken })
        const { credentials } = await oauth2Client.refreshAccessToken()
        
        if (credentials.access_token) {
          const tokens = {
            access_token: credentials.access_token,
            refresh_token: refreshToken,
            expiry_date: credentials.expiry_date ?? undefined
          }
          __setTokens(tokens)
          stored = tokens
          connected = true
          hasRefresh = true
          console.log('Successfully refreshed tokens from env')
        }
      } catch (error) {
        console.error('Failed to refresh token from env:', error)
      }
    }
  }

  // Try DB token recovery with safe Auth0 handling
  if (!stored && isAuthEnabled
    ()) {
    try {
      const session = await safeGetSession(req)
      if (session?.user?.sub) {
        // TODO: Re-enable DB token recovery when ready
        /*
        const userId = session.user.sub as string
        const rows = await db.select().from(OAuthTokens).where(and(eq(OAuthTokens.userId, userId), eq(OAuthTokens.provider, 'gmail'))).limit(1)
        const row = rows[0]
        if (row) {
          hasRefresh = true
          const refreshToken = decrypt(row.refreshTokenEnc)
          const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
          const clientSecret = process.env.GMAIL_CLIENT_SECRET
          const redirectUri = process.env.GMAIL_REDIRECT_URI
          if (clientId && clientSecret && redirectUri) {
            try {
              const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
              oauth2Client.setCredentials({ refresh_token: refreshToken })
              const { credentials } = await oauth2Client.refreshAccessToken()
              if (credentials.access_token) {
                __setTokens({ access_token: credentials.access_token, refresh_token: refreshToken, expiry_date: credentials.expiry_date ?? undefined })
                stored = { access_token: credentials.access_token, refresh_token: refreshToken, expiry_date: credentials.expiry_date ?? undefined }
                connected = true
              }
            } catch { }
          }
        }
        */
      }
    } catch (error) {
      console.error('Safe Auth0 session error in Gmail status:', error)
    }
  }

  // If no in-memory token but we have refresh token cookie, attempt silent refresh to reconstruct state
  return NextResponse.json({ connected, hasRefresh })
}
