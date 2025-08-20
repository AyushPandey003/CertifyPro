"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Type, QrCode, ImageIcon, Square, Eye, EyeOff, Trash2 } from "lucide-react"
import type { EditorElement } from "@/app/editor/page"

interface EditorLayersProps {
  elements: (EditorElement & { hidden?: boolean })[]
  selectedElementId: string | null
  onSelectElement: (id: string) => void
  onDeleteElement: (id: string) => void
  onToggleVisibility?: (id: string) => void
}

export function EditorLayers({ elements, selectedElementId, onSelectElement, onDeleteElement, onToggleVisibility }: EditorLayersProps) {
  const getElementIcon = (type: EditorElement["type"]) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />
      case "qr-code":
        return <QrCode className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "shape":
        return <Square className="h-4 w-4" />
      default:
        return <Square className="h-4 w-4" />
    }
  }

  const getElementName = (element: EditorElement): string => {
    switch (element.type) {
      case "text":
        return typeof element.properties.text === "string"
          ? element.properties.text.substring(0, 20)
          : "Text"
      case "qr-code":
        return "QR Code"
      case "image":
        return typeof element.properties.alt === "string" && element.properties.alt.length > 0
          ? element.properties.alt
          : "Image"
      case "shape":
        return typeof element.properties.shape === "string" && element.properties.shape.length > 0
          ? element.properties.shape
          : "Shape"
      default:
        return "Element"
    }
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Layers</CardTitle>
          <CardDescription className="text-xs">Manage your design elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {elements.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No elements added yet</p>
          ) : (
            elements.map((element) => (
              <div
                key={element.id}
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                  selectedElementId === element.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                }`}
                onClick={() => onSelectElement(element.id)}
              >
                <div className="text-muted-foreground">{getElementIcon(element.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{getElementName(element)}</div>
                  <div className="text-xs text-muted-foreground capitalize">{element.type.replace("-", " ")}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleVisibility?.(element.id)
                    }}
                    title={element.hidden ? 'Show' : 'Hide'}
                  >
                    {element.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteElement(element.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
