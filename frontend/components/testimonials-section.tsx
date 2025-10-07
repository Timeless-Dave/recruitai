"use client"

import { motion, useAnimationControls } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Quote, Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Head of Talent Acquisition",
    company: "TechCorp Inc.",
    content:
      "This platform has revolutionized our hiring process. We reduced screening time by 80% while improving candidate quality significantly.",
    avatar: "/professional-woman-diverse.png",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "HR Director",
    company: "Innovation Labs",
    content:
      "The AI-powered screening is incredibly accurate. We found our best hires through this platform, and the automated feedback feature is a game-changer.",
    avatar: "/professional-man.jpg",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Recruitment Manager",
    company: "Global Solutions",
    content:
      "Fair, transparent, and efficient. Our candidates appreciate the personalized feedback, and we love the detailed analytics dashboard.",
    avatar: "/professional-woman-smiling.png",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "VP of People Operations",
    company: "StartupX",
    content:
      "Game-changing technology for modern recruitment. The platform scales with our needs and consistently delivers quality candidates.",
    avatar: "/placeholder-user.jpg",
    rating: 5,
  },
]

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const controls = useAnimationControls()
  const [isPaused, setIsPaused] = useState(false)

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials]

  const handleHoverStart = () => {
    setIsPaused(true)
    controls.stop()
  }

  const handleHoverEnd = () => {
    setIsPaused(false)
    controls.start({
      x: [null, -(424 * testimonials.length)],
      transition: {
        duration: 30,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      },
    })
  }

  return (
    <section id="testimonials" ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">
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
            <span className="text-sm font-semibold text-[#03b2cb]">TESTIMONIALS</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted by leading organizations worldwide
          </p>
        </motion.div>

        {/* Marquee Container */}
        <div className="relative overflow-hidden">
          {/* Gradient fades on edges - stronger and wider */}
          <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-40 lg:w-48 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-40 lg:w-48 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

          {/* Marquee track */}
          <motion.div
            className="flex gap-6"
            initial={{ x: 0 }}
            animate={
              isInView
                ? {
                    x: [0, -(424 * testimonials.length)],
                  }
                : { x: 0 }
            }
            transition={{
              x: {
                duration: 30,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop",
              },
            }}
            style={{ willChange: "transform" }}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: (index % testimonials.length) * 0.05 }}
                className="flex-shrink-0 w-[400px]"
              >
                <div className="glass-effect rounded-2xl border border-white/10 p-6 h-full relative group hover:border-white/20 transition-all cursor-pointer">
                  {/* Glow effect on hover */}
                  <motion.div
                    className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
                    style={{
                      background: "radial-gradient(circle at center, rgba(3,178,203,0.2), transparent 70%)",
                    }}
                  />

                  <div className="relative z-10">
                    <Quote size={32} className="text-[#03b2cb] opacity-30 mb-4" />

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} size={16} className="fill-[#03b2cb] text-[#03b2cb]" />
                      ))}
                    </div>

                    <p className="text-foreground mb-6 leading-relaxed">{testimonial.content}</p>

                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full border-2 border-[#03b2cb]/30"
                      />
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
