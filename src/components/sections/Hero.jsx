import AdSense from '@/components/ads/AdSense'

export default function Hero() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-deep-black via-rich-black to-charcoal py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm font-medium mb-4 shadow-lg shadow-gold/20">
              Welcome to DevOps Engineer
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-warm-white mb-6 leading-tight">
            Master Modern 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber to-soft-gold block mt-2 animate-pulse">
              DevOps & Cloud
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-warm-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            Accelerate your career with expert-level knowledge in <span className="text-gold font-semibold">DevOps Engineering</span>, 
            <span className="text-amber font-semibold"> Cloud Architecture</span>, and 
            <span className="text-soft-gold font-semibold"> Security Best Practices</span>. 
            From beginner tutorials to advanced enterprise solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="bg-gradient-gold hover:shadow-xl hover:shadow-gold/50 text-deep-black px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg">
              Start Learning
            </button>
            <button className="border-2 border-gold/50 text-gold hover:bg-gold/10 hover:border-gold px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-lg hover:shadow-gold/30">
              Explore Tools
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-charcoal/80 to-rich-black/80 backdrop-blur-sm border border-gold/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-gold/20 transition-all hover:border-gold/50 group">
              <div className="text-3xl font-bold bg-gradient-to-r from-gold to-amber bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">500+</div>
              <div className="text-warm-white/70 group-hover:text-warm-white transition-colors">DevOps Tutorials</div>
            </div>
            <div className="bg-gradient-to-br from-charcoal/80 to-rich-black/80 backdrop-blur-sm border border-gold/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-gold/20 transition-all hover:border-gold/50 group">
              <div className="text-3xl font-bold bg-gradient-to-r from-amber to-soft-gold bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">300+</div>
              <div className="text-warm-white/70 group-hover:text-warm-white transition-colors">Cloud Solutions</div>
            </div>
            <div className="bg-gradient-to-br from-charcoal/80 to-rich-black/80 backdrop-blur-sm border border-gold/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-gold/20 transition-all hover:border-gold/50 group">
              <div className="text-3xl font-bold bg-gradient-to-r from-gold to-dark-gold bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">250+</div>
              <div className="text-warm-white/70 group-hover:text-warm-white transition-colors">Security Guides</div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/3 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
      </section>
      
      {/* Strategic Ad Placement - Top Banner with elegant styling */}
      <div className="bg-rich-black py-8 border-y border-gold/10">
        <div className="max-w-4xl mx-auto px-4">
          <AdSense 
            adSlot="1234567890"
            adFormat="horizontal"
            className="text-center"
          />
        </div>
      </div>
    </>
  )
}
