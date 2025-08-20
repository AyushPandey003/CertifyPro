"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Cloud, Link, CloudUpload } from "lucide-react"
import { CloudinaryWidgetButton } from "@/components/cloudinary-widget"
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
  const [isCloudinaryUploading, setIsCloudinaryUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cloudinaryFileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
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

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) {
      alert("Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.")
      return
    }

    try {
      setIsCloudinaryUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", uploadPreset)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      })
      if (!res.ok) throw new Error("Cloudinary upload failed")
      const data = await res.json()

      const imageUrl = data.secure_url as string
      const fileName = (data.original_filename as string) || "Uploaded Image"

      setPreviewUrl(imageUrl)
      setAltText(fileName)

      onImageSelect({ src: imageUrl, alt: fileName })
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsCloudinaryUploading(false)
    }
  }

  const handleCloudinaryFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await uploadToCloudinary(file)
      // reset value so selecting the same file again triggers onChange
      event.currentTarget.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {/* Cloudinary Upload */}
      <div>
        <Label className="text-xs flex items-center gap-2">
          <Cloud className="h-3 w-3" />
          Cloud Upload (Cloudinary)
        </Label>
        <div className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <CloudinaryWidgetButton
              onImageSelect={({ src, alt }) => {
                setPreviewUrl(src)
                setAltText(alt)
                onImageSelect({ src, alt })
              }}
              label="Open Cloudinary Modal (Drive, Dropbox, etc.)"
              sources={["local","url","camera","google_drive","dropbox","unsplash","shutterstock","istock","pexels","pixabay","freepik","flaticon","flickr"]}
            />
            <div>
              <input
                ref={cloudinaryFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCloudinaryFileChange}
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => cloudinaryFileInputRef.current?.click()}
              >
                <CloudUpload className="h-4 w-4 mr-2" />
                Upload Directly
              </Button>
            </div>
          </div>
          {isCloudinaryUploading && (
            <div className="mt-2 text-xs text-blue-600 flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
              Uploading to Cloudinary...
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
          <p className="text-xs text-gray-400">Upload to Cloudinary, choose local file, or enter URL</p>
        </div>
      )}
    </div>
  )
}
