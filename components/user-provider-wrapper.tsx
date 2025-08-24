import { auth0 } from '@/lib/auth0'
import { ReactNode } from 'react'

// This is a server component wrapper. It fetches the session on the server
// and passes it as `initialUser` to the client `UserProvider`.
export default async function UserProviderWrapper({ children }: { children: ReactNode }) {
  const session = await auth0.getSession()
  const user = session?.user ?? null

  // Import the client component dynamically so Next treats it as a client boundary.
  const mod = await import('./user-provider')
  const UserProvider = mod.UserProvider

  // @ts-expect-error Rendering a client component from a server component with props is valid in this wrapper
  return <UserProvider initialUser={user}>{children}</UserProvider>
}
