"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Upload, Search, CheckCircle, BarChart, MessageCircle } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload Applications",
    description: "Seamlessly import candidate applications from multiple sources or integrate with your existing ATS.",
    color: "#03b2cb",
  },
  {
    icon: Search,
    title: "AI Screening",
    description: "Our AI analyzes each application against your criteria, evaluating skills, experience, and fit.",
    color: "#00999e",
  },
  {
    icon: CheckCircle,
    title: "Smart Assessment",
    description: "Candidates are automatically assessed and scored based on your customizable parameters.",
    color: "#e60000",
  },
  {
    icon: BarChart,
    title: "Fair Ranking",
    description: "Get a transparent, bias-free ranking of all candidates with detailed insights and comparisons.",
    color: "#03b2cb",
  },
  {
    icon: MessageCircle,
    title: "Automated Feedback",
    description:
      "Every candidate receives personalized feedback, enhancing your employer brand and candidate experience.",
    color: "#00999e",
  },
]

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="how-it-works" ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Five simple steps to transform your recruitment process
          </p>
        </motion.div>

        {/* Two-column zigzag with center timeline */}
        <div className="relative max-w-6xl mx-auto">
          {/* Center line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          <div className="space-y-8">
            {steps.map((step, index) => {
              const isRight = index % 2 === 1
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 16, x: isRight ? 16 : -16 }}
                  animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className={`relative md:w-1/2 ${isRight ? "md:ml-auto" : "md:mr-auto"}`}
                >
                  {/* connector dot to center */}
                  <div
                    className={`hidden md:block absolute top-8 ${isRight ? "-left-4" : "-right-4"} w-3 h-3 rounded-full`}
                    style={{ background: step.color }}
                  />

                  <div className="glass-effect rounded-2xl border border-white/10 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                        style={{ background: `linear-gradient(135deg, ${step.color}30, ${step.color}10)` }}
                      >
                        <step.icon size={22} style={{ color: step.color }} />
                        <div
                          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}80)` }}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
