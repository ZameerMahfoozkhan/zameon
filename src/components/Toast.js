'use client';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import styles from './Toast.module.css';

export default function Toast() {
  const { state, dispatch } = useStore();

  useEffect(() => {
    if (state.toasts.length > 0) {
      const latest = state.toasts[state.toasts.length - 1];
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: latest.id });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.toasts, dispatch]);

  if (state.toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type] || ''}`}
        >
          {toast.type === 'success' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          )}
          <span>{toast.message}</span>
          <button
            className={styles.dismiss}
            onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
