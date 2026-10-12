import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { AIOverview } from './AIOverview';
import { AIProductAdvisor } from './AIProductAdvisor';
import { AIStockAssistant } from './AIStockAssistant';
import { AIMarketingStudio } from './AIMarketingStudio';
import { AICustomerInsights } from './AICustomerInsights';
import { AskAIAssistant } from './AskAIAssistant';
import {
  Sparkles,
  TrendingUp,
  Tag,
  Boxes,
  Share2,
  Users,
  MessageSquare,
} from 'lucide-react';

export const AIBusinessCenter: React.FC = () => {
  const { aiSubTab, setAiSubTab } = useStore();

  return (
    <div className="space-y-6">
      {/* Subtab Navigation Strip */}
      <div className="flex border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setAiSubTab('overview')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            aiSubTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Executive Overview</span>
        </button>

        <button
          onClick={() => setAiSubTab('advisor')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            aiSubTab === 'advisor'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Product Advisor</span>
        </button>

        <button
          onClick={() => setAiSubTab('stock')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            aiSubTab === 'stock'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stock Assistant</span>
        </button>

        <button
          onClick={() => setAiSubTab('marketing')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            aiSubTab === 'marketing'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Marketing Studio (Bilingual)</span>
        </button>

        <button
          onClick={() => setAiSubTab('insights')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            aiSubTab === 'insights'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Insights</span>
        </button>

        <button
          onClick={() => setAiSubTab('ask')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            aiSubTab === 'ask'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* Render selected submodule */}
      {aiSubTab === 'overview' && <AIOverview />}
      {aiSubTab === 'advisor' && <AIProductAdvisor />}
      {aiSubTab === 'stock' && <AIStockAssistant />}
      {aiSubTab === 'marketing' && <AIMarketingStudio />}
      {aiSubTab === 'insights' && <AICustomerInsights />}
      {aiSubTab === 'ask' && <AskAIAssistant />}
    </div>
  );
};
