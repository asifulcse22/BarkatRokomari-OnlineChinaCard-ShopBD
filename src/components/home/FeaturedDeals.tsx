
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { ArrowRight, Flame, Sparkles } from 'lucide-react';

export const FeaturedDeals: React.FC = () => {
  const { products, setFilter, setActiveCustomerPage, openSetupGuide } = useStore();

  const [bestsellerTab, setBestsellerTab] = useState<
    'all' | 'smart' | 'electronics'
  >('all');

  // নির্দিষ্ট ৪টি Featured Smart Gadget আগের মতোই থাকবে।
  const smartProductIds = [
    'prod-wifi-bulb-cam',
    'prod-gps-tracker-mini',
    'prod-motion-sensor-bulb',
    'prod-remote-sensor-holder',
  ];

  const smartGadgets = smartProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  // আগে থেকে নির্ধারিত Best Selling পণ্যগুলোর অগ্রাধিকার।
  // নতুন mockData-তে এগুলো না থাকলে পরের পণ্যগুলো দেখানো হবে।
  const preferredBestSellerIds = [
    'prod-iphone15',
    'prod-sony-wh1000xm5',
    'prod-asus-vivobook',
    'prod-galaxy-watch6',
    'prod-solar-motion-light',
    'prod-dual-lens-camera',
    'prod-mini-ip-camera',
  ];

  // Smart Gadget বাদ দিয়ে নির্দিষ্ট ID-র পণ্যগুলো খুঁজে বের করা।
  
  // আগে থেকে নির্ধারিত Best Selling পণ্যগুলো খুঁজে বের করা।
  const preferredOtherBestSellers = preferredBestSellerIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => product !== undefined)
    .filter((product) => !smartProductIds.includes(product.id));


  // যেসব পণ্য নির্দিষ্ট তালিকায় নেই, সেগুলোও যুক্ত করা।
  // ফলে mockData বা admin থেকে নতুন পণ্য যোগ করলে তা বাদ পড়বে না।
  const additionalProducts = products.filter(
    (product) =>
      !smartProductIds.includes(product.id) &&
      !preferredOtherBestSellers.some(
        (existingProduct) => existingProduct.id === product.id
      )
  );

  // Smart Gadget আগে, তারপর অন্যান্য পণ্য।
  // একই ID-র পণ্য একবারই থাকবে।
  const otherBestSellers = [
    ...preferredOtherBestSellers,
    ...additionalProducts,
  ].filter(
    (product, index, list) =>
      list.findIndex((item) => item.id === product.id) === index
  );

  const allBestSellingProducts = [
    ...smartGadgets,
    ...otherBestSellers,
  ].filter(
    (product, index, list) =>
      list.findIndex((item) => item.id === product.id) === index
  );

  const displayedProducts =
    bestsellerTab === 'smart'
      ? smartGadgets
      : bestsellerTab === 'electronics'
        ? otherBestSellers
        : allBestSellingProducts;

  const handleNavigate = (category: string) => {
    setFilter((filter) => ({
      ...filter,
      category,
      search: '',
    }));

    setActiveCustomerPage('catalog');
  };

  return (
    /*<section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-14"> */
    <section className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-14 min-w-0">

      {/* 1. Best Selling Products Header with Live Indicator & Motion */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-200/60 shadow-xs">
              <Flame className="w-4 h-4 fill-orange-500 animate-bounce" />
            </div>

            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Best Selling Products</span>
              <span className="text-slate-500 font-semibold text-sm sm:text-base">
                (বেস্ট সেলিং পণ্যসমূহ)
              </span>
            </h2>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
              🔥 শীর্ষ ৪টি স্মার্ট গ্যাজেটযুক্ত
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-1 font-medium">
            ওয়াইফাই ক্যামেরা, জিপিএস ট্র্যাকার, মোশন সেন্সর বাতি ও রিমোট
            হোল্ডারসহ সবচেয়ে বেশি বিক্রিত জনপ্রিয় পণ্য।
          </p>
        </div>

        {/* Tab Switcher & View All Button */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setBestsellerTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                bestsellerTab === 'all'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সকল সেরা ({allBestSellingProducts.length})
            </button>

            <button
              onClick={() => setBestsellerTab('smart')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                bestsellerTab === 'smart'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🛠️ ৪টি স্মার্ট গ্যাজেট</span>
            </button>

            <button
              onClick={() => setBestsellerTab('electronics')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                bestsellerTab === 'electronics'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              অন্যান্য ডিভাইস
            </button>
          </div>

          <motion.button
            whileHover={{ x: 3 }}
            onClick={() => {
              setFilter((filter) => ({
                ...filter,
                category: 'All',
                sortBy: 'bestseller',
              }));

              setActiveCustomerPage('catalog');
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer ml-1"
          >
            <span>সকল পণ্য দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* 2. Grid of Product Cards: 4 Smart Products Guaranteed in Top Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mb-12 w-full min-w-0">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 2.1 Featured 4 Smart Gadgets with Dedicated Setup Guide Showcase */}
      {smartGadgets.length > 0 && (
        <div className="mb-14 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800/60 shadow-xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                  🛠️
                </span>

                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  নতুন ৪টি ট্রেন্ডিং স্মার্ট গ্যাজেট (সহজ সেটআপ গাইডসহ)
                </h3>

                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 animate-pulse">
                  মেগা অফার
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium">
                ওয়াইফাই ক্যামেরা, জিপিএস ট্র্যাকার, মোশন বাতি ও রিমোট হোল্ডার
                — প্রতিটি পণ্যের সাথে দেওয়া হয়েছে ধাপে ধাপে সহজ সেটআপ নির্দেশিকা।
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openSetupGuide()}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto border border-white/20"
            >
              <span>🛠️ সবগুলোর সেটআপ গাইড দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* 4 Smart Gadget Cards */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {smartGadgets.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

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
              Farm Fresh
              <br />
              Delivered Home
            </h4>

            <p className="text-[11px] text-slate-600 font-medium">
              Quality produce everyday
            </p>

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
              Designer Trends
              <br />
              Up to 60% Off
            </h4>

            <p className="text-[11px] text-slate-600 font-medium">
              Elevate your daily look
            </p>

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
              Next-Gen Tech
              <br />
              & Studio Sound
            </h4>

            <p className="text-[11px] text-slate-400 font-normal">
              Authentic brand warranty
            </p>

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
