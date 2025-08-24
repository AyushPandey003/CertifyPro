import { NextResponse } from 'next/server'

export async function POST() {
  // Deprecated: per-user OAuth client storage is no longer supported.
  // Keep the endpoint to return a clear signal to clients that this functionality has been removed.
  return NextResponse.json({ success: false, error: 'Per-user OAuth client storage has been removed. Use environment-provided client credentials or connect via the OAuth flow.' }, { status: 410 })
}

// Get status
export async function GET() {
  // Deprecated: always report no per-user config
  return NextResponse.json({ success: true, hasConfig: false, provider: 'gmail' })
}
