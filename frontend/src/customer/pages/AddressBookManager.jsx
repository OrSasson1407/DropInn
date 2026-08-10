import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Building, Home, Briefcase, Hotel, Navigation, Key, Shield } from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';

export default function AddressBookManager() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem('dropin_saved_addresses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return []; // Removed mock data
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'home',
    address: '',
    apt: '',
    intercomCode: '',
    parkingNotes: ''
  });

  useEffect(() => {
    localStorage.setItem('dropin_saved_addresses', JSON.stringify(addresses));
  }, [addresses]);

  const handleSetDefault = (id) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
    toast.success('Default delivery address updated for instant bookings!', 'Address Set');
  };

  const handleDelete = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.info('Address removed from your address book.', 'Address Deleted');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!formData.address.trim()) {
      toast.warning('Please provide a street address', 'Missing Address');
      return;
    }

    const newAddr = {
      id: `addr_${Date.now()}`,
      title: formData.title || 'Saved Location',
      type: formData.type,
      address: formData.address,
      apt: formData.apt,
      intercomCode: formData.intercomCode,
      parkingNotes: formData.parkingNotes,
      isDefault: addresses.length === 0
    };

    setAddresses((prev) => [...prev, newAddr]);
    setShowAddModal(false);
    setFormData({ title: '', type: 'home', address: '', apt: '', intercomCode: '', parkingNotes: '' });
    toast.success('New delivery location saved to your address book!', 'Address Saved');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'office': return Briefcase;
      case 'hotel': return Hotel;
      case 'home':
      default: return Home;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white">Saved Delivery Addresses</h1>
          </div>
          <p className="text-xs text-slate-400">
            Manage your home, office, or hotel locations with gate codes & parking instructions for instant specialist dispatch.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No addresses saved yet. Add your first location to speed up future bookings.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => {
            const IconComponent = getTypeIcon(addr.type);
            return (
              <div
                key={addr.id}
                className={`relative bg-slate-900/90 border rounded-3xl p-6 space-y-4 transition-all shadow-xl ${
                  addr.isDefault
                    ? 'border-amber-500/80 ring-1 ring-amber-500/40 bg-gradient-to-b from-amber-500/5 to-transparent'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                        <span>{addr.title}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase">
                            DEFAULT
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{addr.address}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 space-y-2 text-xs">
                  {addr.apt && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Unit / Apt:</span>
                      <span className="font-semibold text-white">{addr.apt}</span>
                    </div>
                  )}
                  {addr.intercomCode && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-400" />
                        Intercom Code:
                      </span>
                      <span className="font-mono font-bold text-amber-400">{addr.intercomCode}</span>
                    </div>
                  )}
                  {addr.parkingNotes && (
                    <div className="pt-1 border-t border-slate-900 text-slate-400 text-[11px] leading-relaxed">
                      <strong className="text-slate-300">Parking / Access:</strong> {addr.parkingNotes}
                    </div>
                  )}
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all"
                  >
                    Set as Default Address
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-black text-white">Add Delivery Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Label Name (e.g. Home, Beach House)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Home, Office, Hotel..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street & house number..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Apt / Floor / Door</label>
                  <input
                    type="text"
                    value={formData.apt}
                    onChange={(e) => setFormData({ ...formData, apt: e.target.value })}
                    placeholder="Apt 4B..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Intercom / Gate Code</label>
                  <input
                    type="text"
                    value={formData.intercomCode}
                    onChange={(e) => setFormData({ ...formData, intercomCode: e.target.value })}
                    placeholder="1234#"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Parking / Entrance Notes</label>
                <textarea
                  rows={2}
                  value={formData.parkingNotes}
                  onChange={(e) => setFormData({ ...formData, parkingNotes: e.target.value })}
                  placeholder="e.g. Guest parking in back alley, ring twice..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
