import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Database,
  Truck,
  RotateCcw,
  Banknote,
  AlertCircle,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import type { AuthUser } from '../../context/AuthContext';

// ফাইলের জায়গা: src/components/auth/AuthPage.tsx

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  onSuccess: (user: AuthUser) => void;
}

// ---------- ছোট ইনপুট কম্পোনেন্ট ----------
type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  right?: React.ReactNode;
};

const Field: React.FC<FieldProps> = ({ icon: Icon, label, right, ...props }) => (
  <label className="block">
    <span className="text-[13px] font-bold text-slate-800 mb-1.5 block">{label}</span>
    <span className="relative block group">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
      <input
        {...props}
        className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10 transition-all"
      />
      {right}
    </span>
  </label>
);

const STRENGTH_LABELS = ['', 'দুর্বল', 'মোটামুটি', 'ভালো', 'শক্তিশালী'];
const STRENGTH_COLORS = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500'];

export const AuthPage: React.FC<AuthPageProps> = ({ mode, setMode, onSuccess }) => {
  const isRegister = mode === 'register';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [db, setDb] = useState<'checking' | 'online' | 'offline'>('checking');

  // Neon ডাটাবেজের আসল অবস্থা দেখানো
  useEffect(() => {
    fetch('/api/db/status')
      .then((r) => r.json())
      .then((d) => setDb(d?.connected ? 'online' : 'offline'))
      .catch(() => setDb('offline'));
  }, []);

  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
    if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

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
        body: JSON.stringify(isRegister ? { name, email, phone, password } : { identifier, password }),
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/70 to-violet-50 flex items-center justify-center p-4 sm:p-6">
      {/* ---------- ভাসমান ব্যাকগ্রাউন্ড ব্লব ---------- */}
      <motion.div
        className="absolute -top-24 -left-24 w-[26rem] h-[26rem] rounded-full bg-violet-300/40 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-sky-300/40 blur-3xl"
        animate={{ x: [0, -70, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-32 left-1/4 w-[26rem] h-[26rem] rounded-full bg-pink-300/30 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 w-full max-w-[460px] py-6">
        {/* ---------- মূল কার্ড ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 130 }}
          className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-white shadow-[0_20px_60px_-15px_rgba(91,15,255,0.25)] p-6 sm:p-8"
        >
          {/* লোগো */}
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>

          {/* Neon স্ট্যাটাস চিপ */}
          <div className="flex justify-center mb-5">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[12px] font-bold ${
                db === 'online'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : db === 'offline'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span className="relative flex w-2 h-2">
                <motion.span
                  className={`absolute inline-flex h-full w-full rounded-full ${
                    db === 'online' ? 'bg-emerald-400' : db === 'offline' ? 'bg-amber-400' : 'bg-slate-400'
                  }`}
                  animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span
                  className={`relative inline-flex rounded-full w-2 h-2 ${
                    db === 'online' ? 'bg-emerald-500' : db === 'offline' ? 'bg-amber-500' : 'bg-slate-400'
                  }`}
                />
              </span>
              <Database className="w-3.5 h-3.5" />
              <span>
                {db === 'online'
                  ? 'Neon PostgreSQL ডাটাবেজ যুক্ত'
                  : db === 'offline'
                  ? 'ডাটাবেজ সংযুক্ত নয়'
                  : 'ডাটাবেজ যাচাই হচ্ছে...'}
              </span>
            </motion.div>
          </div>

          {/* ট্যাব (লগইন / রেজিস্ট্রেশন) */}
          <div className="relative grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl mb-5">
            {(['login', 'register'] as AuthMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`relative z-10 py-2.5 text-sm font-bold rounded-xl transition-colors cursor-pointer ${
                  mode === m ? 'text-violet-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="authTabPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {m === 'login' ? <Lock className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  {m === 'login' ? 'লগইন (Sign In)' : 'নতুন একাউন্ট'}
                </span>
              </button>
            ))}
          </div>

          {/* ইনফো ব্যানার */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode + '-banner'}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/70 mb-5"
            >
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-500/30">
                <ShieldCheck className="w-4.5 h-4.5" />
              </span>
              <span className="leading-tight">
                <span className="block text-[13px] font-extrabold text-slate-900">
                  {isRegister ? 'মাত্র কয়েক সেকেন্ডে একাউন্ট খুলুন' : 'আপনার একাউন্টে লগইন করে শপিং করুন'}
                </span>
                <span className="block text-[11px] text-slate-600 mt-0.5">
                  {isRegister
                    ? 'সঠিক তথ্য দিন, অর্ডার ট্র্যাক করা সহজ হবে।'
                    : 'ইমেইল অথবা মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।'}
                </span>
              </span>
            </motion.div>
          </AnimatePresence>

          {/* ফর্ম */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: isRegister ? 24 : -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRegister ? -24 : 24 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                {isRegister ? (
                  <>
                    <Field
                      icon={User}
                      label="পুরো নাম *"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="আপনার নাম লিখুন"
                      autoComplete="name"
                    />
                    <Field
                      icon={Phone}
                      label="মোবাইল নম্বর *"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      autoComplete="tel"
                    />
                    <Field
                      icon={Mail}
                      label="ইমেইল ঠিকানা (Email) *"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </>
                ) : (
                  <Field
                    icon={Mail}
                    label="ইমেইল অথবা মোবাইল নম্বর *"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="01XXXXXXXXX বা name@example.com"
                    autoComplete="username"
                  />
                )}

                <div>
                  <Field
                    icon={Lock}
                    label="পাসওয়ার্ড (Password) *"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={isRegister ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRegister ? 'কমপক্ষে ৮ অক্ষর' : 'আপনার পাসওয়ার্ড দিন'}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  {/* পাসওয়ার্ড শক্তি মিটার (শুধু রেজিস্ট্রেশনে) */}
                  {isRegister && password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <motion.span
                            key={i}
                            className={`h-1.5 rounded-full ${i <= strength ? STRENGTH_COLORS[strength] : 'bg-slate-200'}`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            style={{ originX: 0 }}
                            transition={{ delay: i * 0.04 }}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        পাসওয়ার্ড: <strong className="text-slate-700">{STRENGTH_LABELS[strength] || 'খুব দুর্বল'}</strong>
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ত্রুটি বার্তা */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key={error}
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* সাবমিট বাটন */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.015 }}
              whileTap={{ scale: submitting ? 1 : 0.97 }}
              className="relative w-full overflow-hidden py-3.5 rounded-xl bg-gradient-to-r from-[#6a00ff] to-[#4f00d6] disabled:opacity-70 text-white text-sm font-extrabold shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <motion.span
                className="absolute top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                initial={{ x: '-150%' }}
                animate={{ x: ['-150%', '500%'] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
              />
              <span className="relative flex items-center gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    অপেক্ষা করুন...
                  </>
                ) : (
                  <>
                    {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    {isRegister ? 'একাউন্ট খুলে শপে প্রবেশ করুন' : 'লগইন করে শপে প্রবেশ করুন'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* মোড বদলের লিংক */}
          <p className="text-xs text-slate-500 text-center mt-5">
            {isRegister ? 'আগে থেকেই একাউন্ট আছে?' : 'একাউন্ট নেই?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(isRegister ? 'login' : 'register')}
              className="font-extrabold text-violet-700 hover:text-violet-900 cursor-pointer"
            >
              {isRegister ? 'লগইন করুন →' : 'নতুন একাউন্ট খুলুন →'}
            </button>
          </p>
        </motion.div>

        {/* ---------- নিচের ট্রাস্ট চিপ ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-2"
        >
          {[
            { icon: Truck, text: '১,০০০৳+ অর্ডারে ফ্রি শিপিং' },
            { icon: RotateCcw, text: '৭ দিনে সহজ রিটার্ন' },
            { icon: Banknote, text: 'ক্যাশ অন ডেলিভারি' },
          ].map((c, i) => (
            <motion.span
              key={c.text}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur border border-white text-[11px] font-bold text-slate-600 shadow-sm"
            >
              <c.icon className="w-3.5 h-3.5 text-violet-600" />
              {c.text}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};