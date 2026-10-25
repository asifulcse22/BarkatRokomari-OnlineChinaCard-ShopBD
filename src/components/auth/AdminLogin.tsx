import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

// File: src/components/auth/AdminLogin.tsx
// Admin dashboard-e dhukte hole ei form dekhabe. Customer-der jonno na.

export const AdminLogin: React.FC = () => {
  const { user, login, logout } = useAuth();
  const { setViewMode, setActiveCustomerPage } = useStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const backToStore = () => {
    setViewMode('customer');
    setActiveCustomerPage('home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const err = await login(identifier.trim(), password);
    setSubmitting(false);
    if (err) setError(err);
  };

  const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20';

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-lg font-semibold text-slate-900">অ্যাডমিন লগইন</h1>

        {user && user.role !== 'admin' ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              এই একাউন্টে অ্যাডমিন অনুমতি নেই। অ্যাডমিন একাউন্ট দিয়ে লগইন করুন।
            </p>
            <button
              type="button"
              onClick={logout}
              className="w-full cursor-pointer rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              লগআউট করে আবার চেষ্টা করুন
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-slate-500">শুধু দোকানের অ্যাডমিনের জন্য।</p>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                ইমেইল অথবা মোবাইল নম্বর
              </span>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">পাসওয়ার্ড</span>
              <span className="relative block">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'অপেক্ষা করুন...' : 'লগইন করুন'}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={backToStore}
          className="mt-5 flex cursor-pointer items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          দোকানে ফিরে যান
        </button>
      </div>
    </div>
  );
};