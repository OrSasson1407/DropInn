import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  Star, MapPin, Clock, Scissors, Search, ShieldCheck, Zap, Sparkles, 
  Filter, CheckCircle2, Eye, Navigation, Calendar, Heart, Award,
  Sparkle, Flame, UserCheck
} from 'lucide-react';
import BarberProfileModal from '../components/BarberProfileModal';

// Multi-category definition list according to PRD v2.0
export const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All Services', icon: Sparkles, count: '30+ Pros' },
  { id: 'haircut', label: 'Men\'s Haircuts & Beard', icon: Scissors, count: 'Active Now' },
  { id: 'nails', label: 'Manicure & Pedicure', icon: Sparkle, count: 'At Home' },
  { id: 'women_styling', label: 'Women\'s Hair & Blowout', icon: Flame, count: 'Top Stylists' },
  { id: 'makeup', label: 'Professional Makeup', icon: Heart, count: 'Events & Glam' },
  { id: 'massage', label: 'Massage & Bodywork', icon: Zap, count: 'Relaxation' },
  { id: 'skincare', label: 'Facial & Skincare', icon: ShieldCheck, count: 'Glowing Skin' }
];

// Rich Demo Providers covering all categories for v2.0 multi-category platform
const DEMO_PROVIDERS = [
  {
    id: 'demo_provider_1',
    name: 'Avi Cohen (Master Barber)',
    category: 'Men\'s Haircuts & Beard',
    rating: 4.9,
    price: 110,
    eta: '12-15 min',
    distance: '1.8 km',
    bio: 'Specializing in precision skin fades, hot towel razor lineup, and beard sculpting. Mobile studio setup with ring light and zero mess guarantee.',
    specialties: ['Skin Fade', 'Beard Trim', 'Hot Towel Razor', 'Kid Cuts'],
    isAvailable: true,
    badges: ['Instant Dispatch', 'Top Rated']
  },
  {
    id: 'demo_provider_2',
    name: 'Maya Lin (Nail Artist & Esthetician)',
    category: 'Manicure & Pedicure',
    rating: 5.0,
    price: 140,
    eta: '18-22 min',
    distance: '2.1 km',
    bio: 'Certified nail technician offering medical pedicures, gel manicures, and custom nail art at your home with sterilized portable equipment.',
    specialties: ['Gel Manicure', 'Pedicure', 'Nail Art', 'Cuticle Care'],
    isAvailable: true,
    badges: ['Top Rated', 'Sterilized Equipment']
  },
  {
    id: 'demo_provider_3',
    name: 'Sarah Stern (Hairstylist & Blowout)',
    category: 'Women\'s Hair & Blowout',
    rating: 4.9,
    price: 180,
    eta: '20-25 min',
    distance: '3.4 km',
    bio: 'Celebrity stylist providing luxury home blowouts, hair treatments, and event styling using Dyson Airwrap & Olaplex products.',
    specialties: ['Blowout', 'Balayage Styling', 'Hair Treatment', 'Updo'],
    isAvailable: true,
    badges: ['Luxury Stylist', 'Instant Booking']
  },
  {
    id: 'demo_provider_4',
    name: 'Noam K. (Licensed Massage Therapist)',
    category: 'Massage & Bodywork',
    rating: 4.95,
    price: 250,
    eta: '25-30 min',
    distance: '2.8 km',
    bio: 'Brings portable memory-foam massage table, soothing essential oils, and heated towels for deep tissue, Swedish, or sports recovery massages.',
    specialties: ['Deep Tissue', 'Swedish Massage', 'Aromatherapy', 'Sports Recovery'],
    isAvailable: true,
    badges: ['Portable Table', 'Licensed Pro']
  },
  {
    id: 'demo_provider_5',
    name: 'Shiraz Bar (Bridal & Event Glam)',
    category: 'Professional Makeup',
    rating: 4.88,
    price: 220,
    eta: '15-20 min',
    distance: '1.9 km',
    bio: 'Professional MUA using Charlotte Tilbury & MAC. Perfect for weddings, photo shoots, and special evening events.',
    specialties: ['Bridal Glam', 'Evening Makeup', 'Natural Glow', 'Lash Application'],
    isAvailable: true,
    badges: ['Glam Specialist']
  },
  {
    id: 'demo_provider_6',
    name: 'David Levi (Fade & Hair Design)',
    category: 'Men\'s Haircuts & Beard',
    rating: 4.9,
    price: 100,
    eta: '15-18 min',
    distance: '2.4 km',
    bio: '10 years experience in top barber shops. Delivering custom home haircut sessions with premium styling pomades and beard lineup.',
    specialties: ['Drop Fade', 'Taper Fade', 'Beard Sculpting', 'Hair Design'],
    isAvailable: true,
    badges: ['Fast Arrival']
  }
];

