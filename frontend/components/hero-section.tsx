"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"
import { FloatingStatCards } from "@/components/floating-stat-cards"
import { useRef } from "react"

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-24 sm:pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Floating Dashboard Cards */}
      <FloatingStatCards />

      {/* Gradient Orbs with parallax */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ y }}
          className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-[#03b2cb] rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 200]) }}
          className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-[#e60000] rounded-full blur-[140px]"
        />
      </div>

      <motion.div style={{ y }} className="container mx-auto relative z-10">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-effect border border-[#03b2cb]/40 shadow-lg">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={16} className="text-[#03b2cb]" />
              </motion.div>
              <span className="text-sm font-medium text-foreground">AI-Powered Recruitment Platform</span>
              <div className="w-2 h-2 rounded-full bg-[#03b2cb] animate-pulse" />
            </div>
          </motion.div>

          {/* Main Headline - larger, bolder */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] text-balance"
          >
            Build Your{" "}
            <span className="gradient-text inline-block">
              <motion.span
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{
                  background: "linear-gradient(90deg, #03b2cb 0%, #00999e 25%, #e60000 50%, #00999e 75%, #03b2cb 100%)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Recruitment
              </motion.span>
            </span>
            <br />
            World Easily
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Streamline your hiring with intelligent screening, fair ranking, and automated feedback.
            <br className="hidden sm:block" />
            Find the perfect candidates faster than ever.
          </motion.p>

          {/* CTA Buttons with enhanced glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                id="open-auth"
                size="lg"
                className="relative bg-gradient-to-r from-[#03b2cb] to-[#00999e] hover:opacity-90 transition-all text-base sm:text-lg px-10 py-7 group shadow-2xl overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Now
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Metrics Bar - simpler, cleaner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-16"
          >
            <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { value: 15000, label: "Applications", suffix: "+" },
                { value: 500, label: "Programs", suffix: "+" },
                { value: 98, label: "Accuracy", suffix: "%" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                    <AnimatedCounter end={stat.value} duration={2.5} />
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
