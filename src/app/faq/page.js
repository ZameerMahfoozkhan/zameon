'use client';
import { useState } from 'react';
import styles from './faq.module.css';

const faqGroups = [
  {
    category: 'Orders & Shipping',
    items: [
      { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days within the US. Express shipping delivers in 1-2 business days. International orders typically arrive in 7-14 business days.' },
      { q: 'Do you offer free shipping?', a: 'Yes! We offer free standard shipping on all orders over ₹8000. Express and overnight shipping options are available at checkout for an additional fee.' },
      { q: 'Can I track my order?', a: 'Absolutely. Once your order ships, you\'ll receive a confirmation email with a tracking number. You can also track your order from your account dashboard.' },
      { q: 'Do you ship internationally?', a: 'We currently ship to 12 countries. International shipping rates and delivery times vary by destination. Check our shipping page for details.' },
    ],
  },
  {
    category: 'Returns & Exchanges',
    items: [
      { q: 'What is your return policy?', a: 'We offer a 30-day no-questions-asked return policy. Items must be in their original condition and packaging. Refunds are processed within 5-7 business days of receiving the return.' },
      { q: 'How do I initiate a return?', a: 'Log into your account, go to Orders, and select the item you\'d like to return. We\'ll email you a prepaid return label. Simply pack the item and drop it off at any carrier location.' },
      { q: 'Can I exchange an item?', a: 'Yes! You can exchange items for a different color or size within 30 days of purchase. If the item you want is out of stock, we\'ll issue a full refund.' },
    ],
  },
  {
    category: 'Products & Warranty',
    items: [
      { q: 'What warranty do ZAMEON products come with?', a: 'All ZAMEON products come with a comprehensive 2-year warranty that covers manufacturing defects. Some products may have extended warranty options available at checkout.' },
      { q: 'Are your products compatible with [device]?', a: 'Compatibility information is listed on each product page under the Specifications tab. If you\'re unsure, contact our support team and we\'ll help you find the right product.' },
      { q: 'Where do ZAMEON products come from?', a: 'We carefully curate and source products from top global brands and trusted manufacturers. Every item in our catalog is handpicked by our team and quality-checked before it reaches you.' },
    ],
  },
  {
    category: 'Account & Payment',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. All transactions are secured with 256-bit SSL encryption.' },
      { q: 'Is my payment information secure?', a: 'Absolutely. We use industry-standard PCI DSS compliant payment processing. We never store your full card details on our servers.' },
      { q: 'How do I create an account?', a: 'Click the account icon in the top right corner and select "Create Account." You can also create an account during checkout. Having an account lets you track orders, save addresses, and manage your wishlist.' },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({});

  const toggle = (key) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.overline}>Help Center</p>
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.desc}>Find answers to common questions about orders, shipping, returns, and more.</p>
        </div>

        <div className={styles.content}>
          {faqGroups.map((group) => (
            <div key={group.category} className={styles.group}>
              <h2 className={styles.groupTitle}>{group.category}</h2>
              <div className={styles.items}>
                {group.items.map((item, i) => {
                  const key = `${group.category}-${i}`;
                  const isOpen = openItems[key];
                  return (
                    <div key={key} className={styles.item}>
                      <button className={styles.question} onClick={() => toggle(key)}>
                        <span>{item.q}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </button>
                      {isOpen && (
                        <div className={styles.answer}>
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <h3>Still have questions?</h3>
          <p>Our support team is here to help.</p>
          <a href="/contact" className="btn btn-primary">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
