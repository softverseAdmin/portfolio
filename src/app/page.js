import Hero from '@/components/sections/Hero'
import TechNiches from '@/components/sections/TechNiches'
import FeaturedContent from '@/components/sections/FeaturedContent'
import Newsletter from '@/components/sections/Newsletter'
import AdSense from '@/components/ads/AdSense'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-dark">
      <Hero />
      
      {/* Ad after Hero - High visibility with elegant styling */}
      <div className="py-8 bg-charcoal/30 backdrop-blur-sm border-y border-gold/10">
        <div className="max-w-7xl mx-auto px-4">
          <AdSense 
            adSlot="1234567890"
            adFormat="horizontal"
            style={{ display: 'block', textAlign: 'center' }}
            className="mb-4"
          />
        </div>
      </div>

      <TechNiches />
      
      {/* Ad between content sections with premium feel */}
      <div className="py-8 bg-deep-black">
        <div className="max-w-7xl mx-auto px-4">
          <AdSense 
            adSlot="0987654321"
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
