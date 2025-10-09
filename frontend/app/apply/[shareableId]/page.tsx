"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { CosmicBackground } from '@/components/cosmic-background'
import { ParticlesBackground } from '@/components/particles-background'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
  Clock,
  Users,
  Building2,
  DollarSign,
  Upload,
  FileText,
  CheckCircle,
  ArrowLeft,
  Send
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useToast } from '@/hooks/use-toast'

interface JobDetail {
  id: string
  title: string
  description: string
  location: string
  type: string
  experienceLevel: string
  department?: string
  responsibilities?: string
  qualifications?: string
  requiredSkills?: string[]
  salary?: {
    min?: number
    max?: number
  }
  shareableUrl: string
  createdAt: string
  _count: {
    applicants: number
  }
  jobAssessments: Array<{
    id: string
    isRequired: boolean
    timeLimit: number
    passMark: number
  }>
}

export default function ApplyJobPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const shareableId = params.shareableId as string

  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Application form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')

  useEffect(() => {
    fetchJob()
  }, [shareableId])

  const fetchJob = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/public/${shareableId}`
      )
      if (response.ok) {
        const data = await response.json()
        setJob(data)
      } else {
        toast({
          title: 'Job not found',
          description: 'This job posting may no longer be available.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to fetch job:', error)
      toast({
        title: 'Error',
        description: 'Failed to load job details.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const applicationData = {
        jobId: job?.id,
        fullName,
        email,
        phone,
        resumeUrl,
        coverLetter,
        linkedinUrl,
        portfolioUrl,
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applicants`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(applicationData),
        }
      )

      if (response.ok) {
        const data = await response.json()
        setShowSuccessDialog(true)
      } else {
        const error = await response.json()
        toast({
          title: 'Application failed',
          description: error.message || 'Failed to submit application. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to submit application:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getTypeLabel = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getExperienceLabel = (level: string) => {
    const labels: Record<string, string> = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior',
      'lead': 'Lead/Principal'
    }
    return labels[level] || level
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <CosmicBackground />
        <ParticlesBackground />
        <div className="relative z-10">
          <Header />
          <main className="pt-24 pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <Card className="glass-effect border-white/10">
                <CardContent className="p-8">
                  <Skeleton className="h-96 w-full" />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <CosmicBackground />
        <ParticlesBackground />
        <div className="relative z-10">
          <Header />
          <main className="pt-24 pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <Card className="glass-effect border-white/10">
                <CardContent className="p-12 text-center">
                  <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
                  <p className="text-muted-foreground mb-6">
                    This job posting may no longer be available.
                  </p>
                  <Button onClick={() => router.push('/jobs/browse')}>
                    Browse All Jobs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground />
      <ParticlesBackground />
      
      <div className="relative z-10">
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <Button
                variant="ghost"
                onClick={() => router.push('/jobs/browse')}
                className="hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Job Details */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-effect border-white/10">
                    <CardHeader>
                      <div className="flex gap-2 flex-wrap mb-4">
                        <Badge className="bg-[#03b2cb]/20 text-[#03b2cb] border-[#03b2cb]/40">
                          {getTypeLabel(job.type)}
                        </Badge>
                        <Badge variant="outline" className="border-white/20">
                          {getExperienceLabel(job.experienceLevel)}
                        </Badge>
                      </div>
                      <CardTitle className="text-3xl mb-4">{job.title}</CardTitle>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        {job.department && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#03b2cb]" />
                            <span>{job.department}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#03b2cb]" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#03b2cb]" />
                          <span>Posted {formatDate(job.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#03b2cb]" />
                          <span>{job._count.applicants} applicants</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">About the Role</h3>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {job.description}
                        </p>
                      </div>

                      {job.responsibilities && (
                        <>
                          <Separator className="bg-white/10" />
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Key Responsibilities</h3>
                            <p className="text-muted-foreground whitespace-pre-line">
                              {job.responsibilities}
                            </p>
                          </div>
                        </>
                      )}

                      {job.qualifications && (
                        <>
                          <Separator className="bg-white/10" />
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Required Qualifications</h3>
                            <p className="text-muted-foreground whitespace-pre-line">
                              {job.qualifications}
                            </p>
                          </div>
                        </>
                      )}

                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <>
                          <Separator className="bg-white/10" />
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {job.requiredSkills.map((skill) => (
                                <Badge
                                  key={skill}
                                  className="bg-[#03b2cb]/20 text-[#03b2cb] border-[#03b2cb]/40"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {job.salary && (job.salary.min || job.salary.max) && (
                        <>
                          <Separator className="bg-white/10" />
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Salary Range</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <DollarSign className="h-5 w-5 text-[#03b2cb]" />
                              <span>
                                {job.salary.min && `$${job.salary.min.toLocaleString()}`}
                                {job.salary.min && job.salary.max && ' - '}
                                {job.salary.max && `$${job.salary.max.toLocaleString()}`}
                                {' per year'}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Application Form */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="sticky top-24"
                >
                  <Card className="glass-effect border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-[#03b2cb]" />
                        Apply for this Job
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="glass-effect border-white/10"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="glass-effect border-white/10"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="glass-effect border-white/10"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="resumeUrl">Resume URL *</Label>
                          <Input
                            id="resumeUrl"
                            type="url"
                            value={resumeUrl}
                            onChange={(e) => setResumeUrl(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="glass-effect border-white/10"
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Upload your resume to Google Drive, Dropbox, or similar and paste the link
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                          <Input
                            id="linkedinUrl"
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/..."
                            className="glass-effect border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                          <Input
                            id="portfolioUrl"
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            placeholder="https://..."
                            className="glass-effect border-white/10"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="coverLetter">Cover Letter</Label>
                          <Textarea
                            id="coverLetter"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Tell us why you're a great fit..."
                            className="glass-effect border-white/10 min-h-[120px]"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e]"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {submitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
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
              Application Submitted Successfully!
            </DialogTitle>
            <DialogDescription className="text-center space-y-3">
              <p className="text-base">
                Your application has been successfully submitted and our AI is already analyzing your profile.
              </p>
              <div className="bg-[#03b2cb]/10 border border-[#03b2cb]/20 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium text-foreground mb-2">
                  📬 What happens next?
                </p>
                <p className="text-xs text-muted-foreground">
                  You will be contacted if you are shortlisted for the next stage, which may include an assessment or interview. 
                  Create an account to track your application status and receive instant notifications!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => router.push('/?action=signup&type=applicant')}
              className="w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e]"
            >
              Create Account & Track Application
            </Button>
            <Button
              onClick={() => router.push('/jobs/browse')}
              variant="outline"
              className="w-full border-white/10 hover:bg-white/5"
            >
              Browse More Jobs
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

