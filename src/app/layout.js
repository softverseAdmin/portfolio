import "./globals.css";
import { Inter } from 'next/font/google'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import Script from 'next/script'
import { Analytics } from "@vercel/analytics/next"
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { structuredData } from '@/lib/structured-data'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: "DevOps Engineer - Master DevOps, Cloud & Cybersecurity",
  description: "Expert tutorials, guides, and resources for DevOps, Cloud Computing, and Cybersecurity professionals. Learn Docker, Kubernetes, AWS, Azure, penetration testing, and more.",
  keywords: "DevOps, Cloud Computing, Cybersecurity, AWS, Docker, Kubernetes, Security, Azure, GCP, CI/CD, Docker containers, Infrastructure as Code, Penetration testing, DevOps Engineer",
  authors: [{ name: "DevOps Engineer" }],
  creator: "DevOps Engineer",
  publisher: "DevOps Engineer",
  robots: "index, follow",
  openGraph: {
    title: "DevOps Engineer - Master DevOps, Cloud & Cybersecurity",
    description: "Expert tutorials, guides, and resources for tech professionals",
    type: "website",
    locale: "en_US",
    url: "https://www.devopsenginer.com",
    siteName: "DevOps Engineer"
  },
  twitter: {
    card: "summary_large_image",
    title: "DevOps Engineer - Master DevOps, Cloud & Cybersecurity",
    description: "Expert tutorials, guide and resources for tech professionals"
  },
  alternates: {
    canonical: "https://www.devopsenginer.com"
  },

};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="google11d554c204b2b981" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="canonical" href="https://www.devopsenginer.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        
        {/* Server-side structured data for optimal SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.educational)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.website)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.breadcrumb)
          }}
        />
      </head>
      <body>
        <GoogleAnalytics />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5338006842623882"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Header />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
