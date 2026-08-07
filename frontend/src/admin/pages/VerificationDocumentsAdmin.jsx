import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import { 
  approveVerificationDocument, 
  rejectVerificationDocument 
} from '../../shared/services/verification';
import { 
  ShieldCheck, ShieldAlert, FileText, CheckCircle2, XCircle, Clock, 
  Search, Eye, Filter, RefreshCw, AlertTriangle, Shield, Check, X, User, ExternalLink
} from 'lucide-react';

export default function VerificationDocumentsAdmin() {
  const authContext = useAuth() || {};
  const currentUser = authContext.currentUser;
  const toastContext = useToast() || {};
  const toast = toastContext.toast || { success: console.log, error: console.error };

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected document modal preview
  const [previewDoc, setPreviewDoc] = useState(null); // { title: 'ID Document', url: '...' }

  // Reject dialog modal state
  const [rejectingItem, setRejectingItem] = useState(null); // doc record
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Real-time listener for verification_documents collection
    const unsub = onSnapshot(
      collection(db, 'verification_documents'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort newest first
        list.sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0));
        setDocuments(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to verification documents:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleApprove = async (docItem) => {
    setActionLoading(true);
    try {
      await approveVerificationDocument(docItem.id, docItem.providerId, {
        email: currentUser?.email || 'admin@dropinn.com',
        name: currentUser?.displayName || 'Admin Console'
      });
      toast.success(
        `Approved verification documents for ${docItem.providerName || 'Provider'}! Provider account is now active.`,
        'Documents Approved'
      );
    } catch (err) {
      console.error('Approval error:', err);
      toast.error(err.message || 'Failed to approve verification documents', 'Approval Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingItem) return;

    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejecting the verification documents.', 'Reason Required');
      return;
    }

    setActionLoading(true);
    try {
      await rejectVerificationDocument(
        rejectingItem.id,
        rejectingItem.providerId,
        rejectionReason,
        {
          email: currentUser?.email || 'admin@dropinn.com',
          name: currentUser?.displayName || 'Admin Console'
        }
      );

      toast.success('Verification submission rejected and provider notified.', 'Submission Rejected');
      setRejectingItem(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Rejection error:', err);
      toast.error(err.message || 'Failed to reject verification submission', 'Rejection Error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter((docItem) => {
    const matchesStatus =
      filterStatus === 'all' ? true : docItem.status === filterStatus;

    const queryLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      docItem.providerName?.toLowerCase().includes(queryLower) ||
      docItem.providerId?.toLowerCase().includes(queryLower);

    return matchesStatus && matchesSearch;
  });

  const pendingCount = documents.filter((d) => d.status === 'pending').length;
  const approvedCount = documents.filter((d) => d.status === 'approved').length;
  const rejectedCount = documents.filter((d) => d.status === 'rejected').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Portal Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Compliance Audit Console</span>
          </div>
          <h2 className="text-xl font-bold text-white">Verification Documents Dashboard</h2>
          <p className="text-xs text-slate-400">
            Review submitted Government ID and Liability Insurance records for partner onboarding approval.
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Pending Approval</span>
          </span>
          <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{approvedCount} Approved</span>
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterStatus === 'all'
              ? 'bg-amber-500/10 border-amber-500 text-amber-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider">Total Records</p>
          <p className="text-xl font-black text-white mt-1">{documents.length}</p>
        </button>

        <button
          onClick={() => setFilterStatus('pending')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterStatus === 'pending'
              ? 'bg-amber-500/10 border-amber-500 text-amber-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending Review</p>
          <p className="text-xl font-black text-amber-400 mt-1">{pendingCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus('approved')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterStatus === 'approved'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Approved</p>
          <p className="text-xl font-black text-emerald-400 mt-1">{approvedCount}</p>
        </button>

        <button
          onClick={() => setFilterStatus('rejected')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filterStatus === 'rejected'
              ? 'bg-rose-500/10 border-rose-500 text-rose-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Rejected</p>
          <p className="text-xl font-black text-rose-400 mt-1">{rejectedCount}</p>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search provider name or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {['pending', 'approved', 'rejected', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Document Submissions List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Loading verification document submissions...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="py-12 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
          <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No verification documents found</p>
          <p className="text-xs text-slate-500">
            {filterStatus === 'pending'
              ? 'All submitted provider documents have been reviewed!'
              : 'No submissions match your filter settings.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all shadow-lg"
            >
              {/* Provider Info */}
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-white text-base">
                    {item.providerName || `Provider #${item.providerId?.substring(0, 8)}`}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400">
                  Provider ID: {item.providerId}
                </p>

                <p className="text-[11px] text-slate-500">
                  Submitted: {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'Recent'}
                  {item.reviewedBy && ` • Reviewed by ${item.reviewedBy}`}
                </p>

                {item.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-300 text-xs">
                    <span className="font-bold">Rejection Note:</span> {item.rejectionReason}
                  </div>
                )}
              </div>

              {/* Document Attachments Preview Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {item.idDocumentUrl ? (
                  <button
                    onClick={() => setPreviewDoc({ title: `Government ID (${item.providerName})`, url: item.idDocumentUrl })}
                    className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Govt ID</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-500">
                    No ID Attached
                  </span>
                )}

                {item.insuranceDocumentUrl ? (
                  <button
                    onClick={() => setPreviewDoc({ title: `Insurance Policy (${item.providerName})`, url: item.insuranceDocumentUrl })}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>View Insurance</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-500">
                    No Insurance Attached
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {item.status !== 'approved' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleApprove(item)}
                    className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Approve Docs</span>
                  </button>
                )}

                {item.status !== 'rejected' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => {
                      setRejectingItem(item);
                      setRejectionReason('');
                    }}
                    className="py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}

                {item.status === 'approved' && (
                  <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image / Document Modal Previewer */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{previewDoc.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full</span>
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-auto">
              {previewDoc.url?.startsWith('data:image') || previewDoc.url?.startsWith('http') ? (
                <img src={previewDoc.url} alt={previewDoc.title} className="max-h-[420px] object-contain rounded-xl" />
              ) : (
                <div className="text-center space-y-2 py-8">
                  <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-white">Document Record Verified</p>
                  <p className="text-xs text-slate-400">Attached file format verified in storage.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal Dialog */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Reject Verification Documents</span>
              </div>
              <button
                onClick={() => setRejectingItem(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide feedback to <span className="font-bold text-white">{rejectingItem.providerName}</span> explaining why their ID or Insurance document was rejected:
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Government ID photo is blurry. Insurance document policy expiration date has passed."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleRejectSubmit}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
