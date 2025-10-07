"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Brain, Scale, Settings, BarChart3, MessageSquare, Shield } from "lucide-react"
import { SectionDivider } from "@/components/section-divider"

const features = [
  {
    icon: Brain,
    title: "AI-Driven Screening",
    description:
      "Advanced machine learning algorithms analyze applications with precision, identifying top candidates based on customizable criteria.",
    color: "#03b2cb",
  },
  {
    icon: Scale,
    title: "Fair Ranking System",
    description:
      "Eliminate bias with our transparent, data-driven ranking system that ensures every candidate gets a fair evaluation.",
    color: "#00999e",
  },
  {
    icon: Settings,
    title: "Customizable Pass Mark",
    description:
      "Set your own thresholds and criteria to match your specific program requirements and organizational standards.",
    color: "#e60000",
  },
  {
    icon: BarChart3,
    title: "Recruiter Dashboards",
    description:
      "Comprehensive analytics and insights at your fingertips. Track progress, monitor trends, and make data-driven decisions.",
    color: "#03b2cb",
  },
  {
    icon: MessageSquare,
    title: "Automated Feedback",
    description:
      "Provide personalized feedback to every applicant automatically, improving candidate experience and your employer brand.",
    color: "#00999e",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description:
      "Enterprise-grade security with full GDPR compliance. Your data and candidate information are always protected.",
    color: "#e60000",
  },
]

export function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <>
      <SectionDivider variant="top" color="cyan" />
      <section id="features" ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-2 rounded-full glass-effect border border-[#03b2cb]/30 mb-6"
            >
              <span className="text-sm font-semibold text-[#03b2cb]">CORE FEATURES</span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to streamline your hiring process and find the best talent
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative h-full"
                >
                  {/* Glow effect on hover */}
                  <motion.div
                    className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${feature.color}40, transparent 70%)`,
                    }}
                  />

                  {/* Card */}
                  <div className="relative h-full glass-effect rounded-2xl border border-white/10 p-8 backdrop-blur-xl shadow-xl hover:border-white/20 transition-all duration-300">
                    {/* Icon container with gradient background */}
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="w-16 h-16 mb-6 rounded-2xl flex items-center justify-center relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${feature.color}30, ${feature.color}10)`,
                      }}
                    >
                      {/* Animated gradient overlay */}
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          background: [
                            `linear-gradient(135deg, ${feature.color}30, ${feature.color}10)`,
                            `linear-gradient(225deg, ${feature.color}40, ${feature.color}15)`,
                            `linear-gradient(135deg, ${feature.color}30, ${feature.color}10)`,
                          ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <feature.icon size={28} style={{ color: feature.color }} className="relative z-10" />
                    </motion.div>

                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed group-hover:text-muted-foreground/90">
                      {feature.description}
                    </p>

                    {/* Bottom accent line */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 rounded-b-2xl"
                      style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
                      initial={{ width: "0%" }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <SectionDivider variant="bottom" color="mixed" />
    </>
  )
}
