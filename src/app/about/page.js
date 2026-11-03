import Link from 'next/link'
import AdSense from '@/components/ads/AdSense'

export const metadata = {
  title: { absolute: 'About Rabin Adhikari, Author of DevOps Enginer' },
  description: 'DevOps Enginer is written by Rabin Adhikari — a DevOps engineer and project manager in Japan. 49 free tutorials on DevOps, Kubernetes, AWS and security.',
  keywords: 'about rabin adhikari, devops enginer, devops learning platform, cloud computing education, cybersecurity training',
  openGraph: {
    title: 'About Rabin Adhikari, Author of DevOps Enginer',
    description: 'DevOps Enginer is written by Rabin Adhikari — a DevOps engineer and project manager in Japan. 49 free tutorials on DevOps, Kubernetes, AWS and security.',
    type: 'website',
  }
}

const offerCards = [
  {
    icon: '🚀',
    gradient: 'from-gold to-amber',
    title: 'DevOps Tutorials',
    text: 'Comprehensive guides covering CI/CD, containerization, orchestration, infrastructure as code, and automation tools like Jenkins, GitLab, Docker, Kubernetes, Terraform, and Ansible.',
    link: '/devops',
    linkLabel: 'Follow the DevOps roadmap →',
  },
  {
    icon: '☁️',
    gradient: 'from-amber to-soft-gold',
    title: 'Cloud Architecture',
    text: 'In-depth tutorials for AWS, Azure, and Google Cloud Platform. Learn cloud computing fundamentals, serverless architectures, microservices, and multi-cloud strategies.',
    link: '/cloud',
    linkLabel: 'Follow the cloud roadmap →',
  },
  {
    icon: '🔒',
    gradient: 'from-dark-gold to-gold',
    title: 'Cybersecurity',
    text: 'Security best practices, vulnerability assessment, secure coding, compliance frameworks, and DevSecOps implementation — strongest where it meets cloud and Kubernetes.',
    link: '/cybersecurity',
    linkLabel: 'Follow the cybersecurity roadmap →',
  },
  {
    icon: '📚',
    gradient: 'from-soft-gold to-amber',
    title: 'Comprehensive Resources',
    text: 'Curated tools, cheat sheets, templates, and best practices to accelerate your learning and implementation.',
    link: '/resources',
    linkLabel: 'Browse the resources →',
  },
  {
    icon: '💼',
    gradient: 'from-gold via-amber to-soft-gold',
    title: 'Real-World Projects',
    text: 'Hands-on guides drawn from actual project work — including the backup-verification series that grew out of a reader\'s hard questions — to help you build production-ready skills.',
    link: '/blog',
    linkLabel: 'Read the tutorials →',
  },
  {
    icon: '🎓',
    gradient: 'from-amber to-dark-gold',
    title: 'Career Guidance',
    text: 'Certification guides, resume advice, and career path roadmaps for DevOps, Cloud, and Security roles — plus 1:1 mentoring and Japan career guidance.',
    link: '/services',
    linkLabel: 'See mentoring & services →',
  },
]

