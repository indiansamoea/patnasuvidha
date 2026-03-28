import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const syncUserToFirestore = async (user, additionalData = {}) => {
  if (!user || !db) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData = {
      uid: user.uid,
      name: user.displayName || additionalData.name || 'User',
      email: user.email || null,
      phone: user.phoneNumber || additionalData.phone || null,
      authProvider: additionalData.provider || 'unknown',
      createdAt: serverTimestamp(),
      ...additionalData
    };
    await setDoc(userRef, userData);
    console.log('New user synced to Firestore');
  } else {
    console.log('User already exists in Firestore');
  }
};
