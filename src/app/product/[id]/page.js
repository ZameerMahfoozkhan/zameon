'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProductById, getRelatedProducts, formatPrice } from '@/lib/products';
import { useCart, useWishlist, useStore } from '@/lib/store';
import styles from './product.module.css';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isWished, toggle: toggleWishlist } = useWishlist();
  const { dispatch } = useStore();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (!params?.id) return;
    
    const id = decodeURIComponent(params.id);
    
    Promise.all([
      getProductById(id),
      getRelatedProducts(id)
    ]).then(([fetchedProduct, fetchedRelated]) => {
      setProduct(fetchedProduct);
      setRelated(fetchedProduct ? fetchedRelated : []);
      setLoading(false);
      
      if (fetchedProduct) {
        dispatch({ type: 'ADD_RECENTLY_VIEWED', payload: fetchedProduct.id });
        if (fetchedProduct.variants?.color?.length) setSelectedColor(fetchedProduct.variants.color[0]);
        if (fetchedProduct.variants?.size?.length) setSelectedSize(fetchedProduct.variants.size[0]);
      }
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [params?.id, dispatch]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Product not found</h1>
        <Link href="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const wished = isWished(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    const variant = [selectedColor, selectedSize].filter(Boolean).join(' / ') || 'default';
    addToCart(product, variant, quantity);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on ZAMEON — ${formatPrice(product.price)}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      // User cancelled or error
    }
  };

  const faqItems = [
    { q: 'What\'s included in the box?', a: `Your ${product.name}, USB-C charging cable, quick start guide, and warranty card.` },
    { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days across India. Express shipping delivers in 1-2 business days.' },
    { q: 'What is your return policy?', a: 'We offer a 30-day no-questions-asked return policy. Items must be in original condition.' },
    { q: 'Is this product covered by warranty?', a: 'Yes, all products sold on ZAMEON come with a minimum 2-year warranty from the original brand.' },
  ];

  return (
    <div className={styles.page}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <div className="container">
          <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
            <Link href="/">Home</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            <Link href="/shop">Shop</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            <Link href={`/shop?category=${(product.category || 'misc').toLowerCase()}`}>{product.category || 'Misc'}</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            <span>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className={styles.productSection}>
        <div className="container">
          <div className={styles.productGrid}>
            {/* Gallery */}
            <div className={styles.gallery}>
              <div className={styles.mainImage}>
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', display: 'block' }} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span className={styles.placeholderLabel}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.25}}>
                        <rect width="18" height="18" x="3" y="3" rx="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                      Product Image {selectedImage + 1} of {Math.max(1, Number(product.images) || 1)}
                    </span>
                  </div>
                )}
                {product.badge && (
                  <span className={`badge ${product.badge === 'Sale' ? 'badge-sale' : product.badge === 'New' ? 'badge-new' : 'badge-best-seller'} ${styles.galleryBadge}`}>
                    {product.badge}
                  </span>
                )}
              </div>
              <div className={styles.thumbnails}>
                {[...Array(Math.max(1, Number(product.images) || 1))].map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.thumbnail} ${selectedImage === i ? styles.thumbnailActive : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <span>{i + 1}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Purchase Panel */}
            <div className={styles.purchasePanel}>
              <div className={styles.purchaseInner}>
                <p className={styles.productBrand}>{product.brand}</p>
                <h1 className={styles.productName}>{product.name}</h1>

                {/* Rating */}
                <div className={styles.ratingRow}>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} width="16" height="16" viewBox="0 0 24 24"
                        fill={i < Math.round(product.rating) ? '#F59E0B' : 'none'}
                        stroke={i < Math.round(product.rating) ? '#F59E0B' : '#D1D5DB'} strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <span className={styles.ratingText}>{product.rating} ({product.reviewCount} reviews)</span>
                </div>

                {/* Price */}
                <div className={styles.priceBlock}>
                  <span className={styles.price}>{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <>
                      <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
                      <span className={styles.discount}>-{discount}%</span>
                    </>
                  )}
                </div>

                <p className={styles.productDesc}>{product.description}</p>

                {/* Variants */}
                {Array.isArray(product.variants?.color) && product.variants.color.length > 0 && (
                  <div className={styles.variantGroup}>
                    <label className={styles.variantLabel}>Color: <strong>{selectedColor}</strong></label>
                    <div className={styles.variantOptions}>
                      {product.variants.color.map((color) => (
                        <button
                          key={color}
                          className={`${styles.variantBtn} ${selectedColor === color ? styles.variantBtnActive : ''}`}
                          onClick={() => setSelectedColor(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(product.variants?.size) && product.variants.size.length > 0 && (
                  <div className={styles.variantGroup}>
                    <label className={styles.variantLabel}>Size: <strong>{selectedSize}</strong></label>
                    <div className={styles.variantOptions}>
                      {product.variants.size.map((size) => (
                        <button
                          key={size}
                          className={`${styles.variantBtn} ${selectedSize === size ? styles.variantBtnActive : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className={styles.variantGroup}>
                  <label className={styles.variantLabel}>Quantity</label>
                  <div className={styles.qtySelector}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                  <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart}>
                    Add to Cart — {formatPrice(product.price * quantity)}
                  </button>
                  <button
                    className={`btn btn-outline btn-icon ${styles.wishlistBtn} ${wished ? styles.wishlistBtnActive : ''}`}
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                    style={{ width: 48, height: 48 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </button>
                  <button
                    className={`btn btn-outline btn-icon ${styles.shareBtn}`}
                    onClick={handleShare}
                    aria-label="Share this product"
                    style={{ width: 48, height: 48 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>
                </div>

                {/* Trust */}
                <div className={styles.trustBadges}>
                  <div className={styles.trustBadge}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Secure Checkout
                  </div>
                  {product.freeShipping && (
                    <div className={styles.trustBadge}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                      Free Shipping
                    </div>
                  )}
                  <div className={styles.trustBadge}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    30-Day Returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className={styles.tabsSection}>
        <div className="container">
          <div className={styles.tabBar}>
            {[
              { key: 'description', label: 'Description' },
              { key: 'specs', label: 'Specifications' },
              { key: 'reviews', label: `Reviews (${product.reviewCount})` },
              { key: 'faq', label: 'FAQ' },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.descContent}>
                <p>{product.description}</p>
                <h3>Key Features</h3>
                <ul className={styles.featureList}>
                  {Array.isArray(product.features) && product.features.map((f, i) => (
                    <li key={i}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className={styles.specsContent}>
                <table className={styles.specsTable}>
                  <tbody>
                    {typeof product.specs === 'object' && product.specs !== null && Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key}>
                        <td className={styles.specKey}>{key}</td>
                        <td className={styles.specValue}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className={styles.reviewsContent}>
                <div className={styles.reviewsSummary}>
                  <div className={styles.reviewsScore}>
                    <span className={styles.reviewsBig}>{product.rating}</span>
                    <div className={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < Math.round(product.rating) ? '#F59E0B' : 'none'} stroke={i < Math.round(product.rating) ? '#F59E0B' : '#D1D5DB'} strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                    </div>
                    <span className={styles.reviewsTotal}>Based on {product.reviewCount} reviews</span>
                  </div>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Review content would be loaded from the backend.
                </p>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className={styles.faqContent}>
                {faqItems.map((item, i) => (
                  <div key={i} className={styles.faqItem}>
                    <button
                      className={`${styles.faqQuestion} ${openFaq === i ? styles.faqQuestionOpen : ''}`}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      {item.q}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </button>
                    {openFaq === i && (
                      <div className={styles.faqAnswer}>
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="container">
            <h2 className={styles.relatedTitle}>You Might Also Like</h2>
            <div className={styles.relatedGrid}>
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
