'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import { getAllOrders, deleteAllOrders, deleteOrder } from '@/lib/firestore';
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

  const handleDeleteAll = async () => {
    if (confirm('Are you sure you want to delete ALL orders? This action cannot be undone.')) {
      setLoading(true);
      try {
        await deleteAllOrders();
        setOrders([]);
      } catch (err) {
        console.error(err);
        alert('Failed to delete orders.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (orderId) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
        setOrders(orders.filter(o => o.id !== orderId));
      } catch (err) {
        console.error(err);
        alert('Failed to delete order.');
      }
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
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-outline" onClick={fetchOrders} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Orders'}
          </button>
          <button className="btn btn-primary" style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={handleDeleteAll} disabled={loading || orders.length === 0}>
            Delete All Orders
          </button>
        </div>
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
                    <div style={{ fontWeight: '500' }}>{order.customerName || order.userId}</div>
                    {order.customerEmail && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.customerEmail}</div>}
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
                      (order.status || '').toLowerCase() === 'delivered' ? styles.badgeSuccess : 
                      (order.status || '').toLowerCase() === 'cancelled' ? styles.badgeError : 
                      (order.status || '').toLowerCase() === 'processing' ? styles.badgeWarning : styles.badgeNeutral
                    }`}>
                      {order.status || 'Processing'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/orders/${order.id}`} className="btn btn-outline btn-sm">
                      View Details
                    </Link>
                    <button onClick={() => handleDelete(order.id)} className="btn btn-sm" style={{ backgroundColor: 'transparent', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
                      Delete
                    </button>
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
