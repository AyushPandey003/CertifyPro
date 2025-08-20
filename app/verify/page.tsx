"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  QrCode, 
  Camera, 
  Upload, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  User,
  Mail,
  Hash
} from 'lucide-react'
import { validateHash } from '@/lib/qr-generator'

interface VerificationResult {
  isValid: boolean
  hash: string
  recipientData?: {
    name: string
    email: string
    registrationNumber?: string
    teamId?: string
    event: string
    issuedAt: string
  }
  error?: string
}

export default function VerifyPage() {
  const [verificationMethod, setVerificationMethod] = useState<'scan' | 'manual' | 'upload'>('scan')
  const [manualHash, setManualHash] = useState('')
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Mock database for demo - in production, this would query your actual database
  const mockDatabase = [
    {
      hash: "369c1e3444d8ae3f63412d05663acd8476a3b198036903976c0e1632d9368434",
      recipientData: {
        name: "MEHUL KHARE",
        email: "mehul.khare@example.com",
        registrationNumber: "24BAI10631",
        teamId: "1",
        event: "LinPack Club Event 2024",
        issuedAt: "2024-12-20T10:00:00Z"
      }
    },
    {
      hash: "097e5036fed7680e4180b73e2e985a16fdbc723747bb19b076e94c155946b5d0",
      recipientData: {
        name: "PRAYUSH PATEL",
        email: "prayush.patel@example.com",
        registrationNumber: "24BCE10488",
        teamId: "1",
        event: "LinPack Club Event 2024",
        issuedAt: "2024-12-20T10:00:00Z"
      }
    },
    {
      hash: "cfef4f1560803ec02f0b0b62e7dae9836e5713da487b34542d1219190812ed01",
      recipientData: {
        name: "Priyanshi Solanki",
        email: "priyanshi.solanki@example.com",
        registrationNumber: "24BCE10518",
        teamId: "2",
        event: "LinPack Club Event 2024",
        issuedAt: "2024-12-20T10:00:00Z"
      }
    }
  ]

  useEffect(() => {
    if (verificationMethod === 'scan') {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [verificationMethod])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
        setScanError(null)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setScanError('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        // In production, you would use a QR code detection library here
        // For demo purposes, we'll simulate QR code detection
        simulateQRCodeDetection()
      }
    }
  }

  const simulateQRCodeDetection = () => {
    // Simulate processing time
    setTimeout(() => {
      // For demo, randomly select a hash from our mock database
      const randomHash = mockDatabase[Math.floor(Math.random() * mockDatabase.length)].hash
      verifyHash(randomHash)
    }, 1000)
  }

  const verifyHash = (hash: string) => {
    // Validate hash format
    if (!validateHash(hash)) {
      setVerificationResult({
        isValid: false,
        hash,
        error: 'Invalid hash format'
      })
      return
    }

    // Search database for hash
    const record = mockDatabase.find(entry => entry.hash === hash)
    
    if (record) {
      setVerificationResult({
        isValid: true,
        hash,
        recipientData: record.recipientData
      })
    } else {
      setVerificationResult({
        isValid: false,
        hash,
        error: 'Hash not found in database'
      })
    }
  }

  const handleManualVerification = () => {
    if (manualHash.trim()) {
      verifyHash(manualHash.trim())
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In production, you would process the image file to extract QR code
      // For demo purposes, we'll simulate this
      setTimeout(() => {
        const randomHash = mockDatabase[Math.floor(Math.random() * mockDatabase.length)].hash
        verifyHash(randomHash)
      }, 1000)
    }
  }

  const resetVerification = () => {
    setVerificationResult(null)
    setManualHash('')
    setScanError(null)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Verify Certificates</h1>
        <p className="text-muted-foreground">
          Scan QR codes or manually verify certificate hashes
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Verification Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Method</CardTitle>
            <CardDescription>Choose how to verify the certificate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                variant={verificationMethod === 'scan' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setVerificationMethod('scan')}
              >
                <Camera className="h-4 w-4 mr-2" />
                Scan QR Code
              </Button>
              
              <Button
                variant={verificationMethod === 'manual' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setVerificationMethod('manual')}
              >
                <Hash className="h-4 w-4 mr-2" />
                Manual Hash Input
              </Button>
              
              <Button
                variant={verificationMethod === 'upload' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setVerificationMethod('upload')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verification Interface */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {verificationMethod === 'scan' && 'QR Code Scanner'}
              {verificationMethod === 'manual' && 'Manual Hash Verification'}
              {verificationMethod === 'upload' && 'Image Upload'}
            </CardTitle>
            <CardDescription>
              {verificationMethod === 'scan' && 'Point your camera at a QR code'}
              {verificationMethod === 'manual' && 'Enter the hash manually'}
              {verificationMethod === 'upload' && 'Upload an image containing a QR code'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationMethod === 'scan' && (
              <div className="space-y-4">
                {isScanning ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md mx-auto border rounded-lg"
                    />
                    <Button
                      onClick={captureFrame}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                      size="sm"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Scan QR Code
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Camera not available</p>
                  </div>
                )}
                
                {scanError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{scanError}</p>
                  </div>
                )}
              </div>
            )}

            {verificationMethod === 'manual' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hashInput">Certificate Hash</Label>
                  <Input
                    id="hashInput"
                    value={manualHash}
                    onChange={(e) => setManualHash(e.target.value)}
                    placeholder="Enter 64-character hash..."
                    className="font-mono text-sm"
                  />
                </div>
                <Button onClick={handleManualVerification} className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Verify Hash
                </Button>
              </div>
            )}

            {verificationMethod === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload an image containing a QR code
                  </p>
                </div>
              </div>
            )}

            {/* Verification Result */}
            {verificationResult && (
              <div className="space-y-4">
                <Separator />
                
                <div className={`p-4 rounded-lg border ${
                  verificationResult.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {verificationResult.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {verificationResult.isValid ? 'Valid Certificate' : 'Invalid Certificate'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-xs break-all">
                        {verificationResult.hash}
                      </span>
                    </div>

                    {verificationResult.recipientData && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{verificationResult.recipientData.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-green-600" />
                          <span>{verificationResult.recipientData.email}</span>
                        </div>
                        
                        {verificationResult.recipientData.registrationNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span>Reg: {verificationResult.recipientData.registrationNumber}</span>
                          </div>
                        )}
                        
                        {verificationResult.recipientData.teamId && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span>Team: {verificationResult.recipientData.teamId}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span>{verificationResult.recipientData.event}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span>Issued: {new Date(verificationResult.recipientData.issuedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}

                    {verificationResult.error && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{verificationResult.error}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={resetVerification} variant="outline" className="w-full">
                  Verify Another Certificate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hidden canvas for QR code processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
