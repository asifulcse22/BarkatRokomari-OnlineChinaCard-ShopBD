import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingCart, Star, Eye, Check } from 'lucide-react';

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
  } = useStore();

  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
      className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between h-full"
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

        {/* Top-Left Floating Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md shadow-rose-500/30"
            >
              -{discountPercent}%
            </motion.span>
          </div>
        )}

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

        {/* Quick View Hover Action Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-3 bottom-3 flex justify-center z-20"
            >
              <button
                onClick={handleQuickView}
                className="w-full py-2 px-3 bg-slate-900/90 backdrop-blur-md hover:bg-blue-600 text-white text-[11px] font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Quick View</span>
              </button>
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

          {/* Title */}
          <h3
            onClick={handleOpenDetail}
            className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1 leading-snug"
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

        {/* Full-width Royal Blue Animated "Add to Cart" Button */}
        <div className="pt-2">
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
