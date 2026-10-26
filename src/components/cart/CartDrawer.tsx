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
    setIsCartOpen(false); // কার্ট ড্রয়ার বন্ধ করবে
    setActiveCustomerPage('checkout'); // চেকআউট পেজে নিয়ে যাবে
  };

  const freeShippingThreshold = 1000;
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  const primaryBtn =
    'bg-brand-600 text-white font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-lg active:translate-y-0';

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
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-none">Your Cart</h2>
                  <span className="text-xs text-slate-500 font-medium">({cart.length} items selected)</span>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress bar */}
            <div className="bg-slate-50 px-4 sm:px-6 py-3 border-b border-slate-200/60 text-xs">
              {remainingForFreeShipping > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>
                        Add <strong className="text-slate-900">৳{remainingForFreeShipping.toLocaleString()}</strong> for Free Delivery
                      </span>
                    </span>
                    <span className="text-xs text-brand-600 font-semibold">{Math.round(freeShippingProgress)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>You unlocked Free Express Delivery!</span>
                </div>
              )}
            </div>

            {/* Cart Item List with Exit Motion */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Your cart is empty</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-xs">
                    Explore ShopZone to discover premium gadgets, lifestyle fashion, and modern home essentials.
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveCustomerPage('catalog');
                    }}
                    className={`px-6 py-3 text-sm ${primaryBtn}`}
                  >
                    Start Browsing Products
                  </button>
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
                        className="group flex gap-3 border border-slate-200 hover:border-brand-600 p-2.5 rounded-lg transition-colors bg-white"
                      >
                        {/* Clickable Image */}
                        <div
                          onClick={() => handleOpenProduct(item.productId)}
                          className="relative cursor-pointer shrink-0 overflow-hidden rounded-lg"
                          title="পণ্যটি দেখতে ক্লিক করুন"
                        >
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-18 h-18 object-contain rounded-lg border border-slate-200 bg-white p-1 transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                onClick={() => handleOpenProduct(item.productId)}
                                className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug cursor-pointer hover:text-brand-600 transition-colors"
                                title="পণ্যটির বিস্তারিত দেখতে ক্লিক করুন"
                              >
                                {product.title}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.productId)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 -m-1 transition-colors cursor-pointer shrink-0"
                                title="Remove item"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Variations */}
                            {(item.selectedSize || item.selectedColor) && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {item.selectedSize && `Size: ${item.selectedSize}`}
                                {item.selectedSize && item.selectedColor && ' · '}
                                {item.selectedColor && `Color: ${item.selectedColor}`}
                              </p>
                            )}

                            {product.salePrice && product.salePrice < product.regularPrice && (
                              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                                ছাড়: ৳{(product.regularPrice - product.salePrice).toLocaleString()} টাকা
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                className="p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors text-slate-700 cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 py-0.5 text-sm font-semibold text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                className="p-1.5 hover:bg-brand-50 hover:text-brand-600 transition-colors text-slate-700 cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Line Price */}
                            <span className="text-sm font-bold text-slate-900">
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
              <div className="px-4 sm:px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-slate-200 bg-slate-50 space-y-4">
                {/* Coupon Application */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-900">{appliedCoupon.code}</span>
                      <span className="text-emerald-700 font-semibold">(-৳{cartDiscount.toLocaleString()})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-sm font-semibold text-emerald-800 hover:text-rose-600 cursor-pointer"
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
                        className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 uppercase"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-rose-600">{couponError}</p>}
                  </form>
                )}

                {/* Calculations */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>৳{cartSubtotal.toLocaleString()}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount</span>
                      <span>-৳{cartDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Shipping</span>
                    <span>{cartShippingFee === 0 ? 'FREE' : `৳${cartShippingFee.toLocaleString()}`}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                    <span>Estimated Total</span>
                    <span>৳{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Proceed to Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className={`group w-full py-3.5 text-sm flex items-center justify-center gap-2 ${primaryBtn}`}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};