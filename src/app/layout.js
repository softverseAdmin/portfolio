import "./globals.css";
import { Inter } from 'next/font/google'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import Script from 'next/script'
import { Analytics } from "@vercel/analytics/next"

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
    description: "Expert tutorials, guides, and resources for tech professionals"
  },
  alternates: {
    canonical: "https://www.devopsenginer.com"
  }
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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5338006842623882" crossOrigin="anonymous"></script>
        
        {/* Enhanced Structured Data / Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "DevOps Engineer",
              "alternateName": "DevOpsEnginer",
              "url": "https://www.devopsenginer.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.devopsenginer.com/favicon.ico",
                "width": "512",
                "height": "512"
              },
              "description": "Expert tutorials and resources for DevOps, Cloud Computing, and Cybersecurity professionals. Learn Docker, Kubernetes, AWS, Azure, and security best practices.",
              "sameAs": [],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "url": "https://www.devopsenginer.com/contact",
                "availableLanguage": "English"
              },
              "areaServed": "Worldwide",
              "educationalCredentialAwarded": "Certificate of Completion",
              "teaches": [
                "DevOps Engineering",
                "Cloud Computing",
                "Cybersecurity",
                "Infrastructure as Code",
                "Container Orchestration",
                "CI/CD Pipelines"
              ]
            })
          }}
        />
        
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "DevOps Engineer",
              "url": "https://www.devopsenginer.com",
              "description": "Professional DevOps, Cloud, and Cybersecurity tutorials",
              "inLanguage": "en-US",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.devopsenginer.com/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "DevOps Engineer",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.devopsenginer.com/favicon.ico"
                }
              }
            })
          }}
        />
        
        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://www.devopsenginer.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "DevOps",
                  "item": "https://www.devopsenginer.com/devops"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Cloud",
                  "item": "https://www.devopsenginer.com/cloud"
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": "Cybersecurity",
                  "item": "https://www.devopsenginer.com/cybersecurity"
                },
                {
                  "@type": "ListItem",
                  "position": 5,
                  "name": "Blog",
                  "item": "https://www.devopsenginer.com/blog"
                }
              ]
            })
          }}
        />
      </head>
      <body>
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
