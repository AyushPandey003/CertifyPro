import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { db } from '@/app/db'
import { OAuthTokens, Users } from '@/app/db/schema'
import { and, eq } from 'drizzle-orm'
import { encrypt } from '@/lib/crypto'
import { isAuthEnabled, safeGetSession } from '@/lib/auth-utils'

// NOTE: For demo purposes tokens kept in-memory. Replace with DB in production.
interface StoredGmailTokens { access_token: string; refresh_token?: string; expiry_date?: number }
let gmailTokens: StoredGmailTokens | null = null

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  // Use environment-provided OAuth client for token exchange
  const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const redirectUri = process.env.GMAIL_REDIRECT_URI

  let userId: string | undefined
  if (isAuthEnabled()) {
    try {
      const session = await safeGetSession()
      userId = session?.user?.sub as string | undefined
      if (userId) {
        // nothing to do here for client lookup
      }
    } catch {}
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'Gmail OAuth configuration missing' }, { status: 500 })
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
    let redirect = `${origin}/generate?gmail=connected`
    const res = NextResponse.redirect(redirect)
    try {
      if (!userId) {
        console.error('[gmail-callback] Missing userId/session during callback; cannot persist tokens')
        redirect = `${origin}/generate?gmail=error&reason=${encodeURIComponent('No session user; reconnect and ensure you are logged in')}`
      } else {
        // Ensure Users row exists for FK constraint
        let userEmail: string | undefined
        let userName: string | undefined
        if (isAuthEnabled()) {
          try {
            const s = await safeGetSession()
            userEmail = (s?.user?.email as string | undefined) || undefined
            userName = (s?.user?.name as string | undefined) || undefined
          } catch (e) {
            console.warn('[gmail-callback] safeGetSession failed (non-fatal):', e)
          }
        }
        if (!userEmail) userEmail = `${userId}@gmail`
        try {
          await db.insert(Users).values({ id: userId, email: userEmail, name: userName || null }).onConflictDoUpdate({
            target: Users.id,
            set: { email: userEmail, name: userName || null, updatedAt: new Date() }
          })
        } catch (e) {
          console.error('[gmail-callback] Failed to upsert Users:', e)
          redirect = `${origin}/generate?gmail=error&reason=${encodeURIComponent('DB error creating user')}`
        }

        // Upsert oauth_tokens without relying on ON CONFLICT (in case no unique index exists)
        const enc = tokens.refresh_token ? encrypt(tokens.refresh_token) : null
        const tokenData = {
          userId,
          provider: 'gmail' as const,
          refreshTokenEnc: enc,
          accessToken: tokens.access_token as string,
          accessTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          scopes: Array.isArray(tokens.scope) ? tokens.scope.join(' ') : (tokens.scope || 'gmail.send')
        }
        try {
          const existing = await db.select().from(OAuthTokens).where(and(eq(OAuthTokens.userId, userId), eq(OAuthTokens.provider, 'gmail'))).limit(1)
          if (existing[0]) {
            await db.update(OAuthTokens)
              .set({
                refreshTokenEnc: tokenData.refreshTokenEnc,
                accessToken: tokenData.accessToken,
                accessTokenExpiresAt: tokenData.accessTokenExpiresAt,
                scopes: tokenData.scopes,
                updatedAt: new Date(),
              })
              .where(and(eq(OAuthTokens.userId, userId), eq(OAuthTokens.provider, 'gmail')))
          } else {
            await db.insert(OAuthTokens).values(tokenData)
          }
        } catch (e) {
          console.error('[gmail-callback] Failed to persist OAuthTokens:', {
            userId,
            provider: 'gmail',
            hasRefreshToken: !!tokens.refresh_token,
            expiry: tokens.expiry_date,
            error: e,
          })
          redirect = `${origin}/generate?gmail=error&reason=${encodeURIComponent('DB error saving Gmail tokens')}`
        }
      }
      res.cookies.set('gmail_connected', '1', {
        path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60*60*24*30
      })
      // If any error occurred above, adjust redirect
      if (redirect !== `${origin}/generate?gmail=connected`) {
        return NextResponse.redirect(redirect)
      }
    } catch (e) {
      console.error('[gmail-callback] Unexpected error during persistence:', e)
      return NextResponse.redirect(`${origin}/generate?gmail=error&reason=${encodeURIComponent('Unexpected error during persistence')}`)
    }
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
