import { blogPosts } from './blog/posts';

export default function sitemap() {
  const baseUrl = 'https://www.devopsenginer.com';

  // Freshness hygiene: <lastmod> must say when the CONTENT last changed,
  // not when the site last deployed. (Previously every URL was stamped
  // with the build time, which teaches crawlers to ignore the field.)
  // - Blog posts already carry their own publish/updated dates.
  // - The homepage and /blog index change whenever a post ships, so they
  //   take the newest post date.
  // - The remaining static pages use the date their content last changed
  //   (from git history); update the date when a page is substantively
  //   edited, the same discipline as a post's lastModified.
  const latestPostDate = blogPosts.reduce(
    (latest, post) => {
      const d = post.lastModified || post.publishDate;
      return d && d > latest ? d : latest;
    },
    '2026-01-01'
  );

  const staticPages = [
    {
      url: baseUrl,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/devops`,
      lastModified: '2026-11-04',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cloud`,
      lastModified: '2026-11-03',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cybersecurity`,
      lastModified: '2026-11-03',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/roadmaps`,
      lastModified: '2026-11-04',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-job-hunting`,
      lastModified: '2026-03-09',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/devops-production-pack`,
      lastModified: '2026-10-31',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: '2026-11-03',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: '2026-11-03',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: latestPostDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: '2026-10-12',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: '2025-10-20',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: '2026-11-03',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: '2025-10-20',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: '2025-10-20',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: '2025-10-20',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: '2025-10-20',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Use each post's real publish/modified date when available
  const dynamicBlogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.lastModified || post.publishDate || latestPostDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticPages, ...dynamicBlogPages];
}
