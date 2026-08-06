import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, Star, MapPin, Clock, Scissors, ShieldCheck, Award, 
  ThumbsUp, CheckCircle2, MessageSquare, Image as ImageIcon,
  Sparkles, Zap, ChevronRight, UserCheck
} from 'lucide-react';

// High quality haircut portfolio sample photos for realistic past work rendering
const DEFAULT_PORTFOLIO = [
  {
    id: '1',
    title: 'Mid Skin Fade & Textured Crop',
    category: 'Skin Fade',
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'Precision Beard Sculpting & Razor Line',
    category: 'Beard Trim',
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Low Drop Fade with Hot Towel Finish',
    category: 'Drop Fade',
    url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: 'Classic Taper & Pompadour Styling',
    category: 'Classic Cut',
    url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    title: 'Burst Fade & Sharp Edge Up',
    category: 'Edge Up',
    url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '6',
    title: 'Slick Back Taper & Foil Shave',
    category: 'Foil Shave',
    url: 'https://images.unsplash.com/photo-1517832606589-715069686677?auto=format&fit=crop&w=800&q=80'
  }
];

const DEFAULT_REVIEWS = [
  {
    id: 'r1',
    author: 'Daniel M.',
    rating: 5,
    date: '2 days ago',
    comment: 'Best skin fade I have ever gotten! Arrived at my apartment in 18 minutes, brought professional lighting and mat. Extremely clean & polite.'
  },
  {
    id: 'r2',
    author: 'Eitan K.',
    rating: 5,
    date: '1 week ago',
    comment: 'Saved me before an urgent meeting. Razor line on the beard was 10/10 sharp. Will definitely rebook.'
  },
  {
    id: 'r3',
    author: 'Jonathan S.',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Punctual, super friendly barber. Great attention to detail and zero mess left behind.'
  }
];

export default function BarberProfileModal({ provider, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'bio' | 'reviews'
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!isOpen || !provider) return null;

  const name = provider.name || `Barber #${provider.id.substring(0, 6)}`;
  const price = provider.price || 100;
  const rating = provider.rating || 4.9;
  const bio = provider.bio || `${name} is a master barber with 8+ years of craft experience specializing in precision skin fades, hot towel razor shaves, and tailored beard sculpting. Servicing clients across the metropolitan area with mobile studio equipment.`;
  const specialties = provider.specialties || ['Skin Fades', 'Beard Sculpting', 'Hot Towel Razor', 'Kid Cuts', 'Hair Tattoo Lines'];
  const portfolio = provider.portfolio || DEFAULT_PORTFOLIO;
  const reviews = provider.reviews || DEFAULT_REVIEWS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 p-6 sm:p-8 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105 z-20"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-amber-300/40 text-amber-400 font-black text-2xl flex items-center justify-center shadow-2xl shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">{name}</h2>
                  <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" title="Verified Barber">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs text-amber-100/80 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Verified Master Barber • Mobile Delivery Specialist</span>
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="flex items-center gap-1 bg-slate-950/60 px-2.5 py-0.5 rounded-full text-amber-300 font-bold border border-amber-300/20">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{rating}</span>
                  </span>
                  <span className="text-slate-200 text-[11px] font-medium">
                    (48 verified bookings)
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30 text-right shrink-0">
              <span className="text-xs text-slate-400 block font-medium">Standard Cut</span>
              <span className="text-2xl font-black text-amber-400">{price} ILS</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950 px-6 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'portfolio'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Past Work Gallery ({portfolio.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bio')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'bio'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Barber Bio & Skills</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">

          {/* TAB 1: Portfolio Gallery */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Real Haircut Showcase</span>
                  </h3>
                  <p className="text-xs text-slate-400">Click any photograph to zoom in and check fade precision</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPhoto(item)}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-500/50 transition-all shadow-md"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/80 text-slate-950 text-[9px] font-black uppercase tracking-wider inline-block">
                        {item.category}
                      </span>
                      <p className="text-[11px] font-bold text-white truncate drop-shadow">
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Barber Bio & Skills */}
          {activeTab === 'bio' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">About the Barber</h3>
                <p className="text-sm leading-relaxed text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {bio}
                </p>
              </div>

              {/* Specialties Badges */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Signature Services & Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((s) => (
                    <div
                      key={s}
                      className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-400 flex items-center gap-2"
                    >
                      <Scissors className="w-3.5 h-3.5 text-amber-400" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment & Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sanitized Equipment</span>
                  </span>
                  <p className="text-slate-400">All clippers, razors & combs sanitized between each customer visit.</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>Clean Mobile Setup</span>
                  </span>
                  <p className="text-slate-400">Barber brings floor mats, vacuum ring & ring light. Zero hair left behind.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Verified Customer Ratings</h3>
                <div className="flex items-center gap-1 text-amber-400 font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{rating} out of 5.0</span>
                </div>
              </div>

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center">
                          {rev.author.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-white">{rev.author}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                          Verified Order
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Call To Action */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span>Ready to get a fresh cut from </span>
            <strong className="text-white">{name}</strong>?
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs transition-all w-full sm:w-auto"
            >
              Close
            </button>

            <Link to={'/customer/book/' + provider.id} className="w-full sm:w-auto block">
              <button
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Book This Barber ({price} ILS)</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Expanded Single Photo View Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-4">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950 text-slate-300 hover:text-white flex items-center justify-center z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="w-full max-h-[70vh] object-contain rounded-2xl bg-black"
            />
            <div className="flex items-center justify-between px-2">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{selectedPhoto.category}</span>
                <h4 className="text-base font-extrabold text-white">{selectedPhoto.title}</h4>
              </div>
              <span className="text-xs text-slate-400">Work by {name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
