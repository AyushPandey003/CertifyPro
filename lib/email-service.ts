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

// In-memory storage for demo - use database in production
const emailBatches = new Map<string, EmailBatch>()

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
