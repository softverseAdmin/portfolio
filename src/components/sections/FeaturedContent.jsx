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
    <section className="py-20 px-4 bg-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Featured Content
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Expert-level tutorials and guides to accelerate your DevOps journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <div key={index} className="bg-slate-700/50 border border-slate-600/50 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all group hover:border-blue-500/30">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-slate-100 group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{article.readTime}</span>
                    <button className="text-blue-400 text-sm font-semibold hover:text-blue-300 transition-colors">
                      Read More →
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
              <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-6">
                <h3 className="font-bold text-slate-100 mb-4">Popular Topics</h3>
                <ul className="space-y-2">
                  {['Docker Containers', 'Kubernetes Orchestration', 'AWS CloudFormation', 'CI/CD Pipelines', 'Infrastructure as Code'].map((topic) => (
                    <li key={topic} className="text-slate-400 hover:text-blue-400 cursor-pointer text-sm transition-colors">
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
