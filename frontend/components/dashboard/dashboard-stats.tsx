"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, Users, TrendingUp, Target } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardStatsProps {
  data: {
    totalJobs: number
    activeJobs: number
    totalApplicants: number
    avgScore: number
  } | null
  loading: boolean
}

export function DashboardStats({ data, loading }: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Jobs',
      value: data?.totalJobs || 0,
      icon: Briefcase,
      gradient: 'from-[#03b2cb] to-[#00999e]',
      trend: '+12%'
    },
    {
      title: 'Active Jobs',
      value: data?.activeJobs || 0,
      icon: Target,
      gradient: 'from-[#00999e] to-[#03b2cb]',
      trend: '+5%'
    },
    {
      title: 'Total Applicants',
      value: data?.totalApplicants || 0,
      icon: Users,
      gradient: 'from-[#e60000] to-[#ff4444]',
      trend: '+23%'
    },
    {
      title: 'Avg. Score',
      value: data?.avgScore || 0,
      suffix: '%',
      icon: TrendingUp,
      gradient: 'from-[#03b2cb] to-[#e60000]',
      trend: '+8%'
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-effect border-white/10">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          <Card className="glass-effect border-white/10 hover:border-[#03b2cb]/40 transition-all group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold">
                    {stat.value.toLocaleString()}
                    {stat.suffix}
                  </h3>
                  <p className="text-xs text-[#03b2cb] mt-2">{stat.trend} from last month</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

