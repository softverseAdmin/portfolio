import Hero from '@/components/sections/Hero'
import TechNiches from '@/components/sections/TechNiches'
import FeaturedContent from '@/components/sections/FeaturedContent'
import Newsletter from '@/components/sections/Newsletter'
import AdSense from '@/components/ads/AdSense'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900">
      <Hero />
      
      {/* Ad after Hero - High visibility */}
      <div className="py-8 bg-slate-800/50">
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
      
      {/* Ad between content sections */}
      <div className="py-8 bg-slate-900">
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
