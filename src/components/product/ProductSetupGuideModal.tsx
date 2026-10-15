import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'motion/react';

import { useStore } from '../../context/StoreContext';

import { Product } from '../../types';

import {

  X,

  Wrench,

  CheckCircle2,

  HelpCircle,

  PhoneCall,

  ShoppingBag,

  ExternalLink,

  Sparkles,

  ShieldCheck,

  Video,

  Radio,

  Lightbulb,

  Cpu,

} from 'lucide-react';

export const ProductSetupGuideModal: React.FC = () => {

  const {

    products,

    setupGuideModalProduct,

    setSetupGuideModalProduct,

    addToCart,

    setIsCartOpen,

    setSelectedProductId,

    setActiveCustomerPage,

  } = useStore();

  // Find the 4 smart products with setup guides

  const smartProducts = products.filter(

    (p) =>

      p.id === 'prod-wifi-bulb-cam' ||

      p.id === 'prod-gps-tracker-mini' ||

      p.id === 'prod-motion-sensor-bulb' ||

      p.id === 'prod-remote-sensor-holder' ||

      Boolean(p.setupGuide)

  );

  const [activeId, setActiveId] = useState<string>(

    setupGuideModalProduct?.id || smartProducts[0]?.id || 'prod-wifi-bulb-cam'

  );

  useEffect(() => {

    if (setupGuideModalProduct) {

      setActiveId(setupGuideModalProduct.id);

    }

  }, [setupGuideModalProduct]);

  if (!setupGuideModalProduct) return null;

  const currentProduct =

    smartProducts.find((p) => p.id === activeId) ||

    products.find((p) => p.id === activeId) ||

    setupGuideModalProduct;

  const handleClose = () => {

    setSetupGuideModalProduct(null);

  };

  const handleOrderNow = (p: Product) => {

    addToCart(p.id, 1);

    setSetupGuideModalProduct(null);

    setIsCartOpen(true);

  };

  const handleViewDetailPage = (p: Product) => {

    setSelectedProductId(p.id);

    setSetupGuideModalProduct(null);

    setActiveCustomerPage('product-detail');

  };

  // Product specific setup highlights and icons

  const getProductMeta = (id: string) => {

    switch (id) {

      case 'prod-wifi-bulb-cam':

        return {

          icon: Video,

          badgeText: 'ওয়াইফাই ক্যামেরা গাইড',

          color: 'from-blue-600 to-indigo-600',

          bgLight: 'bg-blue-50 text-blue-700',

          tips: [

            'বাতি ক্যামেরাটি সর্বদা E27 হোল্ডারে শক্তভাবে লাগিয়ে রাখুন।',

            'ক্যামেরাটিতে 2.4GHz ওয়াইফাই নেটওয়ার্ক কানেক্ট করুন।',

            'মেমোরি কার্ড লাগালে সার্বক্ষণিক ভিডিও অটোমেটিক রেকর্ড হতে থাকবে।',

          ],

        };

      case 'prod-gps-tracker-mini':

        return {

          icon: Radio,

          badgeText: 'জিপিএস ট্র্যাকার গাইড',

          color: 'from-emerald-600 to-teal-600',

          bgLight: 'bg-emerald-50 text-emerald-700',

          tips: [

            'ট্র্যাকারটি বাইক বা ইজিবাইকের এমন স্থানে রাখুন যেখানে সহজে পানি না লাগে।',

            'প্রথমবার পেয়ার করার সময় মোবাইলের ব্লুটুথ ও জিপিএস অন রাখুন।',

            'ব্যাটারি শেষ হলে সাধারণ CR2032 ব্যাটারি সহজে পরিবর্তন করা যায়।',

          ],

        };

      case 'prod-motion-sensor-bulb':

        return {

          icon: Lightbulb,

          badgeText: 'মোশন সেন্সর লাইট গাইড',

          color: 'from-amber-600 to-orange-600',

          bgLight: 'bg-amber-50 text-amber-700',

          tips: [

            'দিনের বেলা বা পর্যাপ্ত আলো থাকলে বাতিটি বিদ্যুৎ সাশ্রয়ের জন্য জ্বলবে না।',

            'রাতে অন্ধকার হলে মানুষ বা চলাচল শনাক্ত করলেই সাথে সাথে পূর্ণ আলোতে জ্বলবে।',

            'সিঁড়ি, করিডোর বা মেইন গেটের জন্য সবচেয়ে উপযোগী।',

          ],

        };

      case 'prod-remote-sensor-holder':

        return {

          icon: Cpu,

          badgeText: 'রিমোট ও মোশন হোল্ডার গাইড',

          color: 'from-violet-600 to-purple-600',

          bgLight: 'bg-violet-50 text-violet-700',

          tips: [

            'রিমোট দিয়ে বিছানায় শুয়েই লাইট অন/অফ ও ১/২/৪ ঘণ্টার টাইমার সেট করা যায়।',

            'রিমোটের Auto বাটন চাপলে মোশন সেন্সর অ্যাক্টিভ হয়ে যাবে।',

            'যেকোনো সাধারণ E27 লাইট এই হোল্ডারের ভিতর ব্যবহার করা যাবে।',

          ],

        };

      default:

        return {

          icon: Wrench,

          badgeText: 'স্মার্ট সেটআপ গাইড',

          color: 'from-blue-600 to-indigo-600',

          bgLight: 'bg-blue-50 text-blue-700',

          tips: [

            'পণ্যটি ব্যবহারের আগে সাথে দেওয়া ম্যানুয়াল ভালোভাবে দেখে নিন।',

            'যেকোনো টেকনিক্যাল সাপোর্টের জন্য আমাদের হটলাইনে যোগাযোগ করুন।',

          ],

        };

    }

  };

  const meta = getProductMeta(currentProduct.id);

  const MetaIcon = meta.icon;

  const discountAmount =

    currentProduct.salePrice && currentProduct.salePrice < currentProduct.regularPrice

      ? currentProduct.regularPrice - currentProduct.salePrice

      : 0;

  return (

    <AnimatePresence>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">

        {/* Backdrop */}

        <motion.div

          initial={{ opacity: 0 }}

          animate={{ opacity: 1 }}

          exit={{ opacity: 0 }}

          onClick={handleClose}

          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm cursor-pointer"

        />

        {/* Modal Window */}

        <motion.div

          initial={{ opacity: 0, scale: 0.94, y: 15 }}

          animate={{ opacity: 1, scale: 1, y: 0 }}

          exit={{ opacity: 0, scale: 0.94, y: 15 }}

          transition={{ type: 'spring', damping: 25, stiffness: 350 }}

          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"

        >

          {/* Header Banner */}

          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-5 sm:p-6 relative shrink-0">

            <button

              onClick={handleClose}

              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"

              aria-label="Close setup guide modal"

            >

              <X className="w-5 h-5" />

            </button>

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-amber-300 border border-white/20 shadow-inner">

                <Wrench className="w-5 h-5 animate-pulse" />

              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">

                    পণ্য সেটআপ ও ব্যবহার নির্দেশিকা

                  </h2>

                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">

                    সহজ গাইড

                  </span>

                </div>

                <p className="text-xs text-slate-300 mt-0.5">

                  ঘরে বসেই নিজে নিজে সেটআপ ও নিয়ন্ত্রণ করার সহজ বাংলা নির্দেশিকা

                </p>

              </div>

            </div>

            {/* Smart Products Quick Switcher Tabs */}

            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 pt-1 no-scrollbar">

              {smartProducts.map((p) => {

                const isActive = p.id === currentProduct.id;

                return (

                  <button

                    key={p.id}

                    onClick={() => setActiveId(p.id)}

                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${

                      isActive

                        ? 'bg-white text-slate-900 shadow-md border-white'

                        : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'

                    }`}

                  >

                    <span className="w-2 h-2 rounded-full bg-emerald-400" />

                    <span className="truncate max-w-[170px] sm:max-w-[210px]">{p.title}</span>

                  </button>

                );

              })}

            </div>

          </div>

          {/* Modal Body */}

          <div className="overflow-y-auto p-5 sm:p-7 flex-1">

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

              {/* Product Info Card (Left 5 Cols) */}

              <div className="md:col-span-5 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 flex flex-col justify-between">

                <div>

                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200 p-2 mb-4 flex items-center justify-center">

                    <img

                      src={currentProduct.images[0]}

                      alt={currentProduct.title}

                      className="w-full h-full object-contain"

                    />

                    {discountAmount > 0 && (

                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm">

                        মূল্য ছাড়: ৳{discountAmount.toLocaleString()} টাকা

                      </span>

                    )}

                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${meta.bgLight} mb-2`}>

                    <MetaIcon className="w-3.5 h-3.5" />

                    {meta.badgeText}

                  </span>

                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug mb-2">

                    {currentProduct.title}

                  </h3>

                  {/* Pricing row */}

                  <div className="p-3 bg-white rounded-xl border border-slate-200 mb-3 space-y-1">

                    <div className="flex items-baseline gap-2">

                      <span className="text-2xl font-black text-blue-600 font-mono">

                        ৳{(currentProduct.salePrice || currentProduct.regularPrice).toLocaleString()}

                      </span>

                      {currentProduct.salePrice && currentProduct.salePrice < currentProduct.regularPrice && (

                        <span className="text-xs text-slate-400 line-through font-mono">

                          ৳{currentProduct.regularPrice.toLocaleString()}

                        </span>

                      )}

                    </div>

                    <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">

                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />

                      <span>অরিজিনাল প্রোডাক্ট · ক্যাশ অন ডেলিভারি</span>

                    </div>

                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">

                    {currentProduct.description}

                  </p>

                </div>

                {/* Actions */}

                <div className="space-y-2 pt-2 border-t border-slate-200/80">

                  <button

                    onClick={() => handleOrderNow(currentProduct)}

                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"

                  >

                    <ShoppingBag className="w-4 h-4" />

                    <span>অর্ডার করুন (৳{(currentProduct.salePrice || currentProduct.regularPrice).toLocaleString()})</span>

                  </button>

                  <button

                    onClick={() => handleViewDetailPage(currentProduct)}

                    className="w-full py-2 px-4 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"

                  >

                    <span>বিস্তারিত পণ্য পেজ দেখুন</span>

                    <ExternalLink className="w-3.5 h-3.5" />

                  </button>

                </div>

              </div>

              {/* Step-by-Step Instructions (Right 7 Cols) */}

              <div className="md:col-span-7 space-y-5">

                <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-violet-50/60 p-4 sm:p-5 rounded-2xl border border-indigo-100">

                  <div className="flex items-center gap-2 mb-3">

                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">

                      🛠️

                    </span>

                    <h4 className="text-sm font-extrabold text-slate-900">

                      কিভাবে সেটআপ ও ব্যবহার করবেন:

                    </h4>

                  </div>

                  {currentProduct.setupGuide ? (

                    <div className="space-y-3">

                      {currentProduct.setupGuide

                        .split('\n')

                        .filter(Boolean)

                        .map((step, idx) => {

                          const cleanStep = step.replace(/^[০-৯\d]+[.)।]?[\s:-]*/, '');

                          return (

                            <motion.div

                              key={idx}

                              initial={{ opacity: 0, x: -8 }}

                              animate={{ opacity: 1, x: 0 }}

                              transition={{ delay: idx * 0.08 }}

                              className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-indigo-100/80 shadow-xs"

                            >

                              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs mt-0.5">

                                {idx + 1}

                              </div>

                              <div className="flex-1 min-w-0">

                                <span className="setup-guide-bangla text-xs sm:text-sm font-bold text-indigo-600 block mb-1">

                                  ধাপ {idx + 1}

                                </span>

                                <p className="setup-guide-bangla text-[15px] sm:text-base text-slate-800 font-medium leading-8">

                                  {cleanStep}

                                </p>

                              </div>

                            </motion.div>

                          );

                        })}

                    </div>

                  ) : (

                    <p className="setup-guide-bangla text-sm sm:text-base text-slate-600 leading-7">

                      পণ্যটি সাধারণ প্লাগ অ্যান্ড প্লে সুবিধার। কোনো অতিরিক্ত ওয়্যারিং ছাড়াই সরাসরি ব্যবহার করতে পারবেন।

                    </p>

                  )}

                </div>

                {/* Helpful Tips Card */}

                <div className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-200/80 space-y-2.5">

                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">

                    <Sparkles className="w-4 h-4 text-amber-600" />

                    <span>প্রয়োজনীয় টিপস ও ব্যবহারিক তথ্য:</span>

                  </div>

                  <ul className="setup-guide-bangla space-y-2 text-sm sm:text-base leading-7 text-amber-950/80">

                    {meta.tips.map((tip, idx) => (

                      <li key={idx} className="flex items-start gap-2">

                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />

                        <span className="setup-guide-bangla">{tip}</span>

                      </li>

                    ))}

                  </ul>

                </div>

                {/* Hotline Support Row */}

                <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">

                      <PhoneCall className="w-4 h-4" />

                    </div>

                    <div>

                      <p className="text-xs font-bold text-white">সেটআপে কোনো সমস্যা হচ্ছে?</p>

                      <p className="text-[11px] text-slate-400">আমাদের কাস্টমার কেয়ারে কল করুন</p>

                    </div>

                  </div>

                  <a

                    href="tel:"

                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-sm"

                  >

                    <PhoneCall className="w-3.5 h-3.5" />

                    <span>+880</span>

                  </a>

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </AnimatePresence>

  );

};