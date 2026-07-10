'use client';
import { useCart } from '@/lib/store';
import { formatPrice } from '@/lib/products';
import Link from 'next/link';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, total, count, isOpen, setCartOpen, removeFromCart, updateQuantity } = useCart();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setCartOpen(false)} id="cart-drawer">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Cart
            {count > 0 && <span className={styles.count}>{count}</span>}
          </h2>
          <button className={styles.close} onClick={() => setCartOpen(false)} aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.2}}>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
              <path d="M3 6h18"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <p>Your cart is empty</p>
            <button className="btn btn-primary" onClick={() => setCartOpen(false)}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => (
                <div key={`${item.id}-${item.variant}`} className={styles.item}>
                  <div className={styles.itemImage}>
                    <span>IMG</span>
                  </div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemVariant}>{item.variant !== 'default' ? item.variant : item.brand}</p>
                    <div className={styles.itemActions}>
                      <div className={styles.qty}>
                        <button onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)} aria-label="Decrease">−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)} aria-label="Increase">+</button>
                      </div>
                      <button className={styles.removeBtn} onClick={() => removeFromCart(item.id, item.variant)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <div className={styles.subtotal}>
                <span>Subtotal</span>
                <span className={styles.subtotalPrice}>{formatPrice(total)}</span>
              </div>
              <p className={styles.shippingNote}>Shipping & taxes calculated at checkout</p>
              <Link href="/checkout" className={`btn btn-primary btn-lg ${styles.checkoutBtn}`} onClick={() => setCartOpen(false)}>
                Checkout — {formatPrice(total)}
              </Link>
              <Link href="/cart" className={styles.viewCart} onClick={() => setCartOpen(false)}>
                View Cart →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
