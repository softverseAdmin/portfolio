import AdSense from '@/components/ads/AdSense'

export const metadata = {
  title: 'About Us - DevOps Engineer | Learn DevOps, Cloud & Cybersecurity',
  description: 'Learn about DevOps Engineer - your trusted source for DevOps tutorials, cloud architecture guides, and cybersecurity best practices. Our mission is to empower engineers worldwide.',
  keywords: 'about devops engineer, devops learning platform, cloud computing education, cybersecurity training',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-deep-black via-rich-black to-charcoal">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold">DevOps Engineer</span>
          </h1>
          <p className="text-xl text-warm-white/70 max-w-3xl mx-auto">
            Empowering the next generation of technology professionals with world-class DevOps, Cloud, and Security education.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16 bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-2xl p-8 md:p-12 hover:border-gold/40 transition-all shadow-2xl hover:shadow-gold/20">
          <h2 className="text-3xl font-bold text-warm-white mb-6 flex items-center">
            <span className="text-4xl mr-4">🎯</span>
            <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Our Mission</span>
          </h2>
          <p className="text-lg text-warm-white/80 leading-relaxed mb-4">
            At DevOps Engineer, our mission is to democratize access to high-quality technical education. We believe that everyone, regardless of their background or location, should have access to expert-level knowledge in DevOps, Cloud Computing, and Cybersecurity.
          </p>
          <p className="text-lg text-warm-white/80 leading-relaxed">
            We strive to create comprehensive, practical, and up-to-date content that helps engineers at all levels—from beginners taking their first steps to seasoned professionals looking to master advanced concepts—achieve their career goals and build production-ready skills.
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

        {/* What We Offer */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-warm-white mb-8 text-center">
            What We <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Offer</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group transform hover:-translate-y-1">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent mb-3">DevOps Tutorials</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                Comprehensive guides covering CI/CD, containerization, orchestration, infrastructure as code, and automation tools like Jenkins, GitLab, Docker, Kubernetes, Terraform, and Ansible.
              </p>
            </div>

            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group transform hover:-translate-y-1">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">☁️</div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-amber to-soft-gold bg-clip-text text-transparent mb-3">Cloud Architecture</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                In-depth tutorials for AWS, Azure, and Google Cloud Platform. Learn cloud computing fundamentals, serverless architectures, microservices, and multi-cloud strategies.
              </p>
            </div>

            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group transform hover:-translate-y-1">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔒</div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-dark-gold to-gold bg-clip-text text-transparent mb-3">Cybersecurity</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                Security best practices, vulnerability assessment, penetration testing, secure coding, compliance frameworks (ISO 27001, SOC 2), and DevSecOps implementation.
              </p>
            </div>

            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group transform hover:-translate-y-1">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📚</div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-soft-gold to-amber bg-clip-text text-transparent mb-3">Comprehensive Resources</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                Curated tools, cheat sheets, templates, code repositories, and best practices to accelerate your learning and implementation.
              </p>
            </div>

            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group transform hover:-translate-y-1">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💼</div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent mb-3">Real-World Projects</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                Hands-on projects and case studies from actual production environments to help you build a portfolio and gain practical experience.
              </p>
            </div>

            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group transform hover:-translate-y-1">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-amber to-dark-gold bg-clip-text text-transparent mb-3">Career Guidance</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                Interview preparation, certification guides, resume tips, and career path roadmaps for DevOps, Cloud, and Security roles.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-16 bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-2xl p-8 md:p-12 hover:border-gold/40 transition-all shadow-2xl hover:shadow-gold/20">
          <h2 className="text-3xl font-bold text-warm-white mb-6 flex items-center">
            <span className="text-4xl mr-4">📖</span>
            <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Our Story</span>
          </h2>
          <p className="text-lg text-warm-white/80 leading-relaxed mb-4">
            DevOps Engineer was founded by a team of experienced DevOps engineers, cloud architects, and security professionals who recognized a gap in the market for truly comprehensive, practical technical education. Having worked at leading tech companies and startups, we understand what skills employers are looking for and what real-world challenges engineers face daily.
          </p>
          <p className="text-lg text-warm-white/80 leading-relaxed mb-4">
            Since our launch, we've helped thousands of engineers level up their skills, transition into DevOps and Cloud roles, and implement best practices in their organizations. Our content is continuously updated to reflect the latest industry trends, tools, and methodologies.
          </p>
          <p className="text-lg text-warm-white/80 leading-relaxed">
            We're committed to maintaining the highest standards of quality, accuracy, and relevance in everything we publish. Every tutorial is thoroughly tested, every guide is peer-reviewed, and every resource is validated against current industry standards.
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
            Our <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">Core Values</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group">
              <h3 className="text-xl font-bold text-gold mb-3 group-hover:text-amber transition-colors">🎯 Quality First</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                We never compromise on quality. Every piece of content is meticulously researched, tested, and verified to ensure accuracy and practical applicability.
              </p>
            </div>

            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group">
              <h3 className="text-xl font-bold text-amber mb-3 group-hover:text-gold transition-colors">🌍 Accessibility</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                Knowledge should be freely accessible. We provide comprehensive free content to ensure everyone can learn, regardless of their financial situation.
              </p>
            </div>

            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group">
              <h3 className="text-xl font-bold text-soft-gold mb-3 group-hover:text-amber transition-colors">💡 Continuous Learning</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                Technology evolves rapidly. We stay current with the latest tools, trends, and best practices to provide you with relevant, cutting-edge content.
              </p>
            </div>

            <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group">
              <h3 className="text-xl font-bold text-dark-gold mb-3 group-hover:text-gold transition-colors">🤝 Community Driven</h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                We listen to our community and adapt our content based on feedback, questions, and emerging needs in the DevOps and Cloud ecosystem.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16 bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-2xl p-8 md:p-12 hover:border-gold/40 transition-all shadow-2xl hover:shadow-gold/20">
          <h2 className="text-3xl font-bold text-warm-white mb-6">
            Why Choose <span className="bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent">DevOps Engineer</span>?
          </h2>
          <div className="space-y-6">
            <div className="flex items-start group">
              <span className="text-2xl mr-4 text-gold group-hover:scale-110 transition-transform">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-warm-white mb-1 group-hover:text-gold transition-colors">Expert-Created Content</h3>
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">All our tutorials and guides are created by industry professionals with years of hands-on experience.</p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="text-2xl mr-4 text-amber group-hover:scale-110 transition-transform">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-warm-white mb-1 group-hover:text-amber transition-colors">Practical & Actionable</h3>
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">We focus on real-world applications and provide step-by-step guides you can implement immediately.</p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="text-2xl mr-4 text-soft-gold group-hover:scale-110 transition-transform">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-warm-white mb-1 group-hover:text-soft-gold transition-colors">Regularly Updated</h3>
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">Our content is continuously updated to reflect the latest tools, versions, and best practices.</p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="text-2xl mr-4 text-dark-gold group-hover:scale-110 transition-transform">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-warm-white mb-1 group-hover:text-dark-gold transition-colors">Beginner to Advanced</h3>
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">Whether you're just starting or looking to master advanced concepts, we have content for every skill level.</p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="text-2xl mr-4 text-gold group-hover:scale-110 transition-transform">✅</span>
              <div>
                <h3 className="text-lg font-semibold text-warm-white mb-1 group-hover:text-gold transition-colors">Free & Open</h3>
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">Core educational content is freely available to everyone. Knowledge should never be gatekept.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-gradient-to-r from-charcoal/40 to-rich-black/60 border border-gold/20 rounded-2xl p-12 backdrop-blur-sm hover:border-gold/40 transition-all">
          <h2 className="text-3xl font-bold text-warm-white mb-4 bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
            Join Our Growing Community
          </h2>
          <p className="text-lg text-warm-white/70 mb-8 max-w-2xl mx-auto">
            Have questions, suggestions, or feedback? We'd love to hear from you. Let's build the future of DevOps education together.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-gradient-gold hover:shadow-xl hover:shadow-gold/50 text-deep-black px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            Get In Touch
          </a>
        </section>
      </div>
    </main>
  )
}
