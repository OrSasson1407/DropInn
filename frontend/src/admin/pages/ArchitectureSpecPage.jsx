import React, { useState } from 'react';
import { ShieldCheck, Code, Database, Cpu, CheckCircle2, Copy, FileText, Server, Layers, Terminal } from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';

export default function ArchitectureSpecPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('architecture');

  const handleCopySchema = () => {
    navigator.clipboard.writeText(`
// Prisma Schema Excerpt for DropIn v2.0
model Booking {
  id                String         @id @default(uuid())
  customerId        String
  providerId        String
  status            BookingStatus  @default(PENDING)
  scheduledStartTime DateTime
  scheduledEndTime   DateTime
  isGroupBooking    Boolean        @default(false)
  groupPartyCount   Int            @default(1)
  baseFee           Float
  travelFee         Float
  peakSurgeFee      Float          @default(0)
  totalAmount       Float
}
    `);
    toast.success('Prisma Schema copied to clipboard!', 'Schema Copied');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase">
          <Server className="w-3.5 h-3.5" />
          <span>Technical Architecture & Jira Specification</span>
        </div>
        <h1 className="text-3xl font-black text-white">DropIn Platform Version 2.0 Docs</h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Full technical implementation plan, PostGIS PostgreSQL Prisma schema, route optimization algorithm, Docker deployment setup, and 20 actionable Jira tickets.
        </p>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'architecture'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            System Architecture & Docker
          </button>
          <button
            onClick={() => setActiveTab('algorithm')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'algorithm'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Route Backtracking Algorithm
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'schema'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            PostgreSQL & Prisma Schema
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tickets'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            20 Jira Epics & User Stories
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>High-Level System Architecture</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="font-extrabold text-amber-400 text-sm">Frontend SPA (React 18 / Vite)</h3>
              <p className="text-slate-300 leading-relaxed">
                Responsive single-page web app styled with Tailwind CSS v4. Features live Google Maps Platform integration, geolocation, custom HTML5 polygon canvas drawing, and Socket.io client listener for real-time dispatch and SOS alerts.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="font-extrabold text-emerald-400 text-sm">Backend Services (Node.js & TypeScript)</h3>
              <p className="text-slate-300 leading-relaxed">
                Express REST API running on Docker (`node:20-alpine`) on Cloud Run. Handles OAuth 2.0 for Google Workspace Calendar Sync, Socket.io WebSocket server, and BullMQ worker queue for multi-threaded route calculations.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="font-extrabold text-blue-400 text-sm">Database Layer (PostgreSQL + PostGIS)</h3>
              <p className="text-slate-300 leading-relaxed">
                Relational PostgreSQL 15 database running with the `postgis` spatial extension for custom polygon service boundaries (`ST_Contains`). ORM management with Prisma v5.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="font-extrabold text-rose-400 text-sm">Real-Time WebSockets & SOS Engine</h3>
              <p className="text-slate-300 leading-relaxed">
                Socket.io pub/sub channel broadcasting live provider GPS position updates every 5 seconds to customer tracking screens, alongside immediate high-priority SOS emergency signal broadcasting.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'algorithm' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <span>Smart Route Optimization Backtracking Algorithm</span>
          </h2>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-amber-300 overflow-x-auto space-y-2">
            <p className="text-slate-500">// TypeScript Backtracking Algorithm for Minimum Travel Time Sequence</p>
            <pre className="text-[11px] leading-relaxed text-slate-200">{`export function solveSmartRouteBacktracking(
  startLocation: { lat: number; lng: number },
  stops: AppointmentStop[],
  calculateTravelTimeMins: (fLat: number, fLng: number, tLat: number, tLng: number) => number
): AppointmentStop[] {
  let bestRoute: AppointmentStop[] = [];
  let minTotalTime = Infinity;

  function permute(currentRoute, remainingStops, curLat, curLng, accumulatedTime) {
    if (remainingStops.length === 0) {
      if (accumulatedTime < minTotalTime) {
        minTotalTime = accumulatedTime;
        bestRoute = [...currentRoute];
      }
      return;
    }

    for (let i = 0; i < remainingStops.length; i++) {
      const nextStop = remainingStops[i];
      const travelTime = calculateTravelTimeMins(curLat, curLng, nextStop.lat, nextStop.lng);
      const totalCost = accumulatedTime + travelTime + nextStop.serviceDurationMins;

      // Branch pruning for performance
      if (totalCost >= minTotalTime) continue;

      const newRemaining = remainingStops.filter((_, idx) => idx !== i);
      permute([...currentRoute, nextStop], newRemaining, nextStop.lat, nextStop.lng, totalCost);
    }
  }

  permute([], stops, startLocation.lat, startLocation.lng, 0);
  return bestRoute;
}`}</pre>
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              <span>Prisma Schema Models (PostgreSQL / PostGIS)</span>
            </h2>
            <button
              onClick={handleCopySchema}
              className="py-1.5 px-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Prisma Schema</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto">
            <pre>{`model User {
  id              String      @id @default(uuid())
  email           String      @unique
  fullName        String
  phone           String
  role            Role        @default(CUSTOMER)
  idVerified      Boolean     @default(false)
  referralCode    String      @unique @default(uuid())
  rewardPoints    Int         @default(0)
  addresses       Address[]
  subscriptions   Subscription[]
  bookings        Booking[]
}

model ProviderProfile {
  id                String      @id @default(uuid())
  userId            String      @unique
  category          String
  baseServiceFee    Float
  rating            Float       @default(5.0)
  coverageZoneGeoJson Unsupported("geometry(Polygon, 4326)")?
  crmNotes          ClientCRMNote[]
  services          ServiceBundle[]
}`}</pre>
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <span>20 Jira Epics & Actionable Tickets Summary</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              { id: 'JIRA-101', title: 'Group & Family Bookings', cat: 'Customer Experience' },
              { id: 'JIRA-102', title: 'Recurring Subscriptions', cat: 'Customer Experience' },
              { id: 'JIRA-103', title: 'Style Inspiration Feed', cat: 'Customer Experience' },
              { id: 'JIRA-104', title: 'Saved Multi-Address Management', cat: 'Customer Experience' },
              { id: 'JIRA-105', title: 'E-Gifting & Digital Vouchers', cat: 'Customer Experience' },
              { id: 'JIRA-106', title: 'Interactive Polygon Coverage Drawing', cat: 'Provider Tools' },
              { id: 'JIRA-107', title: 'Smart Route Optimization', cat: 'Provider Tools' },
              { id: 'JIRA-108', title: 'Client CRM & Private Notes', cat: 'Provider Tools' },
              { id: 'JIRA-109', title: 'External Calendar Sync (Google/Outlook)', cat: 'Provider Tools' },
              { id: 'JIRA-110', title: 'Custom Service Bundles & Add-ons', cat: 'Provider Tools' },
              { id: 'JIRA-111', title: 'Instant Payouts & Financial Dashboard', cat: 'Provider Tools' },
              { id: 'JIRA-112', title: 'Two-Sided ID Verification', cat: 'Trust & Safety' },
              { id: 'JIRA-113', title: 'In-Service Safety SOS Button', cat: 'Trust & Safety' },
              { id: 'JIRA-114', title: 'Dynamic Travel Fee Breakdown', cat: 'Trust & Safety' },
              { id: 'JIRA-115', title: 'Provider Skill & Hygiene Badges', cat: 'Trust & Safety' },
              { id: 'JIRA-116', title: 'Cancellation Fee Protection Policy', cat: 'Trust & Safety' },
              { id: 'JIRA-117', title: 'Off-Peak Dynamic Pricing Engine', cat: 'Platform Growth' },
              { id: 'JIRA-118', title: 'Referral & Loyalty VIP Club', cat: 'Platform Growth' },
              { id: 'JIRA-119', title: 'Verified Photo Reviews', cat: 'Platform Growth' },
              { id: 'JIRA-120', title: 'Mandatory Provider Equipment Checklist', cat: 'Platform Growth' }
            ].map((ticket) => (
              <div key={ticket.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">{ticket.id}</span>
                  <p className="font-extrabold text-white text-xs">{ticket.title}</p>
                </div>
                <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  {ticket.cat}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
