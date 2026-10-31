import Link from 'next/link';
import EnquiryForm from '../../components/sections/EnquiryForm';

export const metadata = {
  title: 'Mentoring & Career Services for Engineers | DevOps Enginer',
  description: '1:1 mentoring, resume reviews and Japan career guidance from a DevOps engineer turned project manager in Tokyo — plus practical training for junior and freelance development teams.',
  keywords: 'DevOps mentoring, engineering career coaching, resume review Japan, DevOps career Japan, freelance developer training',
  openGraph: {
    title: 'Mentoring & Career Services for Engineers',
    description: 'Career mentoring, resume reviews and Japan-market guidance from an engineer who made the Nepal-to-Tokyo journey himself.',
    type: 'website',
  }
};

const services = [
  {
    title: 'DevOps Career Mentoring (1:1)',
    items: 'A working session on your actual situation: the skills to build next, how to move from development into DevOps or platform work, and how to present the experience you already have. You leave with a concrete plan, not motivational quotes.',
  },
  {
    title: 'Resume & LinkedIn Review',
    items: 'A line-by-line review of your resume and LinkedIn profile against how engineering roles are actually hired — including the Japan market, where the expectations (and the unspoken ones) differ from what most templates assume.',
  },
  {
    title: 'Working in Japan: Career Guidance',
    items: 'Routes into Japanese tech companies, how much Japanese you really need and where to invest in it, what hiring managers look for, and the mistakes that cost foreign engineers offers. From someone who arrived from Kathmandu, learned the language, and built the career here.',
  },
  {
    title: 'Training for Junior & Freelance Teams',
    items: 'Structured onboarding and training for junior engineers and freelance teams — the same work I did coordinating and training freelance developers in Nepal: from first commit standards to delivering real projects with review discipline.',
  },
];

const faqs = [
  {
    q: 'Who is this for?',
    a: 'Engineers early in a DevOps/cloud career, developers aiming at the Japan market, and small teams who need their junior engineers levelled up. If you are not sure which service fits, send the enquiry anyway — the intro call sorts it out.',
  },
  {
    q: 'How does it work?',
    a: 'Send an enquiry with your email. I reply within a few days, we book a free 15-minute intro call, and only then agree scope and price — no payment pages, no pressure. Sessions are online (Japan time evenings and weekends), in English, Japanese, Nepali or Hindi.',
  },
  {
    q: 'Who are you?',
    a: 'Rabin Adhikari — about 7 years in software development and DevOps engineering in Japan, now a project manager in healthcare software. I write the DevOps Enginer guides, trained freelance developers in Nepal early in my career, and mentor junior engineers in my day work.',
  },
  {
    q: 'Why no prices on this page?',
    a: 'Because the right scope depends on your situation, and I would rather price the actual help than sell a generic package. The intro call is free; if we are not a fit, I will say so on that call.',
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-deep-black">
      <section className="py-24 px-4 bg-gradient-to-br from-charcoal via-rich-black to-deep-black relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm font-medium mb-6">
            Mentoring & Services
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
            Work With Me
          </h1>
          <p className="text-lg md:text-xl text-warm-white/70 mb-10 leading-relaxed max-w-3xl mx-auto">
            The guides on this site are free. If you want the same experience applied directly to
            your career, your resume, or your team — this is where that happens.
          </p>
          <EnquiryForm />
          <p className="text-xs text-warm-white/50 mt-6">
            One reply within a few days. No spam, no list, no obligation.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-warm-white">
            What I can <span className="text-gold">help with</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((block) => (
              <div key={block.title} className="border border-gold/20 rounded-xl p-6 bg-rich-black/50 hover:border-gold/50 transition-all">
                <h3 className="text-xl font-bold text-gold mb-3">{block.title}</h3>
                <p className="text-warm-white/70 leading-relaxed">{block.items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-charcoal/40">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-warm-white">
            Honest <span className="text-gold">questions</span>
          </h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="border border-gold/20 rounded-xl p-6 bg-rich-black/50">
                <h3 className="text-lg font-bold text-warm-white mb-2">{f.q}</h3>
                <p className="text-warm-white/70 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-warm-white">
            Start with the <span className="text-gold">free guides</span>
          </h2>
          <p className="text-warm-white/70 mb-8">
            Most questions are already answered here, free:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog/how-to-become-devops-engineer-japan-2025-career-guide" className="px-6 py-3 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-all">
              DevOps Career in Japan
            </Link>
            <Link href="/blog/kubernetes-troubleshooting-guide-2026" className="px-6 py-3 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-all">
              Kubernetes Troubleshooting
            </Link>
            <Link href="/blog/ai-for-devops-practical-guide-2026" className="px-6 py-3 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-all">
              AI for DevOps
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
