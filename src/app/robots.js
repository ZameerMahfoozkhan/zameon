export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/', '/account/', '/checkout/'],
    },
    sitemap: 'https://example-zameon.com/sitemap.xml',
  }
}
