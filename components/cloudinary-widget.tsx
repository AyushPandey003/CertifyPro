"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Cloud } from "lucide-react"

type UploadResultInfo = {
  secure_url: string
  original_filename?: string
}

interface CloudinaryWidgetButtonProps {
  onImageSelect: (imageData: { src: string; alt: string }) => void
  label?: string
  sources?: string[]
}

interface CloudinaryWidgetResult {
  event: string
  info?: UploadResultInfo
}

interface CloudinaryWidgetOptions {
  cloudName: string
  uploadPreset: string
  sources?: string[]
  multiple?: boolean
  resourceType?: string
  maxFiles?: number
  clientAllowedFormats?: string[]
}

interface Cloudinary {
  createUploadWidget: (
    options: CloudinaryWidgetOptions,
    callback: (error: unknown, result: CloudinaryWidgetResult) => void
  ) => { open: () => void }
}

declare global {
  interface Window {
    cloudinary?: Cloudinary
  }
}

export function CloudinaryWidgetButton({ onImageSelect, label = "Open Cloudinary Sources", sources }: CloudinaryWidgetButtonProps) {
  const [ready, setReady] = useState(false)
  const widgetRef = useRef<{ open: () => void } | null>(null)

  const ensureScript = useCallback(() => {
    if (window.cloudinary) {
      setReady(true)
      return
    }

    const scriptId = "cloudinary-upload-widget"
    if (document.getElementById(scriptId)) {
      // Another instance is loading
  const existing = document.getElementById(scriptId) as HTMLScriptElement
  if (existing && existing.dataset && existing.dataset.loaded === "true") setReady(true)
  else existing.addEventListener("load", () => setReady(true))
      return
    }

    const script = document.createElement("script")
    script.id = scriptId
    script.src = "https://upload-widget.cloudinary.com/global/all.js"
    script.async = true
    script.addEventListener("load", () => {
      script.dataset.loaded = "true"
      setReady(true)
    })
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    ensureScript()
  }, [ensureScript])

  const openWidget = useCallback(() => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) {
      alert("Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.")
      return
    }

    if (!window.cloudinary) {
      alert("Cloudinary widget not loaded yet. Please try again in a moment.")
      return
    }

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources:
            sources || [
              "local",
              "url",
              "camera",
              "google_drive",
              "dropbox",
              "image_search",
              "unsplash",
              "shutterstock",
              "istock",
              "pexels",
              "pixabay",
              "freepik",
              "flaticon",
              "flickr",
            ],
          multiple: false,
          resourceType: "image",
          maxFiles: 1,
          clientAllowedFormats: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
        },
        (_error, result) => {
          if (result && result.event === "success" && result.info?.secure_url) {
            const fileUrl = result.info.secure_url
            const fileName = result.info.original_filename || "Cloudinary Image"
            onImageSelect({ src: fileUrl, alt: fileName })
          }
        },
      )
    }

    widgetRef.current.open()
  }, [onImageSelect, sources])

  return (
    <Button variant="outline" size="sm" className="w-full" onClick={openWidget} disabled={!ready}>
      <Cloud className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}

export default CloudinaryWidgetButton


