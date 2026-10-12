import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export const AIStockAssistant: React.FC = () => {
  const { products, updateProductStock, showToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<any>(null);

  const fetchStockForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/stock-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });
      const json = await res.json();
      if (json.success) {
        setStockData(json.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error querying AI stock assistant', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockForecast();
  }, []);

  const handleApproveReorder = (productId: string, qty: number, title: string) => {
    const prod = products.find((p) => p.id === productId || p.title.toLowerCase().includes(title.toLowerCase()));
    if (prod) {
      updateProductStock(prod.id, prod.stock + qty);
      showToast(`Approved restock order of +${qty} units for "${prod.title}"`);
    } else {
      showToast(`Approved restock for ${title}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-950">AI Stock & Replenishment Assistant</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive inventory runway analysis, stockout risks, and automated replenishment purchase orders.
          </p>
        </div>

        <button
          onClick={fetchStockForecast}
          disabled={loading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Calculating...' : 'Recalculate Runout'}</span>
        </button>
      </div>

      {loading && !stockData && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Modeling inventory depletion velocity...</p>
        </div>
      )}

      {stockData && (
        <div className="space-y-6">
          {/* Critical Stockout Risk Banner */}
          <div className="p-6 rounded-3xl bg-rose-50/60 border border-rose-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                Imminent Stockout Warnings
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stockData.criticalStockoutRisk?.map((risk: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-rose-200/80 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">{risk.title}</h4>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Current Stock: <strong>{risk.currentStock}</strong></span>
                    <span className="font-bold text-rose-600">{risk.estimatedDaysLeft} days left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Replenishment Plan with 1-click Approval */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-950">
                AI Suggested Replenishment Purchase Orders
              </h3>
              <p className="text-xs text-slate-500">
                Review suggested batch quantities. One click updates live inventory status once purchase order arrives.
              </p>
            </div>

            <div className="space-y-3">
              {stockData.replenishmentPlan?.map((plan: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          plan.urgency === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {plan.urgency}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{plan.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600">{plan.rationale}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Stock: <strong>{plan.currentStock} units</strong></span>
                      <span>·</span>
                      <span>Recommended Batch: <strong className="text-indigo-600">+{plan.recommendedReorderQty} units</strong></span>
                      <span>·</span>
                      <span>Est. Supplier Cost: <strong>${plan.estimatedCost}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleApproveReorder(plan.productId, plan.recommendedReorderQty, plan.title)
                    }
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 self-start md:self-auto shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Restock (+{plan.recommendedReorderQty})</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dead Stock & Turnaround Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-slate-500" />
                <span>Slow Moving Inventory</span>
              </h3>
              {stockData.deadStockItems?.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-900">{item.title}</span>
                  <p className="text-slate-600">{item.action}</p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Operational Summary Note</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {stockData.summaryNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
