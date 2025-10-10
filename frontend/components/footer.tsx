"use client"

import { motion } from "framer-motion"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

const footerLinks = {
  Product: ["Features", "Pricing", "Security", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Resources: ["Documentation", "Help Center", "Community", "API"],
  Legal: ["Privacy", "Terms", "Cookies", "Licenses"],
}

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Mail, href: "#", label: "Email" },
]

export function Footer() {
  return (
    <footer id="contact" className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xl font-bold text-foreground">Recruit</span>
              <span
                className="px-2.5 py-1 rounded-xl relative text-base font-bold text-foreground"
                style={{ position: "relative" }}
              >
                <span className="relative z-10">AI</span>
                <span className="absolute inset-0 rounded-xl" style={{
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(16px)",
                  borderRadius: "12px",
                }} />
                <span className="absolute inset-0 rounded-xl pointer-events-none" style={{
                  padding: "1px",
                  background: "linear-gradient(135deg, #03b2cb, #00999e, #e60000)",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  borderRadius: "12px",
                }} />
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Transform your recruitment with AI-powered applicant selection and intelligent screening.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-lg glass-effect border border-white/10 flex items-center justify-center text-muted-foreground hover:text-[#03b2cb] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-foreground mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 RecruitAI. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ from <a href="https://linkedin.com/in/1davidadedeji" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#03b2cb] transition-colors">David Adedeji</a> for PLP Hackathon
          </p>
        </div>
      </div>
    </footer>
  )
}
