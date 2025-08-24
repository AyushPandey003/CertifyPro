import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export const runtime = 'nodejs'

export async function GET() {
  // Use environment-provided OAuth client configuration for generating the auth URL
  const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID || ''
  const clientSecret = process.env.GMAIL_CLIENT_SECRET || ''
  const redirectUri = process.env.GMAIL_REDIRECT_URI || ''

  if (!clientId || !redirectUri) {
    return NextResponse.json({
      error: 'Gmail OAuth not configured. Add client credentials in Settings or set NEXT_PUBLIC_GMAIL_CLIENT_ID and GMAIL_REDIRECT_URI.',
    }, { status: 400 })
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret || 'unused', redirectUri)

  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
  ]

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  })

  return NextResponse.redirect(authUrl)
}
