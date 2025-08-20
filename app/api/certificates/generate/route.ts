import { NextRequest, NextResponse } from 'next/server'
import { generateCertificates, type CertificateTemplate, type Recipient } from '@/lib/certificate-generator'
import { type QRCodeOptions } from '@/lib/qr-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template, recipients, qrOptions }: {
      template: CertificateTemplate
      recipients: Recipient[]
      qrOptions: QRCodeOptions
    } = body

    // Validate input
    if (!template || !recipients || !qrOptions) {
      return NextResponse.json(
        { error: 'Missing required fields: template, recipients, qrOptions' },
        { status: 400 }
      )
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients must be a non-empty array' },
        { status: 400 }
      )
    }

    // Generate certificates
    const certificates = await generateCertificates(template, recipients, qrOptions)

    // Count success/failure
    const successful = certificates.filter(c => c.status === 'generated').length
    const failed = certificates.filter(c => c.status === 'failed').length

    return NextResponse.json({
      success: true,
      data: {
        certificates,
        summary: {
          total: certificates.length,
          successful,
          failed
        }
      }
    })

  } catch (error) {
    console.error('Error generating certificates:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate certificates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
