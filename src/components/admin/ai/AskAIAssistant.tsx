import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Boxes,
  FileText,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  'Which products have low stock right now?',
  'Summarize today\'s sales and top categories',
  'Write a Bengali Facebook post for our Aura Pro ANC headphones',
  'Which products should I put on discount this weekend?',
  'What operational improvements should we prioritize?',
];

export const AskAIAssistant: React.FC = () => {
  const { products, orders } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I am your **ShopZone AI Business Co-Pilot** powered by Gemini 3.8 Flash.\n\nI have real-time visibility into your current inventory (${products.length} products), total gross sales ($${orders.reduce((s, o) => s + o.total, 0).toFixed(2)}), and customer order statuses.\n\nAsk me anything about your products, sales analytics, stock alerts, or request marketing copy in English or Bengali (বাংলা).`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    // Prepare store context for grounding
    const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
    const lowStock = products.filter((p) => p.stock <= 8);

    try {
      const res = await fetch('/api/ai/ask-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          storeContext: {
            totalRevenue: totalRev.toFixed(2),
            totalOrders: orders.length,
            lowStockCount: lowStock.length,
            productCount: products.length,
            productsSummary: products.map((p) => ({
              title: p.title,
              category: p.category,
              stock: p.stock,
              sales: p.salesCount,
              price: p.salePrice || p.regularPrice,
            })),
            recentOrdersSummary: orders.slice(0, 5).map((o) => ({
              orderNumber: o.orderNumber,
              total: o.total,
              status: o.orderStatus,
              payment: o.paymentMethod,
            })),
          },
        }),
      });

      const data = await res.json();
      const reply = data.answer || 'I could not process the store data right now. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Encountered a connection delay. Please ensure your query is formulated or retry.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[700px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
              <span>Ask AI — Executive Business Assistant</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                Live Data Grounded
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Grounded in current catalog inventory, orders, and sales telemetry.
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'init-1',
                sender: 'assistant',
                text: 'Conversation refreshed. How can I help you analyze your e-commerce operations today?',
                timestamp: 'Just now',
              },
            ])
          }
          className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
        >
          Clear Chat
        </button>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="px-6 py-2.5 bg-slate-100/60 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">
          Try asking:
        </span>
        {SAMPLE_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/80 whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs whitespace-pre-line'
                }`}
              >
                <div className="font-sans">{msg.text}</div>
                <span
                  className={`text-[10px] block text-right ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-slate-500 italic">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <span>Analyzing real-time store database...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-200/80 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about sales, inventory, low stock, or marketing in English or বাংলা..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
