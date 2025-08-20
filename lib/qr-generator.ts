"use client"

import QRCode from 'qrcode'
// Dynamic / dual-environment hashing support (Browser + Node). We'll lazily import crypto in Node.
let nodeCrypto: typeof import('crypto') | null = null
async function ensureNodeCrypto() {
  if (nodeCrypto) return nodeCrypto
  if (typeof window === 'undefined') {
    try {
      nodeCrypto = (await import('crypto'))
      return nodeCrypto
    } catch {
      nodeCrypto = null
    }
  }
  return nodeCrypto
}

export interface QRCodeOptions {
  width: number
  height: number
  backgroundColor: string
  foregroundColor: string
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
}

export interface HashOptions {
  salt?: string
  fields: string[]
  values: Record<string, string>
}

// Default salt for hashing (should be moved to environment variables in production)
const DEFAULT_SALT = "CertifyPro2025"

/**
 * Generate a hash based on recipient data and salt
 * Similar to the Python script's hashing logic
 */
export async function generateHash(options: HashOptions): Promise<string> {
  const { salt = DEFAULT_SALT, fields, values } = options
  const dataString = fields.map(field => values[field] || '').join('') + salt
  // If Node crypto available, use it synchronously
  const nc = await ensureNodeCrypto()
  if (nc) {
    return nc.createHash('sha256').update(dataString).digest('hex')
  }
  // Browser Web Crypto fallback
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const enc = new TextEncoder()
    const buf = await window.crypto.subtle.digest('SHA-256', enc.encode(dataString))
    const hashArray = Array.from(new Uint8Array(buf))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  // Last resort (very unlikely): simple (non-cryptographic) fallback
  let hash = 0
  for (let i = 0; i < dataString.length; i++) {
    hash = (hash << 5) - hash + dataString.charCodeAt(i)
    hash |= 0
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8).padEnd(64, '0')
}

/**
 * Generate QR code data URL for display
 */
export async function generateQRCodeDataURL(data: string, options: QRCodeOptions): Promise<string> {
  try {
    const { width, backgroundColor, foregroundColor, errorCorrectionLevel = 'M' } = options
    
    const qrDataURL = await QRCode.toDataURL(data, {
      width,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      errorCorrectionLevel,
      margin: 1
    })
    
    return qrDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Generate QR code as image buffer for saving
 */
export async function generateQRCodeBuffer(data: string, options: QRCodeOptions): Promise<Buffer> {
  try {
    const { width, backgroundColor, foregroundColor, errorCorrectionLevel = 'M' } = options
    
    const buffer = await QRCode.toBuffer(data, {
      width,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      errorCorrectionLevel,
      margin: 1
    })
    return buffer
  } catch (error) {
    console.error('Error generating QR code buffer:', error)
    throw new Error('Failed to generate QR code buffer')
  }
}

/**
 * Generate QR code for a recipient with custom hashing
 */
export async function generateRecipientQRCode(
  recipient: {
    name: string
    registrationNumber?: string
    teamId?: string
    [key: string]: string | undefined
  },
  hashOptions: HashOptions,
  qrOptions: QRCodeOptions
): Promise<{ qrDataURL: string; hash: string; qrBuffer: Buffer }> {
  // Generate hash
  const hash = await generateHash(hashOptions)
  
  // Generate QR code with the hash
  const qrDataURL = await generateQRCodeDataURL(hash, qrOptions)
  // Avoid using toBuffer in the browser (not implemented in browser bundle of qrcode)
  let qrBuffer: Buffer | undefined = undefined as unknown as Buffer
  if (typeof window === 'undefined') {
    try {
      qrBuffer = await generateQRCodeBuffer(hash, qrOptions)
    } catch {
      // ignore - server side fallback
    }
  }
  return { qrDataURL, hash, qrBuffer }
}

export function validateQRCodeData(data: string): boolean {
  // Basic validation - ensure data is not empty and has reasonable length
  return typeof data === "string" && data.length > 0 && data.length < 3000
}

/**
 * Validate hash format (should be 64 character hex string)
 */
export function validateHash(hash: string): boolean {
  const hashRegex = /^[a-fA-F0-9]{64}$/
  return hashRegex.test(hash)
}
