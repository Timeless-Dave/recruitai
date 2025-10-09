import type { Metadata } from "next"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { ParticlesBackground } from "@/components/particles-background"
import { CosmicBackground } from "@/components/cosmic-background"
import { ApplicantShowcase } from "@/components/applicant-showcase"
import { ScrollProgress } from "@/components/scroll-progress"
import { AuthModal } from "@/components/auth-modal"

export const metadata: Metadata = {
  title: "RecruitAI - Smart AI-Powered Recruitment Platform",
  description:
    "Transform hiring with AI-powered applicant screening, intelligent ranking, and automated feedback. Find top talent faster with our smart recruitment platform built for modern teams.",
  keywords: [
    "AI recruitment software",
    "applicant tracking system",
    "ATS platform",
    "AI hiring tool",
    "recruitment automation",
    "talent acquisition software",
    "smart hiring platform",
    "AI candidate screening",
    "automated recruitment",
    "recruitment technology",
  ],
  openGraph: {
    title: "RecruitAI - Smart AI-Powered Recruitment Platform",
    description:
      "Transform hiring with AI-powered applicant screening, intelligent ranking, and automated feedback. Find top talent faster.",
    url: "https://recruitai.app",
    siteName: "RecruitAI",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RecruitAI - AI-Powered Recruitment Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RecruitAI - Smart AI-Powered Recruitment Platform",
    description:
      "Transform hiring with AI-powered applicant screening, intelligent ranking, and automated feedback.",
    images: ["/og-image.png"],
  },
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <CosmicBackground />
      <ParticlesBackground />
      <Header />
      <ScrollProgress />
      <AuthModal />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <ApplicantShowcase />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
