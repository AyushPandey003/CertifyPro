"use client"

import { VerificationResult } from "@/components/verification-result"
import { HashVerifier, VerificationResult as VerificationResultType } from "@/lib/hash-verifier"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, QrCode, Camera, Upload, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { QRScanner } from "@/components/qr-scanner"

export default function VerifyPage() {

  const [activeTab, setActiveTab] = useState("scanner")
  const [verificationResult, setVerificationResult] = useState<VerificationResultType | null>(null)
  const [scanHistory, setScanHistory] = useState<{
    id: number
    hash: string
    result: VerificationResultType
    timestamp: Date
  }[]>([])
  const [isScanning, setIsScanning] = useState(false)

  const handleVerificationResult = (result: VerificationResultType, hash?: string) => {
    setVerificationResult(result)
    if (result) {
      setScanHistory((prev) => [
        {
          id: Date.now(),
          hash: hash || (result.certificateData?.registrationNumber || ""),
          result: result,
          timestamp: new Date(),
        },
        ...prev,
      ])
    }
  }

  const handleScan = async (hash: string) => {
    setIsScanning(true)
    try {
      const result = await HashVerifier.verifyHash(hash)
      handleVerificationResult(result, hash)
    } catch {
      handleVerificationResult({ isValid: false, error: "Verification failed", verifiedAt: new Date() }, hash)
    } finally {
      setIsScanning(false)
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
              <QrCode className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-black text-foreground">Certificate Verification</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-foreground mb-2">Verify Certificates</h2>
          <p className="text-muted-foreground">
            Scan QR codes to instantly verify the authenticity of certificates and event passes
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              QR Scanner
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Scan History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    QR Code Scanner
                  </CardTitle>
                  <CardDescription>
                    Use your camera to scan QR codes from certificates and event passes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QRScanner onScan={handleScan} isScanning={isScanning} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verification Result</CardTitle>
                  <CardDescription>Certificate details from scanned QR code</CardDescription>
                </CardHeader>
                <CardContent>
                  {verificationResult ? (
                    <VerificationResult result={verificationResult} onReset={() => setVerificationResult(null)} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Scan a QR code to see verification results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual Hash Verification</CardTitle>
                <CardDescription>
                  Enter a hash manually to verify certificate authenticity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Certificate Hash</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    placeholder="Enter the 64-character SHA-256 hash..."
                  />
                </div>
                <Button className="w-full">Verify Hash</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Scans</h3>
              <Button variant="outline" size="sm">Clear History</Button>
            </div>

            <div className="space-y-4">
              {scanHistory.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No scan history yet</p>
                    <p className="text-sm text-muted-foreground">Scan a QR code to see results here</p>
                  </CardContent>
                </Card>
              ) : (
                scanHistory.map((scan) => (
                  <Card key={scan.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {scan.result.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">
                              {scan.result.isValid ? "Valid Certificate" : "Invalid Certificate"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {scan.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={scan.result.isValid ? "default" : "destructive"}>
                            {scan.result.isValid ? "Valid" : "Invalid"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Hash: {scan.hash.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-4">Verification Statistics</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {scanHistory.filter((scan) => scan.result.isValid).length}
                </div>
                <p className="text-sm text-muted-foreground">Valid Certificates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {scanHistory.filter((scan) => !scan.result.isValid).length}
                </div>
                <p className="text-sm text-muted-foreground">Invalid Attempts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{scanHistory.length}</div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {scanHistory.length > 0
                    ? Math.round(
                        (scanHistory.filter((scan) => scan.result.isValid).length / scanHistory.length) * 100,
                      )
                    : 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
