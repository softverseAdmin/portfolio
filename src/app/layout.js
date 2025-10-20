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
  metadataBase: new URL('https://www.devopsenginer.com'),
  title: {
    default: "DevOps Engineer - Master DevOps, Cloud & Cybersecurity",
    template: "%s | DevOps Enginer"
  },
  description: "Expert tutorials, guides, and resources for DevOps, Cloud Computing, and Cybersecurity professionals. Learn Docker, Kubernetes, AWS, Azure, penetration testing, and more.",
  keywords: "DevOps, Cloud Computing, Cybersecurity, AWS, Docker, Kubernetes, Security, Azure, GCP, CI/CD, Docker containers, Infrastructure as Code, Penetration testing, DevOps Engineer, DevSecOps, Terraform, Ansible, Jenkins, GitLab, GitHub Actions, Prometheus, Grafana, ELK Stack, Linux, Python, Bash, PowerShell, Monitoring, Observability, Site Reliability Engineering, SRE",
  authors: [{ name: "Rabin Adhikari", url: "https://www.linkedin.com/in/rabin-adhikari-52573320b/" }],
  creator: "Rabin Adhikari",
  publisher: "DevOps Enginer",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "DevOps Engineer - Master DevOps, Cloud & Cybersecurity",
    description: "Expert tutorials, guides, and resources for tech professionals. Learn DevOps best practices, cloud architecture, and cybersecurity fundamentals.",
    type: "website",
    locale: "en_US",
    url: "https://www.devopsenginer.com",
    siteName: "DevOps Enginer",
    images: [
      {
        url: "https://www.devopsenginer.com/images/og-devops-hero.jpg",
        width: 1200,
        height: 630,
        alt: "DevOps Enginer - Expert DevOps, Cloud & Cybersecurity Resources",
        type: "image/jpeg"
      },
      {
        url: "https://www.devopsenginer.com/images/og-fallback.png",
        width: 1200,
        height: 630,
        alt: "DevOps Enginer Portfolio",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "DevOps Engineer - Master DevOps, Cloud & Cybersecurity",
    description: "Expert tutorials, guides and resources for tech professionals. Learn DevOps, Cloud, and Security best practices.",
    creator: "@devopsenginer",
    site: "@devopsenginer",
    images: [
      {
        url: "https://www.devopsenginer.com/images/og-devops-hero.jpg",
        alt: "DevOps Enginer - Expert DevOps Resources"
      }
    ]
  },
  alternates: {
    canonical: "https://www.devopsenginer.com",
    languages: {
      'en-US': 'https://www.devopsenginer.com',
    }
  },
  category: 'technology',
  classification: 'Education',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#d4af37' },
    ]
  },
  verification: {
    google: 'google11d554c204b2b981',
    other: {
      'msvalidate.01': 'your-bing-verification-code',
    }
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="google11d554c204b2b981" />
        <meta name="theme-color" content="#0a0a0a" />
        
        {/* Open Graph Meta Tags for Social Media */}
        <meta property="og:title" content="DevOps Engineer - Master DevOps, Cloud & Cybersecurity" />
        <meta property="og:description" content="Expert tutorials, guides, and resources for tech professionals. Learn DevOps best practices, cloud architecture, and cybersecurity fundamentals." />
        <meta property="og:image" content="https://www.devopsenginer.com/images/og-devops-hero.jpg" />
        <meta property="og:image:alt" content="DevOps Enginer - Expert DevOps, Cloud & Cybersecurity Resources" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:url" content="https://www.devopsenginer.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DevOps Enginer" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@devopsenginer" />
        <meta name="twitter:creator" content="@devopsenginer" />
        <meta name="twitter:title" content="DevOps Engineer - Master DevOps, Cloud & Cybersecurity" />
        <meta name="twitter:description" content="Expert tutorials, guides and resources for tech professionals. Learn DevOps, Cloud, and Security best practices." />
        <meta name="twitter:image" content="https://www.devopsenginer.com/images/og-devops-hero.jpg" />
        <meta name="twitter:image:alt" content="DevOps Enginer - Expert DevOps Resources" />
        
        {/* LinkedIn Meta Tags */}
        <meta property="linkedin:owner" content="Rabin Adhikari" />
        
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
            __html: JSON.stringify(structuredData.person)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.organization)
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
