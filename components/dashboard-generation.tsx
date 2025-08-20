"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  QrCode,  
  FileText, 
  Users, 
  Play, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Download,
  Send
} from 'lucide-react'

export function DashboardGeneration() {
  const [recentBatches] = useState([
    {
      id: '1',
      name: 'LinPack Club Event 2024',
      type: 'certificate',
      recipients: 150,
      status: 'completed',
      progress: 100,
      sent: 150,
      failed: 0,
      createdAt: new Date('2024-12-20T10:00:00Z')
    },
    {
      id: '2',
      name: 'Workshop Certificates',
      type: 'certificate',
      recipients: 75,
      status: 'processing',
      progress: 65,
      sent: 49,
      failed: 2,
      createdAt: new Date('2024-12-19T14:30:00Z')
    },
    {
      id: '3',
      name: 'Event Passes - Tech Summit',
      type: 'event-pass',
      recipients: 200,
      status: 'pending',
      progress: 0,
      sent: 0,
      failed: 0,
      createdAt: new Date('2024-12-18T09:15:00Z')
    }
  ])

  const [quickStats] = useState({
    totalCertificates: 1250,
    totalEmails: 980,
    successRate: 98.5,
    thisMonth: 156
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'processing':
        return <Play className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Certificates</CardTitle>
            <div className="text-2xl font-bold">{quickStats.totalCertificates.toLocaleString()}</div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +{quickStats.thisMonth} this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Emails Sent</CardTitle>
            <div className="text-2xl font-bold">{quickStats.totalEmails.toLocaleString()}</div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {quickStats.successRate}% success rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Batches</CardTitle>
            <div className="text-2xl font-bold">{recentBatches.filter(b => b.status === 'processing').length}</div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Currently processing
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <div className="text-2xl font-bold">{recentBatches.filter(b => b.status === 'pending').length}</div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Awaiting generation
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Generate certificates and send emails quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button asChild className="h-20 flex-col gap-2">
              <Link href="/generate">
                <QrCode className="h-6 w-6" />
                Generate Certificates
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/verify">
                <FileText className="h-6 w-6" />
                Verify Certificates
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link href="/templates">
                <Users className="h-6 w-6" />
                Manage Templates
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Batches */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Batches</CardTitle>
              <CardDescription>
                Latest certificate generation and email batches
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/generate">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBatches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(batch.status)}
                    <Badge variant="outline" className={getStatusColor(batch.status)}>
                      {batch.type === 'certificate' ? 'Certificate' : 'Event Pass'}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">{batch.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {batch.recipients} recipients • {new Date(batch.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {batch.status === 'processing' && (
                    <div className="flex items-center gap-2">
                      <Progress value={batch.progress} className="w-20" />
                      <span className="text-sm text-muted-foreground">{batch.progress}%</span>
                    </div>
                  )}
                  
                  {batch.status === 'completed' && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {batch.sent} sent
                      </div>
                      {batch.failed > 0 && (
                        <div className="text-xs text-red-600">
                          {batch.failed} failed
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {batch.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    
                    {batch.status === 'pending' && (
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    )}
                    
                    {batch.status === 'processing' && (
                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4 mr-2" />
                        Send Emails
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Success</CardTitle>
          <CardDescription>
            Best practices for certificate generation and email distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Certificate Generation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use high-quality background images (PNG/JPG)</li>
                <li>• Test templates with sample data first</li>
                <li>• Choose appropriate hash fields for security</li>
                <li>• Verify QR codes scan correctly</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Email Distribution</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Personalize emails with {'{name}'} placeholders</li>
                <li>• Keep email subjects clear and concise</li>
                <li>• Monitor email delivery rates</li>
                <li>• Use appropriate sending intervals</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
