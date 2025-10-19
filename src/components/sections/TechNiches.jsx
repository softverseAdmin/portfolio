export default function TechNiches() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Choose Your Tech Path
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Dive deep into the most in-demand technology domains.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-50 p-8 rounded-xl">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-2xl font-bold">DO</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">DevOps</h3>
            <p className="text-gray-600">Master CI/CD, Docker, Kubernetes</p>
          </div>
          <div className="bg-green-50 p-8 rounded-xl">
            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-2xl font-bold">CC</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Cloud Computing</h3>
            <p className="text-gray-600">Learn AWS, Azure, and GCP</p>
          </div>
          <div className="bg-red-50 p-8 rounded-xl">
            <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-2xl font-bold">CS</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Cybersecurity</h3>
            <p className="text-gray-600">Security frameworks and testing</p>
          </div>
        </div>
      </div>
    </section>
  )
}
