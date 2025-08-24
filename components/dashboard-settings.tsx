import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { User, Bell, Shield, Palette, Download, Mail } from "lucide-react"
import { useEffect, useState } from "react"

export function DashboardSettings() {
  const [gmailClientId, setGmailClientId] = useState("")
  const [gmailRedirectUri, setGmailRedirectUri] = useState("")
  const [hasGmailConfig, setHasGmailConfig] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load status
    fetch('/api/email/gmail/client').then(r => r.json()).then(d => {
      if (d?.success && d?.config) {
        setHasGmailConfig(true)
        setGmailClientId(d.config.clientId)
        setGmailRedirectUri(d.config.redirectUri)
      } else if (d?.success) {
        setHasGmailConfig(false)
      }
    }).catch(() => setHasGmailConfig(false))
  }, [])

  const saveGmailClient = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const secret = (form.elements.namedItem('gmailClientSecret') as HTMLInputElement)?.value
    if (!gmailClientId || !secret || !gmailRedirectUri) return
    setSaving(true)
    try {
      const res = await fetch('/api/email/gmail/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: gmailClientId, clientSecret: secret, redirectUri: gmailRedirectUri })
      })
      const d = await res.json()
      if (d?.success) setHasGmailConfig(true)
    } finally {
      setSaving(false)
    }
  }

  const connectGmail = () => {
    window.location.href = '/api/email/gmail/auth'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-foreground">Settings</h3>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information and profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue="john.doe@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input id="organization" placeholder="Your organization name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell us about yourself..." />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email updates about your projects</p>
            </div>
            <Switch id="emailNotifications" defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="projectUpdates">Project Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified when projects are completed</p>
            </div>
            <Switch id="projectUpdates" defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketingEmails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Receive updates about new features and tips</p>
            </div>
            <Switch id="marketingEmails" />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your application experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
            </div>
            <Switch id="darkMode" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoSave">Auto Save</Label>
              <p className="text-sm text-muted-foreground">Automatically save your work</p>
            </div>
            <Switch id="autoSave" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Gmail OAuth (BYO) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail Integration
          </CardTitle>
          <CardDescription>Bring your own Google OAuth client to send emails from your Gmail account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={saveGmailClient} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gmailClientId">Client ID</Label>
                <Input id="gmailClientId" value={gmailClientId} onChange={e => setGmailClientId(e.target.value)} placeholder="xxxxxxxx.apps.googleusercontent.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gmailClientSecret">Client Secret</Label>
                <Input id="gmailClientSecret" name="gmailClientSecret" type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gmailRedirectUri">Redirect URI</Label>
              <Input id="gmailRedirectUri" value={gmailRedirectUri} onChange={e => setGmailRedirectUri(e.target.value)} placeholder="https://yourapp.com/api/email/gmail/callback" />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Client'}</Button>
              <Button type="button" variant="outline" onClick={connectGmail} disabled={!hasGmailConfig}>Connect Gmail</Button>
            </div>
            {hasGmailConfig === false && (
              <p className="text-sm text-muted-foreground">Enter your Google OAuth client first, then click Connect.</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>Download your data and project information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export All Data</p>
              <p className="text-sm text-muted-foreground">Download all your projects, templates, and settings</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
