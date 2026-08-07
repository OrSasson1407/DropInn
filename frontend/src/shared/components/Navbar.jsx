import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/auth';
import ThemeToggle from './ThemeToggle';
import DropInLogo from './DropInLogo';
import NotificationBell from './NotificationBell';
import LocationSelector from './LocationSelector';
import GlobalSearch from './GlobalSearch';
import AccountDropdown from './AccountDropdown';
import { getNavItemsForUser } from '../config/navConfig';
import { Menu, X, ChevronRight, LogOut, Compass, Languages } from 'lucide-react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { currentUser, userRole, isAdmin, isProvider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeRoleMode, setActiveRoleMode] = useState(() => {
    return localStorage.getItem('dropin_active_role_mode') || '';
  });

  // Handle active role mode persistence
  const handleSetRoleMode = (mode) => {
    setActiveRoleMode(mode);
    localStorage.setItem('dropin_active_role_mode', mode);
  };

  // Scroll detection for condensed header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Single Source of Truth for nav items
  const navItems = getNavItemsForUser({
    userRole,
    activeRoleMode,
    isAdmin,
    currentUser
  });

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Accessibility: Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-slate-950 focus:font-black focus:rounded-xl focus:shadow-2xl focus:outline-none"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className={`sticky top-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/90 text-white shadow-xl ${
          isScrolled ? 'py-1 shadow-2xl bg-slate-900/98' : 'py-2.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14">
            
            {/* Left Section: Logo & Desktop Navigation */}
            <div className="flex items-center gap-4 lg:gap-6">
              <Link to="/" className="flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl">
                <DropInLogo size={isScrolled ? 'sm' : 'md'} />
              </Link>

              {/* Location Selector (Desktop) */}
              <div className="hidden lg:block">
                <LocationSelector />
              </div>

              {/* Desktop Nav Items (Role-filtered) */}
              <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const active = isActivePath(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                        active
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <IconComp className={`w-3.5 h-3.5 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Section: Search, Bell, Theme, Language/RTL, Account/Auth */}
            <div className="hidden md:flex items-center gap-2.5">
              <GlobalSearch />
              <NotificationBell />
              
              {/* Hebrew/RTL Language Toggle */}
              <button
                onClick={() => {
                  const nextLang = i18n.language === 'he' ? 'en' : 'he';
                  i18n.changeLanguage(nextLang);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 flex items-center gap-1.5 transition-all"
                title={i18n.language === 'he' ? 'Switch to English' : 'עבור לעברית'}
              >
                <Languages className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-extrabold text-[11px]">{i18n.language === 'he' ? 'עברית (RTL)' : 'EN'}</span>
              </button>

              <ThemeToggle showLabel={false} />

              {currentUser ? (
                <AccountDropdown
                  activeRoleMode={activeRoleMode}
                  setActiveRoleMode={handleSetRoleMode}
                />
              ) : (
                <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                  <Link
                    to="/customer/login"
                    className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/customer/signup"
                    className="px-3.5 py-1.5 text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-md shadow-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all flex items-center gap-1"
                  >
                    <span>Book Service</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Right Controls */}
            <div className="flex items-center gap-2 md:hidden">
              <GlobalSearch />
              <LocationSelector />
              <button
                onClick={() => {
                  const nextLang = i18n.language === 'he' ? 'en' : 'he';
                  i18n.changeLanguage(nextLang);
                }}
                className="p-2 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center transition-all"
                title={i18n.language === 'he' ? 'Switch to English' : 'עבור לעברית'}
              >
                <Languages className="w-4 h-4" />
              </button>
              <ThemeToggle showLabel={false} />
              
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            {/* Nav Links (Generated from config) */}
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-slate-500 px-3 py-1 tracking-wider">
                {activeRoleMode ? `${activeRoleMode.toUpperCase()} MENU` : 'NAVIGATION'}
              </div>
              {navItems.map((item) => {
                const IconComp = item.icon;
                const active = isActivePath(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      active
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Account / Auth Mobile Block */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">
                        {currentUser.displayName || currentUser.email}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {currentUser.email}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {activeRoleMode || userRole || 'customer'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-rose-400 hover:bg-rose-500/10 text-xs font-bold border border-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/customer/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/customer/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20"
                  >
                    Book Service
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
