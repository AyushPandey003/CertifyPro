"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DashboardProjects } from "@/components/dashboard-projects"
import { DashboardTemplates } from "@/components/dashboard-templates"
import { DashboardSettings } from "@/components/dashboard-settings"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardOverview />
      case "projects":
        return <DashboardProjects />
      case "templates":
        return <DashboardTemplates />
      case "settings":
        return <DashboardSettings />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-black text-foreground">CertifyPro</h1>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/auth/logout">Logout</a>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Create and manage your certificates and event passes</p>
        </div>

        {/* Navigation */}
        <DashboardNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  )
}