export default function Home() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all'); // 'all' | 'instant' | 'scheduled'
  const [selectedModalProvider, setSelectedModalProvider] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'providers'), where('isAvailable', '==', true));
    return onSnapshot(q, (snap) => {
      const liveList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProviders(liveList);
      setLoading(false);
    });
  }, []);

  const activeProvidersList = providers.length > 0 ? providers : DEMO_PROVIDERS;

  // Filter logic
  const displayProviders = activeProvidersList.filter(p => {
    const nameOrBio = `${p.name || ''} ${p.category || ''} ${p.bio || ''} ${(p.specialties || []).join(' ')}`.toLowerCase();
    const queryMatch = nameOrBio.includes(searchQuery.toLowerCase());
    
    const catMatch = selectedCategory === 'all' || (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === 'haircut' && (p.category?.includes('Haircut') || p.category?.includes('Barber'))) ||
      (selectedCategory === 'nails' && p.category?.includes('Manicure')) ||
      (selectedCategory === 'women_styling' && p.category?.includes('Women')) ||
      (selectedCategory === 'makeup' && p.category?.includes('Makeup')) ||
      (selectedCategory === 'massage' && p.category?.includes('Massage')) ||
      (selectedCategory === 'skincare' && p.category?.includes('Skincare'));

    return queryMatch && catMatch;
  });

  return (
    <div className="space-y-10">
      {/* Hero Header Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800/80 p-6 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>DropIn v2.0 — Multi-Category Grooming & Beauty</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Barbers, Nails, Makeup & Spa, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-orange-400 bg-clip-text text-transparent">
              Delivered To Your Home.
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
            Book top-rated personal care professionals instantly ("Available Now") or schedule for later. Fully equipped mobile specialists arrive at your apartment or hotel.
          </p>

          {/* Search Bar & Instant/Scheduled Filter */}
          <div className="pt-2 space-y-3">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search haircuts, manicures, blowouts, deep tissue, makeup..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 shadow-inner transition-all"
              />
            </div>

            {/* Quick Dispatch Mode Toggle */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Booking Mode:</span>
              <button
                onClick={() => setBookingTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  bookingTypeFilter === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                All Pros
              </button>
              <button
                onClick={() => setBookingTypeFilter('instant')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  bookingTypeFilter === 'instant'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Available Now (Instant Delivery)</span>
              </button>
              <button
                onClick={() => setBookingTypeFilter('scheduled')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  bookingTypeFilter === 'scheduled'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Schedule for Later</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Quick Stats */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>15-20 min delivery ETA</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Background Vetted</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Sterilized Gear & Mats</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Digital Contactless Pay</span>
          </div>
        </div>
      </div>

      {/* Category Selection Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-amber-400" />
            <span>Select Service Category</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {displayProviders.length} Providers Available
          </span>
        </div>

        {/* Categories Grid / Scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {SERVICE_CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-500/5 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 text-amber-400'
                }`}>
                  <IconComp className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white truncate">{cat.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">{cat.count}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Cards Listing */}
      <div className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse">
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
              <Sparkles className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Pros Found in this Category</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Try selecting "All Services" or clearing search query filters to view all available specialists.
              </p>
            </div>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="py-2.5 px-5 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProviders.map((p) => {
              const name = p.name || 'Pro Specialist';
              const price = p.price || 120;
              const rating = p.rating || 4.9;
              const eta = p.eta || '15-20 min';
              const distance = p.distance || '2.0 km';
              const categoryName = p.category || 'Grooming & Beauty';

              return (
                <div
                  key={p.id}
                  className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Bar: Avatar + Status + Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-400 to-rose-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" title="Online & Available Now" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors">
                            {name}
                          </h3>
                          <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider block">
                            {categoryName}
                          </span>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Navigation className="w-3 h-3 text-amber-400" />
                            <span className="text-emerald-400 font-semibold">{eta}</span>
                            <span>• {distance} away</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full font-extrabold shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rating}</span>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">
                      "{p.bio || 'Professional grooming & beauty specialist providing clean, punctual at-home services.'}"
                    </p>

                    {/* Services & Price */}
                    <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-bold">Base Service Fee</span>
                        <span className="text-amber-400 font-black text-sm">
                          {price} ILS
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(p.specialties || ['Mobile Studio', 'Sanitized Tools']).map((spec) => (
                          <span key={spec} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300">
                            {spec}
                          </span>
                        ))}
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
                        <span>Book Service</span>
                        <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expandable Profile & Portfolio Modal */}
      <BarberProfileModal
        provider={selectedModalProvider}
        isOpen={!!selectedModalProvider}
        onClose={() => setSelectedModalProvider(null)}
      />
    </div>
  );
}
