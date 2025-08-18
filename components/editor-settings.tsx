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
}

export function EditorSettings({ isOpen, onClose }: EditorSettingsProps) {
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
                  <Input id="canvasWidth" type="number" defaultValue="800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canvasHeight">Canvas Height (px)</Label>
                  <Input id="canvasHeight" type="number" defaultValue="600" />
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
          <Button onClick={onClose}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
