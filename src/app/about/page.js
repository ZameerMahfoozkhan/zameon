import styles from './about.module.css';

export const metadata = {
  title: 'About ZAMEON — Our Story',
  description: 'Learn about ZAMEON\'s mission to curate premium technology products that elevate everyday living.',
};

const values = [
  { icon: '✦', title: 'Curated Selection', desc: 'We handpick every product in our catalog. Only the best-in-class brands and items make it to our shelves.' },
  { icon: '⚡', title: 'No Compromises', desc: 'We rigorously test and vet every product we sell. If it doesn\'t meet our standards, we don\'t stock it.' },
  { icon: '♻️', title: 'Sustainable', desc: 'We prioritize brands committed to recycled packaging and energy-efficient products. Sustainability matters.' },
  { icon: '🤝', title: 'Community', desc: 'We listen to our community. Your feedback shapes what we stock and pushes us to find even better products.' },
];

const stats = [
  { number: '50K+', label: 'Happy Customers' },
  { number: '28', label: 'States Served' },
  { number: '99.2%', label: 'Satisfaction Rate' },
  { number: '200+', label: 'Curated Products' },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.overline}>About ZAMEON</p>
          <h1 className={styles.heroTitle}>We find the best tech so you don&apos;t have to</h1>
          <p className={styles.heroDesc}>
            ZAMEON was born from frustration with finding quality tech products in India. We curate the finest gadgets, 
            audio gear, and workspace essentials from trusted brands worldwide — so you get only the best, delivered to your doorstep.
          </p>
        </div>
      </section>

      {/* Image */}
      <section className={styles.imageSection}>
        <div className="container">
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderLabel}>About Banner Image · 21:9</span>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What We Believe</h2>
          <div className={styles.valuesGrid}>
            {values.map((v, i) => (
              <div key={i} className={styles.valueCard}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3 className={styles.valueName}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map((s, i) => (
              <div key={i} className={styles.stat}>
                <span className={styles.statNumber}>{s.number}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Our Team</h2>
          <p className={styles.teamDesc}>A passionate team of curators, tech enthusiasts, and customer champions bringing the best products to India.</p>
          <div className={styles.teamGrid}>
            {['CEO & Founder', 'Head of Design', 'Lead Engineer', 'Head of Product'].map((role, i) => (
              <div key={i} className={styles.teamCard}>
                <div className={styles.teamImage}><span>Team Image</span></div>
                <p className={styles.teamName}>Team Member</p>
                <p className={styles.teamRole}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
