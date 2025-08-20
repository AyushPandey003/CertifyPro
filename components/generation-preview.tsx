"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Download, QrCode, FileText, User, Hash } from "lucide-react"
import { generateHash } from "@/lib/hash-generator"
import { generateQRCodeDataURL } from "@/lib/qr-generator"
import { createDocumentPreview } from "@/lib/pdf-generator"
import Image from "next/image"
import { useEffect } from "react"

// Use TemplateElement type from pdf-generator to ensure compatibility
import type { TemplateElement } from "@/lib/pdf-generator";

interface Recipient {
  name: string
  email: string
  rollNumber?: string
  teamId?: string
  [key: string]: string | number | undefined
}

interface GenerationPreviewProps {
  templateElements: TemplateElement[]
  recipients: Recipient[]
}

export function GenerationPreview({ templateElements, recipients }: GenerationPreviewProps) {
  const [selectedRecipient, setSelectedRecipient] = useState(0)
  const [previewMode, setPreviewMode] = useState<"certificate" | "qr-code" | "data">("certificate")

  // Generate hash for selected recipient
  const selectedRecipientData = recipients[selectedRecipient]
  const hashConfig = {
    includeName: true,
    includeEmail: true,
    includeRollNumber: true,
    includeTeamId: true,
    includeEventName: true,
    includeDate: true,
    customFields: [],
    eventName: "LinPack Club Event 2024",
  }

  const hash = selectedRecipientData ? generateHash(selectedRecipientData, hashConfig) : ""
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("")

  // Generate QR code data URL asynchronously when hash changes

  useEffect(() => {
    let isMounted = true
    if (hash) {
      generateQRCodeDataURL(hash, {
        width: 100,
        height: 100,
        backgroundColor: "#ffffff",
        foregroundColor: "#000000",
        errorCorrectionLevel: "M"
      }).then((url) => {
        if (isMounted) setQrCodeDataURL(url)
      })
    } else {
      setQrCodeDataURL("")
    }
    return () => { isMounted = false }
  }, [hash])

  const certificatePreview = selectedRecipientData ? createDocumentPreview(
    templateElements,
    selectedRecipientData,
    hash
  ) : ""

  const handlePreviousRecipient = () => {
    setSelectedRecipient((prev) => (prev > 0 ? prev - 1 : recipients.length - 1))
  }

  const handleNextRecipient = () => {
    setSelectedRecipient((prev) => (prev < recipients.length - 1 ? prev + 1 : 0))
  }

  if (recipients.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Recipients to Preview</h3>
          <p className="text-muted-foreground">
            Add recipient data first to see certificate previews
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Recipient Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Recipient Preview
          </CardTitle>
          <CardDescription>
            Preview how certificates will look for each recipient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousRecipient}
                disabled={recipients.length <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedRecipient + 1} of {recipients.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextRecipient}
                disabled={recipients.length <= 1}
              >
                Next
              </Button>
            </div>
            <Badge variant="secondary">
              {selectedRecipientData?.teamId ? `Team ${selectedRecipientData.teamId}` : "No Team"}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Recipient Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{selectedRecipientData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{selectedRecipientData?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration:</span>
                  <span className="font-medium">{selectedRecipientData?.rollNumber || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team ID:</span>
                  <span className="font-medium">{selectedRecipientData?.teamId || "N/A"}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Generated Hash</h4>
              <div className="space-y-2">
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-xs break-all">{hash}</code>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  SHA-256 hash based on selected fields
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Preview</CardTitle>
          <CardDescription>
            See how the certificate will look for {selectedRecipientData?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={previewMode} onValueChange={(value: string) => setPreviewMode(value as "certificate" | "qr-code" | "data")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="certificate" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Certificate
              </TabsTrigger>
              <TabsTrigger value="qr-code" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="certificate" className="mt-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Certificate Preview</span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Preview
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div 
                    className="mx-auto border-2 border-dashed border-gray-300 rounded-lg"
                    dangerouslySetInnerHTML={{ __html: certificatePreview }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qr-code" className="mt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-48 h-48 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  {qrCodeDataURL ? (
                    <Image
                      src={qrCodeDataURL} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                      width={200}
                      height={200}
                    />
                  ) : (
                    <div className="text-muted-foreground">
                      <QrCode className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">QR Code will be generated</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">QR Code Data</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-xs break-all">{hash}</code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This QR code contains the unique hash for verification
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Template Elements</h4>
                  <div className="grid gap-2">
                    {templateElements.map((element, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {element.type === "text" ? "T" : element.type === "qr-code" ? "QR" : "E"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{element.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {typeof element.properties === "object" && element.properties !== null && "text" in element.properties
                                ? (element.properties as { text?: string }).text
                                : `${element.width}×${element.height}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {String(element.x)}, {String(element.y)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Hash Configuration</h4>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Name: {hashConfig.includeName ? "✓" : "✗"}</div>
                      <div>Email: {hashConfig.includeEmail ? "✓" : "✗"}</div>
                      <div>Registration: {hashConfig.includeRollNumber ? "✓" : "✗"}</div>
                      <div>Team ID: {hashConfig.includeTeamId ? "✓" : "✗"}</div>
                      <div>Event Name: {hashConfig.includeEventName ? "✓" : "✗"}</div>
                      <div>Date: {hashConfig.includeDate ? "✓" : "✗"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generation Info */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{recipients.length}</div>
              <p className="text-sm text-muted-foreground">Total Recipients</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-secondary">{templateElements.length}</div>
              <p className="text-sm text-muted-foreground">Template Elements</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">SHA-256</div>
              <p className="text-sm text-muted-foreground">Hash Algorithm</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
