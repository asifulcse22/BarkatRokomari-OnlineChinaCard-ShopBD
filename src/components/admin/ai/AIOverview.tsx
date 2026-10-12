import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Zap,
  ShieldAlert,
} from 'lucide-react';

export const AIOverview: React.FC = () => {
  const { products, orders, applyDiscountToProduct, updateProductStock, showToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // Compute store snapshot
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= 8);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/business-overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: {
            totalRevenue: totalRevenue.toFixed(2),
            totalOrders: orders.length,
            avgOrderValue: orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0',
            lowStockCount: lowStockProducts.length,
            productCount: products.length,
            returnRate: '1.2%',
          },
          recentOrders: orders.slice(0, 5),
          topProducts: products.slice(0, 5),
          lowStockItems: lowStockProducts,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to AI service', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleExecuteAction = (action: any) => {
    if (action.category === 'Inventory') {
      // Find low stock product and restock
      const lowP = lowStockProducts[0];
      if (lowP) {
        updateProductStock(lowP.id, lowP.stock + 25);
        showToast(`Approved & Restocked 25 units for "${lowP.title}"`);
      }
    } else if (action.category === 'Marketing' || action.category === 'Pricing') {
      const topP = products[0];
      if (topP) {
        applyDiscountToProduct(topP.id, 15);
        showToast(`Approved 15% promotional campaign on "${topP.title}"`);
      }
    } else {
      showToast(`Action executed: "${action.title}"`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold">Executive AI Business Overview</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-md">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Automated intelligence analyzing current store volume, margins, inventory runout, and customer demand.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          disabled={loading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : 'Refresh AI Analysis'}</span>
        </button>
      </div>

      {loading && !data && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Gemini is synthesizing business data...</p>
        </div>
      )}

      {data && (
        <>
          {/* Executive Summary & Health Score */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Digest Card (8 Cols) */}
            <div className="lg:col-span-8 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Executive Operational Digest</span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {data.executiveSummary}
              </p>
              {data.revenueCommentary && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <strong className="text-slate-800">Revenue Drivers:</strong> {data.revenueCommentary}
                </div>
              )}
            </div>

            {/* Health Score Card (4 Cols) */}
            <div className="lg:col-span-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Store Health Index
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-950 font-mono">
                    {data.healthScore || 88}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/ 100</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${data.healthScore || 88}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Order Fulfillment:</span>
                  <span className="font-bold text-emerald-600">98.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Stock Health Buffer:</span>
                  <span className="font-bold text-amber-600">
                    {lowStockProducts.length > 0 ? `${lowStockProducts.length} at risk` : 'Optimal'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Observations List */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Critical Business Observations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.keyObservations?.map((obs: string, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5"
                >
                  <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{obs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prioritized Actions with Administrator Approval */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-950">
                  Recommended Priority Actions
                </h3>
                <p className="text-xs text-slate-500">
                  Section 5.7 Compliance: Actions require administrator approval before execution.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {data.prioritizedActions?.map((act: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-400/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          act.impact === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {act.impact} Impact · {act.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                    <p className="text-[11px] text-slate-500">
                      <strong>AI Suggestion:</strong> {act.recommendedAction}
                    </p>
                  </div>

                  <button
                    onClick={() => handleExecuteAction(act)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Execute</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
