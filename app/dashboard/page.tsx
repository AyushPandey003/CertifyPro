"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DashboardProjects } from "@/components/dashboard-projects"
import { DashboardTemplates } from "@/components/dashboard-templates"
import { DashboardSettings } from "@/components/dashboard-settings"
import { DashboardGeneration } from "@/components/dashboard-generation"
import Navbar from "@/components/navbar"

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
      case "generation":
        return <DashboardGeneration />
      case "settings":
        return <DashboardSettings />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />

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
