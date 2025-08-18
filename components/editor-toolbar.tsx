"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Type, QrCode, ImageIcon, Square, Circle, Triangle } from "lucide-react"

interface EditorToolbarProps {
  onAddElement: (type: "text" | "qr-code" | "image" | "shape") => void
}

export function EditorToolbar({ onAddElement }: EditorToolbarProps) {
  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Elements</CardTitle>
          <CardDescription className="text-xs">Drag elements to your canvas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start h-auto p-3" onClick={() => onAddElement("text")}>
            <Type className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium text-sm">Text</div>
              <div className="text-xs text-muted-foreground">Add text fields</div>
            </div>
          </Button>

          <Button variant="ghost" className="w-full justify-start h-auto p-3" onClick={() => onAddElement("qr-code")}>
            <QrCode className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium text-sm">QR Code</div>
              <div className="text-xs text-muted-foreground">Add QR code placeholder</div>
            </div>
          </Button>

          <Button variant="ghost" className="w-full justify-start h-auto p-3" onClick={() => onAddElement("image")}>
            <ImageIcon className="h-4 w-4 mr-3" />
            <div className="text-left">
              <div className="font-medium text-sm">Image</div>
              <div className="text-xs text-muted-foreground">Add images or logos</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Shapes</CardTitle>
          <CardDescription className="text-xs">Basic shapes and decorations</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="aspect-square"
            onClick={() => onAddElement("shape")}
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="aspect-square"
            onClick={() => onAddElement("shape")}
            title="Circle"
          >
            <Circle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="aspect-square"
            onClick={() => onAddElement("shape")}
            title="Triangle"
          >
            <Triangle className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
