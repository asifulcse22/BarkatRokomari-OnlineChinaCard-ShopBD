import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingCart, Star, Eye, Check, Wrench } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedProductId,
    setActiveCustomerPage,
    setQuickViewProduct,
    openSetupGuide,
  } = useStore();

  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const discountPercent = product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  const handleOpenDetail = () => {
    setSelectedProductId(product.id);
    setActiveCustomerPage('product-detail');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
        <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between h-full min-w-0"
      >


     {/* Product Image Container - Full Bleed / Edge-to-Edge with object-cover */}
      <div
        className="relative w-full aspect-square overflow-hidden bg-slate-100 cursor-pointer"
        onClick={handleOpenDetail}
      >
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top-Left Floating Discount and Setup Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {product.isBestSeller && (
            <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-1 uppercase tracking-wide">
              🔥 Best Seller
            </span>
          )}
          {discountPercent > 0 && (
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md shadow-rose-500/30"
            >
              -{discountPercent}%
            </motion.span>
          )}
          {product.setupGuide && (
            <span className="bg-indigo-700/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              🛠️ সেটআপ গাইড
            </span>
          )}
        </div>

        {/* Top-Right Floating Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 1.35 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all cursor-pointer shadow-md backdrop-blur-md ${
            isWishlisted
              ? 'text-rose-500 bg-white/95'
              : 'text-slate-600 bg-white/85 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </motion.button>

        {/* Quick View & Setup Hover Action Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 z-20"
            >
              <button
                onClick={handleQuickView}
                className="flex-1 py-2 px-2 bg-slate-900/90 backdrop-blur-md hover:bg-blue-600 text-white text-[10px] font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Quick View</span>
              </button>
              {product.setupGuide && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openSetupGuide(product);
                  }}
                  className="py-2 px-2.5 bg-indigo-600/95 backdrop-blur-md hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  title="সেটআপ নির্দেশিকা দেখুন"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>সেটআপ</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Content Details in Padded Box */}
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {/* Brand / Category Micro Kicker */}
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {product.brand || product.category}
          </div>

          {/* Title - Optimized for Bengali readability with proper leading */}
          <h3
            onClick={handleOpenDetail}
            className="text-[13px] sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 leading-relaxed min-h-[2.5rem]"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* 5-Star Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              ({product.reviewCount || 64})
            </span>
          </div>

          {/* Price Row (BDT ৳) */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-sm md:text-base font-black text-blue-600 font-mono">
              ৳{(product.salePrice || product.regularPrice).toLocaleString()}
            </span>
            {product.salePrice && (
              <span className="text-xs text-slate-400 line-through font-mono">
                ৳{product.regularPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Full-width Royal Blue Animated "Add to Cart" Button & Setup Link */}
        <div className="pt-2 space-y-2">
          {product.setupGuide && (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGuide(!showGuide);
                }}
                className="w-full py-2 px-3 text-xs font-bold text-indigo-800 hover:text-indigo-950 bg-indigo-50/90 hover:bg-indigo-100/90 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200/90 shadow-2xs tracking-wide"
                title="এই পণ্যটি কিভাবে সেটআপ করবেন দেখুন"
              >
                <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                <span>{showGuide ? 'সেটআপ বন্ধ করুন ▲' : '🛠️ সেটআপ গাইড দেখুন ▼'}</span>
              </button>

              <AnimatePresence>
                {showGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden p-3 rounded-2xl bg-gradient-to-br from-indigo-50/95 via-purple-50/80 to-blue-50/90 border border-indigo-200 text-left space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs font-black text-indigo-950 pb-1.5 border-b border-indigo-100">
                      <span>🛠️ সহজ সেটআপ নিয়ম:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail();
                        }}
                        className="text-[11px] text-indigo-600 hover:underline font-bold cursor-pointer"
                      >
                        বিস্তারিত পেজ ↗
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {product.setupGuide.split('\n').filter(Boolean).map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 leading-relaxed font-medium">
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step.replace(/^[০-৯\d]+\.\s*/, '')}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <motion.button
            whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
            whileTap={{ scale: product.stock > 0 ? 0.96 : 1 }}
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`w-full py-2.5 px-3 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
              justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                : product.stock <= 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
            }`}
          >
            <AnimatePresence mode="wait">
              {justAdded ? (
                <motion.div
                  key="added"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Added to Cart!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{product.stock > 0 ? 'Add to Cart' : 'Sold Out'}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
