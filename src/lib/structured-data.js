// Static structured data that won't cause hydration issues
export const structuredData = {
  educational: {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "DevOps Enginer",
    "alternateName": "DevOps Engineer Portfolio",
    "url": "https://www.devopsenginer.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.devopsenginer.com/favicon.ico",
      "width": "512",
      "height": "512"
    },
    "description": "Expert tutorials and resources for DevOps, Cloud Computing, and Cybersecurity professionals. Learn Docker, Kubernetes, AWS, Azure, and security best practices.",
    "sameAs": [
      "https://www.linkedin.com/in/rabin-adhikari-52573320b/",
      "https://www.facebook.com/profile.php?id=61581961413915"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "url": "https://www.devopsenginer.com/contact",
      "email": "softverse4@gmail.com",
      "availableLanguage": "English"
    },
    "areaServed": "Worldwide",
    "educationalCredentialAwarded": "Professional Certification Guidance",
    "teaches": [
      "DevOps Engineering",
      "Cloud Computing",
      "Cybersecurity",
      "Infrastructure as Code",
      "Container Orchestration",
      "CI/CD Pipelines",
      "AWS Solutions Architecture",
      "Azure DevOps",
      "Google Cloud Platform",
      "Kubernetes Administration",
      "Security Engineering"
    ]
  },

  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DevOps Enginer",
    "url": "https://www.devopsenginer.com",
    "description": "Professional DevOps, Cloud, and Cybersecurity tutorials and consultation services",
    "inLanguage": "en-US",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.devopsenginer.com/blog?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DevOps Enginer",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.devopsenginer.com/favicon.ico"
      }
    }
  },

  person: {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Rabin Adhikari",
    "jobTitle": "DevOps Engineer & Cloud Solutions Architect",
    "description": "Experienced DevOps engineer specializing in cloud infrastructure, automation, and cybersecurity. Expert in AWS, Azure, GCP, Kubernetes, and DevSecOps practices.",
    "url": "https://www.devopsenginer.com",
    "image": "https://www.devopsenginer.com/images/profile.jpg",
    "sameAs": [
      "https://www.linkedin.com/in/rabin-adhikari-52573320b/",
      "https://www.facebook.com/profile.php?id=61581961413915"
    ],
    "email": "softverse4@gmail.com",
    "knowsAbout": [
      "DevOps Engineering",
      "Cloud Computing",
      "Cybersecurity",
      "AWS",
      "Azure",
      "Google Cloud Platform",
      "Kubernetes",
      "Docker",
      "Terraform",
      "Ansible",
      "CI/CD",
      "Infrastructure as Code",
      "Security Engineering",
      "Site Reliability Engineering"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "DevOps Enginer",
      "url": "https://www.devopsenginer.com"
    },
    "alumniOf": "Professional DevOps Certification Programs",
    "award": [
      "AWS Certified Solutions Architect Professional",
      "Azure DevOps Engineer Expert",
      "Google Cloud Professional DevOps Engineer",
      "Certified Kubernetes Administrator"
    ]
  },

  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DevOps Enginer",
    "alternateName": "DevOps Engineer Portfolio",
    "url": "https://www.devopsenginer.com",
    "logo": "https://www.devopsenginer.com/favicon.ico",
    "description": "Professional DevOps consulting and educational resources for cloud infrastructure, automation, and cybersecurity.",
    "foundingDate": "2023",
    "founder": {
      "@type": "Person",
      "name": "Rabin Adhikari"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "softverse4@gmail.com",
      "url": "https://www.devopsenginer.com/contact",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://www.linkedin.com/in/rabin-adhikari-52573320b/",
      "https://www.facebook.com/profile.php?id=61581961413915"
    ],
    "areaServed": "Worldwide",
    "serviceType": [
      "DevOps Consulting",
      "Cloud Architecture",
      "Cybersecurity Assessment",
      "Technical Training",
      "Infrastructure Automation"
    ]
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