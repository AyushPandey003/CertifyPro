"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Cloud, Link, Search } from "lucide-react"
import { UploadButton } from "@/lib/uploadthing"
import { PexelsImagePicker } from "./pexels-image-picker"
import Image from "next/image"

interface ImageUploadProps {
  onImageSelect: (imageData: { src: string; alt: string }) => void
  currentSrc?: string
  currentAlt?: string
}

export function ImageUpload({ onImageSelect, currentSrc, currentAlt }: ImageUploadProps) {
  // Removed unused selectedImage state
  const [previewUrl, setPreviewUrl] = useState<string>(currentSrc || "")
  const [altText, setAltText] = useState<string>(currentAlt || "")
  const [isUploading, setIsUploading] = useState(false)
  const [showPexelsPicker, setShowPexelsPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      // setSelectedImage(file) // Removed unused state
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewUrl(result)
        setAltText(file.name)
        
        // Notify parent component
        onImageSelect({
          src: result,
          alt: file.name
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url)
    onImageSelect({
      src: url,
      alt: altText
    })
  }

  const handleAltChange = (alt: string) => {
    setAltText(alt)
    if (previewUrl) {
      onImageSelect({
        src: previewUrl,
        alt: alt
      })
    }
  }

  const clearImage = () => {
    // setSelectedImage(null) // Removed unused state
    setPreviewUrl("")
    setAltText("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageSelect({
      src: "",
      alt: ""
    })
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  type UploadThingResult = { url: string; name?: string }[];

  const handleUploadComplete = (res: UploadThingResult) => {
    setIsUploading(false)
    if (res && res[0]) {
      const uploadedFile = res[0]
      const imageUrl = uploadedFile.url
      const fileName = uploadedFile.name || "Uploaded Image"
      
      setPreviewUrl(imageUrl)
      setAltText(fileName)
      
      onImageSelect({
        src: imageUrl,
        alt: fileName
      })
    }
  }

  const handleUploadError = (error: Error) => {
    setIsUploading(false)
    console.error("Upload failed:", error)
    alert(`Upload failed: ${error.message}`)
  }

  const handlePexelsImageSelect = (imageData: { src: string; alt: string }) => {
    setPreviewUrl(imageData.src)
    setAltText(imageData.alt)
    onImageSelect(imageData)
  }

  return (
    <div className="space-y-4">
      {/* Pexels Stock Photos */}
      <div>
        <Label className="text-xs flex items-center gap-2">
          <Search className="h-3 w-3" />
          Stock Photos (Pexels)
        </Label>
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
            onClick={() => setShowPexelsPicker(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            Browse Stock Photos
          </Button>
        </div>
      </div>

      {/* UploadThing Cloud Upload */}
      <div>
        <Label className="text-xs flex items-center gap-2">
          <Cloud className="h-3 w-3" />
          Cloud Upload (Recommended)
        </Label>
        <div className="mt-2">
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={() => setIsUploading(true)}
            className="w-full"
          />
          {isUploading && (
            <div className="mt-2 text-xs text-blue-600 flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
              Uploading to cloud...
            </div>
          )}
        </div>
      </div>

      {/* Local File Upload */}
      <div>
        <Label htmlFor="imageFile" className="text-xs flex items-center gap-2">
          <Upload className="h-3 w-3" />
          Local Upload (Demo)
        </Label>
        <div className="mt-2">
          <input
            ref={fileInputRef}
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-transparent"
            onClick={triggerFileInput}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Local Image
          </Button>
        </div>
      </div>

      {/* URL Input */}
      <div>
        <Label htmlFor="imageUrl" className="text-xs flex items-center gap-2">
          <Link className="h-3 w-3" />
          Image URL
        </Label>
        <Input
          id="imageUrl"
          value={previewUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="h-8 mt-2"
        />
      </div>

      {/* Alt Text */}
      <div>
        <Label htmlFor="imageAlt" className="text-xs">
          Alt Text
        </Label>
        <Input
          id="imageAlt"
          value={altText}
          onChange={(e) => handleAltChange(e.target.value)}
          placeholder="Description of the image"
          className="h-8 mt-2"
        />
      </div>

      {/* Image Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <Label className="text-xs">Preview</Label>
          <div className="relative border rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={previewUrl}
              alt={altText}
              className="w-full h-32 object-contain"
              width={400}
              height={128}
              onError={() => {
                // Handle broken images
                setPreviewUrl("")
                setAltText("")
              }}
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={clearImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Placeholder when no image */}
      {!previewUrl && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No image selected</p>
          <p className="text-xs text-gray-400">Choose from stock photos, upload to cloud, choose local file, or enter URL</p>
        </div>
      )}

      {/* Pexels Image Picker Modal */}
      {showPexelsPicker && (
        <PexelsImagePicker
          onImageSelect={handlePexelsImageSelect}
          onClose={() => setShowPexelsPicker(false)}
        />
      )}
    </div>
  )
}
