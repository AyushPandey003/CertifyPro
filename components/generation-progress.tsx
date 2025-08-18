"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import type { GenerationJob } from "@/lib/generation"

interface GenerationProgressProps {
  job: GenerationJob
}

export function GenerationProgress({ job }: GenerationProgressProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (job.status) {
      case "pending":
        return "secondary"
      case "processing":
        return "default"
      case "completed":
        return "default"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            Generation Progress
          </CardTitle>
          <CardDescription>Track the progress of your certificate generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={getStatusColor()}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Documents</span>
              <span className="text-sm">
                {job.generatedDocuments.length} of {job.totalDocuments}
              </span>
            </div>

            {job.status === "failed" && job.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{job.error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Job ID</label>
                <p className="text-sm text-muted-foreground font-mono">{job.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Started At</label>
                <p className="text-sm text-muted-foreground">{job.createdAt.toLocaleString()}</p>
              </div>
              {job.completedAt && (
                <div>
                  <label className="text-sm font-medium">Completed At</label>
                  <p className="text-sm text-muted-foreground">{job.completedAt.toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Template ID</label>
                <p className="text-sm text-muted-foreground font-mono">{job.templateId}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Total Recipients</label>
                <p className="text-sm text-muted-foreground">{job.totalDocuments}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Generated Documents</label>
                <p className="text-sm text-muted-foreground">{job.generatedDocuments.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      {job.generatedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recently Generated</CardTitle>
            <CardDescription>Latest documents in this generation job</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {job.generatedDocuments.slice(-5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{doc.recipientName}</p>
                    <p className="text-xs text-muted-foreground">{doc.recipientEmail}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="font-mono text-xs">
                      {doc.hash}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{doc.generatedAt.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
