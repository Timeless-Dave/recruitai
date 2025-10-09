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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Filter, Users, Calendar, Menu, Eye, Edit, Trash2, MoreVertical, Share2, Copy } from 'lucide-react'
import { makeAuthenticatedRequest } from '@/lib/firebase'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Job {
  id: string
  title: string
  status: 'active' | 'closed' | 'draft'
  applicants: number
  createdAt: string
  avgScore?: number
  description?: string
  shareableUrl?: string
}

export default function JobsPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchJobs()
    }
  }, [user])

  const fetchJobs = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs`
      )
      const data = await response.json()
      // Transform the data to match our interface
      const transformedJobs = (data.jobs || data.data || []).map((job: any) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        applicants: job._count?.applicants || job.applicants || 0,
        createdAt: job.createdAt,
        avgScore: job.avgScore,
        description: job.description,
        shareableUrl: job.shareableUrl,
      }))
      setJobs(transformedJobs)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyJobLink = (shareableUrl: string) => {
    navigator.clipboard.writeText(shareableUrl)
    toast({
      title: 'Link copied!',
      description: 'Job link copied to clipboard',
    })
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase())
    let matchesTab = true
    
    if (activeTab === 'all') {
      matchesTab = true
    } else if (activeTab === 'my-jobs') {
      // Filter jobs created by current user (you can add createdBy field to Job interface)
      // For now, showing all jobs as "my jobs" - will be filtered by backend
      matchesTab = true
    } else {
      matchesTab = job.status === activeTab
    }
    
    return matchesSearch && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#03b2cb]/20 text-[#03b2cb] border-[#03b2cb]/40'
      case 'closed':
        return 'bg-muted/20 text-muted-foreground border-muted'
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40'
      default:
        return 'bg-muted/20 text-muted-foreground border-muted'
    }
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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    Job <span className="gradient-text">Listings</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Manage all your job postings and track applications
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/jobs/create')}
                  className="bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Job
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass-effect border-white/10"
                  />
                </div>
                <Button variant="outline" className="border-white/10 hover:bg-white/5">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </div>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="glass-effect border-white/10">
                <TabsTrigger value="all">All Jobs</TabsTrigger>
                <TabsTrigger value="my-jobs">My Jobs</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Jobs Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="glass-effect border-white/10">
                    <CardContent className="p-6">
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03b2cb]/20 to-[#00999e]/20 flex items-center justify-center">
                      <Search className="h-8 w-8 text-[#03b2cb]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery ? 'Try adjusting your search' : 'Create your first job to get started'}
                      </p>
                      {!searchQuery && (
                        <Button
                          onClick={() => router.push('/jobs/create')}
                          className="bg-gradient-to-r from-[#03b2cb] to-[#00999e]"
                        >
                          Create Job
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-effect border-white/10 hover:border-[#03b2cb]/40 transition-all group relative overflow-hidden h-full">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#03b2cb]/10 to-[#00999e]/10" />
                      </div>
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-effect border-white/10">
                              <DropdownMenuItem onClick={() => router.push(`/jobs/${job.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {job.shareableUrl && (
                                <DropdownMenuItem onClick={() => copyJobLink(job.shareableUrl!)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Job Link
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => router.push(`/jobs/${job.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-[#e60000]">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h3 className="text-xl font-bold mb-3 group-hover:text-[#03b2cb] transition-colors">
                          {job.title}
                        </h3>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 text-[#03b2cb]" />
                            <span>{job.applicants} applicants</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 text-[#03b2cb]" />
                            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                          {job.avgScore && (
                            <div className="pt-3 border-t border-white/10">
                              <span className="text-sm text-muted-foreground">Avg Score: </span>
                              <span className="text-sm font-bold text-[#03b2cb]">{job.avgScore}%</span>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          className="w-full mt-4 bg-gradient-to-r from-[#03b2cb]/20 to-[#00999e]/20 border border-[#03b2cb]/40 hover:from-[#03b2cb]/30 hover:to-[#00999e]/30"
                          variant="outline"
                        >
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


