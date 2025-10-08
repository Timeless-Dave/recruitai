"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { RecruiterDashboard } from '@/components/dashboard/recruiter-dashboard'
import { ApplicantDashboard } from '@/components/dashboard/applicant-dashboard'
import { CosmicBackground } from '@/components/cosmic-background'
import { ParticlesBackground } from '@/components/particles-background'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <CosmicBackground />
        <ParticlesBackground />
        <Loader2 className="h-8 w-8 animate-spin text-[#03b2cb] relative z-10" />
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground />
      <ParticlesBackground />
      <div className="relative z-10">
        {userData.role === 'recruiter' ? (
          <RecruiterDashboard />
        ) : (
          <ApplicantDashboard />
        )}
      </div>
    </div>
  )
}

