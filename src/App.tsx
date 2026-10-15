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
import { AuthProvider } from './context/AuthContext';
import { ArrowUp } from 'lucide-react';


const MainContent: React.FC = () => {
  const { viewMode, activeCustomerPage } = useStore();
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            {viewMode === 'admin' ? (
              <AdminDashboard />
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
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.15, y: -3 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center cursor-pointer border border-white/20 backdrop-blur-xs"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
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
