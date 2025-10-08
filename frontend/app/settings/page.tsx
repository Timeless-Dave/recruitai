"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { CosmicBackground } from '@/components/cosmic-background'
import { ParticlesBackground } from '@/components/particles-background'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Bell, Shield, Building, Menu, Save } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  if (authLoading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <CosmicBackground />
        <ParticlesBackground />
        <div className="relative z-10">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground />
      <ParticlesBackground />
      
      <div className="relative z-10">
        <DashboardHeader />
        <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden fixed bottom-4 right-4 z-30 h-14 w-14 rounded-full bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90 shadow-lg"
        >
          <Menu className="h-6 w-6 text-white" />
        </Button>

        <DashboardSidebar isOpen={mobileSidebarOpen} setIsOpen={setMobileSidebarOpen} isMobile={true} />
        
        <main className={`transition-all duration-300 pt-16 ${sidebarOpen ? 'md:ml-[240px]' : 'md:ml-[80px]'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <span className="gradient-text">Settings</span>
              </h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </motion.div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="glass-effect border-white/10">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                {userData?.role === 'recruiter' && (
                  <TabsTrigger value="organization" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Organization
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="profile">
                <Card className="glass-effect border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#03b2cb]/5 to-[#00999e]/5" />
                  <CardHeader className="relative z-10">
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        defaultValue={userData?.name}
                        className="glass-effect border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={user?.email || ''}
                        className="glass-effect border-white/10"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="glass-effect border-white/10"
                      />
                    </div>
                    <Separator className="bg-white/10" />
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="glass-effect border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e60000]/5 to-[#ff4444]/5" />
                  <CardHeader className="relative z-10">
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive email updates about your applications</p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get real-time browser notifications</p>
                      </div>
                      <Switch
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">Receive weekly summary of activities</p>
                      </div>
                      <Switch
                        checked={weeklyReports}
                        onCheckedChange={setWeeklyReports}
                      />
                    </div>
                    <Separator className="bg-white/10" />
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="glass-effect border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#03b2cb]/5 to-[#e60000]/5" />
                  <CardHeader className="relative z-10">
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        className="glass-effect border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="glass-effect border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="glass-effect border-white/10"
                      />
                    </div>
                    <Separator className="bg-white/10" />
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {userData?.role === 'recruiter' && (
                <TabsContent value="organization">
                  <Card className="glass-effect border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00999e]/5 to-[#03b2cb]/5" />
                    <CardHeader className="relative z-10">
                      <CardTitle>Organization Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                      <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input
                          id="org-name"
                          defaultValue={userData?.orgName}
                          className="glass-effect border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-website">Website</Label>
                        <Input
                          id="org-website"
                          type="url"
                          placeholder="https://example.com"
                          className="glass-effect border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-size">Company Size</Label>
                        <Input
                          id="org-size"
                          placeholder="e.g., 50-200 employees"
                          className="glass-effect border-white/10"
                        />
                      </div>
                      <Separator className="bg-white/10" />
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}


