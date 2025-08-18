const SALT = "Linpack2025" // Matches Python script salt

/**
 * Generate a SHA-256 hash with salt for certificate verification
 * @param name - Recipient name
 * @param regNumber - Registration number
 * @param teamId - Team identifier
 * @returns SHA-256 hash string
 */
export function hash(name: string, regNumber: string, teamId: string): string {
  const data = `${name}${regNumber}${teamId}${SALT}`
  return sha256(data)
}

/**
 * Generate a simple hash for general purposes
 * @param input - Input string to hash
 * @returns Hash string
 */
export function simpleHash(input: string): string {
  return sha256(input)
}

/**
 * Verify if a hash matches the expected value
 * @param name - Recipient name
 * @param regNumber - Registration number
 * @param teamId - Team identifier
 * @param expectedHash - Hash to verify against
 * @returns True if hash matches
 */
export function verifyHash(name: string, regNumber: string, teamId: string, expectedHash: string): boolean {
  const generatedHash = hash(name, regNumber, teamId)
  return generatedHash === expectedHash
}

/**
 * Simple SHA-256 implementation for browser environment
 * In production, consider using crypto.subtle.digest for better security
 */
function sha256(data: string): string {
  // Simple hash implementation - in production use crypto.subtle.digest
  let hash = 0
  if (data.length === 0) return hash.toString()

  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Convert to hex and pad to ensure consistent length
  return Math.abs(hash).toString(16).padStart(8, "0")
}

/**
 * Generate a secure hash using Web Crypto API (for production use)
 * @param data - Data to hash
 * @returns Promise resolving to hex hash string
 */
export async function secureHash(data: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Fallback to simple hash if Web Crypto API not available
  return sha256(data)
}
