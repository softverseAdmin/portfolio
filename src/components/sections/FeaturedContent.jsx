export default function FeaturedContent() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Featured Content
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Our most popular guides and tutorials
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg mb-2">Docker to Kubernetes Guide</h3>
            <p className="text-gray-600 text-sm">Complete migration tutorial</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg mb-2">AWS Cost Optimization</h3>
            <p className="text-gray-600 text-sm">Save 40% on your cloud bill</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg mb-2">Zero Trust Security</h3>
            <p className="text-gray-600 text-sm">Implementation roadmap</p>
          </div>
        </div>
      </div>
    </section>
  )
}
