'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import styles from '../auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.desc}>Sign in to your ZAMEON account</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              className="input" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
              <Link href="/contact?subject=Forget%20my%20password" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none' }}>Forget password?</Link>
            </div>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.footer}>
          Don't have an account? <Link href="/auth/signup" className={styles.link}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
