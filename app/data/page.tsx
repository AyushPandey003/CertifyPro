"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Download, Users } from "lucide-react"
import Link from "next/link"
import { DataUpload } from "@/components/data-upload"
import { DataTable } from "@/components/data-table"
import { DataValidation } from "@/components/data-validation"
import { DataPreview } from "@/components/data-preview"

export interface RecipientData {
  id: string
  name: string
  email: string
  rollNumber?: string
  teamId?: string
  department?: string
  achievement?: string
  customFields?: Record<string, string>
}

export default function DataManagementPage() {
  const [recipients, setRecipients] = useState<RecipientData[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const addRecipient = (recipient: Omit<RecipientData, "id">) => {
    const newRecipient: RecipientData = {
      ...recipient,
      id: `recipient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    setRecipients((prev) => [...prev, newRecipient])
  }

  const updateRecipient = (id: string, updates: Partial<RecipientData>) => {
    setRecipients((prev) => prev.map((recipient) => (recipient.id === id ? { ...recipient, ...updates } : recipient)))
  }

  const deleteRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((recipient) => recipient.id !== id))
  }

  const bulkAddRecipients = (newRecipients: Omit<RecipientData, "id">[]) => {
    const recipientsWithIds = newRecipients.map((recipient) => ({
      ...recipient,
      id: `recipient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }))
    setRecipients((prev) => [...prev, ...recipientsWithIds])
  }

  const validateData = () => {
    const errors: string[] = []
    recipients.forEach((recipient, index) => {
      if (!recipient.name.trim()) {
        errors.push(`Row ${index + 1}: Name is required`)
      }
      if (!recipient.email.trim()) {
        errors.push(`Row ${index + 1}: Email is required`)
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
        errors.push(`Row ${index + 1}: Invalid email format`)
      }
    })

    // Check for duplicate emails
    const emailCounts = recipients.reduce(
      (acc, recipient) => {
        acc[recipient.email] = (acc[recipient.email] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    Object.entries(emailCounts).forEach(([email, count]) => {
      if (count > 1) {
        errors.push(`Duplicate email found: ${email}`)
      }
    })

    setValidationErrors(errors)
    return errors.length === 0
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
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-black text-foreground">Data Management</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button size="sm" onClick={() => setActiveTab("manual")}>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Recipient</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Recipients</CardTitle>
              <div className="text-2xl font-bold">{recipients.length}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valid Records</CardTitle>
              <div className="text-2xl font-bold text-green-600">{recipients.length - validationErrors.length}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Validation Errors</CardTitle>
              <div className="text-2xl font-bold text-red-600">{validationErrors.length}</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ready to Generate</CardTitle>
              <div className="text-2xl font-bold text-primary">
                {validationErrors.length === 0 && recipients.length > 0 ? recipients.length : 0}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="validate">Validation</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <DataUpload onDataUploaded={bulkAddRecipients} />
          </TabsContent>

          <TabsContent value="manual">
            <DataTable
              recipients={recipients}
              onAddRecipient={addRecipient}
              onUpdateRecipient={updateRecipient}
              onDeleteRecipient={deleteRecipient}
            />
          </TabsContent>

          <TabsContent value="validate">
            <DataValidation recipients={recipients} onValidate={validateData} errors={validationErrors} />
          </TabsContent>

          <TabsContent value="preview">
            <DataPreview recipients={recipients} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
