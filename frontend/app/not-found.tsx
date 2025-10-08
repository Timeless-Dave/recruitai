"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import stringSimilarity from 'string-similarity'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CosmicBackground } from '@/components/cosmic-background'
import { ParticlesBackground } from '@/components/particles-background'
import { AlertTriangle, Home, ArrowRight } from 'lucide-react'

// All valid routes in the app
const validRoutes = [
  '/dashboard',
  '/jobs',
  '/jobs/create',
  '/applicants',
  '/applications',
  '/analytics',
  '/notifications',
  '/reports',
  '/settings',
  '/profile',
  '/interviews',
]

export default function NotFound() {
  const router = useRouter()
  const pathname = usePathname()
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    // Find the closest matching route
    if (pathname) {
      let bestMatch = ''
      let bestScore = 0

      validRoutes.forEach(route => {
        const score = stringSimilarity.compareTwoStrings(pathname.toLowerCase(), route.toLowerCase())
        if (score > bestScore) {
          bestScore = score
          bestMatch = route
        }
      })

      // Only suggest if similarity is above threshold (0.4)
      if (bestScore > 0.4) {
        setSuggestion(bestMatch)
        
        // Auto-redirect after countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              router.push(bestMatch)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      }
    }
  }, [pathname, router])

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <CosmicBackground />
      <ParticlesBackground />
      
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="glass-effect border-white/10 overflow-hidden">
            <CardContent className="p-12">
              {/* Error Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#e60000]/20 to-[#ff4444]/20 flex items-center justify-center"
              >
                <AlertTriangle className="h-12 w-12 text-[#e60000]" />
              </motion.div>

              {/* 404 Title */}
              <h1 className="text-6xl font-bold mb-4 gradient-text">404</h1>
              <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
              <p className="text-muted-foreground mb-8">
                The page <span className="text-[#03b2cb] font-mono">{pathname}</span> doesn't exist.
              </p>

              {/* Suggestion */}
              {suggestion ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8 p-6 rounded-lg bg-gradient-to-br from-[#03b2cb]/10 to-[#00999e]/10 border border-[#03b2cb]/30"
                >
                  <p className="text-sm text-muted-foreground mb-3">
                    Did you mean:
                  </p>
                  <p className="text-lg font-semibold text-[#03b2cb] mb-4 font-mono">
                    {suggestion}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Redirecting in <span className="text-[#03b2cb] font-bold">{countdown}</span> seconds...
                  </p>
                  <div className="mt-4">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 10, ease: 'linear' }}
                        className="h-full bg-gradient-to-r from-[#03b2cb] to-[#00999e]"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="mb-8 p-6 rounded-lg bg-muted/20 border border-white/10">
                  <p className="text-sm text-muted-foreground">
                    We couldn't find a similar page. Please check the URL or return to the dashboard.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90"
                  size="lg"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
                {suggestion && (
                  <Button
                    onClick={() => router.push(suggestion)}
                    variant="outline"
                    className="border-[#03b2cb]/40 hover:bg-[#03b2cb]/10"
                    size="lg"
                  >
                    Go to Suggested Page
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                )}
              </div>

              {/* Help text */}
              <p className="mt-8 text-xs text-muted-foreground">
                Need help? Contact support or check our documentation.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

