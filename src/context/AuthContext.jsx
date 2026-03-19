import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc,
  arrayUnion, arrayRemove, serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);   // Firebase user object
  const [profile,     setProfile]     = useState(null);   // Firestore user document
  const [loading,     setLoading]     = useState(true);
  const [authError,   setAuthError]   = useState(null);

  // ── Load/create Firestore profile ─────────────────────────
  const loadProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) { setProfile(null); return; }
    const ref  = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setProfile(snap.data());
    } else {
      const newProfile = {
        uid:            firebaseUser.uid,
        email:          firebaseUser.email,
        displayName:    firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Trader',
        photoURL:       firebaseUser.photoURL || null,
        savedStrategies: [],
        createdAt:      serverTimestamp(),
        lastSeen:       serverTimestamp(),
      };
      await setDoc(ref, newProfile);
      setProfile(newProfile);
    }
  }, []);

  // ── Auth state listener ────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      await loadProfile(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, [loadProfile]);

  // ── Sign in with Google ────────────────────────────────────
  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await loadProfile(result.user);
      return { success: true };
    } catch (err) {
      const msg = friendlyError(err.code);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // ── Email sign-up ──────────────────────────────────────────
  const signUpWithEmail = async (email, password, displayName) => {
    setAuthError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await loadProfile(result.user);
      return { success: true };
    } catch (err) {
      const msg = friendlyError(err.code);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // ── Email sign-in ──────────────────────────────────────────
  const signInWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const msg = friendlyError(err.code);
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // ── Sign out ───────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  // ── Save / unsave strategy ─────────────────────────────────
  const saveStrategy = async (strategyId) => {
    if (!user) return { success: false, error: 'Not logged in' };
    const ref = doc(db, 'users', user.uid);
    try {
      await updateDoc(ref, { savedStrategies: arrayUnion(strategyId) });
      setProfile(p => ({ ...p, savedStrategies: [...(p?.savedStrategies || []), strategyId] }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const unsaveStrategy = async (strategyId) => {
    if (!user) return { success: false, error: 'Not logged in' };
    const ref = doc(db, 'users', user.uid);
    try {
      await updateDoc(ref, { savedStrategies: arrayRemove(strategyId) });
      setProfile(p => ({ ...p, savedStrategies: (p?.savedStrategies || []).filter(id => id !== strategyId) }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const isSaved = (strategyId) => profile?.savedStrategies?.includes(strategyId) || false;

  // ── Update last-seen timestamp ─────────────────────────────
  const updateLastSeen = useCallback(async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { lastSeen: serverTimestamp() });
    } catch (_) {}
  }, [user]);

  useEffect(() => {
    if (user) updateLastSeen();
  }, [user, updateLastSeen]);

  const value = {
    user,
    profile,
    loading,
    authError,
    setAuthError,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    logout,
    saveStrategy,
    unsaveStrategy,
    isSaved,
    savedStrategies: profile?.savedStrategies || [],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// ── Human-readable Firebase error messages ─────────────────
function friendlyError(code) {
  const map = {
    'auth/user-not-found':         'No account found with that email.',
    'auth/wrong-password':         'Incorrect password. Please try again.',
    'auth/email-already-in-use':   'An account with this email already exists.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/popup-closed-by-user':   'Sign-in popup was closed. Please try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/too-many-requests':      'Too many attempts. Please wait and try again.',
  };
  return map[code] || 'Authentication failed. Please try again.';
}
