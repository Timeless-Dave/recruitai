"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Zap } from "lucide-react"

const cards = [
  {
    icon: TrendingUp,
    label: "Success Rate",
    value: "98.5%",
    change: "+12%",
    color: "#03b2cb",
    position: { top: "20%", left: "8%", rotate: -3 },
  },
  {
    icon: Users,
    label: "Active Recruiters",
    value: "2,847",
    change: "+156",
    color: "#00999e",
    position: { top: "45%", right: "10%", rotate: 5 },
  },
  {
    icon: Zap,
    label: "Avg. Processing Time",
    value: "2.3s",
    change: "-0.8s",
    color: "#e60000",
    position: { bottom: "25%", left: "12%", rotate: 2 },
  },
]

export function FloatingStatCards() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden lg:block">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5 + index * 0.2,
            ease: "easeOut",
          }}
          style={{
            ...card.position,
            position: "absolute",
            rotate: card.position.rotate,
          }}
          className="pointer-events-auto"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [card.position.rotate, card.position.rotate + 2, card.position.rotate],
            }}
            transition={{
              duration: 4 + index,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            className="relative group"
          >
            {/* Glow effect */}
            <div
              className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
              style={{ background: card.color }}
            />
            
            {/* Card */}
            <div className="relative glass-effect rounded-2xl border border-white/10 p-4 backdrop-blur-xl shadow-2xl min-w-[180px]">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${card.color}20` }}
                >
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold gradient-text">{card.value}</span>
                <span className="text-xs font-semibold" style={{ color: card.color }}>
                  {card.change}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

