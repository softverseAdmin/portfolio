export default function Newsletter() {
  return (
    <section className="py-20 px-4 bg-blue-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Stay Ahead of the Tech Curve
        </h2>
        <p className="text-lg text-blue-100 mb-8">
          Get weekly insights and tutorials delivered to your inbox
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg"
          />
          <button className="bg-white hover:bg-gray-50 text-blue-600 px-6 py-3 rounded-lg font-semibold">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  )
}
