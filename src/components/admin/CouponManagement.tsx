import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Coupon } from '../../types';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';

export const CouponManagement: React.FC = () => {
  const { coupons, addCoupon, toggleCouponStatus, deleteCoupon } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<'percentage' | 'fixed'>('percentage');
  const [formValue, setFormValue] = useState(15);
  const [formMinOrder, setFormMinOrder] = useState(50);
  const [formDescription, setFormDescription] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('2026-12-31');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) return;

    addCoupon({
      code: formCode.trim().toUpperCase(),
      discountType: formType,
      discountValue: formValue,
      minOrder: formMinOrder,
      description: formDescription,
      expiresAt: formExpiresAt,
      active: true,
      timesUsed: 0,
    });

    setIsModalOpen(false);
    setFormCode('');
    setFormDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-950">Promotions & Discount Campaigns</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure voucher codes, seasonal sale campaigns, free delivery vouchers, and track customer redemptions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 bg-white ${
              coupon.active ? 'border-slate-200/80 shadow-xs' : 'border-slate-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-base font-black text-indigo-600 tracking-wider">
                  {coupon.code}
                </span>
                <button
                  onClick={() => toggleCouponStatus(coupon.code)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {coupon.active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="text-2xl font-black text-slate-950 mb-1">
                {coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}% OFF`
                  : `$${coupon.discountValue} OFF`}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {coupon.description || `Applies to orders above $${coupon.minOrder}`}
              </p>

              <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Min. Cart Order:</span>
                  <span className="font-bold text-slate-800">${coupon.minOrder}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="font-semibold text-slate-800">{coupon.expiresAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Times Redeemed:</span>
                  <span className="font-bold text-indigo-600">{coupon.timesUsed} uses</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => deleteCoupon(coupon.code)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete Coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to create coupon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-950">Create New Coupon Campaign</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Coupon Voucher Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH20"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Value {formType === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formValue}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min. Order Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Campaign Description</label>
                <input
                  type="text"
                  placeholder="e.g. 15% off for tech accessories above $50"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Launch Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
