export default function Newsletter() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-charcoal via-rich-black to-deep-black relative overflow-hidden">
      {/* Elegant background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="border border-gold/30 rounded-2xl p-12 bg-rich-black/50 backdrop-blur-sm shadow-2xl shadow-gold/10">
          <div className="inline-block px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm font-medium mb-6">
            Newsletter
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
            Stay Ahead in DevOps & Cloud
          </h2>
          <p className="text-lg text-warm-white/70 mb-8 leading-relaxed">
            Get weekly DevOps insights, cloud architecture patterns, and security best practices delivered to your inbox. 
            <span className="text-gold font-semibold"> Join 10,000+ engineers!</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3.5 rounded-lg bg-charcoal/80 border border-gold/30 text-warm-white placeholder-warm-white/50 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all"
            />
            <button className="bg-gradient-gold hover:shadow-xl hover:shadow-gold/50 text-deep-black px-8 py-3.5 rounded-lg font-bold transition-all transform hover:scale-105 whitespace-nowrap">
              Subscribe Free
            </button>
          </div>
          
          <p className="text-xs text-warm-white/50 mt-6 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-gold rounded-full"></span>
            No spam. Unsubscribe anytime. 100% focused on DevOps engineering.
          </p>
        </div>
      </div>
    </section>
  )
}
