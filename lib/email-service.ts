export interface EmailOptions {
  to: string
  subject: string
  body: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export interface EmailBatch {
  id: string
  name: string
  recipients: string[]
  subject: string
  body: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  sent: number
  failed: number
  createdAt: Date
  completedAt?: Date
  error?: string
}

export interface GmailCredentials {
  clientId: string
  clientSecret: string
  refreshToken?: string
  accessToken?: string
}

// In-memory storage for demo - use database in production
const emailBatches = new Map<string, EmailBatch>()

/**
 * Send email using Gmail API (similar to Python emailpass.py)
 * This would require proper OAuth2 setup in production
 */
export async function sendEmailWithGmail(
  options: EmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Call serverless route which handles Gmail send if connected
    const resp = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        body: options.body,
        attachments: options.attachments?.map(a => ({
          filename: a.filename,
            content: a.content.toString('base64'),
            contentType: a.contentType
        }))
      })
    })
    const json = await resp.json()
    if (!resp.ok || !json.success) {
      return { success: false, error: json.error || 'Gmail send failed' }
    }
    return { success: true, messageId: json.messageId }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Send email with certificate attachment
 */
export async function sendCertificateEmail(
  recipient: { email: string; name: string },
  certificateBuffer: Buffer,
  subject: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const emailOptions: EmailOptions = {
    to: recipient.email,
    subject: subject.replace(/\{\{name\}\}/g, recipient.name),
    body: body.replace(/\{\{name\}\}/g, recipient.name),
    attachments: [{
      filename: `${recipient.name}_certificate.png`,
  content: certificateBuffer,
      contentType: 'image/png'
    }]
  }
  // Always attempt real Gmail send via API route
  return sendEmailWithGmail(emailOptions)
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // In production, this would call your Python Gmail API script
    // For now, we'll simulate the email sending
    
    console.log('[v0] Sending email to:', options.to)
    console.log('[v0] Subject:', options.subject)
    console.log('[v0] Attachments:', options.attachments?.length || 0)

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simulate success/failure
    const success = Math.random() > 0.1 // 90% success rate

    if (success) {
      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } else {
      return {
        success: false,
        error: 'Email delivery failed'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function sendBulkEmails(
  batchId: string,
  recipients: Array<{ email: string; name: string; customFields?: Record<string, string> }>,
  subject: string,
  body: string,
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
): Promise<{ batchId: string }> {
  const batch: EmailBatch = {
    id: batchId,
    name: `Email Batch ${batchId}`,
    recipients: recipients.map(r => r.email),
    subject,
    body,
    status: 'pending',
    progress: 0,
    sent: 0,
    failed: 0,
    createdAt: new Date()
  }

  emailBatches.set(batchId, batch)

  // Start processing in background
  processEmailBatch(batchId, recipients, subject, body, attachments)

  return { batchId }
}

/**
 * Send bulk certificate emails
 */
export interface CertificateBatchProgress {
  batchId: string
  sent: number
  failed: number
  total: number
  progress: number // 0-100
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export async function sendBulkCertificateEmails(
  batchId: string,
  recipients: Array<{ 
    email: string; 
    name: string; 
    certificateBuffer: Buffer | string;
    customFields?: Record<string, string> 
  }>,
  subject: string,
  body: string,
  onProgress?: (p: CertificateBatchProgress) => void
): Promise<{ batchId: string }> {
  // Use the server API route intended for bulk certificate emails. Return error if it fails.
  // Prepare payload for /api/emails/send-certificates
  const toBase64 = (data: Buffer | string): string => {
    if (typeof data === 'string') return data
    // Browser-safe Uint8Array -> base64
    try {
      const arr = data as unknown as Uint8Array
      let binary = ''
      for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i])
      if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
        return window.btoa(binary)
      }
    } catch { /* ignore */ }
    return ''
  }

  const payloadRecipients = recipients.map(r => ({
    email: r.email,
    name: r.name,
    certificateBuffer: toBase64(r.certificateBuffer),
    customFields: r.customFields
  }))

  // Validate that all recipients have valid certificate data
  const invalidRecipients = payloadRecipients.filter(r => !r.certificateBuffer)
  if (invalidRecipients.length > 0) {
    throw new Error(`Invalid certificate data for recipients: ${invalidRecipients.map(r => r.name).join(', ')}`)
  }

  const resp = await fetch('/api/email/send/send-certificates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipients: payloadRecipients,
      subject,
      body
    })
  })
  const json = await resp.json().catch(() => ({}))
  if (!resp.ok || !json?.success) {
    console.error('Email API Error Details:', {
      status: resp.status,
      statusText: resp.statusText,
      json,
      error: json?.error,
      details: json?.details
    })
    throw new Error(json?.error || json?.details || `Bulk send API failed (${resp.status}: ${resp.statusText})`)
  }
  onProgress?.({
    batchId: json.data?.batchId || batchId,
    sent: recipients.length,
    failed: 0,
    total: recipients.length,
    progress: 100,
    status: 'completed'
  })
  return { batchId: json.data?.batchId || batchId }
}

async function processEmailBatch(
  batchId: string,
  recipients: Array<{ email: string; name: string; customFields?: Record<string, string> }>,
  subject: string,
  body: string,
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>
) {
  const batch = emailBatches.get(batchId)
  if (!batch) return

  batch.status = 'processing'
  emailBatches.set(batchId, batch)

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i]
    
    // Personalize email content
    let personalizedSubject = subject
    let personalizedBody = body
    
    // Replace placeholders
    personalizedSubject = personalizedSubject.replace(/\{\{name\}\}/g, recipient.name)
    personalizedBody = personalizedBody.replace(/\{\{name\}\}/g, recipient.name)
    
    if (recipient.customFields) {
      Object.entries(recipient.customFields).forEach(([key, value]) => {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        personalizedSubject = personalizedSubject.replace(placeholder, value)
        personalizedBody = personalizedBody.replace(placeholder, value)
      })
    }

    const result = await sendEmail({
      to: recipient.email,
      subject: personalizedSubject,
      body: personalizedBody,
      attachments
    })

    if (result.success) {
      batch.sent++
    } else {
      batch.failed++
    }

    batch.progress = Math.round(((i + 1) / recipients.length) * 100)
    emailBatches.set(batchId, batch)

    // Rate limiting - send max 10 emails per minute
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 6000)) // 6 seconds between emails
    }
  }

  batch.status = 'completed'
  batch.completedAt = new Date()
  emailBatches.set(batchId, batch)
}

// Client-side background fallback removed to ensure server route handles delivery.

export async function getEmailBatch(batchId: string): Promise<EmailBatch | null> {
  return emailBatches.get(batchId) || null
}

export async function getAllEmailBatches(): Promise<EmailBatch[]> {
  return Array.from(emailBatches.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateEmailBatch(recipients: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = []
  const invalid: string[] = []

  recipients.forEach(email => {
    if (validateEmail(email)) {
      valid.push(email)
    } else {
      invalid.push(email)
    }
  })

  return { valid, invalid }
}
