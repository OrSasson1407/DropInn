import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles } from 'lucide-react';

export default function GlobalSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Sync initial query from URL param if available
    const urlQuery = searchParams.get('search');
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isMobileExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobileExpanded]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/');
    }
    setIsMobileExpanded(false);
  };

  const handleClear = () => {
    setQuery('');
    if (location.pathname === '/' && searchParams.get('search')) {
      navigate('/');
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Desktop Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 35+ services or pros..."
          className="w-48 lg:w-64 bg-slate-950 border border-slate-800 rounded-full pl-9 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all shadow-inner"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-0.5 text-slate-400 hover:text-white"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </form>

      {/* Mobile Search Icon Button */}
      <button
        type="button"
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        className="md:hidden p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors"
        aria-label="Open global search"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Mobile Search Modal / Overlay */}
      {isMobileExpanded && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-slate-900 border-b border-slate-800 p-4 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search haircuts, plumbers, dog groomers..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
