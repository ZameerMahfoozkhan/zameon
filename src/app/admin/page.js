'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';
import { getAllOrders, getAllCustomers } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedOrders, fetchedCustomers] = await Promise.all([
        getAllOrders(),
        getAllCustomers(),
      ]);
      setOrders(fetchedOrders);
      setCustomers(fetchedCustomers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered').length;

  // Compute top selling
  const productSales = {};
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      if (!productSales[item.id]) {
        productSales[item.id] = { name: item.name, sales: 0 };
      }
      productSales[item.id].sales += item.quantity;
    });
  });
  
  const topSelling = Object.values(productSales)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), change: '', isPositive: true },
    { label: 'Active Orders', value: activeOrdersCount, change: '', isPositive: true },
    { label: 'Total Customers', value: customers.length, change: '', isPositive: true },
    { label: 'Total Orders', value: orders.length, change: '', isPositive: true },
  ];

  if (loading && orders.length === 0) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Header & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold' }}>Dashboard Overview</h2>
        <button 
          onClick={fetchData} 
          disabled={loading} 
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? styles.spin : ''}>
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Details'}
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-6)' }}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.card}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--admin-text-secondary)', marginBottom: 'var(--space-2)' }}>
              {stat.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
              <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--admin-text)' }}>
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        {/* Recent Orders Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h3 style={{ fontWeight: '600' }}>Recent Orders</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: '500' }}>{order.id.slice(0, 8)}...</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{formatPrice(order.grandTotal)}</td>
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
                    <Link href={`/admin/orders/${order.id}`} className="btn btn-outline btn-sm">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top Selling Products */}
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Top Selling Products</h3>
          {topSelling.length > 0 ? topSelling.map((prod, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--admin-border)' }}>
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>{prod.name}</p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--admin-text-secondary)' }}>{prod.sales} sold</p>
              </div>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--admin-text)' }}>
                #{i + 1}
              </span>
            </div>
          )) : (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--admin-text-secondary)' }}>No sales data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
