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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Video, MapPin, Users, Menu, Plus, CheckCircle } from 'lucide-react'
import { makeAuthenticatedRequest } from '@/lib/firebase'
import { Skeleton } from '@/components/ui/skeleton'

interface Interview {
  id: string
  jobTitle: string
  companyName: string
  type: 'phone' | 'video' | 'in-person'
  date: string
  time: string
  duration: string
  location?: string
  meetingLink?: string
  interviewers: string[]
  status: 'upcoming' | 'completed' | 'cancelled'
}

export default function InterviewsPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchInterviews()
    }
  }, [user])

  const fetchInterviews = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interviews`
      )
      const data = await response.json()
      setInterviews(data.interviews || [])
    } catch (error) {
      console.error('Failed to fetch interviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />
      case 'in-person':
        return <MapPin className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'video':
        return <Badge className="bg-[#03b2cb]/20 text-[#03b2cb] border-[#03b2cb]/40">Video Call</Badge>
      case 'in-person':
        return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/40">In-Person</Badge>
      case 'phone':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/40">Phone</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const filteredInterviews = interviews.filter(interview => {
    if (activeTab === 'all') return true
    return interview.status === activeTab
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
                <span className="gradient-text">Interviews</span>
              </h1>
              <p className="text-muted-foreground">
                Manage and prepare for your upcoming interviews
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {[
                { label: 'Upcoming', value: interviews.filter(i => i.status === 'upcoming').length, icon: Calendar, gradient: 'from-[#03b2cb] to-[#00999e]' },
                { label: 'Completed', value: interviews.filter(i => i.status === 'completed').length, icon: CheckCircle, gradient: 'from-[#00999e] to-[#03b2cb]' },
                { label: 'Total', value: interviews.length, icon: Users, gradient: 'from-[#e60000] to-[#ff4444]' },
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
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Interviews List */}
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
            ) : filteredInterviews.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03b2cb]/20 to-[#00999e]/20 flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-[#03b2cb]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No interviews scheduled</h3>
                      <p className="text-muted-foreground mb-4">
                        {activeTab === 'upcoming' 
                          ? 'You don\'t have any upcoming interviews'
                          : 'No interviews found'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredInterviews.map((interview, index) => (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                              {getTypeIcon(interview.type)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold mb-1">{interview.jobTitle}</h3>
                              <p className="text-sm text-muted-foreground">{interview.companyName}</p>
                            </div>
                          </div>
                          {getTypeBadge(interview.type)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-[#03b2cb]" />
                            <span>{new Date(interview.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-[#03b2cb]" />
                            <span>{interview.time} ({interview.duration})</span>
                          </div>
                          {interview.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-[#03b2cb]" />
                              <span>{interview.location}</span>
                            </div>
                          )}
                          {interview.interviewers.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-[#03b2cb]" />
                              <span>{interview.interviewers.length} interviewer(s)</span>
                            </div>
                          )}
                        </div>

                        {interview.meetingLink && interview.status === 'upcoming' && (
                          <Button
                            className="w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90"
                            onClick={() => window.open(interview.meetingLink, '_blank')}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </Button>
                        )}

                        {interview.status === 'completed' && (
                          <div className="flex items-center justify-center gap-2 text-sm text-[#03b2cb] p-3 rounded-lg bg-[#03b2cb]/10 border border-[#03b2cb]/20">
                            <CheckCircle className="h-4 w-4" />
                            <span>Interview Completed</span>
                          </div>
                        )}
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