const faqs = [
  {
    q: 'Who writes DevOps Enginer?',
    a: 'One person: Rabin Adhikari, a software and DevOps engineer with about 7 years of experience in Japan, now working as a project manager in healthcare software. Every tutorial is written and tested by him.',
  },
  {
    q: 'Is DevOps Enginer free to read?',
    a: 'Yes. All 49 tutorials and every roadmap are free, with no signup wall. The site is supported by ads and by optional paid mentoring.',
  },
  {
    q: 'Can I hire or be mentored by the author?',
    a: 'Yes — mentoring, resume reviews, Japan career guidance and team training are offered on the Services page, starting with a free 15-minute intro call.',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-deep-black via-rich-black to-charcoal">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold">DevOps Enginer</span> — and the Engineer Behind It
          </h1>
          <p className="text-xl text-warm-white/70 max-w-3xl mx-auto">
            DevOps Enginer is written by one engineer — Rabin Adhikari, a DevOps engineer and project manager in
            Japan. These are his 49 free tutorials on DevOps, Kubernetes, AWS and security, drawn from real project work.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16 bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-2xl p-8 md:p-12 hover:border-gold/40 transition-all shadow-2xl hover:shadow-gold/20">
          <h2 className="text-3xl font-bold text-warm-white mb-6 flex items-center">
            <span className="text-4xl mr-4">🎯</span>
            <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">The Mission</span>
          </h2>
          <p className="text-lg text-warm-white/80 leading-relaxed mb-4">
            I started DevOps Enginer to make the path into DevOps, cloud and security work clearer than it was for
            me. When I was learning, the knowledge existed — but it was scattered, out of order, and written for
            people who already knew the answers. The roadmaps on this site exist to fix the order; the tutorials
            exist to fix the depth.
          </p>
          <p className="text-lg text-warm-white/80 leading-relaxed">
            Everything here is free, practical and tested before it is published — written for engineers at every
            level, from beginners taking their first steps to professionals hardening production systems.
          </p>
        </section>

        {/* Ad Placement */}
        <div className="my-12">
          <AdSense
            adSlot="2234567890"
            adFormat="horizontal"
            className="text-center"
          />
        </div>

        {/* What You'll Find Here */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-warm-white mb-8 text-center">
            What You&apos;ll <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Find Here</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offerCards.map((card) => (
              <div key={card.title} className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group transform hover:-translate-y-1">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{card.icon}</div>
                <h3 className={`text-xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent mb-3`}>{card.title}</h3>
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors mb-4">
                  {card.text}
                </p>
                <Link href={card.link} className="text-gold text-sm font-semibold hover:text-amber transition-colors">
                  {card.linkLabel}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* My Story */}
        <section className="mb-16 bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-2xl p-8 md:p-12 hover:border-gold/40 transition-all shadow-2xl hover:shadow-gold/20">
          <h2 className="text-3xl font-bold text-warm-white mb-6 flex items-center">
            <span className="text-4xl mr-4">📖</span>
            <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">My Story</span>
          </h2>
          <p className="text-lg text-warm-white/80 leading-relaxed mb-4">
            I came to Japan from Kathmandu, Nepal, and built my career here in a second language: a Japanese
            language programme and a technical college, studied alongside my first jobs. Early on I coordinated
            and trained freelance developers back in Nepal — my first experience of the work I still love most,
            turning juniors into engineers who ship.
          </p>
          <p className="text-lg text-warm-white/80 leading-relaxed mb-4">
            Across about 7 years in software development and DevOps engineering, I have worked on web applications,
            systems engineering and DevOps roles in Japan, specialising in Kubernetes, GitOps, CI/CD and
            cloud-native architecture. Today I work as a project manager in healthcare software — the role changed
            my core question from &ldquo;is it built right?&rdquo; to &ldquo;will anyone actually use it?&rdquo;, and both
            questions run through every guide on this site.
          </p>
          <p className="text-lg text-warm-white/80 leading-relaxed">
            DevOps Enginer is where I write down what the work teaches me. Every guide is tested on a real rig
            before publication — commands are run, configurations are applied, and numbers are measured, not
            assumed. When readers push back with better evidence, the guides get corrected; that exchange is the
            quality process.
          </p>
        </section>

        {/* Ad Placement */}
        <div className="my-12">
          <AdSense
            adSlot="3234567890"
            adFormat="rectangle"
            className="text-center"
          />
        </div>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-warm-white mb-8 text-center">
            Core <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Values</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group">
              <h3 className="text-xl font-bold text-gold mb-3 group-hover:text-amber transition-colors">🎯 Quality First</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                No claim goes into a guide untested. Commands are run and results measured before anything is published under my name.
              </p>
            </div>

            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group">
              <h3 className="text-xl font-bold text-amber mb-3 group-hover:text-gold transition-colors">🌍 Accessibility</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                Knowledge should be freely accessible. The tutorials are comprehensive and free, so anyone can learn regardless of their financial situation — the way I had to.
              </p>
            </div>

            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group">
              <h3 className="text-xl font-bold text-soft-gold mb-3 group-hover:text-amber transition-colors">💡 Continuous Learning</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                Technology evolves rapidly. I stay current with the latest tools and practices — and correct the guides when the evidence changes.
              </p>
            </div>

            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group">
              <h3 className="text-xl font-bold text-dark-gold mb-3 group-hover:text-gold transition-colors">🤝 Reader Driven</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                Reader questions and corrections shape what gets written next. Some of the best series on this site started as a commenter&apos;s hard question.
              </p>
            </div>
          </div>
        </section>

        {/* Why Read */}
        <section className="mb-16 bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-2xl p-8 md:p-12 hover:border-gold/40 transition-all shadow-2xl hover:shadow-gold/20">
          <h2 className="text-3xl font-bold text-warm-white mb-6">
            Why Read <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">DevOps Enginer</span>?
          </h2>
          <div className="space-y-6">
            <div className="flex items-start group">
              <span className="text-2xl mr-4 text-gold group-hover:scale-110 transition-transform">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-warm-white mb-1 group-hover:text-gold transition-colors">Written by a Working Engineer</h3>
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">Every tutorial is written by Rabin Adhikari from his own project work — about 7 years of software development and DevOps in Japan, now in a project manager role.</p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="text-2xl mr-4 text-amber group-hover:scale-110 transition-transform">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-warm-white mb-1 group-hover:text-amber transition-colors">Practical &amp; Actionable</h3>
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">Real-world applications and step-by-step guides you can implement immediately — tested before they are published.</p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="text-2xl mr-4 text-soft-gold group-hover:scale-110 transition-transform">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-warm-white mb-1 group-hover:text-soft-gold transition-colors">Regularly Updated</h3>
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">Guides are revisited as tools and versions change, and the roadmap pages carry visible updated dates.</p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="text-2xl mr-4 text-dark-gold group-hover:scale-110 transition-transform">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-warm-white mb-1 group-hover:text-dark-gold transition-colors">Beginner to Advanced</h3>
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">Whether you&apos;re just starting or mastering advanced concepts, the roadmaps sequence the content for your level.</p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="text-2xl mr-4 text-gold group-hover:scale-110 transition-transform">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-warm-white mb-1 group-hover:text-gold transition-colors">Free &amp; Open</h3>
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">Core educational content is freely available to everyone. Knowledge should never be gatekept.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Start Learning */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-warm-white mb-8 text-center">
            Start <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Learning</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/devops" className="block bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20">
              <h3 className="text-xl font-bold text-gold mb-2">DevOps Roadmap</h3>
              <p className="text-warm-white/70 text-sm leading-relaxed">Prerequisites to production: Linux, CI/CD, Docker, Kubernetes, Terraform and monitoring in order.</p>
            </Link>
            <Link href="/cloud" className="block bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20">
              <h3 className="text-xl font-bold text-gold mb-2">Cloud Roadmap</h3>
              <p className="text-warm-white/70 text-sm leading-relaxed">AWS step by step, with Azure and GCP beside it — IAM, VPC, EKS and cost.</p>
            </Link>
            <Link href="/cybersecurity" className="block bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20">
              <h3 className="text-xl font-bold text-gold mb-2">Cybersecurity Roadmap</h3>
              <p className="text-warm-white/70 text-sm leading-relaxed">Fundamentals, cloud security and DevSecOps — this site&apos;s deepest security ground.</p>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-warm-white mb-10 text-center">
            About <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">FAQ</span>
          </h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="border border-gold/20 rounded-xl p-6 bg-rich-black/50">
                <h3 className="text-lg font-bold text-warm-white mb-2">{f.q}</h3>
                <p className="text-warm-white/70 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-gradient-to-r from-charcoal/40 to-rich-black/60 border border-gold/20 rounded-2xl p-12 backdrop-blur-sm hover:border-gold/40 transition-all">
          <h2 className="text-3xl font-bold text-warm-white mb-4 bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
            Questions, or Want a Mentor?
          </h2>
          <p className="text-lg text-warm-white/70 mb-8 max-w-2xl mx-auto">
            Corrections, topic requests and feedback are welcome — reader questions have started some of the best
            series here. For personal help with your career, the Services page is the place to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block bg-gradient-gold hover:shadow-xl hover:shadow-gold/50 text-deep-black px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Get In Touch
            </a>
            <Link
              href="/services"
              className="inline-block border-2 border-gold/50 text-gold hover:bg-gold/10 hover:border-gold px-8 py-4 rounded-lg text-lg font-semibold transition-all"
            >
              Mentoring &amp; Services
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
