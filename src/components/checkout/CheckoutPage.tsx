import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Tag,
  ArrowLeft,
  Lock,
  Copy, // ➕ নতুন
  Check, // ➕ নতুন
} from 'lucide-react';

// =====================================================================
// ➕ নতুন: দোকানের বিকাশ / নগদ নম্বর
// ⚠️ এখানে আপনার নিজের নম্বর বসান। কাস্টমার এই নম্বরে টাকা পাঠাবে।
// =====================================================================
const SHOP_BKASH_NUMBER = '01911561232';
const SHOP_BKASH_TYPE = 'Personal'; // Personal / Agent / Merchant
const SHOP_NAGAD_NUMBER = '01XXXXXXXXX';
const SHOP_NAGAD_TYPE = 'Personal';

const PAY_TONES = {
  bKash: {
    box: 'bg-pink-50/60 border-pink-200',
    title: 'text-pink-950',
    text: 'text-pink-800',
    input: 'border-pink-300 focus:border-pink-600',
    badge: 'bg-pink-600',
  },
  Nagad: {
    box: 'bg-orange-50/60 border-orange-200',
    title: 'text-orange-950',
    text: 'text-orange-800',
    input: 'border-orange-300 focus:border-orange-500',
    badge: 'bg-orange-500',
  },
};

interface PaymentInstructionProps {
  brand: 'bKash' | 'Nagad';
  shopNumber: string;
  shopType: string;
  amount: number;
  senderNumber: string;
  onSenderChange: (v: string) => void;
  trxId: string;
  onTrxChange: (v: string) => void;
  copied: boolean;
  onCopy: () => void;
}

