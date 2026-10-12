import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import {
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Activity,
  Gamepad2,
  BookOpen,
  ShoppingBag,
  Car,
  HeartPulse,
  MoreHorizontal,
  ChevronRight,
  ArrowRight,
  ChevronLeft,
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw,
  Zap,
} from 'lucide-react';

const CATEGORIES_SIDEBAR = [
  { name: 'Electronics & Gadgets', icon: Laptop, key: 'Electronics' },
  { name: 'Fashion & Clothing', icon: Shirt, key: 'Fashion & Clothing' },
  { name: 'Home & Living', icon: Home, key: 'Home & Living' },
  { name: 'Beauty & Personal Care', icon: Sparkles, key: 'Beauty & Personal Care' },
  { name: 'Sports & Outdoors', icon: Activity, key: 'Sports & Outdoors' },
  { name: 'Gaming & Gear', icon: Gamepad2, key: 'Toys & Games' },
  { name: 'Books & Stationery', icon: BookOpen, key: 'Books & Stationery' },
  { name: 'Groceries & Daily', icon: ShoppingBag, key: 'Groceries & Daily Needs' },
  { name: 'Automotive Accessories', icon: Car, key: 'Automotive' },
  { name: 'Health & Wellness', icon: HeartPulse, key: 'Health & Wellness' },
  { name: 'All Categories', icon: MoreHorizontal, key: 'All' },
];

const HERO_SLIDES = [
  {
    kicker: '⚡ Next-Generation Flagships',
    title: 'Smart Tech &\nModern Gadgets',
    description: 'Explore the latest smartphones, ultrabooks, and studio audio with official brand warranty.',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=85',
    category: 'Electronics',
    tag: 'Save up to 40%',
    themeColor: 'from-blue-600 to-indigo-600',
  },
  {
    kicker: '🏡 Contemporary Interior',
    title: 'Upgrade Your\nHome & Living',
    description: 'Stylish furniture, ambient lighting, and intelligent kitchen appliances curated for comfort.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85',
    category: 'Home & Living',
    tag: 'Up to 50% OFF',
    themeColor: 'from-indigo-600 to-blue-500',
  },
  {
    kicker: '🎧 Studio Grade Precision',
    title: 'Immersive Audio\n& Pro Gaming',
    description: 'Noise-cancelling headphones and high-refresh mechanical accessories for audiophiles.',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85',
    category: 'Electronics',
    tag: 'Exclusive Deal',
    themeColor: 'from-cyan-600 to-blue-700',
  },
  {
    kicker: '✨ Summer Edition 2026',
    title: 'Elevate Your\nDaily Style',
    description: 'Handcrafted premium sneakers, luxury wristwatches, and breathable designer fits.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
    category: 'Fashion & Clothing',
    tag: 'New Season',
    themeColor: 'from-violet-600 to-indigo-700',
  },
];

