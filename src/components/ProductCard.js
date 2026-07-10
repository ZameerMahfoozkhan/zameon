'use client';
import Link from 'next/link';
import { useCart, useWishlist } from '@/lib/store';
import { formatPrice } from '@/lib/products';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { isWished, toggle: toggleWishlist } = useWishlist();
  const wished = isWished(product.id);

  const badgeClass = {
    'Best Seller': styles.badgeBestSeller,
    'New': styles.badgeNew,
    'Sale': styles.badgeSale,
    'Popular': styles.badgePopular,
  };

  return (
    <article className={styles.card} style={{ animationDelay: `${index * 80}ms` }}>
      <Link href={`/product/${product.id}`} className={styles.imageLink}>
        <div className={styles.imageWrap}>
          <div className={styles.image}>
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className={styles.imageLabel}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.3}}>
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                Product Image
              </span>
            )}
          </div>

          {/* Badge */}
          {product.badge && (
            <span className={`${styles.badge} ${badgeClass[product.badge] || ''}`}>
              {product.badge}
            </span>
          )}

          {/* Wishlist */}
          <button
            className={`${styles.wishBtn} ${wished ? styles.wishBtnActive : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>

          {/* Quick Add */}
          <button
            className={styles.quickAdd}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
          >
            Add to Cart
          </button>
        </div>
      </Link>

      <div className={styles.info}>
        <p className={styles.brand}>{product.brand}</p>
        <Link href={`/product/${product.id}`}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        <div className={styles.rating}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24"
                fill={i < Math.round(product.rating) ? '#F59E0B' : 'none'}
                stroke={i < Math.round(product.rating) ? '#F59E0B' : '#D1D5DB'}
                strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
          </div>
          <span className={styles.reviewCount}>({product.reviewCount})</span>
        </div>
      </div>
    </article>
  );
}
