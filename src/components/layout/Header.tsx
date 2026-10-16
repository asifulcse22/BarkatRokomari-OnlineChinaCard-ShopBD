
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  Heart,
  User,
  ChevronDown,
  Phone,
  Headphones,
  RotateCcw,
  Truck,
  Sparkles,
  ArrowRight,
  Menu,
  ShoppingCart,
  Banknote,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    activeCustomerPage,
    setActiveCustomerPage,
    setActiveAdminTab,
    cartCount,
    cartTotal,
    wishlist,
    setIsCartOpen,
    products,
    categories,
    setFilter,
    setSelectedProductId,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Live Search Results
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchOpen(false);
      }

      if (
        categoryRef.current &&
        !categoryRef.current.contains(target)
      ) {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Apply Search
  const applySearch = () => {
    if (!searchQuery.trim()) return;

    setFilter((prev) => ({
      ...prev,
      search: searchQuery.trim(),
      category: 'All',
    }));

    setActiveCustomerPage('catalog');
    setViewMode('customer');
    setIsSearchOpen(false);
  };

  // Search Submit
  const handleSearchSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    applySearch();
  };

  // Select Product From Search
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActiveCustomerPage('product-detail');
    setViewMode('customer');
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Category Click
  const handleCategoryClick = (categoryName: string) => {
    setFilter((prev) => ({
      ...prev,
      category: categoryName,
      search: '',
    }));

    setActiveCustomerPage('catalog');
    setViewMode('customer');
    setIsCategoryMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-xs backdrop-blur-md transition-shadow">
      {/* Top Announcement Utility Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative overflow-hidden border-b border-amber-200/70 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 px-4 py-2 text-xs text-slate-800"
      >
        <motion.div
          aria-hidden="true"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'linear',
          }}
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        />

        <div className="relative mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-0 sm:px-2 lg:px-4">
          {/* Left: Highlights */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-semibold">
            <motion.div
              whileHover={{ y: -2 }}
              className="flex items-center gap-1.5 text-slate-800"
            >
              <Truck className="h-3.5 w-3.5 shrink-0 text-orange-600" />
              <span>
                Free Express Shipping on Orders Above ৳1,000
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="hidden items-center gap-1.5 text-slate-700 sm:flex"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0 text-red-600" />
              <span>7 Days Easy Return Policy</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="hidden items-center gap-1.5 text-slate-700 md:flex"
            >
              <Banknote className="h-3.5 w-3.5 shrink-0 text-amber-700" />
              <span>Cash on Delivery &amp; Secure Online Pay</span>
            </motion.div>
          </div>

          {/* Right: Phone and Support */}
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-700 sm:gap-5">
            <motion.a
              href="tel:+8801911561232"
              whileHover={{ scale: 1.04 }}
              className="flex items-center gap-1.5 transition-colors hover:text-orange-700"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-orange-600" />
              <span className="font-bold text-slate-900">
                +8801911561232
              </span>
            </motion.a>

            <span className="hidden text-amber-400 sm:inline">|</span>

            <motion.div
              whileHover={{ y: -2 }}
              className="hidden items-center gap-1.5 sm:flex"
            >
              <Headphones className="h-3.5 w-3.5 shrink-0 text-red-600" />
              <span>24/7 Priority Support</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Header Row */}
      <div className="mx-auto max-w-[1600px] px-3 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          {/* Logo */}
          <motion.button
            type="button"
            onClick={() => {
              setActiveCustomerPage('home');
              setViewMode('customer');
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex shrink-0 cursor-pointer items-center rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="বরকত রকমারী হোম"
          >
            <img
              src="/logo-backup.png"
              alt="বরকত রকমারী — China Card Online Shop BD"
              className="block h-[42px] w-[120px] object-contain object-left sm:h-[68px] sm:w-[210px] lg:h-[76px] lg:w-[235px]"
            />
          </motion.button>

          {/* Search Bar */}
          <div
            ref={searchRef}
            className="relative hidden w-full max-w-2xl flex-1 md:block"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search products, brands, electronics, fashion and more..."
                className="w-full rounded-full border border-slate-200 bg-slate-50/70 py-2.5 pl-5 pr-14 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="absolute right-1 top-1 bottom-1 flex cursor-pointer items-center justify-center rounded-full bg-blue-600 px-4 text-white shadow-xs transition-colors hover:bg-blue-700"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </motion.button>
            </form>

            {/* Live Autocomplete */}
            <AnimatePresence>
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl"
                >
                  <div className="flex justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Matching Products</span>
                    <span>{searchResults.length} results</span>
                  </div>

                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <motion.button
                        key={product.id}
                        type="button"
                        whileHover={{
                          backgroundColor: '#f8fafc',
                          x: 4,
                        }}
                        onClick={() =>
                          handleSelectProduct(product.id)
                        }
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="h-10 w-10 shrink-0 rounded-lg border border-slate-100 bg-slate-50 object-contain p-1"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900">
                            {product.title}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {product.category} · {product.brand}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xs font-black text-blue-600">
                            ৳
                            {(
                              product.salePrice || product.regularPrice
                            ).toLocaleString()}
                          </span>
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-slate-500">
                      No products found matching &quot;{searchQuery}&quot;.
                    </div>
                  )}

                  <div className="mt-1 border-t border-slate-100 px-4 pt-2">
                    <button
                      type="button"
                      onClick={applySearch}
                      className="flex w-full cursor-pointer items-center justify-center gap-1 py-1 text-center text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <span>
                        View all matching items in catalog
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Header Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-6">
            {/* Account */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              onClick={() => {
                setActiveCustomerPage('account');
                setViewMode('customer');
              }}
              className="group flex cursor-pointer items-center gap-2.5 text-left text-slate-700 transition-colors hover:text-blue-600"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors group-hover:bg-blue-50 sm:h-9 sm:w-9">
                <User className="h-4 w-4" />
              </div>

              <div className="hidden leading-tight lg:block">
                <span className="block text-xs font-bold text-slate-900">
                  Account
                </span>
                <span className="block text-[11px] font-normal text-slate-400">
                  Login / Orders
                </span>
              </div>
            </motion.button>

            {/* Wishlist */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCustomerPage('account');
                setViewMode('customer');
              }}
              className="relative flex cursor-pointer items-center gap-2 text-left text-slate-700 transition-colors hover:text-rose-600"
              title="Saved Wishlist"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-rose-50 sm:h-9 sm:w-9">
                <Heart className="h-4 w-4" />

                {wishlist.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs"
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </div>

              <div className="hidden leading-tight lg:block">
                <span className="block text-xs font-bold text-slate-900">
                  Wishlist
                </span>
                <span className="block text-[11px] font-normal text-slate-400">
                  {wishlist.length} saved
                </span>
              </div>
            </motion.button>

            {/* Cart */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="flex cursor-pointer items-center gap-2.5 text-left text-slate-700 transition-colors hover:text-blue-600"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 sm:h-9 sm:w-9">
                <ShoppingCart className="h-4 w-4" />

                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.3 }}
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs"
                >
                  {cartCount}
                </motion.span>
              </div>

              <div className="hidden leading-tight lg:block">
                <span className="block text-xs font-bold text-slate-900">
                  Cart
                </span>
                <span className="block font-mono text-[11px] font-bold text-blue-600">
                  ৳{cartTotal.toLocaleString()}
                </span>
              </div>
            </motion.button>

            {/* Admin & AI Business Center */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (viewMode === 'customer') {
                  setViewMode('admin');
                  setActiveAdminTab('ai-center');
                } else {
                  setViewMode('customer');
                  setActiveCustomerPage('home');
                }
              }}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-2 py-1.5 text-[11px] font-bold transition-all shadow-xs sm:px-3 sm:text-xs ${
                viewMode === 'admin'
                  ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-400'
                  : 'border-indigo-200/50 bg-gradient-to-r from-slate-100 to-indigo-50 text-indigo-900 hover:from-indigo-100 hover:to-blue-100'
              }`}
              title="Switch between Storefront and Admin AI Business Center"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-amber-500" />
              <span>
                {viewMode === 'admin' ? 'Storefront' : 'Admin & AI'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navigation Ribbon */}
      <nav
        aria-label="Main Navigation"
        className="border-t border-slate-100 bg-white"
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-8">
            {/* All Categories */}
            <div className="relative" ref={categoryRef}>
              <motion.button
                type="button"
                whileHover={{ backgroundColor: '#1d4ed8' }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setIsCategoryMenuOpen((prev) => !prev)
                }
                className="flex w-[210px] cursor-pointer items-center justify-between gap-2 rounded-t-xl bg-blue-600 px-3 py-3 text-xs font-bold text-white shadow-xs transition-colors sm:w-64 sm:gap-3 sm:px-5"
                aria-expanded={isCategoryMenuOpen}
                aria-haspopup="true"
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Menu className="h-4 w-4 shrink-0" />
                  <span className="tracking-wide">
                    All Categories
                  </span>
                </div>

                <motion.div
                  animate={{
                    rotate: isCategoryMenuOpen ? 180 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </motion.button>

              {/* Category Dropdown */}
              <AnimatePresence>
                {isCategoryMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 z-50 max-h-[70vh] w-[210px] overflow-y-auto rounded-b-xl border border-slate-200 bg-white py-2 shadow-xl sm:w-64"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() =>
                            handleCategoryClick(cat.name)
                          }
                          className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <span className="min-w-0 break-words">
                            {cat.name}
                          </span>
                          <span className="shrink-0 text-[11px] font-normal text-slate-400">
                            {cat.itemCount} items
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-slate-500">
                        No categories available
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Links */}
            <div className="hidden items-center gap-7 text-xs font-semibold text-slate-700 md:flex">
              {/* Home */}
              <button
                type="button"
                onClick={() => {
                  setActiveCustomerPage('home');
                  setViewMode('customer');
                }}
                className={`relative cursor-pointer py-3 transition-colors ${
                  activeCustomerPage === 'home' &&
                  viewMode === 'customer'
                    ? 'border-b-2 border-blue-600 -mb-[1px] font-bold text-blue-600'
                    : 'hover:text-blue-600'
                }`}
              >
                Home
              </button>

              {/* Shop */}
              <button
                type="button"
                onClick={() => {
                  setFilter((f) => ({
                    ...f,
                    category: 'All',
                  }));
                  setActiveCustomerPage('catalog');
                  setViewMode('customer');
                }}
                className="flex cursor-pointer items-center gap-1 py-3 transition-colors hover:text-blue-600"
              >
                <span>Shop</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {/* Deals */}
              <button
                type="button"
                onClick={() => {
                  setFilter((f) => ({
                    ...f,
                    category: 'All',
                    sortBy: 'bestseller',
                  }));
                  setActiveCustomerPage('catalog');
                  setViewMode('customer');
                }}
                className="group relative flex cursor-pointer items-center py-3 transition-colors hover:text-blue-600"
              >
                <span>Deals</span>

                <span className="absolute -top-1.5 right-0 -translate-y-1 translate-x-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black uppercase leading-tight tracking-wider text-white shadow-xs animate-pulse">
                  Hot
                </span>

                <ChevronDown className="ml-1 h-3 w-3 text-slate-400" />
              </button>

              {/* New Arrivals */}
              <button
                type="button"
                onClick={() => {
                  setFilter((f) => ({
                    ...f,
                    sortBy: 'newest',
                  }));
                  setActiveCustomerPage('catalog');
                  setViewMode('customer');
                }}
                className="cursor-pointer py-3 transition-colors hover:text-blue-600"
              >
                New Arrivals
              </button>

              {/* Best Sellers */}
              <button
                type="button"
                onClick={() => {
                  setFilter((f) => ({
                    ...f,
                    sortBy: 'bestseller',
                  }));
                  setActiveCustomerPage('catalog');
                  setViewMode('customer');
                }}
                className="cursor-pointer py-3 transition-colors hover:text-blue-600"
              >
                Best Sellers
              </button>

              {/* Order Tracking */}
              <button
                type="button"
                onClick={() => {
                  setActiveCustomerPage('account');
                  setViewMode('customer');
                }}
                className="cursor-pointer py-3 transition-colors hover:text-blue-600"
              >
                Order Tracking
              </button>

              {/* Support Center */}
              <button
                type="button"
                onClick={() => {
                  setActiveCustomerPage('account');
                  setViewMode('customer');
                }}
                className="cursor-pointer py-3 transition-colors hover:text-blue-600"
              >
                Support Center
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
