import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createOrder } from '../../shared/services/firestore';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import { getStripe, createPaymentIntentForOrder } from '../../shared/services/payments';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { calculateDistance } from '../../shared/services/maps';
import { db } from '../../firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import SafetyAssistSOS from '../../shared/components/SafetyAssistSOS';
import ServiceCoverageMap from '../../shared/components/ServiceCoverageMap';
import PageHeaderBar from '../../shared/components/PageHeaderBar';
import { useRealLocationData } from '../../shared/hooks/useRealLocationData';
import { 
  MapPin, CreditCard, ShieldCheck, Clock, Star, CheckCircle, ArrowRight, 
  Loader2, Navigation, Calendar, MessageSquare, Send, AlertCircle, Zap
} from 'lucide-react';
import { ADDONS_BY_CATEGORY } from '../../shared/services/categories';

export default function BookingFlow() {
  const { id: providerId } = useParams();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [providerError, setProviderError] = useState('');

  const { location: realLoc, prosOnDuty, loading: locLoading, refetchLocation } = useRealLocationData();

  // NO MORE MOCKS: Empty address, real current date
  const [bookingMode, setBookingMode] = useState('now');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [address, setAddress] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [notes, setNotes] = useState('');

  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [distInfo, setDistInfo] = useState({ distance: '-- km', time: '-- mins' });

  const [paymentStep, setPaymentStep] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const stripePromise = getStripe();

  const [messages, setMessages] = useState([
    { sender: 'system', text: 'Order dispatch initiated. You can chat with your provider directly here.', time: 'Just now' }
  ]);
  const [inputChat, setInputChat] = useState('');

  // Auto-fill address when GPS resolves
  useEffect(() => {
    if (realLoc.address && realLoc.address !== 'Locating...' && realLoc.address !== 'GPS Permission Denied') {
      setAddress(realLoc.address);
    }
  }, [realLoc.address]);

  // Fetch REAL Provider, NO Fallbacks
  useEffect(() => {
    async function loadProviderInfo() {
      try {
        if (!providerId) throw new Error("No Provider ID provided");
        const snap = await getDoc(doc(db, 'providers', providerId));
        if (snap.exists()) {
          setProvider({ id: snap.id, ...snap.data() });
        } else {
          setProviderError('Real Provider not found in the database.');
        }
      } catch (e) {
        setProviderError('Error loading provider data.');
      } finally {
        setLoadingProvider(false);
      }
    }
    loadProviderInfo();
  }, [providerId]);

  useEffect(() => {
    if (!orderId) return;
    return onSnapshot(doc(db, 'orders', orderId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status !== status && data.status === 'approved') {
          toast.info(`Provider accepted! En route to ${address.substring(0, 20)}...`, 'Pro En Route');
        } else if (data.status !== status && data.status === 'completed') {
          toast.success('Service completed!', 'Service Delivered');
        }
        setStatus(data.status);
      }
    });
  }, [orderId, status, address, toast]);

  useEffect(() => {
    if (address.trim().length > 3 && realLoc.lat) {
      calculateDistance(`${realLoc.lat},${realLoc.lng}`, address)
        .then(res => setDistInfo(res))
        .catch(e => console.error(e));
    }
  }, [address, realLoc]);

  const toggleAddon = (addon) => {
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!currentUser) return nav('/customer/login');
    if (!address.trim()) return toast.warning('Please enter a delivery address', 'Missing Address');

    setIsSubmitting(true);
    try {
      const ref = await createOrder(currentUser.uid, providerId, {
        address,
        price: totalPrice,
        bookingMode,
        scheduledSlot: bookingMode === 'scheduled' ? `${scheduledDate} at ${scheduledTime}` : 'Available Now',
        addons: selectedAddons,
        notes,
        serviceCategory: provider?.category || 'General',
        paymentStatus: 'UNPAID'
      });

      const { clientSecret: secret } = await createPaymentIntentForOrder(ref.id, totalPrice, providerId);
      setPendingOrderId(ref.id);
      setClientSecret(secret);
      setPaymentStep(true);
    } catch (err) {
      toast.error(err.message, 'Booking Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text: inputChat, time: 'Just now' }]);
    setInputChat('');
  };

  if (loadingProvider) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-2" />
        <span>Loading real provider data...</span>
      </div>
    );
  }

  if (providerError || !provider) {
    return (
      <div className="py-16 text-center text-rose-400 font-bold">
        {providerError}
      </div>
    );
  }

  const basePrice = provider?.price || 0;
  const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = basePrice + addonsPrice;
  const availableAddons = ADDONS_BY_CATEGORY[provider?.category?.toLowerCase()] || [];

  return (
    <div className="max-w-3xl mx-auto py-2 space-y-6">
      <PageHeaderBar
        title={`Book ${provider.name}`}
        subtitle={provider.category}
        breadcrumbs={[{ label: 'Explore Pros', path: '/' }, { label: 'Checkout' }]}
        stepCurrent={orderId ? 4 : 3} stepTotal={4}
        stepTitle={orderId ? 'Live Tracking' : 'Confirm & Pay'}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Book {provider.name}</h2>
            <p className="text-xs text-slate-400">{provider.category}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating</span>
            <span className="text-amber-400 font-extrabold text-sm flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{provider.rating || 'No ratings'}</span>
            </span>
          </div>
        </div>

        {paymentStep && clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentCardForm
              clientSecret={clientSecret}
              amount={totalPrice}
              orderId={pendingOrderId}
              onSuccess={(id) => { setOrderId(id); setPaymentStep(false); setClientSecret(null); }}
              onCancel={() => { setPaymentStep(false); setClientSecret(null); }}
            />
          </Elements>
        ) : (
        <form onSubmit={handleBook} className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase block">1. Service Delivery Location</label>
            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 font-semibold uppercase">Mobile Units Active:</span>
              <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                {locLoading ? 'Checking...' : `${prosOnDuty} Pros On Duty`}
              </span>
            </div>

            <button type="button" onClick={refetchLocation} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 text-sm font-bold rounded-2xl flex items-center justify-center gap-2">
              <Navigation className="w-4 h-4" />
              {locLoading ? 'Acquiring GPS...' : 'Use My Exact GPS Location'}
            </button>

            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-amber-400" />
              <input type="text" placeholder="Scanning for address..." value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white" />
            </div>
            
            {/* Passing real GPS down to the map */}
            <ServiceCoverageMap selectedAddress={address} defaultLat={realLoc.lat} defaultLng={realLoc.lng} />
          </div>

          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Base Service Fee</span><span className="font-semibold text-white">{basePrice} ILS</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-white">
              <span>Total Price</span><span className="text-amber-400 font-extrabold text-base">{totalPrice} ILS</span>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || !address} className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Pay {totalPrice} ILS & Confirm</span><ArrowRight className="w-5 h-5 stroke-[3]" /></>}
          </button>
        </form>
        )}
      </div>
      <SafetyAssistSOS activeOrderId={orderId} locationText={address} />
    </div>
  );
}

function PaymentCardForm({ clientSecret, amount, orderId, onSuccess, onCancel }) {
  const stripe = useStripe(); const elements = useElements();
  const [processing, setProcessing] = useState(false); const [cardError, setCardError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true); setCardError('');
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: elements.getElement(CardElement) }});
    if (error) { setCardError(error.message); setProcessing(false); return; }
    if (paymentIntent && paymentIntent.status === 'succeeded') onSuccess(orderId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement options={{ style: { base: { fontSize: '16px', color: '#0f172a' }, invalid: { color: '#ef4444' } } }} />
      {cardError && <p className="text-sm text-red-400">{cardError}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-3 border text-white rounded-xl">Cancel</button>
        <button type="submit" disabled={processing} className="flex-1 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl">{processing ? 'Processing...' : `Pay ${amount} ILS`}</button>
      </div>
    </form>
  );
}
