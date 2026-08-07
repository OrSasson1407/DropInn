import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import { submitOrderReview, cancelOrder } from '../../shared/services/firestore';
import { getGoogleMapsNavigationUrl } from '../../shared/services/maps';
import ServiceCoverageMap from '../../shared/components/ServiceCoverageMap';
import { 
  Clock, MapPin, Scissors, CheckCircle2, Loader2, Star, 
  Sparkles, ShieldCheck, Navigation, ExternalLink, Calendar,
  ChevronRight, AlertCircle, RefreshCw, XCircle, Map
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CustomerOrders() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [providersMap, setProvidersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMapOrderId, setShowMapOrderId] = useState(null);
  
  // Review form state per order
  const [ratingMap, setRatingMap] = useState({});
  const [commentMap, setCommentMap] = useState({});
  const [submittingReviewId, setSubmittingReviewId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'orders'), where('customerId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(
      q,
      async (snap) => {
        const orderList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        orderList.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setOrders(orderList);

        const pIds = [...new Set(orderList.map(o => o.providerId))];
        const pMap = {};
        for (const pId of pIds) {
          if (pId) {
            try {
              const pSnap = await getDoc(doc(db, 'providers', pId));
              if (pSnap.exists()) {
                pMap[pId] = pSnap.data();
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
        setProvidersMap(pMap);
        setLoading(false);
      },
      (error) => {
        console.warn('Customer orders snapshot warning:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    setCancellingOrderId(orderId);
    try {
      await cancelOrder(orderId, 'Cancelled by customer');
      toast.info('Booking request cancelled successfully.', 'Order Cancelled');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order', 'Cancellation Error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleReviewSubmit = async (orderId, providerId) => {
    const rating = ratingMap[orderId] || 5;
    const comment = commentMap[orderId] || 'Incredible service, punctual and super clean!';
    
    setSubmittingReviewId(orderId);
    try {
      await submitOrderReview(orderId, providerId, rating, comment, currentUser?.uid, currentUser?.displayName || 'Verified Customer');
      toast.success('Your rating and review have been published successfully!', 'Review Published');
    } catch (err) {
      toast.error(err.message || 'Failed to submit review', 'Review Error');
    } finally {
      setSubmittingReviewId(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Track Your Service Orders</h2>
        <p className="text-xs text-slate-400">Please sign in to view active grooming & beauty orders and track dispatch</p>
        <Link to="/customer/login" className="inline-block pt-2">
          <button className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all">
            Sign In to Customer Account
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Real-Time On-Demand Dispatch</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">My Orders & Dispatch Tracker</h1>
            <p className="text-xs text-slate-400">Live order status, arrival tracking, and service receipts</p>
          </div>

          <Link to="/">
            <button className="py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold text-xs transition-all flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Book Another Service</span>
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your live dispatch orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-950 text-slate-600 flex items-center justify-center mx-auto border border-slate-800">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Grooming Orders Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ready for a fresh haircut, gel manicure, blowout or massage delivered to your door? Browse verified pros now.
            </p>
          </div>
          <Link to="/" className="inline-block pt-2">
            <button className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2">
              <span>Explore Marketplace Pros</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const provider = providersMap[order.providerId] || {};
            const providerName = provider.name || `Provider #${(order.providerId || '123456').substring(0, 6)}`;
            const isPending = order.status === 'pending';
            const isApproved = order.status === 'approved';
            const isCompleted = order.status === 'completed';
            const isDeclined = order.status === 'declined';

            return (
              <div 
                key={order.id} 
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden transition-all hover:border-slate-700"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">ORDER #{order.id.substring(0, 8)}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isApproved
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                          : isPending
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {!isCompleted && !isDeclined && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>{order.status || 'pending'}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <span>Pro: {providerName}</span>
                    </h3>
                    <p className="text-xs text-amber-400 font-medium">
                      Category: {order.serviceCategory || provider.category || 'Grooming & Beauty'}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Amount Paid</span>
                    <span className="text-xl font-black text-amber-400">{order.price || 120} ILS</span>
                  </div>
                </div>

                {/* Progress Stepper Visualizer */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold py-2">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-slate-300">Request Sent</span>
                  </div>

                  <div className="space-y-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold transition-all ${
                      isApproved || isCompleted ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {isApproved || isCompleted ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : '2'}
                    </div>
                    <span className={isApproved || isCompleted ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                      Pro En Route
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold transition-all ${
                      isCompleted ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : '3'}
                    </div>
                    <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      Service Completed
                    </span>
                  </div>
                </div>

                {/* Details & Location Info Box */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs text-slate-300">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Delivery Location: <strong className="text-white">{order.address || 'Standard Address'}</strong></span>
                    </div>

                    <a 
                      href={getGoogleMapsNavigationUrl(order.address)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1 font-bold text-[11px]"
                    >
                      <span>Open in Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {order.scheduledSlot && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Booking Slot: <strong className="text-amber-400">{order.scheduledSlot}</strong></span>
                    </div>
                  )}

                  {isApproved && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-300 flex items-center justify-between gap-2.5 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <Navigation className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                        <span>Provider {providerName} has accepted your order and is en route. Expected arrival in <strong>15-20 minutes</strong>.</span>
                      </div>
                      <button
                        onClick={() => setShowMapOrderId(showMapOrderId === order.id ? null : order.id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 shrink-0"
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span>{showMapOrderId === order.id ? 'Hide Live Map' : 'View Live Tracking Map'}</span>
                      </button>
                    </div>
                  )}

                  {isPending && (
                    <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl text-blue-300 flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
                      <span>Order broadcasted to {providerName}. Waiting for provider confirmation...</span>
                    </div>
                  )}
                </div>

                {/* Live Dispatch Tracking Map Container */}
                {showMapOrderId === order.id && (
                  <div className="pt-2">
                    <ServiceCoverageMap selectedAddress={order.address} />
                  </div>
                )}

                {/* Cancellation Action Bar for active orders */}
                {(isPending || isApproved) && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      {cancellingOrderId === order.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Cancel Booking Request</span>
                    </button>
                  </div>
                )}

                {/* Review Submission Form if completed */}
                {isCompleted && !order.rating && (
                  <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4 text-center">
                    <div className="inline-flex p-2.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">Rate Your Experience</h4>
                      <p className="text-xs text-slate-400">Help other clients find top verified specialists</p>
                    </div>

                    {/* Star selector */}
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const currentRating = ratingMap[order.id] || 5;
                        return (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setRatingMap({ ...ratingMap, [order.id]: starVal })}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star className={`w-7 h-7 ${starVal <= currentRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Comment text */}
                    <textarea
                      placeholder="Write a brief review (e.g., Punctual, polite, spotless equipment and wonderful result!)..."
                      value={commentMap[order.id] || ''}
                      onChange={(e) => setCommentMap({ ...commentMap, [order.id]: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      rows={2}
                    />

                    <button
                      onClick={() => handleReviewSubmit(order.id, order.providerId)}
                      disabled={submittingReviewId === order.id}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      {submittingReviewId === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Publish Review</span>
                      )}
                    </button>
                  </div>
                )}

                {/* Show Submitted Review if exists */}
                {isCompleted && order.rating && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-amber-400">
                      <span className="font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>Your Rating: {order.rating} / 5.0</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Reviewed</span>
                    </div>
                    {order.reviewComment && (
                      <p className="text-slate-300 italic">"{order.reviewComment}"</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
