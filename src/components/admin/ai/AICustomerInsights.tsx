import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import {
  Users,
  CreditCard,
  MapPin,
  Repeat,
  Sparkles,
  RefreshCw,
  PieChart,
} from 'lucide-react';

export const AICustomerInsights: React.FC = () => {
  const { orders, showToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [insightsData, setInsightsData] = useState<any>(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/customer-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
      });
      const json = await res.json();
      if (json.success) {
        setInsightsData(json.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error querying customer insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-950">AI Customer Cohorts & Retention Intelligence</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Analyzes checkout patterns, repeat buyer affinity, and mobile payment channel preference.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : 'Re-run Insights'}</span>
        </button>
      </div>

      {loading && !insightsData && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Analyzing customer cohorts & payment shares...</p>
        </div>
      )}

      {insightsData && (
        <div className="space-y-6">
          {/* Customer Cohorts */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Identified Customer Segments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insightsData.customerCohorts?.map((cohort: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{cohort.segmentName}</span>
                      <span className="text-xs font-black text-indigo-600">{cohort.percentage}%</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{cohort.characteristics}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <strong className="text-slate-700">Retention Strategy:</strong> {cohort.retentionStrategy}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Preferences & Geography */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Method Insights */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Payment Method Distribution</span>
              </h3>
              <div className="space-y-2">
                {insightsData.paymentPreferences?.map((pay: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{pay.method}</span>
                      <p className="text-[11px] text-slate-500">{pay.insight}</p>
                    </div>
                    <span className="font-extrabold text-slate-800 text-xs px-2 py-0.5 rounded bg-white border border-slate-200">
                      {pay.share}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Hubs & Personalization */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Key Delivery Locations</span>
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {insightsData.geographicHotspots?.map((loc: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Cross-Selling Recommendation Rule</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {insightsData.personalizedRecommendationsTip}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
