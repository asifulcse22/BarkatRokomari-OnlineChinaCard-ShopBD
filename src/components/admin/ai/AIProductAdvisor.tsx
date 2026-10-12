import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import {
  TrendingUp,
  AlertCircle,
  Tag,
  Check,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AIProductAdvisor: React.FC = () => {
  const { products, applyDiscountToProduct, showToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [advisorData, setAdvisorData] = useState<any>(null);

  const fetchAdvisor = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/product-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });
      const json = await res.json();
      if (json.success) {
        setAdvisorData(json.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error querying product advisor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisor();
  }, []);

  const handleApplyDiscount = (productTitle: string, discount: number) => {
    const prod = products.find((p) => p.title.toLowerCase().includes(productTitle.toLowerCase()));
    if (prod) {
      applyDiscountToProduct(prod.id, discount);
      showToast(`Applied ${discount}% discount to "${prod.title}"`);
    } else {
      showToast(`Discount applied for ${productTitle}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-950">AI Product & Merchandising Advisor</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Surfaces catalog leaders, flags stagnant inventory, and calculates targeted promotion candidates.
          </p>
        </div>

        <button
          onClick={fetchAdvisor}
          disabled={loading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : 'Re-run Analysis'}</span>
        </button>
      </div>

      {loading && !advisorData && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Analyzing catalog velocities and margins...</p>
        </div>
      )}

      {advisorData && (
        <div className="space-y-6">
          {/* Top Performers vs Underperforming Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Top Performing Volume Drivers</span>
              </h3>
              <div className="space-y-3">
                {advisorData.topPerformers?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-emerald-800">{item.reason}</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      <strong>AI Strategy:</strong> {item.strategy}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Underperforming Items */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Turnaround Candidates (Low Velocity)</span>
              </h3>
              <div className="space-y-3">
                {advisorData.underperforming?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/80 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-amber-800">{item.issue}</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      <strong>AI Turnaround Idea:</strong> {item.turnaroundIdea}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Promotion Recommendations (with 1-click Approval) */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>AI Targeted Promotion & Discount Suggestions</span>
              </h3>
              <p className="text-xs text-slate-500">
                Data-backed promotional discounts designed to increase inventory turnaround without sacrificing healthy margins.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {advisorData.promotionSuggestions?.map((sug: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {sug.productTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-black bg-indigo-100 text-indigo-700">
                        {sug.discountPercentage}% Off
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{sug.rationale}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      Expected Impact: {sug.expectedLift}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApplyDiscount(sug.productTitle, sug.discountPercentage)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Apply {sug.discountPercentage}% Discount</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog Listing Optimization Tips */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Catalog Listing Improvement Ideas</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {advisorData.listingOptimizationAdvice?.map((tip: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
