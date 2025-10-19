import AdSense from '@/components/ads/AdSense'

export default function FeaturedContent() {
  const articles = [
    {
      title: "Complete Docker to Kubernetes Migration Guide",
      excerpt: "Step-by-step migration with zero downtime deployment strategies",
      category: "DevOps",
      readTime: "12 min read"
    },
    {
      title: "AWS Cost Optimization: Save 40% on Your Cloud Bill",
      excerpt: "Proven techniques to reduce AWS costs without sacrificing performance",
      category: "Cloud",
      readTime: "8 min read"
    },
    {
      title: "Zero Trust Security Implementation Roadmap",
      excerpt: "Enterprise-grade security architecture for modern DevOps teams",
      category: "Security",
      readTime: "15 min read"
    }
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-charcoal to-rich-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
            Featured Content
          </h2>
          <p className="text-lg text-warm-white/70 max-w-2xl mx-auto">
            Expert-level tutorials and guides to accelerate your DevOps journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <div key={index} className="bg-gradient-to-br from-rich-black to-deep-black border border-gold/20 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-gold/20 transition-all group hover:border-gold/50 transform hover:-translate-y-1">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-xs font-semibold rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-warm-white group-hover:text-gold transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-warm-white/70 text-sm mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-warm-white/50">{article.readTime}</span>
                    <button className="text-gold text-sm font-semibold hover:text-amber transition-colors flex items-center gap-1">
                      Read More <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar with Ads */}
          <div className="lg:col-span-1 space-y-6">
            {/* AdSense Sidebar Ad */}
            <div className="sticky top-4">
              <AdSense 
                adSlot="2345678901"
                adFormat="vertical"
                className="mb-6"
              />
              
              {/* Popular Topics */}
              <div className="bg-gradient-to-br from-rich-black to-charcoal border border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all">
                <h3 className="font-bold text-gold mb-4 border-b border-gold/30 pb-2">Popular Topics</h3>
                <ul className="space-y-3">
                  {['Docker Containers', 'Kubernetes Orchestration', 'AWS CloudFormation', 'CI/CD Pipelines', 'Infrastructure as Code'].map((topic) => (
                    <li key={topic} className="text-warm-white/70 hover:text-gold cursor-pointer text-sm transition-colors flex items-center group">
                      <span className="w-0 h-px bg-gold group-hover:w-3 mr-0 group-hover:mr-2 transition-all"></span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Another Ad Slot */}
              <AdSense 
                adSlot="3456789012"
                adFormat="rectangle"
                className="mt-6"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
