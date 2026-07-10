import styles from '../admin.module.css';

export default function AdminSettings() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: '800px' }}>
      
      {/* Store Details */}
      <div className={styles.card}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Store Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="input-group">
            <label className="input-label">Store Name</label>
            <input type="text" className="input" defaultValue="ZAMEON" />
          </div>
          <div className="input-group">
            <label className="input-label">Contact Email</label>
            <input type="email" className="input" defaultValue="hello@zameon.com" />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Store Description</label>
            <textarea className="input" rows="3" defaultValue="Premium tech products for modern living."></textarea>
          </div>
        </div>
      </div>

      {/* Currency & Region */}
      <div className={styles.card}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Currency & Region</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="input-group">
            <label className="input-label">Store Currency</label>
            <select className="input select" defaultValue="INR (₹)">
              <option>INR (₹)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Timezone</label>
            <select className="input select" defaultValue="Indian Standard Time (IST)">
              <option>Indian Standard Time (IST)</option>
              <option>Pacific Time (PT)</option>
              <option>Eastern Time (ET)</option>
              <option>Coordinated Universal Time (UTC)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className={styles.card}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Security</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontWeight: '500' }}>Two-Factor Authentication</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--admin-text-secondary)' }}>Require 2FA for all admin accounts.</p>
            </div>
            <button className="btn btn-outline">Enable</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--admin-border)', paddingTop: 'var(--space-4)' }}>
            <div>
              <h4 style={{ fontWeight: '500' }}>Change Password</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--admin-text-secondary)' }}>Update your admin account password.</p>
            </div>
            <button className="btn btn-outline">Update</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <button className="btn btn-outline">Cancel</button>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  );
}
