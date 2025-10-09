"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>("")
  const badgeRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Anime.js subtle loop for AI badge
  useEffect(() => {
    if (!badgeRef.current) return
    let animation: any
    let mounted = true
    ;(async () => {
      const mod: any = await import("animejs")
      if (!mounted || !badgeRef.current) return
      const anime = (mod && (mod.default || (mod.anime ?? mod))) as any
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
    })()
    return () => {
      mounted = false
      if (animation && animation.pause) animation.pause()
    }
  }, [])

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Browse Jobs", href: "/jobs/browse", isRoute: true },
  ]

  // Smooth scroll handler
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isRoute?: boolean) => {
    if (isRoute) {
      // Let the link navigate normally for routes
      return
    }
    
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
      setActiveId(href)
    }
  }

  // Active link on scroll
  useEffect(() => {
    const handleScroll = () => {
      // If at top of page, no section should be active
      if (window.scrollY < 300) {
        setActiveId("")
        return
      }

      const sections = navItems.map((item) => ({
        id: item.href,
        element: document.querySelector(item.href),
      }))

      const scrollPosition = window.scrollY + 200

      let foundActive = false
      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect()
          const offsetTop = rect.top + window.scrollY
          const offsetBottom = offsetTop + rect.height

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveId(section.id)
            foundActive = true
            break
          }
        }
      }

      if (!foundActive) {
        setActiveId("")
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-effect shadow-lg" : ""
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo: matches footer style with gradient-border badge */}
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2.5">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item: any) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href, item.isRoute)}
                className={`group text-sm font-medium transition-all duration-300 relative ${
                  activeId === item.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {/* Underline indicator */}
                <span
                  className={`absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-[#03b2cb] via-[#00999e] to-[#e60000] transition-all duration-300 ${
                    activeId === item.href ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                  }`}
                />
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span id="open-auth">Get Started</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-foreground">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-4"
          >
            {navItems.map((item: any) => (
              <a
                key={item.label}
                href={item.href}
                className={`block text-sm font-medium transition-colors py-2 ${
                  activeId === item.href ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={(e) => {
                  handleNavClick(e, item.href, item.isRoute)
                  setIsMobileMenuOpen(false)
                }}
              >
                {item.label}
              </a>
            ))}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90 transition-opacity"
            >
              Get Started
            </Button>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}
