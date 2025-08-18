"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Award, Search, Star, Download, Eye } from "lucide-react"
import Image from "next/image"

export function DashboardTemplates() {
  const router = useRouter()

  const templates = [
    {
      id: 1,
      name: "Modern Certificate",
      type: "Certificate",
      category: "Professional",
      description: "Clean and modern certificate design perfect for corporate awards",
      isPopular: true,
      preview: "/winner.png?height=200&width=300",
    },
    {
      id: 2,
      name: "Conference Badge",
      type: "Event Pass",
      category: "Events",
      description: "Professional conference badge with QR code placement",
      isPopular: true,
      preview: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      name: "Achievement Award",
      type: "Certificate",
      category: "Academic",
      description: "Traditional academic achievement certificate with elegant borders",
      isPopular: false,
      preview: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      name: "Workshop Pass",
      type: "Event Pass",
      category: "Education",
      description: "Colorful workshop pass design with participant information",
      isPopular: false,
      preview: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 5,
      name: "Excellence Certificate",
      type: "Certificate",
      category: "Professional",
      description: "Premium certificate design for excellence awards",
      isPopular: true,
      preview: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 6,
      name: "Event Ticket",
      type: "Event Pass",
      category: "Events",
      description: "Modern event ticket design with security features",
      isPopular: false,
      preview: "/placeholder.svg?height=200&width=300",
    },
  ]

  const handleUseTemplate = (template: (typeof templates)[number]) => {
    const canvasWidth = 800
    const canvasHeight = 600

    const backgroundImageUrl = template.preview || ""

    const editorState = {
      elements: [
        {
          id: `bg-${Date.now()}`,
          type: "image",
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
          rotation: 0,
          properties: {
            src: backgroundImageUrl,
            alt: template.name,
          },
        },
        {
          id: `title-${Date.now()}`,
          type: "text",
          x: 80,
          y: 80,
          width: 640,
          height: 60,
          rotation: 0,
          properties: {
            text: template.name,
            fontSize: 28,
            fontFamily: "Arial",
            fontWeight: "700",
            color: "#111111",
            textAlign: "center",
          },
        },
      ],
      selectedElementId: null,
      canvasWidth,
      canvasHeight,
      zoom: 1,
    }

    try {
      localStorage.setItem("certifypro-import-template", JSON.stringify(editorState))
      router.push("/editor")
    } catch {
      // no-op
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Template Library</h3>
          <p className="text-muted-foreground">Choose from professional templates or create your own</p>
        </div>
        <Button variant="outline">
          <Award className="h-4 w-4 mr-2" />
          Upload Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search templates..." className="pl-10" />
      </div>

      {/* Popular Templates */}
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Popular Templates
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates
            .filter((template) => template.isPopular)
            .map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-2">
                  <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                    <Image
                      src={template.preview || "/placeholder.svg"}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      width={300}
                      height={200}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={template.type === "Certificate" ? "secondary" : "outline"}>{template.type}</Badge>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleUseTemplate(template)}>
                      <Download className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* All Templates */}
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-4">All Templates</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-2">
                <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                  <Image
                    src={template.preview || "/placeholder.svg"}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    width={300}
                    height={200}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={template.type === "Certificate" ? "secondary" : "outline"}>{template.type}</Badge>
                  <div className="flex items-center gap-2">
                    {template.isPopular && <Star className="h-4 w-4 text-yellow-500" />}
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleUseTemplate(template)}>
                    <Download className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
