import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Star, MapPin, Clock, Scissors, ShieldCheck, ChevronLeft, Check, Sparkles, Award, 
  Image as ImageIcon, UserCheck, MessageSquare, Eye, X, CheckCircle2
} from 'lucide-react';
import BarberProfileModal from '../components/BarberProfileModal';
import { useToast } from '../../shared/context/ToastContext';

const HAIRCUT_INCLUDED_ITEMS = [
  'Precision Cut & Skin Fade',
  'Beard Lineup & Shaping',
  'Hot Towel Treatment',
  'Styling with Premium Products',
  'Sanitized Professional Gear',
  'Cleanup & Zero Mess Guaranteed'
];

const GENERIC_INCLUDED_ITEMS = [
  'Certified Mobile Specialist',
  'Professional Sanitized Equipment',
  'Full Service at Your Location',
  'Cleanup & Zero Mess Guaranteed'
];

export default function ProviderDetails() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    async function fetchProvider() {
      try {
        const snap = await getDoc(doc(db, 'providers', id));
        if (snap.exists() && isMounted) {
          setProvider({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProvider();
    return () => { isMounted = false; };
  }, [id]);

  const name = provider?.name || `Barber #${id.substring(0, 6)}`;
  const price = provider?.price || 100;
  const bio = provider?.bio || `${name} is a mobile barber servicing clients across the metropolitan area with professional equipment.`;
  const specialties = provider?.specialties || ['Skin Fades', 'Beard Sculpting', 'Hot Towel Razor', 'Kid Cuts', 'Hair Tattoo Lines'];

  // Never show stock photos as if they were this provider's real work -
  // an empty portfolio must read as empty, not as a fabricated track record.
  const portfolio = Array.isArray(provider?.portfolio) ? provider.portfolio : [];

  const category = provider?.category || '';
  const isHaircutCategory = /haircut|barber|fade/i.test(category);
  const includedItems = Array.isArray(provider?.included) && provider.included.length > 0
    ? provider.included
    : (isHaircutCategory ? HAIRCUT_INCLUDED_ITEMS : GENERIC_INCLUDED_ITEMS);

  // Never fabricate ratings or testimonials for a real provider - an empty
  // track record must read as "new", not as a fake 4.9 with invented reviews.
  const reviews = Array.isArray(provider?.reviews) ? provider.reviews : [];
  const hasRating = typeof provider?.rating === 'number' && reviews.length > 0;
  const rating = hasRating ? provider.rating : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button & Quick Expand Modal trigger */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Barbers</span>
        </Link>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl"
        >
          <Eye className="w-4 h-4" />
          <span>Expand Profile Modal</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-32 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="px-6 sm:px-8 pb-8 relative -mt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex items-end gap-5">
            <div className="w-24 h-24 rounded-3xl bg-slate-950 border-4 border-slate-900 flex items-center justify-center text-amber-400 font-black text-3xl shadow-xl">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{name}</h1>
                <span className="p-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" title="Verified Professional">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>On-Demand Mobile Barber Service</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2 text-amber-400 transition-all cursor-pointer"
            >
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              {hasRating ? (
                <>
                  <span className="font-extrabold text-lg">{rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400 font-normal underline">({reviews.length} review{reviews.length === 1 ? '' : 's'})</span>
                </>
              ) : (
                <span className="font-extrabold text-sm text-slate-300">New - no reviews yet</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Details, Portfolio & Booking Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">

          {/* Barber Bio Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <span>About {name}</span>
              </h3>
              {typeof provider?.yearsExperience === 'number' && provider.yearsExperience > 0 && (
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  {provider.yearsExperience}+ Years Exp
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              {bio}
            </p>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Specialty Techniques</span>
              <div className="flex flex-wrap gap-2">
                {specialties.map((spec) => (
                  <span key={spec} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5" />
                    <span>{spec}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Past Work Portfolio Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Past Work Portfolio</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-amber-400 hover:underline font-bold"
              >
                View All Photos
              </button>
            </div>

            {portfolio.length === 0 ? (
              <div className="p-6 text-center bg-slate-950 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-sm text-slate-300 font-medium">No portfolio photos yet</p>
                <p className="text-xs text-slate-500 mt-1">{name} hasn't uploaded past work photos.</p>
              </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {portfolio.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedPhoto(img)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-500/60 transition-all shadow-md"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                  <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white truncate">
                    {img.title}
                  </span>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Main Service Package */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-amber-400" />
                  <span>{category || 'Service'} Package</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Complete service session delivered at your home/office</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400">{price} ILS</span>
                <p className="text-[10px] text-slate-500 font-mono">ALL-INCLUSIVE</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">What's Included:</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
                {includedItems.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Verified Customer Reviews</h3>
              </div>
              {hasRating && (
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{rating.toFixed(1)} Score</span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="p-6 text-center bg-slate-950 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-sm text-slate-300 font-medium">No reviews yet</p>
                <p className="text-xs text-slate-500 mt-1">Be the first to book {name} and leave a review.</p>
              </div>
            ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{rev.author}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                        Verified
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{rev.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
            )}
          </div>

        </div>

        {/* Booking Sidebar / Sticky Action */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl sticky top-24">
            <div className="space-y-2">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Barber Available Now</span>
              </span>
              <h3 className="text-xl font-bold text-white">Ready to Drop In</h3>
              <p className="text-xs text-slate-400">
                Average arrival time: <strong className="text-slate-200">15-20 minutes</strong> after order confirmation.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Haircut Service:</span>
                <span className="font-bold text-white">{price} ILS</span>
              </div>
              <div className="flex justify-between">
                <span>Travel / Delivery:</span>
                <span className="text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-white">
                <span>Total Amount:</span>
                <span className="text-amber-400">{price} ILS</span>
              </div>
            </div>

            <Link to={'/customer/book/' + id} className="block">
              <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                <span>Proceed to Booking</span>
                <Scissors className="w-5 h-5 stroke-[2.5]" />
              </button>
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Full Portfolio & Bio Modal</span>
            </button>

            <p className="text-[10px] text-center text-slate-500">
              No charge until order is approved by barber
            </p>
          </div>
        </div>
      </div>

      {/* Barber Profile Expandable Modal */}
      <BarberProfileModal
        provider={provider || { id, name, price, rating }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Expanded Lightbox Image View */}
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
