'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import styles from '../auth.module.css';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      router.push('/');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create an Account</h1>
          <p className={styles.desc}>Join ZAMEON to track orders and save your wishlist</p>
        </div>

        <form className={styles.form} onSubmit={handleSignUp}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input 
              type="text" 
              className="input" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

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
            <label className="input-label">Password</label>
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link href="/auth/login" className={styles.link}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
