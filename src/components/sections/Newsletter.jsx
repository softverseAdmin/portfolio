export default function Newsletter() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Stay Ahead in DevOps & Cloud
        </h2>
        <p className="text-lg text-blue-100 mb-8">
          Get weekly DevOps insights, cloud architecture patterns, and security best practices delivered to your inbox. Join 10,000+ engineers!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors">
            Subscribe Free
          </button>
        </div>
        <p className="text-xs text-blue-200 mt-4">
          No spam. Unsubscribe anytime. 100% focused on DevOps engineering.
        </p>
      </div>
    </section>
  )
}
