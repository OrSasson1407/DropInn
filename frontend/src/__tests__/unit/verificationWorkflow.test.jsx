import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  submitVerificationDocuments, 
  approveVerificationDocument, 
  rejectVerificationDocument 
} from '../../shared/services/verification';
import { db } from '../../firebase';
import * as firestoreModule from 'firebase/firestore';

// Mock firestore functions
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    addDoc: vi.fn().mockResolvedValue({ id: 'mock_ver_doc_123' }),
    setDoc: vi.fn().mockResolvedValue(true),
    updateDoc: vi.fn().mockResolvedValue(true),
    getDocs: vi.fn().mockResolvedValue({ docs: [] }),
    getDoc: vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'Test Provider', isApproved: false })
    }),
    serverTimestamp: () => 'MOCK_TIMESTAMP'
  };
});

// Mock firebase storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn().mockReturnValue({}),
  ref: vi.fn(),
  uploadBytes: vi.fn().mockResolvedValue({ ref: {} }),
  getDownloadURL: vi.fn().mockResolvedValue('https://storage.googleapis.com/mock_doc.png')
}));

// Mock notifications helper
vi.mock('../../shared/services/firestore', () => ({
  sendNotification: vi.fn().mockResolvedValue(true)
}));

describe('Provider Verification Workflow Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits verification documents and creates record in verification_documents', async () => {
    const mockFile = new File(['dummy content'], 'id_card.png', { type: 'image/png' });

    const result = await submitVerificationDocuments('provider_100', 'Barber Bob', {
      idFile: mockFile,
      insuranceFile: mockFile
    });

    expect(result.verificationDocId).toBe('mock_ver_doc_123');
    expect(result.status).toBe('pending');
    expect(firestoreModule.addDoc).toHaveBeenCalled();
    expect(firestoreModule.setDoc).toHaveBeenCalled();
  });

  it('approves verification documents and updates provider state', async () => {
    await approveVerificationDocument('ver_doc_123', 'provider_100', { email: 'admin@dropinn.com' });

    expect(firestoreModule.updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: 'approved',
        reviewedBy: 'admin@dropinn.com'
      })
    );

    expect(firestoreModule.updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        isApproved: true,
        verificationStatus: 'approved',
        idVerified: true,
        insuranceVerified: true
      })
    );
  });

  it('rejects verification documents with reason and updates provider state', async () => {
    const rejectionReason = 'ID document image was blurry. Please resubmit clear photo.';

    await rejectVerificationDocument('ver_doc_123', 'provider_100', rejectionReason, { email: 'admin@dropinn.com' });

    expect(firestoreModule.updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: 'rejected',
        rejectionReason
      })
    );

    expect(firestoreModule.updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        isApproved: false,
        verificationStatus: 'rejected',
        rejectionReason
      })
    );
  });
});
