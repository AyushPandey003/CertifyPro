import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (per IP + route) - resets on cold start.
// For production, use Redis (Upstash) or database-backed counters.
interface Bucket { tokens: number; updated: number }
const buckets = new Map<string, Bucket>()

export interface RateLimitOptions { capacity: number; refillRatePerSec: number }
const DEFAULTS: RateLimitOptions = { capacity: 10, refillRatePerSec: 1 }

export function rateLimit(key: string, opts: RateLimitOptions = DEFAULTS): boolean {
  const now = Date.now()
  const bucket = buckets.get(key) || { tokens: opts.capacity, updated: now }
  const delta = (now - bucket.updated) / 1000
  if (delta > 0) {
    bucket.tokens = Math.min(opts.capacity, bucket.tokens + delta * opts.refillRatePerSec)
  }
  bucket.updated = now
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1
    buckets.set(key, bucket)
    return true
  }
  buckets.set(key, bucket)
  return false
}
export async function redisRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  const windowKey = `rl:${key}:${Math.floor(Date.now()/1000 / windowSeconds)}`
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([["INCR", windowKey],["EXPIRE", windowKey, windowSeconds]])
    })
    if (!res.ok) return null
    const data = await res.json() as Array<{ result: number } | number>
    let incrResult = 0
    if (Array.isArray(data) && data.length) {
      const first = data[0]
      if (typeof first === 'number') incrResult = first
      else if (typeof first === 'object' && first !== null && 'result' in first && typeof (first as { result: unknown }).result === 'number') {
        incrResult = (first as { result: number }).result
      }
    }
    const remaining = Math.max(0, limit - incrResult)
    return { allowed: incrResult <= limit, remaining }
  } catch {
    return null
  }
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  if (!domain) return email
  if (user.length <= 2) return user[0] + '*@' + domain
  return user[0] + '***' + user.slice(-1) + '@' + domain
}

export function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  const host = req.headers.get('host')
  if (!host) return false
  try {
    const o = new URL(origin)
    return o.host === host
  } catch {
    return false
  }
}

export function csrfGuard(req: NextRequest): NextResponse | null {
  if (req.method !== 'GET' && !validateOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
  return null
}
