"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

const profiles = new Array(4).fill(0).map((_, i) => ({
  id: i,
  name: `Candidate ${i + 1}`,
  role: "Software Engineer",
  avatar: "/placeholder-user.jpg",
  score: 80 + ((i * 3) % 15),
}))

export function ApplicantShowcase() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="showcase" ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Applicant <span className="gradient-text">Showcase</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore sample profiles rendered with glassmorphism cards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {profiles.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
              className="relative overflow-hidden rounded-2xl glass-effect border border-white/10 p-6 group"
            >
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[#03b2cb]/20 blur-3xl" />
              <div className="flex items-center gap-4 mb-4">
                <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full border border-white/20" />
                <div>
                  <div className="font-semibold text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.role}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">AI Fit Score</div>
                <div className="text-xl font-bold gradient-text">{p.score}%</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


