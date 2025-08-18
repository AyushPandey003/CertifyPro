
"use client"
import type { HashConfig } from "@/lib/hash-generator"

import { useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { GenerationSettings } from "@/components/generation-settings"
import { GenerationPreview } from "@/components/generation-preview"
import { GenerationProgress } from "@/components/generation-progress"
import { GenerationResults } from "@/components/generation-results"
import { startGeneration, getGenerationStatus, type GenerationJob } from "@/lib/generation"

export default function GeneratePage() {
  const [activeTab, setActiveTab] = useState("settings")
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock data - in real app, this would come from previous steps
  type TemplateElement = { id: string; type: string; [key: string]: unknown }
  const mockTemplateElements: TemplateElement[] = [
    {
      id: "text-1",
      type: "text",
      x: 100,
      y: 100,
      width: 400,
      height: 50,
      rotation: 0,
      properties: {
        text: "Certificate of Achievement for {{name}}",
        fontSize: 24,
        fontFamily: "Arial",
        fontWeight: "bold",
        color: "#000000",
        textAlign: "center",
      },
    },
    {
      id: "qr-1",
      type: "qr-code",
      x: 650,
      y: 450,
      width: 100,
      height: 100,
      rotation: 0,
      properties: {
        data: "{{hash}}",
        backgroundColor: "#ffffff",
        foregroundColor: "#000000",
      },
    },
  ]

  type Recipient = { id: string; name: string; email: string; department?: string; rollNumber?: string; teamId?: string; [key: string]: string | number | undefined }
  const mockRecipients: Recipient[] = [
    { id: "1", name: "John Doe", email: "john@example.com", department: "Engineering" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", department: "Marketing" },
    { id: "3", name: "Bob Johnson", email: "bob@example.com", department: "Sales" },
  ]

  type GenerationSettingsType = {
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
  }

  const handleStartGeneration = async (settings: GenerationSettingsType) => {
    setIsGenerating(true)
    try {
      const { jobId } = await startGeneration(
        mockTemplateElements,
        mockRecipients,
        settings.hashConfig,
        settings.qrCodeOptions,
        settings.pdfOptions,
      )

      // Poll for status updates
      const pollInterval = setInterval(async () => {
        const job = await getGenerationStatus(jobId)
        if (job) {
          setCurrentJob(job)
          if (job.status === "completed" || job.status === "failed") {
            clearInterval(pollInterval)
            setIsGenerating(false)
            if (job.status === "completed") {
              setActiveTab("results")
            }
          }
        }
      }, 1000)
    } catch (error) {
      setIsGenerating(false)
      console.error("Generation failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <Play className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-black text-foreground">Generate Certificates</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentJob && (
              <Badge variant={currentJob.status === "completed" ? "default" : "secondary"}>
                {currentJob.status === "processing" && `${currentJob.progress}%`}
                {currentJob.status === "completed" && "Completed"}
                {currentJob.status === "failed" && "Failed"}
                {currentJob.status === "pending" && "Pending"}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Generation Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Template Elements</CardTitle>
              <div className="text-2xl font-bold">{mockTemplateElements.length}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recipients</CardTitle>
              <div className="text-2xl font-bold">{mockRecipients.length}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
              <div className="text-2xl font-bold">{currentJob?.progress || 0}%</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
              <div className="text-2xl font-bold">
                {currentJob?.status === "completed" && <CheckCircle className="h-6 w-6 text-green-500" />}
                {currentJob?.status === "failed" && <AlertCircle className="h-6 w-6 text-red-500" />}
                {!currentJob && "Ready"}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="progress" disabled={!currentJob}>
              Progress
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!currentJob || currentJob.status !== "completed"}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <GenerationSettings
              onStartGeneration={handleStartGeneration}
              isGenerating={isGenerating}
              templateElements={mockTemplateElements}
              recipients={mockRecipients}
            />
          </TabsContent>

          <TabsContent value="preview">
            <GenerationPreview templateElements={mockTemplateElements} recipients={mockRecipients} />
          </TabsContent>

          <TabsContent value="progress">{currentJob && <GenerationProgress job={currentJob} />}</TabsContent>

          <TabsContent value="results">{currentJob && <GenerationResults job={currentJob} />}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
