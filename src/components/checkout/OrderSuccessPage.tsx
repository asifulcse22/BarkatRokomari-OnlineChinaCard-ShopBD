import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Printer,
  Calendar,
  CreditCard,
  MapPin,
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { latestPlacedOrder, setActiveCustomerPage, setActiveOrderToTrack } = useStore();

  if (!latestPlacedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">No active order session</h2>
        <button
          onClick={() => setActiveCustomerPage('home')}
          className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const order = latestPlacedOrder;

  const handleTrackOrder = () => {
    setActiveOrderToTrack(order);
    setActiveCustomerPage('account');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Success Badge */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">
          Order Confirmed & Placed
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 mt-1 mb-2 tracking-tight">
          Thank you for shopping with ShopZone!
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          We&apos;ve sent a confirmation receipt to{' '}
          <strong className="text-slate-800">{order.customer.email}</strong>. Our logistics team is now preparing your package.
        </p>
      </div>

      {/* Order Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs space-y-6">
        {/* Order Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Order Identifier
            </span>
            <span className="text-base font-extrabold text-slate-900 font-mono">
              {order.orderNumber}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Delivery
            </span>
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Oct 14 - Oct 16, 2026</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Payment Gateway
            </span>
            <span className="text-xs font-bold text-slate-900 uppercase">
              {order.paymentMethod} · {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Tracking Milestone Preview */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>Live Dispatch Status</span>
          </h3>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">
                  {order.trackingHistory[order.trackingHistory.length - 1]?.status || 'Order Received'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {order.trackingHistory[order.trackingHistory.length - 1]?.note}
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                {order.trackingHistory[order.trackingHistory.length - 1]?.timestamp}
              </span>
            </div>
          </div>
        </div>

        {/* Purchased Items */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 mb-3">Items in this Delivery</h3>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center gap-3 bg-white">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-500">
                    Qty: {item.quantity} {item.variations && `· ${item.variations}`}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Address & Total Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Shipping Address</span>
            </h4>
            <p className="text-slate-600 font-medium">{order.customer.name}</p>
            <p className="text-slate-500">{order.customer.address}</p>
            <p className="text-slate-500">
              {order.customer.city}, {order.customer.postalCode}
            </p>
            <p className="text-slate-500">{order.customer.phone}</p>
          </div>

          <div className="space-y-1.5 text-right sm:text-right">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>৳{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span>-৳{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Shipping:</span>
              <span>{order.shippingFee === 0 ? 'FREE' : `৳${order.shippingFee.toLocaleString()}`}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-950">
              <span>Total Paid:</span>
              <span>৳{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleTrackOrder}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Package className="w-4 h-4" />
              <span>Track in Account</span>
            </button>
            <button
              onClick={() => setActiveCustomerPage('catalog')}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Shop More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
