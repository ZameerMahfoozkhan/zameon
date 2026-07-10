import './globals.css';
import { StoreProvider } from '@/lib/store';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import Toast from '@/components/Toast';
import SearchOverlay from '@/components/SearchOverlay';
import StorefrontWrapper from '@/components/StorefrontWrapper';

export const metadata = {
  title: 'ZAMEON — Premium Products for Modern Living',
  description: 'Discover ZAMEON\'s curated collection of premium gadgets, audio, workspace essentials, and lifestyle products. Handpicked for quality, delivered across India.',
  openGraph: {
    title: 'ZAMEON — Premium Products for Modern Living',
    description: 'Discover ZAMEON\'s curated collection of premium gadgets, audio, workspace essentials, and lifestyle products.',
    siteName: 'ZAMEON',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#111827" />
      </head>
      <body>
        <AuthProvider>
          <StoreProvider>
          <StorefrontWrapper>
            <Navbar />
          </StorefrontWrapper>
          <main id="main-content">
            {children}
          </main>
          <StorefrontWrapper>
            <Footer />
            <CartDrawer />
            <Toast />
            <SearchOverlay />
          </StorefrontWrapper>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
