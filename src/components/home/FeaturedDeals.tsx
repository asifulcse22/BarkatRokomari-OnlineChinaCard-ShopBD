import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';

export const FeaturedDeals: React.FC = () => {
  const { products, setFilter, setActiveCustomerPage } = useStore();

  // Find the top 5 flagship products
  const bestSellingProducts = [
    products.find((p) => p.id === 'prod-iphone15') || products[0],
    products.find((p) => p.id === 'prod-sony-wh1000xm5') || products[1],
    products.find((p) => p.id === 'prod-asus-vivobook') || products[2],
    products.find((p) => p.id === 'prod-galaxy-watch6') || products[3],
    products.find((p) => p.id === 'prod-nike-running') || products[4],
  ].filter(Boolean);

  const handleNavigate = (category: string) => {
    setFilter((f) => ({ ...f, category, search: '' }));
    setActiveCustomerPage('catalog');
  };

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-14">
      {/* 1. Best Selling Products Header with Live Indicator & Motion */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-200/60 shadow-xs">
              <Flame className="w-4 h-4 fill-orange-500 animate-bounce" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Best Selling Products
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              Live Trending
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Top customer rated and highly demanded products with instant shipping.
          </p>
        </div>

        <motion.button
          whileHover={{ x: 3 }}
          onClick={() => {
            setFilter((f) => ({ ...f, category: 'All', sortBy: 'bestseller' }));
            setActiveCustomerPage('catalog');
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>View All Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* 2. Row of 5 Product Cards with Grid Animation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
        {bestSellingProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 3. Triple Campaign Promotional Banners Row with High-End Motion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Banner 1: Fresh Groceries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ duration: 0.25 }}
          onClick={() => handleNavigate('Groceries & Daily Needs')}
          className="group relative rounded-2xl p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100/70 border border-emerald-200/80 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer flex items-center justify-between overflow-hidden min-h-[170px]"
        >
          <div className="relative z-10 space-y-1.5 max-w-[55%]">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block">
              Fresh Daily Essentials
            </span>
            <h4 className="text-base font-extrabold text-slate-900 leading-tight">
              Farm Fresh<br />Delivered Home
            </h4>
            <p className="text-[11px] text-slate-600 font-medium">Quality produce everyday</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 group-hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition-colors shadow-sm">
                <span>Shop Grocery</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"
            alt="Fresh Groceries"
            className="w-32 h-32 object-contain object-right drop-shadow-md group-hover:scale-110 transition-transform duration-500"
          />
        </motion.div>

        {/* Banner 2: Fashion Sale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.25 }}
          whileHover={{ y: -6, scale: 1.01 }}
          onClick={() => handleNavigate('Fashion & Clothing')}
          className="group relative rounded-2xl p-6 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100/70 border border-rose-200/80 shadow-xs hover:shadow-xl hover:shadow-rose-500/10 transition-all cursor-pointer flex items-center justify-between overflow-hidden min-h-[170px]"
        >
          <div className="relative z-10 space-y-1.5 max-w-[55%]">
            <span className="text-xs font-black text-rose-600 uppercase tracking-wider block">
              Seasonal Collection
            </span>
            <h4 className="text-base font-extrabold text-slate-900 leading-tight">
              Designer Trends<br />Up to 60% Off
            </h4>
            <p className="text-[11px] text-slate-600 font-medium">Elevate your daily look</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 group-hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl transition-colors shadow-sm">
                <span>Shop Fashion</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80"
            alt="Fashion Trends"
            className="w-32 h-32 object-contain object-right drop-shadow-md group-hover:scale-110 transition-transform duration-500"
          />
        </motion.div>

        {/* Banner 3: Latest Electronics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.25 }}
          whileHover={{ y: -6, scale: 1.01 }}
          onClick={() => handleNavigate('Electronics')}
          className="group relative rounded-2xl p-6 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0b1329] text-white border border-slate-800 shadow-xs hover:shadow-xl hover:shadow-blue-500/15 transition-all cursor-pointer flex items-center justify-between overflow-hidden min-h-[170px]"
        >
          <div className="relative z-10 space-y-1.5 max-w-[55%]">
            <span className="text-xs font-black text-cyan-400 uppercase tracking-wider block flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Smart Gadgets</span>
            </span>
            <h4 className="text-base font-extrabold text-white leading-tight">
              Next-Gen Tech<br />& Studio Sound
            </h4>
            <p className="text-[11px] text-slate-400 font-normal">Authentic brand warranty</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 group-hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl transition-colors shadow-sm shadow-blue-500/25">
                <span>Shop Electronics</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80"
            alt="Latest Electronics"
            className="w-32 h-32 object-contain object-right drop-shadow-md group-hover:scale-110 transition-transform duration-500"
          />
        </motion.div>
      </div>
    </section>
  );
};
