import { generateRecipientQRCode, HashOptions, QRCodeOptions } from './qr-generator'

// Helper function to generate UUIDs in browser environment
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export interface CertificateTemplate {
  id: string
  name: string
  backgroundImage: string
  width?: number
  height?: number
  elements: CertificateElement[]
  hashFields: string[]
  salt?: string
}

export interface CertificateElement {
  id: string
  type: 'text' | 'qr' | 'image'
  x: number
  y: number
  width?: number
  height?: number
  hidden?: boolean
  properties: {
    text?: string
    fontFamily?: string
    fontSize?: number
    color?: string
    alignment?: 'left' | 'center' | 'right'
    placeholder?: string // For dynamic content like {{name}}, {{registrationNumber}}
  }
}

export interface Recipient {
  id: string
  name: string
  email: string
  registrationNumber?: string
  teamId?: string
  customFields?: Record<string, string>
}

export interface GeneratedCertificate {
  id: string
  recipientId: string
  hash: string
  qrCodeData: string
  certificateUrl: string
  status: 'generated' | 'failed'
  error?: string
}

/**
 * Generate certificates for multiple recipients
 */
export async function generateCertificates(
  template: CertificateTemplate,
  recipients: Recipient[],
  qrOptions: QRCodeOptions,
  onProgress?: (percent: number) => void
): Promise<GeneratedCertificate[]> {
  const results: GeneratedCertificate[] = []
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i]
    try {
      // Prepare hash options
      const hashOptions: HashOptions = {
        salt: template.salt,
        fields: template.hashFields,
        values: {
          name: recipient.name,
          registrationNumber: recipient.registrationNumber || '',
          teamId: recipient.teamId || '',
          ...recipient.customFields
        }
      }
      
      // Generate QR code and hash
      const recipientForQR = {
        name: recipient.name,
        registrationNumber: recipient.registrationNumber,
        teamId: recipient.teamId,
        ...(recipient.customFields || {})
      }
      const { qrDataURL, hash } = await generateRecipientQRCode(
        recipientForQR,
        hashOptions,
        qrOptions
      )
      
      // Generate certificate image using template + QR + dynamic placeholders
      const certificateUrl = await generateCertificateImage(template, recipient, qrDataURL)
      
      results.push({
        id: generateUUID(),
        recipientId: recipient.id,
        hash,
        qrCodeData: qrDataURL,
        certificateUrl,
        status: 'generated'
      })
      
    } catch (error) {
      results.push({
        id: generateUUID(),
        recipientId: recipient.id,
        hash: '',
        qrCodeData: '',
        certificateUrl: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    if (onProgress) {
      onProgress(Math.round(((i + 1) / recipients.length) * 100))
    }
  }
  
  return results
}

/**
 * Generate a single certificate image
 * This would integrate with your canvas editor or image processing
 */
async function generateCertificateImage(
  template: CertificateTemplate,
  recipient: Recipient,
  qrDataURL: string
): Promise<string> {
  const width = template.width || 1123 // ~A4 @ 96dpi landscape fallback
  const height = template.height || 794
  // Create canvas (browser only). If SSR, return placeholder.
  if (typeof document === 'undefined') {
    return `data:image/png;base64,${btoa('server-placeholder')}`
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Helper to load image
  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

  // Background
  if (template.backgroundImage) {
    try {
      const bg = await loadImage(template.backgroundImage)
      ctx.drawImage(bg, 0, 0, width, height)
    } catch {
      // fallback fill
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0,0,width,height)
    }
  } else {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,width,height)
  }

  // Build placeholder map
  const placeholderMap: Record<string,string> = {
    name: recipient.name,
    registrationNumber: recipient.registrationNumber || '',
    teamId: recipient.teamId || '',
    ...recipient.customFields
  }

  const replacePlaceholders = (text?: string) => {
    if (!text) return ''
    return text.replace(/\{\{(.*?)\}\}/g, (_, key) => placeholderMap[key.trim()] || '')
  }

  // Render elements
  for (const el of template.elements) {
    if (el.hidden) continue
    if (el.type === 'text') {
      const text = replacePlaceholders(el.properties.placeholder || el.properties.text)
      ctx.font = `${el.properties.fontSize || 24}px ${el.properties.fontFamily || 'Arial'}`
      ctx.fillStyle = el.properties.color || '#000'
      ctx.textAlign = (el.properties.alignment as CanvasTextAlign) || 'left'
      const x = el.x
      const y = el.y
      // Text baseline center-ish for easier vertical placement
      ctx.textBaseline = 'middle'
      ctx.fillText(text, x, y)
    } else if (el.type === 'qr') {
      try {
        const qrImg = await loadImage(qrDataURL)
        const w = el.width || 120
        const h = el.height || 120
        ctx.drawImage(qrImg, el.x - w/2, el.y - h/2, w, h)
      } catch { /* ignore */ }
    } else if (el.type === 'image') {
      // (Optional future) image elements not yet supported in default template list
  const imgProps = el.properties as { src?: string }
  const src = imgProps.src
      if (src) {
        try {
          const img = await loadImage(src)
          const w = el.width || img.width
            const h = el.height || img.height
          ctx.drawImage(img, el.x - w/2, el.y - h/2, w, h)
        } catch { /* ignore */ }
      }
    }
  }

  return canvas.toDataURL('image/png')
}

/**
 * Validate certificate template
 */
export function validateCertificateTemplate(template: CertificateTemplate): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!template.name) {
    errors.push('Template name is required')
  }
  
  if (!template.backgroundImage) {
    errors.push('Background image is required')
  }
  
  if (!template.elements || template.elements.length === 0) {
    errors.push('At least one element is required')
  }
  
  if (!template.hashFields || template.hashFields.length === 0) {
    errors.push('Hash fields are required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get default certificate template
 */
export function getDefaultCertificateTemplate(): CertificateTemplate {
  return {
    id: generateUUID(),
    name: 'Default Certificate Template',
    backgroundImage: '/templates/default-certificate.png',
  width: 1123,
  height: 794,
    hashFields: ['name', 'registrationNumber'],
    salt: 'CertifyPro2025',
    elements: [
      {
        id: generateUUID(),
        type: 'text',
    x: 561,
    y: 170,
        properties: {
          text: 'Certificate of Participation',
          fontFamily: 'Arial',
          fontSize: 48,
          color: '#2563eb',
          alignment: 'center'
        }
      },
      {
        id: generateUUID(),
        type: 'text',
    x: 561,
    y: 260,
        properties: {
          text: 'This is to certify that',
          fontFamily: 'Arial',
          fontSize: 24,
          color: '#374151',
          alignment: 'center'
        }
      },
      {
        id: generateUUID(),
        type: 'text',
    x: 561,
    y: 350,
        properties: {
          placeholder: '{{name}}',
          fontFamily: 'Georgia',
          fontSize: 36,
          color: '#1f2937',
          alignment: 'center'
        }
      },
      {
        id: generateUUID(),
        type: 'qr',
    x: 950,
    y: 650,
        width: 100,
        height: 100,
        properties: {}
      }
    ]
  }
}
