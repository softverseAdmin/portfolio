import dynamic from 'next/dynamic'
import Link from 'next/link'
import Hero from '@/components/sections/Hero'
import ServicesSection from '@/components/sections/ServicesSection'
import AdSense from '@/components/ads/AdSense'

// Lazy load components below the fold
const TechNiches = dynamic(() => import('@/components/sections/TechNiches'))
const FeaturedContent = dynamic(() => import('@/components/sections/FeaturedContent'))
const Newsletter = dynamic(() => import('@/components/sections/Newsletter'))

export const metadata = {
  title: { absolute: 'DevOps Enginer — Free DevOps, Kubernetes & AWS Roadmaps and Tutorials' },
  description: 'Free step-by-step roadmaps and hands-on tutorials for DevOps, Kubernetes, AWS and cybersecurity. Learn in order — from fundamentals to production.',
  keywords: 'devops roadmap, kubernetes roadmap, aws roadmap, learn devops, devops tutorials, cloud roadmap, cybersecurity roadmap',
  openGraph: {
    title: 'DevOps Enginer — Free DevOps, Kubernetes & AWS Roadmaps and Tutorials',
    description: 'Free step-by-step roadmaps and hands-on tutorials for DevOps, Kubernetes, AWS and cybersecurity. Learn in order — from fundamentals to production.',
    type: 'website',
  }
}

function HowItWorks() {
  const steps = [
    {
      title: 'Pick a roadmap',
      text: 'DevOps, cloud or cybersecurity — each path is laid out in the order a working engineer actually learns it.'
    },
    {
      title: 'Follow the steps in order',
      text: 'No guessing what comes next. The roadmap sequences the topics from fundamentals to production.'
    },
    {
      title: 'Every step is a free tutorial',
      text: 'Steps with a tutorial link straight to it. Steps marked Coming soon are the public writing queue — they get filled in order.'
    },
    {
      title: 'Check topics off as you go',
      text: 'Work down the list and tick topics off in your own notes as you finish them — the path is the checklist.'
    },
  ]

  return (
    <section className="py-20 bg-deep-black">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
          How It Works
        </h2>
        <p className="text-center text-warm-white/70 mb-12 max-w-2xl mx-auto">
          Roadmaps first, tutorials inside them — learning in order, not by search-and-guess.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="bg-gradient-to-br from-charcoal/50 to-rich-black border border-gold/20 rounded-xl p-6">
              <div className="bg-gold/20 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                <span className="text-gold font-bold">{index + 1}</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">{step.title}</h3>
              <p className="text-warm-white/70 text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HomeFaq() {
  const faqs = [
    {
      q: 'Is everything on DevOps Enginer free?',
      a: 'Yes. Every roadmap and all 50 tutorials are free to read, with no signup wall. The site is supported by ads and by optional 1:1 mentoring for people who want personal help — the learning content itself is never paywalled.'
    },
    {
      q: 'Which roadmap should I start with — DevOps, Kubernetes, cloud or cybersecurity?',
      a: 'Start with the DevOps roadmap unless you already know your target role. It begins with the fundamentals (Linux, networking, Git) that the other paths assume. Kubernetes is a section inside the DevOps path — and a 22-tutorial in-depth sequence once you reach it — rather than a starting point.'
    },
    {
      q: 'I am a beginner. Can I follow the DevOps roadmap with no experience?',
      a: 'Yes — that is who the order is designed for. The roadmap starts at prerequisites and assumes no production experience. If a step feels too advanced, the step before it is the one to revisit; the path is built so each topic only depends on the ones above it.'
    },
    {
      q: 'How long does it take to learn DevOps?',
      a: 'With an IT or development background, 6–12 months of steady hands-on practice is a realistic range for a junior role. From zero, plan on longer — the fundamentals are not optional. The roadmap FAQ on the DevOps page breaks the timeline down further.'
    },
    {
      q: 'Do the roadmaps include hands-on tutorials, or just topics?',
      a: 'Both. Each roadmap lists the topics in learning order, and every topic that has a tutorial links to it — commands, configuration and checks included, not just theory. Topics still marked Coming soon are the public writing queue.'
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-rich-black to-deep-black">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((f) => (
            <div key={f.q} className="border border-gold/20 rounded-xl p-6 bg-rich-black/50">
              <h3 className="text-lg font-bold text-warm-white mb-2">{f.q}</h3>
              <p className="text-warm-white/70 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-warm-white/60 mt-10">
          Prefer to browse first? Start from the{' '}
          <Link href="/roadmaps" className="text-gold underline decoration-gold/40 underline-offset-2 hover:text-amber transition-all">
            roadmaps hub
          </Link>{' '}
          or the{' '}
          <Link href="/blog" className="text-gold underline decoration-gold/40 underline-offset-2 hover:text-amber transition-all">
            full tutorial index
          </Link>
          .
        </p>
      </div>
    </section>
  )
}

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

      <HowItWorks />

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

      <HomeFaq />

      <Newsletter />
    </main>
  )
}
