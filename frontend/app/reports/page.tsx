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
import { FileText, Download, Calendar, TrendingUp, Users, Briefcase, Menu } from 'lucide-react'

export default function ReportsPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  if (authLoading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <CosmicBackground />
        <ParticlesBackground />
        <div className="relative z-10">Loading...</div>
      </div>
    )
  }

  const reportTypes = [
    {
      title: 'Monthly Recruitment Report',
      description: 'Comprehensive overview of all recruitment activities for the month',
      icon: Calendar,
      gradient: 'from-[#03b2cb] to-[#00999e]'
    },
    {
      title: 'Applicant Analysis Report',
      description: 'Detailed analysis of applicant demographics and qualifications',
      icon: Users,
      gradient: 'from-[#00999e] to-[#03b2cb]'
    },
    {
      title: 'Job Performance Report',
      description: 'Track the performance and success rate of each job posting',
      icon: Briefcase,
      gradient: 'from-[#e60000] to-[#ff4444]'
    },
    {
      title: 'Hiring Trends Report',
      description: 'Historical trends and patterns in your hiring process',
      icon: TrendingUp,
      gradient: 'from-[#03b2cb] to-[#e60000]'
    },
  ]

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
                <span className="gradient-text">Reports</span>
              </h1>
              <p className="text-muted-foreground">
                Generate and download comprehensive recruitment reports
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportTypes.map((report, index) => (
                <motion.div
                  key={report.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-effect border-white/10 hover:border-[#03b2cb]/40 transition-all group relative overflow-hidden h-full">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className={`absolute inset-0 bg-gradient-to-br ${report.gradient} opacity-5`} />
                    </div>
                    <CardContent className="p-6 relative z-10">
                      <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${report.gradient} flex items-center justify-center mb-4`}>
                        <report.icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-[#03b2cb] transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {report.description}
                      </p>
                      <Button
                        className="w-full bg-gradient-to-r from-[#03b2cb]/20 to-[#00999e]/20 border border-[#03b2cb]/40 hover:from-[#03b2cb]/30 hover:to-[#00999e]/30"
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Reports */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <h2 className="text-2xl font-bold mb-4">Recent Reports</h2>
              <Card className="glass-effect border-white/10">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent reports. Generate your first report above.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}


