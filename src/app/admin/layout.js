'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { getNotifications, markNotificationsAsRead, subscribeToNotifications } from '@/lib/firestore';
import styles from './admin.module.css';
import '@/app/globals.css';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg> },
  { name: 'Products', path: '/admin/products', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> },
  { name: 'Orders', path: '/admin/orders', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { name: 'Customers', path: '/admin/customers', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { name: 'Settings', path: '/admin/settings', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading, signOut } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  useEffect(() => {
    if (user && isAdmin) {
      const unsubscribe = subscribeToNotifications('admin', (notifs) => {
        setNotifications(notifs);
      });
      return () => unsubscribe();
    }
  }, [user, isAdmin]);

  const handleOpenNotifications = async () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen) {
      const unread = notifications.filter(n => !n.read);
      if (unread.length > 0) {
        await markNotificationsAsRead('admin');
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  
  useEffect(() => {
    if (!loading) {
      if (pathname === '/admin/login') {
        if (user && isAdmin) {
          router.push('/admin');
        }
      } else {
        if (!user || !isAdmin) {
          router.push('/admin/login');
        }
      }
    }
  }, [user, isAdmin, loading, pathname, router]);

  // If loading, show a loading state
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background)' }}>Loading...</div>;
  }

  // If it's the login page, check if already logged in as admin
  if (pathname === '/admin/login') {
    if (user && isAdmin) {
      return null;
    }
    return <>{children}</>;
  }

  // Route Guard: If not logged in or not admin, return null while redirecting
  if (!user || !isAdmin) {
    return null;
  }

  const currentTitle = navItems.find(item => item.path === pathname)?.name || 'Dashboard';

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.sidebarLogo}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="currentColor"/>
              <path d="M8 10H24L12 22H24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ZAMEON
            <span className={styles.sidebarLogoSpan}>ADMIN</span>
          </Link>
        </div>
        
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/admin');
            return (
              <Link 
                key={item.name} 
                href={item.path} 
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminAvatar}>{user?.displayName?.charAt(0) || 'A'}</div>
          <div className={styles.adminInfo}>
            <span className={styles.adminName}>{user?.displayName || 'Admin'}</span>
            <span className={styles.adminRole}>{user?.email || 'admin@zameon.com'}</span>
          </div>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{currentTitle}</h1>
          <div className={styles.headerActions}>
            <Link href="/" target="_blank" className={styles.iconBtn} title="View Store">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </Link>
            <div style={{ position: 'relative' }}>
              <button onClick={handleOpenNotifications} className={styles.iconBtn} title="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '0', right: '0', background: 'var(--color-error)', color: 'white', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
                )}
              </button>
              {notificationsOpen && (
                <div style={{ position: 'absolute', top: '100%', right: '0', background: 'white', border: '1px solid var(--admin-border)', borderRadius: 'var(--radius-md)', width: '300px', maxHeight: '400px', overflowY: 'auto', boxShadow: 'var(--shadow-md)', zIndex: 10 }}>
                  <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--admin-border)', fontWeight: 'bold' }}>Notifications</div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 'var(--space-3)', color: 'var(--admin-text-secondary)' }}>No new notifications</div>
                  ) : (
                    notifications.map(n => {
                      const linkHref = n.data?.orderId ? `/admin/orders/${n.data.orderId}` : '#';
                      return (
                        <Link href={linkHref} key={n.id} style={{ display: 'block', padding: 'var(--space-3)', borderBottom: '1px solid var(--admin-border)', background: n.read ? 'white' : 'var(--background-secondary)', textDecoration: 'none' }} onClick={() => setNotificationsOpen(false)}>
                          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--admin-text)' }}>{n.message}</p>
                          <span style={{ fontSize: '10px', color: 'var(--admin-text-secondary)' }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}</span>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            <button onClick={signOut} className={styles.iconBtn} title="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </header>
        
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
