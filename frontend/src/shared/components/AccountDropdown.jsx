import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/auth';
import { useToast } from '../context/ToastContext';
import { 
  User, LogOut, ShieldCheck, Briefcase, ShoppingBag, 
  MapPin, Gift, ChevronDown, Check, Sparkles, SwitchCamera
} from 'lucide-react';

export default function AccountDropdown({ activeRoleMode, setActiveRoleMode }) {
  const { currentUser, userProfile, userRole, isAdmin, isProvider } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Account';
  const initial = displayName.charAt(0).toUpperCase();
  const currentRoleTag = activeRoleMode || userRole || 'customer';

  const roleColorBadge = {
    admin: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    provider: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    customer: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
  }[currentRoleTag] || 'bg-slate-800 text-slate-300';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all cursor-pointer group"
      >
        {/* Avatar Circle */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
          {initial}
        </div>

        <span className="hidden sm:inline-block font-mono text-xs font-semibold text-slate-300 max-w-[100px] truncate">
          {displayName}
        </span>

        {/* Role Tag */}
        <span className={`hidden lg:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${roleColorBadge}`}>
          {currentRoleTag}
        </span>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2.5 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header Profile Info */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{displayName}</div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">{currentUser?.email}</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shrink-0 ${roleColorBadge}`}>
                {currentRoleTag}
              </span>
            </div>
          </div>

          {/* Role Switcher (Admin or Provider users) */}
          {(isAdmin || isProvider) && (
            <div className="px-2 py-2 border-b border-slate-800/80 mb-2 space-y-1.5">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <SwitchCamera className="w-3 h-3 text-amber-400" />
                Active View Mode
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => { setActiveRoleMode('customer'); setIsOpen(false); }}
                  className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                    currentRoleTag === 'customer'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Customer
                </button>
                <button
                  onClick={() => { setActiveRoleMode('provider'); setIsOpen(false); }}
                  className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                    currentRoleTag === 'provider'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Provider
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { setActiveRoleMode('admin'); setIsOpen(false); }}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                      currentRoleTag === 'admin'
                        ? 'bg-emerald-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Admin
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Nav Section Links */}
          <div className="space-y-0.5 text-xs font-medium">
            <Link
              to="/customer/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>My Orders & Bookings</span>
            </Link>

            <Link
              to="/customer/addresses"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Saved Addresses</span>
            </Link>

            <Link
              to="/customer/subscriptions"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Active Passes</span>
            </Link>

            <Link
              to="/customer/vouchers"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Gift Vouchers</span>
            </Link>

            {isProvider && (
              <Link
                to="/provider"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Provider Tools</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>

          {/* Footer Sign Out */}
          <div className="pt-2 mt-2 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950 hover:bg-rose-500/10 text-rose-400 border border-slate-800 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
