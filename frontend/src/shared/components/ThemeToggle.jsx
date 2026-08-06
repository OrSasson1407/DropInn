import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
        isDark
          ? 'bg-slate-950/80 hover:bg-slate-800 text-amber-400 border-slate-800 hover:border-amber-500/40'
          : 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-300 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
          {showLabel && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
          {showLabel && <span>Dark Mode</span>}
        </>
      )}
    </button>
  );
}
