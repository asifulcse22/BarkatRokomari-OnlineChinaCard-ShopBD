import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Menu,
  Tag,
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
  Truck,
  Banknote,
  RotateCcw,
  Headphones,
} from 'lucide-react';

// File: src/components/home/HeroBanner.tsx
// Slider ar dane-r banner apnar nijer product theke toiri hoy.

type IconType = React.ComponentType<{ className?: string }>;

const CATEGORY_ICONS: Record<string, IconType> = {
  Electronics: Laptop,
  'Fashion & Clothing': Shirt,
  'Home & Living': Home,
  'Beauty & Personal Care': Sparkles,
  'Sports & Outdoors': Activity,
  'Toys & Games': Gamepad2,
  'Books & Stationery': BookOpen,
  'Groceries & Daily Needs': ShoppingBag,
  Automotive: Car,
  'Health & Wellness': HeartPulse,
};

// Kon product slider-e ar kon product dane-r banner-e jabe (ID diye thik kora)
const SLIDE_PRODUCT_IDS = [
  'prod-wifi-bulb-cam',
  'prod-gps-tracker-mini',
  'prod-motion-sensor-bulb',
  'prod-remote-sensor-holder',
  'prod-solar-motion-light',
];
const BANNER_PRODUCT_IDS = ['prod-dual-lens-camera', 'prod-mini-ip-camera'];

// Chaile kono product-er jonno alada lomba (wide) banner chhobi dite paren.
// Chhobi ta public/banners/ folder-e rekhe ekhane lekhun, jemon:
// 'prod-wifi-bulb-cam': '/banners/wifi-camera.jpg'
// Na dile product-er nijer chhobi-i banner-e boshbe.
const BANNER_IMAGES: Record<string, string> = {};

const TRUST_ITEMS = [
  { icon: Truck, title: 'Free shipping', text: 'On orders above ৳1,000' },
  { icon: Banknote, title: 'Cash on delivery', text: 'Pay when you receive' },
  { icon: RotateCcw, title: '7-day returns', text: 'Easy return policy' },
  { icon: Headphones, title: '24/7 support', text: 'Call or WhatsApp' },
];

const isProduct = (p: Product | undefined): p is Product => Boolean(p);

// "বাংলা নাম (English Name)" theke shudhu bangla nam ney
const shortTitle = (title: string) => {
  const m = title.match(/^(.*?)\s*\(.*\)\s*$/);
  return m && m[1] ? m[1] : title;
};

