import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createOrder } from '../../shared/services/firestore';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import { processPayment } from '../../shared/services/payments';
import { calculateDistance } from '../../shared/services/maps';
import { db } from '../../firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import SafetyAssistSOS from '../../shared/components/SafetyAssistSOS';
import ServiceCoverageMap from '../../shared/components/ServiceCoverageMap';
import { 
  MapPin, CreditCard, ShieldCheck, Clock, Star, CheckCircle, ArrowRight, 
  Loader2, Sparkles, Navigation, Scissors, Calendar, MessageSquare, 
  Send, AlertCircle, Sparkle, Plus, ChevronRight, Users, Zap, Shield
} from 'lucide-react';
import { ADDONS_BY_CATEGORY } from '../../shared/services/categories';

export default function BookingFlow() {
  const { id: providerId } = useParams();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loadingProvider, setLoadingProvider] = useState(true);

  // Booking Form State
  const [bookingMode, setBookingMode] = useState('now'); // 'now' | 'scheduled'
  const [scheduledDate, setScheduledDate] = useState('2026-08-07');
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [address, setAddress] = useState('Rothschild Blvd 45, Tel Aviv');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [notes, setNotes] = useState('');

  // Live order tracking state
  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [distInfo, setDistInfo] = useState({ distance: '2.1 km', time: '16 mins' });

  // In-app Chat Simulation State
  const [messages, setMessages] = useState([
    { sender: 'system', text: 'Order dispatch initiated. You can chat with your provider directly here.', time: 'Just now' }
  ]);
  const [inputChat, setInputChat] = useState('');

  useEffect(() => {
    async function loadProviderInfo() {
      try {
        if (providerId) {
          const snap = await getDoc(doc(db, 'providers', providerId));
          if (snap.exists()) {
            setProvider({ id: snap.id, ...snap.data() });
          } else {
            // Demo provider fallback
            setProvider({
              id: providerId,
              name: 'Pro Specialist',
              price: 120,
              category: 'Grooming & Beauty',
              rating: 4.9
            });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProvider(false);
      }
    }
    loadProviderInfo();
  }, [providerId]);

  useEffect(() => {
    if (!orderId) return;
    return onSnapshot(
      doc(db, 'orders', orderId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status !== status && data.status === 'approved') {
            toast.info(`Provider has accepted your booking! En route to ${address.substring(0, 20)}...`, 'Pro En Route');
          } else if (data.status !== status && data.status === 'completed') {
            toast.success('Service completed! Thank you for booking with DropIn.', 'Service Delivered');
          }
          setStatus(data.status);
          if (data.status === 'approved' && messages.length === 1) {
            setMessages(prev => [
              ...prev,
              { sender: 'provider', text: 'Hi! I accepted your request. I am packing my mobile kit and will arrive in approx 15 minutes!', time: 'Just now' }
            ]);
          }
        }
      },
      (error) => {
        console.warn('Booking status snapshot warning:', error);
      }
    );
  }, [orderId, status, address, toast]);

  // Recalculate maps distance on address change
  useEffect(() => {
    if (address.trim().length > 3) {
      calculateDistance('Tel Aviv Center', address).then(res => {
        setDistInfo(res);
      });
    }
  }, [address]);

  const toggleAddon = (addon) => {
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const basePrice = provider?.price || 120;
  const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = basePrice + addonsPrice;

  const handleBook = async (e) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      toast.warning('Please sign in to place a service booking', 'Authentication Required');
      return nav('/customer/login');
    }
    if (!address.trim()) {
      toast.warning('Please enter a delivery address for the specialist', 'Missing Address');
      return;
    }

    setIsSubmitting(true);
    try {
      await processPayment(totalPrice, providerId);
      const ref = await createOrder(currentUser.uid, providerId, {
        address,
        price: totalPrice,
        bookingMode,
        scheduledSlot: bookingMode === 'scheduled' ? `${scheduledDate} at ${scheduledTime}` : 'Available Now',
        addons: selectedAddons,
        notes,
        serviceCategory: provider?.category || 'Grooming & Beauty'
      });
      setOrderId(ref.id);
      
      toast.success(
        `Your order with ${provider?.name || 'Pro Specialist'} for ${totalPrice} ILS was successfully placed!`,
        'Booking Confirmed'
      );
    } catch (err) {
      toast.error(err.message || 'Payment processing failed. Please try again.', 'Booking Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    const newMsg = { sender: 'user', text: inputChat, time: 'Just now' };
    setMessages(prev => [...prev, newMsg]);
    setInputChat('');

    // Simulate auto reply from provider
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: 'provider', text: 'Got it! Thanks for the details. On my way shortly.', time: 'Just now' }
      ]);
    }, 1500);
  };

  if (loadingProvider) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-2" />
        <span>Loading booking checkout...</span>
      </div>
    );
  }

  // Active Live Tracking & Chat View once order is placed
  if (orderId) {
    const isApproved = status === 'approved';
    const isCompleted = status === 'completed';

    return (
      <div className="max-w-3xl mx-auto space-y-8 py-4">
        {/* Order Status Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                ORDER ID #{orderId.substring(0, 8)}
              </span>
              <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                <span>{provider?.name || 'Provider'} Dispatch</span>
              </h2>
            </div>

            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isCompleted 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isApproved 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
            }`}>
              {!isCompleted && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{status || 'pending'}</span>
            </div>
          </div>

          {/* Stepper tracker */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center mx-auto">
                <CheckCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-slate-300">Request Sent</span>
            </div>
            <div className="space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold transition-all ${
                isApproved || isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {isApproved || isCompleted ? <CheckCircle className="w-5 h-5 stroke-[2.5]" /> : '2'}
              </div>
              <span className={isApproved || isCompleted ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                Pro Driving / En Route
              </span>
            </div>
            <div className="space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold transition-all ${
                isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {isCompleted ? <CheckCircle className="w-5 h-5 stroke-[2.5]" /> : '3'}
              </div>
              <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                Service Completed
              </span>
            </div>
          </div>

          {/* Map & ETA Box */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Destination: <strong className="text-white">{address}</strong></span>
              </span>
              <span className="bg-amber-500/10 text-amber-400 font-bold px-3 py-1 rounded-full border border-amber-500/20">
                ETA: {distInfo.time} ({distInfo.distance})
              </span>
            </div>
            
            {/* Live Interactive Dispatch Map */}
            <ServiceCoverageMap selectedAddress={address} isCompact={true} />
          </div>

          {/* In-App Direct Chat Widget */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">In-App Chat with {provider?.name || 'Provider'}</h4>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-semibold ml-auto'
                      : m.sender === 'system'
                      ? 'bg-slate-900 text-slate-400 border border-slate-800 text-[11px] mx-auto text-center'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 mr-auto'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">{m.time}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                placeholder="Send message to provider (e.g. Code for gate is #402)..."
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Add-ons list for provider category
  const availableAddons = ADDONS_BY_CATEGORY['haircut'];

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Checkout & Booking</span>
            </span>
            <h2 className="text-2xl font-black text-white">Book {provider?.name || 'Pro Specialist'}</h2>
            <p className="text-xs text-slate-400">{provider?.category || 'Grooming & Beauty Service'}</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating</span>
            <span className="text-amber-400 font-extrabold text-sm flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{provider?.rating || 4.9} / 5.0</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleBook} className="space-y-6">
          {/* Booking Type: Available Now vs Schedule for Later */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Select Dispatch Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingMode('now')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                  bookingMode === 'now'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Available Now</span>
                </span>
                <p className="text-xs font-bold text-white">Instant Express Dispatch</p>
                <p className="text-[10px] text-slate-400">Pro arrives in 15-25 minutes</p>
              </button>

              <button
                type="button"
                onClick={() => setBookingMode('scheduled')}
                className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                  bookingMode === 'scheduled'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Appointment</span>
                </span>
                <p className="text-xs font-bold text-white">Select Date & Time Slot</p>
                <p className="text-[10px] text-slate-400">Book for tomorrow or weekend</p>
              </button>
            </div>
          </div>

          {/* Date Picker if scheduled */}
          {bookingMode === 'scheduled' && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Choose Date & Time Slot</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                >
                  <option value="10:00">10:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                  <option value="20:00">08:00 PM</option>
                </select>
              </div>
            </div>
          )}

          {/* Service Add-ons Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Custom Add-On Treatments
            </label>
            <div className="space-y-2">
              {availableAddons.map((addon) => {
                const isChecked = selectedAddons.some(a => a.id === addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isChecked
                        ? 'bg-amber-500/10 border-amber-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isChecked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isChecked && <CheckCircle className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{addon.name}</span>
                    </div>
                    <span className="text-amber-400 font-extrabold">+ {addon.price} ILS</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address & Interactive Coverage Map */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              3. Service Delivery Location & Interactive Map Pin
            </label>

            {/* Interactive Map Selector */}
            <ServiceCoverageMap
              selectedAddress={address}
              onSelectLocation={(newAddr, details) => {
                setAddress(newAddr);
                if (details?.calculatedKm && details?.calculatedEta) {
                  setDistInfo({
                    distance: `${details.calculatedKm} km`,
                    time: `${details.calculatedEta} mins`,
                    numericMinutes: details.calculatedEta,
                    numericKm: details.calculatedKm,
                    formattedEta: `${details.calculatedEta} min (${details.calculatedKm} km away)`
                  });
                }
              }}
            />

            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-amber-400" />
              <input
                type="text"
                placeholder="e.g. Rothschild Blvd 45, Tel Aviv"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Pricing Summary Box */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Base Service Fee</span>
              <span className="font-semibold text-white">{basePrice} ILS</span>
            </div>
            {selectedAddons.map(a => (
              <div key={a.id} className="flex justify-between text-slate-400">
                <span>+ {a.name}</span>
                <span className="font-semibold text-white">{a.price} ILS</span>
              </div>
            ))}
            <div className="flex justify-between text-slate-400">
              <span>Mobile Travel & Equipment Fee</span>
              <span className="text-emerald-400 font-bold">FREE</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-white">
              <span>Total Price</span>
              <span className="text-amber-400 font-extrabold text-base">{totalPrice} ILS</span>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <span>Pay {totalPrice} ILS & Confirm Order</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* In-Service Safety SOS Assistance */}
      <SafetyAssistSOS activeOrderId={orderId} locationText={address} />
    </div>
  );
}
