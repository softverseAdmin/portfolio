// Static structured data that won't cause hydration issues
export const structuredData = {
  educational: {
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
  },

  website: {
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
  },

  breadcrumb: {
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
  }
};