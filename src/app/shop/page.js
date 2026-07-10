import { Suspense } from 'react';
import ShopContent from './ShopContent';

export const metadata = {
  title: 'Shop All Products | ZAMEON',
  description: 'Browse our complete collection of premium tech gadgets, audio devices, smart home accessories, and modern lifestyle products.',
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