export const HeroBanner: React.FC = () => {
  const {
    products,
    categories,
    setFilter,
    setActiveCustomerPage,
    setSelectedProductId,
  } = useStore();

  const [heroSlide, setHeroSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Product theke slide ar banner bachai
  const pick = (ids: string[]) =>
    ids.map((id) => products.find((p) => p.id === id)).filter(isProduct);

  let slideProducts = pick(SLIDE_PRODUCT_IDS);
  const bannerProducts = pick(BANNER_PRODUCT_IDS);
  const used = new Set([...slideProducts, ...bannerProducts].map((p) => p.id));
  const spare = products.filter((p) => !used.has(p.id));

  // ID mile na gele onno product diye bhore dey (notun/admin product-o kaj korbe)
  if (slideProducts.length === 0) slideProducts = spare.splice(0, 5);
  while (bannerProducts.length < 2 && spare.length > 0) {
    bannerProducts.push(spare.shift() as Product);
  }

  const count = slideProducts.length;
  const current = count ? heroSlide % count : 0;

  useEffect(() => {
    if (isPaused || count < 2) return;
    const timer = setTimeout(() => {
      setHeroSlide((prev) => (prev + 1) % count);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isPaused, count, heroSlide]);

  const openCatalog = (category: string) => {
    setFilter((f) => ({ ...f, category, search: '' }));
    setActiveCustomerPage('catalog');
  };

  const openProduct = (p: Product) => {
    setSelectedProductId(p.id);
    setActiveCustomerPage('product-detail');
  };

  const prev = () => setHeroSlide((i) => (count ? (i - 1 + count) % count : 0));
  const next = () => setHeroSlide((i) => (count ? (i + 1) % count : 0));

  const arrowCls =
    'absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white sm:h-10 sm:w-10';

  return (
    <section className="mx-auto max-w-[1600px] px-4 pb-2 pt-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Category sidebar (large screens) */}
        <nav
          aria-label="Categories"
          className="hidden h-[400px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-3 lg:flex"
        >
          <div className="flex shrink-0 items-center gap-2 bg-brand-600 px-4 py-3 text-sm font-semibold text-white">
            <Menu className="h-4 w-4" />
            Shop by Category
          </div>

          <ul className="flex min-h-0 flex-1 flex-col divide-y divide-slate-100 overflow-y-auto">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] ?? Tag;
              return (
                <li key={cat.id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => openCatalog(cat.name)}
                    className="group flex h-full w-full cursor-pointer items-center justify-between gap-2 px-4 py-1 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-600"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-brand-600" />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-brand-600" />
                  </button>
                </li>
              );
            })}
            <li className="flex-1">
              <button
                type="button"
                onClick={() => openCatalog('All')}
                className="flex h-full w-full cursor-pointer items-center justify-between gap-2 px-4 py-1 text-left text-sm font-semibold text-brand-600 transition-colors hover:bg-slate-50"
              >
                View all categories
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </li>
          </ul>
        </nav>

        {/* Product slider */}
        <div
          className="relative h-[300px] overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-brand-50 via-white to-brand-50 shadow-sm sm:h-[340px] lg:col-span-6 lg:h-[400px]"
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse') setIsPaused(true);
          }}
          onPointerLeave={() => setIsPaused(false)}
        >
          {count === 0 ? (
            <div className="relative flex h-full flex-col items-start justify-center gap-4 px-8 sm:px-14">
              <h2 className="text-3xl font-bold text-slate-900">বরকত রকমারী</h2>
              <p className="text-sm text-slate-600">আপনার পছন্দের পণ্য এখান থেকে কিনুন।</p>
              <button
                type="button"
                onClick={() => openCatalog('All')}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Shop now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            slideProducts.map((product, idx) => {
              const active = idx === current;
              return (
                <button
                  key={product.id}
                  type="button"
                  tabIndex={active ? 0 : -1}
                  aria-hidden={!active}
                  aria-label={product.title}
                  onClick={() => openProduct(product)}
                  className={`group absolute inset-0 cursor-pointer overflow-hidden transition-opacity duration-500 ${
                    active ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <img
                    src={BANNER_IMAGES[product.id] ?? product.images[0]}
                    alt={product.title}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    className="h-full w-full object-contain object-center p-3 mix-blend-multiply transition-transform duration-700 group-hover:scale-105 sm:p-4"
                  />
                </button>
              );
            })
          )}

          {count > 1 && (
            <>
              <button type="button" onClick={prev} aria-label="Previous slide" className={`${arrowCls} left-2 sm:left-3`}>
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button type="button" onClick={next} aria-label="Next slide" className={`${arrowCls} right-2 sm:right-3`}>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-sm sm:bottom-4">
                {slideProducts.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setHeroSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-1.5 cursor-pointer rounded-full transition-all ${
                      idx === current ? 'w-6 bg-white' : 'w-1.5 bg-white/55 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Side banners (product based) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3 lg:h-[400px] lg:grid-cols-1 lg:grid-rows-2">
          {bannerProducts.map((product) => {
            const price = product.salePrice || product.regularPrice;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => openProduct(product)}
                className="group flex min-h-[170px] cursor-pointer items-center gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-md"
              >
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="block text-xs font-semibold text-brand-600">{product.category}</span>
                  <span className="line-clamp-2 block text-sm font-semibold leading-6 text-slate-900 transition-colors group-hover:text-brand-600">
                    {shortTitle(product.title)}
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-900">৳{price.toLocaleString()}</span>
                    {product.salePrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ৳{product.regularPrice.toLocaleString()}
                      </span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-brand-600">
                    Shop now
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
                <span className="h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-white lg:h-32 lg:w-32">
                  <img
                    src={product.images[0]}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 shadow-sm md:grid-cols-4">
        {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3 bg-white px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
              <Icon className="h-5 w-5 text-brand-600" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};