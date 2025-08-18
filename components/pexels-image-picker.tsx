"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ImageIcon, Loader2, ExternalLink} from "lucide-react"
import type { PexelsImage } from "@/lib/pexels-service"
import Image from "next/image"

interface PexelsImagePickerProps {
  onImageSelect: (imageData: { src: string; alt: string }) => void
  onClose: () => void
}

export function PexelsImagePicker({ onImageSelect, onClose }: PexelsImagePickerProps) {
  const [images, setImages] = useState<PexelsImage[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("certificates")
  const [error, setError] = useState("")

  const categories = [
    { id: "certificates", label: "Certificates", icon: "🎓" },
    { id: "business", label: "Business", icon: "💼" },
    { id: "celebration", label: "Celebration", icon: "🎉" },
    { id: "backgrounds", label: "Backgrounds", icon: "🎨" },
    { id: "curated", label: "Trending", icon: "🔥" },
  ]

  const fetchImages = async (category: string, query?: string) => {
    setLoading(true)
    setError("")
    
    try {
      const params = new URLSearchParams()
      if (query) {
        params.append("q", query)
      } else {
        params.append("category", category)
      }
      
      const response = await fetch(`/api/pexels/search?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch images")
      }
      
      const data = await response.json()
      setImages(data.photos || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch images")
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages(activeTab)
  }, [activeTab])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      fetchImages("", searchQuery.trim())
    }
  }

  const handleImageSelect = (image: PexelsImage) => {
    onImageSelect({
      src: image.src.large,
      alt: image.alt || `Photo by ${image.photographer}`
    })
    onClose()
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchQuery("")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Choose from Pexels</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search for images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
            <TabsList className="grid w-full grid-cols-5 p-4">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="h-full p-4 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center text-red-600 py-8">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => fetchImages(activeTab)}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No images found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <Card 
                      key={image.id} 
                      className="group cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleImageSelect(image)}
                    >
                      <CardContent className="p-2">
                        <div className="relative aspect-video overflow-hidden rounded-md">
                          <Image
                            src={image.src.medium}
                            alt={image.alt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p className="truncate">by {image.photographer}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span>{image.width}×{image.height}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Powered by Pexels - Free stock photos</span>
            <a 
              href="https://pexels.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Visit Pexels
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
