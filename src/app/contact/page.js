import Link from 'next/link';

export const metadata = {
  title: 'Contact DevOps Engineer - Expert Consultation | DevOps Enginer',
  description: 'Get expert DevOps consultation, cloud architecture guidance, and cybersecurity advice. Contact professional DevOps engineer for project consultation and technical support.',
  keywords: 'devops consultation, cloud architect, cybersecurity expert, devops engineer contact, technical consultation, devops services, cloud migration, infrastructure automation',
  openGraph: {
    title: 'Contact DevOps Engineer - Expert Consultation | DevOps Enginer',
    description: 'Get expert DevOps consultation, cloud architecture guidance, and cybersecurity advice. Contact professional DevOps engineer for project consultation and technical support.',
    type: 'website',
  }
};

const consultationServices = [
  {
    title: "DevOps Implementation",
    description: "End-to-end DevOps transformation including CI/CD pipeline setup, infrastructure automation, and team process optimization.",
    icon: "⚙️",
    color: "from-blue-500 to-cyan-500",
    features: [
      "CI/CD Pipeline Design & Implementation",
      "Infrastructure as Code (Terraform, Ansible)",
      "Container Orchestration (Kubernetes, Docker)",
      "Monitoring & Observability Setup",
      "Team Training & Best Practices"
    ],
    duration: "2-12 weeks",
    pricing: "Starting from $150/hour"
  },
  {
    title: "Cloud Architecture",
    description: "Design scalable, secure, and cost-effective cloud solutions across AWS, Azure, and GCP platforms.",
    icon: "☁️",
    color: "from-purple-500 to-blue-500",
    features: [
      "Multi-Cloud Strategy & Migration",
      "Serverless Architecture Design",
      "Microservices Implementation",
      "Cost Optimization & Right-sizing",
      "High Availability & Disaster Recovery"
    ],
    duration: "1-8 weeks",
    pricing: "Starting from $200/hour"
  },
  {
    title: "Cybersecurity Consulting",
    description: "Comprehensive security assessment, compliance implementation, and DevSecOps integration for your infrastructure.",
    icon: "🔒",
    color: "from-red-500 to-orange-500",
    features: [
      "Security Assessment & Penetration Testing",
      "Compliance Implementation (SOC2, PCI DSS)",
      "DevSecOps Pipeline Integration",
      "Incident Response Planning",
      "Security Training & Awareness"
    ],
    duration: "1-6 weeks",
    pricing: "Starting from $180/hour"
  },
  {
    title: "Technical Mentoring",
    description: "One-on-one mentoring for engineers looking to advance their DevOps, cloud, or security skills.",
    icon: "🎓",
    color: "from-green-500 to-teal-500",
    features: [
      "Personalized Learning Path",
      "Hands-on Project Guidance",
      "Certification Preparation",
      "Career Development Advice",
      "Technical Interview Preparation"
    ],
    duration: "Ongoing",
    pricing: "Starting from $100/hour"
  }
];

const contactMethods = [
  {
    type: "Email",
    value: "softverse4@gmail.com",
    icon: "📧",
    description: "Best for detailed project discussions and documentation sharing",
    availability: "24/7 - Response within 24 hours"
  },
  {
    type: "LinkedIn",
    value: "linkedin.com/in/rabin-adhikari-52573320b",
    icon: "💼",
    description: "Professional networking and quick consultation inquiries",
    availability: "Business hours - Response within 4 hours"
  },
  {
    type: "Facebook",
    value: "facebook.com/profile.php?id=61581961413915",
    icon: "📘",
    description: "Social media updates and community discussions",
    availability: "Daily - Response within 12 hours"
  }
];

const testimonials = [
  {
    name: "Hiroshi Tanaka",
    role: "CTO, Tokyo Tech Startup",
    company: "InnovateTech KK",
    message: "DevOps Enginer transformed our deployment process from manual releases to fully automated CI/CD. Our deployment frequency increased 10x while reducing errors to near zero.",
    rating: 5,
    project: "Complete DevOps Transformation"
  },
  {
    name: "Sarah Chen",
    role: "Infrastructure Manager",
    company: "Global Finance Corp",
    message: "The cloud migration strategy was perfectly executed. We reduced infrastructure costs by 40% while improving performance and security posture significantly.",
    rating: 5,
    project: "AWS Cloud Migration"
  },
  {
    name: "Michael Schmidt",
    role: "Security Lead",
    company: "HealthTech Solutions",
    message: "Outstanding cybersecurity consultation. Helped us achieve SOC2 compliance and implement comprehensive DevSecOps practices. Highly professional and knowledgeable.",
    rating: 5,
    project: "Security & Compliance Implementation"
  }
];

