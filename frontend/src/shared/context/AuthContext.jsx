import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(userRef, async (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.data());
          } else {
            const isAdminEmail = user.email === 'orsasson140701@gmail.com' || user.email === 'admin@dropinn.com';
            const initialRole = isAdminEmail ? 'admin' : (user.email?.includes('provider') ? 'provider' : 'customer');
            const defaultProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              role: initialRole,
              createdAt: new Date().toISOString()
            };
            try {
              await setDoc(userRef, defaultProfile, { merge: true });
              setUserProfile(defaultProfile);
            } catch (err) {
              console.warn('Could not initialize user profile:', err);
              setUserProfile(defaultProfile);
            }
          }
          setLoading(false);
        }, (err) => {
          console.warn('User profile snapshot error:', err);
          const isAdminEmail = user.email === 'orsasson140701@gmail.com' || user.email === 'admin@dropinn.com';
          setUserProfile({
            uid: user.uid,
            email: user.email,
            role: isAdminEmail ? 'admin' : 'customer'
          });
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const userRole = userProfile?.role || (currentUser?.email === 'orsasson140701@gmail.com' ? 'admin' : 'customer');
  const isAdmin = userRole === 'admin' || currentUser?.email === 'orsasson140701@gmail.com';
  const isProvider = userRole === 'provider' || isAdmin;

  const updateUserRole = async (newRole) => {
    if (!currentUser) return;
    if (!isAdmin) {
      console.warn('Unauthorized role update attempt blocked.');
      return;
    }
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, { role: newRole }, { merge: true });
    setUserProfile(prev => ({ ...prev, role: newRole }));
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userProfile, 
      userRole, 
      isAdmin, 
      isProvider, 
      loading,
      updateUserRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

