import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, ExternalLink, X, Terminal } from 'lucide-react';

interface NeonDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NeonDatabaseModal: React.FC<NeonDatabaseModalProps> = ({ isOpen, onClose }) => {
  const [statusData, setStatusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'steps' | 'sql' | 'env'>('steps');
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/db/status');
      const data = await res.json();
      setStatusData(data);
    } catch (err: any) {
      setStatusData({ connected: false, error: err.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSeed = async () => {
    setSeedLoading(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/db/seed', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'connected') {
        setSeedMessage('ডাটাবেস সফলভাবে প্রস্তুত এবং সিড হয়েছে!');
        checkStatus();
      } else {
        setSeedMessage(data.message || 'DATABASE_URL সেট করা নেই।');
      }
    } catch (err: any) {
      setSeedMessage('ত্রুটি: ' + err.message);
    } finally {
      setSeedLoading(false);
    }
  };

  if (!isOpen) return null;

  const envSample = `DATABASE_URL="postgresql://username:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"`;

  const sqlSample = `-- Neon SQL Editor-এ রান করার জন্য টেবিল তৈরি কোড:
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  sku VARCHAR(100),
  category VARCHAR(100),
  brand VARCHAR(100),
  description TEXT,
  specifications JSONB DEFAULT '[]'::jsonb,
  regular_price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2),
  stock INT DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  variations JSONB DEFAULT '{}'::jsonb,
  featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  sales_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  order_number VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  shipping_fee NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  coupon_code VARCHAR(100),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50),
  order_status VARCHAR(50),
  tracking_history JSONB DEFAULT '[]'::jsonb,
  cancellation_reason TEXT,
  return_reason TEXT
);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <span>Neon PostgreSQL Database সেটআপ</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Serverless
                </span>
              </h3>
              <p className="text-xs text-slate-500">স্টেপ বাই স্টেপ ডাটাবেস কানেকশন ও সিঙ্ক্রোনাইজেশন গাইড</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">বর্তমান স্ট্যাটাস:</span>
            {isLoading ? (
              <span className="flex items-center gap-1.5 text-slate-300">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> চেক করা হচ্ছে...
              </span>
            ) : statusData?.connected ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Neon PostgreSQL কানেক্টেড (লাইভ ডাটাবেস সক্রিয়)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <AlertCircle className="w-4 h-4" /> লোকাল মোড / ফলব্যাক (DATABASE_URL এখনো যুক্ত হয়নি)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={checkStatus}
              disabled={isLoading}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-md font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>রি-চেক</span>
            </button>
            {statusData?.connected && (
              <button
                onClick={handleSeed}
                disabled={seedLoading}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 rounded-md font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{seedLoading ? 'সিড হচ্ছে...' : 'ডেমো ডাটা সিড'}</span>
              </button>
            )}
          </div>
        </div>

        {seedMessage && (
          <div className="px-5 py-2 text-xs bg-teal-50 text-teal-800 border-b border-teal-200">
            {seedMessage}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 pt-3 bg-slate-50/40 gap-2">
          <button
            onClick={() => setActiveTab('steps')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'steps'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ধাপ ১, ২, ৩ (বাংলা গাইড)
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            SQL স্ক্রিপ্ট (neon-schema.sql)
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'env'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            .env কনফিগারেশন
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/50 flex gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ১
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Neon.tech এ ফ্রি ডাটাবেস তৈরি করুন</h4>
                  <p className="text-slate-600">
                    ব্রাউজারে <a href="https://neon.tech" target="_blank" rel="noreferrer" className="text-teal-600 underline font-semibold inline-flex items-center gap-0.5">neon.tech <ExternalLink className="w-3 h-3" /></a> এ যান এবং GitHub বা Google দিয়ে ফ্রি একাউন্ট খুলুন। "Create Project" বাটনে ক্লিক করে প্রজেক্টের নাম দিন (যেমন: <code>shopzone-db</code>)।
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/50 flex gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ২
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">Connection String কপি করুন</h4>
                  <p className="text-slate-600">
                    প্রজেক্ট ড্যাশবোর্ডে <strong>Connection Details</strong> থেকে <code>Connection String</code> (Node.js/Postgres) কপি করুন। এটি দেখতে নিচের মত হবে:
                  </p>
                  <div className="bg-slate-900 text-slate-200 p-2 rounded-lg font-mono text-[11px] break-all select-all mt-1">
                    postgresql://alex:AbCdEfG123@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/50 flex gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ৩
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">প্রজেক্টের .env ফাইলে বসিয়ে দিন</h4>
                  <p className="text-slate-600">
                    আপনার প্রজেক্টের <code>.env</code> ফাইলে এই লাইনটি যোগ করুন:
                  </p>
                  <div className="bg-slate-900 text-slate-200 p-2 rounded-lg font-mono text-[11px] flex items-center justify-between mt-1">
                    <span>DATABASE_URL="আপনার_কপি_করা_লিঙ্ক"</span>
                    <button
                      onClick={() => handleCopy(envSample, 'env_step')}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedKey === 'env_step' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/50 flex gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ৪
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">স্বয়ংক্রিয় কানেকশন ও টেবিল তৈরি</h4>
                  <p className="text-slate-600">
                    আমাদের কোডে অলরেডি <code>@neondatabase/serverless</code> ইন্টিগ্রেট করা আছে। আপনি <code>DATABASE_URL</code> দিলেই ব্যাকএন্ড অটোমেটিকভাবে <code>products</code> এবং <code>orders</code> টেবিল বানিয়ে প্রাথমিক ডেমো ডাটা ইনসার্ট করে নেবে!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-slate-600">
                  Neon Console-এর <strong>SQL Editor</strong> ট্যাবে গিয়ে এই স্ক্রিপ্ট পেস্ট করে Run করতে পারেন:
                </p>
                <button
                  onClick={() => handleCopy(sqlSample, 'sql_tab')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                >
                  {copiedKey === 'sql_tab' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>SQL কপি করুন</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed max-h-60">
                {sqlSample}
              </pre>
            </div>
          )}

          {activeTab === 'env' && (
            <div className="space-y-2">
              <p className="text-slate-600">
                আপনার রুট ফোল্ডারের <code>.env</code> ফাইলে এভাবে রাখুন:
              </p>
              <div className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] flex items-center justify-between">
                <code>{envSample}</code>
                <button
                  onClick={() => handleCopy(envSample, 'env_tab')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {copiedKey === 'env_tab' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            বুঝেছি, বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
