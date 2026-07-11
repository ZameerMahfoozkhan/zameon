'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { listenToOrder, updateOrderStatus, getUserById } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';
import styles from '../../admin.module.css';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const unsubscribe = listenToOrder(id, async (data) => {
      setOrder(data);
      if (data) {
        setStatus(data.status || 'processing');
        if (data.userId && !customer) {
          try {
            const userData = await getUserById(data.userId);
            setCustomer(userData);
          } catch (err) {
            console.error("Failed to fetch customer", err);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, customer]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await updateOrderStatus(id, status, order.userId);
      setOrder({ ...order, status });
      alert('Order status updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading order details...</div>;
  }

  if (!order) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p>Order not found.</p>
        <Link href="/admin/orders" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Back to Orders</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold' }}>Order Details</h2>
        <Link href="/admin/orders" className="btn btn-outline">Back to Orders</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className={styles.card}>
            <h3 style={{ fontWeight: '600', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--admin-border)', paddingBottom: 'var(--space-2)' }}>Items Ordered</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {(order.items || []).map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--admin-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      {item.image ? (
                        <div style={{ width: '100%', height: '100%', backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--admin-border)' }} />
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: '500' }}>{item.name}</p>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--admin-text-secondary)' }}>Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: '500' }}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--admin-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>Subtotal</span>
                <span>{formatPrice(order.subtotal || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>Shipping</span>
                <span>{formatPrice(order.shipping || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>Tax</span>
                <span>{formatPrice(order.tax || 0)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', color: 'var(--color-success)' }}>
                  <span>Prepaid Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--admin-border)', fontWeight: 'bold' }}>
                <span>Grand Total</span>
                <span>{formatPrice(order.grandTotal || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className={styles.card}>
            <h3 style={{ fontWeight: '600', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--admin-border)', paddingBottom: 'var(--space-2)' }}>Order Info</h3>
            <p style={{ marginBottom: 'var(--space-2)' }}><strong>Order ID:</strong> {order.id}</p>
            <p style={{ marginBottom: 'var(--space-2)' }}><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
            <p style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Payment Method:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Prepaid)'}
            </p>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <h4 style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Customer Details</h4>
              <p style={{ marginBottom: 'var(--space-1)' }}><strong>ID:</strong> {order.userId}</p>
              {customer && (
                <>
                  <p style={{ marginBottom: 'var(--space-1)' }}><strong>Name:</strong> {customer.name || customer.displayName || 'N/A'}</p>
                  <p style={{ marginBottom: 'var(--space-1)' }}><strong>Email:</strong> {customer.email || 'N/A'}</p>
                  <p style={{ marginBottom: 'var(--space-1)' }}><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
                </>
              )}
            </div>
            {order.shippingAddress && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <h4 style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Shipping Address</h4>
                <p style={{ marginBottom: 'var(--space-1)' }}>{order.shippingAddress.street}</p>
                <p style={{ marginBottom: 'var(--space-1)' }}>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                <p style={{ marginBottom: 'var(--space-1)' }}><strong>Phone:</strong> {order.shippingAddress.phone || 'N/A'}</p>
              </div>
            )}
          </div>

          <div className={styles.card} style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontWeight: '600', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--admin-border)' }}>Order Timeline</h3>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles.timelineDotCompleted}`} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>Order Placed</div>
                  <div className={styles.timelineDate}>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Pending'}</div>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${order.shippedAt || order.deliveredAt ? styles.timelineDotCompleted : ''}`} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle} style={{ color: order.shippedAt || order.deliveredAt ? 'inherit' : 'var(--admin-text-secondary)' }}>Order Shipped</div>
                  <div className={styles.timelineDate}>{order.shippedAt ? new Date(order.shippedAt).toLocaleString() : 'Pending'}</div>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${order.deliveredAt ? styles.timelineDotSuccess : ''}`} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle} style={{ color: order.deliveredAt ? 'inherit' : 'var(--admin-text-secondary)' }}>Order Delivered</div>
                  <div className={styles.timelineDate}>{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'Pending'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 style={{ fontWeight: '600', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--admin-border)', paddingBottom: 'var(--space-2)' }}>Update Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <select 
                className="input select" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateStatus} 
                disabled={saving || status === order.status}
              >
                {saving ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