// ➕ নতুন: টাকা পাঠানোর নিয়ম + দোকানের নম্বর + TrxID ইনপুট
const PaymentInstruction: React.FC<PaymentInstructionProps> = ({
  brand,
  shopNumber,
  shopType,
  amount,
  senderNumber,
  onSenderChange,
  trxId,
  onTrxChange,
  copied,
  onCopy,
}) => {
  const t = PAY_TONES[brand];
  return (
    <div className={`mt-4 p-4 rounded-xl border text-xs space-y-3 ${t.box}`}>
      <span className={`font-bold block ${t.title}`}>{brand} এ টাকা পাঠানোর নিয়ম</span>

      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-slate-200">
        <div className="min-w-0">
          <span className="text-[11px] text-slate-500 block">
            {brand} {shopType} নম্বর
          </span>
          <span className="font-mono text-base font-extrabold text-slate-900 tracking-wide">
            {shopNumber}
          </span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-[11px] font-bold cursor-pointer ${t.badge}`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'কপি হয়েছে' : 'কপি'}
        </button>
      </div>

      <ol className={`list-decimal pl-4 space-y-1 ${t.text}`}>
        <li>
          {brand} অ্যাপ খুলে <strong>Send Money</strong> এ যান
        </li>
        <li>
          উপরের নম্বরে <strong>৳{amount.toLocaleString()}</strong> পাঠান
        </li>
        <li>
          পাঠানোর পর পাওয়া <strong>TrxID</strong> ও আপনার নম্বর নিচে লিখুন
        </li>
      </ol>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <span className={`font-bold block mb-1 ${t.title}`}>যে নম্বর থেকে পাঠিয়েছেন</span>
          <input
            type="tel"
            value={senderNumber}
            onChange={(e) => onSenderChange(e.target.value)}
            placeholder="01XXXXXXXXX"
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none ${t.input}`}
          />
        </div>
        <div>
          <span className={`font-bold block mb-1 ${t.title}`}>Transaction ID (TrxID)</span>
          <input
            type="text"
            value={trxId}
            onChange={(e) => onTrxChange(e.target.value.toUpperCase())}
            placeholder="যেমন 9X29A88L1"
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white font-mono focus:outline-none ${t.input}`}
          />
        </div>
      </div>
      <p className={`text-[11px] ${t.text}`}>আমরা TrxID মিলিয়ে আপনার অর্ডার কনফার্ম করব।</p>
    </div>
  );
};

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    products,
    orders,
    cartSubtotal,
    cartDiscount,
    cartShippingFee,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    placeOrder,
    setActiveCustomerPage,
    setQuickViewProduct,
    showToast,
  } = useStore();

  // আগের অর্ডার থাকলে সেই কাস্টমারের তথ্য অটো-ফিল হবে, না থাকলে ফর্ম খালি থাকবে।
  const { user, loading: authLoading, openAuth } = useAuth();
  const lastCustomer = orders.find((o) => user && o.customer.email?.toLowerCase() === user.email.toLowerCase())?.customer;

  // Customer Form State
  const [formData, setFormData] = useState({
    name: lastCustomer?.name ?? user?.name ?? '',
    email: user?.email ?? lastCustomer?.email ?? '',
    phone: lastCustomer?.phone ?? user?.phone ?? '',
    address: lastCustomer?.address ?? '',
    city: lastCustomer?.city ?? '',
    postalCode: lastCustomer?.postalCode ?? '',
    country: lastCustomer?.country ?? 'Bangladesh',
  });

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [bkashNumber, setBkashNumber] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ➕ নতুন: TrxID ও নম্বর কপির অবস্থা
  const [bkashTrxId, setBkashTrxId] = useState('');
  const [nagadTrxId, setNagadTrxId] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const copyNumber = async (num: string, key: string) => {
    try {
      await navigator.clipboard.writeText(num);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch {
      showToast('কপি করা যায়নি, নম্বরটি হাতে লিখে নিন।', 'error');
    }
  };

  // Voucher input
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // লগইন পরে লোড হলেও ফর্মে নাম/ফোন/ইমেইল বসে যাবে
  useEffect(() => {
    if (user) {
      setFormData((f) => ({
        ...f,
        name: f.name || user.name,
        phone: f.phone || user.phone,
        email: user.email,
      }));
    }
  }, [user]);

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

  // লগইন ছাড়া চেকআউট করা যাবে না
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <h2 className="text-lg font-extrabold text-slate-950 mb-2">অর্ডার করতে লগইন করুন</h2>
          <p className="text-xs text-slate-500 mb-6">
            {authLoading
              ? 'একটু অপেক্ষা করুন...'
              : 'আপনার কার্টের পণ্যগুলো সংরক্ষিত আছে। লগইন বা রেজিস্ট্রেশন করে অর্ডার সম্পন্ন করুন।'}
          </p>
          {!authLoading && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
              >
                লগইন
              </button>
              <button
                type="button"
                onClick={() => openAuth('register')}
                className="px-6 py-2.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                রেজিস্ট্রেশন
              </button>
            </div>
          )}
        </div>
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

    // ➕ বদলানো: নম্বরের পাশাপাশি TrxID-ও বাধ্যতামূলক
    if (paymentMethod === 'bkash' && (!bkashNumber.trim() || !bkashTrxId.trim())) {
      showToast('বিকাশের নম্বর ও TrxID দিন।', 'error');
      return;
    }
    if (paymentMethod === 'nagad' && (!nagadNumber.trim() || !nagadTrxId.trim())) {
      showToast('নগদের নম্বর ও TrxID দিন।', 'error');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim())) {
      showToast('Please fill in your card details.', 'error');
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

    // ➕ নতুন: TrxID ও পাঠানো নম্বর অর্ডারের ট্র্যাকিং নোটে সেভ হবে (অ্যাডমিন মিলিয়ে দেখবে)
    const paymentNote =
      paymentMethod === 'bkash'
        ? `bKash নম্বর: ${bkashNumber.trim()}, TrxID: ${bkashTrxId.trim()}`
        : paymentMethod === 'nagad'
        ? `Nagad নম্বর: ${nagadNumber.trim()}, TrxID: ${nagadTrxId.trim()}`
        : undefined;

    // অর্ডার জমা দেওয়া (বিকাশ/নগদ হলে TrxID মিলিয়ে অ্যাডমিন কনফার্ম করবে)
    setTimeout(() => {
      placeOrder({
        customer: { ...formData, email: user?.email ?? formData.email },
        items: orderItems,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        shippingFee: cartShippingFee,
        total: cartTotal,
        couponCode: appliedCoupon?.code,
        paymentMethod,
        paymentNote, // ➕ নতুন
        // ➕ বদলানো: পেমেন্ট ও অর্ডার সবসময় Pending, অ্যাডমিন TrxID মিলিয়ে কনফার্ম করবে
        paymentStatus: 'pending',
        orderStatus: 'Pending',
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
                    placeholder="আপনার পুরো নাম"
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
                    placeholder="01XXXXXXXXX"
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
                    readOnly={!!user}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
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
                    placeholder="বাসা/ফ্ল্যাট নং, রোড, এলাকা"
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
                    placeholder="ঢাকা"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="1200"
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
                {/*<label
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
                </label> */}

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
              {/* ➕ বদলানো: বিকাশ ও নগদের ব্লক এখন দোকানের নম্বর + কপি বাটন + TrxID সহ */}
              {paymentMethod === 'bkash' && (
                <PaymentInstruction
                  brand="bKash"
                  shopNumber={SHOP_BKASH_NUMBER}
                  shopType={SHOP_BKASH_TYPE}
                  amount={cartTotal}
                  senderNumber={bkashNumber}
                  onSenderChange={setBkashNumber}
                  trxId={bkashTrxId}
                  onTrxChange={setBkashTrxId}
                  copied={copiedKey === 'bkash'}
                  onCopy={() => copyNumber(SHOP_BKASH_NUMBER, 'bkash')}
                />
              )}

              {paymentMethod === 'nagad' && (
                <PaymentInstruction
                  brand="Nagad"
                  shopNumber={SHOP_NAGAD_NUMBER}
                  shopType={SHOP_NAGAD_TYPE}
                  amount={cartTotal}
                  senderNumber={nagadNumber}
                  onSenderChange={setNagadNumber}
                  trxId={nagadTrxId}
                  onTrxChange={setNagadTrxId}
                  copied={copiedKey === 'nagad'}
                  onCopy={() => copyNumber(SHOP_NAGAD_NUMBER, 'nagad')}
                />
              )}

              {paymentMethod === 'card' && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-3">
                  <div>
                    <span className="font-bold text-indigo-950 block mb-1">Card Number</span>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
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
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-indigo-300 bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-indigo-950 block mb-1">CVC</span>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
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
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-950">
                  অর্ডারের আইটেম সমূহ ({cart.length} টি)
                </h2>
                <span className="text-[10px] text-violet-600 font-semibold bg-violet-50 px-2 py-0.5 rounded-full">
                  ক্লিক করে বিস্তারিত দেখুন 👁️
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const p = products.find((prod) => prod.id === item.productId);
                  if (!p) return null;

                  return (
                    <div
                      key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                      onClick={() => setQuickViewProduct(p)}
                      className="group flex items-center gap-3 text-xs p-2 rounded-xl hover:bg-violet-50/60 border border-transparent hover:border-violet-100 transition-all cursor-pointer"
                      title="পণ্যটির ছবি ও বিবরণ দেখতে ক্লিক করুন"
                    >
                      <div className="relative shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-14 h-14 rounded-lg object-contain border border-slate-200/80 bg-white p-1 transition-transform group-hover:scale-105"
                        />
                        <span className="absolute inset-0 bg-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-[9px] font-bold text-violet-800 bg-white/60">
                          দেখুন
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-1">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          পরিমাণ: {item.quantity}{' '}
                          {item.selectedSize && `· Size: ${item.selectedSize}`}{' '}
                          {item.selectedColor && `· Color: ${item.selectedColor}`}
                        </p>
                        {p.salePrice && p.salePrice < p.regularPrice && (
                          <span className="text-[10px] text-rose-600 font-semibold">
                            ছাড়: ৳{(p.regularPrice - p.salePrice).toLocaleString()} টাকা
                          </span>
                        )}
                      </div>
                      <span className="font-extrabold text-violet-700 shrink-0 font-mono text-xs">
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
                        placeholder="Coupon code"
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