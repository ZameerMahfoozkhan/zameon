'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserById, getUserOrders } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';
import styles from '../../admin.module.css';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const [userData, userOrders] = await Promise.all([
          getUserById(id),
          getUserOrders(id)
        ]);
        setCustomer(userData);
        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to fetch customer", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return <div>Loading customer details...</div>;
  }

  if (!customer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p>Customer not found.</p>
        <Link href="/admin/customers" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Back to Customers</Link>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold' }}>Customer Profile</h2>
        <Link href="/admin/customers" className="btn btn-outline">Back to Customers</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Order History Table */}
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h3 style={{ fontWeight: '600' }}>Order History</h3>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const itemCount = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '500' }}>{order.id.slice(0, 8)}...</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{itemCount}</td>
                      <td style={{ fontWeight: '500' }}>{formatPrice(order.grandTotal)}</td>
                      <td>
                        <span className={`${styles.badge} ${
                          (order.status || '').toLowerCase() === 'delivered' ? styles.badgeSuccess : 
                          (order.status || '').toLowerCase() === 'cancelled' ? styles.badgeError : 
                          (order.status || '').toLowerCase() === 'processing' ? styles.badgeWarning : styles.badgeNeutral
                        }`}>
                          {order.status || 'Processing'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/admin/orders/${order.id}`} className="btn btn-outline btn-sm">View Details</Link>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>No orders placed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Saved Addresses */}
          <div className={styles.card}>
            <h3 style={{ fontWeight: '600', marginBottom: 'var(--space-4)' }}>Saved Addresses</h3>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                {customer.addresses.map(addr => (
                  <div key={addr.id} style={{ border: '1px solid var(--admin-border)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {addr.label}
                        {addr.isDefault && <span style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>Default</span>}
                      </strong>
                    </div>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>
                      {addr.street}<br/>
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--admin-text-secondary)' }}>No saved addresses.</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Profile Overview */}
          <div className={styles.card}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--admin-border)', paddingBottom: 'var(--space-4)' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '32px', fontWeight: 'bold', marginBottom: 'var(--space-3)' }}>
                {(customer.name || customer.email || 'U')[0].toUpperCase()}
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: 'var(--font-size-lg)' }}>{customer.name || 'No Name'}</h3>
              <p style={{ color: 'var(--admin-text-secondary)' }}>{customer.email}</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--admin-text-secondary)', textTransform: 'uppercase' }}>Phone Number</span>
                <p style={{ fontWeight: '500' }}>{customer.phone || 'Not provided'}</p>
              </div>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--admin-text-secondary)', textTransform: 'uppercase' }}>Customer Since</span>
                <p style={{ fontWeight: '500' }}>{customer.createdAt?.toDate ? new Date(customer.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                <div style={{ background: 'var(--background-secondary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold' }}>{orders.length}</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--admin-text-secondary)' }}>Orders</p>
                </div>
                <div style={{ background: 'var(--background-secondary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', paddingTop: '6px', paddingBottom: '2px' }}>{formatPrice(totalSpent)}</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--admin-text-secondary)' }}>Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
