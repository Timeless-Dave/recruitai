"use client"

import { useRef } from "react"
import { useScroll, useSpring, motion } from "framer-motion"

// A solid gradient scroll progress bar under the fixed header
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  })

  return (
    <div ref={barRef} className="fixed top-16 sm:top-20 left-0 right-0 z-40 pointer-events-none">
      <div className="relative h-3 w-full overflow-hidden bg-white/10 backdrop-blur-sm">
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-full origin-left"
          style={{
            scaleX,
            background: "linear-gradient(90deg, #03b2cb 0%, #00999e 50%, #e60000 100%)",
            boxShadow: "0 0 12px rgba(3,178,203,0.5), 0 0 24px rgba(3,178,203,0.3)",
          }}
        />
        {/* Animated shimmer effect */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-full origin-left opacity-50"
          style={{
            scaleX,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "200% 0%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </div>
  )
}


