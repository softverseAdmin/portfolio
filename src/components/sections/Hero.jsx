import AdSense from '@/components/ads/AdSense'

export default function Hero() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-4">
              Welcome to DevOps Engineer
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-100 mb-6 leading-tight">
            Master Modern 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 block mt-2">
              DevOps & Cloud
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Accelerate your career with expert-level knowledge in <span className="text-blue-400 font-semibold">DevOps Engineering</span>, 
            <span className="text-green-400 font-semibold"> Cloud Architecture</span>, and 
            <span className="text-red-400 font-semibold"> Security Best Practices</span>. 
            From beginner tutorials to advanced enterprise solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
              Start Learning
            </button>
            <button className="border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
              Explore Tools
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30 group">
              <div className="text-3xl font-bold text-blue-400 mb-2 group-hover:text-blue-300 transition-colors">500+</div>
              <div className="text-slate-400 group-hover:text-slate-300 transition-colors">DevOps Tutorials</div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all hover:border-green-500/30 group">
              <div className="text-3xl font-bold text-green-400 mb-2 group-hover:text-green-300 transition-colors">300+</div>
              <div className="text-slate-400 group-hover:text-slate-300 transition-colors">Cloud Solutions</div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all hover:border-red-500/30 group">
              <div className="text-3xl font-bold text-red-400 mb-2 group-hover:text-red-300 transition-colors">250+</div>
              <div className="text-slate-400 group-hover:text-slate-300 transition-colors">Security Guides</div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-700/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
      </section>
      
      {/* Strategic Ad Placement - Top Banner */}
      <div className="bg-slate-900 py-8">
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
