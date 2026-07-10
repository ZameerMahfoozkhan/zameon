import { getProductById } from '@/lib/products';

export async function generateMetadata({ params }) {
  // Await the params in Next.js 15+ if needed, but for compatibility we handle both cases.
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);
  
  if (!product) {
    return {
      title: 'Product Not Found | ZAMEON',
    };
  }

  return {
    title: `${product.name} | ZAMEON`,
    description: product.description || `Buy ${product.name} at ZAMEON. Discover premium quality.`,
    openGraph: {
      title: `${product.name} | ZAMEON`,
      description: product.description,
      images: [product.image || ''],
    }
  };
}

export default function ProductLayout({ children }) {
  return <>{children}</>;
}
