import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useFcmNotification } from '../../shared/hooks/useFcmNotification';

// Mock dependencies
vi.mock('../../firebase', () => ({
  db: {},
  getMessagingInstance: vi.fn().mockResolvedValue({})
}));

vi.mock('../shared/context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: 'test_user_123', email: 'test@example.com' }
  })
}));

vi.mock('../shared/context/ToastContext', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn()
    }
  })
}));

vi.mock('firebase/messaging', () => ({
  getToken: vi.fn().mockResolvedValue('mock_fcm_token_999'),
  onMessage: vi.fn().mockReturnValue(() => {})
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn().mockReturnValue({}),
  setDoc: vi.fn().mockResolvedValue(true),
  arrayUnion: vi.fn((val) => [val]),
  serverTimestamp: vi.fn().mockReturnValue('mock_timestamp')
}));

describe('useFcmNotification Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default permission state', () => {
    const { result } = renderHook(() => useFcmNotification());
    expect(result.current.token).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isSupported).toBe(true);
  });

  it('requests notification permission and receives FCM registration token', async () => {
    // Mock Notification.requestPermission
    global.Notification = {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('granted')
    };

    const { result } = renderHook(() => useFcmNotification());

    let tokenResult;
    await act(async () => {
      tokenResult = await result.current.requestNotificationPermission();
    });

    expect(global.Notification.requestPermission).toHaveBeenCalled();
    expect(tokenResult).toBe('mock_fcm_token_999');
    expect(result.current.token).toBe('mock_fcm_token_999');
    expect(result.current.permission).toBe('granted');
  });
});
