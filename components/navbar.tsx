"use client"

import { Award } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/components/user-provider";

export default function Navbar() {
  const { user } = useUser()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Award className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-black text-foreground">CertifyPro</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          {user && (
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-outline">Dashboard</Link>
              <Link href="/auth/logout" className="btn">Log out</Link>
            </>
          ) : (
            <>
              <Link href="/demo" className="btn btn-outline">View Demo</Link>
              <Link href="/auth/login" className="btn">Sign In</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
