import React from 'react';
import { motion } from 'motion/react';

interface ShopZoneLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ShopZoneLogo: React.FC<ShopZoneLogoProps> = ({
  variant = 'light',
  className = '',
  size = 'md',
}) => {
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic 3D Geometric Shopping Emblem */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative shrink-0 flex items-center justify-center"
      >
        <div
          className={`relative rounded-xl overflow-hidden flex items-center justify-center shadow-md shadow-blue-500/20 ${
            size === 'sm'
              ? 'w-8 h-8'
              : size === 'lg'
              ? 'w-12 h-12'
              : 'w-10 h-10'
          } bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white drop-shadow ${
              size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
            }`}
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {/* Subtle light shimmer bar */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
        </div>
      </motion.div>

      {/* Brand Name & Tagline */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-black tracking-tight leading-none ${
            size === 'sm'
              ? 'text-lg'
              : size === 'lg'
              ? 'text-2xl md:text-3xl'
              : 'text-xl md:text-2xl'
          } ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          Shop<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Zone</span>
        </span>
        <span
          className={`text-[9px] md:text-[10px] tracking-wider mt-1 font-semibold uppercase ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Modern Living · Better Life
        </span>
      </div>
    </div>
  );
};
