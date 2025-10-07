"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { AnimatedCounter } from "@/components/animated-counter"
import { Users, TrendingUp, Target, Award } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: 25000,
    suffix: "+",
    label: "Applicants Screened",
    color: "#03b2cb",
  },
  {
    icon: TrendingUp,
    value: 95,
    suffix: "%",
    label: "Accuracy Rate",
    color: "#00999e",
  },
  {
    icon: Target,
    value: 80,
    suffix: "%",
    label: "Time Saved",
    color: "#e60000",
  },
  {
    icon: Award,
    value: 1000,
    suffix: "+",
    label: "Successful Hires",
    color: "#03b2cb",
  },
]

export function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Trusted by <span className="gradient-text">Industry Leaders</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of organizations transforming their recruitment process
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="gradient-border rounded-2xl p-8 text-center group cursor-pointer"
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                }}
              >
                <stat.icon
                  size={32}
                  style={{ color: stat.color }}
                  className="group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">
                {isInView && (
                  <>
                    <AnimatedCounter end={stat.value} duration={2} />
                    {stat.suffix}
                  </>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
