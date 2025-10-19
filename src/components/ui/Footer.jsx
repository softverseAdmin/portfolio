'use client'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Blog', href: '/blog' },
    ],
    resources: [
      { name: 'DevOps', href: '/devops' },
      { name: 'Cloud', href: '/cloud' },
      { name: 'Cybersecurity', href: '/cybersecurity' },
      { name: 'Resources', href: '/resources' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Disclaimer', href: '/disclaimer' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Sitemap', href: '/sitemap.xml' },
    ],
  }

  return (
    <footer className="bg-rich-black border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center mb-4 group">
              <div className="h-12 w-12 bg-gradient-gold rounded-lg flex items-center justify-center shadow-lg shadow-gold/30 group-hover:shadow-gold/50 transition-all">
                <span className="text-deep-black font-bold text-xl">DE</span>
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gold via-amber to-soft-gold bg-clip-text text-transparent">
                DevOps Engineer
              </span>
            </Link>
            <p className="text-warm-white/70 text-sm leading-relaxed">
              Empowering engineers with expert knowledge in DevOps, Cloud Computing, and Cybersecurity.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4 border-b border-gold/30 pb-2">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-warm-white/70 hover:text-gold text-sm transition-colors flex items-center group"
                  >
                    <span className="w-0 h-px bg-gold group-hover:w-4 mr-0 group-hover:mr-2 transition-all"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4 border-b border-gold/30 pb-2">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-warm-white/70 hover:text-gold text-sm transition-colors flex items-center group"
                  >
                    <span className="w-0 h-px bg-gold group-hover:w-4 mr-0 group-hover:mr-2 transition-all"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-gold font-semibold text-sm uppercase tracking-wider mb-4 border-b border-gold/30 pb-2">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-warm-white/70 hover:text-gold text-sm transition-colors flex items-center group"
                    target={link.name === 'Sitemap' ? '_blank' : undefined}
                    rel={link.name === 'Sitemap' ? 'noopener noreferrer' : undefined}
                  >
                    <span className="w-0 h-px bg-gold group-hover:w-4 mr-0 group-hover:mr-2 transition-all"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gold/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-warm-white/60 text-sm">
              © {currentYear} DevOps Engineer. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-warm-white/60 hover:text-gold text-xs transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-warm-white/60 hover:text-gold text-xs transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="text-warm-white/60 hover:text-gold text-xs transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gold/10">
          <p className="text-warm-white/50 text-xs text-center leading-relaxed">
            DevOps Engineer is a comprehensive educational platform dedicated to providing high-quality tutorials, 
            guides, and resources for DevOps engineers, cloud architects, and cybersecurity professionals worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}
