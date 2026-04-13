import { useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { toast } from 'react-hot-toast';

export const usePushNotifications = () => {
    const [token, setToken] = useState(null);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return;
        
        try {
            // Only proceed if Firebase is initialized and messaging is supported
            const messagingSupported = await isSupported();
            if (!messagingSupported || !db) return;

            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const messaging = getMessaging();
                const currentToken = await getToken(messaging, { 
                    vapidKey: 'SerFi5Sgxan7Xe7QElYFV2mOj9oYSyJLonAmkKTfGeA' 
                });

                if (currentToken) {
                    setToken(currentToken);
                    // Sync to Firestore if user is logged in
                    if (auth?.currentUser && db) {
                        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                            fcmToken: currentToken,
                            lastActive: new Date().toISOString()
                        });
                    }
                }
            }
        } catch (error) {
            console.warn("Push Notification initialization skipped or failed:", error);
        }
    }, [token]);

    // Foreground listener
    const listenForMessages = useCallback(async () => {
        try {
            const messagingSupported = await isSupported();
            if (!messagingSupported || !db) return;

            const messaging = getMessaging();
            onMessage(messaging, (payload) => {
                toast.custom((t) => (
                    <div style={{ background: '#151a20', border: '1px solid #ff9159', padding: '1rem', borderRadius: '1rem', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                      <b style={{ color: '#ff9159', display: 'block', marginBottom: '0.25rem' }}>{payload.notification.title}</b>
                      <p style={{ fontSize: '0.875rem', margin: 0 }}>{payload.notification.body}</p>
                    </div>
                ));
            });
        } catch (e) {
            console.warn("Foreground messaging listener failed to start:", e);
        }
    }, []);

    return { token, requestPermission, listenForMessages };
};
