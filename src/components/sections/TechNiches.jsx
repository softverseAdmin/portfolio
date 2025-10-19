export default function TechNiches() {
  const niches = [
    {
      title: 'DevOps',
      description: 'CI/CD, Docker, Kubernetes',
      icon: '⚙️',
      gradient: 'from-gold to-amber'
    },
    {
      title: 'Cloud',
      description: 'AWS, Azure, GCP',
      icon: '☁️',
      gradient: 'from-amber to-soft-gold'
    },
    {
      title: 'Security',
      description: 'Pentesting, Compliance',
      icon: '🔒',
      gradient: 'from-dark-gold to-gold'
    }
  ]

  return (
    <div className="py-20 bg-deep-black text-warm-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
          Choose Your Path
        </h2>
        <p className="text-center text-warm-white/70 mb-12 max-w-2xl mx-auto">
          Explore our comprehensive learning paths designed to elevate your expertise
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {niches.map((niche, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-charcoal/50 to-rich-black border border-gold/20 p-8 rounded-xl hover:border-gold/50 transition-all hover:shadow-2xl hover:shadow-gold/20 group cursor-pointer transform hover:-translate-y-2"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {niche.icon}
              </div>
              <h3 className={`text-2xl font-bold bg-gradient-to-r ${niche.gradient} bg-clip-text text-transparent mb-3`}>
                {niche.title}
              </h3>
              <p className="text-warm-white/70 group-hover:text-warm-white transition-colors">
                {niche.description}
              </p>
              <div className="mt-6 inline-flex items-center text-gold font-medium group-hover:text-amber transition-colors">
                Explore <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
