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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Users, 
  Plus, 
  X, 
  Menu, 
  Save,
  FileText,
  Target,
  Sparkles,
  CheckCircle,
  Copy,
  Share2
} from 'lucide-react'
import { makeAuthenticatedRequest } from '@/lib/firebase'
import { useToast } from '@/hooks/use-toast'

export default function CreateJobPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [createdJob, setCreatedJob] = useState<any>(null)

  // Form state
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('full-time')
  const [experienceLevel, setExperienceLevel] = useState('mid')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [description, setDescription] = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [qualifications, setQualifications] = useState('')
  const [requiredSkills, setRequiredSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [aiScreening, setAiScreening] = useState(true)
  const [autoRanking, setAutoRanking] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const addSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills([...requiredSkills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const jobData = {
        title: jobTitle,
        department,
        location,
        type: jobType,
        experienceLevel,
        salary: {
          min: salaryMin ? parseInt(salaryMin) : null,
          max: salaryMax ? parseInt(salaryMax) : null,
        },
        description,
        responsibilities,
        qualifications,
        requiredSkills,
        settings: {
          aiScreening,
          autoRanking,
        },
      }

      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData),
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCreatedJob(data)
        setShowSuccessDialog(true)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create job. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to create job:', error)
      toast({
        title: 'Error',
        description: 'Failed to create job. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const copyShareableLink = () => {
    if (createdJob?.shareableUrl) {
      navigator.clipboard.writeText(createdJob.shareableUrl)
      toast({
        title: 'Link copied!',
        description: 'Shareable link copied to clipboard',
      })
    }
  }

  const handleDialogClose = () => {
    setShowSuccessDialog(false)
    router.push('/jobs')
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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                Create New <span className="gradient-text">Job Posting</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Fill in the details to create a new job posting with AI-powered screening
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card className="glass-effect border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#03b2cb]/5 to-[#00999e]/5" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Briefcase className="h-5 w-5 text-[#03b2cb]" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="job-title" className="text-sm sm:text-base">Job Title *</Label>
                      <Input
                        id="job-title"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g., Senior Full Stack Developer"
                        className="glass-effect border-white/10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm sm:text-base">Department</Label>
                      <Input
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g., Engineering"
                        className="glass-effect border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm sm:text-base">Location *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g., San Francisco, CA"
                          className="pl-10 glass-effect border-white/10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job-type" className="text-sm sm:text-base">Job Type *</Label>
                      <Select value={jobType} onValueChange={setJobType}>
                        <SelectTrigger className="glass-effect border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-white/10">
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience-level" className="text-sm sm:text-base">Experience Level *</Label>
                      <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                        <SelectTrigger className="glass-effect border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-white/10">
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="lead">Lead/Principal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Salary Range (USD)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={salaryMin}
                          onChange={(e) => setSalaryMin(e.target.value)}
                          placeholder="Min (e.g., 80000)"
                          className="pl-10 glass-effect border-white/10"
                        />
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={salaryMax}
                          onChange={(e) => setSalaryMax(e.target.value)}
                          placeholder="Max (e.g., 120000)"
                          className="pl-10 glass-effect border-white/10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card className="glass-effect border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e60000]/5 to-[#ff4444]/5" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <FileText className="h-5 w-5 text-[#03b2cb]" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 relative z-10">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm sm:text-base">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide a detailed description of the role and what the candidate will be doing..."
                      className="glass-effect border-white/10 min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsibilities" className="text-sm sm:text-base">Key Responsibilities</Label>
                    <Textarea
                      id="responsibilities"
                      value={responsibilities}
                      onChange={(e) => setResponsibilities(e.target.value)}
                      placeholder="• Design and implement scalable systems&#10;• Collaborate with cross-functional teams&#10;• Mentor junior developers"
                      className="glass-effect border-white/10 min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualifications" className="text-sm sm:text-base">Required Qualifications</Label>
                    <Textarea
                      id="qualifications"
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      placeholder="• Bachelor's degree in Computer Science or related field&#10;• 5+ years of experience in software development&#10;• Strong problem-solving skills"
                      className="glass-effect border-white/10 min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Required Skills */}
              <Card className="glass-effect border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#03b2cb]/5 to-[#e60000]/5" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Target className="h-5 w-5 text-[#03b2cb]" />
                    Required Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {requiredSkills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-[#03b2cb]/20 text-[#03b2cb] border-[#03b2cb]/40 pr-1 text-xs sm:text-sm"
                      >
                        {skill}
                        <Button
                          type="button"
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
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Add a required skill (e.g., React, Python)..."
                      className="glass-effect border-white/10 text-sm sm:text-base"
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      className="bg-gradient-to-r from-[#03b2cb] to-[#00999e] shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Settings */}
              <Card className="glass-effect border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00999e]/5 to-[#03b2cb]/5" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Sparkles className="h-5 w-5 text-[#03b2cb]" />
                    AI-Powered Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 pr-4">
                      <Label className="text-sm sm:text-base">AI Resume Screening</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Automatically analyze and score applicant resumes using AI
                      </p>
                    </div>
                    <Switch
                      checked={aiScreening}
                      onCheckedChange={setAiScreening}
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 pr-4">
                      <Label className="text-sm sm:text-base">Auto-Ranking</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Automatically rank candidates based on AI assessment scores
                      </p>
                    </div>
                    <Switch
                      checked={autoRanking}
                      onCheckedChange={setAutoRanking}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/jobs')}
                  className="w-full sm:w-auto border-white/10 hover:bg-white/5"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:flex-1 bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Creating Job...' : 'Create Job Posting'}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="glass-effect border-white/10 sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03b2cb]/20 to-[#00999e]/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#03b2cb]" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Job Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your job posting is now live and accepting applications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Shareable Job Link</Label>
              <div className="flex gap-2">
                <Input
                  value={createdJob?.shareableUrl || ''}
                  readOnly
                  className="glass-effect border-white/10 font-mono text-sm"
                />
                <Button
                  size="icon"
                  onClick={copyShareableLink}
                  className="shrink-0 bg-gradient-to-r from-[#03b2cb] to-[#00999e]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with candidates to receive applications
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={copyShareableLink}
                variant="outline"
                className="flex-1 border-white/10 hover:bg-white/5"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button
                onClick={handleDialogClose}
                className="flex-1 bg-gradient-to-r from-[#03b2cb] to-[#00999e]"
              >
                View All Jobs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}



