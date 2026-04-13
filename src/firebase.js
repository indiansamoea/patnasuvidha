import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
export let db = null;
export let storage = null;
export let auth = null;
export let functions = null;

if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    
    // Attempt Firestore with persistent cache
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    } catch (e) {
      console.warn("Firestore persistent cache failed, falling back to standard:", e);
      db = getFirestore(app);
    }

    storage = getStorage(app);
    auth = getAuth(app);
    functions = getFunctions(app, 'us-central1');
  } catch (err) {
    console.error("Firebase init failed:", err);
  }
}
