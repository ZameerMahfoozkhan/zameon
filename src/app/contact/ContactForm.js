'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './contact.module.css';

function ContactFormInner() {
  const searchParams = useSearchParams();
  const defaultSubject = searchParams.get('subject') || 'General Inquiry';

  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <div className={styles.inputRow}>
        <div className="input-group">
          <label className="input-label">First Name</label>
          <input type="text" className="input" placeholder="John" />
        </div>
        <div className="input-group">
          <label className="input-label">Last Name</label>
          <input type="text" className="input" placeholder="Doe" />
        </div>
      </div>
      <div className="input-group">
        <label className="input-label">Email</label>
        <input type="email" className="input" placeholder="you@example.com" />
      </div>
      <div className="input-group">
        <label className="input-label">Subject</label>
        <select className="input select" defaultValue={defaultSubject}>
          <option>General Inquiry</option>
          <option>Product Support</option>
          <option>Order Issue</option>
          <option>Partnership</option>
          <option>Press</option>
          <option value="Forget my password">Forget my password</option>
        </select>
      </div>
      <div className="input-group">
        <label className="input-label">Message</label>
        <textarea className="input" rows="5" placeholder="Tell us how we can help..."></textarea>
      </div>
      <button type="submit" className="btn btn-primary btn-lg">Send Message</button>
    </form>
  );
}

export default function ContactForm() {
  return (
    <Suspense fallback={<div className={styles.form} style={{ opacity: 0.5 }}>Loading...</div>}>
      <ContactFormInner />
    </Suspense>
  );
}
