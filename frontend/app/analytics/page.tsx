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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Users, Briefcase, Target, Clock, Menu, Download, BarChart3 } from 'lucide-react'
import { makeAuthenticatedRequest } from '@/lib/firebase'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

interface AnalyticsData {
  totalApplications: number
  avgProcessingTime: number
  successRate: number
  topSkills: { name: string; count: number }[]
  monthlyTrends: { month: string; applications: number; hires: number }[]
}

export default function AnalyticsPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/analytics`
      )
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
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
                    <span className="gradient-text">Analytics</span>
                  </h1>
                  <p className="text-muted-foreground">
                    Track your recruitment performance and insights
                  </p>
                </div>
                <Button variant="outline" className="border-white/10 hover:bg-white/5">
                  <Download className="h-5 w-5 mr-2" />
                  Export Report
                </Button>
              </div>
            </motion.div>

            {/* Key Metrics - Simplified */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {[
                { label: 'Applications', value: analytics?.totalApplications || 0, icon: Users, gradient: 'from-[#03b2cb] to-[#00999e]' },
                { label: 'Success Rate', value: analytics?.successRate ? `${analytics.successRate}%` : '0%', icon: Target, gradient: 'from-[#00999e] to-[#03b2cb]' },
                { label: 'Avg. Time', value: analytics?.avgProcessingTime ? `${analytics.avgProcessingTime}d` : '0d', icon: Clock, gradient: 'from-[#03b2cb] to-[#e60000]' },
                { label: 'Conversion', value: '5.4%', icon: TrendingUp, gradient: 'from-[#e60000] to-[#ff4444]' },
              ].map((metric, index) => (
                <Card key={metric.label} className="glass-effect border-white/10 hover:border-[#03b2cb]/40 transition-all group relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5`} />
                  </div>
                  <CardContent className="p-4 relative z-10">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.gradient} flex items-center justify-center mb-3`}>
                      <metric.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                    <h3 className="text-2xl font-bold">{metric.value}</h3>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Main Content - Prioritize Funnel */}
            <div className="space-y-6">
              {/* Application Funnel - Full Width, Prominent */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-effect border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#03b2cb]/5 to-[#00999e]/5" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Users className="h-6 w-6 text-[#03b2cb]" />
                      Recruitment Funnel
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Track candidate progression through your hiring pipeline
                    </p>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="space-y-6">
                      {[
                        { stage: 'Total Applications', count: analytics?.totalApplications || 1234, percentage: 100, color: 'from-[#03b2cb] to-[#00999e]', icon: Users },
                        { stage: 'CV Screened', count: Math.floor((analytics?.totalApplications || 1234) * 0.69), percentage: 69, color: 'from-[#00999e] to-[#03b2cb]', icon: Target },
                        { stage: 'Interviewed', count: Math.floor((analytics?.totalApplications || 1234) * 0.28), percentage: 28, color: 'from-[#03b2cb] to-[#00999e]', icon: Users },
                        { stage: 'Offered', count: Math.floor((analytics?.totalApplications || 1234) * 0.07), percentage: 7, color: 'from-[#00999e] to-[#e60000]', icon: TrendingUp },
                        { stage: 'Hired', count: Math.floor((analytics?.totalApplications || 1234) * 0.05), percentage: 5, color: 'from-[#03b2cb] to-[#00999e]', icon: Users },
                      ].map((stage, idx) => (
                        <div key={stage.stage} className="group">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stage.color} flex items-center justify-center`}>
                                <stage.icon className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-medium">{stage.stage}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold">{stage.count.toLocaleString()}</span>
                              <span className="text-sm text-muted-foreground ml-2">({stage.percentage}%)</span>
                            </div>
                          </div>
                          <div className="relative h-4 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stage.percentage}%` }}
                              transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
                              className={`h-full bg-gradient-to-r ${stage.color} rounded-full group-hover:opacity-90 transition-opacity`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Secondary Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Top Skills */}
                <Card className="glass-effect border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e60000]/5 to-[#ff4444]/5" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-[#03b2cb]" />
                      Top Skills in Demand
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      {(analytics?.topSkills || [
                        { name: 'JavaScript/TypeScript', count: 456 },
                        { name: 'React/Next.js', count: 389 },
                        { name: 'Node.js', count: 334 },
                        { name: 'Python', count: 289 },
                        { name: 'AWS/Cloud', count: 245 },
                      ]).slice(0, 5).map((item, idx) => {
                        const maxCount = analytics?.topSkills?.[0]?.count || 456
                        const percentage = (item.count / maxCount) * 100
                        return (
                          <div key={item.name}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{item.name}</span>
                              <span className="text-sm text-[#03b2cb] font-semibold">{item.count}</span>
                            </div>
                            <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: 0.4 + idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-[#03b2cb] to-[#00999e] rounded-full"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="glass-effect border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#03b2cb]/3 to-[#00999e]/3" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-[#03b2cb]" />
                      Quick Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-4">
                    {[
                      { label: 'Best Performing Job', value: 'Senior Developer', subtext: '45 applications' },
                      { label: 'Average Response Time', value: '2.3 hours', subtext: '15% faster than last month' },
                      { label: 'Interview Rate', value: '28%', subtext: 'Above industry average' },
                      { label: 'Offer Acceptance', value: '75%', subtext: '3 of 4 offers accepted' },
                    ].map((stat, idx) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-[#03b2cb]">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


