'use client';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/lib/store';
import { getProductById } from '@/lib/products';
import { useState, useEffect } from 'react';
import styles from './wishlist.module.css';

export default function WishlistPage() {
  const { items } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items && items.length > 0) {
      Promise.all(items.map(getProductById))
        .then(results => {
          setProducts(results.filter(Boolean));
          setLoading(false);
        });
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [items]);

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Wishlist {products.length > 0 && <span className={styles.count}>({products.length})</span>}</h1>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading wishlist...</div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.15 }}>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            <p className={styles.emptyText}>Your wishlist is empty</p>
            <Link href="/shop" className="btn btn-primary">Discover Products</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
