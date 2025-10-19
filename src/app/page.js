import Hero from '@/components/sections/Hero'
import TechNiches from '@/components/sections/TechNiches'
import FeaturedContent from '@/components/sections/FeaturedContent'
import Newsletter from '@/components/sections/Newsletter'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <TechNiches />
      <FeaturedContent />
      <Newsletter />
    </main>
  )
}
