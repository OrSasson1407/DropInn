import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import { updateProviderProfile } from '../../shared/services/firestore';
import { 
  UserCheck, Scissors, DollarSign, Image as ImageIcon, Plus, Trash2, 
  Save, CheckCircle2, Loader2, Sparkles, AlertCircle, Eye, Sparkle, Heart, Flame
} from 'lucide-react';
import { CATEGORY_GROUPS, fetchServiceCategories } from '../../shared/services/categories';
import ProviderVerificationUpload from './ProviderVerificationUpload';
import MapContainer from '../../shared/components/MapContainer';

const SUGGESTED_SPECIALTIES_BY_CAT = {
  'Men\'s Haircuts & Beard': ['Skin Fade', 'Beard Sculpting', 'Hot Towel Razor', 'Scissors Cut', 'Foil Shave', 'Hair Tattoo Design'],
  'Manicure & Pedicure': ['Gel Manicure', 'Pedicure', 'Nail Art', 'Medical Pedicure', 'Paraffin Wax'],
  'Women\'s Hair & Blowout': ['Blowout', 'Balayage Styling', 'Dyson Airwrap', 'Updo', 'Hair Treatment'],
  'Professional Makeup': ['Bridal Glam', 'Evening Makeup', 'Soft Glam', 'Lash Application'],
  'Massage & Bodywork': ['Deep Tissue', 'Swedish Massage', 'Aromatherapy', 'Hot Basalt Stone'],
  'Facial & Skincare': ['Hydrating Facial', 'Microdermabrasion', 'Glow Peel', 'Anti-Aging Mask']
};

