"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Filter, RefreshCw, TrendingUp } from "lucide-react"
import Link from "next/link"

interface VerificationLog {
  id: string
  hash: string
  result: {
    isValid: boolean
    certificateData?: {
      name: string
      registrationNumber: string
      teamId: string
      eventName: string
      issueDate: string
      certificateType: string
    }
    error?: string
    verifiedAt: Date
  }
  scannedBy: string
  ipAddress: string
  userAgent: string
  timestamp: Date
}

export default function VerificationLogsPage() {
  const [logs, setLogs] = useState<VerificationLog[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demo purposes
  useEffect(() => {
    const mockLogs: VerificationLog[] = [
      {
        id: "1",
        hash: "369c1e3444d8ae3f63412d05663acd8476a3b198036903976c0e1632d9368434",
        result: {
          isValid: true,
          certificateData: {
            name: "MEHUL KHARE",
            registrationNumber: "24BAI10631",
            teamId: "1",
            eventName: "LinPack Club Event 2024",
            issueDate: "2024-01-15",
            certificateType: "Participation Certificate",
          },
          verifiedAt: new Date("2024-01-16T10:30:00Z"),
        },
        scannedBy: "Event Staff",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        timestamp: new Date("2024-01-16T10:30:00Z"),
      },
      {
        id: "2",
        hash: "097e5036fed7680e4180b73e2e985a16fdbc723747bb19b076e94c155946b5d0",
        result: {
          isValid: true,
          certificateData: {
            name: "PRAYUSH PATEL",
            registrationNumber: "24BCE10488",
            teamId: "1",
            eventName: "LinPack Club Event 2024",
            issueDate: "2024-01-15",
            certificateType: "Participation Certificate",
          },
          verifiedAt: new Date("2024-01-16T09:15:00Z"),
        },
        scannedBy: "Event Staff",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        timestamp: new Date("2024-01-16T09:15:00Z"),
      },
      {
        id: "3",
        hash: "invalid_hash_123",
        result: {
          isValid: false,
          error: "Certificate not found in database",
          verifiedAt: new Date("2024-01-16T08:45:00Z"),
        },
        scannedBy: "Unknown",
        ipAddress: "192.168.1.102",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        timestamp: new Date("2024-01-16T08:45:00Z"),
      },
    ]

    setLogs(mockLogs)
    setIsLoading(false)
  }, [])

  const validLogs = logs.filter((log) => log.result.isValid)
  const invalidLogs = logs.filter((log) => !log.result.isValid)
  const successRate = logs.length > 0 ? Math.round((validLogs.length / logs.length) * 100) : 0

  const exportLogs = () => {
    const csvContent = logs
      .map((log) => {
        return `${log.timestamp.toISOString()},${log.hash},${log.result.isValid},${
          log.result.certificateData?.name || "N/A"
        },${log.scannedBy},${log.ipAddress}`
      })
      .join("\n")

    const blob = new Blob([`Timestamp,Hash,Valid,Name,ScannedBy,IP\n${csvContent}`], {
      type: "text/csv",
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "verification-logs.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading verification logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
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
              <TrendingUp className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-black text-foreground">Verification Analytics</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-foreground mb-2">Verification Analytics</h2>
          <p className="text-muted-foreground">
            Monitor certificate verification activity and track security metrics
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{logs.length}</div>
              <p className="text-sm text-muted-foreground">Total Verifications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{validLogs.length}</div>
              <p className="text-sm text-muted-foreground">Valid Certificates</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{invalidLogs.length}</div>
              <p className="text-sm text-muted-foreground">Invalid Attempts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{successRate}%</div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logs">Verification Logs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest verification attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {logs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {log.result.isValid ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          ) : (
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {log.result.certificateData?.name || "Invalid Certificate"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={log.result.isValid ? "default" : "destructive"}>
                          {log.result.isValid ? "Valid" : "Invalid"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Insights</CardTitle>
                  <CardDescription>Verification patterns and trends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Most Active Time</span>
                      <span className="text-sm font-medium">10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Peak Verification Rate</span>
                      <span className="text-sm font-medium">25/hour</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Suspicious Activity</span>
                      <span className="text-sm font-medium text-green-600">None Detected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Device Types</span>
                      <span className="text-sm font-medium">Mobile: 80%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Detailed Verification Logs</h3>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {log.result.isValid ? (
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        )}
                        <div>
                          <h4 className="font-semibold">
                            {log.result.isValid ? "Valid Certificate" : "Invalid Certificate"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {log.timestamp.toLocaleString()} • {log.scannedBy}
                          </p>
                        </div>
                      </div>
                      <Badge variant={log.result.isValid ? "default" : "destructive"}>
                        {log.result.isValid ? "Valid" : "Invalid"}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-2">Certificate Details</p>
                        {log.result.certificateData ? (
                          <div className="space-y-1 text-muted-foreground">
                            <p>Name: {log.result.certificateData.name}</p>
                            <p>Registration: {log.result.certificateData.registrationNumber}</p>
                            <p>Team: {log.result.certificateData.teamId}</p>
                            <p>Event: {log.result.certificateData.eventName}</p>
                          </div>
                        ) : (
                          <p className="text-red-600">{log.result.error}</p>
                        )}
                      </div>

                      <div>
                        <p className="font-medium mb-2">Scan Information</p>
                        <div className="space-y-1 text-muted-foreground">
                          <p>Hash: {log.hash.substring(0, 16)}...</p>
                          <p>IP Address: {log.ipAddress}</p>
                          <p>Device: {log.userAgent.split("(")[1]?.split(")")[0] || "Unknown"}</p>
                          <p>Verified: {log.result.verifiedAt.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Trends</CardTitle>
                  <CardDescription>Daily verification activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Today</span>
                      <span className="text-sm font-medium">{logs.filter(log => 
                        log.timestamp.toDateString() === new Date().toDateString()
                      ).length} verifications</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">This Week</span>
                      <span className="text-sm font-medium">{logs.filter(log => {
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return log.timestamp > weekAgo
                      }).length} verifications</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-medium text-green-600">{successRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Analytics</CardTitle>
                  <CardDescription>Verification by device type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mobile Devices</span>
                      <span className="text-sm font-medium">80%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Desktop</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tablet</span>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
