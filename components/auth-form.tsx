"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface AuthFormProps {
  type: "login" | "register"
  action: (formData: FormData) => Promise<{ success?: boolean; error?: string }>
}

export function AuthForm({ type, action }: AuthFormProps) {
  const [error, setError] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setError("")

    startTransition(async () => {
      const result = await action(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        router.push("/dashboard")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {type === "register" && (
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="Enter your full name" required disabled={isPending} />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="Enter your email" required disabled={isPending} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={type === "login" ? "Enter your password" : "Create a password"}
          required
          disabled={isPending}
        />
      </div>

      {type === "register" && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
            disabled={isPending}
          />
        </div>
      )}

      <Button className="w-full" size="lg" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {type === "login" ? "Sign In" : "Create Account"}
      </Button>
    </form>
  )
}
