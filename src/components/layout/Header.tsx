
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

      if (categoryRef.current && !categoryRef.current.contains(target)) {
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
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-shadow">
      {/* 1. Top Announcement Utility Bar */}
      {/*<div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Highlights */}
          {/*<div className="flex items-center gap-6 text-[11px] font-medium">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              <span>Free Express Shipping on Orders Above ৳1,000</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>7 Days Easy Return Policy</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cash on Delivery &amp; Secure Online Pay</span>
            </div>
          </div> */}

          {/* Right: Phone and Support */}
          {/*<div className="flex items-center gap-5 text-[11px] font-medium text-slate-300">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-white"></span>
            </div>

            <span className="hidden sm:inline text-slate-700">|</span>

            <div className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <Headphones className="w-3.5 h-3.5 text-indigo-400" />
              <span>24/7 Priority Support</span>
            </div>
          </div>
        </div>
      </div> */}

    
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden border-b border-amber-200/70
          bg-gradient-to-r from-amber-50 via-orange-50 to-red-50
          px-4 py-2 text-xs text-slate-800"
      >
        {/* Subtle animated background highlight */}
        <motion.div
          aria-hidden="true"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "linear",
          }}
          className="pointer-events-none absolute inset-y-0 w-1/3
            bg-gradient-to-r from-transparent via-white/60 to-transparent"
        />

        <div className="relative mx-auto flex max-w-[1600px] flex-wrap
          items-center justify-between gap-3 px-0 sm:px-2 lg:px-4">

          {/* Left: Highlights */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2
            text-[11px] font-semibold">

            <motion.div
              whileHover={{ y: -2 }}
              className="flex items-center gap-1.5 text-slate-800"
            >
              <Truck className="h-3.5 w-3.5 shrink-0 text-orange-600" />
              <span>Free Express Shipping on Orders Above ৳1,000</span>
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
          <div className="flex items-center gap-4 text-[11px] font-semibold
            text-slate-700 sm:gap-5">

            <motion.a
              href="tel:+8801911561232"
              whileHover={{ scale: 1.04 }}
              className="flex items-center gap-1.5 transition-colors
                hover:text-orange-700"
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


      {/* 2. Main Header Row */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-6">
          {/* Logo — Image Only, Minimal Motion */}
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
            className="flex items-center shrink-0 cursor-pointer text-left rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="বরকত রকমারী হোম"
          >
            <img
              src="/logo-backup.png"
              alt="বরকত রকমারী — China Card Online Shop BD"
              className="
                block
                w-[160px] h-[54px]
                sm:w-[210px] sm:h-[68px]
                lg:w-[235px] lg:h-[76px]
                object-contain object-left
              "
            />
          </motion.button>

          {/* Search Bar */}
          <div
            ref={searchRef}
            className="flex-1 max-w-2xl relative hidden md:block"
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
                className="
                  w-full pl-5 pr-14 py-2.5 text-xs rounded-full
                  border border-slate-200 bg-slate-50/70
                  focus:bg-white focus:outline-none
                  focus:ring-2 focus:ring-blue-500/20
                  focus:border-blue-600 transition-all
                  text-slate-900 placeholder:text-slate-400 shadow-2xs
                "
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="
                  absolute right-1 top-1 bottom-1 px-4
                  bg-blue-600 hover:bg-blue-700 text-white
                  rounded-full transition-colors cursor-pointer
                  flex items-center justify-center shadow-xs
                "
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
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
                  className="
                    absolute top-full left-0 right-0 mt-2
                    bg-white rounded-2xl shadow-2xl
                    border border-slate-200 py-2 z-50 overflow-hidden
                  "
                >
                  <div
                    className="
                      px-4 py-1.5 text-[11px] font-bold text-slate-400
                      uppercase tracking-wider flex justify-between
                      bg-slate-50/60 border-b border-slate-100
                    "
                  >
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
                        onClick={() => handleSelectProduct(product.id)}
                        className="
                          w-full text-left px-4 py-2.5
                          flex items-center gap-3 transition-colors cursor-pointer
                        "
                      >
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="
                            w-10 h-10 object-contain rounded-lg
                            border border-slate-100 bg-slate-50 p-1 shrink-0
                          "
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {product.title}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            {product.category} · {product.brand}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-blue-600 font-mono">
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

                  <div className="border-t border-slate-100 px-4 pt-2 mt-1">
                    <button
                      type="button"
                      onClick={applySearch}
                      className="
                        w-full py-1 text-center text-xs font-semibold
                        text-blue-600 hover:text-blue-700
                        flex items-center justify-center gap-1 cursor-pointer
                      "
                    >
                      <span>View all matching items in catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-5 sm:gap-6 shrink-0">
            {/* Account */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              onClick={() => {
                setActiveCustomerPage('account');
                setViewMode('customer');
              }}
              className="
                group flex items-center gap-2.5 text-left text-slate-700
                hover:text-blue-600 transition-colors cursor-pointer
              "
            >
              <div
                className="
                  w-9 h-9 rounded-full bg-slate-100
                  flex items-center justify-center text-slate-700
                  group-hover:bg-blue-50 transition-colors
                "
              >
                <User className="w-4 h-4" />
              </div>

              <div className="hidden lg:block leading-tight">
                <span className="text-xs font-bold text-slate-900 block">
                  Account
                </span>
                <span className="text-[11px] text-slate-400 block font-normal">
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
              className="
                flex items-center gap-2 text-left text-slate-700
                hover:text-rose-600 transition-colors cursor-pointer relative
              "
              title="Saved Wishlist"
            >
              <div
                className="
                  relative w-9 h-9 rounded-full bg-slate-100
                  flex items-center justify-center text-slate-700
                  hover:bg-rose-50
                "
              >
                <Heart className="w-4 h-4" />

                {wishlist.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="
                      absolute -top-1 -right-1 w-4 h-4
                      bg-rose-500 text-white text-[10px] font-bold
                      rounded-full flex items-center justify-center shadow-xs
                    "
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </div>

              <div className="hidden lg:block leading-tight">
                <span className="text-xs font-bold text-slate-900 block">
                  Wishlist
                </span>
                <span className="text-[11px] text-slate-400 block font-normal">
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
              className="
                flex items-center gap-2.5 text-left text-slate-700
                hover:text-blue-600 transition-colors cursor-pointer
              "
            >
              <div
                className="
                  relative w-9 h-9 rounded-full bg-blue-50
                  flex items-center justify-center text-blue-600
                "
              >
                <ShoppingCart className="w-4 h-4" />

                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.3 }}
                  className="
                    absolute -top-1 -right-1 w-4 h-4
                    bg-blue-600 text-white text-[10px] font-bold
                    rounded-full flex items-center justify-center shadow-xs
                  "
                >
                  {cartCount}
                </motion.span>
              </div>

              <div className="hidden lg:block leading-tight">
                <span className="text-xs font-bold text-slate-900 block">
                  Cart
                </span>
                <span className="text-[11px] font-bold text-blue-600 block font-mono">
                  ৳{cartTotal.toLocaleString()}
                </span>
              </div>
            </motion.button>

            {/* Admin & AI Business Center */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                viewMode === 'admin'
                  ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-400'
                  : 'bg-gradient-to-r from-slate-100 to-indigo-50 text-indigo-900 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200/50'
              }`}
              title="Switch between Storefront and Admin AI Business Center"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>
                {viewMode === 'admin' ? 'Storefront' : 'Admin & AI'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* 3. Navigation Ribbon */}
      <nav
        aria-label="Main Navigation"
        className="border-t border-slate-100 bg-white"
      >
        <div
          className="
            max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8
            flex items-center justify-between
          "
        >
          <div className="flex items-center gap-8">
            {/* All Categories */}
            <div className="relative" ref={categoryRef}>
              <motion.button
                type="button"
                whileHover={{ backgroundColor: '#1d4ed8' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                className="
                  flex items-center gap-3 px-5 py-3
                  bg-blue-600 text-white rounded-t-xl
                  font-bold text-xs shadow-xs transition-colors
                  cursor-pointer w-64 justify-between
                "
                aria-expanded={isCategoryMenuOpen}
              >
                <div className="flex items-center gap-2.5">
                  <Menu className="w-4 h-4" />
                  <span className="tracking-wide">All Categories</span>
                </div>

                <motion.div
                  animate={{ rotate: isCategoryMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>

              {/* Category Dropdown */}
              <AnimatePresence>
                {isCategoryMenuOpen && activeCustomerPage !== 'home' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="
                      absolute top-full left-0 w-64 bg-white
                      rounded-b-xl shadow-xl border border-slate-200
                      py-2 z-50
                    "
                  >
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.name)}
                        className="
                          w-full text-left px-4 py-2 text-xs font-semibold
                          text-slate-700 hover:bg-blue-50 hover:text-blue-600
                          flex items-center justify-between transition-colors
                        "
                      >
                        <span>{cat.name}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {cat.itemCount} items
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Links */}
            <div
              className="
                hidden md:flex items-center gap-7
                text-xs font-semibold text-slate-700
              "
            >
              {/* Home */}
              <button
                type="button"
                onClick={() => {
                  setActiveCustomerPage('home');
                  setViewMode('customer');
                }}
                className={`transition-colors py-3 relative cursor-pointer ${
                  activeCustomerPage === 'home' && viewMode === 'customer'
                    ? 'text-blue-600 font-bold border-b-2 border-blue-600 -mb-[1px]'
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
                className="
                  hover:text-blue-600 transition-colors
                  flex items-center gap-1 cursor-pointer py-3
                "
              >
                <span>Shop</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
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
                className="
                  hover:text-blue-600 transition-colors relative
                  flex items-center py-3 cursor-pointer group
                "
              >
                <span>Deals</span>

                <span
                  className="
                    absolute -top-1.5 right-0 -translate-y-1 translate-x-2
                    text-[9px] font-black uppercase tracking-wider
                    bg-rose-500 text-white px-1.5 py-0.5 rounded-full
                    leading-tight shadow-xs animate-pulse
                  "
                >
                  Hot
                </span>

                <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
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
                className="
                  hover:text-blue-600 transition-colors
                  cursor-pointer py-3
                "
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
                className="
                  hover:text-blue-600 transition-colors
                  cursor-pointer py-3
                "
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
                className="
                  hover:text-blue-600 transition-colors
                  cursor-pointer py-3
                "
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
                className="
                  hover:text-blue-600 transition-colors
                  cursor-pointer py-3
                "
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