export default function BarberProfileEditor() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Men\'s Haircuts & Beard');
  const [serviceCategories, setServiceCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [price, setPrice] = useState(120);
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [portfolio, setPortfolio] = useState([]);

  // Real service base location & coverage radius - drives which customers
  // can find/book this provider and what ServiceCoverageMap shows for them.
  // Defaults to Tel Aviv center only until the provider pins their actual base.
  const [baseLocation, setBaseLocation] = useState({ lat: 32.0711, lng: 34.7871 });
  const [coverageRadiusKm, setCoverageRadiusKm] = useState(10);
  const [baseLocationName, setBaseLocationName] = useState('Tel Aviv Metropolitan Central Hub');
  const [hasSetBaseLocation, setHasSetBaseLocation] = useState(false);

  // Provider ID Document verification state
  const [idDocumentSubmitted, setIdDocumentSubmitted] = useState(false);
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // New photo input fields
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Service Photo');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    async function loadProfile() {
      try {
        const snap = await getDoc(doc(db, 'providers', currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || currentUser.displayName || 'Pro Specialist');
          setCategory(data.category || 'Men\'s Haircuts & Beard');
          setPrice(data.price || 120);
          setBio(data.bio || '');
          setSpecialties(data.specialties || ['Mobile Studio', 'Sanitized Gear']);
          setPortfolio(data.portfolio || []);
          setIdDocumentSubmitted(!!data.idDocumentSubmitted);
          setIdDocumentUrl(data.idDocumentUrl || '');
          if (data.baseLocation && typeof data.baseLocation.lat === 'number' && typeof data.baseLocation.lng === 'number') {
            setBaseLocation(data.baseLocation);
            setHasSetBaseLocation(true);
          }
          if (typeof data.coverageRadiusKm === 'number') {
            setCoverageRadiusKm(data.coverageRadiusKm);
          }
          if (data.baseLocationName) {
            setBaseLocationName(data.baseLocationName);
          }
        } else {
          setName(currentUser.displayName || 'Pro Specialist');
        }
      } catch (err) {
        console.error('Error loading provider profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [currentUser]);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const cats = await fetchServiceCategories();
        if (isMounted) setServiceCategories(cats);
      } catch (err) {
        console.error('Failed to load service categories:', err);
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    }
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateProviderProfile(currentUser.uid, {
        name,
        category,
        price: Number(price) || 120,
        bio,
        specialties,
        portfolio,
        idDocumentSubmitted,
        idDocumentUrl,
        verificationStatus: idDocumentSubmitted ? 'pending_review' : 'unverified',
        baseLocation,
        coverageRadiusKm,
        baseLocationName
      });
      setSavedSuccess(true);
      toast.success('Your profile & portfolio changes have been saved!', 'Profile Updated');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile', 'Update Error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSpecialty = (spec) => {
    if (specialties.includes(spec)) {
      setSpecialties(specialties.filter(s => s !== spec));
    } else {
      setSpecialties([...specialties, spec]);
    }
  };

  const addPhoto = () => {
    if (!newPhotoUrl.trim()) {
      alert('Please enter an image URL');
      return;
    }

    const newItem = {
      id: `p_${Date.now()}`,
      title: newPhotoTitle || 'Client Result',
      category: newPhotoCategory,
      url: newPhotoUrl
    };

    setPortfolio([...portfolio, newItem]);
    setNewPhotoTitle('');
    setNewPhotoUrl('');
  };

  const handleDocFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdDocumentUrl(reader.result);
      setIdDocumentSubmitted(true);
      setIsUploadingDoc(false);
      toast.success('Government ID / Barber license document attached successfully!', 'Doc Uploaded');
    };
    reader.onerror = () => {
      setIsUploadingDoc(false);
      toast.error('Failed to read selected image document', 'Upload Error');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (id) => {
    setPortfolio(portfolio.filter(p => p.id !== id));
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
        <span>Loading profile settings...</span>
      </div>
    );
  }

  const activeSuggestedSpecs = SUGGESTED_SPECIALTIES_BY_CAT[category] || SUGGESTED_SPECIALTIES_BY_CAT['Men\'s Haircuts & Beard'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Profile & Portfolio Management</span>
          </div>
          <h2 className="text-xl font-bold text-white">Edit Marketplace Profile & Service Menu</h2>
          <p className="text-xs text-slate-400">Set your service category, pricing, bio, specialties & showcase past client work</p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Profile Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Provider Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              placeholder="e.g. Maya Lin"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Primary Service Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={categoriesLoading}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
            >
              {categoriesLoading && <option value={category}>Loading categories...</option>}
              {CATEGORY_GROUPS.filter(g => g.id !== 'all').map(group => {
                const groupCats = serviceCategories.filter(cat => cat.group === group.id);
                if (groupCats.length === 0) return null;
                return (
                  <optgroup key={group.id} label={`--- ${group.label} ---`}>
                    {groupCats.map(cat => (
                      <option key={cat.id} value={cat.label}>
                        {cat.label}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Base Service Fee (ILS)
            </label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={50}
                max={1000}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-4 pr-12 py-3 text-xs text-white font-bold placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-4 top-3 text-xs font-extrabold text-amber-400">ILS</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Provider Craft Bio & Experience
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
            placeholder="Describe your training, mobile equipment (ring lights, memory foam tables, Dyson tools), and service philosophy..."
          />
        </div>

        {/* Specialties Badges */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Specialty Skills & Treatments ({category})
          </label>
          <div className="flex flex-wrap gap-2">
            {activeSuggestedSpecs.map((spec) => {
              const isSelected = specialties.includes(spec);
              return (
                <button
                  type="button"
                  key={spec}
                  onClick={() => toggleSpecialty(spec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{spec}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Government ID & License Verification Upload Component */}
        <ProviderVerificationUpload />

        {/* Real Service Base Location & Coverage Radius */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Service Base Location & Coverage Radius</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pin where you dispatch from and set how far you'll travel. Customers browsing near your coverage area will see you as available.
            </p>
            {!hasSetBaseLocation && (
              <p className="text-xs text-amber-400 mt-1">
                You haven't pinned a real base location yet - defaulting to Tel Aviv center. Pin the map below and save to update it.
              </p>
            )}
          </div>
          <MapContainer
            center={baseLocation}
            defaultRadiusKm={coverageRadiusKm}
            title="Your Service Base Location"
            onPinCoverage={({ center, radiusKm, name }) => {
              setBaseLocation(center);
              setCoverageRadiusKm(radiusKm);
              setBaseLocationName(name);
              setHasSetBaseLocation(true);
            }}
          />
        </div>

        {/* Portfolio Gallery Manager */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Client Results Portfolio ({portfolio.length})</span>
              </h3>
              <p className="text-xs text-slate-400">Add photos of your best work to build client trust</p>
            </div>
          </div>

          {/* Add New Photo Form */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Add Photo to Gallery</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Title (e.g. Gel Nail Art)"
                value={newPhotoTitle}
                onChange={(e) => setNewPhotoTitle(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
              />
              <input
                type="text"
                placeholder="Category (e.g. Nails / Blowout)"
                value={newPhotoCategory}
                onChange={(e) => setNewPhotoCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
              />
              <input
                type="url"
                placeholder="Image URL (Unsplash or direct image link)"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>
            <button
              type="button"
              onClick={addPhoto}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Photo to Gallery</span>
            </button>
          </div>

          {/* Existing Photos Grid */}
          {portfolio.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {portfolio.map((item) => (
                <div key={item.id} className="relative group rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square">
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                    <button
                      type="button"
                      onClick={() => removePhoto(item.id)}
                      className="self-end p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 transition-colors"
                      title="Remove photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <span className="text-[9px] font-bold text-amber-400 uppercase block">{item.category}</span>
                      <p className="text-[11px] font-bold text-white truncate">{item.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Save & Publish Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
