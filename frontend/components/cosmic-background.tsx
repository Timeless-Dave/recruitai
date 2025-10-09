"use client"

import { motion } from "framer-motion"

export function CosmicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden will-change-transform" style={{ transform: 'translateZ(0)' }}>
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#050510] to-black" />
      
      {/* Curved horizon glow - inspired by Web3 design */}
      <div className="absolute bottom-0 left-0 right-0 h-[60vh] overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-[30%] left-1/2 -translate-x-1/2 w-[140%] h-[80%] rounded-[50%]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(3,178,203,0.15) 0%, rgba(0,153,158,0.1) 30%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1.05, 1, 1.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-[35%] left-1/2 -translate-x-1/2 w-[120%] h-[70%] rounded-[50%]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(230,0,0,0.12) 0%, rgba(230,0,0,0.08) 30%, transparent 70%)",
          }}
        />
      </div>

      {/* Radial spotlight from top */}
      <motion.div
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-[60vh]"
        style={{
          background: "radial-gradient(ellipse at center top, rgba(3,178,203,0.08) 0%, transparent 60%)",
        }}
      />
    </div>
  )
}

