'use client'
import Link from 'next/link'

export default function ServicesSection() {
  const services = [
    {
      title: 'DevOps Automation',
      description: 'Streamline your deployment pipeline with CI/CD best practices, Docker containerization, and Kubernetes orchestration.',
      icon: '🚀',
      features: ['CI/CD Pipelines', 'Docker & Kubernetes', 'Infrastructure as Code'],
      gradient: 'from-gold to-amber',
      link: '/devops'
    },
    {
      title: 'Cloud Solutions',
      description: 'Master cloud architecture with AWS, Azure, and GCP. Learn cost optimization and scalable infrastructure design.',
      icon: '☁️',
      features: ['AWS Architecture', 'Cost Optimization', 'Multi-Cloud Strategy'],
      gradient: 'from-amber to-soft-gold',
      link: '/cloud'
    },
    {
      title: 'Security Engineering',
      description: 'Implement DevSecOps practices, penetration testing, and compliance frameworks for enterprise-grade security.',
      icon: '🔐',
      features: ['DevSecOps', 'Penetration Testing', 'Compliance'],
      gradient: 'from-dark-gold to-gold',
      link: '/cybersecurity'
    },
    {
      title: 'Learning Resources',
      description: 'Access comprehensive tutorials, guides, and tools to accelerate your DevOps learning journey.',
      icon: '📚',
      features: ['Expert Tutorials', 'Hands-on Labs', 'Tool Guides'],
      gradient: 'from-soft-gold to-amber',
      link: '/resources'
    },
    {
      title: 'Latest Insights',
      description: 'Stay updated with the latest DevOps trends, tool reviews, and industry best practices from our blog.',
      icon: '💡',
      features: ['Industry Trends', 'Tool Reviews', 'Best Practices'],
      gradient: 'from-gold via-amber to-soft-gold',
      link: '/blog'
    },
    {
      title: 'Get In Touch',
      description: 'Connect for consulting, collaboration, or questions about DevOps implementation and strategy.',
      icon: '🤝',
      features: ['Consulting', 'Collaboration', 'Support'],
      gradient: 'from-amber to-dark-gold',
      link: '/contact'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-rich-black to-deep-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
            Services & Expertise
          </h2>
          <p className="text-lg text-warm-white/70 max-w-3xl mx-auto">
            Comprehensive DevOps solutions and learning resources to transform your development workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link href={service.link} key={index}>
              <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 p-8 rounded-xl hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group cursor-pointer transform hover:-translate-y-2 h-full flex flex-col">
                {/* Icon */}
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                
                {/* Title */}
                <h3 className={`text-2xl font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent mb-4`}>
                  {service.title}
                </h3>
                
                {/* Description */}
                <p className="text-warm-white/70 group-hover:text-warm-white transition-colors mb-6 flex-grow leading-relaxed">
                  {service.description}
                </p>
                
                {/* Features */}
                <div className="mb-6">
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-warm-white/60 group-hover:text-warm-white/80 transition-colors">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full mr-3 group-hover:bg-amber transition-colors"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Call to Action */}
                <div className="inline-flex items-center text-gold font-medium group-hover:text-amber transition-colors mt-auto">
                  Learn More <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-charcoal/40 to-rich-black/60 border border-gold/20 rounded-2xl p-8 md:p-12 text-center backdrop-blur-sm">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
            Ready to Transform Your DevOps Journey?
          </h3>
          <p className="text-lg text-warm-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of engineers who have accelerated their careers with our expert guidance and comprehensive resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog">
              <button className="bg-gradient-gold hover:shadow-xl hover:shadow-gold/50 text-deep-black px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg">
                Start Learning
              </button>
            </Link>
            <Link href="/contact">
              <button className="border-2 border-gold/50 text-gold hover:bg-gold/10 hover:border-gold px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-lg hover:shadow-gold/30">
                Get Consultation
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}