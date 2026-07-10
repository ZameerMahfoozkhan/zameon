'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import styles from '../admin.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      // Let the layout handle the redirect if it's successful, 
      // but we can also push directly for better UX.
      // Wait a moment for state to update
      setTimeout(() => {
        router.push('/admin');
      }, 500);
    } catch (err) {
      setError('Invalid credentials or not an admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--admin-text)', fontWeight: 'bold', fontSize: '24px', textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="currentColor"/>
              <path d="M8 10H24L12 22H24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ZAMEON Admin
          </Link>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <Link href="/" style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', textDecoration: 'none' }}>
              ← Back to Storefront
            </Link>
          </div>
          <p style={{ color: 'var(--admin-text-secondary)', marginTop: '8px' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '6px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          
          <div className="input-group">
            <label className="input-label" style={{ color: 'var(--admin-text)' }}>Email</label>
            <input 
              type="email" 
              className="input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="input-label" style={{ color: 'var(--admin-text)', marginBottom: 0 }}>Password</label>
              <Link href="/contact?subject=Forget%20my%20password" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none' }}>Forget password?</Link>
            </div>
            <input 
              type="password" 
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Sign In
          </button>
        </form>

        {/* Demo credentials removed */}
      </div>
    </div>
  );
}
