import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Syncs the firebase auth user to the 'users' collection in Firestore.
 * Automatically promotes the MASTER_UID to 'admin' role.
 */
export const syncUserToFirestore = async (user, additionalData = {}) => {
  if (!user || !db) return;

  // The primary owner's UID for auto-promotion to admin
  const MASTER_UID = import.meta.env.VITE_OWNER_UID || 'qW8v8b6tM8V7uP8v8b6tM8V7uP8'; // Placeholder fallback

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const isAdmin = user.uid === MASTER_UID;
    
    const userData = {
      uid: user.uid,
      name: user.displayName || additionalData.name || 'User',
      email: user.email || null,
      phone: user.phoneNumber || additionalData.phone || null,
      authProvider: additionalData.provider || 'unknown',
      role: isAdmin ? 'admin' : (additionalData.role || 'user'),
      onboardingCompleted: false, 
      createdAt: serverTimestamp(),
      ...additionalData
    };
    
    await setDoc(userRef, userData);
    console.log(`New user synced (${userData.role})`);
  } else {
    // If it's the master and wasn't admin, force update (failsafe for owner)
    const existing = userSnap.data();
    if (user.uid === MASTER_UID && existing.role !== 'admin') {
       await setDoc(userRef, { role: 'admin', updatedAt: serverTimestamp() }, { merge: true });
       console.log('Owner promoted to admin');
    }
  }
};
