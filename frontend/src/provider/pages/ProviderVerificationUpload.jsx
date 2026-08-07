import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import { db } from '../../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { 
  submitVerificationDocuments, 
  getVerificationDocumentsForProvider 
} from '../../shared/services/verification';
import { 
  ShieldCheck, ShieldAlert, UploadCloud, FileText, CheckCircle2, 
  XCircle, Clock, AlertTriangle, Eye, Loader2, ArrowRight, FileCheck, RefreshCw
} from 'lucide-react';

export default function ProviderVerificationUpload() {
  const authContext = useAuth() || {};
  const currentUser = authContext.currentUser;
  const toastContext = useToast() || {};
  const toast = toastContext.toast || { success: console.log, error: console.error };

  const [providerProfile, setProviderProfile] = useState(null);
  const [verificationDocs, setVerificationDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form file state
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState('');
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [insurancePreview, setInsurancePreview] = useState('');

  // Drag over states
  const [isDraggingId, setIsDraggingId] = useState(false);
  const [isDraggingInsurance, setIsDraggingInsurance] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Listen to real-time provider profile updates
    const unsubProvider = onSnapshot(
      doc(db, 'providers', currentUser.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setProviderProfile(data);
          if (data.idDocumentUrl && !idPreview) setIdPreview(data.idDocumentUrl);
          if (data.insuranceDocumentUrl && !insurancePreview) setInsurancePreview(data.insuranceDocumentUrl);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching provider profile:', err);
        setLoading(false);
      }
    );

    // Fetch existing verification submission history
    getVerificationDocumentsForProvider(currentUser.uid)
      .then((docs) => setVerificationDocs(docs))
      .catch((e) => console.warn('Could not load verification records:', e));

    return () => unsubProvider();
  }, [currentUser]);

  const handleFileSelect = (file, type) => {
    if (!file) return;

    // Validate file type (image or pdf)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG, WebP) or PDF document.', 'Invalid File');
      return;
    }

    // Validate max file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Document file size must be less than 10MB.', 'File Too Large');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'id') {
        setIdFile(file);
        setIdPreview(reader.result);
        toast.success('Government ID attached!', 'File Ready');
      } else {
        setInsuranceFile(file);
        setInsurancePreview(reader.result);
        toast.success('Insurance document attached!', 'File Ready');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    if (type === 'id') setIsDraggingId(false);
    else setIsDraggingInsurance(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile, type);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!idFile && !insuranceFile && !idPreview && !insurancePreview) {
      toast.error('Please attach at least one document (Government ID or Insurance Policy).', 'Missing Documents');
      return;
    }

    setUploading(true);
    try {
      const result = await submitVerificationDocuments(currentUser.uid, providerProfile?.name || currentUser.displayName, {
        idFile,
        insuranceFile,
        idUrl: !idFile ? idPreview : '',
        insuranceUrl: !insuranceFile ? insurancePreview : ''
      });

      toast.success(
        'Your verification documents have been uploaded to Firebase Storage & submitted for admin review!',
        'Verification Submitted'
      );

      // Refresh verification docs
      const updatedDocs = await getVerificationDocumentsForProvider(currentUser.uid);
      setVerificationDocs(updatedDocs);
      setIdFile(null);
      setInsuranceFile(null);
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.message || 'Failed to upload verification documents.', 'Submission Error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-3">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-400" />
        <p className="text-xs">Loading verification status...</p>
      </div>
    );
  }

  const verStatus = providerProfile?.verificationStatus || 'unverified';
  const isApproved = providerProfile?.isApproved || verStatus === 'approved';
  const isPending = verStatus === 'pending';
  const isRejected = verStatus === 'rejected';

  // Latest verification doc
  const latestDoc = verificationDocs.length > 0
    ? [...verificationDocs].sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))[0]
    : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Partner Trust & Security Compliance</span>
          </div>
          <h2 className="text-xl font-bold text-white">Provider Verification Portal</h2>
          <p className="text-xs text-slate-400">
            Upload official Government ID and Professional Liability Insurance for platform compliance.
          </p>
        </div>

        {/* Verification Status Badge */}
        <div>
          {isApproved ? (
            <span className="px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Verified Partner</span>
            </span>
          ) : isPending ? (
            <span className="px-4 py-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/10">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Review In Progress</span>
            </span>
          ) : isRejected ? (
            <span className="px-4 py-2 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-500/10">
              <XCircle className="w-4 h-4" />
              <span>Verification Action Required</span>
            </span>
          ) : (
            <span className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Unverified</span>
            </span>
          )}
        </div>
      </div>

      {/* Rejection Notice Banner if applicable */}
      {isRejected && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-5 space-y-2 text-rose-200 animate-fadeIn">
          <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Verification Submission Rejected</span>
          </div>
          <p className="text-xs text-rose-300/90 leading-relaxed">
            {latestDoc?.rejectionReason || providerProfile?.rejectionReason || 'Your submitted documents did not pass admin review. Please review document clarity and resubmit.'}
          </p>
          <p className="text-[11px] text-rose-400 font-medium pt-1">
            Please re-upload clear photos of your Government ID and active Liability Insurance below.
          </p>
        </div>
      )}

      {/* Approval Confirmation Banner */}
      {isApproved && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4 text-emerald-200">
          <FileCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white">Full Platform Verification Complete</h3>
            <p className="text-xs text-slate-300">
              Your Government ID and Professional Liability Insurance documents are verified and on record. You are eligible for high-priority client bookings.
            </p>
          </div>
        </div>
      )}

      {/* Document Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Government ID Upload Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>1. Government ID / License</span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">Passport, Driver License, Govt ID</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingId(true); }}
              onDragLeave={() => setIsDraggingId(false)}
              onDrop={(e) => handleDrop(e, 'id')}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${
                isDraggingId
                  ? 'border-amber-400 bg-amber-500/10'
                  : idPreview
                  ? 'border-emerald-500/40 bg-slate-950/80'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              {idPreview ? (
                <div className="space-y-3">
                  {idPreview.startsWith('data:image') || idPreview.startsWith('http') ? (
                    <div className="relative max-h-40 overflow-hidden rounded-xl border border-slate-800 mx-auto max-w-xs">
                      <img src={idPreview} alt="ID Document Preview" className="w-full h-36 object-cover" />
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
                      <FileCheck className="w-5 h-5 text-emerald-400" />
                      <span>Government ID File Attached</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer transition-colors">
                      Change File
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileSelect(e.target.files?.[0], 'id')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Drag & Drop Government ID here</p>
                    <p className="text-[11px] text-slate-500 mt-1">or click to browse from device (JPG, PNG, PDF up to 10MB)</p>
                  </div>
                  <label className="inline-block px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold cursor-pointer transition-all">
                    Browse Government ID
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileSelect(e.target.files?.[0], 'id')}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 2. Liability Insurance Upload Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>2. Liability Insurance Policy</span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">Professional Liability Insurance</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingInsurance(true); }}
              onDragLeave={() => setIsDraggingInsurance(false)}
              onDrop={(e) => handleDrop(e, 'insurance')}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${
                isDraggingInsurance
                  ? 'border-amber-400 bg-amber-500/10'
                  : insurancePreview
                  ? 'border-emerald-500/40 bg-slate-950/80'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              {insurancePreview ? (
                <div className="space-y-3">
                  {insurancePreview.startsWith('data:image') || insurancePreview.startsWith('http') ? (
                    <div className="relative max-h-40 overflow-hidden rounded-xl border border-slate-800 mx-auto max-w-xs">
                      <img src={insurancePreview} alt="Insurance Preview" className="w-full h-36 object-cover" />
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
                      <FileCheck className="w-5 h-5 text-emerald-400" />
                      <span>Insurance Policy Document Attached</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer transition-colors">
                      Change File
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileSelect(e.target.files?.[0], 'insurance')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Drag & Drop Insurance Document here</p>
                    <p className="text-[11px] text-slate-500 mt-1">or click to browse from device (JPG, PNG, PDF up to 10MB)</p>
                  </div>
                  <label className="inline-block px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold cursor-pointer transition-all">
                    Browse Insurance Policy
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileSelect(e.target.files?.[0], 'insurance')}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Submit Documents Button */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading Documents to Firebase Storage...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-5 h-5 stroke-[2.5]" />
              <span>Submit ID & Insurance Verification Record</span>
            </>
          )}
        </button>
      </form>

      {/* Verification Submission History */}
      {verificationDocs.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Document Submission Audit History ({verificationDocs.length})</span>
          </h3>

          <div className="space-y-3">
            {verificationDocs.map((docItem) => (
              <div key={docItem.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Verification Submission</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        docItem.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : docItem.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {docItem.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Submitted on: {docItem.submittedAt ? new Date(docItem.submittedAt).toLocaleString() : 'Recent'}
                  </p>
                  {docItem.rejectionReason && (
                    <p className="text-[11px] text-rose-400 font-medium">
                      Admin feedback: {docItem.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {docItem.idDocumentUrl && (
                    <a
                      href={docItem.idDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>ID Doc</span>
                    </a>
                  )}
                  {docItem.insuranceDocumentUrl && (
                    <a
                      href={docItem.insuranceDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Insurance Doc</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
