"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Calendar,
  Target,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { makeAuthenticatedRequest } from '@/lib/firebase'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isMobile?: boolean
}

export function DashboardSidebar({ isOpen, setIsOpen, isMobile = false }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { userData } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    fetchUnreadCount()
    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?limit=1&unreadOnly=true`
      )
      const data = await response.json()
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const recruiterNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Briefcase, label: 'Jobs', href: '/jobs' },
    { icon: Users, label: 'Applicants', href: '/applicants' },
    { icon: Bell, label: 'Notifications', href: '/notifications', badge: unreadCount },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: FileText, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const applicantNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Briefcase, label: 'Browse Jobs', href: '/jobs/browse' },
    { icon: FileText, label: 'My Applications', href: '/applications' },
    { icon: Bell, label: 'Notifications', href: '/notifications', badge: unreadCount },
    { icon: Target, label: 'Profile', href: '/profile' },
    { icon: Calendar, label: 'Interviews', href: '/interviews' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  if (!mounted) return null

  // Show only the version intended for this instance
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col glass-effect border-r border-white/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg font-bold text-foreground">Recruit</span>
                  <span className="px-2.5 py-1 rounded-xl relative text-sm font-bold text-foreground">
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
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Action */}
              {userData?.role === 'recruiter' && (
                <div className="p-4 border-b border-white/10">
                  <Button
                    onClick={() => {
                      router.push('/jobs/create')
                      setIsOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    New Job
                  </Button>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
                {(userData?.role === 'recruiter' ? recruiterNavItems : applicantNavItems).map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      onClick={() => {
                        router.push(item.href)
                        setIsOpen(false)
                      }}
                      className={cn(
                        "w-full justify-start relative",
                        active
                          ? "bg-gradient-to-r from-[#03b2cb]/20 to-[#00999e]/20 text-[#03b2cb]"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#03b2cb] to-[#00999e] rounded-r" />
                      )}
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto w-5 h-5 bg-[#e60000] rounded-full text-white text-xs flex items-center justify-center font-semibold">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </nav>

              {/* User Info */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#03b2cb] to-[#00999e] flex items-center justify-center text-white font-bold text-sm">
                    {userData?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{userData?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userData?.role}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    )
  }

  // Desktop sidebar
  const navItems = userData?.role === 'recruiter' ? recruiterNavItems : applicantNavItems

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? '240px' : '80px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-16 bottom-0 z-40 flex-col border-r border-white/10 glass-effect hidden md:flex"
    >
        {/* Toggle Button */}
        <div className="flex justify-end p-2 border-b border-white/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Quick Action */}
        {userData?.role === 'recruiter' && (
          <div className="p-3 border-b border-white/10">
            <Button
              onClick={() => router.push('/jobs/create')}
              className={cn(
                "w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90 transition-opacity",
                !isOpen && "px-2"
              )}
              size={isOpen ? "default" : "icon"}
            >
              <PlusCircle className={cn("h-5 w-5", isOpen && "mr-2")} />
              {isOpen && "New Job"}
            </Button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <motion.div
                key={item.href}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "w-full justify-start transition-all relative",
                    active
                      ? "bg-gradient-to-r from-[#03b2cb]/20 to-[#00999e]/20 text-[#03b2cb] hover:from-[#03b2cb]/30 hover:to-[#00999e]/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    !isOpen && "justify-center px-2"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#03b2cb] to-[#00999e] rounded-r"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("h-5 w-5", isOpen && "mr-3")} />
                  {isOpen && <span>{item.label}</span>}
                  {isOpen && item.badge && item.badge > 0 && (
                    <span className="ml-auto w-5 h-5 bg-[#e60000] rounded-full text-white text-xs flex items-center justify-center font-semibold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                  {!isOpen && item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e60000] rounded-full text-white text-xs flex items-center justify-center font-semibold">
                      {item.badge > 9 ? '9' : item.badge}
                    </span>
                  )}
                </Button>
              </motion.div>
            )
          })}
        </nav>

        {/* User Role Badge */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#03b2cb] to-[#00999e] flex items-center justify-center text-white font-bold text-sm">
                {userData?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userData?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{userData?.role}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.aside>
    )
  }

