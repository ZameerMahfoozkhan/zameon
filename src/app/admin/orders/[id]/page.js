'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderById, updateOrderStatus } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';
import styles from '../../admin.module.css';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      try {
        const data = await getOrderById(id);
        setOrder(data);
        if (data) {
          setStatus(data.status || 'processing');
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await updateOrderStatus(id, status);
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
            <p style={{ marginBottom: 'var(--space-2)' }}><strong>Customer ID:</strong> {order.userId}</p>
            <p style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Payment Method:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Prepaid)'}
            </p>
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
