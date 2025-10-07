"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { DashboardHeader } from './dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Briefcase, Clock, CheckCircle, TrendingUp } from 'lucide-react'
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

export function ApplicantDashboard() {
  const { userData } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

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

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Hello, <span className="gradient-text">{userData?.name}</span>
          </h1>
          <p className="text-muted-foreground">
            Track your applications and view results
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            { label: 'Total Applications', value: applications.length, icon: Briefcase },
            { label: 'In Review', value: applications.filter(a => a.status === 'processing').length, icon: Clock },
            { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, icon: CheckCircle },
          ].map((stat, index) => (
            <Card key={stat.label} className="glass-effect border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#03b2cb] to-[#00999e] flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Your Applications</h2>

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
          ) : applications.length === 0 ? (
            <Card className="glass-effect border-white/10">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03b2cb]/20 to-[#00999e]/20 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-[#03b2cb]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                    <p className="text-muted-foreground">Start applying to jobs to see them here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-effect border-white/10 hover:border-[#03b2cb]/40 transition-all group">
                    <CardContent className="p-6">
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
                        <div className="space-y-2 p-4 rounded-lg bg-gradient-to-r from-[#03b2cb]/5 to-[#00999e]/5 border border-[#03b2cb]/20">
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
                        <div className="mt-4 p-4 rounded-lg bg-muted/20 border border-white/10">
                          <p className="text-sm text-muted-foreground mb-1">Feedback:</p>
                          <p className="text-sm">{app.feedback}</p>
                        </div>
                      )}

                      {app.status === 'shortlisted' && (
                        <Button className="w-full mt-4 bg-gradient-to-r from-[#03b2cb] to-[#00999e]">
                          View Details
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

