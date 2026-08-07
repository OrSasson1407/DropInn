import { db, storage } from '../../firebase';
import { 
  collection, doc, addDoc, updateDoc, setDoc, getDocs, getDoc, query, where, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { sendNotification } from './firestore';

/**
 * Upload a file to Firebase Storage under verification_documents/{providerId}/{docType}
 * Fallbacks to data URL if storage bucket fails or offline.
 */
export async function uploadVerificationFile(providerId, file, docType = 'doc') {
  if (!file) return null;

  try {
    const timestamp = Date.now();
    const sanitizedFileName = (file.name || 'document').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storagePath = `verification_documents/${providerId}/${docType}_${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (storageError) {
    console.warn('Firebase Storage upload notice (falling back to Data URL):', storageError);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (err) => reject(new Error('Failed to read document file'));
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Submit provider verification documents (ID and Insurance)
 * Creates a record in 'verification_documents' and updates provider profile.
 */
export async function submitVerificationDocuments(providerId, providerName, { idFile, insuranceFile, idUrl, insuranceUrl }) {
  if (!providerId) throw new Error('Provider ID is required for document verification submission');

  let finalIdUrl = idUrl || '';
  let finalInsuranceUrl = insuranceUrl || '';

  if (idFile) {
    finalIdUrl = await uploadVerificationFile(providerId, idFile, 'id_document');
  }

  if (insuranceFile) {
    finalInsuranceUrl = await uploadVerificationFile(providerId, insuranceFile, 'insurance_document');
  }

  if (!finalIdUrl && !finalInsuranceUrl) {
    throw new Error('Please attach at least one verification document (Government ID or Insurance)');
  }

  const docPayload = {
    providerId,
    providerName: providerName || 'Provider Partner',
    idDocumentUrl: finalIdUrl,
    insuranceDocumentUrl: finalInsuranceUrl,
    documentTypes: [
      ...(finalIdUrl ? ['id'] : []),
      ...(finalInsuranceUrl ? ['insurance'] : [])
    ],
    status: 'pending',
    rejectionReason: '',
    submittedAt: new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const verDocRef = await addDoc(collection(db, 'verification_documents'), docPayload);

  // Update provider record in 'providers' collection
  await setDoc(doc(db, 'providers', providerId), {
    idDocumentSubmitted: !!finalIdUrl,
    idDocumentUrl: finalIdUrl,
    insuranceDocumentSubmitted: !!finalInsuranceUrl,
    insuranceDocumentUrl: finalInsuranceUrl,
    verificationStatus: 'pending',
    verificationDocId: verDocRef.id,
    updatedAt: serverTimestamp()
  }, { merge: true });

  return {
    verificationDocId: verDocRef.id,
    idDocumentUrl: finalIdUrl,
    insuranceDocumentUrl: finalInsuranceUrl,
    status: 'pending'
  };
}

/**
 * Fetch verification document records for a specific provider
 */
export async function getVerificationDocumentsForProvider(providerId) {
  if (!providerId) return [];
  try {
    const q = query(
      collection(db, 'verification_documents'),
      where('providerId', '==', providerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching provider verification docs:', err);
    return [];
  }
}

/**
 * Fetch all verification document submissions for admin review
 */
export async function getAllVerificationDocuments() {
  try {
    const snap = await getDocs(collection(db, 'verification_documents'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching verification documents:', err);
    return [];
  }
}

/**
 * Approve a provider verification document submission
 */
export async function approveVerificationDocument(docId, providerId, reviewerInfo = {}) {
  const verDocRef = doc(db, 'verification_documents', docId);
  const now = new Date().toISOString();

  await updateDoc(verDocRef, {
    status: 'approved',
    rejectionReason: '',
    reviewedBy: reviewerInfo.email || reviewerInfo.name || 'Admin',
    reviewedAt: now,
    updatedAt: serverTimestamp()
  });

  // Update provider status in providers collection
  if (providerId) {
    await updateDoc(doc(db, 'providers', providerId), {
      isApproved: true,
      verificationStatus: 'approved',
      idVerified: true,
      insuranceVerified: true,
      verifiedAt: now,
      updatedAt: serverTimestamp()
    });

    try {
      await sendNotification(providerId, {
        title: '🎉 Partner Verification Approved!',
        body: 'Your Government ID and Insurance documents have been verified. Your provider account is now fully active!',
        type: 'VERIFICATION_APPROVED'
      });
    } catch (e) {
      console.warn('Could not dispatch approval notification:', e);
    }
  }
}

/**
 * Reject a provider verification document submission with reason
 */
export async function rejectVerificationDocument(docId, providerId, rejectionReason, reviewerInfo = {}) {
  const verDocRef = doc(db, 'verification_documents', docId);
  const now = new Date().toISOString();

  await updateDoc(verDocRef, {
    status: 'rejected',
    rejectionReason: rejectionReason || 'Documents did not pass compliance criteria. Please upload updated ID/Insurance.',
    reviewedBy: reviewerInfo.email || reviewerInfo.name || 'Admin',
    reviewedAt: now,
    updatedAt: serverTimestamp()
  });

  if (providerId) {
    await updateDoc(doc(db, 'providers', providerId), {
      isApproved: false,
      verificationStatus: 'rejected',
      rejectionReason: rejectionReason || 'Verification documents rejected by admin',
      updatedAt: serverTimestamp()
    });

    try {
      await sendNotification(providerId, {
        title: '⚠️ Verification Document Notice',
        body: `Your verification submission requires updates: ${rejectionReason || 'Please resubmit valid ID & Insurance documents.'}`,
        type: 'VERIFICATION_REJECTED'
      });
    } catch (e) {
      console.warn('Could not dispatch rejection notification:', e);
    }
  }
}
