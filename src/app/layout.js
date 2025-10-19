import "./globals.css";
import Header from '@/components/ui/Header'
import Script from 'next/script'

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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="google-site-verification" content="google11d554c204b2b981" />
        <meta name="theme-color" content="#0F172A" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://www.devopsenginer.com" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5338006842623882" crossOrigin="anonymous"></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "DevOps Engineer",
              "url": "https://www.devopsenginer.com",
              "description": "Expert tutorials and resources for DevOps, Cloud Computing, and Cybersecurity",
              "sameAs": [],
              "logo": "https://www.devopsenginer.com/favicon.ico"
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
      </body>
    </html>
  );
}
