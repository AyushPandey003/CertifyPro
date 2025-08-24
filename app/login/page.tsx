import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Award, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/get-user"

export default async function LoginPage() {
  const user = await getUser()
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-black text-foreground">CertifyPro</h1>
          </div>
          <h2 className="text-3xl font-black text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/auth/login?returnTo=/dashboard">Continue with Auth0</Link>
            </Button>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don&#39;t have an account?{" "}
                <Link href="/auth/login?returnTo=/dashboard" className="text-primary hover:underline font-medium">Sign up with Auth0</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
