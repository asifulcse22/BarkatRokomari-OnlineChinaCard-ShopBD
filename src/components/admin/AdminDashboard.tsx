import React from 'react';
import { useStore } from '../../context/StoreContext';
import { AIBusinessCenter } from './ai/AIBusinessCenter';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { CouponManagement } from './CouponManagement';
import {
  Sparkles,
  Package,
  ShoppingBag,
  Tag,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  Share2,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    setViewMode,
    orders,
    products,
    campaigns,
    updateCampaignStatus,
  } = useStore();

  const totalGrossRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalGrossRevenue / orders.length : 0;
  const lowStockCount = products.filter((p) => p.stock <= 8).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner & Switch Back to Customer Storefront */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
              Executive Business Portal
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">ShopZone Admin Operations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
            Store Management & AI Intelligence
          </h1>
        </div>

        <button
          onClick={() => setViewMode('customer')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Switch to Customer Storefront</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Gross Revenue
            </span>
            <span className="text-xl font-black text-slate-950 font-mono">
              ${totalGrossRevenue.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Orders Processed
            </span>
            <span className="text-xl font-black text-slate-950 font-mono">
              {orders.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Avg Basket Value
            </span>
            <span className="text-xl font-black text-slate-950 font-mono">
              ${avgOrderValue.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Low Stock Warnings
            </span>
            <span className={`text-xl font-black font-mono ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-950'}`}>
              {lowStockCount} items
            </span>
          </div>
        </div>
      </div>

      {/* Main Admin Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-6 mb-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveAdminTab('ai-center')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'ai-center'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>AI Business Center (Flagship)</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('products')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products & Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('coupons')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'coupons'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promotions & Coupons</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('marketing')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeAdminTab === 'marketing'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Campaigns Archive ({campaigns.length})</span>
        </button>
      </div>

      {/* Render selected admin view */}
      {activeAdminTab === 'ai-center' && <AIBusinessCenter />}
      {activeAdminTab === 'products' && <ProductManagement />}
      {activeAdminTab === 'orders' && <OrderManagement />}
      {activeAdminTab === 'coupons' && <CouponManagement />}
      {activeAdminTab === 'marketing' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-950">Marketing & Promotional Campaigns</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review published copy generated through the AI Marketing Studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {camp.channel} · {camp.language === 'bn' ? 'বাংলা' : 'English'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      camp.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {camp.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{camp.headline || camp.title}</h3>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-sans">
                  {camp.content}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Target: {camp.targetProductTitle}</span>
                  <span>Created: {camp.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
