import React, { useState } from 'react';
import { motion } from 'motion/react';

// ফাইলের জায়গা: src/components/common/Logo.tsx
//
// ⚠️ গুরুত্বপূর্ণ: আপনার হেডারে লোগো যে ছবি দিয়ে দেখাচ্ছে, সেই ছবির পাথ নিচে বসান।
//   - ছবিটা public/ ফোল্ডারে থাকলে:  '/logo.png'  (ফাইলের আসল নাম লিখুন)
//   - ছবি না মিললে নিজে থেকেই নিচের SVG লোগো দেখাবে, পেজ ভাঙবে না।
export const LOGO_SRC = '/logo-backup.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
}

const HEIGHTS = { sm: 44, md: 64, lg: 96, xl: 128 };

export const Logo: React.FC<LogoProps> = ({ size = 'md', src = LOGO_SRC }) => {
  const [failed, setFailed] = useState(false);
  const h = HEIGHTS[size];

  return (
    <motion.div
      className="relative inline-flex items-center justify-center select-none"
      initial={{ opacity: 0, scale: 0.7, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 170, damping: 14 }}
    >
      {/* পেছনের নরম গ্লো */}
      <motion.span
        className="absolute inset-0 -m-3 rounded-full bg-gradient-to-r from-violet-400/40 via-pink-400/40 to-indigo-400/40 blur-2xl"
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.95, 1.1, 0.95] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ভাসমান লোগো */}
      <motion.div
        className="relative"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.06, rotate: -1.5 }}
      >
        {failed ? (
          <FallbackLogo height={h} />
        ) : (
          <img
            src={src}
            alt="বরকত রকমারী — China Card Online Shop BD"
            style={{ height: h }}
            className="w-auto max-w-full object-contain drop-shadow-lg"
            onError={() => setFailed(true)}
            draggable={false}
          />
        )}
      </motion.div>

      {/* ঝিকমিক স্পার্কল */}
      {[
        { cls: '-top-2 -right-2', delay: 0, size: 'w-4 h-4' },
        { cls: 'top-1/2 -left-4', delay: 0.9, size: 'w-3 h-3' },
        { cls: '-bottom-2 right-6', delay: 1.6, size: 'w-3.5 h-3.5' },
      ].map((sp, i) => (
        <motion.span
          key={i}
          className={`absolute ${sp.cls} ${sp.size} text-amber-400`}
          animate={{ scale: [0, 1.2, 0], rotate: [0, 120, 240], opacity: [0, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: sp.delay, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 0l2.6 8.4L23 11l-8.4 2.6L12 22l-2.6-8.4L1 11l8.4-2.6L12 0z" />
          </svg>
        </motion.span>
      ))}
    </motion.div>
  );
};

// ছবি লোড না হলে এই SVG লোগো দেখাবে
const FallbackLogo: React.FC<{ height: number }> = ({ height }) => (
  <div className="flex items-center gap-3" style={{ height }}>
    <svg viewBox="0 0 64 64" style={{ height: height * 0.8, width: height * 0.8 }} aria-hidden="true">
      <defs>
        <linearGradient id="szFbGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4c1d95" />
          <stop offset="0.5" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#szFbGrad)" />
      <path d="M19 27h26l-2.2 21.2a3.2 3.2 0 0 1-3.2 2.8H24.4a3.2 3.2 0 0 1-3.2-2.8L19 27z" fill="white" />
      <path d="M25.5 27v-3.2a6.5 6.5 0 0 1 13 0V27" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M26 38.5c2.2 3.2 9.8 3.2 12 0" fill="none" stroke="#7c3aed" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
    <div className="leading-tight">
      <span className="block font-black text-2xl bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-pink-500">
        বরকত রকমারী
      </span>
      <span className="block text-[10px] font-bold tracking-wide text-slate-500">
        China Card Online Shop BD
      </span>
    </div>
  </div>
);