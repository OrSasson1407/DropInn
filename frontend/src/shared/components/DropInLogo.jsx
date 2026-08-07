import React from 'react';

/**
 * DropIn Minimalist Brand Logo Component
 * Fits 'Warm Luxury' aesthetic: Dark slate background, warm amber gold gradients, 
 * sharp barber shears integrated with a mobile location pin mark.
 */
export default function DropInLogo({ size = 'md', showLabel = true, className = '' }) {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', badge: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-xl', badge: 'text-[10px]' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', badge: 'text-xs' },
    xl: { icon: 'w-20 h-20', text: 'text-4xl', badge: 'text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Mark Container */}
      <div className={`relative ${currentSize.icon} rounded-2xl bg-slate-950 border border-amber-500/40 p-0.5 shadow-xl shadow-amber-500/10 group-hover:border-amber-400 group-hover:shadow-amber-500/20 transition-all shrink-0 overflow-hidden`}>
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/30 via-amber-400/10 to-transparent opacity-80" />
        
        {/* SVG Brand Mark */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>

          {/* Outer Pin Halo */}
          <path
            d="M 50 12 C 32.5 12 18 26.5 18 44 C 18 66 50 88 50 88 C 50 88 82 66 82 44 C 82 26.5 67.5 12 50 12 Z"
            fill="url(#goldGrad)"
            opacity="0.15"
          />
          <path
            d="M 50 14 C 34 14 21 27 21 43 C 21 63 50 84 50 84 C 50 84 79 63 79 43 C 79 27 66 14 50 14 Z"
            stroke="url(#goldGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Barber Shears Blade 1 (Left crossing) */}
          <path
            d="M 36 62 L 64 28 M 64 28 C 66 26 69 27 68 30 L 52 50"
            stroke="url(#silverGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Barber Shears Blade 2 (Right crossing) */}
          <path
            d="M 64 62 L 36 28 M 36 28 C 34 26 31 27 32 30 L 48 50"
            stroke="url(#goldGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Scissors Ring Handles */}
          <circle cx="34" cy="65" r="5" stroke="url(#goldGrad)" strokeWidth="3" fill="#0f172a" />
          <circle cx="66" cy="65" r="5" stroke="url(#silverGrad)" strokeWidth="3" fill="#0f172a" />

          {/* Center Fulcrum Pin Dot */}
          <circle cx="50" cy="45" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Brand Text Header */}
      {showLabel && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className={`font-heading font-black ${currentSize.text} tracking-tight bg-gradient-to-r from-amber-500 via-amber-400 to-amber-200 bg-clip-text text-transparent`}>
              DropInn
            </span>
            <span className={`font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 ${currentSize.badge}`}>
              STUDIO
            </span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold tracking-wider uppercase -mt-0.5">
            At-Home Barber & Grooming
          </span>
        </div>
      )}
    </div>
  );
}
