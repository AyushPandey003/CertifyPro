'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  sub: string
  email: string
  name?: string
  picture?: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  login: () => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children, initialUser }: { children: React.ReactNode, initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [loading, setLoading] = useState(initialUser === undefined)

  useEffect(() => {
    // If an initialUser was provided by the server wrapper, skip fetching.
    if (initialUser !== undefined) return
    checkUser()
  }, [initialUser])

  const checkUser = async () => {
    try {
      const response = await fetch('/auth/user')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

    const login = () => {
      window.location.href = '/auth/login'
    }

    const logout = () => {
      window.location.href = '/auth/logout'
    }

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
