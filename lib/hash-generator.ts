// Hybrid hashing utility: lazily loads Node crypto when present (avoids bundling for Edge)
let nodeCrypto: (typeof import('crypto')) | null = null

export interface HashConfig {
  includeName: boolean
  includeEmail: boolean
  includeRollNumber: boolean
  includeTeamId: boolean
  includeEventName: boolean
  includeDate: boolean
  customFields: string[]
  eventName?: string
}
export interface RecipientHashData {
  name: string
  email: string
  rollNumber?: string
  teamId?: string
  customFields?: Record<string, string>
  [key: string]: unknown
}

// Match the salt from the Python implementation
const SALT = "Linpack2025"

export async function generateHash(recipient: RecipientHashData, config: HashConfig): Promise<string> {
  const hashParts: string[] = []

  if (config.includeName && recipient.name) {
    hashParts.push(recipient.name.trim())
  }

  if (config.includeEmail && recipient.email) {
    hashParts.push(recipient.email.trim())
  }

  if (config.includeRollNumber && recipient.rollNumber) {
    hashParts.push(recipient.rollNumber.trim())
  }

  if (config.includeTeamId && recipient.teamId) {
    hashParts.push(recipient.teamId.trim())
  }

  if (config.includeEventName && config.eventName) {
    hashParts.push(config.eventName.trim())
  }

  if (config.includeDate) {
    hashParts.push(new Date().toISOString().split("T")[0])
  }

  // Add custom fields
  if (config.customFields && recipient.customFields) {
    config.customFields.forEach((field) => {
      const value = recipient.customFields?.[field]
      if (value) {
        hashParts.push(value.trim())
      }
    })
  }

  // Create hash from combined data with salt (matching Python implementation)
  const combinedData = hashParts.join("") + SALT
  if (!nodeCrypto && typeof process !== 'undefined' && process.versions?.node) {
    try { nodeCrypto = await import('crypto') } catch { nodeCrypto = null }
  }
  if (nodeCrypto) return nodeCrypto.createHash("sha256").update(combinedData).digest("hex")
  const enc = new TextEncoder().encode(combinedData)
  const digest = await crypto.subtle.digest('SHA-256', enc)
  const bytes = Array.from(new Uint8Array(digest))
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function generateQRCodeData(hash: string, baseUrl?: string): string {
  if (baseUrl) {
    return `${baseUrl}/verify/${hash}`
  }
  return hash
}

export function validateHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/.test(hash) // SHA-256 produces 64 character hex string
}

// Function to generate hash matching the Python implementation exactly
export function generateHashFromPythonData(name: string, regNumber: string, teamId: string): string {
  const data = `${name}${regNumber}${teamId}${SALT}`
  if (!nodeCrypto) throw new Error('Synchronous hash not available in this runtime. Use generateHash instead.')
  return nodeCrypto.createHash("sha256").update(data).digest("hex")
}
