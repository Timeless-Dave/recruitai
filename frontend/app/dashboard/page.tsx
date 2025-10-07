"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { RecruiterDashboard } from '@/components/dashboard/recruiter-dashboard'
import { ApplicantDashboard } from '@/components/dashboard/applicant-dashboard'
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#03b2cb]" />
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {userData.role === 'recruiter' ? (
        <RecruiterDashboard />
      ) : (
        <ApplicantDashboard />
      )}
    </div>
  )
}

