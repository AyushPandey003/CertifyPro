import { auth0 } from "@/lib/auth0"

export async function getUser() {
  const session = await auth0.getSession()
  return session?.user ?? null
}
