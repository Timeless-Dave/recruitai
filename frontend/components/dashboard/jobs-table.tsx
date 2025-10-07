"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Users, Calendar, MoreVertical } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
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
}

interface JobsTableProps {
  jobs: Job[]
  loading: boolean
}

export function JobsTable({ jobs, loading }: JobsTableProps) {
  const router = useRouter()

  if (loading) {
    return (
      <Card className="glass-effect border-white/10">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Card className="glass-effect border-white/10">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03b2cb]/20 to-[#00999e]/20 flex items-center justify-center">
              <Users className="h-8 w-8 text-[#03b2cb]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No jobs yet</h3>
              <p className="text-muted-foreground mb-4">Create your first job to start receiving applications</p>
              <Button
                onClick={() => router.push('/jobs/create')}
                className="bg-gradient-to-r from-[#03b2cb] to-[#00999e]"
              >
                Create Job
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

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

  return (
    <div className="space-y-4">
      {jobs.map((job, index) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="glass-effect border-white/10 hover:border-[#03b2cb]/40 transition-all group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold group-hover:text-[#03b2cb] transition-colors">
                      {job.title}
                    </h3>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{job.applicants} applicants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    {job.avgScore && (
                      <div className="flex items-center gap-1">
                        <span className="text-[#03b2cb] font-medium">{job.avgScore}% avg score</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="border-[#03b2cb]/40 hover:bg-[#03b2cb]/10"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-effect border-white/10">
                      <DropdownMenuItem onClick={() => router.push(`/jobs/${job.id}/edit`)}>
                        Edit Job
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/jobs/${job.id}/applicants`)}>
                        View Applicants
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/jobs/${job.id}/analytics`)}>
                        Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[#e60000]">
                        Close Job
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

