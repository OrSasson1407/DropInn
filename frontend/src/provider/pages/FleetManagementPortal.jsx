import React, { useState } from 'react';
import { 
  Users, Truck, Package, Wrench, ShieldAlert, Award, TrendingUp, 
  MapPin, CheckCircle2, Clock, Plus, BarChart3, AlertCircle, Sparkles 
} from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';

export default function FleetManagementPortal() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('staff');

  const [staffMembers, setStaffMembers] = useState([
    { id: 'st1', name: 'Marco V.', role: 'Senior Barber', status: 'On Route', bookingsToday: 6, certification: 'Verified Active (Exp 2027)' },
    { id: 'st2', name: 'Elena R.', role: 'Master Hair Stylist', status: 'Available', bookingsToday: 4, certification: 'Verified Active (Exp 2026)' },
    { id: 'st3', name: 'David K.', role: 'Beard Specialist', status: 'In Service', bookingsToday: 7, certification: 'Audit Audit Warning (Exp 14 Days)' }
  ]);

  const [inventory, setInventory] = useState([
    { id: 'inv1', name: 'Premium Organic Shampoo (1000ml)', stock: 12, minAlert: 5, unitCost: 45 },
    { id: 'inv2', name: 'Sterilized Disposable Blades (Pack 100)', stock: 3, minAlert: 10, unitCost: 20, lowStock: true },
    { id: 'inv3', name: 'Argan Beard Styling Oil (250ml)', stock: 18, minAlert: 8, unitCost: 30 }
  ]);

  const [equipment, setEquipment] = useState([
    { id: 'eq1', tool: 'Titanium Cordless Clipper #1', operatingHours: 142, maxBeforeSharpen: 150, needsService: true },
    { id: 'eq2', tool: 'UV Sterilizer Box #2', operatingHours: 85, maxBeforeSharpen: 300, needsService: false },
    { id: 'eq3', tool: 'Ergonomic Styling Scissors #3', operatingHours: 190, maxBeforeSharpen: 200, needsService: true }
  ]);

  const handleReorderInventory = (item) => {
    toast.success(`Wholesale purchase order generated for "${item.name}" via Partner Wholesale Portal (#18).`, 'Order Dispatched');
  };

  const handleLogSterilization = (eq) => {
    toast.success(`Logged 30-min UV Sterilization & Tool Maintenance cycle for ${eq.tool} (#16).`, 'Maintenance Recorded');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Fleet Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Enterprise Salon Fleet Management Portal (#11, #12, #13)</span>
            </span>
            <h1 className="text-2xl font-black text-white mt-0.5">Mobile Salon Dispatch & Operations Hub</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              Commission Tier: 12% (Volume Escalated #20)
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'staff'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Multi-Staff Dispatch & Audit (#11, #19)
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Inventory & Wholesale Supply (#12, #18)
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'equipment'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Equipment Sterilization & Maintenance (#16)
          </button>
        </div>
      </div>

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Active Mobile Staff Roster & License Verification</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {staffMembers.map((s) => (
              <div key={s.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-sm">{s.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.status === 'On Route' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-semibold">{s.role}</p>

                <div className="pt-2 border-t border-slate-900 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Bookings Today:</span>
                    <span className="font-bold text-white">{s.bookingsToday}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>License Audit:</span>
                    <span className="font-bold text-emerald-400 text-[10px]">{s.certification}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span>Consumables Inventory & B2B Wholesale Supply (#12, #18)</span>
          </h2>

          <div className="space-y-3">
            {inventory.map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-xs">{item.name}</h3>
                    {item.lowStock && (
                      <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                        LOW STOCK ALERT (#12)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Current Stock: <strong className="text-slate-200">{item.stock} units</strong> (Min Alert: {item.minAlert})
                  </p>
                </div>

                <button
                  onClick={() => handleReorderInventory(item)}
                  className="py-1.5 px-3 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs hover:bg-amber-400 transition-all shadow-md shrink-0"
                >
                  Order Wholesale ({item.unitCost} ILS/unit)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Tool Sharpening & UV Sterilization Log (#16)</span>
          </h2>

          <div className="space-y-3">
            {equipment.map((eq) => (
              <div key={eq.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-xs">{eq.tool}</h3>
                  <p className="text-[11px] text-slate-400">
                    Operating Usage: <strong className="text-amber-400">{eq.operatingHours} hrs</strong> / Max Sharpen Threshold: {eq.maxBeforeSharpen} hrs
                  </p>
                </div>

                <button
                  onClick={() => handleLogSterilization(eq)}
                  className="py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-amber-400 text-xs font-bold transition-all shrink-0"
                >
                  Log UV Sterilization
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
