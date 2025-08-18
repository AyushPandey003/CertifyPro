"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Scan, RefreshCw, Upload } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
  isScanning: boolean
}

export function QRScanner({ onScan, isScanning }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string>("")
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    checkCameraAvailability()
  }, [])

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasVideoInput = devices.some((device) => device.kind === "videoinput")
      setHasCamera(hasVideoInput)
    } catch {
      setCameraError("Camera access not available")
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsActive(true)
        setCameraError("")

        // Start scanning for QR codes
        scanForQRCode()
      }
    } catch {
      setCameraError("Failed to access camera. Please allow camera permissions.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsActive(false)
    }
  }

  const scanForQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // In production, use a QR code library like jsQR
      // const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      // const code = jsQR(imageData.data, imageData.width, imageData.height)

      // Mock QR detection for demo
      if (Math.random() < 0.1) {
        // 10% chance to simulate QR detection
        const mockHash = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
        onScan(mockHash)
        return
      }
    }

    // Continue scanning
    if (isActive) {
      requestAnimationFrame(scanForQRCode)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        // In production, process the image to extract QR code
        // For demo, simulate QR detection
        const mockHash = "uploaded_qr_hash_" + Date.now()
        onScan(mockHash)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Scan className="w-5 h-5" />
          QR Scanner
        </CardTitle>
        <CardDescription>Scan QR codes from certificates to verify authenticity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasCamera ? (
          <div className="space-y-4">
            <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden">
              {isActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-cyan-500 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-500"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-500"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-500"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-500"></div>

                      {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Camera not active</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isActive ? (
                <Button onClick={startCamera} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" className="flex-1 bg-transparent">
                  Stop Camera
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Camera className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 mb-4">{cameraError || "Camera not available"}</p>
          </div>
        )}

        {/* File upload alternative */}
        <div className="border-t pt-4">
          <p className="text-sm text-slate-600 mb-2">Or upload QR code image:</p>
          <label className="block">
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </span>
            </Button>
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
