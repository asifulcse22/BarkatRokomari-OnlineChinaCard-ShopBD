import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import {
  Package,
  Heart,
  MapPin,
  LifeBuoy,
  Truck,
  CheckCircle2,
  Trash2,
  ShoppingBag,
  Send,
  Search,
} from 'lucide-react';

export const CustomerAccountPage: React.FC = () => {
  const {
    orders: allOrders,
    wishlist,
    products,
    addToCart,
    toggleWishlist,
    cancelOrder,
    requestReturn,
    activeOrderToTrack,
    setActiveCustomerPage,
    showToast,
  } = useStore();
  const { user, loading: authLoading, openAuth, logout } = useAuth();

  // শুধু এই ইউজারের নিজের অর্ডারগুলো দেখাবে (ইমেইল মিলিয়ে)
  const orders = useMemo(
    () =>
      user
        ? allOrders.filter((o) => o.customer.email?.toLowerCase() === user.email.toLowerCase())
        : [],
    [allOrders, user]
  );

  const [activeTab, setActiveTab] = useState<'orders' | 'tracking' | 'wishlist' | 'addresses' | 'support'>('orders');

  // Cancel / Return modal states
  const [targetOrderForAction, setTargetOrderForAction] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<'cancel' | 'return' | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Tracking search input
  const [trackSearchOrderNum, setTrackSearchOrderNum] = useState(
    activeOrderToTrack ? activeOrderToTrack.orderNumber : ''
  );

  const matchedTrackOrder = orders.find(
    (o) => o.orderNumber.toUpperCase() === trackSearchOrderNum.trim().toUpperCase()
  );

  // প্রোফাইল তথ্য সর্বশেষ অর্ডারের কাস্টমার থেকে আসে। অর্ডার না থাকলে Guest দেখাবে।
  const profile = orders[0]?.customer;
  const profileName = user?.name || profile?.name || 'Guest Customer';
  const profileInitials =
    profileName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'G';
  const profileSubtitle = user ? [user.email, user.phone].filter(Boolean).join(' · ') : '';

  // অর্ডারগুলোর ডেলিভারি ঠিকানা থেকে unique ঠিকানার তালিকা
  const savedAddresses = useMemo(() => {
    const seen = new Map<string, Order['customer']>();
    orders.forEach((o) => {
      const key = `${o.customer.address}|${o.customer.city}`.toLowerCase();
      if (!seen.has(key)) seen.set(key, o.customer);
    });
    return Array.from(seen.values());
  }, [orders]);

  // লগইন ছাড়া একাউন্ট পেজ দেখা যাবে না
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <h2 className="text-lg font-extrabold text-slate-950 mb-2">আপনার একাউন্টে লগইন করুন</h2>
          <p className="text-xs text-slate-500 mb-6">
            {authLoading
              ? 'একটু অপেক্ষা করুন...'
              : 'আপনার অর্ডার, ট্র্যাকিং ও উইশলিস্ট দেখতে লগইন বা রেজিস্ট্রেশন করুন।'}
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

  const handleOpenAction = (order: Order, type: 'cancel' | 'return') => {
    setTargetOrderForAction(order);
    setActionType(type);
    setActionReason('');
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOrderForAction || !actionReason.trim()) return;

    if (actionType === 'cancel') {
      cancelOrder(targetOrderForAction.id, actionReason.trim());
    } else if (actionType === 'return') {
      requestReturn(targetOrderForAction.id, actionReason.trim());
    }

    setTargetOrderForAction(null);
    setActionType(null);
    setActionReason('');
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketSuccess(true);
    setTicketSubject('');
    setTicketMessage('');
    showToast('Customer support inquiry created! Ticket ID #TK-9124');
    setTimeout(() => setTicketSuccess(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Account Header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {profileInitials}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-950">{profileName}</h1>
            <p className="text-xs text-slate-500">{profileSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer transition-colors"
          >
            লগআউট
          </button>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Orders</span>
            <span className="font-extrabold text-slate-900">{orders.length} placed</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Wishlist</span>
            <span className="font-extrabold text-slate-900">{wishlist.length} saved</span>
          </div>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 mb-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'tracking'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Live Order Tracking</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'wishlist'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'addresses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Delivery Addresses</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'support'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Customer Support</span>
        </button>
      </div>

      {/* Tab 1: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">No orders placed yet</h3>
              <p className="text-xs text-slate-500 mb-4">
                Explore our store and pick items to see them tracked here.
              </p>
              <button
                onClick={() => setActiveCustomerPage('catalog')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const isCancellable = order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed';
              const isReturnable = order.orderStatus === 'Delivered';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-900 block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status indicator */}
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700'
                            : order.orderStatus === 'Return Requested'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        ৳{order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400">
                            Qty: {item.quantity} {item.variations && `· ${item.variations}`}
                          </p>
                        </div>
                        <span className="font-semibold text-slate-900">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500">
                      Payment: <strong className="text-slate-800 uppercase">{order.paymentMethod}</strong> ({order.paymentStatus})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTrackSearchOrderNum(order.orderNumber);
                          setActiveTab('tracking');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Track Shipment
                      </button>

                      {isCancellable && (
                        <button
                          onClick={() => handleOpenAction(order, 'cancel')}
                          className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      )}

                      {isReturnable && (
                        <button
                          onClick={() => handleOpenAction(order, 'return')}
                          className="px-3 py-1.5 text-amber-700 hover:bg-amber-50 font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Request Return
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Live Order Tracking */}
      {activeTab === 'tracking' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-950 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Track Your Package</span>
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackSearchOrderNum}
                onChange={(e) => setTrackSearchOrderNum(e.target.value)}
                placeholder="Enter your Order Number (SZ-2026-XXXX)"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 uppercase bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 font-mono"
              />
            </div>
          </div>

          {matchedTrackOrder ? (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Shipment Tracking
                  </span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    {matchedTrackOrder.orderNumber}
                  </span>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                  {matchedTrackOrder.orderStatus}
                </span>
              </div>

              {/* Milestones timeline */}
              <div className="space-y-6 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {matchedTrackOrder.trackingHistory.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-4 ring-white">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{step.status}</span>
                        <span className="text-[11px] text-slate-400">{step.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery recipient info */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-slate-900 block mb-1">Destination Address:</span>
                <p>
                  {matchedTrackOrder.customer.name} · {matchedTrackOrder.customer.address}, {matchedTrackOrder.customer.city}
                </p>
                <p className="text-slate-400 mt-0.5">Phone: {matchedTrackOrder.customer.phone}</p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              {trackSearchOrderNum.trim()
                ? 'এই অর্ডার নম্বরে কোনো অর্ডার পাওয়া যায়নি। নম্বরটি আবার চেক করুন।'
                : 'Please enter an active order number above to view tracking progress.'}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <Heart className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">Your wishlist is empty</h3>
              <p className="text-xs text-slate-500 mb-4">
                Save products you love so you can easily purchase them later.
              </p>
              <button
                onClick={() => setActiveCustomerPage('catalog')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((id) => {
                const product = products.find((p) => p.id === id);
                if (!product) return null;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 block mb-1">
                        {product.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mb-2">
                        {product.title}
                      </h4>
                      <span className="text-sm font-extrabold text-slate-900 block mb-3">
                        ৳{(product.salePrice || product.regularPrice).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => addToCart(product.id, 1)}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Cart</span>
                      </button>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Delivery Addresses */}
      {activeTab === 'addresses' && (
        <div>
          {savedAddresses.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-4xl">
              <MapPin className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">কোনো ঠিকানা সেভ করা নেই</h3>
              <p className="text-xs text-slate-500">
                অর্ডার করার সময় যে ঠিকানা দেবেন সেটি এখানে দেখা যাবে।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {savedAddresses.map((addr, idx) => (
                <div
                  key={`${addr.address}-${idx}`}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2"
                >
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      idx === 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {idx === 0 ? 'Default Delivery Address' : 'Saved Address'}
                  </span>
                  <p className="text-sm font-bold text-slate-900">{addr.name}</p>
                  <p className="text-xs text-slate-500">{addr.address}</p>
                  <p className="text-xs text-slate-500">
                    {[addr.city, addr.postalCode].filter(Boolean).join(' - ')}
                    {addr.country ? `, ${addr.country}` : ''}
                  </p>
                  <p className="text-xs text-slate-500">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Customer Support */}
      {activeTab === 'support' && (
        <div className="max-w-2xl bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-950 mb-1 flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-indigo-600" />
              <span>Contact Store Support Helpdesk</span>
            </h2>
            <p className="text-xs text-slate-500">
              Have an issue with delivery, payment, or warranty? Submit a ticket below.
            </p>
          </div>

          {ticketSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Inquiry submitted! Our support team will reply within 2 hours.</span>
            </div>
          )}

          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Inquiry Topic / Subject
              </label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Delivery reschedule request"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Message & Specific Details
              </label>
              <textarea
                required
                rows={4}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Provide order number or describe your request..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Support Ticket</span>
            </button>
          </form>
        </div>
      )}

      {/* Cancel or Return Reason Dialog */}
      {targetOrderForAction && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setTargetOrderForAction(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-10 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-950 mb-1">
              {actionType === 'cancel' ? 'Cancel Order' : 'Request Return / Refund'}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              Order: {targetOrderForAction.orderNumber}
            </p>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for {actionType === 'cancel' ? 'cancellation' : 'return'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Changed mind / ordered wrong variant / damaged in transit..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetOrderForAction(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg cursor-pointer ${
                    actionType === 'cancel' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {actionType === 'cancel' ? 'Confirm Cancellation' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};