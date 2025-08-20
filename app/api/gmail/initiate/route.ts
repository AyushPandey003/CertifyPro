import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

/**
 * POST /api/gmail/initiate
 * Body: { clientId: string, clientSecret: string, redirectUri: string }
 * Returns: { authUrl: string }
 * Saves credentials to knowledge/credentials.json for callback use
 */
export async function POST(request: NextRequest) {
  try {
    let clientId: string | undefined
    let clientSecret: string | undefined
    let redirectUri: string | undefined

    try {
      const body = await request.json()
      clientId = body.clientId
      clientSecret = body.clientSecret
      redirectUri = body.redirectUri
    } catch {
      // no-op: body may be empty
    }

    clientId = clientId || process.env.CLIENT_ID
    clientSecret = clientSecret || process.env.CLIENT_SECRET
    redirectUri = redirectUri || `${process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/callback`

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'Missing CLIENT_ID/CLIENT_SECRET/APP_BASE_URL in env or request body' }, { status: 400 })
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
    const scopes = ['https://www.googleapis.com/auth/gmail.send']
    const authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes, prompt: 'consent' })

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating Gmail auth URL:', error)
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}


