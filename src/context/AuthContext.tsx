import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
// ➕ নতুন ইমপোর্ট (১)
import { motion } from 'motion/react';
import { Logo } from '../components/common/Logo';
import { AuthPage } from '../components/auth/AuthPage';

// ফাইলের জায়গা: src/context/AuthContext.tsx

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
}

type AuthMode = 'login' | 'register';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// লগইন/লগআউটের পর StoreContext কে নতুন করে ডাটা আনতে বলার ইভেন্ট
const notifyAuthChanged = () => window.dispatchEvent(new Event('sz-auth-changed'));

// ➕ নতুন (২): সাইট লোড হওয়ার সময় লোগো সহ স্প্ল্যাশ স্ক্রিন
const AuthSplash: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-slate-50 via-indigo-50/70 to-violet-50">
    <Logo size="lg" />
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-violet-600"
          animate={{ y: [0, -9, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  </div>
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');

  // পেজ লোডে আগে থেকে লগইন আছে কিনা দেখা
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const openAuth = useCallback((m: AuthMode = 'login') => {
    setMode(m);
    setModalOpen(true);
  }, []);

  const closeAuth = useCallback(() => setModalOpen(false), []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    setMode('login'); // ➕ নতুন (৩): লগআউটের পর লগইন ট্যাব থেকে শুরু
    notifyAuthChanged();
  }, []);

  const handleSuccess = (u: AuthUser) => {
    setUser(u);
    setModalOpen(false);
    notifyAuthChanged();
  };

  // ➕ নতুন (৪): লগইন না থাকলে সুন্দর লগইন পেজ, থাকলে আপনার সাইট (children)
  let content: React.ReactNode;
  if (loading) {
    content = <AuthSplash />;
  } else if (!user) {
    content = <AuthPage mode={mode} setMode={setMode} onSuccess={handleSuccess} />;
  } else {
    content = children;
  }

  return (
    <AuthContext.Provider value={{ user, loading, openAuth, closeAuth, logout }}>
      {content}
      {modalOpen && (
        <AuthModal mode={mode} setMode={setMode} onClose={closeAuth} onSuccess={handleSuccess} />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

// ---------------------------------------------------------------
// Login / Register modal
// ---------------------------------------------------------------
const AuthModal: React.FC<{
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  onClose: () => void;
  onSuccess: (u: AuthUser) => void;
}> = ({ mode, setMode, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isRegister ? { name, email, phone, password } : { identifier, password }
        ),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setError(data?.message || 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        return;
      }
      onSuccess(data.user);
    } catch {
      setError('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6 mr-8">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              !isRegister ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            লগইন
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              isRegister ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            রেজিস্ট্রেশন
          </button>
        </div>

        <h2 className="text-xl font-extrabold text-slate-950 mb-1">
          {isRegister ? 'নতুন একাউন্ট খুলুন' : 'আপনার একাউন্টে লগইন করুন'}
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          {isRegister
            ? 'অর্ডার করতে ও অর্ডার ট্র্যাক করতে একাউন্ট দরকার।'
            : 'ইমেইল অথবা মোবাইল নম্বর দিয়ে লগইন করুন।'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">পুরো নাম</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম"
                  autoComplete="name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">মোবাইল নম্বর</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  autoComplete="tel"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ইমেইল</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                ইমেইল অথবা মোবাইল নম্বর
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="01XXXXXXXXX বা name@example.com"
                autoComplete="username"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              পাসওয়ার্ড {isRegister && <span className="font-normal text-slate-400">(কমপক্ষে ৮ অক্ষর)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={isRegister ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>
              {submitting
                ? 'অপেক্ষা করুন...'
                : isRegister
                ? 'একাউন্ট খুলুন'
                : 'লগইন করুন'}
            </span>
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-5">
          {isRegister ? 'আগে থেকেই একাউন্ট আছে?' : 'নতুন কাস্টমার?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(isRegister ? 'login' : 'register')}
            className="font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            {isRegister ? 'লগইন করুন' : 'রেজিস্ট্রেশন করুন'}
          </button>
        </p>
      </div>
    </div>
  );
};