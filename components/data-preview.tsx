"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download, ArrowRight } from "lucide-react"
import type { RecipientData } from "@/app/data/page"

interface DataPreviewProps {
  recipients: RecipientData[]
}

export function DataPreview({ recipients }: DataPreviewProps) {
  const previewRecipients = recipients.slice(0, 10) // Show first 10 for preview

  const generateSampleHash = (recipient: RecipientData) => {
    // Simple hash simulation for preview
    const data = `${recipient.name}${recipient.email}`
    return btoa(data).substring(0, 8).toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Preview Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Preview</CardTitle>
          <CardDescription>
            Review your recipient data before generating certificates
            {recipients.length > 10 && ` (showing first 10 of ${recipients.length} recipients)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{recipients.length} Recipients</Badge>
              <Badge variant="outline">Ready for Generation</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Preview
              </Button>
              <Button size="sm">
                <ArrowRight className="h-4 w-4 mr-2" />
                Generate Certificates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recipient Data</CardTitle>
          <CardDescription>Preview of data that will be used for certificate generation</CardDescription>
        </CardHeader>
        <CardContent>
          {recipients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-4 opacity-50" />
              <p>No recipient data to preview</p>
              <p className="text-sm">Add recipients to see the preview</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Team ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Achievement</TableHead>
                    <TableHead>Generated Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRecipients.map((recipient) => (
                    <TableRow key={recipient.id}>
                      <TableCell className="font-medium">{recipient.name}</TableCell>
                      <TableCell>{recipient.email}</TableCell>
                      <TableCell>{recipient.rollNumber || "-"}</TableCell>
                      <TableCell>{recipient.teamId || "-"}</TableCell>
                      <TableCell>{recipient.department || "-"}</TableCell>
                      <TableCell>{recipient.achievement || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {generateSampleHash(recipient)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {recipients.length > 10 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">... and {recipients.length - 10} more recipients</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Settings Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generation Settings</CardTitle>
          <CardDescription>Settings that will be applied during certificate generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Hash Configuration</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Include Name:</span>
                  <Badge variant="secondary">Yes</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Include Email:</span>
                  <Badge variant="secondary">Yes</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Include Roll Number:</span>
                  <Badge variant="outline">Optional</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Include Team ID:</span>
                  <Badge variant="outline">Optional</Badge>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Output Settings</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Format:</span>
                  <Badge variant="secondary">PDF</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Quality:</span>
                  <Badge variant="secondary">High (300 DPI)</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Email Delivery:</span>
                  <Badge variant="secondary">Enabled</Badge>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
