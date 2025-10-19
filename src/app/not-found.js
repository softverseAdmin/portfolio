'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NotFound() {
  const pathname = usePathname()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8 relative">
          <h1 className="text-9xl md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🔍</div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-slate-400 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          {pathname && (
            <p className="text-sm text-slate-500 font-mono bg-slate-900/50 inline-block px-4 py-2 rounded-lg border border-slate-700/50">
              {pathname}
            </p>
          )}
        </div>

        {/* Suggestions */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-semibold text-slate-200 mb-4">
            Here are some helpful links instead:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/"
              className="bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              🏠 Home
            </Link>
            <Link
              href="/devops"
              className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-200 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              🚀 DevOps
            </Link>
            <Link
              href="/cloud"
              className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-200 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              ☁️ Cloud
            </Link>
            <Link
              href="/blog"
              className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-200 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              📝 Blog
            </Link>
          </div>
        </div>

        {/* Search or Contact */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <p className="text-slate-400">
            Can't find what you're looking for?
          </p>
          <Link
            href="/contact"
            className="text-blue-400 hover:text-blue-300 font-semibold underline transition-colors"
          >
            Contact Us →
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t border-slate-700/50">
          <p className="text-slate-500 text-sm">
            If you believe this is an error, please{' '}
            <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
              report it to us
            </Link>{' '}
            so we can fix it.
          </p>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
    </main>
  )
}
