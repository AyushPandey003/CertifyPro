"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import type { EditorElement } from "@/app/editor/page"
import { ImageUpload } from "./image-upload"

interface EditorPropertiesProps {
  selectedElement: EditorElement | undefined
  onUpdateElement: (id: string, updates: Partial<EditorElement>) => void
  onDeleteElement?: (id: string) => void
}

export function EditorProperties({ selectedElement, onUpdateElement, onDeleteElement }: EditorPropertiesProps) {
  if (!selectedElement) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Properties</CardTitle>
            <CardDescription className="text-xs">Select an element to edit its properties</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const updateProperty = (key: string, value: string | number | boolean) => {
    onUpdateElement(selectedElement.id, {
      properties: { ...selectedElement.properties, [key]: value },
    })
  }

  const updatePosition = (key: "x" | "y" | "width" | "height", value: number) => {
    onUpdateElement(selectedElement.id, { [key]: value })
  }

  const handleImageSelect = (imageData: { src: string; alt: string }) => {
    updateProperty("src", imageData.src)
    updateProperty("alt", imageData.alt)
  }

  const handleDelete = () => {
    if (onDeleteElement) {
      onDeleteElement(selectedElement.id)
    }
  }

  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      {/* Position & Size */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Position & Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="x" className="text-xs">
                X
              </Label>
              <Input
                id="x"
                type="number"
                value={selectedElement.x}
                onChange={(e) => updatePosition("x", Number(e.target.value))}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="y" className="text-xs">
                Y
              </Label>
              <Input
                id="y"
                type="number"
                value={selectedElement.y}
                onChange={(e) => updatePosition("y", Number(e.target.value))}
                className="h-8"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="width" className="text-xs">
                Width
              </Label>
              <Input
                id="width"
                type="number"
                value={selectedElement.width}
                onChange={(e) => updatePosition("width", Number(e.target.value))}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs">
                Height
              </Label>
              <Input
                id="height"
                type="number"
                value={selectedElement.height}
                onChange={(e) => updatePosition("height", Number(e.target.value))}
                className="h-8"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Rotation: {selectedElement.rotation}°</Label>
            <Slider
              value={[selectedElement.rotation]}
              onValueChange={([value]) => onUpdateElement(selectedElement.id, { rotation: value })}
              max={360}
              min={0}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Element-specific properties */}
      {selectedElement.type === "text" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Text Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="text" className="text-xs">
                Text Content
              </Label>
              <Textarea
                id="text"
                value={selectedElement.properties.text as string}
                onChange={(e) => updateProperty("text", e.target.value)}
                className="h-20 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="fontSize" className="text-xs">
                  Font Size
                </Label>
                <Input
                  id="fontSize"
                  type="number"
                  value={selectedElement.properties.fontSize as number}
                  onChange={(e) => updateProperty("fontSize", Number(e.target.value))}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="color" className="text-xs">
                  Color
                </Label>
                <Input
                  id="color"
                  type="color"
                  value={selectedElement.properties.color as string}
                  onChange={(e) => updateProperty("color", e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fontFamily" className="text-xs">
                Font Family
              </Label>
              <Select
                value={selectedElement.properties.fontFamily as string}
                onValueChange={(value) => updateProperty("fontFamily", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fontWeight" className="text-xs">
                Font Weight
              </Label>
              <Select
                value={selectedElement.properties.fontWeight as string}
                onValueChange={(value) => updateProperty("fontWeight", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="lighter">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedElement.type === "qr-code" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">QR Code Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="qrData" className="text-xs">
                Data Template
              </Label>
              <Input
                id="qrData"
                value={selectedElement.properties.data as string}
                onChange={(e) => updateProperty("data", e.target.value)}
                placeholder="Use {{hash}} for generated hash values"
                className="h-8"
              />
              <p className="text-xs text-muted-foreground mt-1">Use {"{{hash}}"} for generated hash values</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="qrBg" className="text-xs">
                  Background
                </Label>
                <Input
                  id="qrBg"
                  type="color"
                  value={selectedElement.properties.backgroundColor as string}
                  onChange={(e) => updateProperty("backgroundColor", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="qrFg" className="text-xs">
                  Foreground
                </Label>
                <Input
                  id="qrFg"
                  type="color"
                  value={selectedElement.properties.foregroundColor as string}
                  onChange={(e) => updateProperty("foregroundColor", e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedElement.type === "image" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Image Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onImageSelect={handleImageSelect}
              currentSrc={selectedElement.properties.src as string | undefined}
              currentAlt={selectedElement.properties.alt as string | undefined}
            />
          </CardContent>
        </Card>
      )}

      {selectedElement.type === "shape" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Shape Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="shapeType" className="text-xs">
                Shape Type
              </Label>
              <Select
                value={selectedElement.properties.shape as string}
                onValueChange={(value) => updateProperty("shape", value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="triangle">Triangle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="fill" className="text-xs">
                  Fill Color
                </Label>
                <Input
                  id="fill"
                  type="color"
                  value={selectedElement.properties.fill as string}
                  onChange={(e) => updateProperty("fill", e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="stroke" className="text-xs">
                  Stroke Color
                </Label>
                <Input
                  id="stroke"
                  type="color"
                  value={selectedElement.properties.stroke as string}
                  onChange={(e) => updateProperty("stroke", e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="strokeWidth" className="text-xs">
                Stroke Width
              </Label>
              <Input
                id="strokeWidth"
                type="number"
                value={selectedElement.properties.strokeWidth as number}
                onChange={(e) => updateProperty("strokeWidth", Number(e.target.value))}
                className="h-8"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Button */}
      <Button 
        variant="destructive" 
        size="sm" 
        className="w-full"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Element
      </Button>
    </div>
  )
}
