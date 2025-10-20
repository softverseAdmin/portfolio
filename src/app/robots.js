export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/admin/', '/.env', '/package.json', '/node_modules/'],
    },
    sitemap: 'https://www.devopsenginer.com/sitemap.xml',
    host: 'https://www.devopsenginer.com'
  };
}