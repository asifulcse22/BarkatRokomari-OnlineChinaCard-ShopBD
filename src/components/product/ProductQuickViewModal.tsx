import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Check,
  ShieldCheck,
  Truck,
  ArrowRight,
} from 'lucide-react';

export const ProductQuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedProductId,
    setActiveCustomerPage,
  } = useStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isWishlisted = isInWishlist(product.id);
  const discountPercent = product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product.id, quantity, {
      size: selectedSize || product.variations?.sizes?.[0],
      color: selectedColor || product.variations?.colors?.[0]?.name,
    });
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setQuickViewProduct(null);
    }, 1000);
  };

  const handleOpenFullPage = () => {
    setSelectedProductId(product.id);
    setQuickViewProduct(null);
    setActiveCustomerPage('product-detail');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with Fade Motion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
          onClick={() => setQuickViewProduct(null)}
        />

        {/* Modal Dialog with Spring Pop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row border border-slate-200"
        >
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-900 shadow-md cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </motion.button>

          {/* Product Gallery (Left) */}
          <div className="w-full md:w-1/2 p-6 bg-slate-50/80 flex flex-col justify-between border-r border-slate-100">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200/80 mb-3">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer p-1 bg-white ${
                      selectedImage === idx ? 'border-blue-600 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details (Right) */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Category & Brand Metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-semibold text-blue-600">{product.category}</span>
                <span>·</span>
                <span>{product.brand}</span>
                <span>·</span>
                <span className="font-mono text-[11px]">SKU: {product.sku}</span>
              </div>

              <h2 className="text-lg font-black text-slate-900 mb-2 leading-tight">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2.5 mb-4 pb-3 border-b border-slate-100">
                <span className="text-2xl font-black text-blue-600 font-mono">
                  ৳{(product.salePrice || product.regularPrice).toLocaleString()}
                </span>
                {product.salePrice && (
                  <>
                    <span className="text-sm text-slate-400 line-through font-mono">
                      ৳{product.regularPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                {product.description}
              </p>

              {/* Colors variant */}
              {product.variations?.colors && product.variations.colors.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">
                    Color:{' '}
                    <span className="text-slate-500 font-normal">
                      {selectedColor || product.variations.colors[0].name}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    {product.variations.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                          (selectedColor || product.variations?.colors?.[0].name) === c.name
                            ? 'border-blue-600 scale-110 shadow-xs'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {(selectedColor || product.variations?.colors?.[0].name) === c.name && (
                          <Check className="w-3 h-3 text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes variant */}
              {product.variations?.sizes && product.variations.sizes.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-800 block mb-1.5">Select Size</span>
                  <div className="flex items-center gap-1.5">
                    {product.variations.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          (selectedSize || product.variations?.sizes?.[0]) === s
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Row */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                {/* Quantity */}
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-slate-900 font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart with Motion */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-2.5 px-4 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    justAdded ? 'bg-emerald-600 shadow-emerald-500/25' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                    </>
                  )}
                </motion.button>

                {/* Wishlist */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 1.3 }}
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer ${
                    isWishlisted ? 'text-rose-500 fill-rose-500 border-rose-200 bg-rose-50/50' : 'text-slate-600'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </motion.button>
              </div>

              {/* Bottom info link */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Dispatches in 24 hours</span>
                </span>
                <button
                  onClick={handleOpenFullPage}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Full specifications & reviews</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
