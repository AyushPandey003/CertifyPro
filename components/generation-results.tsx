"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Mail, CheckCircle, Package } from "lucide-react"
import type { GenerationJob } from "@/lib/generation"

interface GenerationResultsProps {
  job: GenerationJob
}

export function GenerationResults({ job }: GenerationResultsProps) {
  const handleDownloadAll = () => {
    // Implementation for downloading all PDFs as ZIP
    console.log("Downloading all PDFs...")
  }

  const handleSendEmails = () => {
    // Implementation for sending emails
    console.log("Sending emails...")
  }

  const handleDownloadSingle = (documentId: string) => {
    // Implementation for downloading single PDF
    console.log("Downloading document:", documentId)
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Generation Complete
          </CardTitle>
          <CardDescription>Successfully generated {job.generatedDocuments.length} certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{job.generatedDocuments.length}</div>
              <div className="text-sm text-muted-foreground">Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {job.completedAt && job.createdAt
                  ? Math.round((job.completedAt.getTime() - job.createdAt.getTime()) / 1000)
                  : 0}
                s
              </div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleDownloadAll} className="flex-1">
              <Package className="h-4 w-4 mr-2" />
              Download All (ZIP)
            </Button>
            <Button onClick={handleSendEmails} variant="outline" className="flex-1 bg-transparent">
              <Mail className="h-4 w-4 mr-2" />
              Send via Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Documents</CardTitle>
          <CardDescription>Individual certificates ready for download or distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Generated At</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {job.generatedDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.recipientName}</TableCell>
                    <TableCell>{doc.recipientEmail}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {doc.hash}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.generatedAt.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadSingle(doc.id)} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next Steps</CardTitle>
          <CardDescription>What would you like to do with your generated certificates?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Email Distribution</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Send personalized emails with certificates attached to all recipients
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Setup Email Campaign
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Verification System</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Set up QR code scanning for certificate verification at events
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Configure Scanner
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
