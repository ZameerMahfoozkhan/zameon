'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import { getAllCustomers, getAllOrders } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedCustomers, fetchedOrders] = await Promise.all([
        getAllCustomers(),
        getAllOrders()
      ]);
      setCustomers(fetchedCustomers);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && customers.length === 0) {
    return <div>Loading customers...</div>;
  }

  // Compute spend and order count per customer
  const customerStats = {};
  orders.forEach(order => {
    if (!customerStats[order.userId]) {
      customerStats[order.userId] = { orderCount: 0, spent: 0, lastActive: null };
    }
    customerStats[order.userId].orderCount += 1;
    customerStats[order.userId].spent += (order.grandTotal || 0);
    
    const orderDate = new Date(order.createdAt);
    const lastActiveDate = customerStats[order.userId].lastActive ? new Date(customerStats[order.userId].lastActive) : null;
    if (!lastActiveDate || orderDate > lastActiveDate) {
      customerStats[order.userId].lastActive = orderDate.toISOString();
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input type="text" className="input" placeholder="Search customers..." style={{ width: '300px' }} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-outline" onClick={fetchData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            Add Customer
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Last Active</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const stats = customerStats[customer.id] || { orderCount: 0, spent: 0, lastActive: null };
              return (
                <tr key={customer.id}>
                  <td style={{ fontWeight: '500' }}>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{stats.orderCount}</td>
                  <td style={{ fontWeight: '500' }}>{formatPrice(stats.spent)}</td>
                  <td>{stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/customers/${customer.id}`} className="btn btn-outline btn-sm">View Profile</Link>
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
