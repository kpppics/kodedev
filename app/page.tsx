import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import ServicesSection from './components/ServicesSection'
import PortfolioSection from './components/PortfolioSection'
import HowItWorksSection from './components/HowItWorksSection'
import TestimonialsSection from './components/TestimonialsSection'
import SampleFormSection from './components/SampleFormSection'
import AboutSection from './components/AboutSection'
import ContactSection from './components/ContactSection'
import SiteFooter from './components/SiteFooter'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <HeroSection />
        <ServicesSection />
        <PortfolioSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <SampleFormSection />
        <AboutSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  )
}
