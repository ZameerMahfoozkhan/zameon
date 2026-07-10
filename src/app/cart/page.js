'use client';
import Link from 'next/link';
import { useCart } from '@/lib/store';
import { formatPrice } from '@/lib/products';
import styles from './cart.module.css';

export default function CartPage() {
  const { items, total, count, removeFromCart, updateQuantity, clearCart } = useCart();

  const shipping = total > 8000 ? 0 : 800;
  const tax = total * 0.18;
  const grandTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.15 }}>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h1 className={styles.emptyTitle}>Your cart is empty</h1>
        <p className={styles.emptyDesc}>Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link href="/shop" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Shopping Cart <span className={styles.count}>({count} items)</span></h1>
        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            <div className={styles.itemsHeader}>
              <span>Product</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>
            {items.map((item) => (
              <div key={`${item.id}-${item.variant}`} className={styles.item}>
                <div className={styles.itemProduct}>
                  <div className={styles.itemImage}><span>IMG</span></div>
                  <div className={styles.itemInfo}>
                    <Link href={`/product/${item.id}`} className={styles.itemName}>{item.name}</Link>
                    <p className={styles.itemVariant}>{item.variant !== 'default' ? item.variant : item.brand}</p>
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                  </div>
                </div>
                <div className={styles.itemQty}>
                  <div className={styles.qtySelector}>
                    <button onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}>+</button>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.id, item.variant)}>Remove</button>
                </div>
                <p className={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping === 0 ? <span style={{ color: 'var(--color-success)' }}>Free</span> : formatPrice(shipping)}</span>
              </div>
              <div className={styles.summaryRow}><span>Est. Tax</span><span>{formatPrice(tax)}</span></div>
            </div>
            <div className={styles.promoRow}>
              <input type="text" className="input" placeholder="Promo code" />
              <button className="btn btn-outline">Apply</button>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
            <Link href="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Proceed to Checkout
            </Link>
            <Link href="/shop" className={styles.continueLink}>← Continue Shopping</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
