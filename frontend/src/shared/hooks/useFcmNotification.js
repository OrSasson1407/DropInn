import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db, getMessagingInstance } from '../../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useFcmNotification() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  // Save FCM registration token to Firestore
  const saveTokenToFirestore = async (userId, fcmToken) => {
    if (!userId || !fcmToken) return;
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        fcmToken: fcmToken,
        fcmTokens: arrayUnion(fcmToken),
        fcmTokenUpdatedAt: serverTimestamp(),
        notificationsEnabled: true,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // If user is also a provider, save token in providers collection too
      const providerRef = doc(db, 'providers', userId);
      await setDoc(providerRef, {
        fcmToken: fcmToken,
        fcmTokens: arrayUnion(fcmToken),
        fcmTokenUpdatedAt: serverTimestamp()
      }, { merge: true }).catch(() => {
        // Non-critical if provider doc doesn't exist
      });
    } catch (err) {
      console.warn('Failed to save FCM token to Firestore:', err);
    }
  };

  // Request notification permissions and register FCM token
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setIsSupported(false);
      setError('Notifications are not supported in this browser.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      let messaging = null;
      if (typeof getMessagingInstance === 'function') {
        messaging = await getMessagingInstance();
      }
      if (!messaging) {
        setIsSupported(false);
        setError('Firebase Cloud Messaging is not supported in this environment.');
        setLoading(false);
        return null;
      }

      // Request browser permission
      const resultPermission = await Notification.requestPermission();
      setPermission(resultPermission);

      if (resultPermission !== 'granted') {
        setError('Notification permission was denied.');
        setLoading(false);
        return null;
      }

      // Get FCM token
      const vapidKey = import.meta.env?.VITE_FIREBASE_VAPID_KEY || undefined;
      const currentToken = await getToken(messaging, { vapidKey });

      if (currentToken) {
        setToken(currentToken);

        if (currentUser?.uid) {
          await saveTokenToFirestore(currentUser.uid, currentToken);
        }

        toast?.success?.('Push notifications activated successfully!', 'FCM Registered');
        setLoading(false);
        return currentToken;
      } else {
        setError('No registration token available. Request permission to generate one.');
        setLoading(false);
        return null;
      }
    } catch (err) {
      console.error('An error occurred while retrieving FCM token:', err);
      setError(err.message || 'Failed to register FCM token.');
      setLoading(false);
      return null;
    }
  }, [currentUser, toast]);

  // Handle foreground messages & automatic token sync on mount
  useEffect(() => {
    let unsubscribeOnMessage = () => {};

    const setupMessaging = async () => {
      let messaging = null;
      try {
        if (typeof getMessagingInstance === 'function') {
          messaging = await getMessagingInstance();
        }
      } catch (e) {
        console.warn('FCM Messaging initialization skipped:', e);
      }

      if (!messaging) {
        setIsSupported(false);
        return;
      }

      // Listen for foreground push messages
      if (typeof onMessage === 'function') {
        unsubscribeOnMessage = onMessage(messaging, (payload) => {
          console.log('Foreground FCM Message received:', payload);
          const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
          const notificationBody = payload.notification?.body || payload.data?.body || 'You have a new update.';
          
          toast?.info?.(notificationBody, notificationTitle);

          // Native browser notification if page is focused or in background
          if (typeof window !== 'undefined' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              new Notification(notificationTitle, {
                body: notificationBody,
                icon: '/icon.png'
              });
            } catch (e) {
              // Ignore if native notification call fails
            }
          }
        });
      }

      // Auto-retrieve token if permission is already granted and user is logged in
      const hasNotificationPermission = typeof window !== 'undefined' && typeof Notification !== 'undefined' && Notification.permission === 'granted';
      if (hasNotificationPermission && currentUser?.uid && !token) {
        try {
          const vapidKey = import.meta.env?.VITE_FIREBASE_VAPID_KEY || undefined;
          const existingToken = await getToken(messaging, { vapidKey });
          if (existingToken) {
            setToken(existingToken);
            await saveTokenToFirestore(currentUser.uid, existingToken);
          }
        } catch (e) {
          console.warn('Auto FCM token retrieval skipped:', e);
        }
      }
    };

    setupMessaging();

    return () => {
      unsubscribeOnMessage();
    };
  }, [currentUser, token, toast]);

  return {
    token,
    permission,
    loading,
    error,
    isSupported,
    requestNotificationPermission
  };
}

export default useFcmNotification;
