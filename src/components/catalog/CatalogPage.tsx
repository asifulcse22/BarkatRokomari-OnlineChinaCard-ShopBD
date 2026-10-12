import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  Check,
  ChevronDown,
  Layers,
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const { products, categories, filter, setFilter, resetFilter } = useStore();

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

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
            {filter.category === 'All' ? 'All Products' : filter.category}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {sortedProducts.length} curated products
            {filter.search && (
              <span>
                {' '}
                matching &quot;<strong className="text-slate-800">{filter.search}</strong>&quot;
              </span>
            )}
          </p>
        </div>

        {/* Sorting Dropdown & Reset */}
        <div className="flex items-center gap-3">
          {(filter.category !== 'All' ||
            filter.search ||
            filter.brand !== 'All' ||
            filter.minPrice > 0 ||
            filter.maxPrice < 200000 ||
            filter.inStockOnly) && (
            <button
              onClick={resetFilter}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 text-xs">
            <span className="text-slate-500 px-2 font-medium">Sort by:</span>
            <select
              value={filter.sortBy}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  sortBy: e.target.value as any,
                }))
              }
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none cursor-pointer"
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filter Catalog</span>
            </div>
          </div>

          {/* Search in Catalog */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
                placeholder="Keyword, model or tag..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Department / Category Selection */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">Departments</label>
            <div className="space-y-1">
              <button
                onClick={() => setFilter((f) => ({ ...f, category: 'All' }))}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                  filter.category === 'All'
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Departments</span>
                <span className="text-[11px] text-slate-400">{products.length}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilter((f) => ({ ...f, category: c.name }))}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    filter.category === c.name
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[11px] text-slate-400 shrink-0">{c.itemCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span>Price Range</span>
              <span className="text-blue-600 font-mono">৳{filter.minPrice.toLocaleString()} - ৳{filter.maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="2000"
              value={filter.maxPrice}
              onChange={(e) => setFilter((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>৳0</span>
              <span>৳100,000</span>
              <span>৳200,000+</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">Brand</label>
            <select
              value={filter.brand}
              onChange={(e) => setFilter((f) => ({ ...f, brand: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer font-medium"
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
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filter.inStockOnly}
                onChange={(e) => setFilter((f) => ({ ...f, inStockOnly: e.target.checked }))}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>In-Stock Items Only</span>
            </label>
          </div>
        </div>

        {/* Product Grid Area (3 Cols) */}
        <div className="lg:col-span-3">
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {sortedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No matching products found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Try loosening your filters, adjusting the price range, or clearing search keywords.
              </p>
              <button
                onClick={resetFilter}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
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