const faqs = [
  {
    question: "What types of projects do you typically work on?",
    answer: "I specialize in DevOps transformations, cloud migrations (AWS/Azure/GCP), cybersecurity implementations, and technical mentoring. Projects range from small startups to enterprise-level implementations."
  },
  {
    question: "Do you work with international clients?",
    answer: "Yes, I work with clients globally. Based in Japan, I'm particularly experienced with APAC markets but serve clients worldwide across different time zones."
  },
  {
    question: "What's included in the free consultation?",
    answer: "The 30-minute consultation includes project scope discussion, technical requirements assessment, timeline estimation, and customized recommendations for your specific needs."
  },
  {
    question: "Do you provide ongoing support after project completion?",
    answer: "Yes, I offer various support packages including monitoring, maintenance, training, and continuous optimization services to ensure long-term success."
  },
  {
    question: "What's your experience with different cloud platforms?",
    answer: "I have extensive experience with AWS (8+ years), Azure (5+ years), and GCP (4+ years), including advanced certifications and real-world enterprise implementations."
  },
  {
    question: "Can you help with team training and knowledge transfer?",
    answer: "Absolutely! Knowledge transfer and team enablement are core parts of my consulting approach. I provide comprehensive training, documentation, and mentoring to ensure your team can maintain and evolve the solutions."
  }
];

