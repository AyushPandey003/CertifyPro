import crypto from 'crypto'

const ALG = 'aes-256-gcm'

function getKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY
  if (!secret) throw new Error('TOKEN_ENCRYPTION_KEY missing')
  const buf = Buffer.from(secret, 'hex')
  if (buf.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes hex')
  return buf
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12)
  const key = getKey()
  const cipher = crypto.createCipheriv(ALG, key, iv)
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decrypt(payload: string): string {
  const raw = Buffer.from(payload, 'base64')
  const iv = raw.subarray(0,12)
  const tag = raw.subarray(12,28)
  const data = raw.subarray(28)
  const key = getKey()
  const decipher = crypto.createDecipheriv(ALG, key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(data), decipher.final()])
  return dec.toString('utf8')
}
