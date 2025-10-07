"use client"

import { motion } from "framer-motion"

interface SectionDividerProps {
  variant?: "top" | "bottom" | "both"
  color?: "cyan" | "red" | "mixed"
}

export function SectionDivider({ variant = "bottom", color = "cyan" }: SectionDividerProps) {
  const colors = {
    cyan: ["rgba(3,178,203,0.3)", "rgba(0,153,158,0.2)", "transparent"],
    red: ["rgba(230,0,0,0.3)", "rgba(230,0,0,0.15)", "transparent"],
    mixed: ["rgba(3,178,203,0.3)", "rgba(230,0,0,0.2)", "transparent"],
  }

  const gradientStops = colors[color]

  return (
    <div className="relative w-full h-32 overflow-hidden">
      {(variant === "top" || variant === "both") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-0 left-0 right-0 h-16"
        >
          <svg viewBox="0 0 1440 100" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-top-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientStops[0]} />
                <stop offset="50%" stopColor={gradientStops[1]} />
                <stop offset="100%" stopColor={gradientStops[2]} />
              </linearGradient>
            </defs>
            <motion.path
              d="M0,50 Q360,10 720,50 T1440,50 L1440,0 L0,0 Z"
              fill={`url(#grad-top-${color})`}
              animate={{
                d: [
                  "M0,50 Q360,10 720,50 T1440,50 L1440,0 L0,0 Z",
                  "M0,50 Q360,70 720,50 T1440,50 L1440,0 L0,0 Z",
                  "M0,50 Q360,10 720,50 T1440,50 L1440,0 L0,0 Z",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </svg>
        </motion.div>
      )}

      {(variant === "bottom" || variant === "both") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute bottom-0 left-0 right-0 h-16"
        >
          <svg viewBox="0 0 1440 100" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-bottom-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientStops[0]} />
                <stop offset="50%" stopColor={gradientStops[1]} />
                <stop offset="100%" stopColor={gradientStops[2]} />
              </linearGradient>
            </defs>
            <motion.path
              d="M0,50 Q360,90 720,50 T1440,50 L1440,100 L0,100 Z"
              fill={`url(#grad-bottom-${color})`}
              animate={{
                d: [
                  "M0,50 Q360,90 720,50 T1440,50 L1440,100 L0,100 Z",
                  "M0,50 Q360,30 720,50 T1440,50 L1440,100 L0,100 Z",
                  "M0,50 Q360,90 720,50 T1440,50 L1440,100 L0,100 Z",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </svg>
        </motion.div>
      )}
    </div>
  )
}

