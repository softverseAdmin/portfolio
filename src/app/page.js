import dynamic from 'next/dynamic'
import Hero from '@/components/sections/Hero'
import ServicesSection from '@/components/sections/ServicesSection'
import AdSense from '@/components/ads/AdSense'

// Lazy load components below the fold
const TechNiches = dynamic(() => import('@/components/sections/TechNiches'))
const FeaturedContent = dynamic(() => import('@/components/sections/FeaturedContent'))
const Newsletter = dynamic(() => import('@/components/sections/Newsletter'))

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-dark">
      <Hero />
      
      {/* Ad after Hero - High visibility with elegant styling */}
      <div className="py-8 bg-charcoal/30 backdrop-blur-sm border-y border-gold/10">
        <div className="max-w-7xl mx-auto px-4">
          <AdSense 
            adSlot="5338006842623882"
            adFormat="horizontal"
            style={{ display: 'block', textAlign: 'center' }}
            className="mb-4"
          />
        </div>
      </div>

      <TechNiches />
      
      <ServicesSection />
      
      {/* Ad between content sections with premium feel */}
      <div className="py-8 bg-deep-black">
        <div className="max-w-7xl mx-auto px-4">
          <AdSense 
            adSlot="1234567890"
            adFormat="rectangle"
            style={{ display: 'block', textAlign: 'center' }}
          />
        </div>
      </div>

      <FeaturedContent />
      
      <Newsletter />
    </main>
  )
}
