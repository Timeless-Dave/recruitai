"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { CosmicBackground } from '@/components/cosmic-background'
import { ParticlesBackground } from '@/components/particles-background'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Briefcase, Clock, CheckCircle, TrendingUp, Menu, Eye } from 'lucide-react'
import { makeAuthenticatedRequest } from '@/lib/firebase'
import { Skeleton } from '@/components/ui/skeleton'

interface Application {
  id: string
  jobTitle: string
  companyName: string
  dateApplied: string
  status: 'processing' | 'completed' | 'shortlisted' | 'rejected'
  finalScore?: number
  rank?: number
  totalApplicants?: number
  feedback?: string
}

export default function ApplicationsPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applicants/me`
      )
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/40">Processing</Badge>
      case 'completed':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/40">Completed</Badge>
      case 'shortlisted':
        return <Badge className="bg-[#03b2cb]/20 text-[#03b2cb] border-[#03b2cb]/40">Shortlisted</Badge>
      case 'rejected':
        return <Badge className="bg-[#e60000]/20 text-[#e60000] border-[#e60000]/40">Not Selected</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'shortlisted':
        return <CheckCircle className="h-5 w-5 text-[#03b2cb]" />
      default:
        return <Briefcase className="h-5 w-5 text-muted-foreground" />
    }
  }

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true
    return app.status === activeTab
  })

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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                My <span className="gradient-text">Applications</span>
              </h1>
              <p className="text-muted-foreground">
                Track all your job applications in one place
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              {[
                { label: 'Total', value: applications.length, icon: Briefcase, gradient: 'from-[#03b2cb] to-[#00999e]' },
                { label: 'In Review', value: applications.filter(a => a.status === 'processing').length, icon: Clock, gradient: 'from-yellow-500 to-yellow-600' },
                { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, icon: CheckCircle, gradient: 'from-[#03b2cb] to-[#e60000]' },
                { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, icon: TrendingUp, gradient: 'from-[#e60000] to-[#ff4444]' },
              ].map((stat, index) => (
                <Card key={stat.label} className="glass-effect border-white/10 hover:border-[#03b2cb]/40 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold">{stat.value}</h3>
                      </div>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="glass-effect border-white/10">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="processing">In Review</TabsTrigger>
                <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Applications List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="glass-effect border-white/10">
                    <CardContent className="p-6">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03b2cb]/20 to-[#00999e]/20 flex items-center justify-center">
                      <Briefcase className="h-8 w-8 text-[#03b2cb]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                      <p className="text-muted-foreground mb-4">Start applying to jobs to see them here</p>
                      <Button
                        onClick={() => router.push('/jobs/browse')}
                        className="bg-gradient-to-r from-[#03b2cb] to-[#00999e]"
                      >
                        Browse Jobs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-effect border-white/10 hover:border-[#03b2cb]/40 transition-all group relative overflow-hidden">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#03b2cb]/5 to-[#00999e]/5" />
                      </div>
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#03b2cb]/20 to-[#00999e]/20 flex items-center justify-center">
                              {getStatusIcon(app.status)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold mb-1">{app.jobTitle}</h3>
                              <p className="text-sm text-muted-foreground">{app.companyName}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Applied {new Date(app.dateApplied).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>

                        {app.finalScore !== undefined && (
                          <div className="space-y-2 p-4 rounded-lg bg-gradient-to-r from-[#03b2cb]/5 to-[#00999e]/5 border border-[#03b2cb]/20 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Your Score</span>
                              <span className="font-bold text-[#03b2cb]">{app.finalScore}%</span>
                            </div>
                            <Progress value={app.finalScore} className="h-2" />
                            {app.rank && app.totalApplicants && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <TrendingUp className="h-3 w-3 text-[#03b2cb]" />
                                <span>Ranked {app.rank} out of {app.totalApplicants} applicants</span>
                              </div>
                            )}
                          </div>
                        )}

                        {app.feedback && (
                          <div className="p-4 rounded-lg bg-muted/20 border border-white/10 mb-4">
                            <p className="text-sm text-muted-foreground mb-1">Feedback:</p>
                            <p className="text-sm">{app.feedback}</p>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          className="w-full border-white/10 hover:bg-white/5"
                          onClick={() => router.push(`/applications/${app.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}



