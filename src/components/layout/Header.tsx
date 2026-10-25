import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  Heart,
  Package,
  ChevronDown,
  Phone,
  Truck,
  ArrowRight,
  Menu,
  ShoppingCart,
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

  type Page = Parameters<typeof setActiveCustomerPage>[0];

  const goTo = (page: Page) => {
    setActiveCustomerPage(page);
    setViewMode('customer');
  };

  const goAccount = (tab: 'tracking' | 'wishlist' | 'support') => {
    try {
      sessionStorage.setItem('sz-account-tab', tab);
    } catch {
      // ignore
    }
    goTo('account');
  };

  // Live search results
  const q = searchQuery.trim().toLowerCase();
  const searchResults = q
    ? products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  // Close dropdowns on outside click
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applySearch = () => {
    if (!searchQuery.trim()) return;
    setFilter((prev) => ({
      ...prev,
      search: searchQuery.trim(),
      category: 'All',
    }));
    goTo('catalog');
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    applySearch();
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    goTo('product-detail');
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleCategoryClick = (categoryName: string) => {
    setFilter((prev) => ({
      ...prev,
      category: categoryName,
      search: '',
    }));
    goTo('catalog');
    setIsCategoryMenuOpen(false);
  };

  const isHome = activeCustomerPage === 'home' && viewMode === 'customer';

  const navLinks = [
    {
      label: 'Home',
      active: activeCustomerPage === 'home' && viewMode === 'customer',
      onClick: () => goTo('home'),
    },
    {
      label: 'Shop',
      onClick: () => {
        setFilter((f) => ({ ...f, category: 'All' }));
        goTo('catalog');
      },
    },
    {
      label: 'Deals',
      badge: 'Hot',
      onClick: () => {
        setFilter((f) => ({ ...f, category: 'All', sortBy: 'bestseller' }));
        goTo('catalog');
      },
    },
    {
      label: 'New Arrivals',
      onClick: () => {
        setFilter((f) => ({ ...f, sortBy: 'newest' }));
        goTo('catalog');
      },
    },
    {
      label: 'Best Sellers',
      onClick: () => {
        setFilter((f) => ({ ...f, sortBy: 'bestseller' }));
        goTo('catalog');
      },
    },
    { label: 'Order Tracking', onClick: () => goAccount('tracking') },
    { label: 'Support Center', onClick: () => goAccount('support') },
  ];

  const toggleAdmin = () => {
    if (viewMode === 'customer') {
      setViewMode('admin');
      setActiveAdminTab('ai-center');
    } else {
      goTo('home');
    }
  };

  const badgeCls =
    'absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white';
  const actionCls =
    'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-slate-700 transition-colors hover:text-brand-600';

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Utility bar */}
      <div className="border-b border-slate-100 bg-slate-50 text-xs text-slate-600">
        <div className="mx-auto flex h-9 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="hidden items-center gap-6 sm:flex">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Free shipping above ৳1,000
            </span>
            <span className="hidden md:inline">7 days easy return</span>
            <span className="hidden lg:inline">Cash on delivery available</span>
          </div>

          <div className="ml-auto flex items-center gap-4 sm:gap-5">
            <a
              href="tel:+8801911561232"
              className="flex items-center gap-1.5 font-medium text-slate-800 transition-colors hover:text-brand-600"
            >
              <Phone className="h-3.5 w-3.5" />
              +8801911561232
            </a>
            <span className="hidden md:inline">24/7 support</span>
            <button
              type="button"
              onClick={toggleAdmin}
              className="cursor-pointer rounded border border-slate-300 px-2 py-0.5 font-medium text-slate-700 transition-colors hover:border-brand-600 hover:text-brand-600"
              title="Switch between storefront and admin"
            >
              {viewMode === 'admin' ? 'Storefront' : 'Admin'}
            </button>
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          type="button"
          onClick={() => goTo('home')}
          aria-label="বরকত রকমারী হোম"
          className="order-1 shrink-0 cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <img
            src="/logo-backup.png"
            alt="বরকত রকমারী — China Card Online Shop BD"
            className="block h-10 w-auto max-w-[170px] object-contain object-left sm:h-12 sm:max-w-[220px]"
          />
        </button>

        {/* Search (wraps to its own row on mobile) */}
        <div
          ref={searchRef}
          className="relative order-3 w-full md:order-2 md:w-auto md:max-w-2xl md:flex-1"
        >
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search products, brands and categories"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-4 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute bottom-1 right-1 top-1 flex cursor-pointer items-center justify-center rounded-md bg-brand-600 px-3.5 text-white transition-colors hover:bg-brand-700"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <AnimatePresence>
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
              >
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectProduct(product.id)}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-10 w-10 shrink-0 rounded border border-slate-100 bg-white object-contain p-1"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {product.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.category} · {product.brand}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        ৳{(product.salePrice || product.regularPrice).toLocaleString()}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-5 text-center text-sm text-slate-500">
                    No products found for &quot;{searchQuery}&quot;
                  </div>
                )}

                <button
                  type="button"
                  onClick={applySearch}
                  className="flex w-full cursor-pointer items-center justify-center gap-1 border-t border-slate-100 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-slate-50"
                >
                  View all results
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="order-2 ml-auto flex items-center gap-1 sm:gap-2 md:order-3">
          <button
            type="button"
            onClick={() => goAccount('tracking')}
            className={actionCls}
            aria-label="Track order"
          >
            <Package className="h-5 w-5" />
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-sm font-semibold text-slate-900">Track Order</span>
              <span className="block text-xs text-slate-500">Check status</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => goAccount('wishlist')}
            className={actionCls}
            aria-label="Wishlist"
          >
            <span className="relative">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && <span className={badgeCls}>{wishlist.length}</span>}
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-sm font-semibold text-slate-900">Wishlist</span>
              <span className="block text-xs text-slate-500">{wishlist.length} saved</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={actionCls}
            aria-label="Cart"
          >
            <span className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className={badgeCls}>{cartCount}</span>}
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-sm font-semibold text-slate-900">Cart</span>
              <span className="block text-xs font-medium text-brand-600">
                ৳{cartTotal.toLocaleString()}
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Main Navigation" className="bg-slate-900">
        <div className="mx-auto flex h-12 max-w-[1600px] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <div
            className={`relative shrink-0 ${isHome ? 'lg:hidden' : ''}`}
            ref={categoryRef}
          >
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
              aria-expanded={isCategoryMenuOpen}
              aria-haspopup="true"
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <Menu className="h-4 w-4" />
              <span>All Categories</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isCategoryMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isCategoryMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 mt-1 max-h-[70vh] w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.name)}
                        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-600"
                      >
                        <span className="min-w-0 break-words">{cat.name}</span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {cat.itemCount}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      No categories available
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex min-w-0 flex-1 items-stretch gap-6 self-stretch overflow-x-auto whitespace-nowrap text-sm font-medium text-slate-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={link.onClick}
                className={`flex cursor-pointer items-center gap-1.5 border-b-2 transition-colors ${
                  link.active
                    ? 'border-brand-600 text-white'
                    : 'border-transparent hover:text-white'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="rounded bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};