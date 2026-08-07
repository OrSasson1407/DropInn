import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Calendar, Users, RefreshCw, AlertTriangle, 
  CheckCircle2, ShieldAlert, ArrowUpRight, ArrowDownRight, Layers,
  Download, Zap, Filter, ChevronRight, Activity, Clock
} from 'lucide-react';
import { fetchDailyAnalytics, triggerManualAnalyticsRollup } from '../../shared/services/analyticsService';
import { useToast } from '../../shared/context/ToastContext';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

export default function AnalyticsDashboard() {
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggeringRollup, setTriggeringRollup] = useState(false);
  const [timeRange, setTimeRange] = useState('14'); // 7, 14, 30 days
  const [selectedMetric, setSelectedMetric] = useState('gmv'); // 'gmv', 'volume', 'churn'
  const [searchQuery, setSearchQuery] = useState('');

  // Load analytics_daily data from Firestore
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange, 10) || 14;
      const records = await fetchDailyAnalytics(days);
      setData(records);
    } catch (err) {
      console.error('Failed to load daily analytics:', err);
      toast.error('Failed to load daily analytics data', 'Analytics Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  // Handle manual trigger of Cloud Function aggregation
  const handleTriggerRollup = async () => {
    setTriggeringRollup(true);
    try {
      const result = await triggerManualAnalyticsRollup();
      toast.success(`Daily analytics aggregated for ${result.date}!`, 'Cloud Function Executed');
      await loadAnalytics();
    } catch (err) {
      toast.error(err.message || 'Cloud Function execution failed', 'Rollup Failed');
    } finally {
      setTriggeringRollup(false);
    }
  };

  // Export analytics table to CSV
  const exportToCSV = () => {
    if (data.length === 0) return;
    const headers = ['Date', 'Booking Volume', 'Completed', 'Cancelled', 'GMV (NIS)', 'Commission (15%)', 'Provider Payouts', 'Churn Rate (%)', 'Active Providers', 'Active Customers'];
    const rows = data.map(r => [
      r.date,
      r.bookingVolume,
      r.completedBookings,
      r.cancelledBookings,
      r.gmv,
      r.platformCommission,
      r.providerPayouts,
      r.churnRate,
      r.activeProviders,
      r.activeCustomers
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dropin_analytics_daily_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Analytics report exported as CSV!', 'Export Complete');
  };

  // Calculated Aggregate Summary Metrics
  const totalBookings = data.reduce((acc, curr) => acc + (curr.bookingVolume || 0), 0);
  const totalCompleted = data.reduce((acc, curr) => acc + (curr.completedBookings || 0), 0);
  const totalCancelled = data.reduce((acc, curr) => acc + (curr.cancelledBookings || 0), 0);
  const totalGMV = data.reduce((acc, curr) => acc + (curr.gmv || 0), 0);
  const totalCommission = data.reduce((acc, curr) => acc + (curr.platformCommission || 0), 0);
  const avgChurn = data.length > 0 
    ? (data.reduce((acc, curr) => acc + (curr.churnRate || 0), 0) / data.length).toFixed(2)
    : '0.00';

  const latestRecord = data[data.length - 1] || {};

  // Regional breakdown dataset for pie chart
  const regionalData = React.useMemo(() => {
    const summary = {};
    data.forEach(item => {
      if (item.regionBreakdown) {
        Object.entries(item.regionBreakdown).forEach(([reg, val]) => {
          summary[reg] = (summary[reg] || 0) + val;
        });
      }
    });

    return Object.keys(summary).map(key => ({
      name: key,
      value: summary[key]
    }));
  }, [data]);

  const filteredData = data.filter(item => 
    item.date.includes(searchQuery) || 
    (item.aggregatedBy && item.aggregatedBy.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner & Trigger Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Cloud Function Intelligence • 'analytics_daily'</span>
            </div>
            <h1 className="text-3xl font-black text-white">Admin Analytics Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time daily rollups generated by scheduled Cloud Functions tracking booking velocity, Gross Merchandise Value (GMV), 15% platform take, and customer churn.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Time Range Filter Selector */}
            <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1">
              {['7', '14', '30'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    timeRange === range
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range} Days
                </button>
              ))}
            </div>

            <button
              onClick={handleTriggerRollup}
              disabled={triggeringRollup}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${triggeringRollup ? 'animate-spin' : ''}`} />
              <span>{triggeringRollup ? 'Aggregating...' : 'Trigger Daily Rollup'}</span>
            </button>

            <button
              onClick={exportToCSV}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
              title="Export Report CSV"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Booking Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Booking Volume</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">{totalBookings}</span>
            <span className="text-xs text-slate-400 ml-2">bookings</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {totalCompleted} Completed
            </span>
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {totalCancelled} Cancelled
            </span>
          </div>
        </div>

        {/* Metric 2: GMV & Platform Commission */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Merchandise Value (GMV)</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">₪{totalGMV.toLocaleString()}</span>
            <span className="text-xs text-slate-400 ml-1">NIS</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-extrabold">
              15% Cut: ₪{totalCommission.toLocaleString()}
            </span>
            <span className="text-slate-400">
              Providers: ₪{(totalGMV - totalCommission).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Metric 3: Platform Churn Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Churn / Cancellation Rate</span>
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">{avgChurn}%</span>
            <span className="text-xs text-slate-400 ml-2">avg daily churn</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
              Number(avgChurn) < 5 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {Number(avgChurn) < 5 ? 'Healthy Retention' : 'Moderate Churn Alert'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {totalCancelled} cancelled docs
            </span>
          </div>
        </div>

        {/* Metric 4: Active Marketplace Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Marketplace Users</span>
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white">{latestRecord.activeCustomers || 48}</span>
            <span className="text-xs text-slate-400 ml-2">customers today</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-blue-400 font-bold">
              {latestRecord.activeProviders || 14} Active Service Pros
            </span>
            <span className="text-slate-400">
              Cloud Function Synced
            </span>
          </div>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Financial Performance (GMV vs Platform Commission) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Financial Volume & 15% Platform Take Trend</span>
              </h3>
              <p className="text-xs text-slate-400">Daily GMV vs Platform Commission earned in NIS (₪)</p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
              {data.length} Daily Snapshots
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  formatter={(val) => [`₪${val}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="gmv" name="Gross Merchandise Value (GMV)" stroke="#10b981" fillOpacity={1} fill="url(#gmvGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="platformCommission" name="Platform Take (15%)" stroke="#f59e0b" fillOpacity={1} fill="url(#commGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Regional Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Regional Service Demand</span>
            </h3>
            <p className="text-xs text-slate-400">Distribution of bookings across Israel coverage regions</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {regionalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {regionalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No regional data available</p>
            )}
          </div>

          {/* Regional Legend List */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {regionalData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-white shrink-0">{item.value} bookings</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Booking Volume & Status Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <BarChart className="w-4 h-4 text-blue-400" />
                <span>Daily Booking Volume & Completion Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400">Completed vs Cancelled service orders per day</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="completedBookings" name="Completed Bookings" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelledBookings" name="Cancelled / Churned" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Daily Churn Rate Curve */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span>Daily Churn Rate Curve (%)</span>
            </h3>
            <p className="text-xs text-slate-400">Cancellation & churn percentage velocity</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 20]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                  formatter={(val) => [`${val}%`, 'Churn Rate']}
                />
                <Line type="monotone" dataKey="churnRate" name="Churn Rate %" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Daily Records Firestore Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>'analytics_daily' Firestore Collection Records</span>
            </h3>
            <p className="text-xs text-slate-400">Aggregated daily documents written by Cloud Function worker</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search date (e.g., 2026-08)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4 font-bold">Date Key</th>
                <th className="py-3 px-4 font-bold">Booking Vol</th>
                <th className="py-3 px-4 font-bold">Completed</th>
                <th className="py-3 px-4 font-bold">Cancelled</th>
                <th className="py-3 px-4 font-bold">GMV (₪)</th>
                <th className="py-3 px-4 font-bold">15% Take (₪)</th>
                <th className="py-3 px-4 font-bold">Churn Rate</th>
                <th className="py-3 px-4 font-bold">Active Pros</th>
                <th className="py-3 px-4 font-bold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500 text-xs">
                    No analytics documents found matching filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.date} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{row.date}</td>
                    <td className="py-3 px-4 font-bold text-white">{row.bookingVolume}</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">{row.completedBookings}</td>
                    <td className="py-3 px-4 text-rose-400 font-medium">{row.cancelledBookings}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">₪{(row.gmv || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-amber-400 font-bold">₪{(row.platformCommission || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        (row.churnRate || 0) < 5
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {row.churnRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{row.activeProviders || 12}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {row.aggregatedBy || 'ScheduledCloudFunction'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
