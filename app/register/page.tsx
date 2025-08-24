import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Award, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/get-user"

export default async function RegisterPage() {
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
          <h2 className="text-3xl font-black text-foreground mb-2">Get Started</h2>
          <p className="text-muted-foreground">Create your account to start generating certificates</p>
        </div>

        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Enter your information to create your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link href="/auth/login?returnTo=/dashboard" legacyBehavior passHref>
                <span>Continue with Auth0</span>
              </Link>
            </Button>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login?returnTo=/dashboard" className="text-primary hover:underline font-medium">Sign in with Auth0</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
