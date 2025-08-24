import { auth0 } from "@/lib/auth0";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, Zap, Shield, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import Navbar from '@/components/navbar'

export default async function Home() {
  const session = await auth0.getSession();

  if (session) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black mb-4">Welcome, {session.user.name}!</h1>
        <p className="mb-8">You are logged in.</p>
        <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            <Star className="h-4 w-4 mr-1" />
            Trusted by 10,000+ Organizations
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 leading-tight">
            Create Professional
            <span className="text-primary block">Certificates & Passes</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Design stunning certificates and event passes with our intuitive drag-and-drop editor. Generate thousands of
            personalized documents in minutes, not hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/demo">
                View Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-foreground mb-4">
              Everything You Need to Create Professional Documents
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From design to distribution, we&#39;ve got you covered with enterprise-grade features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Drag & Drop Editor</CardTitle>
                <CardDescription>
                  Intuitive Canva-like interface for designing professional certificates and passes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Bulk Generation</CardTitle>
                <CardDescription>Generate thousands of personalized documents from CSV data in minutes</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">QR Code Integration</CardTitle>
                <CardDescription>Automatic QR code generation with custom hashing for verification</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Email Distribution</CardTitle>
                <CardDescription>Automated email sending with tracking and personalized messages</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Template Library</CardTitle>
                <CardDescription>Professional templates for conferences, awards, workshops, and more</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Verification System</CardTitle>
                <CardDescription>Built-in QR scanner for instant document verification at events</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-2xl mx-auto border-primary/20 bg-primary/5">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl font-black text-foreground mb-4">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of organizations creating professional certificates and passes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="h-6 w-6 text-primary" />
            <span className="text-xl font-black text-foreground">CertifyPro</span>
          </div>
          <p className="text-muted-foreground">© 2024 CertifyPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
// ...existing code inside Home function only...
