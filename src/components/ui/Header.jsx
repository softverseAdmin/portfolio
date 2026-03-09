'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'DevOps', href: '/devops' },
    { name: 'Cloud', href: '/cloud' },
    { name: 'Cybersecurity', href: '/cybersecurity' },
    { name: 'Blog', href: '/blog' },
    { name: 'Resources', href: '/resources' },
    { name: 'About', href: '/about' },
    { name: '🤖 AI Job Hunt', href: '/ai-job-hunting', badge: 'NEW', special: true },
  ]

  return (
    <header className="bg-rich-black/95 backdrop-blur-md shadow-lg border-b border-gold/20 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="h-10 w-10 bg-gradient-gold rounded-lg flex items-center justify-center shadow-lg shadow-gold/30 group-hover:shadow-gold/50 transition-all">
                <span className="text-deep-black font-bold text-lg">DE</span>
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
                DevOps Engineer
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) =>
              item.special ? (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative flex items-center gap-1.5 bg-gradient-to-r from-violet-600/20 to-purple-600/20 hover:from-violet-600/40 hover:to-purple-600/40 border border-violet-500/50 hover:border-violet-400 text-violet-300 hover:text-violet-200 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 hover:shadow-md hover:shadow-violet-500/20"
                >
                  {item.name}
                  <span className="bg-violet-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none animate-pulse">
                    {item.badge}
                  </span>
                </Link>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-warm-white/80 hover:text-gold px-3 py-2 text-sm font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-gold group-hover:w-full transition-all duration-300"></span>
                </Link>
              )
            )}
            <Link
              href="/contact"
              className="bg-gradient-gold hover:shadow-lg hover:shadow-gold/50 text-deep-black px-6 py-2.5 rounded-lg text-sm font-semibold transition-all transform hover:scale-105"
            >
              Contact
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-warm-white hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold p-2 rounded-lg"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-charcoal/50 backdrop-blur-md border-t border-gold/20 rounded-b-lg">
              {navigation.map((item) =>
                item.special ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-between bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/40 text-violet-300 hover:text-violet-200 hover:border-violet-400 block px-3 py-2.5 rounded-lg text-base font-semibold transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{item.name}</span>
                    <span className="bg-violet-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">{item.badge}</span>
                  </Link>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-warm-white/80 hover:text-gold hover:bg-gold/10 block px-3 py-2 rounded-lg text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              )}
              <Link
                href="/contact"
                className="bg-gradient-gold hover:shadow-lg hover:shadow-gold/50 text-deep-black block px-3 py-2.5 rounded-lg text-base font-semibold mt-4 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
