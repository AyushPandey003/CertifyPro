
// Secure hashing using bcrypt (sync for simplicity; can switch to async if needed)
import bcrypt from 'bcryptjs'
export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Simple in-memory storage for demo purposes
// In production, this would use a proper database
const users: Map<string, { id: string; email: string; name: string; password: string; createdAt: Date }> = new Map()
const sessions: Map<string, { userId: string; expiresAt: Date }> = new Map()

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}



export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password, salt)
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash)
  } catch {
    return false
  }
}

export function createUser(email: string, name: string, password: string): User {
  const id = generateId()
  const hashedPassword = hashPassword(password)
  const user = {
    id,
    email,
    name,
    password: hashedPassword,
    createdAt: new Date(),
  }

  users.set(email, user)

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  }
}

export function findUserByEmail(email: string): User | null {
  const user = users.get(email)
  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  }
}

export function authenticateUser(email: string, password: string): User | null {
  const user = users.get(email)
  if (!user || !verifyPassword(password, user.password)) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  }
}

export function createSession(userId: string): string {
  const sessionId = generateId()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  sessions.set(sessionId, { userId, expiresAt })
  return sessionId
}

export function getSessionUser(sessionId: string): User | null {
  const session = sessions.get(sessionId)
  if (!session || session.expiresAt < new Date()) {
    if (session) sessions.delete(sessionId)
    return null
  }

  // Find user by ID
  for (const user of users.values()) {
    if (user.id === session.userId) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      }
    }
  }

  return null
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}
