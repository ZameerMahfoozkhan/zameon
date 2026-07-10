'use client';
import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { getUserOrders, updateUserProfile } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';
import Link from 'next/link';
import styles from './account.module.css';

function AccountContent() {
  const { user, userProfile, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Profile Edit State
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  
  // Address Manage State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    customLabel: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    isDefault: false
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile && userProfile.phone) {
      setPhoneInput(userProfile.phone);
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && activeTab === 'orders') {
        setLoadingOrders(true);
        try {
          const fetchedOrders = await getUserOrders(user.uid);
          setOrders(fetchedOrders);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoadingOrders(false);
        }
      }
    };
    fetchOrders();
  }, [user, activeTab]);

  if (loading || !user) {
    return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleSavePhone = async () => {
    try {
      await updateUserProfile(user.uid, { phone: phoneInput });
      userProfile.phone = phoneInput; // Optimistic update
      setIsEditingPhone(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save phone number');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const addresses = userProfile.addresses || [];
      if (addresses.length >= 3) {
        alert("You can only save up to 3 addresses.");
        return;
      }
      
      const newAddress = {
        id: Date.now().toString(),
        label: addressForm.label === 'Custom' ? addressForm.customLabel : addressForm.label,
        street: addressForm.street,
        city: addressForm.city,
        state: addressForm.state,
        zip: addressForm.zip,
        isDefault: addressForm.isDefault || addresses.length === 0
      };

      let updatedAddresses = [...addresses];
      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
      }
      updatedAddresses.push(newAddress);

      await updateUserProfile(user.uid, { addresses: updatedAddresses });
      userProfile.addresses = updatedAddresses; // Optimistic update
      setIsAddingAddress(false);
      setAddressForm({ label: 'Home', customLabel: '', street: '', city: '', state: '', zip: '', isDefault: false });
    } catch (err) {
      console.error(err);
      alert('Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const updatedAddresses = (userProfile.addresses || []).filter(a => a.id !== addressId);
      await updateUserProfile(user.uid, { addresses: updatedAddresses });
      userProfile.addresses = updatedAddresses; // Optimistic update
    } catch (err) {
      console.error(err);
      alert('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const updatedAddresses = (userProfile.addresses || []).map(a => ({
        ...a,
        isDefault: a.id === addressId
      }));
      await updateUserProfile(user.uid, { addresses: updatedAddresses });
      userProfile.addresses = updatedAddresses; // Optimistic update
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>My Account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.displayName || 'User'}</p>
        </div>

        <div className={styles.layout}>
          <aside>
            <nav className={styles.sidebarNav}>
              <button 
                className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile & Addresses
              </button>
              <button 
                className={`${styles.navItem} ${activeTab === 'orders' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Orders
              </button>
              <button 
                className={styles.navItem}
                onClick={handleSignOut}
                style={{ color: 'var(--color-error)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </nav>
          </aside>

          <div className={styles.content}>
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                <div>
                  <h2 className={styles.sectionTitle}>Profile Information</h2>
                  <div className={styles.profileInfo}>
                    <div className={styles.infoGroup}>
                      <span className={styles.infoLabel}>Full Name</span>
                      <span className={styles.infoValue}>{user.displayName || userProfile?.name || '-'}</span>
                    </div>
                    <div className={styles.infoGroup}>
                      <span className={styles.infoLabel}>Email Address</span>
                      <span className={styles.infoValue}>{user.email}</span>
                    </div>
                    <div className={styles.infoGroup}>
                      <span className={styles.infoLabel}>Account Created</span>
                      <span className={styles.infoValue}>
                        {userProfile?.createdAt?.toDate ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div className={styles.infoGroup}>
                      <span className={styles.infoLabel}>Phone Number</span>
                      {isEditingPhone ? (
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <input 
                            type="tel" 
                            className="input" 
                            value={phoneInput} 
                            onChange={e => setPhoneInput(e.target.value)} 
                            placeholder="+91..."
                          />
                          <button className="btn btn-primary" onClick={handleSavePhone}>Save</button>
                          <button className="btn btn-ghost" onClick={() => setIsEditingPhone(false)}>Cancel</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                          <span className={styles.infoValue}>{userProfile?.phone || 'Not provided'}</span>
                          <button className="btn btn-outline btn-sm" onClick={() => setIsEditingPhone(true)}>Edit</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Saved Addresses</h2>
                    {(!userProfile?.addresses || userProfile.addresses.length < 3) && !isAddingAddress && (
                      <button className="btn btn-primary btn-sm" onClick={() => setIsAddingAddress(true)}>Add Address</button>
                    )}
                  </div>

                  {isAddingAddress ? (
                    <form onSubmit={handleSaveAddress} style={{ background: 'var(--background-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="input-group">
                          <label className="input-label">Address Label</label>
                          <select className="input select" value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})}>
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Custom">Custom</option>
                          </select>
                        </div>
                        {addressForm.label === 'Custom' ? (
                          <div className="input-group">
                            <label className="input-label">Custom Label Name</label>
                            <input required className="input" value={addressForm.customLabel} onChange={e => setAddressForm({...addressForm, customLabel: e.target.value})} placeholder="e.g. Mom's House" />
                          </div>
                        ) : <div />}
                        
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="input-label">Street Address</label>
                          <input required className="input" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} placeholder="123 Main St" />
                        </div>
                        
                        <div className="input-group">
                          <label className="input-label">City</label>
                          <input required className="input" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} placeholder="Mumbai" />
                        </div>
                        
                        <div className="input-group">
                          <label className="input-label">State</label>
                          <input required className="input" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} placeholder="Maharashtra" />
                        </div>
                        
                        <div className="input-group">
                          <label className="input-label">ZIP / PIN Code</label>
                          <input required className="input" value={addressForm.zip} onChange={e => setAddressForm({...addressForm, zip: e.target.value})} placeholder="400001" />
                        </div>
                        
                        <div className="input-group">
                          <label className="input-label">Phone Number</label>
                          <input required type="tel" className="input" value={addressForm.phone || ''} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} placeholder="+91 98765 43210" />
                        </div>
                        
                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} id="default-address" />
                          <label htmlFor="default-address">Set as default shipping address</label>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                        <button type="submit" className="btn btn-primary">Save Address</button>
                        <button type="button" className="btn btn-ghost" onClick={() => setIsAddingAddress(false)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
                      {(userProfile?.addresses || []).map(address => (
                        <div key={address.id} style={{ border: '1px solid var(--border-color)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                              {address.label}
                              {address.isDefault && <span style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>Default</span>}
                            </span>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>
                            {address.street}<br/>
                            {address.city}, {address.state} {address.zip}<br/>
                            Phone: {address.phone || userProfile?.phone || 'Not provided'}
                          </p>
                          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)' }}>
                            <button onClick={() => handleDeleteAddress(address.id)} style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                            {!address.isDefault && (
                              <button onClick={() => handleSetDefaultAddress(address.id)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Set as Default</button>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!userProfile?.addresses || userProfile.addresses.length === 0) && (
                        <p style={{ color: 'var(--text-secondary)' }}>You haven't saved any addresses yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className={styles.sectionTitle}>Order History</h2>
                {loadingOrders ? (
                  <p>Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p style={{ marginBottom: 'var(--space-4)' }}>You haven't placed any orders yet.</p>
                    <Link href="/shop" className="btn btn-primary">Start Shopping</Link>
                  </div>
                ) : (
                  <div>
                    {orders.map((order) => (
                      <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderHeader} style={{ cursor: 'pointer' }} onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                          <div>
                            <div className={styles.orderId}>Order #{order.id.slice(0, 8)}</div>
                            <div className={styles.orderDate}>
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Pending'}
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                              <div className={`${styles.orderStatus} ${styles['status' + (order.status || 'Processing')]}`}>
                                {order.status || 'Processing'}
                              </div>
                              <div className={styles.orderStatus} style={{ background: 'var(--background-secondary)', color: 'var(--text-secondary)' }}>
                                {order.paymentMethod === 'cod' ? 'COD' : 'Prepaid'}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className={styles.orderTotal}>{formatPrice(order.grandTotal)}</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginTop: 'var(--space-1)' }}>
                              {expandedOrderId === order.id ? 'Hide Details ▲' : 'View Details ▼'}
                            </div>
                          </div>
                        </div>

                        {expandedOrderId === order.id && (
                          <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--background-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                              <div>
                                <h4 style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Order Summary</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                  <span>{formatPrice(order.subtotal || 0)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                                  <span>{formatPrice(order.shipping || 0)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>Tax</span>
                                  <span>{formatPrice(order.tax || 0)}</span>
                                </div>
                                {order.discount > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)', color: 'var(--color-success)' }}>
                                    <span>Discount</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                                  <span>Grand Total</span>
                                  <span>{formatPrice(order.grandTotal || 0)}</span>
                                </div>
                              </div>
                              
                              <div>
                                <h4 style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Shipping Address</h4>
                                {order.shippingAddress ? (
                                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {order.shippingAddress.street}<br/>
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br/>
                                    Phone: {order.shippingAddress.phone || 'N/A'}
                                  </p>
                                ) : (
                                  <p style={{ color: 'var(--text-secondary)' }}>No address provided</p>
                                )}
                              </div>
                            </div>
                            <h4 style={{ fontWeight: '600', marginBottom: 'var(--space-3)' }}>Items</h4>
                            <div className={styles.orderItems} style={{ borderTop: 'none', padding: 0 }}>
                              {order.items.map((item, i) => (
                                <div key={i} className={styles.orderItem}>
                                  <div>
                                    <div className={styles.itemName}>{item.name} <span style={{ color: 'var(--text-secondary)' }}>x{item.quantity}</span></div>
                                    {item.variant !== 'default' && <div className={styles.itemVariant}>{item.variant}</div>}
                                  </div>
                                  <div className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <AccountContent />
    </Suspense>
  );
}
