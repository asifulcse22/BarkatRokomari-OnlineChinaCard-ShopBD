import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import {
  Truck,
  Heart,
  LifeBuoy,
  CheckCircle2,
  ShoppingBag,
  Trash2,
  Search,
  Phone,
} from 'lucide-react';

// File: src/components/account/CustomerAccountPage.tsx
// Login charai kaj kore: Order track (order number + phone), Wishlist, Support.

const SUPPORT_PHONE = '+8801911561232';
const WHATSAPP_NUMBER = '8801911561232';

type Tab = 'tracking' | 'wishlist' | 'support';

const statusCls = (s: string) =>
  s === 'Delivered'
    ? 'bg-emerald-50 text-emerald-700'
    : s === 'Cancelled'
    ? 'bg-rose-50 text-rose-700'
    : s === 'Return Requested'
    ? 'bg-amber-50 text-amber-700'
    : 'bg-brand-50 text-brand-700';

const digitsOnly = (v: string) => v.replace(/\D/g, '');

export const CustomerAccountPage: React.FC = () => {
  const {
    orders: allOrders,
    wishlist,
    products,
    addToCart,
    toggleWishlist,
    activeOrderToTrack,
    setActiveCustomerPage,
  } = useStore();

  // Header theke wishlist/support click korle shei tab-e khulbe
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    try {
      const t = sessionStorage.getItem('sz-account-tab');
      if (t === 'wishlist' || t === 'support') return t;
    } catch {
      // ignore
    }
    return 'tracking';
  });

  useEffect(() => {
    try {
      sessionStorage.removeItem('sz-account-tab');
    } catch {
      // ignore
    }
  }, []);

  // Track order
  const [orderNumber, setOrderNumber] = useState(activeOrderToTrack?.orderNumber ?? '');
  const [phone, setPhone] = useState(activeOrderToTrack?.customer?.phone ?? '');
  const [result, setResult] = useState<Order | null>(activeOrderToTrack ?? null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const num = orderNumber.trim().toUpperCase();
    const digits = digitsOnly(phone);
    if (!num || digits.length < 10) {
      setError('অর্ডার নম্বর ও মোবাইল নম্বর দিন।');
      return;
    }

    // Ei session-e kora order thakle sheta age dekhabe
    const local = allOrders.find(
      (o) =>
        o.orderNumber.toUpperCase() === num &&
        digitsOnly(o.customer.phone || '').slice(-10) === digits.slice(-10)
    );
    if (local) {
      setResult(local);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(num)}&phone=${encodeURIComponent(digits)}`
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setError(data?.message || 'এই তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি। নম্বর দুটি আবার চেক করুন।');
      } else {
        setResult(data.order);
      }
    } catch {
      setError('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'tracking', label: 'Track Order', icon: Truck },
    { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Tabs */}
      <div className="mb-8 flex gap-6 overflow-x-auto border-b border-slate-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Track order */}
      {activeTab === 'tracking' && (
        <div className="mx-auto max-w-2xl space-y-6">
          <form
            onSubmit={handleTrack}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
          >
            <div>
              <h1 className="text-lg font-semibold text-slate-900">অর্ডার ট্র্যাক করুন</h1>
              <p className="text-sm text-slate-500">
                অর্ডার নম্বর ও অর্ডারের সময় দেওয়া মোবাইল নম্বর লিখুন।
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">অর্ডার নম্বর</span>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="SZ-123456"
                  className={`${inputCls} font-mono uppercase`}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">মোবাইল নম্বর</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className={inputCls}
                />
              </label>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {loading ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
            </button>
          </form>

          {result && (
            <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="block text-xs text-slate-500">অর্ডার নম্বর</span>
                  <span className="font-mono text-base font-semibold text-slate-900">
                    {result.orderNumber}
                  </span>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusCls(
                    result.orderStatus
                  )}`}
                >
                  {result.orderStatus}
                </span>
              </div>

              {/* Timeline */}
              <ol className="space-y-5">
                {result.trackingHistory.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="text-sm font-semibold text-slate-900">{step.status}</span>
                        <span className="text-xs text-slate-400">{step.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-600">{step.note}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Items */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                {result.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-12 w-12 shrink-0 rounded border border-slate-100 bg-white object-contain p-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity}
                        {item.variations ? ` · ${item.variations}` : ''}
                      </p>
                    </div>
                    <span className="font-medium text-slate-900">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-slate-900">
                  <span>মোট</span>
                  <span>৳{result.total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-500">
                  Payment: <span className="uppercase">{result.paymentMethod}</span> ({result.paymentStatus})
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 text-sm text-slate-600">
                <span className="mb-1 block font-semibold text-slate-900">ডেলিভারি ঠিকানা</span>
                {result.customer.name} · {result.customer.address}, {result.customer.city}
              </div>

              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                অর্ডার বাতিল বা রিটার্ন করতে চাইলে{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('support')}
                  className="cursor-pointer font-semibold text-brand-600 hover:underline"
                >
                  Support
                </button>{' '}
                এ যোগাযোগ করুন।
              </p>
            </div>
          )}
        </div>
      )}

      {/* Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
              <Heart className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <h2 className="mb-1 text-base font-semibold text-slate-900">Wishlist খালি</h2>
              <p className="mb-4 text-sm text-slate-500">পছন্দের পণ্য সেভ করে রাখুন, পরে কিনতে পারবেন।</p>
              <button
                type="button"
                onClick={() => setActiveCustomerPage('catalog')}
                className="cursor-pointer rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                পণ্য দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {wishlist.map((id) => {
                const product = products.find((p) => p.id === id);
                if (!product) return null;

                return (
                  <div
                    key={product.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div>
                      <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-white">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="mb-1 block text-xs text-slate-500">{product.category}</span>
                      <h3 className="mb-2 line-clamp-2 text-sm font-medium text-slate-900">
                        {product.title}
                      </h3>
                      <span className="mb-3 block text-sm font-semibold text-slate-900">
                        ৳{(product.salePrice || product.regularPrice).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => addToCart(product.id, 1)}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Add to cart
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-rose-600"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Support */}
      {activeTab === 'support' && (
        <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="mb-1 text-lg font-semibold text-slate-900">সাহায্য দরকার?</h1>
          <p className="mb-5 text-sm text-slate-600">
            ডেলিভারি, পেমেন্ট, ওয়ারেন্টি, অর্ডার বাতিল বা রিটার্ন, যেকোনো বিষয়ে কল করুন বা হোয়াটসঅ্যাপে মেসেজ দিন।
            অর্ডার নম্বর সাথে রাখলে দ্রুত সাহায্য করা যাবে।
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-brand-600 hover:text-brand-600"
            >
              <Phone className="h-4 w-4" />
              {SUPPORT_PHONE}
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1fb856]"
            >
              হোয়াটসঅ্যাপে মেসেজ দিন
            </a>
          </div>
        </div>
      )}
    </div>
  );
};