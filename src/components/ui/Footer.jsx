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
      { name: 'Sitemap', href: '/sitemap.xml' },
    ],
  }

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">DE</span>
              </div>
              <span className="ml-3 text-xl font-bold text-slate-100">DevOps Engineer</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering engineers with expert knowledge in DevOps, Cloud Computing, and Cybersecurity.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-slate-100 font-semibold text-sm uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-slate-100 font-semibold text-sm uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-slate-100 font-semibold text-sm uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 text-sm transition-colors"
                    target={link.name === 'Sitemap' ? '_blank' : undefined}
                    rel={link.name === 'Sitemap' ? 'noopener noreferrer' : undefined}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">
              © {currentYear} DevOps Engineer. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-slate-500 hover:text-blue-400 text-xs transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-slate-500 hover:text-blue-400 text-xs transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="text-slate-500 hover:text-blue-400 text-xs transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-slate-600 text-xs text-center">
            DevOps Engineer is a comprehensive educational platform dedicated to providing high-quality tutorials, 
            guides, and resources for DevOps engineers, cloud architects, and cybersecurity professionals worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}
