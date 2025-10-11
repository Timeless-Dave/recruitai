"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { CosmicBackground } from '@/components/cosmic-background'
import { ParticlesBackground } from '@/components/particles-background'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Briefcase, 
  MapPin, 
  Search, 
  Clock,
  Users,
  Filter,
  ArrowRight,
  Building2
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

interface PublicJob {
  id: string
  title: string
  description: string
  location: string
  type: string | null
  experienceLevel: string | null
  department?: string | null
  shareableUrl: string
  createdAt: string
  _count: {
    applicants: number
  }
}

export default function BrowseJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<PublicJob[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [experienceFilter, setExperienceFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [searchQuery, typeFilter, experienceFilter, locationFilter])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (experienceFilter !== 'all') params.append('experienceLevel', experienceFilter)
      if (locationFilter) params.append('location', locationFilter)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/public?${params.toString()}`
      )
      const data = await response.json()
      setJobs(data.data || [])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string | null | undefined) => {
    if (!type) return 'Not specified'
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getExperienceLabel = (level: string | null | undefined) => {
    if (!level) return 'Not specified'
    const labels: Record<string, string> = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior',
      'lead': 'Lead/Principal'
    }
    return labels[level] || level
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const handleJobClick = (shareableUrl: string) => {
    // Extract shareable ID from URL
    const urlParts = shareableUrl.split('/')
    const shareableId = urlParts[urlParts.length - 1]
    router.push(`/jobs/apply/${shareableId}`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground />
      <ParticlesBackground />
      
      <div className="relative z-10">
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                Find Your <span className="gradient-text">Dream Job</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore AI-powered opportunities and accelerate your career
              </p>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Card className="glass-effect border-white/10">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative lg:col-span-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 glass-effect border-white/10"
                      />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="glass-effect border-white/10">
                        <SelectValue placeholder="Job Type" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-white/10">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                      <SelectTrigger className="glass-effect border-white/10">
                        <SelectValue placeholder="Experience" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-white/10">
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead/Principal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Location..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="pl-10 glass-effect border-white/10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Count */}
            {!loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <p className="text-muted-foreground">
                  Found <span className="text-[#03b2cb] font-semibold">{jobs.length}</span> open positions
                </p>
              </motion.div>
            )}

            {/* Jobs Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="glass-effect border-white/10">
                    <CardContent className="p-6">
                      <Skeleton className="h-48 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <Card className="glass-effect border-white/10">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#03b2cb]/20 to-[#00999e]/20 flex items-center justify-center">
                      <Search className="h-8 w-8 text-[#03b2cb]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your filters or search query
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-effect border-white/10 hover:border-[#03b2cb]/40 transition-all group relative overflow-hidden h-full cursor-pointer">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#03b2cb]/10 to-[#00999e]/10" />
                      </div>
                      <CardContent className="p-6 relative z-10 flex flex-col h-full" onClick={() => handleJobClick(job.shareableUrl)}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex gap-2 flex-wrap">
                            <Badge className="bg-[#03b2cb]/20 text-[#03b2cb] border-[#03b2cb]/40">
                              {getTypeLabel(job.type)}
                            </Badge>
                            <Badge variant="outline" className="border-white/20">
                              {getExperienceLabel(job.experienceLevel)}
                            </Badge>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold mb-2 group-hover:text-[#03b2cb] transition-colors">
                          {job.title}
                        </h3>

                        {job.department && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Building2 className="h-4 w-4 text-[#03b2cb]" />
                            <span>{job.department}</span>
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                          {job.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-[#03b2cb]" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-[#03b2cb]" />
                            <span>Posted {formatDate(job.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 text-[#03b2cb]" />
                            <span>{job._count.applicants} applicants</span>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-[#03b2cb]/20 to-[#00999e]/20 border border-[#03b2cb]/40 hover:from-[#03b2cb]/30 hover:to-[#00999e]/30 group-hover:border-[#03b2cb]/60"
                          variant="outline"
                        >
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}