export const HeroBanner: React.FC = () => {
  const { setFilter, setActiveCustomerPage } = useStore();
  const [heroSlide, setHeroSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play slideshow with smooth interval
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleCategoryClick = (catKey: string) => {
    setFilter((f) => ({ ...f, category: catKey, search: '' }));
    setActiveCustomerPage('catalog');
  };

  const currentSlideData = HERO_SLIDES[heroSlide];

  const handleSlideAction = () => {
    setFilter((f) => ({ ...f, category: currentSlideData.category, search: '' }));
    setActiveCustomerPage('catalog');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Vertical Category Menu + Promo Card (3 cols) */}
        {/* ========================================================= */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
          {/* Vertical Category Navigation List with Hover Motion */}
          <div className="bg-white rounded-b-2xl border-x border-b border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {CATEGORIES_SIDEBAR.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ x: 4, backgroundColor: '#f8fafc' }}
                    onClick={() => handleCategoryClick(cat.key)}
                    className="w-full text-left px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <span>{cat.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Left Promotional Box: "Weekly Tech Deals" with Motion Glow */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="relative rounded-2xl overflow-hidden min-h-[300px] bg-gradient-to-br from-[#0b1329] via-[#0f172a] to-[#1e1b4b] text-white flex flex-col justify-between p-6 shadow-md border border-slate-800 group cursor-pointer"
            onClick={() => {
              setFilter((f) => ({ ...f, category: 'All', sortBy: 'bestseller' }));
              setActiveCustomerPage('catalog');
            }}
          >
            {/* Background Image with Ambient Glow */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
                alt="Curated Tech & Gear"
                className="w-full h-full object-cover object-center opacity-45 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/85 to-transparent" />
            </div>

            {/* Content Top */}
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Weekly Mega Drop</span>
              </div>

              <h3 className="text-xl font-black text-white leading-tight tracking-tight pt-1">
                Curated Tech<br />& Smart Living
              </h3>
              <p className="text-[11px] text-slate-300 font-normal leading-relaxed">
                Discover verified authentic electronics with instant delivery nationwide.
              </p>

              <div className="pt-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.div>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-[10px] text-slate-400">
              <span>Up to 45% OFF</span>
              <span className="font-semibold text-blue-400">ShopZone Verified</span>
            </div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: Main Hero Slider + Trust Badges (6 cols)   */}
        {/* ========================================================= */}
        <div
          className="lg:col-span-6 flex flex-col gap-4"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Hero Slider with Motion AnimatePresence */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md min-h-[430px] md:min-h-[460px] flex flex-col justify-between p-8 md:p-10 select-none">
            {/* Slider Content & Background with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={heroSlide}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <img
                  src={currentSlideData.image}
                  alt={currentSlideData.title}
                  className="w-full h-full object-cover object-center"
                />
                {/* Gradient scrim for readable text */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-transparent md:w-3/4" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Left & Right Slider Arrow Controls with Hover Bounce */}
            <motion.button
              whileHover={{ scale: 1.15, backgroundColor: '#ffffff' }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                setHeroSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.15, backgroundColor: '#ffffff' }}
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                setHeroSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </motion.button>

            {/* Floating Floating Badge on Top Right with Smooth Hover / Float Animation */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="absolute top-6 right-6 z-20 w-20 h-20 md:w-22 md:h-22 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex flex-col items-center justify-center text-center shadow-xl ring-4 ring-white/20 backdrop-blur-md"
            >
              <span className="text-[10px] font-black leading-none uppercase tracking-wider text-cyan-200">
                Exclusive
              </span>
              <span className="text-xl md:text-2xl font-black leading-none mt-1">
                50%
              </span>
              <span className="text-[9px] font-extrabold leading-none uppercase tracking-widest text-white/90">
                OFF
              </span>
            </motion.div>

            {/* Content Area with Staggered Entrance */}
            <div className="relative z-10 max-w-sm sm:max-w-md space-y-3.5 pt-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroSlide}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3"
                >
                  <span className="inline-block text-xs font-black tracking-wide text-cyan-400 uppercase">
                    {currentSlideData.kicker}
                  </span>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight whitespace-pre-line drop-shadow-md">
                    {currentSlideData.title}
                  </h1>

                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal">
                    {currentSlideData.description}
                  </p>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleSlideAction}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/30"
                    >
                      <span>Shop Collection</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Animated Pagination Indicators */}
            <div className="relative z-10 flex items-center gap-2 pt-4">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    heroSlide === idx
                      ? 'w-7 bg-blue-500 shadow-md shadow-blue-500/50'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Trust Badges Card directly under Hero Slider with Motion Micro-Interactions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
            {/* 1. Free Shipping */}
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              className="flex items-center gap-3 p-1 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <h4 className="text-xs font-bold text-slate-900">Free Shipping</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">On orders above ৳1,000</p>
              </div>
            </motion.div>

            {/* 2. Secure Payment */}
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              className="flex items-center gap-3 p-1 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <h4 className="text-xs font-bold text-slate-900">100% Secure</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Encrypted Checkout</p>
              </div>
            </motion.div>

            {/* 3. 24/7 Support */}
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              className="flex items-center gap-3 p-1 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-100 shadow-xs">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <h4 className="text-xs font-bold text-slate-900">24/7 Hotline</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Dedicated support</p>
              </div>
            </motion.div>

            {/* 4. Easy Returns */}
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              className="flex items-center gap-3 p-1 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <h4 className="text-xs font-bold text-slate-900">7-Day Returns</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Hassle-free guarantee</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: 3 Stacked High-Tech Promo Cards (3 cols)     */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          {/* Card 1: Studio Audio / Headphones with Motion */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setFilter((f) => ({ ...f, category: 'Electronics', search: 'Sony' }));
              setActiveCustomerPage('catalog');
            }}
            className="group relative rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-100/80 shadow-2xs hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer flex items-center justify-between overflow-hidden min-h-[150px]"
          >
            <div className="relative z-10 space-y-1 max-w-[60%]">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Audio Gear</span>
              <h4 className="text-xs font-black text-slate-900 leading-tight">
                Studio Quality<br />Headphones
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">Crystal-clear sound</p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 group-hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs">
                  <span>Shop Now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
              alt="Premium Headphones"
              className="w-24 h-24 object-contain object-right drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            />
          </motion.div>

          {/* Card 2: Urban Footwear / Sneakers */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setFilter((f) => ({ ...f, category: 'Fashion & Clothing', search: 'Nike' }));
              setActiveCustomerPage('catalog');
            }}
            className="group relative rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-pink-50/60 border border-purple-100/80 shadow-2xs hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer flex items-center justify-between overflow-hidden min-h-[150px]"
          >
            <div className="relative z-10 space-y-1 max-w-[60%]">
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">Urban Style</span>
              <h4 className="text-xs font-black text-slate-900 leading-tight">
                Trending<br />Sneakers
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">Step into fresh comfort</p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 group-hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs">
                  <span>Shop Now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80"
              alt="Latest Sneakers"
              className="w-24 h-24 object-contain object-right drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            />
          </motion.div>

          {/* Card 3: Next-Gen Smartwatches */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setFilter((f) => ({ ...f, category: 'Electronics', search: 'Watch' }));
              setActiveCustomerPage('catalog');
            }}
            className="group relative rounded-2xl p-4 bg-gradient-to-br from-cyan-50 to-sky-50/60 border border-cyan-100/80 shadow-2xs hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer flex items-center justify-between overflow-hidden min-h-[150px]"
          >
            <div className="relative z-10 space-y-1 max-w-[60%]">
              <span className="text-[10px] font-black text-cyan-600 uppercase tracking-wider">Wearables</span>
              <h4 className="text-xs font-black text-slate-900 leading-tight">
                Next-Gen<br />Smartwatches
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">Fitness & connectivity</p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-600 group-hover:bg-cyan-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs">
                  <span>Shop Now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80"
              alt="Smart Watches"
              className="w-24 h-24 object-contain object-right drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
