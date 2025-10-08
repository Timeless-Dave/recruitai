
"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { NotificationsDropdown } from '@/components/notifications-dropdown'

export function DashboardHeader() {
  const { user, userData, signOut } = useAuth()
  const router = useRouter()
  const badgeRef = useRef<HTMLSpanElement | null>(null)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getInitials = () => {
    if (!userData?.name) return 'U'
    return userData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Anime.js subtle loop for AI badge (matching landing page)
  useEffect(() => {
    if (!badgeRef.current) return
    let animation: any
    let mounted = true
    ;(async () => {
      try {
        const anime = (await import("animejs")).default
        if (!mounted || !badgeRef.current) return
        animation = anime({
          targets: badgeRef.current,
          scale: [1, 1.05, 1],
          translateY: [0, -1, 0],
          boxShadow: [
            "0 0 0px rgba(3,178,203,0.0)",
            "0 8px 24px rgba(3,178,203,0.15)",
            "0 0 0px rgba(3,178,203,0.0)",
          ],
          duration: 2500,
          easing: "easeInOutSine",
          loop: true,
        })
      } catch (error) {
        console.error('Failed to load animejs:', error)
      }
    })()
    return () => {
      mounted = false
      if (animation && animation.pause) animation.pause()
    }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 glass-effect backdrop-blur-xl bg-background/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - matching landing page style */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            <span className="text-lg sm:text-xl font-bold text-foreground">Recruit</span>
            <span ref={badgeRef} className="px-2.5 py-1 rounded-xl relative text-sm sm:text-base font-bold text-foreground">
              <span className="relative z-10">AI</span>
              <span className="absolute inset-0 rounded-xl" style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(16px)",
                borderRadius: "12px",
              }} />
              <span className="absolute inset-0 rounded-xl pointer-events-none" style={{
                padding: "1px",
                background: "linear-gradient(135deg, #03b2cb, #00999e, #e60000)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                borderRadius: "12px",
              }} />
            </span>
          </motion.div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <NotificationsDropdown />
            </motion.div>

            {/* User Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-[#03b2cb]/50 transition-all"
                  >
                    <Avatar className="h-10 w-10 border-2 border-[#03b2cb]/40 hover:border-[#03b2cb] transition-colors cursor-pointer">
                      <AvatarFallback className="bg-gradient-to-br from-[#03b2cb] to-[#00999e] text-white font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-effect border-white/10 mt-2">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userData?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground leading-none">{user?.email || 'No email'}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={() => router.push('/profile')}
                    className="cursor-pointer hover:bg-[#03b2cb]/10"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/settings')}
                    className="cursor-pointer hover:bg-[#03b2cb]/10"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="text-[#e60000] cursor-pointer hover:bg-[#e60000]/10 focus:bg-[#e60000]/10 focus:text-[#e60000]"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  )
}

