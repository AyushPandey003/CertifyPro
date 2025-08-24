import { safeGetSession } from "@/lib/auth-utils"

export async function getUser() {
  try {
    const session = await safeGetSession()
    return session?.user ?? null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}
