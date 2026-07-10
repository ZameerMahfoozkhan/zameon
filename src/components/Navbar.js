'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart, useWishlist, useStore } from '@/lib/store';
import { useAuth } from '@/lib/AuthContext';
import styles from './Navbar.module.css';

const categories = [
  { name: 'Audio', href: '/shop?category=audio', desc: 'Headphones, Speakers, Earbuds' },
  { name: 'Wearables', href: '/shop?category=wearables', desc: 'Smartwatches, Fitness Trackers' },
  { name: 'Workspace', href: '/shop?category=workspace', desc: 'Monitors, Keyboards, Stands' },
  { name: 'Accessories', href: '/shop?category=accessories', desc: 'Chargers, Cables, Power Banks' },
  { name: 'Lifestyle', href: '/shop?category=lifestyle', desc: 'Bags, Travel, Everyday Carry' },
  { name: 'Home', href: '/shop?category=home', desc: 'Lighting, Smart Home, Decor' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, toggleCart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { dispatch } = useStore();
  const { user, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const megaRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* Announcement Bar */}
      <div className={styles.announcement}>
        <div className={styles.announcementInner}>
          <span>Free shipping on orders over ₹8000</span>
          <span className={styles.announcementDot}>·</span>
          <span>New arrivals every week</span>
          <span className={styles.announcementDot}>·</span>
          <span>30-day hassle-free returns</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`} id="main-nav">
        <div className={styles.navInner}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="ZAMEON Home">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="6" fill="currentColor"/>
              <path d="M8 10H24L12 22H24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className={styles.logoText}>ZAMEON</span>
          </Link>

          {/* Desktop Links */}
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <div
              className={styles.navDropdown}
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
              ref={megaRef}
            >
              <button className={styles.navLink} aria-expanded={megaOpen}>
                Shop
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              {megaOpen && (
                <div className={styles.megaMenu}>
                  <div className={styles.megaInner}>
                    <div className={styles.megaCategories}>
                      <p className={styles.megaHeading}>Categories</p>
                      {categories.map((cat) => (
                        <Link key={cat.name} href={cat.href} className={styles.megaItem} onClick={() => setMegaOpen(false)}>
                          <span className={styles.megaItemName}>{cat.name}</span>
                          <span className={styles.megaItemDesc}>{cat.desc}</span>
                        </Link>
                      ))}
                    </div>
                    <div className={styles.megaFeatured}>
                      <p className={styles.megaHeading}>Featured</p>
                      <Link href="/shop" className={styles.megaFeaturedCard} onClick={() => setMegaOpen(false)}>
                        <div className={styles.megaFeaturedImg}>
                          <span>New Arrivals</span>
                        </div>
                        <span className={styles.megaFeaturedLabel}>Explore the latest →</span>
                      </Link>
                      <Link href="/shop?collection=Signature+Series" className={styles.megaFeaturedCard} onClick={() => setMegaOpen(false)}>
                        <div className={styles.megaFeaturedImg}>
                          <span>Signature Series</span>
                        </div>
                        <span className={styles.megaFeaturedLabel}>Our premium line →</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/contact" className={styles.navLink}>Contact</Link>
            <Link href="/faq" className={styles.navLink}>FAQ</Link>
          </div>

          {/* Actions */}
          <div className={styles.navActions}>
            <button
              className={styles.navAction}
              onClick={() => dispatch({ type: 'SET_SEARCH_OPEN', payload: true })}
              aria-label="Search"
              id="search-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </button>
            <Link href="/wishlist" className={styles.navAction} aria-label="Wishlist" id="wishlist-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              {wishlistItems.length > 0 && (
                <span className={styles.navBadge}>{wishlistItems.length}</span>
              )}
            </Link>
            <button className={styles.navAction} onClick={toggleCart} aria-label="Cart" id="cart-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {count > 0 && (
                <span className={styles.navBadge}>{count}</span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div 
                className={styles.userDropdown}
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
                style={{ position: 'relative' }}
              >
                <Link href="/account" className={styles.navAction} aria-label="Account">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </Link>
                {userMenuOpen && (
                  <div className={styles.userMenu} style={{ position: 'absolute', top: '100%', right: '0', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', minWidth: '150px', boxShadow: 'var(--shadow-md)', zIndex: 10 }}>
                    <div style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)', borderBottom: '1px solid var(--border)', marginBottom: 'var(--space-2)' }}>
                      <strong>{user.displayName || 'User'}</strong>
                    </div>
                    <Link href="/account" style={{ display: 'block', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--text)' }} onClick={() => setUserMenuOpen(false)}>My Account</Link>
                    <Link href="/account?tab=orders" style={{ display: 'block', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--text)' }} onClick={() => setUserMenuOpen(false)}>Orders</Link>
                    <button onClick={() => { signOut(); setUserMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-error)', cursor: 'pointer' }}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className={styles.navAction} aria-label="Sign In">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              id="mobile-menu-toggle"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)}>
          <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileLinks}>
              <Link href="/" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Home</Link>
              <Link href="/shop" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Shop All</Link>
              {categories.map((cat) => (
                <Link key={cat.name} href={cat.href} className={styles.mobileLinkSub} onClick={() => setMobileOpen(false)}>
                  {cat.name}
                </Link>
              ))}
              <Link href="/about" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>About</Link>
              <Link href="/contact" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Contact</Link>
              <Link href="/faq" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>FAQ</Link>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: 'calc(var(--nav-height) + var(--announcement-height))' }} />
    </>
  );
}
