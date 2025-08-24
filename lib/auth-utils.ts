
import { auth0 } from './auth0'

export function isAuthEnabled(): boolean {
  return Boolean(
    process.env.AUTH0_CLIENT_ID &&
      process.env.AUTH0_CLIENT_SECRET &&
      (process.env.AUTH0_ISSUER_BASE_URL || process.env.AUTH0_DOMAIN)
  )
}

export async function safeGetSession() {
  try {
    const session = await auth0.getSession()
    return session
  } catch {
    return null
  }
}

const _default = { isAuthEnabled, safeGetSession }
export default _default
