import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  Eye,
  ChevronDown,
} from 'lucide-react';

const ALL_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Return Requested',
  'Returned',
];

export const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'All' && o.orderStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-950">Store Order Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review live customer purchases, update delivery stages, verify bKash/Nagad transactions, and process return requests.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            Total Orders: <strong>{orders.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            Delivered: <strong>{orders.filter((o) => o.orderStatus === 'Delivered').length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, phone..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 font-mono"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium cursor-pointer"
        >
          <option value="All">All Statuses ({orders.length})</option>
          {ALL_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st} ({orders.filter((o) => o.orderStatus === st).length})
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Order Number</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Items</th>
                <th className="px-4 py-3.5">Total & Payment</th>
                <th className="px-4 py-3.5">Delivery Status</th>
                <th className="px-6 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-slate-900 block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-900 block">{order.customer.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {order.customer.city} · {order.customer.phone}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-slate-800">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} unit(s)
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                      {order.items.map((i) => i.title).join(', ')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-extrabold text-slate-900">
                      ${order.total.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">
                      {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {/* Status Changer Select */}
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : order.orderStatus === 'Return Requested'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}
                    >
                      {ALL_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Inspect Order Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-slate-900 block">
                  {selectedOrder.orderNumber}
                </span>
                <span className="text-[11px] text-slate-400">
                  Customer Order Dossier
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                  Recipient & Contact
                </span>
                <p className="font-bold text-slate-900">{selectedOrder.customer.name}</p>
                <p className="text-slate-600">{selectedOrder.customer.email}</p>
                <p className="text-slate-600">{selectedOrder.customer.phone}</p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                  Delivery Destination
                </span>
                <p className="text-slate-700">{selectedOrder.customer.address}</p>
                <p className="text-slate-600">
                  {selectedOrder.customer.city}, {selectedOrder.customer.postalCode}
                </p>
                <p className="text-slate-600">{selectedOrder.customer.country}</p>
              </div>
            </div>

            {/* Special Reasons */}
            {selectedOrder.cancellationReason && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">
                <strong>Cancellation Reason:</strong> {selectedOrder.cancellationReason}
              </div>
            )}
            {selectedOrder.returnReason && (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs">
                <strong>Return / Refund Reason:</strong> {selectedOrder.returnReason}
              </div>
            )}

            {/* Items */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Package Contents</h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center gap-3 text-xs">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400">
                        Qty: {item.quantity} {item.variations && `· ${item.variations}`}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones log */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Audit Tracking Milestones</h4>
              <div className="space-y-2 text-xs">
                {selectedOrder.trackingHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <strong className="text-slate-900">{h.status}:</strong>{' '}
                      <span className="text-slate-600">{h.note}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2">{h.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
