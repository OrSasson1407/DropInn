import React, { useState } from 'react';
import { login } from '../../shared/services/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Scissors, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      nav('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('customer@dropin.com');
    setPassword('password123');
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Scissors className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-white">Customer Sign In</h2>
          <p className="text-xs text-slate-400">Book instant haircuts & track your orders</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5 flex items-start gap-2 text-rose-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            type="submit"
            disabled={loading}
          >
            <LogIn className="w-4 h-4 stroke-[2.5]" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-3 text-center text-xs">
          <button
            type="button"
            onClick={fillDemo}
            className="text-amber-400 hover:underline font-semibold flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autofill Demo Credentials</span>
          </button>

          <Link to="/customer/signup" className="text-slate-400 hover:text-white transition-colors">
            Need a customer account? <strong className="text-amber-400">Sign Up</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}
