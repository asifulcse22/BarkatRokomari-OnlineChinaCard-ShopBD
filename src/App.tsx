/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/home/HeroBanner';
import { CategoryGrid } from './components/home/CategoryGrid';
import { FeaturedDeals } from './components/home/FeaturedDeals';
import { CatalogPage } from './components/catalog/CatalogPage';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderSuccessPage } from './components/checkout/OrderSuccessPage';
import { CustomerAccountPage } from './components/account/CustomerAccountPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CartDrawer } from './components/cart/CartDrawer';
import { ProductQuickViewModal } from './components/product/ProductQuickViewModal';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLogin } from './components/auth/AdminLogin';
import { ArrowUp } from 'lucide-react';


const MainContent: React.FC = () => {
  const { viewMode, activeCustomerPage } = useStore();
  const { isAdmin } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on page switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCustomerPage, viewMode]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageKey = viewMode === 'admin' ? 'admin' : activeCustomerPage;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Cart Drawer & Quick View Modal */}
      <CartDrawer />
      <ProductQuickViewModal />

      {/* Header */}
      <Header />

      {/* Main View Area with Smooth Page Transition Motion */}
      <main className="flex-1 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {viewMode === 'admin' ? (
              isAdmin ? <AdminDashboard /> : <AdminLogin />
            ) : (
              <>
                {activeCustomerPage === 'home' && (
                  <>
                    <HeroBanner />
                    <CategoryGrid />
                    <FeaturedDeals />
                  </>
                )}
                {activeCustomerPage === 'catalog' && <CatalogPage />}
                {activeCustomerPage === 'product-detail' && <ProductDetailPage />}
                {activeCustomerPage === 'checkout' && <CheckoutPage />}
                {activeCustomerPage === 'order-success' && <OrderSuccessPage />}
                {activeCustomerPage === 'account' && <CustomerAccountPage />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Scroll to Top Button with Spring Motion */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-colors hover:text-brand-600"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
    <StoreProvider>
      <MainContent />
      </StoreProvider>
      </AuthProvider>
  );
}
