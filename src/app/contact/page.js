import styles from './contact.module.css';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Contact ZAMEON — Get in Touch',
  description: 'Reach out to the ZAMEON team for support, partnerships, or general inquiries.',
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.overline}>Contact Us</p>
          <h1 className={styles.title}>Get in touch</h1>
          <p className={styles.desc}>Have a question, feedback, or partnership inquiry? We&apos;d love to hear from you.</p>
        </div>

        <div className={styles.layout}>
          {/* Form */}
          <ContactForm />

          {/* Info */}
          <aside className={styles.info}>
            {[
              { icon: '📧', label: 'Email', value: 'hello@zameon.com', href: 'mailto:hello@zameon.com' },
              { icon: '📱', label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
              { icon: '📍', label: 'Address', value: '42 Innovation Park\nBangalore, Karnataka 560001', href: null },
              { icon: '🕐', label: 'Hours', value: 'Mon–Fri: 9AM – 6PM IST\nSat–Sun: 10AM – 4PM IST', href: null },
            ].map((item, i) => (
              <div key={i} className={styles.infoCard}>
                <span className={styles.infoIcon}>{item.icon}</span>
                <div>
                  <p className={styles.infoLabel}>{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className={styles.infoValue}>{item.value}</a>
                  ) : (
                    <p className={styles.infoValue} style={{ whiteSpace: 'pre-line' }}>{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}

