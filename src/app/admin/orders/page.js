'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import { getAllOrders } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'All Statuses') return true;
    const currentStatus = (order.status || 'processing').toLowerCase();
    return currentStatus === statusFilter.toLowerCase();
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading && orders.length === 0) {
    return <div>Loading orders...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input type="text" className="input" placeholder="Search orders..." style={{ width: '300px' }} />
          <select 
            className="input select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Statuses</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
          </select>
        </div>
        <button className="btn btn-outline" onClick={fetchOrders} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const itemCount = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
              return (
                <tr key={order.id}>
                  <td style={{ fontWeight: '500' }}>{order.id.slice(0, 10)}...</td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{order.userId}</div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{itemCount}</td>
                  <td style={{ fontWeight: '500' }}>{formatPrice(order.grandTotal)}</td>
                  <td>
                    <span className={styles.badge} style={{ background: 'var(--background-secondary)', color: 'var(--text-secondary)' }}>
                      {order.paymentMethod === 'cod' ? 'COD' : 'Prepaid'}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${
                      order.status === 'Delivered' ? styles.badgeSuccess : 
                      order.status === 'Cancelled' ? styles.badgeError : 
                      order.status === 'Processing' ? styles.badgeWarning : styles.badgeNeutral
                    }`}>
                      {order.status || 'Processing'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/orders/${order.id}`} className="btn btn-outline btn-sm">
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
