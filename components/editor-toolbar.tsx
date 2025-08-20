"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Type, QrCode, ImageIcon, Square, Circle, Triangle, Upload} from "lucide-react"

import type {  TemplateData } from "@/app/editor/page"

interface EditorToolbarProps {
  onAddElement: (type: "text" | "qr-code" | "image" | "shape") => void
  onLoadTemplate?: (template: TemplateData | null) => void
  onImageUpload?: (file: File) => void
}

export function EditorToolbar({ onAddElement, onLoadTemplate, onImageUpload }: EditorToolbarProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sample templates - in production these would come from a database
  const templates = [
    { id: "certificate-basic", name: "Basic Certificate", description: "Simple certificate layout" },
    { id: "certificate-modern", name: "Modern Certificate", description: "Contemporary design" },
    { id: "event-pass", name: "Event Pass", description: "Professional event pass" },
    { id: "achievement", name: "Achievement Award", description: "Recognition certificate" },
  ]

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    if (templateId && onLoadTemplate) {
      // Load the selected template
      const template = templates.find(t => t.id === templateId)
      if (template) {
        // In production, you'd fetch the actual template data
        const templateData = getTemplateData(templateId)
        onLoadTemplate(templateData)
      }
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImageUpload) {
      onImageUpload(file)
    }
  }

  const getTemplateData = (templateId: string): TemplateData | null => {
    // Sample template data - in production this would come from a database
    const templateData: Record<string, TemplateData> = {
      // ...existing template objects...
      "certificate-basic": {
        elements: [
          { id: "title", type: "text", x: 400, y: 100, width: 300, height: 60, rotation: 0, properties: { text: "Certificate of Completion", fontSize: 32, fontWeight: "bold", textAlign: "center" } },
          { id: "subtitle", type: "text", x: 400, y: 180, width: 300, height: 40, rotation: 0, properties: { text: "This is to certify that", fontSize: 18, textAlign: "center" } },
          { id: "name", type: "text", x: 400, y: 240, width: 300, height: 50, rotation: 0, properties: { text: "Student Name", fontSize: 24, fontWeight: "bold", textAlign: "center" } },
          { id: "description", type: "text", x: 400, y: 320, width: 400, height: 60, rotation: 0, properties: { text: "has successfully completed the course requirements", fontSize: 16, textAlign: "center" } },
          { id: "date", type: "text", x: 400, y: 400, width: 200, height: 30, rotation: 0, properties: { text: "Date: January 2024", fontSize: 14, textAlign: "center" } },
        ],
        canvasWidth: 800,
        canvasHeight: 600,
      },
      "certificate-modern": {
        elements: [
          { id: "header", type: "text", x: 400, y: 80, width: 300, height: 50, rotation: 0, properties: { text: "CERTIFICATE", fontSize: 36, fontWeight: "bold", textAlign: "center", color: "#2563eb" } },
          { id: "achievement", type: "text", x: 400, y: 160, width: 400, height: 40, rotation: 0, properties: { text: "Certificate of Achievement", fontSize: 20, textAlign: "center", color: "#64748b" } },
          { id: "recipient", type: "text", x: 400, y: 240, width: 300, height: 50, rotation: 0, properties: { text: "Recipient Name", fontSize: 28, fontWeight: "bold", textAlign: "center" } },
          { id: "course", type: "text", x: 400, y: 320, width: 350, height: 40, rotation: 0, properties: { text: "Course: Advanced Web Development", fontSize: 18, textAlign: "center" } },
          { id: "signature", type: "text", x: 400, y: 420, width: 200, height: 30, rotation: 0, properties: { text: "Instructor Signature", fontSize: 14, textAlign: "center", fontStyle: "italic" } },
        ],
        canvasWidth: 800,
        canvasHeight: 600,
      },
      "event-pass": {
        elements: [
          { id: "title", type: "text", x: 400, y: 100, width: 300, height: 50, rotation: 0, properties: { text: "EVENT PASS", fontSize: 32, fontWeight: "bold", textAlign: "center", color: "#dc2626" } },
          { id: "event-name", type: "text", x: 400, y: 180, width: 350, height: 40, rotation: 0, properties: { text: "Tech Conference 2024", fontSize: 24, fontWeight: "bold", textAlign: "center" } },
          { id: "attendee", type: "text", x: 400, y: 260, width: 300, height: 40, rotation: 0, properties: { text: "Attendee Name", fontSize: 20, textAlign: "center" } },
          { id: "date", type: "text", x: 400, y: 340, width: 200, height: 30, rotation: 0, properties: { text: "Date: March 15, 2024", fontSize: 16, textAlign: "center" } },
          { id: "venue", type: "text", x: 400, y: 380, width: 300, height: 30, rotation: 0, properties: { text: "Venue: Convention Center", fontSize: 16, textAlign: "center" } },
        ],
        canvasWidth: 800,
        canvasHeight: 600,
      },
      "achievement": {
        elements: [
          { id: "award", type: "text", x: 400, y: 120, width: 300, height: 50, rotation: 0, properties: { text: "AWARD OF EXCELLENCE", fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#f59e0b" } },
          { id: "presented", type: "text", x: 400, y: 200, width: 300, height: 30, rotation: 0, properties: { text: "Presented to", fontSize: 16, textAlign: "center" } },
          { id: "recipient", type: "text", x: 400, y: 250, width: 300, height: 50, rotation: 0, properties: { text: "Recipient Name", fontSize: 26, fontWeight: "bold", textAlign: "center" } },
          { id: "reason", type: "text", x: 400, y: 320, width: 400, height: 40, rotation: 0, properties: { text: "For outstanding performance and dedication", fontSize: 18, textAlign: "center" } },
          { id: "date", type: "text", x: 400, y: 380, width: 200, height: 30, rotation: 0, properties: { text: "Awarded: January 2024", fontSize: 14, textAlign: "center" } },
        ],
        canvasWidth: 800,
        canvasHeight: 600,
      },
    };
    return templateData[templateId] || null;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Template Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Templates</CardTitle>
          <CardDescription className="text-xs">Choose a starting template</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="text-left">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Upload Image</CardTitle>
          <CardDescription className="text-xs">Add images from your device</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Image
          </Button>
        </CardContent>
      </Card>

      {/* Elements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Elements</CardTitle>
          <CardDescription className="text-xs">Drag elements to your canvas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start h-auto p-3" onClick={() => onAddElement("text")}>
            <Type className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium text-sm">Text</div>
              <div className="text-xs text-muted-foreground">Add text fields</div>
            </div>
          </Button>

          <Button variant="ghost" className="w-full justify-start h-auto p-3" onClick={() => onAddElement("qr-code")}>
            <QrCode className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium text-sm">QR Code</div>
              <div className="text-xs text-muted-foreground">Add QR code placeholder</div>
            </div>
          </Button>

          <Button variant="ghost" className="w-full justify-start h-auto p-3" onClick={() => onAddElement("image")}>
            <ImageIcon className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium text-sm">Image</div>
              <div className="text-xs text-muted-foreground">Add images or logos</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Shapes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Shapes</CardTitle>
          <CardDescription className="text-xs">Basic shapes and decorations</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="aspect-square"
            onClick={() => onAddElement("shape")}
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="aspect-square"
            onClick={() => onAddElement("shape")}
            title="Circle"
          >
            <Circle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="aspect-square"
            onClick={() => onAddElement("shape")}
            title="Triangle"
          >
            <Triangle className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
