import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { SlidersHorizontal, RotateCcw, Search } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const { products, categories, filter, setFilter, resetFilter } = useStore();

  // Phone-e filter box default-e lukano thake, button-e click korle khule
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique brands
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

  // Filter products
  const filteredProducts = products.filter((p) => {
    // Category
    if (filter.category !== 'All' && p.category !== filter.category) return false;
    // Search query
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    // Price range
    const effectivePrice = p.salePrice || p.regularPrice;
    if (effectivePrice < filter.minPrice || effectivePrice > filter.maxPrice) return false;
    // Brand
    if (filter.brand !== 'All' && p.brand !== filter.brand) return false;
    // In-stock
    if (filter.inStockOnly && p.stock <= 0) return false;

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.salePrice || a.regularPrice;
    const priceB = b.salePrice || b.regularPrice;

    if (filter.sortBy === 'price-asc') return priceA - priceB;
    if (filter.sortBy === 'price-desc') return priceB - priceA;
    if (filter.sortBy === 'bestseller') return b.salesCount - a.salesCount;
    if (filter.sortBy === 'rating') return b.rating - a.rating;
    if (filter.sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
    // Default featured
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const hasActiveFilters =
    filter.category !== 'All' ||
    Boolean(filter.search) ||
    filter.brand !== 'All' ||
    filter.minPrice > 0 ||
    filter.maxPrice < 200000 ||
    filter.inStockOnly;

  const inputCls =
    'w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20';

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-slate-200">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight break-words">
            {filter.category === 'All' ? 'All Products' : filter.category}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {sortedProducts.length} products
            {filter.search && (
              <span>
                {' '}
                matching &quot;<strong className="text-slate-800">{filter.search}</strong>&quot;
              </span>
            )}
          </p>
        </div>

        {/* Filters toggle (phone), Reset & Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg transition-colors hover:border-brand-600 hover:text-brand-600 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilter}
              className="px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Filters</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm">
            <span className="hidden sm:inline text-slate-500 px-1 font-medium">Sort by:</span>
            <select
              value={filter.sortBy}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  sortBy: e.target.value as any,
                }))
              }
              className="bg-transparent rounded-lg px-2 py-1.5 font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Picks</option>
              <option value="bestseller">Best Selling</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2-Column Catalog: Filters Sidebar & Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Filters Sidebar */}
        <div
          className={`${
            showFilters ? 'block' : 'hidden'
          } lg:block min-w-0 space-y-6 bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-sm h-fit`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              <span>Filter Catalog</span>
            </div>
          </div>

          {/* Search in Catalog */}
          <div>
            <label className="text-sm font-semibold text-slate-800 block mb-2">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
                placeholder="Keyword, model or tag..."
                className={`${inputCls} pl-9`}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Department / Category Selection */}
          <div>
            <label className="text-sm font-semibold text-slate-800 block mb-2">Departments</label>
            <div className="space-y-1">
              <button
                onClick={() => setFilter((f) => ({ ...f, category: 'All' }))}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                  filter.category === 'All'
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'
                }`}
              >
                <span>All Departments</span>
                <span className="text-xs text-slate-400">{products.length}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilter((f) => ({ ...f, category: c.name }))}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                    filter.category === c.name
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-xs text-slate-400 shrink-0">{c.itemCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-x-2 text-sm font-semibold text-slate-800 mb-2">
              <span>Price Range</span>
              <span className="text-brand-600 text-xs font-semibold">
                ৳{filter.minPrice.toLocaleString()} - ৳{filter.maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="2000"
              value={filter.maxPrice}
              onChange={(e) => setFilter((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>৳0</span>
              <span>৳100,000</span>
              <span>৳200,000+</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-800 block mb-2">Brand</label>
            <select
              value={filter.brand}
              onChange={(e) => setFilter((f) => ({ ...f, brand: e.target.value }))}
              className={`${inputCls} cursor-pointer font-medium`}
            >
              <option value="All">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filter.inStockOnly}
                onChange={(e) => setFilter((f) => ({ ...f, inStockOnly: e.target.checked }))}
                className="w-4 h-4 rounded accent-brand-600 border-slate-300"
              />
              <span>In-Stock Items Only</span>
            </label>
          </div>
        </div>

        {/* Product Grid Area (3 Cols) */}
        <div className="lg:col-span-3 min-w-0">
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {sortedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-8 sm:p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                No matching products found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                Try loosening your filters, adjusting the price range, or clearing search keywords.
              </p>
              <button
                onClick={resetFilter}
                className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-lg active:translate-y-0"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};