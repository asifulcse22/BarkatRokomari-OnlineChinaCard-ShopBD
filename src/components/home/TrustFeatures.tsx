import React from 'react';
import { Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-react';

export const TrustFeatures: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Free Shipping */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-0.5">Free Shipping</h4>
            <p className="text-[11px] text-slate-500">On orders above ৳1,000</p>
          </div>
        </div>

        {/* Card 2: Secure Payment */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-0.5">Secure Payment</h4>
            <p className="text-[11px] text-slate-500">100% secure & trusted</p>
          </div>
        </div>

        {/* Card 3: 24/7 Support */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-0.5">24/7 Support</h4>
            <p className="text-[11px] text-slate-500">Always here to help</p>
          </div>
        </div>

        {/* Card 4: Easy Returns */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-0.5">Easy Returns</h4>
            <p className="text-[11px] text-slate-500">7 days return policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};
