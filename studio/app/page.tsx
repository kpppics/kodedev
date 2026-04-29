import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Models from './components/Models'
import Research from './components/Research'
import Playground from './components/Playground'
import Calculator from './components/Calculator'
import Pricing from './components/Pricing'
import UseCases from './components/UseCases'
import Trust from './components/Trust'
import Testimonials from './components/Testimonials'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Models />
        <Research />
        <Playground />
        <Calculator />
        <UseCases />
        <Pricing />
        <Trust />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
