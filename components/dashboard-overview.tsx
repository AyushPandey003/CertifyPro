import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Plus, FileText, TrendingUp, Users, Upload, Palette } from "lucide-react"
import Link from "next/link"

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/editor">
            <Card className="border-primary/20 bg-primary/5 hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2 group-hover:text-primary transition-colors">
                      <Award className="h-5 w-5 text-primary" />
                      Create Certificate
                    </CardTitle>
                    <CardDescription>Design professional certificates for awards and achievements</CardDescription>
                  </div>
                  <Plus className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/data">
            <Card className="border-secondary/20 bg-secondary/5 hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2 group-hover:text-secondary transition-colors">
                      <FileText className="h-5 w-5 text-secondary" />
                      Manage Recipients
                    </CardTitle>
                    <CardDescription>Upload and manage recipient data for certificates</CardDescription>
                  </div>
                  <Plus className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/test-upload">
            <Card className="border-accent/20 bg-accent/5 hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2 group-hover:text-accent transition-colors">
                      <Upload className="h-5 w-5 text-accent" />
                      Test Image Upload
                    </CardTitle>
                    <CardDescription>Test cloud image upload functionality</CardDescription>
                  </div>
                  <Plus className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/templates">
            <Card className="border-purple-200 bg-purple-50 hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                      <Palette className="h-5 w-5 text-purple-600" />
                      Browse Templates
                    </CardTitle>
                    <CardDescription>Choose from professional certificate templates</CardDescription>
                  </div>
                  <Plus className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Analytics</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> from last month
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Documents Generated</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from last month
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">325</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last week
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recipients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Conference Completion Certificates</CardTitle>
                    <CardDescription>Generated 150 certificates • 2 days ago</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">Certificate</Badge>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Tech Summit 2024 Passes</CardTitle>
                    <CardDescription>Generated 500 event passes • 1 week ago</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">Event Pass</Badge>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Workshop Series Certificates</CardTitle>
                    <CardDescription>Generated 75 certificates • 2 weeks ago</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">Certificate</Badge>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
