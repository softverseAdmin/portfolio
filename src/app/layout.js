import "./globals.css";
import Header from '@/components/ui/Header'

export const metadata = {
  title: "TechNiches - Master DevOps, Cloud & Cybersecurity",
  description: "Expert tutorials, guides, and resources for DevOps, Cloud Computing, and Cybersecurity professionals. Start your tech career journey today.",
  keywords: "DevOps, Cloud Computing, Cybersecurity, AWS, Docker, Kubernetes, Security",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="TechNiches - Master DevOps, Cloud & Cybersecurity" />
        <meta property="og:description" content="Expert tutorials, guides, and resources for tech professionals" />
        <meta property="og:type" content="website" />
      </head>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
