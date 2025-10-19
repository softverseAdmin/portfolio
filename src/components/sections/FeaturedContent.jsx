export default function FeaturedContent() {
  return (
    <section className="py-20 px-4 bg-slate-800">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
          Featured Content
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
          Our most popular guides and tutorials
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-700/50 border border-slate-600/50 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all">
            <h3 className="font-bold text-lg mb-2 text-slate-100">Docker to Kubernetes Guide</h3>
            <p className="text-slate-400 text-sm">Complete migration tutorial</p>
          </div>
          <div className="bg-slate-700/50 border border-slate-600/50 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all">
            <h3 className="font-bold text-lg mb-2 text-slate-100">AWS Cost Optimization</h3>
            <p className="text-slate-400 text-sm">Save 40% on your cloud bill</p>
          </div>
          <div className="bg-slate-700/50 border border-slate-600/50 p-6 rounded-lg shadow-sm hover:shadow-lg transition-all">
            <h3 className="font-bold text-lg mb-2 text-slate-100">Zero Trust Security</h3>
            <p className="text-slate-400 text-sm">Implementation roadmap</p>
          </div>
        </div>
      </div>
    </section>
  )
}
