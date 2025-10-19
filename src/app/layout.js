import "./globals.css";
import Header from '@/components/ui/Header'

export const metadata = {
  title: "TechNiches - Master DevOps, Cloud & Cybersecurity",
  description: "Expert tutorials, guides, and resources for DevOps, Cloud Computing, and Cybersecurity professionals. Learn Docker, Kubernetes, AWS, Azure, penetration testing, and more.",
  keywords: "DevOps, Cloud Computing, Cybersecurity, AWS, Docker, Kubernetes, Security, Azure, GCP, CI/CD, Docker containers, Infrastructure as Code, Penetration testing",
  authors: [{ name: "TechNiches" }],
  creator: "TechNiches",
  publisher: "TechNiches",
  robots: "index, follow",
  openGraph: {
    title: "TechNiches - Master DevOps, Cloud & Cybersecurity",
    description: "Expert tutorials, guides, and resources for tech professionals",
    type: "website",
    locale: "en_US",
    siteName: "TechNiches"
  },
  twitter: {
    card: "summary_large_image",
    title: "TechNiches - Master DevOps, Cloud & Cybersecurity",
    description: "Expert tutorials, guides, and resources for tech professionals"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "TechNiches",
              "url": "https://portfolio-mts9qxpk8-softverseadmins-projects.vercel.app",
              "description": "Expert tutorials and resources for DevOps, Cloud Computing, and Cybersecurity",
              "sameAs": []
            })
          }}
        />
      </head>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
