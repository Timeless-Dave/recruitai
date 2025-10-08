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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Briefcase, GraduationCap, Award, Plus, X, Menu, Save, Upload } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export default function ProfilePage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [skills, setSkills] = useState(['JavaScript', 'React', 'Node.js'])
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
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
                My <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-muted-foreground">
                Build a comprehensive profile to stand out to recruiters
              </p>
            </motion.div>

            {/* Profile Header */}
            <Card className="glass-effect border-white/10 relative overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#03b2cb]/5 to-[#00999e]/5" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-[#03b2cb]/40">
                      <AvatarFallback className="bg-gradient-to-br from-[#03b2cb] to-[#00999e] text-white text-3xl font-bold">
                        {userData?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-[#03b2cb] to-[#00999e]"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">{userData?.name}</h2>
                    <p className="text-muted-foreground mb-3">{user?.email}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[#03b2cb]/20 text-[#03b2cb] border-[#03b2cb]/40">
                        Open to Opportunities
                      </Badge>
                      <Badge variant="outline" className="border-white/20">
                        Profile 70% Complete
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="glass-effect border-white/10 relative overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e60000]/5 to-[#ff4444]/5" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#03b2cb]" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      defaultValue={userData?.name}
                      className="glass-effect border-white/10"
                    />
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    className="glass-effect border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Summary</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and your career goals..."
                    className="glass-effect border-white/10 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="glass-effect border-white/10 relative overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#03b2cb]/5 to-[#e60000]/5" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#03b2cb]" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-[#03b2cb]/20 text-[#03b2cb] border-[#03b2cb]/40 pr-1"
                    >
                      {skill}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-4 w-4 ml-2 hover:bg-[#e60000]/20"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill..."
                    className="glass-effect border-white/10"
                  />
                  <Button
                    onClick={addSkill}
                    className="bg-gradient-to-r from-[#03b2cb] to-[#00999e]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="glass-effect border-white/10 relative overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00999e]/5 to-[#03b2cb]/5" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#03b2cb]" />
                    Work Experience
                  </CardTitle>
                  <Button variant="outline" size="sm" className="border-white/10">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-muted-foreground text-center py-8">
                  No work experience added yet
                </p>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="glass-effect border-white/10 relative overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#03b2cb]/3 to-[#00999e]/3" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#03b2cb]" />
                    Education
                  </CardTitle>
                  <Button variant="outline" size="sm" className="border-white/10">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-muted-foreground text-center py-8">
                  No education history added yet
                </p>
              </CardContent>
            </Card>

            <Separator className="bg-white/10 my-6" />

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90"
              size="lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}



