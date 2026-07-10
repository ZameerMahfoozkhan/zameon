'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts, getCategories, formatPrice } from '@/lib/products';
import styles from './page.module.css';

const reviews = [
  { name: 'Alex Chen', role: 'Audio Engineer', text: 'The Zen Pro headphones deliver studio-quality sound in the most comfortable form factor I\'ve ever worn. Game-changer for long sessions.', rating: 5 },
  { name: 'Sarah Mitchell', role: 'Product Designer', text: 'Every detail of the Muse keyboard feels intentional. The typing experience is addictive and the build quality is unreal.', rating: 5 },
  { name: 'David Park', role: 'Software Engineer', text: 'The Clarity monitor is the best work investment I\'ve made. Colors are incredible, and USB-C with power delivery simplifies my entire setup.', rating: 5 },
  { name: 'Emma Rodriguez', role: 'Content Creator', text: 'ZAMEON understands what premium actually means. These aren\'t just products—they\'re tools that inspire you to create.', rating: 5 },
  { name: 'James Wright', role: 'Architect', text: 'The Nova laptop stand elevated my desk setup from functional to stunning. The cable management alone is worth it.', rating: 5 },
];

export default function HomePage() {
  const revealRefs = useRef([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getFeaturedProducts(8).then(setProducts);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <>
      {/* ======================== HERO ======================== */}
      <section className={styles.hero} id="hero-section">
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <p className={styles.heroOverline}>The Future of Premium Tech</p>
            <h1 className={styles.heroTitle}>
              Products designed for <span className={styles.heroAccent}>how you live</span>
            </h1>
            <p className={styles.heroDesc}>
              Handpicked gadgets, audio, and workspace essentials from the world's best brands — curated for quality, design, and performance.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/shop" className="btn btn-primary btn-lg">
                Shop Collection
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/about" className="btn btn-outline btn-lg">Our Story</Link>
            </div>
            <div className={styles.heroTrust}>
              <div className={styles.trustItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                Free Shipping
              </div>
              <div className={styles.trustItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                2-Year Warranty
              </div>
              <div className={styles.trustItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                30-Day Returns
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
          </div>
        </div>
      </section>


      {/* ======================== TRENDING PRODUCTS ======================== */}
      <section className={styles.section} id="trending-section">
        <div className="container reveal" ref={addRevealRef}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.overline}>Trending</p>
              <h2 className={styles.sectionTitle}>Popular Right Now</h2>
            </div>
            <Link href="/shop" className="btn btn-outline">
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          </div>
          <div className={styles.productGrid}>
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ======================== WHY ZAMEON ======================== */}
      <section className={styles.whySection} id="why-section">
        <div className="container reveal" ref={addRevealRef}>
          <div className={styles.sectionHeader} style={{ textAlign: 'center' }}>
            <p className={styles.overline}>Why Choose Us</p>
            <h2 className={styles.sectionTitle}>The ZAMEON Difference</h2>
          </div>
          <div className={styles.whyGrid}>
            {[
              { icon: '🚀', title: 'Free Express Shipping', desc: 'Complimentary 2-day delivery on all orders over ₹8000. Because waiting is overrated.' },
              { icon: '🛡️', title: 'Secure Checkout', desc: '256-bit SSL encryption with PCI DSS compliance. Your data is always protected.' },
              { icon: '↩️', title: '30-Day Easy Returns', desc: 'Not satisfied? Return any product within 30 days for a full refund, no questions asked.' },
              { icon: '🏆', title: '2-Year Warranty', desc: 'Every product backed by our comprehensive warranty. We stand behind what we sell.' },
            ].map((item, i) => (
              <div key={i} className={`${styles.whyCard} reveal reveal-delay-${i + 1}`} ref={addRevealRef}>
                <span className={styles.whyIcon}>{item.icon}</span>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== COLLECTIONS ======================== */}
      <section className={styles.section} id="collections-section">
        <div className="container reveal" ref={addRevealRef}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.overline}>Curated</p>
              <h2 className={styles.sectionTitle}>Featured Collections</h2>
            </div>
          </div>
          <div className={styles.collectionGrid}>
            {[
              { name: 'Signature Series', desc: 'Our flagship products. Uncompromising quality meets timeless design.', tag: '4 Products' },
              { name: 'Studio Collection', desc: 'Everything you need to build the perfect creative workspace.', tag: '5 Products' },
              { name: 'Essentials', desc: 'The everyday carry. Power, connectivity, and protection on the go.', tag: '2 Products' },
            ].map((col, i) => (
              <Link key={i} href={`/shop?collection=${encodeURIComponent(col.name)}`} className={`${styles.collectionCard} reveal reveal-delay-${i + 1}`} ref={addRevealRef}>
                <div className={styles.collectionImage}>
                  <span className={styles.placeholderLabel}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.25}}>
                      <rect width="18" height="18" x="3" y="3" rx="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                    Collection Banner
                  </span>
                </div>
                <div className={styles.collectionOverlay}>
                  <span className={styles.collectionTag}>{col.tag}</span>
                  <h3 className={styles.collectionName}>{col.name}</h3>
                  <p className={styles.collectionDesc}>{col.desc}</p>
                  <span className={styles.collectionLink}>Explore Collection →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== BRAND STORY ======================== */}
      <section className={styles.storySection} id="brand-story-section">
        <div className="container">
          <div className={`${styles.storyInner} reveal`} ref={addRevealRef}>
            <div className={styles.storyImage}>
              <div className={styles.storyPlaceholder}>
                <span className={styles.placeholderLabel}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.25}}>
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  Brand Story Image
                </span>
              </div>
            </div>
            <div className={styles.storyContent}>
              <p className={styles.overline}>Our Story</p>
              <h2 className={styles.sectionTitle}>Born from a belief that technology should be beautiful</h2>
              <p className={styles.storyText}>
                ZAMEON started with a simple question: why is it so hard to find quality tech products in India? We set out to change that — curating the finest technology from around the world and bringing it to your doorstep.
              </p>
              <p className={styles.storyText}>
                Every product we stock is researched, tested, and handpicked by our team. We partner with trusted brands so you never have to compromise on quality or worry about authenticity.
              </p>
              <Link href="/about" className="btn btn-outline">
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== REVIEWS ======================== */}
      <section className={styles.section} id="reviews-section">
        <div className="container reveal" ref={addRevealRef}>
          <div className={styles.sectionHeader} style={{ textAlign: 'center' }}>
            <p className={styles.overline}>Testimonials</p>
            <h2 className={styles.sectionTitle}>Loved by Creators & Professionals</h2>
          </div>
          <div className={styles.reviewScroll}>
            {reviews.map((review, i) => (
              <div key={i} className={styles.reviewCard}>
                <div className={styles.reviewStars}>
                  {[...Array(review.rating)].map((_, j) => (
                    <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p className={styles.reviewText}>&ldquo;{review.text}&rdquo;</p>
                <div className={styles.reviewAuthor}>
                  <div className={styles.reviewAvatar}>{review.name[0]}</div>
                  <div>
                    <p className={styles.reviewName}>{review.name}</p>
                    <p className={styles.reviewRole}>{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== NEWSLETTER ======================== */}
      <section className={styles.newsletterSection} id="newsletter-section">
        <div className="container">
          <div className={`${styles.newsletterInner} reveal`} ref={addRevealRef}>
            <div className={styles.newsletterContent}>
              <p className={styles.overline}>Stay in the Loop</p>
              <h2 className={styles.sectionTitle}>Get early access to new drops</h2>
              <p className={styles.newsletterDesc}>
                Join 25,000+ subscribers who get first access to new products, exclusive deals, and design stories. No spam — just the good stuff.
              </p>
              <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  className={styles.newsletterInput}
                  placeholder="Enter your email"
                  aria-label="Email address"
                  id="newsletter-email"
                />
                <button type="submit" className="btn btn-primary">Subscribe</button>
              </form>
              <p className={styles.newsletterNote}>By subscribing, you agree to our Privacy Policy.</p>
            </div>
            <div className={styles.newsletterImage}>
              <div className={styles.newsletterPlaceholder}>
                <span className={styles.placeholderLabel}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.25}}>
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  Newsletter Illustration
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
