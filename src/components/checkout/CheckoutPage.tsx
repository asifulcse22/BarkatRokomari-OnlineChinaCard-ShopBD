import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod } from '../../types';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Tag,
  ArrowLeft,
  Lock,
  Smartphone,
  Building,
  DollarSign,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    products,
    cartSubtotal,
    cartDiscount,
    cartShippingFee,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    placeOrder,
    setActiveCustomerPage,
    showToast,
  } = useStore();

  // Customer Form State
  const [formData, setFormData] = useState({
    name: 'Rahim Chowdhury',
    email: 'rahim.c@example.com',
    phone: '+880 1712-345678',
    address: 'House 42, Road 11, Banani',
    city: 'Dhaka',
    postalCode: '1213',
    country: 'Bangladesh',
  });

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [bkashNumber, setBkashNumber] = useState('01712345678');
  const [nagadNumber, setNagadNumber] = useState('01819876543');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('883');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voucher input
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mb-6">
          You don&apos;t have any products ready for checkout.
        </p>
        <button
          onClick={() => setActiveCustomerPage('catalog')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      showToast('Please fill in your delivery contact details.', 'error');
      return;
    }

    setIsSubmitting(true);

    // Map cart items
    const orderItems = cart.map((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      const varNotes = [
        item.selectedSize ? `Size: ${item.selectedSize}` : null,
        item.selectedColor ? `Color: ${item.selectedColor}` : null,
      ]
        .filter(Boolean)
        .join(', ');

      return {
        productId: item.productId,
        title: p?.title || 'Product',
        image: p?.images[0] || '',
        price: item.unitPrice,
        quantity: item.quantity,
        variations: varNotes || undefined,
      };
    });

    // Simulate verified transaction
    setTimeout(() => {
      placeOrder({
        customer: formData,
        items: orderItems,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        shippingFee: cartShippingFee,
        total: cartTotal,
        couponCode: appliedCoupon?.code,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'verified',
        orderStatus: paymentMethod === 'cod' ? 'Pending' : 'Confirmed',
      });
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Navigation link */}
      <button
        onClick={() => setActiveCustomerPage('catalog')}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Continue Shopping</span>
      </button>

      <h1 className="text-2xl font-extrabold text-slate-950 mb-8 tracking-tight">
        Secure Checkout & Order Review
      </h1>

      <form onSubmit={handleConfirmOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery Address & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Delivery Information */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h2 className="text-sm font-bold text-slate-950 mb-1 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                  1
                </span>
                <span>Delivery Address & Recipient Details</span>
              </h2>
              <p className="text-xs text-slate-500 mb-5 pl-7">
                Your order will be dispatched to this location with live SMS courier tracking.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone Number (SMS alerts) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Street Address & House / Flat No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h2 className="text-sm font-bold text-slate-950 mb-1 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                  2
                </span>
                <span>Select Payment Gateway</span>
              </h2>
              <p className="text-xs text-slate-500 mb-5 pl-7">
                All digital transactions are encrypted with 256-bit bank-grade SSL security.
              </p>

              {/* Payment Method Radio Cards */}
              <div className="space-y-3">
                {/* bKash */}
                <label
                  className={`flex items-start justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'bkash'
                      ? 'border-pink-600 bg-pink-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="mt-0.5 accent-pink-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">bKash Mobile Payment</span>
                      <span className="text-[11px] text-slate-500">
                        Pay instantly via bKash personal or merchant account. Instant settlement.
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-pink-100 text-pink-700">
                    bKash
                  </span>
                </label>

                {/* Nagad */}
                <label
                  className={`flex items-start justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'nagad'
                      ? 'border-orange-500 bg-orange-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="mt-0.5 accent-orange-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Nagad Digital Wallet</span>
                      <span className="text-[11px] text-slate-500">
                        Fast and secure payment with Nagad account pin confirmation.
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                    Nagad
                  </span>
                </label>

                {/* Credit / Debit Card */}
                <label
                  className={`flex items-start justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mt-0.5 accent-indigo-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Credit / Debit Card</span>
                      <span className="text-[11px] text-slate-500">
                        Visa, MasterCard, American Express. 3D Secure verification.
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    Visa / MC
                  </span>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex items-start justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-0.5 accent-slate-900"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Cash on Delivery (COD)</span>
                      <span className="text-[11px] text-slate-500">
                        Pay cash to the delivery rider after inspecting your package.
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    COD
                  </span>
                </label>
              </div>

              {/* Dynamic Payment Details Input */}
              {paymentMethod === 'bkash' && (
                <div className="mt-4 p-4 rounded-xl bg-pink-50/60 border border-pink-200 text-xs space-y-2">
                  <span className="font-bold text-pink-950 block">bKash Account Number</span>
                  <input
                    type="tel"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-pink-300 bg-white focus:outline-none"
                  />
                  <p className="text-[11px] text-pink-800">
                    A simulated bKash transaction ID will be verified upon order placement.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-3">
                  <div>
                    <span className="font-bold text-indigo-950 block mb-1">Card Number</span>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-indigo-300 bg-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-bold text-indigo-950 block mb-1">Expires</span>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-indigo-300 bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-indigo-950 block mb-1">CVC</span>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-indigo-300 bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Review (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-slate-950 pb-3 border-b border-slate-100">
                Order Review ({cart.length} items)
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const p = products.find((prod) => prod.id === item.productId);
                  if (!p) return null;

                  return (
                    <div
                      key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex items-center gap-3 text-xs"
                    >
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-100 bg-slate-50 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{p.title}</p>
                        <p className="text-[11px] text-slate-400">
                          Qty: {item.quantity}{' '}
                          {item.selectedSize && `· Size: ${item.selectedSize}`}{' '}
                          {item.selectedColor && `· Color: ${item.selectedColor}`}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0 font-mono">
                        ৳{(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon input */}
              <div className="pt-3 border-t border-slate-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold text-emerald-900">{appliedCoupon.code}</span>
                      <span className="text-emerald-700">(-৳{cartDiscount.toLocaleString()})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon code (e.g. WELCOME10)"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 uppercase bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={handleCouponSubmit}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* Math breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>৳{cartSubtotal.toLocaleString()}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Coupon</span>
                    <span>-৳{cartDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Standard Shipping</span>
                  <span>{cartShippingFee === 0 ? 'FREE' : `৳${cartShippingFee.toLocaleString()}`}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-950">
                  <span>Total Amount</span>
                  <span>৳{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Lock className="w-4 h-4 text-blue-100" />
                <span>{isSubmitting ? 'Verifying & Placing Order...' : 'Confirm Order & Pay'}</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>30-Day Money Back Guarantee · Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
