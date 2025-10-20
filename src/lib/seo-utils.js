export function generateBlogMetadata(post) {
  const ogImageUrl = post.image ? 
    `https://www.devopsenginer.com${post.image}` : 
    `https://www.devopsenginer.com/images/blog/${post.slug}/${post.slug.includes('devops') ? 'devops-hero.jpg' : 
      post.slug.includes('cloud') ? 'cloud-hero.jpg' : 
      post.slug.includes('security') ? 'devsecops-hero.jpg' : 'hero.jpg'}`;

  return {
    title: `${post.title} | DevOps Enginer`,
    description: post.excerpt,
    keywords: post.tags?.join(', ') || 'DevOps, Cloud, Cybersecurity',
    authors: [{ name: 'Rabin Adhikari', url: 'https://www.linkedin.com/in/rabin-adhikari-52573320b/' }],
    creator: 'Rabin Adhikari',
    publisher: 'DevOps Enginer',
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
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.lastModified || post.date,
      authors: ['Rabin Adhikari'],
      tags: post.tags || [],
      url: `https://www.devopsenginer.com/blog/${post.slug}`,
      siteName: 'DevOps Enginer',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/jpeg'
        },
        {
          url: 'https://www.devopsenginer.com/images/og-devops-hero.jpg',
          width: 1200,
          height: 630,
          alt: 'DevOps Enginer - Expert Resources',
          type: 'image/jpeg'
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      creator: '@devopsenginer',
      site: '@devopsenginer',
      images: [
        {
          url: ogImageUrl,
          alt: post.title
        }
      ],
    },
    alternates: {
      canonical: `https://www.devopsenginer.com/blog/${post.slug}`,
    },
    category: post.category || 'Technology',
    other: {
      // Additional meta tags for better social media support
      'og:image:secure_url': ogImageUrl,
      'twitter:image:src': ogImageUrl,
      'linkedin:owner': 'Rabin Adhikari'
    }
  };
}

export function generateBlogStructuredData(post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image || `/images/blog/${post.slug}/hero.jpg`,
    "author": {
      "@type": "Person",
      "name": "Rabin Adhikari",
      "url": "https://www.linkedin.com/in/rabin-adhikari-52573320b/"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DevOps Enginer",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.devopsenginer.com/favicon.ico"
      }
    },
    "datePublished": post.date,
    "dateModified": post.lastModified || post.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.devopsenginer.com/blog/${post.slug}`
    },
    "keywords": post.tags?.join(', ') || 'DevOps, Cloud, Cybersecurity',
    "articleSection": post.category || 'Technology',
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "wordCount": post.content?.split(' ').length || 2000,
    "timeRequired": `PT${Math.ceil((post.content?.split(' ').length || 2000) / 200)}M`,
    "educationalLevel": "Intermediate",
    "learningResourceType": "Tutorial",
    "teaches": post.tags || ['DevOps', 'Cloud Computing', 'Cybersecurity']
  };
}

export function generatePageStructuredData(page) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.title,
    "description": page.description,
    "url": `https://www.devopsenginer.com${page.path}`,
    "inLanguage": "en-US",
    "isPartOf": {
      "@type": "WebSite",
      "name": "DevOps Enginer",
      "url": "https://www.devopsenginer.com"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": page.breadcrumbs?.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": `https://www.devopsenginer.com${crumb.path}`
      })) || []
    },
    "mainEntity": {
      "@type": "Course",
      "name": page.title,
      "description": page.description,
      "provider": {
        "@type": "Organization",
        "name": "DevOps Enginer",
        "url": "https://www.devopsenginer.com"
      }
    }
  };
}