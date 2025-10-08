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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Filter, Mail, Phone, Star, TrendingUp, Menu, Download } from 'lucide-react'
import { makeAuthenticatedRequest } from '@/lib/firebase'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

interface Applicant {
  id: string
  name: string
  email: string
  phone?: string
  jobTitle: string
  appliedDate: string
  status: 'processing' | 'shortlisted' | 'rejected' | 'interviewed'
  score?: number
  skills?: string[]
}

export default function ApplicantsPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchApplicants()
    }
  }, [user])

  const fetchApplicants = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applicants`
      )
      const data = await response.json()
      setApplicants(data.applicants || [])
    } catch (error) {
      console.error('Failed to fetch applicants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredApplicants = applicants.filter(applicant =>
    applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    applicant.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/40">Processing</Badge>
      case 'shortlisted':
        return <Badge className="bg-[#03b2cb]/20 text-[#03b2cb] border-[#03b2cb]/40">Shortlisted</Badge>
      case 'rejected':
        return <Badge className="bg-[#e60000]/20 text-[#e60000] border-[#e60000]/40">Rejected</Badge>
      case 'interviewed':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/40">Interviewed</Badge>
      default:
        return <Badge>Unknown</Badge>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    <span className="gradient-text">Applicants</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Review and manage all job applicants
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-white/10 hover:bg-white/5"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search applicants..."
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

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="glass-effect border-white/10">
                    <CardContent className="p-6">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredApplicants.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03b2cb]/20 to-[#00999e]/20 flex items-center justify-center">
                      <Search className="h-8 w-8 text-[#03b2cb]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No applicants found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search' : 'No applications received yet'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplicants.map((applicant, index) => (
                  <motion.div
                    key={applicant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-effect border-white/10 hover:border-[#03b2cb]/40 transition-all group relative overflow-hidden cursor-pointer"
                      onClick={() => router.push(`/applicants/${applicant.id}`)}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#03b2cb]/5 to-[#00999e]/5" />
                      </div>
                      <CardContent className="p-6 relative z-10">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14 border-2 border-[#03b2cb]/40">
                            <AvatarFallback className="bg-gradient-to-br from-[#03b2cb] to-[#00999e] text-white text-lg font-bold">
                              {applicant.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold mb-1 group-hover:text-[#03b2cb] transition-colors">
                                  {applicant.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Applied for: {applicant.jobTitle}
                                </p>
                              </div>
                              {getStatusBadge(applicant.status)}
                            </div>

                            <div className="flex flex-wrap gap-4 mb-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4 text-[#03b2cb]" />
                                <span>{applicant.email}</span>
                              </div>
                              {applicant.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4 text-[#03b2cb]" />
                                  <span>{applicant.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-[#03b2cb]" />
                                <span>Applied {new Date(applicant.appliedDate).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {applicant.score !== undefined && (
                              <div className="space-y-2 p-3 rounded-lg bg-gradient-to-r from-[#03b2cb]/10 to-[#00999e]/10 border border-[#03b2cb]/20">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">AI Match Score</span>
                                  <span className="font-bold text-[#03b2cb]">{applicant.score}%</span>
                                </div>
                                <Progress value={applicant.score} className="h-2" />
                              </div>
                            )}

                            {applicant.skills && applicant.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {applicant.skills.slice(0, 4).map((skill, i) => (
                                  <Badge key={i} variant="outline" className="border-[#03b2cb]/40 text-[#03b2cb]">
                                    {skill}
                                  </Badge>
                                ))}
                                {applicant.skills.length > 4 && (
                                  <Badge variant="outline" className="border-white/20">
                                    +{applicant.skills.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
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


