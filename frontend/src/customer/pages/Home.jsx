import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Scissors, Search, ShieldCheck, Zap, Sparkles, Filter, CheckCircle2, Eye } from 'lucide-react';
import BarberProfileModal from '../components/BarberProfileModal';

export default function Home() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedModalProvider, setSelectedModalProvider] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'providers'), where('isAvailable', '==', true));
    return onSnapshot(q, (snap) => {
      setProviders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  // Preset fallback list if database has zero providers created yet so user can preview UI
  const displayProviders = providers.filter(p => 
    (p.name || 'Barber').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Hero Header Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800/80 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>On-Demand Grooming Delivery</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Fresh Haircuts, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-orange-400 bg-clip-text text-transparent">
              Right to Your Door step.
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Connect with top-rated local barbers available now. Book in 30 seconds and get professional grooming anywhere in town.
          </p>

          {/* Search Bar */}
          <div className="pt-2">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search barbers, fades, beard trims..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 shadow-inner transition-all"
              />
            </div>
          </div>
        </div>

        {/* Floating Quick Stats */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-slate-300 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Avg. 15-25 min arrival</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Pro Barbers</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Contactless Instant Payment</span>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Scissors className="w-6 h-6 text-amber-400" />
              <span>Available Now — Men's Haircuts</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Top barbers online near your current location
            </p>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['all', 'Top Rated', 'Fastest', 'Fade Specialists'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat === 'all' ? 'All Barbers' : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-800 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-slate-800/80 rounded-xl" />
              </div>
            ))}
          </div>
        ) : displayProviders.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Scissors className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Barbers Online Right Now</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                No active providers were found in your area. If you are a barber, go online in the Provider Portal to start receiving haircut orders!
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/provider/login"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                Go Online as Barber
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProviders.map((p) => (
              <div
                key={p.id}
                className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar: Avatar + Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
                          {(p.name || 'B').charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online & Available" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                          {p.name || 'Master Barber'}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>Nearby (~15 min arrival)</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{p.rating || '4.9'}</span>
                    </div>
                  </div>

                  {/* Services & Price */}
                  <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Full Haircut & Styling</span>
                      <span className="text-amber-400 font-black text-sm">
                        {p.price || 100} ILS
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300">
                        Skin Fade
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300">
                        Beard Trim
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300">
                        Hot Towel
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-800/60 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedModalProvider(p)}
                    className="py-2.5 px-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Portfolio & Bio</span>
                  </button>

                  <Link to={'/customer/book/' + p.id} className="block">
                    <button className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5">
                      <span>Book Cut</span>
                      <Scissors className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Barber Profile & Portfolio Modal */}
      <BarberProfileModal
        provider={selectedModalProvider}
        isOpen={!!selectedModalProvider}
        onClose={() => setSelectedModalProvider(null)}
      />
    </div>
  );
}
