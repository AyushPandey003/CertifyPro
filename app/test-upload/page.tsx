"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { UploadButton } from "@/lib/uploadthing"

export default function TestUploadPage() {
  type UploadThingResult =
    | null
    | { error: string }
    | Array<{
        id: string
        name: string
        size: number
        uploadedBy: string
        url: string
      }>

  const [uploadResult, setUploadResult] = useState<UploadThingResult>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUploadComplete = (
    res: Array<{
      name: string
      size: number
      url: string
      key: string
      serverData: {
        uploadedBy: string
        [key: string]: unknown
      }
    }>
  ) => {
    setIsUploading(false)
    // Map the result to match your UploadThingResult type
    const mapped = res.map(file => ({
      id: file.key,
      name: file.name,
      size: file.size,
      uploadedBy: file.serverData.uploadedBy as string,
      url: file.url,
    }))
    setUploadResult(mapped)
    console.log("Upload complete:", mapped)
  }

  const handleUploadError = (error: Error) => {
    setIsUploading(false)
    setUploadResult({ error: error.message })
    console.error("Upload failed:", error)
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
            <h1 className="text-xl font-black text-foreground">UploadThing Test</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Test UploadThing Integration</CardTitle>
              <CardDescription>
                Test the cloud image upload functionality before using it in the editor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Button */}
              <div className="space-y-2">
                <h3 className="font-medium">Upload Image to Cloud</h3>
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  onUploadBegin={() => setIsUploading(true)}
                  className="w-full"
                />
                {isUploading && (
                  <div className="text-sm text-blue-600 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-blue-600"></div>
                    Uploading to cloud...
                  </div>
                )}
              </div>

              {/* Upload Result */}
              {uploadResult && (
                <div className="space-y-4">
                  <h3 className="font-medium">Upload Result</h3>
                  {Array.isArray(uploadResult) ? (
                    <>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Upload Successful!</span>
                        </div>
                        {uploadResult[0] && (
                          <div className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-green-700">File Name:</span>
                              <span className="font-medium">{uploadResult[0].name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">File Size:</span>
                              <span className="font-medium">
                                {(uploadResult[0].size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Uploaded By:</span>
                              <span className="font-medium">{uploadResult[0].uploadedBy}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {uploadResult[0]?.url && (
                        <>
                          <h4 className="font-medium">Image Preview</h4>
                          <div className="border rounded-lg overflow-hidden">
                            <Image
                              src={uploadResult[0].url}
                              alt="Uploaded image"
                              width={400}
                              height={192}
                              className="w-full h-48 object-contain bg-gray-50"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground break-all">
                            URL: {uploadResult[0].url}
                          </div>
                        </>
                      )}
                      {uploadResult[0]?.id && (
                        <div className="text-xs text-muted-foreground">
                          ID: {uploadResult[0].id}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {uploadResult.error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-800">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">Upload Failed</span>
                          </div>
                          <p className="text-sm text-red-600 mt-1">{uploadResult.error}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">How to Test</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Click the upload button above</li>
                  <li>Select an image file (JPG, PNG, GIF, etc.)</li>
                  <li>Wait for the upload to complete</li>
                  <li>Check the result and image preview below</li>
                  <li>If successful, you can use this in the editor!</li>
                </ol>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <Button asChild className="flex-1">
                  <Link href="/editor">Go to Editor</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
