import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Check,
  Truck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    products,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartDiscount,
    cartShippingFee,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setActiveCustomerPage,
    setSelectedProductId,
    setQuickViewProduct,
  } = useStore();

  const handleOpenProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setQuickViewProduct(prod);
      setIsCartOpen(false);
    }
  };

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCodeInput.trim()) return;

    const res = applyCoupon(couponCodeInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCodeInput('');
    }
  };

  const handleProceedToCheckout = () => {
  setIsCartOpen(false); // কার্ট ড্রয়ার বন্ধ করবে
  setActiveCustomerPage('checkout'); // চেকআউট পেজে নিয়ে যাবে
  };

  const freeShippingThreshold = 1000;
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop with Motion Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer Panel with Spring Slide-In */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-none">Your Cart</h2>
                  <span className="text-[11px] text-slate-500 font-medium">({cart.length} items selected)</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Free Shipping Progress bar */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/60 text-xs">
              {remainingForFreeShipping > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        Add <strong className="text-slate-900">৳{remainingForFreeShipping.toLocaleString()}</strong> for Free Delivery
                      </span>
                    </span>
                    <span className="text-[11px] text-blue-600 font-bold">{Math.round(freeShippingProgress)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>You unlocked Free Express Delivery!</span>
                </div>
              )}
            </div>

            {/* Cart Item List with Exit Motion */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mb-6 max-w-xs">
                    Explore ShopZone to discover premium gadgets, lifestyle fashion, and modern home essentials.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveCustomerPage('catalog');
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    Start Browsing Products
                  </motion.button>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map((item) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;

                    return (
                      <motion.div
                        key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="group flex gap-3.5 pb-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 p-2 rounded-2xl transition-colors"
                      >
                        {/* Clickable Image */}
                        <div
                          onClick={() => handleOpenProduct(item.productId)}
                          className="relative cursor-pointer shrink-0 overflow-hidden rounded-xl"
                          title="পণ্যটি দেখতে ক্লিক করুন"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-18 h-18 object-contain rounded-xl border border-slate-200/80 bg-white p-1 transition-transform duration-300 group-hover:scale-105"
                          />
                          <span className="absolute inset-0 bg-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-[10px] font-bold text-violet-900 bg-white/70 backdrop-blur-xs">
                            দেখুন 👁️
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                onClick={() => handleOpenProduct(item.productId)}
                                className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight cursor-pointer hover:text-violet-700 transition-colors"
                                title="পণ্যটির বিস্তারিত দেখতে ক্লিক করুন"
                              >
                                {product.title}
                              </h4>
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.85 }}
                                onClick={() => removeFromCart(item.productId)}
                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer shrink-0"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>

                            {/* Variations */}
                            {(item.selectedSize || item.selectedColor) && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {item.selectedSize && `Size: ${item.selectedSize}`}
                                {item.selectedSize && item.selectedColor && ' · '}
                                {item.selectedColor && `Color: ${item.selectedColor}`}
                              </p>
                            )}

                            {product.salePrice && product.salePrice < product.regularPrice && (
                              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                                ছাড়: ৳{(product.regularPrice - product.salePrice).toLocaleString()} টাকা
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
                            {/* Quantity Selector with Motion */}
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                className="p-1 hover:bg-slate-100 transition-colors text-slate-700 cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </motion.button>
                              <span className="px-2.5 py-0.5 text-xs font-bold text-slate-900 font-mono">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                className="p-1 hover:bg-slate-100 transition-colors text-slate-700 cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </motion.button>
                            </div>

                            {/* Line Price */}
                            <span className="text-xs font-black text-violet-700 font-mono">
                              ৳{(item.unitPrice * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer with Math and Checkout button */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-200 bg-slate-50/80 space-y-4">
                {/* Coupon Application */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-emerald-900">{appliedCoupon.code}</span>
                      <span className="text-emerald-700 font-bold">(-৳{cartDiscount.toLocaleString()})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-emerald-800 hover:text-rose-600 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        placeholder="Promo code (e.g. WELCOME10)"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600 uppercase font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
                  </form>
                )}

                {/* Calculations */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono">৳{cartSubtotal.toLocaleString()}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount</span>
                      <span className="font-mono">-৳{cartDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Shipping</span>
                    <span>{cartShippingFee === 0 ? 'FREE' : `৳${cartShippingFee.toLocaleString()}`}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Estimated Total</span>
                    <span className="font-black text-blue-600 font-mono">৳{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Proceed to Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
