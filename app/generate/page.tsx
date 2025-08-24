
"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
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
import Navbar from '@/components/navbar'

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
  type SnapshotElement = {
    id?: string
    type?: string
    x?: number
    y?: number
    width?: number
    height?: number
    properties?: Record<string, unknown>
  }

  type SavedTemplateItem = {
    id: string
    name: string
    snapshot: {
      elements?: SnapshotElement[]
      canvasWidth?: number
      canvasHeight?: number
      backgroundImage?: string
      savedAt?: string
    }
  }
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplateItem[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  // Load saved templates from localStorage on mount
  useEffect(() => {
    try {
      // the editor saves templates under the key 'certifypro-templates'
      const raw = localStorage.getItem('certifypro-templates')
      if (raw) {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) setSavedTemplates(arr)
      }
    } catch {}
  }, [])
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
  // CSV headers & dynamic field placement state
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  type FieldElement = { id: string; field: string; x: number; y: number; fontSize: number; color: string; alignment: 'left' | 'center' | 'right' }
  const [fieldElements, setFieldElements] = useState<FieldElement[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)

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
        setCsvHeaders(headers)
        // Auto-add common fields if present
        setFieldElements([])
        const autoFields = ['name', 'registrationNumber', 'teamId']
        autoFields.forEach((field) => {
          if (headers.includes(field)) {
            setFieldElements(prev => prev.some(f => f.field === field) ? prev : [...prev, {
              id: `fld-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              field,
              x: (template.width || 800)/2,
              y: (template.height || 600)/2 + (prev.length * 50),
              fontSize: 32,
              color: '#000000',
              alignment: 'center',
            }])
          }
        })
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

    // Build combined template including dynamic field elements
  const dynamicTextElements = fieldElements.map(fe => ({
      id: fe.id,
      type: 'text' as const,
      x: fe.x,
      y: fe.y,
      properties: {
        placeholder: `{{${fe.field}}}`,
        fontFamily: 'Arial',
        fontSize: fe.fontSize,
        color: fe.color,
        alignment: fe.alignment,
      },
    }))
    const combinedTemplate: CertificateTemplate = {
      ...template,
      elements: [
        // keep existing elements but remove prior dynamic placeholder ones (match by placeholder token)
        ...template.elements.filter(e => {
          const props = (e as unknown as { properties?: Record<string, unknown> }).properties
          const ph = props && typeof props['placeholder'] === 'string' ? String(props['placeholder']) : null
          if (!ph) return true
          const token = ph.replace(/\{\{|\}\}/g,'').trim()
          return !csvHeaders.includes(token)
        }),
        ...dynamicTextElements,
      ],
    }

    setGenerationStatus('generating')
    setProgress(0)

    try {
      const certificates = await generateCertificates(combinedTemplate, recipients, qrOptions, (p) => setProgress(p))
      setGeneratedCertificates(certificates)
      setGenerationStatus('completed')
    } catch (error) {
      console.error('Error generating certificates:', error)
      setGenerationStatus('failed')
    }
  }

  // Add new field element
  const addFieldElement = (field: string) => {
    if (!field) return
    setFieldElements(prev => [...prev, { id: `fld-${Date.now()}-${Math.random().toString(36).slice(2)}`, field, x: (template.width || 800)/2, y: (template.height || 600)/2, fontSize: 32, color: '#000000', alignment: 'center' }])
  }

  const updateFieldElement = useCallback((id: string, updates: Partial<FieldElement>) => {
    setFieldElements(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
  }, [])

  const removeFieldElement = (id: string) => {
    setFieldElements(prev => prev.filter(f => f.id !== id))
    if (selectedFieldId === id) setSelectedFieldId(null)
  }

  // Drag handlers
  const handleFieldMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const rect = (e.currentTarget.parentElement as HTMLElement)?.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    dragState.current = { id, offsetX: x, offsetY: y }
    setSelectedFieldId(id)
  }

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.current) return
    const container = e.currentTarget as HTMLDivElement
    const rect = container.getBoundingClientRect()
    const nx = e.clientX - rect.left
    const ny = e.clientY - rect.top
    const id = dragState.current.id
    const baseW = template.width || 800
    const baseH = template.height || 600
    const maxW = 900
    const maxH = 700
    const scale = Math.min(maxW / baseW, maxH / baseH, 1)
    const logicalX = Math.round(nx / scale)
    const logicalY = Math.round(ny / scale)
    updateFieldElement(id, { x: logicalX, y: logicalY })
  }, [updateFieldElement, template.width, template.height])

  const handleCanvasMouseUp = () => {
    dragState.current = null
  }

  const selectedField = fieldElements.find(f => f.id === selectedFieldId) || null

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
      // Read natural size and expand template if the image is larger
  const img = new window.Image()
      img.onload = () => {
        setTemplate(prev => {
          const natW = img.naturalWidth || img.width
          const natH = img.naturalHeight || img.height
          const next = { ...prev, backgroundImage: dataUrl }
          if (natW > 0 && natH > 0) {
            if (!prev.width || !prev.height || natW > (prev.width || 0) || natH > (prev.height || 0)) {
              next.width = natW
              next.height = natH
            }
          }
          return next
        })
      }
      img.onerror = () => setTemplate(prev => ({ ...prev, backgroundImage: dataUrl }))
      img.src = dataUrl
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

      // Create and set an initial email batch so the progress callback can update it
      const initialBatch: EmailBatch = {
        id: batchId,
        name: `Certificate Email Batch ${batchId}`,
        recipients: recipients.map(r => r.email),
        subject: emailSubject,
        body: emailBody,
        status: 'processing',
        progress: 0,
        sent: 0,
        failed: 0,
        createdAt: new Date()
      }

      setEmailBatch(initialBatch)

      // Prepare recipients with certificate buffers
      const recipientsWithCertificates = recipients.map(recipient => {
        const cert = generatedCertificates.find(c => c.recipientId === recipient.id)
        if (!cert?.certificateUrl) {
          throw new Error(`Certificate not found for recipient: ${recipient.name}`)
        }
        const pngBase64 = cert.certificateUrl.split(',')[1]
        if (!pngBase64) {
          throw new Error(`Invalid certificate data for recipient: ${recipient.name}`)
        }
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
          setEmailBatch(prev => ({
            ...(prev || initialBatch),
            sent: p.sent,
            failed: p.failed,
            progress: p.progress,
            status: p.status
          }))
          if (p.status === 'completed') setEmailStatus('completed')
        }
      )

      // result may contain authoritative batchId or metadata; ensure id is synced
      if (result && result.batchId && emailBatch?.id !== result.batchId) {
        setEmailBatch(prev => prev ? { ...prev, id: result.batchId } : prev)
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      setEmailStatus('failed')
      // Show more specific error message to user
      if (error instanceof Error) {
        alert(`Failed to send emails: ${error.message}`)
      } else {
        alert('Failed to send emails: Unknown error occurred')
      }
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
    <>
      <Navbar />
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
              <div>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowTemplates(v => !v)}>
                  {showTemplates ? 'Hide Saved Templates' : 'Choose from Saved Templates'}
                </Button>
                {showTemplates && (
                  <div className="mt-3 border rounded p-3 bg-gray-50 max-h-64 overflow-y-auto">
                        {savedTemplates.length === 0 && <p className="text-sm text-muted-foreground">No saved templates found.</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {savedTemplates.map((tpl, idx) => {
                            // derive preview image and dimensions from snapshot
                            const maybeBg = tpl.snapshot.backgroundImage
                            const firstEl = tpl.snapshot.elements && tpl.snapshot.elements[0]
                            const firstElSrc = firstEl && firstEl.properties && 'src' in firstEl.properties ? String(firstEl.properties['src']) : null
                            const previewSrc = typeof maybeBg === 'string' && maybeBg ? maybeBg : (firstElSrc || null)
                            const width = tpl.snapshot.canvasWidth || template.width
                            const height = tpl.snapshot.canvasHeight || template.height

                            const convertToCertificateTemplate = (): CertificateTemplate => {
                              // Map editor snapshot to CertificateTemplate shape
                              // Treat previewSrc (saved backgroundImage or first image element) as the template background
                              // and skip any image elements that match it to avoid drawing the same image twice.
                              const bgSrc = previewSrc || template.backgroundImage || undefined
                              type LocalElement = { id: string; type: 'text' | 'qr' | 'image' | string; x: number; y: number; width?: number; height?: number; properties?: Record<string, unknown> }

                              const elements: LocalElement[] = (tpl.snapshot.elements || [])
                                .filter((el: SnapshotElement) => {
                                  if (el.type === 'image' && el.properties && 'src' in el.properties) {
                                    const srcVal = el.properties['src']
                                    if (typeof srcVal === 'string' && bgSrc && srcVal === bgSrc) return false
                                  }
                                  return true
                                })
                                .map((el: SnapshotElement) => {
                                  const props = el.properties || {}
                                  if (el.type === 'text') {
                                    const text = 'text' in props && typeof props['text'] === 'string' ? props['text'] as string : undefined
                                    const placeholder = 'placeholder' in props && typeof props['placeholder'] === 'string' ? props['placeholder'] as string : undefined
                                    const fontFamily = 'fontFamily' in props && typeof props['fontFamily'] === 'string' ? props['fontFamily'] as string : 'Arial'
                                    const fontSize = ('fontSize' in props && typeof props['fontSize'] === 'number') ? (props['fontSize'] as number) : ('fontSize' in props ? Number(String(props['fontSize'])) : 24)
                                    const color = 'color' in props && typeof props['color'] === 'string' ? props['color'] as string : '#000000'
                                    const alignment = 'alignment' in props && typeof props['alignment'] === 'string' && (props['alignment'] === 'center' || props['alignment'] === 'right') ? (props['alignment'] as 'center' | 'right' | 'left') : 'left'
                                    return {
                                      id: el.id || `el-${Date.now()}`,
                                      type: 'text' as const,
                                      x: el.x || 0,
                                      y: el.y || 0,
                                      width: el.width || undefined,
                                      height: el.height || undefined,
                                      properties: { text, placeholder, fontFamily, fontSize, color, alignment }
                                    }
                                  }
                                  if (el.type === 'qr-code' || el.type === 'qr') {
                                    return {
                                      id: el.id || `el-${Date.now()}`,
                                      type: 'qr' as const,
                                      x: el.x || 0,
                                      y: el.y || 0,
                                      width: el.width || 120,
                                      height: el.height || 120,
                                      properties: {}
                                    }
                                  }
                                  if (el.type === 'image') {
                                    const src = 'src' in props && typeof props['src'] === 'string' ? props['src'] as string : undefined
                                    return {
                                      id: el.id || `el-${Date.now()}`,
                                      type: 'image' as const,
                                      x: el.x || 0,
                                      y: el.y || 0,
                                      width: el.width || undefined,
                                      height: el.height || undefined,
                                      properties: { src }
                                    }
                                  }
                                  // fallback: map to text
                                  const fallbackText = 'text' in props && typeof props['text'] === 'string' ? props['text'] as string : ''
                                  return {
                                    id: el.id || `el-${Date.now()}`,
                                    type: 'text' as const,
                                    x: el.x || 0,
                                    y: el.y || 0,
                                    properties: { text: fallbackText }
                                  }
                                })

                              const certTpl: CertificateTemplate = {
                                id: tpl.id,
                                name: tpl.name || `Template ${idx + 1}`,
                                backgroundImage: previewSrc || template.backgroundImage || '',
                                width: width,
                                height: height,
                                elements: elements as unknown as CertificateTemplate['elements'],
                                hashFields: template.hashFields || ['name','registrationNumber'],
                                salt: template.salt || undefined,
                              }
                              return certTpl
                            }

                            return (
                              <div key={tpl.id || idx} className="border rounded p-2 flex flex-col gap-2 bg-white shadow-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{tpl.name || `Template ${idx + 1}`}</span>
                                  <Badge variant="secondary" className="ml-auto">{(width && height) ? `${width}×${height}` : 'saved'}</Badge>
                                </div>
                                {previewSrc && (
                                  <Image src={previewSrc} alt="bg" width={180} height={60} className="rounded border object-contain max-h-16" unoptimized />
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      const nextTpl = convertToCertificateTemplate();
                                      setTemplate(nextTpl);
                                      setShowTemplates(false);
                                      // If background image exists, expand template to natural size if larger
                                      const bg = nextTpl.backgroundImage;
                                      if (bg) {
                                        try {
                                          const img = new window.Image();
                                          img.onload = () => {
                                            setTemplate(prev => {
                                              const natW = img.naturalWidth || img.width;
                                              const natH = img.naturalHeight || img.height;
                                              if (!natW || !natH) return prev;
                                              if (!prev.width || !prev.height || natW > (prev.width || 0) || natH > (prev.height || 0)) {
                                                return { ...prev, width: natW, height: natH };
                                              }
                                              return prev;
                                            });
                                          }
                                          img.src = bg;
                                        } catch { /* ignore */ }
                                      }
                                    }}
                                  >
                                    Use Template
                                  </Button>
                                  <Button type="button" size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(tpl.snapshot)); alert('Snapshot copied to clipboard') }}>Export Snapshot</Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                  </div>
                )}
              </div>
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
              {csvHeaders.length > 0 && (
                <div className="space-y-3">
                  <Label>Dynamic Fields Placement</Label>
                  <p className="text-xs text-muted-foreground">Add placeholders for CSV columns and drag them into position on the certificate.</p>
                  <div className="flex gap-2 flex-wrap">
                    <select className="border rounded px-2 py-1 text-sm" defaultValue="" onChange={(e) => { if (e.target.value) { addFieldElement(e.target.value); e.target.value=''; } }}>
                      <option value="">Add field...</option>
                      {csvHeaders.filter(h => !fieldElements.some(f => f.field === h)).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    {selectedField && (
                      <div className="flex gap-2 items-center flex-wrap">
                        <label className="text-xs">Font Size
                          <input type="number" className="border ml-1 w-16 px-1 py-0.5 rounded text-xs" value={selectedField.fontSize} onChange={(e)=>updateFieldElement(selectedField.id,{fontSize:Number(e.target.value)||12})} />
                        </label>
                        <label className="text-xs">Color
                          <input type="color" className="ml-1" value={selectedField.color} onChange={(e)=>updateFieldElement(selectedField.id,{color:e.target.value})} />
                        </label>
                        <select className="border rounded px-2 py-1 text-xs" value={selectedField.alignment} onChange={(e)=>updateFieldElement(selectedField.id,{alignment:e.target.value as FieldElement['alignment']})}>
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                        <Button variant="destructive" size="sm" className="h-7" onClick={()=>removeFieldElement(selectedField.id)}>Delete</Button>
                      </div>
                    )}
                  </div>
                  {(() => {
                    const baseW = template.width || 800
                    const baseH = template.height || 600
                    const maxW = 900
                    const maxH = 700
                    const scale = Math.min(maxW / baseW, maxH / baseH, 1)
                    const viewW = Math.round(baseW * scale)
                    const viewH = Math.round(baseH * scale)
                    return (
                      <div
                        className="border rounded shadow-inner bg-white overflow-hidden select-none"
                        style={{ width: viewW, height: viewH, position: 'relative' }}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                      >
                        <div
                          className="relative"
                          style={{
                            width: baseW,
                            height: baseH,
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                          }}
                        >
                          {template.backgroundImage && (
                            <Image
                              src={template.backgroundImage}
                              alt="bg"
                              fill
                              style={{ objectFit: 'cover' }}
                              className="pointer-events-none"
                              unoptimized
                            />
                          )}
                          {fieldElements.map(fe => (
                            <div
                              key={fe.id}
                              onMouseDown={(e)=>handleFieldMouseDown(e, fe.id)}
                              onClick={(e)=>{e.stopPropagation(); setSelectedFieldId(fe.id)}}
                              className={`absolute cursor-move px-1 rounded ${selectedFieldId===fe.id ? 'ring-2 ring-blue-500 bg-white/70' : 'bg-white/60'} `}
                              style={{ left: fe.x, top: fe.y, transform: 'translate(-50%, -50%)', fontSize: fe.fontSize, color: fe.color, textAlign: fe.alignment, fontFamily: 'Arial', minWidth: 40 as number }}
                            >
                              {`{{${fe.field}}}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
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
    </>
  )
}
