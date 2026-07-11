'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/store';
import { useAuth } from '@/lib/AuthContext';
import { createOrder, updateUserProfile } from '@/lib/firestore';
import { formatPrice } from '@/lib/products';
import styles from './checkout.module.css';

const steps = ['Information', 'Shipping', 'Payment'];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    saveAddress: false,
    label: 'Home'
  });

  const [contactInfo, setContactInfo] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('prepaid');

  useEffect(() => {
    if (userProfile) {
      setContactInfo(prev => ({
        ...prev,
        email: userProfile.email || prev.email,
        firstName: (userProfile.name || '').split(' ')[0] || prev.firstName,
        lastName: (userProfile.name || '').split(' ').slice(1).join(' ') || prev.lastName
      }));
      if (userProfile.phone) {
        setAddressForm(prev => ({ ...prev, phone: userProfile.phone }));
      }
      if (userProfile.addresses && userProfile.addresses.length > 0) {
        const defaultAddr = userProfile.addresses.find(a => a.isDefault) || userProfile.addresses[0];
        setSelectedAddressId(defaultAddr.id);
      }
    }
  }, [userProfile]);
  
  const shipping = total >= 2000 ? 0 : 199;
  const tax = total * 0.18;
  const discount = paymentMethod === 'prepaid' ? 99 : 0;
  const grandTotal = total + shipping + tax - discount;

  const handlePayment = async () => {
    if (!user) {
      alert("Please sign in to place an order.");
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      let finalAddress = null;
      if (selectedAddressId === 'new') {
        finalAddress = {
          street: addressForm.street,
          city: addressForm.city,
          state: addressForm.state,
          zip: addressForm.zip,
          phone: addressForm.phone,
        };
        if (addressForm.saveAddress) {
          const newSavedAddr = {
            id: Date.now().toString(),
            label: addressForm.label,
            ...finalAddress,
            isDefault: !(userProfile?.addresses?.length > 0)
          };
          const updatedAddresses = [...(userProfile?.addresses || []), newSavedAddr];
          await updateUserProfile(user.uid, { addresses: updatedAddresses, phone: addressForm.phone });
        }
      } else {
        const addr = userProfile.addresses.find(a => a.id === selectedAddressId);
        if (addr) {
          finalAddress = {
            street: addr.street,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            phone: userProfile?.phone || ''
          };
        }
      }

      const orderData = {
        userId: user.uid,
        customerName: contactInfo.firstName + ' ' + contactInfo.lastName,
        customerEmail: contactInfo.email,
        items,
        subtotal: total,
        shipping,
        tax,
        discount,
        grandTotal,
        shippingAddress: finalAddress,
        paymentMethod,
        status: 'processing'
      };
      await createOrder(orderData);
      clearCart();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.empty}>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for shopping with ZAMEON.</p>
        <button onClick={() => router.push('/account?tab=orders')} className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>View My Orders</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>Your cart is empty</h1>
        <Link href="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <button onClick={() => router.push('/')} className={styles.logo} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="currentColor"/>
              <path d="M8 10H24L12 22H24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ZAMEON
          </button>
          <div className={styles.secure}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secure Checkout
          </div>
        </div>

        {/* Progress */}
        <div className={styles.progress}>
          {steps.map((s, i) => (
            <div key={s} className={`${styles.step} ${i <= step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
              <span className={styles.stepNumber}>{i < step ? '✓' : i + 1}</span>
              <span className={styles.stepLabel}>{s}</span>
              {i < steps.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* Form */}
          <div className={styles.form}>
            {step === 0 && (
              <div className={styles.formSection}>
                <h2 className={styles.formTitle}>Contact Information</h2>
                <div className={styles.inputGrid}>
                  <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Email</label>
                    <input type="email" className="input" value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">First Name</label>
                    <input type="text" className="input" value={contactInfo.firstName} onChange={e => setContactInfo({...contactInfo, firstName: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Last Name</label>
                    <input type="text" className="input" value={contactInfo.lastName} onChange={e => setContactInfo({...contactInfo, lastName: e.target.value})} />
                  </div>
                </div>

                <h2 className={styles.formTitle} style={{ marginTop: 'var(--space-8)' }}>Shipping Address</h2>
                
                {userProfile?.addresses && userProfile.addresses.length > 0 && (
                  <div style={{ display: 'grid', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                    {userProfile.addresses.map(addr => (
                      <label key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-4)', border: selectedAddressId === addr.id ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: selectedAddressId === addr.id ? 'rgba(0, 0, 0, 0.02)' : 'transparent' }}>
                        <input type="radio" name="savedAddress" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} style={{ marginTop: '4px' }} />
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: 'var(--space-1)' }}>{addr.label} {addr.isDefault && <span style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'white', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px' }}>Default</span>}</div>
                          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            {addr.street}, {addr.city}, {addr.state} {addr.zip}
                          </div>
                        </div>
                      </label>
                    ))}
                    
                    {(!userProfile?.addresses || userProfile.addresses.length < 3) && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', border: selectedAddressId === 'new' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                        <input type="radio" name="savedAddress" checked={selectedAddressId === 'new'} onChange={() => setSelectedAddressId('new')} />
                        <span style={{ fontWeight: '500' }}>Add a new address</span>
                      </label>
                    )}
                  </div>
                )}

                {selectedAddressId === 'new' && (
                  <div className={styles.inputGrid}>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label">Address</label>
                      <input type="text" className="input" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} placeholder="123 Main Street" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">City</label>
                      <input type="text" className="input" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} placeholder="Mumbai" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">State</label>
                      <input type="text" className="input" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} placeholder="Maharashtra" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">PIN Code</label>
                      <input type="text" className="input" value={addressForm.zip} onChange={e => setAddressForm({...addressForm, zip: e.target.value})} placeholder="400001" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Phone</label>
                      <input required type="tel" className="input" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} placeholder="+91 98765 43210" />
                    </div>
                    
                    {userProfile && (!userProfile.addresses || userProfile.addresses.length < 3) && (
                      <div className="input-group" style={{ gridColumn: '1 / -1', marginTop: 'var(--space-4)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={addressForm.saveAddress} onChange={e => setAddressForm({...addressForm, saveAddress: e.target.checked})} />
                          Save this address to my profile
                        </label>
                        {addressForm.saveAddress && (
                          <div style={{ marginTop: 'var(--space-4)' }}>
                            <label className="input-label">Address Label</label>
                            <select className="input select" value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})}>
                              <option value="Home">Home</option>
                              <option value="Office">Office</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className={styles.formActions} style={{ marginTop: 'var(--space-8)' }}>
                  <button onClick={() => router.push('/cart')} className="btn btn-ghost">← Return to Cart</button>
                  <button className="btn btn-primary btn-lg" onClick={() => {
                    if (!contactInfo.email || !contactInfo.firstName) {
                      alert("Please provide at least your email and first name.");
                      return;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(contactInfo.email)) {
                      alert("Please enter a valid email address.");
                      return;
                    }

                    if (selectedAddressId === 'new') {
                      if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zip || !addressForm.phone) {
                        alert("Please fill in all address fields, including your phone number.");
                        return;
                      }
                      
                      // Check phone number length (at least 10 digits)
                      const phoneDigits = addressForm.phone.replace(/[^0-9]/g, '');
                      if (phoneDigits.length < 10) {
                        alert("Please enter a valid phone number with at least 10 digits.");
                        return;
                      }
                      
                      // Check zip code length (at least 5 chars)
                      if (addressForm.zip.trim().length < 5) {
                        alert("Please enter a valid PIN/ZIP code.");
                        return;
                      }
                    }
                    setStep(1);
                  }}>Continue to Shipping</button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className={styles.formSection}>
                <h2 className={styles.formTitle}>Shipping Method</h2>
                <div className={styles.shippingOptions}>
                  <label className={styles.shippingOption}>
                    <input type="radio" name="shipping" defaultChecked className={styles.radio} />
                    <div className={styles.shippingInfo}>
                      <span className={styles.shippingName}>Standard Shipping</span>
                      <span className={styles.shippingTime}>5-7 business days</span>
                    </div>
                    <span className={styles.shippingPrice}>{total >= 2000 ? 'Free' : formatPrice(199)}</span>
                  </label>
                </div>
                <div className={styles.formActions}>
                  <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Continue to Payment</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.formSection}>
                <h2 className={styles.formTitle}>Payment</h2>
                
                <div style={{ display: 'grid', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', border: paymentMethod === 'prepaid' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === 'prepaid' ? 'rgba(0, 0, 0, 0.02)' : 'transparent' }}>
                    <input type="radio" checked={paymentMethod === 'prepaid'} onChange={() => setPaymentMethod('prepaid')} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '500' }}>Online Payment (Prepaid)</span>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>Get Flat ₹99 Off</span>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', border: paymentMethod === 'cod' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === 'cod' ? 'rgba(0, 0, 0, 0.02)' : 'transparent' }}>
                    <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <span style={{ fontWeight: '500' }}>Cash on Delivery (COD)</span>
                  </label>
                </div>

                {paymentMethod === 'prepaid' ? (
                  <div className={styles.inputGrid}>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label">Card Number</label>
                      <input type="text" className="input" placeholder="4242 4242 4242 4242" />
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label">Name on Card</label>
                      <input type="text" className="input" placeholder="John Doe" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Expiry</label>
                      <input type="text" className="input" placeholder="MM / YY" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">CVC</label>
                      <input type="text" className="input" placeholder="123" />
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 'var(--space-4)', background: 'var(--background-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
                    You will pay {formatPrice(grandTotal)} in cash when your order is delivered to your address.
                  </div>
                )}
                
                <div className={styles.formActions} style={{ marginTop: 'var(--space-6)' }}>
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handlePayment} disabled={loading}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    {loading ? 'Processing...' : (paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ${formatPrice(grandTotal)}`)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <aside className={styles.summary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div key={`${item.id}-${item.variant}`} className={styles.summaryItem}>
                  <div className={styles.summaryItemImg}><span>{item.quantity}</span></div>
                  <div className={styles.summaryItemInfo}>
                    <p className={styles.summaryItemName}>{item.name}</p>
                    <p className={styles.summaryItemVariant}>{item.variant !== 'default' ? item.variant : ''}</p>
                  </div>
                  <span className={styles.summaryItemPrice}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className={styles.summaryRow}><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              <div className={styles.summaryRow}><span>Tax</span><span>{formatPrice(tax)}</span></div>
              {discount > 0 && (
                <div className={styles.summaryRow} style={{ color: 'var(--color-success)' }}>
                  <span>Prepaid Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span><span>{formatPrice(grandTotal)}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
