"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Play, Hash, QrCode, FileText } from "lucide-react"
import { HashConfig } from "@/lib/hash-generator"

interface GenerationSettingsProps {
  onStartGeneration: (settings: {
    hashConfig: HashConfig
    qrCodeOptions: {
      width: number
      height: number
      backgroundColor: string
      foregroundColor: string
      errorCorrectionLevel: "L" | "M" | "Q" | "H"
    }
    pdfOptions: {
      format: "A4" | "Letter" | "Custom"
      orientation: "portrait" | "landscape"
      margin: number
      quality: "low" | "medium" | "high"
    }
  }) => void
  isGenerating: boolean
  templateElements: { id: string; type: string; [key: string]: unknown }[]
  recipients: { name: string; email: string; rollNumber?: string; teamId?: string; [key: string]: unknown }[]
}

export function GenerationSettings({
  onStartGeneration,
  isGenerating,
  templateElements,
  recipients,
}: GenerationSettingsProps) {
  const [hashConfig, setHashConfig] = useState<HashConfig>({
    includeName: true,
    includeEmail: true,
    includeRollNumber: true,
    includeTeamId: true,
    includeEventName: true,
    includeDate: true,
    customFields: [],
    eventName: "LinPack Club Event 2024",
  })

  const [qrCodeOptions, setQrCodeOptions] = useState({
    width: 100,
    height: 100,
    backgroundColor: "#ffffff",
    foregroundColor: "#000000",
    errorCorrectionLevel: "M" as const,
  })

  const [pdfOptions, setPdfOptions] = useState<{
    format: "A4" | "Letter" | "Custom"
    orientation: "portrait" | "landscape"
    margin: number
    quality: "low" | "medium" | "high"
  }>({
    format: "A4",
    orientation: "portrait",
    margin: 20,
    quality: "high",
  })

  const handleStartGeneration = () => {
    const settings = {
      hashConfig,
      qrCodeOptions,
      pdfOptions,
    }
    onStartGeneration(settings)
  }

  const updateHashConfig = <K extends keyof HashConfig>(key: K, value: HashConfig[K]) => {
    setHashConfig((prev) => ({ ...prev, [key]: value }))
  }

  const updateQrCodeOptions = (
    key: keyof typeof qrCodeOptions,
    value: typeof qrCodeOptions[keyof typeof qrCodeOptions]
  ) => {
    setQrCodeOptions((prev) => ({ ...prev, [key]: value }))
  }

  const updatePdfOptions = (
    key: keyof typeof pdfOptions,
    value: typeof pdfOptions[keyof typeof pdfOptions]
  ) => {
    setPdfOptions((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Generation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generation Summary
          </CardTitle>
          <CardDescription>
            Overview of what will be generated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{recipients.length}</div>
              <p className="text-sm text-muted-foreground">Recipients</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-secondary">{templateElements.length}</div>
              <p className="text-sm text-muted-foreground">Template Elements</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">{recipients.length}</div>
              <p className="text-sm text-muted-foreground">Certificates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hash Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Hash Configuration
          </CardTitle>
          <CardDescription>
            Configure how unique hashes are generated for each certificate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Include in Hash</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeName">Name</Label>
                  <Switch
                    id="includeName"
                    checked={hashConfig.includeName}
                    onCheckedChange={(checked) => updateHashConfig("includeName", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeEmail">Email</Label>
                  <Switch
                    id="includeEmail"
                    checked={hashConfig.includeEmail}
                    onCheckedChange={(checked) => updateHashConfig("includeEmail", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeRollNumber">Registration Number</Label>
                  <Switch
                    id="includeRollNumber"
                    checked={hashConfig.includeRollNumber}
                    onCheckedChange={(checked) => updateHashConfig("includeRollNumber", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeTeamId">Team ID</Label>
                  <Switch
                    id="includeTeamId"
                    checked={hashConfig.includeTeamId}
                    onCheckedChange={(checked) => updateHashConfig("includeTeamId", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeEventName">Event Name</Label>
                  <Switch
                    id="includeEventName"
                    checked={hashConfig.includeEventName}
                    onCheckedChange={(checked) => updateHashConfig("includeEventName", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeDate">Current Date</Label>
                  <Switch
                    id="includeDate"
                    checked={hashConfig.includeDate}
                    onCheckedChange={(checked) => updateHashConfig("includeDate", checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Event Details</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    value={hashConfig.eventName}
                    onChange={(e) => updateHashConfig("eventName", e.target.value)}
                    placeholder="Enter event name"
                  />
                </div>
                <div>
                  <Label>Hash Salt</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm">Linpack2025</code>
                    <Badge variant="secondary" className="ml-2">Protected</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Hash Preview</h4>
            <p className="text-sm text-muted-foreground">
              Each certificate will get a unique SHA-256 hash based on the selected fields.
              This ensures authenticity and prevents forgery.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Options
          </CardTitle>
          <CardDescription>
            Configure QR code appearance and size
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qrWidth">Width (px)</Label>
              <Input
                id="qrWidth"
                type="number"
                value={qrCodeOptions.width}
                onChange={(e) => updateQrCodeOptions("width", parseInt(e.target.value))}
                min="50"
                max="300"
              />
            </div>
            <div>
              <Label htmlFor="qrHeight">Height (px)</Label>
              <Input
                id="qrHeight"
                type="number"
                value={qrCodeOptions.height}
                onChange={(e) => updateQrCodeOptions("height", parseInt(e.target.value))}
                min="50"
                max="300"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="qrBgColor">Background Color</Label>
              <Input
                id="qrBgColor"
                type="color"
                value={qrCodeOptions.backgroundColor}
                onChange={(e) => updateQrCodeOptions("backgroundColor", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="qrFgColor">Foreground Color</Label>
              <Input
                id="qrFgColor"
                type="color"
                value={qrCodeOptions.foregroundColor}
                onChange={(e) => updateQrCodeOptions("foregroundColor", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Options
          </CardTitle>
          <CardDescription>
            Configure PDF generation settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pdfFormat">Format</Label>
              <select
                id="pdfFormat"
                value={pdfOptions.format}
                onChange={(e) => updatePdfOptions("format", e.target.value as "A4" | "Letter" | "Custom")}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div>
              <Label htmlFor="pdfOrientation">Orientation</Label>
              <select
                id="pdfOrientation"
                value={pdfOptions.orientation}
                onChange={(e) => updatePdfOptions("orientation", e.target.value as "portrait" | "landscape")}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pdfMargin">Margin (mm)</Label>
              <Input
                id="pdfMargin"
                type="number"
                value={pdfOptions.margin}
                onChange={(e) => updatePdfOptions("margin", parseInt(e.target.value))}
                min="0"
                max="50"
              />
            </div>
            <div>
              <Label htmlFor="pdfQuality">Quality</Label>
              <select
                id="pdfQuality"
                value={pdfOptions.quality}
                onChange={(e) => updatePdfOptions("quality", e.target.value as "low" | "medium" | "high")}
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Generation */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleStartGeneration}
            disabled={isGenerating || recipients.length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Generation
              </>
            )}
          </Button>
          {recipients.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Add recipient data first to start generation
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
