import React, { useState } from 'react';
import { UserCheck, Search, Plus, Edit, Coffee, Scissors, FileText, CheckCircle2 } from 'lucide-react';
import { INITIAL_CRM_CLIENTS } from '../../shared/services/v2Data';
import { useToast } from '../../shared/context/ToastContext';

export default function ClientCRMNotes() {
  const { toast } = useToast();
  const [clients, setClients] = useState(INITIAL_CRM_CLIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [editNotes, setEditNotes] = useState(clients[0]?.notes || '');
  const [editBeverage, setEditBeverage] = useState(clients[0]?.beveragePreference || '');

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setEditNotes(client.notes || '');
    setEditBeverage(client.beveragePreference || '');
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    if (!selectedClient) return;

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === selectedClient.id) {
          return { ...c, notes: editNotes, beveragePreference: editBeverage };
        }
        return c;
      })
    );

    toast.success(`Private client profile & haircut guard notes saved for ${selectedClient.name}!`, 'CRM Updated');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400">
          <UserCheck className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-wider">Provider Tool #8</span>
        </div>
        <h1 className="text-2xl font-black text-white">Client CRM & Private Formula Notes</h1>
        <p className="text-xs text-slate-400">
          Store private haircut guard sizes, color formulas, beverage choices, and past visit logs for repeat personal care clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Client List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            {filteredClients.map((client) => {
              const isSelected = selectedClient?.id === client.id;

              return (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className={`w-full p-3 rounded-2xl text-left border transition-all space-y-1 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white">{client.name}</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">{client.totalVisits} visits</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{client.phone}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Client Details & Notes Form */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          {selectedClient ? (
            <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white">{selectedClient.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedClient.phone}</p>
                </div>

                <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Last Appointment</span>
                  <span className="text-amber-400 font-mono font-bold">{selectedClient.lastVisit}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <span>Private Haircut / Guard / Formula Notes</span>
                </label>
                <textarea
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Skin fade on sides (#0.5 guard), scissor length top..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  <span>Beverage / Hospitality Preference</span>
                </label>
                <input
                  type="text"
                  value={editBeverage}
                  onChange={(e) => setEditBeverage(e.target.value)}
                  placeholder="e.g. Sparkling water, Espresso with oat milk..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
                >
                  Save Client CRM Record
                </button>
              </div>
            </form>
          ) : (
            <p className="text-slate-500 text-xs text-center py-12">Select a client from the list to view CRM records.</p>
          )}
        </div>
      </div>
    </div>
  );
}
