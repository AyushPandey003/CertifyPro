"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Award, FileText, Settings, Menu, X } from "lucide-react"

interface DashboardNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: "overview", label: "Overview", icon: Award },
    { id: "projects", label: "Projects", icon: FileText },
    { id: "templates", label: "Templates", icon: Award },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full justify-start"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4 mr-2" /> : <Menu className="h-4 w-4 mr-2" />}
          Menu
        </Button>
      </div>

      {/* Navigation */}
      <nav className={`${isMobileMenuOpen ? "block" : "hidden"} md:block mb-8`}>
        <div className="flex flex-col md:flex-row gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                onClick={() => {
                  onTabChange(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className="justify-start"
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
