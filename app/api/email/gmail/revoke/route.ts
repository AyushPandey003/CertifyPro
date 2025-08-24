import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { auth0 } from '@/lib/auth0'
import { db } from '@/app/db'
import { OAuthTokens } from '@/app/db/schema'
import { and, eq } from 'drizzle-orm'
import { decrypt } from '@/lib/crypto'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
  const session = await auth0.getSession(req)
  const userId = session?.user?.sub as string | undefined
  if (!userId) return NextResponse.json({ success: false, error: 'Unauthenticated' }, { status: 401 })
  const rows = await db.select().from(OAuthTokens).where(and(eq(OAuthTokens.userId, userId), eq(OAuthTokens.provider, 'gmail'))).limit(1)
  if (!rows.length) return NextResponse.json({ success: false, error: 'Not connected' }, { status: 400 })
  const row = rows[0]
    const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID
    const clientSecret = process.env.GMAIL_CLIENT_SECRET
    const redirectUri = process.env.GMAIL_REDIRECT_URI
    if (!(clientId && clientSecret && redirectUri)) {
      return NextResponse.json({ success: false, error: 'Env missing' }, { status: 500 })
    }
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  const refresh = row.refreshTokenEnc ? decrypt(row.refreshTokenEnc) : null
  if (refresh) await oauth2Client.revokeToken(refresh)
  await db.delete(OAuthTokens).where(and(eq(OAuthTokens.userId, userId), eq(OAuthTokens.provider, 'gmail')))
    const res = NextResponse.json({ success: true, revoked: true })
    res.cookies.set('gmail_connected', '', { path: '/', maxAge: 0 })
    return res
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
