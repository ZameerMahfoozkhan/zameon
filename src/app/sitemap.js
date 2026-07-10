import { getAllProducts } from '@/lib/products';

export default async function sitemap() {
  const baseUrl = 'https://example-zameon.com';

  // Get all dynamic products
  const products = await getAllProducts();
  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Static routes
  const staticRoutes = [
    '',
    '/shop',
    '/about',
    '/contact',
    '/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.7,
  }));

  return [...staticRoutes, ...productUrls];
}