function ServiceCard({ service }) {
  return (
    <div className="bg-gradient-to-br from-charcoal/60 to-rich-black border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all">
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-4">{service.icon}</span>
        <h3 className={`text-xl font-bold bg-gradient-to-r ${service.color} bg-clip-text text-transparent`}>
          {service.title}
        </h3>
      </div>
      
      <p className="text-warm-white/70 mb-4">{service.description}</p>
      
      <div className="mb-4">
        <h4 className="font-semibold text-warm-white mb-2">Key Features:</h4>
        <ul className="space-y-1">
          {service.features.map((feature, index) => (
            <li key={index} className="text-warm-white/80 text-sm flex items-center">
              <span className="w-2 h-2 bg-gold rounded-full mr-2 flex-shrink-0"></span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-charcoal/40">
        <div>
          <p className="text-warm-white/60 text-sm">Duration: {service.duration}</p>
          <p className="text-gold font-semibold text-sm">{service.pricing}</p>
        </div>
        <button className="bg-gradient-to-r from-gold to-yellow-500 text-rich-black px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-gold/25 transition-all">
          Get Quote
        </button>
      </div>
    </div>
  );
}

function ContactMethodCard({ method }) {
  return (
    <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-blue-500/20 rounded-lg p-6 hover:border-blue-500/40 transition-all">
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-3">{method.icon}</span>
        <h3 className="text-lg font-bold text-blue-400">{method.type}</h3>
      </div>
      
      <p className="text-warm-white font-mono text-sm mb-3 bg-charcoal/40 p-2 rounded">
        {method.value}
      </p>
      
      <p className="text-warm-white/70 text-sm mb-3">{method.description}</p>
      
      <p className="text-blue-300 text-xs">{method.availability}</p>
    </div>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-gradient-to-br from-charcoal/40 to-rich-black border border-green-500/20 rounded-lg p-6">
      <div className="flex items-center mb-3">
        <div className="flex text-yellow-400 mb-2">
          {[...Array(testimonial.rating)].map((_, i) => (
            <span key={i}>⭐</span>
          ))}
        </div>
        <span className="ml-2 text-green-400 text-sm">{testimonial.project}</span>
      </div>
      
      <p className="text-warm-white/80 italic mb-4">"{testimonial.message}"</p>
      
      <div className="border-t border-charcoal/40 pt-3">
        <p className="font-semibold text-warm-white">{testimonial.name}</p>
        <p className="text-warm-white/60 text-sm">{testimonial.role}</p>
        <p className="text-green-400 text-sm">{testimonial.company}</p>
      </div>
    </div>
  );
}

function FAQItem({ faq, index }) {
  return (
    <div className="border border-charcoal/40 rounded-lg p-4 hover:border-gold/30 transition-all">
      <h3 className="font-semibold text-warm-white mb-2">{faq.question}</h3>
      <p className="text-warm-white/70 text-sm">{faq.answer}</p>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rich-black via-charcoal to-rich-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-charcoal via-rich-black to-charcoal">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-blue-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-blue-400 to-green-500 mb-8">
              Let's Build Something Amazing
            </h1>
            <p className="text-xl text-warm-white/80 max-w-3xl mx-auto leading-relaxed mb-8">
              Ready to transform your infrastructure, optimize your cloud architecture, or enhance your security posture? 
              Let's discuss how we can accelerate your technical goals together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:softverse4@gmail.com"
                className="bg-gradient-to-r from-gold to-yellow-500 text-rich-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-gold/25 transition-all"
              >
                Start Conversation
              </a>
              <a
                href="#consultation"
                className="border border-gold text-gold px-8 py-3 rounded-lg font-semibold hover:bg-gold/10 transition-all"
              >
                Free Consultation
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Services */}
      <div id="consultation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Consultation Services</h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            Comprehensive technical consulting services to help you achieve your infrastructure and security goals.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {consultationServices.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>
      </div>

      {/* Contact Methods */}
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-400 mb-4">Get In Touch</h2>
            <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
              Choose your preferred method of communication. I'm here to help with your technical challenges.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contactMethods.map((method, index) => (
              <ContactMethodCard key={index} method={method} />
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-green-400 mb-4">Client Success Stories</h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            Hear from clients who have transformed their infrastructure and accelerated their business goals.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>

      {/* Process Overview */}
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-purple-400 mb-4">How We Work Together</h2>
            <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
              A structured approach to ensure successful project delivery and knowledge transfer.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="bg-purple-400/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-400 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Discovery Call</h3>
              <p className="text-warm-white/70 text-sm">Free 30-minute consultation to understand your needs, challenges, and goals.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-400/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-400 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Proposal & Planning</h3>
              <p className="text-warm-white/70 text-sm">Detailed project scope, timeline, and deliverables with transparent pricing.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-400/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-400 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Implementation</h3>
              <p className="text-warm-white/70 text-sm">Agile delivery with regular check-ins, progress updates, and iterative feedback.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-400/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-400 font-bold text-xl">4</span>
              </div>
              <h3 className="font-semibold text-warm-white mb-2">Knowledge Transfer</h3>
              <p className="text-warm-white/70 text-sm">Comprehensive documentation, training, and ongoing support options.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            Common questions about consulting services, processes, and technical expertise.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>
      </div>

      {/* Technical Expertise Highlight */}
      <div className="bg-gradient-to-br from-charcoal/40 to-rich-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gold/10 to-blue-500/5 border border-gold/20 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gold mb-4">Technical Expertise</h2>
              <p className="text-warm-white/80 max-w-2xl mx-auto">
                8+ years of experience delivering enterprise-grade solutions across multiple industries and technologies.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              {[
                "AWS Solutions Architect Professional",
                "Azure DevOps Engineer Expert",
                "Google Cloud Professional",
                "Certified Kubernetes Administrator",
                "HashiCorp Terraform Associate",
                "CISSP Security Professional",
                "Linux Foundation Certified",
                "Docker Certified Associate"
              ].map((cert, index) => (
                <div key={index} className="bg-charcoal/40 border border-gold/20 rounded-lg p-3 text-center">
                  <span className="text-warm-white/90 text-sm font-medium">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-charcoal via-rich-black to-charcoal py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-blue-400 to-green-500 mb-6">
            Ready to Transform Your Infrastructure?
          </h2>
          <p className="text-lg text-warm-white/80 mb-8 leading-relaxed">
            Whether you're looking to modernize legacy systems, migrate to the cloud, or implement DevSecOps practices, 
            I'm here to guide you through every step of the journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:softverse4@gmail.com?subject=Project Consultation Request"
              className="bg-gradient-to-r from-gold to-yellow-500 text-rich-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-gold/25 transition-all"
            >
              Send Project Details
            </a>
            <Link
              href="/resources"
              className="border border-gold text-gold px-8 py-3 rounded-lg font-semibold hover:bg-gold/10 transition-all"
            >
              Explore Resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}