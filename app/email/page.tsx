"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Mail, Send, Settings, Users, FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState("compose")
  const [emailBatches] = useState([
    {
      id: "1",
      name: "Certificate Distribution - Event 2024",
      recipients: 150,
      status: "completed",
      progress: 100,
      sent: 148,
      failed: 2,
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Welcome Pass Distribution",
      recipients: 75,
      status: "processing",
      progress: 65,
      sent: 49,
      failed: 0,
      createdAt: "2024-01-16T14:20:00Z",
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-black text-foreground">Email Distribution</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Email Distribution</h1>
          <p className="text-slate-600">Send certificates and passes to recipients via email</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="batches" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Batches
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Compose Email Campaign</CardTitle>
                    <CardDescription>Create and send personalized emails with certificates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Campaign Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Certificate Distribution 2024"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Template</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                          <option>Certificate Template</option>
                          <option>Event Pass Template</option>
                          <option>Custom Template</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Subject</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Your Certificate is Ready - {{name}}"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Content</label>
                      <textarea
                        rows={8}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="Dear {{name}},&#10;&#10;Congratulations! Your certificate is attached to this email.&#10;&#10;Best regards,&#10;The Team"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button className="bg-cyan-600 hover:bg-cyan-700">
                        <Send className="w-4 h-4 mr-2" />
                        Send Campaign
                      </Button>
                      <Button variant="outline">Save Draft</Button>
                      <Button variant="outline">Preview</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Recipients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-6 border-2 border-dashed border-slate-300 rounded-lg">
                        <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 mb-2">Select recipient data</p>
                        <Button variant="outline" size="sm">
                          Choose Data Source
                        </Button>
                      </div>

                      <div className="text-sm text-slate-600">
                        <p>• Upload CSV file</p>
                        <p>• Select from existing data</p>
                        <p>• Manual entry</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Gmail Integration</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Send Rate</span>
                      <span className="text-sm text-slate-600">10 emails/min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Retry Failed</span>
                      <span className="text-sm text-slate-600">3 attempts</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batches" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Email Batches</h2>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Send className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>

            <div className="grid gap-4">
              {emailBatches.map((batch) => (
                <Card key={batch.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{batch.name}</h3>
                        <p className="text-sm text-slate-600">
                          {batch.recipients} recipients • Created {new Date(batch.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {batch.status === "completed" && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {batch.status === "processing" && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Processing
                          </Badge>
                        )}
                        {batch.status === "failed" && (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{batch.progress}%</span>
                      </div>
                      <Progress value={batch.progress} className="h-2" />

                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Sent: {batch.sent}</span>
                        <span>Failed: {batch.failed}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Download Report
                      </Button>
                      {batch.failed > 0 && (
                        <Button variant="outline" size="sm">
                          Retry Failed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Email Templates</h2>
              <Button className="bg-cyan-600 hover:bg-cyan-700">Create Template</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Certificate Template", type: "Certificate", usage: 45 },
                { name: "Event Pass Template", type: "Event Pass", usage: 23 },
                { name: "Welcome Email", type: "General", usage: 12 },
              ].map((template, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-lg text-sm">
                        <p className="font-medium mb-2">Subject: Your {template.type} is Ready</p>
                        <p className="text-slate-600">
                          Dear {"{{name}}"}, your {template.type.toLowerCase()} is attached...
                        </p>
                      </div>

                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Used {template.usage} times</span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          Duplicate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gmail Integration</CardTitle>
                  <CardDescription>Configure Gmail API for sending emails</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Gmail Connected</p>
                      <p className="text-sm text-green-600">linpack@vitbhopal.ac.in</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full bg-transparent">
                      Reconnect Gmail
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Test Connection
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sending Limits</CardTitle>
                  <CardDescription>Configure email sending parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Emails per minute</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      defaultValue="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Retry attempts</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      defaultValue="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Retry delay (minutes)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      defaultValue="5"
                    />
                  </div>

                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Save Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
