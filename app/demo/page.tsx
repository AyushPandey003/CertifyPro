"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Award, Users, QrCode, Download, Eye } from "lucide-react"
import Link from "next/link"
import { HashVerifier } from "@/lib/hash-verifier"

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("overview")
  type CertificateData = {
    name: string
    registrationNumber: string
    teamId: number
    eventName: string
    certificateType: string
  }
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null)

  // Sample data from the knowledge folder
  const sampleRecipients = [
    {
      name: "MEHUL KHARE",
      reg_number: "24BAI10631",
      team_id: 1,
      hashed_code: "369c1e3444d8ae3f63412d05663acd8476a3b198036903976c0e1632d9368434",
      Games: "A"
    },
    {
      name: "PRAYUSH PATEL",
      reg_number: "24BCE10488",
      team_id: 1,
      hashed_code: "097e5036fed7680e4180b73e2e985a16fdbc723747bb19b076e94c155946b5d0",
      Games: "A"
    },
    {
      name: "Priyanshi Solanki",
      reg_number: "24BCE10518",
      team_id: 2,
      hashed_code: "cfef4f1560803ec02f0b0b62e7dae9836e5713da487b34542d1219190812ed01",
      Games: "A"
    }
  ]

  const handleVerifyHash = async (hash: string) => {
    try {
      const result = await HashVerifier.verifyHash(hash)
      if (result.isValid && result.certificateData) {
        setSelectedCertificate({
          ...result.certificateData,
          teamId: Number(result.certificateData.teamId),
        })
      }
    } catch (error) {
      console.error("Verification failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-black text-foreground">Live Demo</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button size="sm">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-foreground mb-2">See CertifyPro in Action</h2>
          <p className="text-muted-foreground">Explore our platform with real sample data from the LinPack Club Event</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="certificates">Sample Certificates</TabsTrigger>
            <TabsTrigger value="verification">QR Verification</TabsTrigger>
            <TabsTrigger value="generation">Bulk Generation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Certificate Design</CardTitle>
                  <CardDescription>Professional templates with drag-and-drop editing</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create stunning certificates using our intuitive editor. Add text, images, and QR codes with ease.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("certificates")}>
                    View Samples
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>QR Code Generation</CardTitle>
                  <CardDescription>Unique hashes for each certificate</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Each certificate gets a unique SHA-256 hash based on recipient data, ensuring authenticity.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("verification")}>
                    Test Verification
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Bulk Processing</CardTitle>
                  <CardDescription>Generate thousands of certificates</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload CSV data and automatically generate personalized certificates for all recipients.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("generation")}>
                    See Process
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleRecipients.map((recipient, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Team {recipient.team_id}</Badge>
                      <Badge variant="outline">{recipient.Games}</Badge>
                    </div>
                    <CardTitle className="text-lg">{recipient.name}</CardTitle>
                    <CardDescription>Reg: {recipient.reg_number}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">Hash:</span>
                        <p className="font-mono text-xs text-muted-foreground break-all">
                          {recipient.hashed_code}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>QR Code Verification</CardTitle>
                  <CardDescription>Test our verification system with sample hashes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {sampleRecipients.slice(0, 3).map((recipient, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{recipient.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Hash: {recipient.hashed_code.substring(0, 16)}...
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyHash(recipient.hashed_code)}
                        >
                          Verify
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verification Result</CardTitle>
                  <CardDescription>Certificate details from verified hash</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCertificate ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">Valid Certificate</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Name:</span> {selectedCertificate.name}</p>
                          <p><span className="font-medium">Registration:</span> {selectedCertificate.registrationNumber}</p>
                          <p><span className="font-medium">Team ID:</span> {selectedCertificate.teamId}</p>
                          <p><span className="font-medium">Event:</span> {selectedCertificate.eventName}</p>
                          <p><span className="font-medium">Type:</span> {selectedCertificate.certificateType}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Click &quot;Verify&quot; on a sample hash to see the result</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="generation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Certificate Generation Process</CardTitle>
                <CardDescription>How CertifyPro processes multiple recipients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold">1</span>
                      </div>
                      <h4 className="font-semibold text-sm">Upload Data</h4>
                      <p className="text-xs text-muted-foreground">CSV with names, emails, etc.</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold">2</span>
                      </div>
                      <h4 className="font-semibold text-sm">Generate Hashes</h4>
                      <p className="text-xs text-muted-foreground">Unique SHA-256 for each</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold">3</span>
                      </div>
                      <h4 className="font-semibold text-sm">Create PDFs</h4>
                      <p className="text-xs text-muted-foreground">Personalized certificates</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold">4</span>
                      </div>
                      <h4 className="font-semibold text-sm">Send Emails</h4>
                      <p className="text-xs text-muted-foreground">Automated distribution</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Sample CSV Data</h4>
                    <div className="bg-muted rounded p-3 font-mono text-xs overflow-x-auto">
                      <pre>{`Name,Registration Number,Team ID,Games
MEHUL KHARE,24BAI10631,1,A
PRAYUSH PATEL,24BCE10488,1,A
Priyanshi Solanki,24BCE10518,2,A
Kishika Raheja,23BCE10877,2,A
Anshika Mishra,23MIM10080,3,A`}</pre>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button size="lg" asChild>
                      <Link href="/dashboard">
                        Go to Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
