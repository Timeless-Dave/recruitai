"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { DashboardHeader } from './dashboard-header'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardStats } from './dashboard-stats'
import { JobsTable } from './jobs-table'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3, Settings, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { makeAuthenticatedRequest } from '@/lib/firebase'

interface DashboardData {
  totalJobs: number
  activeJobs: number
  totalApplicants: number
  avgScore: number
  recentJobs: any[]
}

export function RecruiterDashboard() {
  const { userData } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/recruiter/dashboard`
      )
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-30 h-14 w-14 rounded-full bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90 active:scale-95 shadow-lg transition-transform touch-target"
      >
        <Menu className="h-6 w-6 text-white" />
      </Button>

      {/* Mobile sidebar */}
      <DashboardSidebar isOpen={mobileSidebarOpen} setIsOpen={setMobileSidebarOpen} isMobile={true} />
      
      <main 
        className={`transition-all duration-300 pt-16 ${sidebarOpen ? 'md:ml-[240px]' : 'md:ml-[80px]'}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Welcome back, <span className="gradient-text">{userData?.name}</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {userData?.orgName} • Recruiter Dashboard
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <Button
              size="lg"
              onClick={() => router.push('/jobs/create')}
              className="bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90 h-auto py-4 sm:py-6 text-sm sm:text-base"
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Create New Job
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/analytics')}
              className="h-auto py-4 sm:py-6 border-white/10 hover:bg-white/5 text-sm sm:text-base"
            >
              <BarChart3 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              View Analytics
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/settings')}
              className="h-auto py-4 sm:py-6 border-white/10 hover:bg-white/5 text-sm sm:text-base sm:col-span-2 md:col-span-1"
            >
              <Settings className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Settings
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <DashboardStats data={dashboardData} loading={loading} />

          {/* Jobs Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Jobs</h2>
              <Button
                variant="ghost"
                onClick={() => router.push('/jobs')}
                className="text-[#03b2cb] hover:text-[#00999e]"
              >
                View All →
              </Button>
            </div>
            <JobsTable 
              jobs={dashboardData?.recentJobs || []} 
              loading={loading}
              onJobDeleted={fetchDashboardData}
            />
          </motion.div>
        </div>
      </main>
    </div>
  )
}

