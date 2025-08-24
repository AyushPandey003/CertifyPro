"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

interface EditorSettingsProps {
  isOpen: boolean
  onClose: () => void
  // Current canvas dimensions
  canvasWidth: number
  canvasHeight: number
  // Persist settings back to parent
  onSave: (settings: { canvasWidth: number; canvasHeight: number }) => void
}

import { useEffect, useState } from "react"

export function EditorSettings({ isOpen, onClose, canvasWidth, canvasHeight, onSave }: EditorSettingsProps) {
  const [localWidth, setLocalWidth] = useState<number>(canvasWidth)
  const [localHeight, setLocalHeight] = useState<number>(canvasHeight)

  // Sync local state when dialog opens with latest props
  useEffect(() => {
    if (isOpen) {
      setLocalWidth(canvasWidth)
      setLocalHeight(canvasHeight)
    }
  }, [isOpen, canvasWidth, canvasHeight])

  const handleSave = () => {
    const w = Math.max(100, Math.floor(Number(localWidth) || 0))
    const h = Math.max(100, Math.floor(Number(localHeight) || 0))
    onSave({ canvasWidth: w, canvasHeight: h })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Template Settings</DialogTitle>
          <DialogDescription>Configure your template properties and generation settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Settings</CardTitle>
              <CardDescription>Basic template configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="docType">Document Type</Label>
                  <Select defaultValue="certificate">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="event-pass">Event Pass</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codeType">Code Type</Label>
                  <Select defaultValue="qr-code">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qr-code">QR Code</SelectItem>
                      <SelectItem value="barcode">Barcode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="canvasWidth">Canvas Width (px)</Label>
                  <Input
                    id="canvasWidth"
                    type="number"
                    value={localWidth}
                    onChange={(e) => setLocalWidth(Number(e.target.value))}
                    min={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canvasHeight">Canvas Height (px)</Label>
                  <Input
                    id="canvasHeight"
                    type="number"
                    value={localHeight}
                    onChange={(e) => setLocalHeight(Number(e.target.value))}
                    min={100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hashing Logic */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hashing Logic</CardTitle>
              <CardDescription>Configure how unique codes are generated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hashType">Hash Type</Label>
                <Select defaultValue="single">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Person</SelectItem>
                    <SelectItem value="team">Team Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Include in Hash</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="includeName" defaultChecked />
                    <Label htmlFor="includeName">Name</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="includeEmail" defaultChecked />
                    <Label htmlFor="includeEmail">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="includeRoll" />
                    <Label htmlFor="includeRoll">Roll Number</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="includeEvent" defaultChecked />
                    <Label htmlFor="includeEvent">Event Name</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="includeTeam" />
                    <Label htmlFor="includeTeam">Team ID</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="includeDate" />
                    <Label htmlFor="includeDate">Date</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customFields">Custom Fields</Label>
                <Input id="customFields" placeholder="Additional fields to include (comma-separated)" />
              </div>
            </CardContent>
          </Card>

          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Information</CardTitle>
              <CardDescription>Metadata for your template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input id="templateName" placeholder="Enter template name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateDescription">Description</Label>
                <Input id="templateDescription" placeholder="Brief description of this template" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateCategory">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="awards">Awards</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
