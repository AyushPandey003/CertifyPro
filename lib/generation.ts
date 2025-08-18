"use server"

import {
  generateHash,
  generateQRCodeData,
  type HashConfig,
  type RecipientHashData,
} from "@/lib/hash-generator"

import { generatePDF, createDocumentPreview } from "@/lib/pdf-generator"

import type { PDFGenerationOptions, GeneratedDocument, TemplateElement, Recipient } from "@/lib/pdf-generator"
import { generateQRCodeDataURL } from "@/lib/qr-generator"
import type { QRCodeOptions } from "@/lib/qr-generator"

export interface GenerationJob {
  id: string
  templateId: string
  templateElements: TemplateElement[]
  recipients: RecipientHashData[]
  hashConfig: HashConfig
  qrCodeOptions: QRCodeOptions
  pdfOptions: PDFGenerationOptions
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  totalDocuments: number
  generatedDocuments: GeneratedDocument[]
  createdAt: Date
  completedAt?: Date
  error?: string
}



// In-memory storage for demo - use database in production
const generationJobs = new Map<string, GenerationJob>()

export async function startGeneration(
  templateElements: TemplateElement[],
  recipients: RecipientHashData[],
  hashConfig: HashConfig,
  qrCodeOptions: QRCodeOptions,
  pdfOptions: PDFGenerationOptions,
): Promise<{ jobId: string }> {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const job: GenerationJob = {
    id: jobId,
    templateId: `template-${Date.now()}`,
    templateElements,
    recipients,
    hashConfig,
    qrCodeOptions,
    pdfOptions,
    status: "pending",
    progress: 0,
    totalDocuments: recipients.length,
    generatedDocuments: [],
    createdAt: new Date(),
  }

  generationJobs.set(jobId, job)

  // Start processing in background
  processGenerationJob(jobId)

  return { jobId }
}

async function processGenerationJob(jobId: string) {
  const job = generationJobs.get(jobId)
  if (!job) return

  try {
    job.status = "processing"
    generationJobs.set(jobId, job)

    for (let i = 0; i < job.recipients.length; i++) {
      const recipient = job.recipients[i]

      // Generate hash
      const recipientHashData: RecipientHashData = {
        name: recipient.name,
        email: recipient.email,
        rollNumber: recipient.rollNumber,
        teamId: recipient.teamId,
        customFields: recipient.customFields,
      }

      const hash = generateHash(recipientHashData, job.hashConfig)
      const qrCodeData = generateQRCodeData(hash, process.env.NEXT_PUBLIC_BASE_URL)
      generateQRCodeDataURL(qrCodeData, job.qrCodeOptions)

      // Generate PDF
      const pdfBuffer = await generatePDF(job.templateElements, recipient, hash)

      const document: GeneratedDocument = {
        id: `doc-${Date.now()}-${i}`,
        recipientId: recipient.email, // Use email as a unique identifier
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        hash,
        qrCodeData,
        pdfBuffer,
        generatedAt: new Date(),
      }

      job.generatedDocuments.push(document)
      job.progress = Math.round(((i + 1) / job.recipients.length) * 100)
      generationJobs.set(jobId, job)

      // Small delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    job.status = "completed"
    job.completedAt = new Date()
    generationJobs.set(jobId, job)
  } catch (error) {
    job.status = "failed"
    job.error = error instanceof Error ? error.message : "Unknown error"
    generationJobs.set(jobId, job)
  }
}

export async function getGenerationStatus(jobId: string): Promise<GenerationJob | null> {
  return generationJobs.get(jobId) || null
}

export async function getGeneratedDocument(jobId: string, documentId: string): Promise<GeneratedDocument | null> {
  const job = generationJobs.get(jobId)
  if (!job) return null

  return job.generatedDocuments.find((doc) => doc.id === documentId) || null
}

export async function downloadGeneratedPDF(jobId: string, documentId: string): Promise<Buffer | null> {
  const document = await getGeneratedDocument(jobId, documentId)
  return document?.pdfBuffer || null
}

export async function generatePreview(
  templateElements: TemplateElement[],
  sampleRecipient: RecipientHashData,
  hashConfig: HashConfig,
): Promise<{ preview: string; hash: string }> {
  const recipientHashData: RecipientHashData = {
    name: sampleRecipient.name,
    email: sampleRecipient.email,
    rollNumber: sampleRecipient.rollNumber,
    teamId: sampleRecipient.teamId,
    customFields: sampleRecipient.customFields,
  }

  const hash = generateHash(recipientHashData, hashConfig)


  const preview = createDocumentPreview(templateElements, sampleRecipient as unknown as Recipient, hash)

  return { preview, hash }
}
