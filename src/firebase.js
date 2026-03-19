import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyDBE5ovM_ToQJkC0vRH-TJbaBiGzOP1TKI",
  authDomain:        "tradehub-9fd50.firebaseapp.com",
  projectId:         "tradehub-9fd50",
  storageBucket:     "tradehub-9fd50.firebasestorage.app",
  messagingSenderId: "914575491287",
  appId:             "1:914575491287:web:323499811da8e25a073092",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
