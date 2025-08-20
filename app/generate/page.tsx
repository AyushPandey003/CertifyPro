
"use client"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Upload, 
  Mail, 
  QrCode, 
  FileText, 
  Users, 
  Play,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { generateCertificates, getDefaultCertificateTemplate, type CertificateTemplate, type Recipient } from '@/lib/certificate-generator'
import { sendBulkCertificateEmails, type EmailBatch, type CertificateBatchProgress } from '@/lib/email-service'
import {  type QRCodeOptions } from '@/lib/qr-generator'
import type { GeneratedCertificate } from '@/lib/certificate-generator'

// Helper function to generate UUIDs in browser environment
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export default function GeneratePage() {
  const [activeTab, setActiveTab] = useState('template')
  const [template, setTemplate] = useState<CertificateTemplate>(getDefaultCertificateTemplate())
  const bgFileInputRef = useRef<HTMLInputElement | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [emailSubject, setEmailSubject] = useState('Certificate of Participation - {{name}}')
  const [emailBody, setEmailBody] = useState(`Dear {{name}},

Thank you for participating in our event. Please find your certificate attached.

Best regards,
The Team`)
  
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'completed' | 'failed'>('idle')
  const [progress, setProgress] = useState(0)
  // Use the GeneratedCertificate type from certificate-generator to ensure compatibility
  
  const [generatedCertificates, setGeneratedCertificates] = useState<GeneratedCertificate[]>([])
  const [emailBatch, setEmailBatch] = useState<EmailBatch | null>(null)
  const [gmailConnected, setGmailConnected] = useState(false)
  const [checkingGmail, setCheckingGmail] = useState(true)

  useEffect(() => {
    let cancelled = false
    const pollStatus = async (attempt = 0) => {
      try {
        const r = await fetch('/api/email/gmail/status?ts=' + Date.now(), { cache: 'no-store' })
        const j = await r.json()
        if (attempt === 0) {
          console.log('[gmail status]', j)
        }
        if (!cancelled) {
          setGmailConnected(j.connected)
          setCheckingGmail(false)
          // If not connected yet and attempts < 5, retry with backoff (0.5s * attempt)
          if (!j.connected && attempt < 5) {
            setTimeout(() => pollStatus(attempt + 1), 500 * (attempt + 1))
          }
        }
      } catch {
        if (!cancelled && attempt < 5) {
          setTimeout(() => pollStatus(attempt + 1), 500 * (attempt + 1))
        } else if (!cancelled) {
          setCheckingGmail(false)
        }
      }
    }
    pollStatus()
    return () => { cancelled = true }
  }, [])

  const handleConnectGmail = async () => {
    try {
      const r = await fetch('/api/email/gmail')
      const j = await r.json()
      if (j.authUrl) window.location.href = j.authUrl
    } catch { /* ignore */ }
  }

  const handleDisconnectGmail = async () => {
    try {
      await fetch('/api/email/gmail/disconnect', { method: 'POST' })
    } catch { /* ignore */ }
    setGmailConnected(false)
  }

  const handleRevokeGmail = async () => {
    try {
      await fetch('/api/email/gmail/revoke', { method: 'POST' })
    } catch { /* ignore */ }
    setGmailConnected(false)
  }

  // QR Code options
  const qrOptions: QRCodeOptions = {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    foregroundColor: '#000000',
    errorCorrectionLevel: 'M'
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n')
        const headers = lines[0].split(',').map(h => h.trim())
        const data = lines.slice(1).filter(line => line.trim())
        
        const newRecipients: Recipient[] = data.map((line, index) => {
          const values = line.split(',').map(v => v.trim())
          return {
            id: generateUUID(),
            name: values[0] || `Recipient ${index + 1}`,
            email: values[1] || `recipient${index + 1}@example.com`,
            registrationNumber: values[2] || undefined,
            teamId: values[3] || undefined,
            customFields: headers.slice(4).reduce((acc, header, i) => {
              if (values[i + 4]) {
                acc[header] = values[i + 4]
              }
              return acc
            }, {} as Record<string, string>)
          }
        })
        
        setRecipients(newRecipients)
      }
      reader.readAsText(file)
    }
  }

  const handleGenerateCertificates = async () => {
    if (recipients.length === 0) {
      alert('Please add recipients first')
      return
    }

    setGenerationStatus('generating')
    setProgress(0)

    try {
      const certificates = await generateCertificates(template, recipients, qrOptions, (p) => setProgress(p))
      setGeneratedCertificates(certificates)
      setGenerationStatus('completed')
    } catch (error) {
      console.error('Error generating certificates:', error)
      setGenerationStatus('failed')
    }
  }

  const downloadCsvTemplate = () => {
    const headers = ['name','email','registrationNumber','teamId','Department','Score']
    const sample = [
      ['Alice Smith','alice@example.com','REG123','TEAM1','Engineering','95'],
      ['Bob Jones','bob@example.com','REG124','TEAM2','Design','88']
    ]
    const csv = [headers.join(','), ...sample.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'certifypro_recipients_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setTemplate(prev => ({ ...prev, backgroundImage: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const handleSendEmails = async () => {
    if (generatedCertificates.length === 0) {
      alert('Please generate certificates first')
      return
    }

    setEmailStatus('sending')
    setProgress(0)

    try {
      const batchId = generateUUID()
      
      // Prepare recipients with certificate buffers
      const recipientsWithCertificates = recipients.map(recipient => {
        const cert = generatedCertificates.find(c => c.recipientId === recipient.id)
        const pngBase64 = cert?.certificateUrl?.split(',')[1] || ''
        return {
          email: recipient.email,
          name: recipient.name,
          certificateBuffer: pngBase64,
          customFields: recipient.customFields,
        }
      })

      const result = await sendBulkCertificateEmails(
        batchId,
        recipientsWithCertificates,
        emailSubject,
        emailBody,
        (p: CertificateBatchProgress) => {
          setProgress(p.progress)
          setEmailBatch(prev => prev ? { ...prev, sent: p.sent, failed: p.failed, progress: p.progress, status: p.status } : prev)
          if (p.status === 'completed') setEmailStatus('completed')
        }
      )

      // Create a mock email batch for display purposes
      const mockBatch: EmailBatch = {
        id: result.batchId,
        name: `Certificate Email Batch ${result.batchId}`,
        recipients: recipients.map(r => r.email),
        subject: emailSubject,
        body: emailBody,
        status: 'processing',
        progress: 0,
        sent: 0,
        failed: 0,
        createdAt: new Date()
      }

      setEmailBatch(mockBatch)
  // status will be updated via callback
    } catch (error) {
      console.error('Error sending emails:', error)
      setEmailStatus('failed')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'processing':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Generate & Send Certificates</h1>
        <p className="text-muted-foreground">
          Create personalized certificates with QR codes and send them via email
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="template" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Template
          </TabsTrigger>
          <TabsTrigger value="recipients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recipients
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Template</CardTitle>
              <CardDescription>
                Configure your certificate template and hashing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={template.name}
                    onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="salt">Hash Salt</Label>
                  <Input
                    id="salt"
                    value={template.salt || ''}
                    onChange={(e) => setTemplate({ ...template, salt: e.target.value })}
                    placeholder="Enter custom salt"
                  />
                </div>
              </div>
              
              <div>
                <Label>Hash Fields</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['name', 'registrationNumber', 'teamId'].map(field => (
                    <Badge
                      key={field}
                      variant={template.hashFields.includes(field) ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => {
                        const newFields = template.hashFields.includes(field)
                          ? template.hashFields.filter(f => f !== field)
                          : [...template.hashFields, field]
                        setTemplate({ ...template, hashFields: newFields })
                      }}
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Background Image</Label>
                <div
                  className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer relative"
                  onClick={() => bgFileInputRef.current?.click()}
                >
                  {template.backgroundImage ? (
                    <Image src={template.backgroundImage} alt="Background" width={400} height={160} className="mx-auto max-h-40 w-auto h-auto object-contain" unoptimized />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload background image
                      </p>
                    </>
                  )}
                  <input
                    ref={bgFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBackgroundUpload}
                  />
                </div>
              </div>
              <div>
                <Label>CSV Template</Label>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={downloadCsvTemplate}>Download Sample CSV</Button>
              </div>
              <div className="border rounded-md p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Gmail Integration</p>
                    <p className="text-xs text-muted-foreground">
                      {checkingGmail ? 'Checking status...' : gmailConnected ? 'Connected. Emails will send via Gmail.' : 'Connect to send from your Gmail account.'}
                    </p>
                  </div>
                  <Badge variant={gmailConnected ? 'default' : 'secondary'}>{gmailConnected ? 'Connected' : 'Not Connected'}</Badge>
                </div>
                <div className="flex gap-2">
                  {!gmailConnected && (
                    <Button type="button" size="sm" onClick={handleConnectGmail} disabled={checkingGmail}>
                      {checkingGmail ? '...' : 'Connect Gmail'}
                    </Button>
                  )}
                  {gmailConnected && (
                    <>
                      <Button type="button" size="sm" variant="outline" onClick={handleDisconnectGmail}>
                        Disconnect
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={handleRevokeGmail}>
                        Revoke
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">We request only gmail.send scope. Tokens stored in-memory (cleared on server restart). Disconnect removes local tokens; Revoke also invalidates the refresh token at Google.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipients</CardTitle>
              <CardDescription>
                Add recipients manually or upload a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="csvUpload">Upload CSV File</Label>
                <Input
                  id="csvUpload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Columns: name,email,registrationNumber,teamId,Department,Score (extra columns become {'{{Department}}'} etc.)
                </p>
                <Button variant="outline" size="sm" className="mt-2" type="button" onClick={downloadCsvTemplate}>Download Sample</Button>
              </div>

              <Separator />

              <div>
                <Label>Recipients ({recipients.length})</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {recipients.map((recipient, index) => (
                    <div key={recipient.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{recipient.name}</p>
                        <p className="text-sm text-muted-foreground">{recipient.email}</p>
                        {recipient.registrationNumber && (
                          <p className="text-xs text-muted-foreground">
                            Reg: {recipient.registrationNumber}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                  ))}
                  {recipients.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No recipients added yet. Upload a CSV file or add manually.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Certificates</CardTitle>
              <CardDescription>
                Generate personalized certificates with QR codes for all recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleGenerateCertificates}
                  disabled={recipients.length === 0 || generationStatus === 'generating'}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Generate Certificates
                </Button>
                
                {generationStatus === 'generating' && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Generating...</span>
                  </div>
                )}
              </div>

              {generationStatus !== 'idle' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  
                  <div className="flex items-center gap-2 text-sm">
                    {getStatusIcon(generationStatus)}
                    <span className="capitalize">{generationStatus}</span>
                  </div>
                </div>
              )}

              {generationStatus === 'completed' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">
                      Successfully generated {generatedCertificates.length} certificates
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    All certificates are ready for email distribution
                  </p>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
                    {generatedCertificates.filter(c => !!c.certificateUrl).map(c => (
                      <div key={c.id} className="border rounded-md p-2 bg-white shadow-sm">
                        <Image src={c.certificateUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='} alt={c.hash || 'certificate'} width={300} height={120} className="w-full h-32 object-cover rounded" unoptimized />
                        <p className="mt-1 text-[10px] break-all">{c.hash.slice(0,16)}...</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() => {
                            const a = document.createElement('a')
                            a.href = c.certificateUrl
                            a.download = `${c.hash}.png`
                            a.click()
                          }}
                        >Download</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generationStatus === 'failed' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Generation failed</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Please check the console for error details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email settings and send certificates to recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emailSubject">Email Subject</Label>
                <Input
                  id="emailSubject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use {'{{name}}'} for personalization
                </p>
              </div>

              <div>
                <Label htmlFor="emailBody">Email Body</Label>
                <Textarea
                  id="emailBody"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Enter email body"
                  rows={6}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use {'{{name}}'} for personalization. Certificates will be attached automatically.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleSendEmails}
                  disabled={generatedCertificates.length === 0 || emailStatus === 'sending'}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send Certificates
                </Button>
                
                {emailStatus === 'sending' && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Sending emails...</span>
                  </div>
                )}
              </div>

              {emailStatus !== 'idle' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  
                  <div className="flex items-center gap-2 text-sm">
                    {getStatusIcon(emailStatus)}
                    <span className="capitalize">{emailStatus}</span>
                  </div>
                </div>
              )}

              {emailStatus === 'completed' && emailBatch && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Emails sent successfully!</span>
                  </div>
                  <div className="text-sm text-green-600 mt-2 space-y-1">
                    <p>Batch ID: {emailBatch.id}</p>
                    <p>Sent: {emailBatch.sent} | Failed: {emailBatch.failed}</p>
                  </div>
                </div>
              )}

              {emailStatus === 'failed' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Email sending failed</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Please check the console for error details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
