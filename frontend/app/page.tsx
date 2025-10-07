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
