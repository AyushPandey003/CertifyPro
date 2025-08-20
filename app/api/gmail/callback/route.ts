import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'

/**
 * GET /api/gmail/callback?code=...
 * Reads knowledge/credentials.json, exchanges code for tokens, writes knowledge/token.json
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    const clientId = process.env.CLIENT_ID
    const clientSecret = process.env.CLIENT_SECRET
    const redirectUri = `${process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/callback`
    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'Missing env CLIENT_ID/CLIENT_SECRET/APP_BASE_URL' }, { status: 400 })
    }
    const creds = { clientId, clientSecret, redirectUri }
    const oauth2Client = new google.auth.OAuth2(creds.clientId, creds.clientSecret, creds.redirectUri)

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const storeDir = path.join(process.cwd(), 'CertifyPro', '.gmail')
    try { fs.mkdirSync(storeDir, { recursive: true }) } catch {}
    const tokenPath = path.join(storeDir, 'token.json')
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2), 'utf-8')

    return NextResponse.redirect(new URL('/email', request.url))
  } catch (error) {
    console.error('Gmail OAuth callback error:', error)
    return NextResponse.json({ error: 'OAuth callback failed' }, { status: 500 })
  }
}


