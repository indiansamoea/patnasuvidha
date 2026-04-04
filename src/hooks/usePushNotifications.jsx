import { useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { toast } from 'react-hot-toast';

export const usePushNotifications = () => {
    const [token, setToken] = useState(null);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return;
        
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const messaging = getMessaging();
                const currentToken = await getToken(messaging, { 
                    vapidKey: 'SerFi5Sgxan7Xe7QElYFV2mOj9oYSyJLonAmkKTfGeA' 
                });

                if (currentToken) {
                    setToken(currentToken);
                    // Sync to Firestore if user is logged in
                    if (auth.currentUser) {
                        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                            fcmToken: currentToken,
                            lastActive: new Date().toISOString()
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Push Notification Error:", error);
        }
    }, []);

    // Foreground listener
    const listenForMessages = useCallback(() => {
        const messaging = getMessaging();
        onMessage(messaging, (payload) => {
            toast.custom((t) => (
                <div style={{ background: '#151a20', border: '1px solid #ff9159', padding: '1rem', borderRadius: '1rem', color: '#fff' }}>
                  <b>{payload.notification.title}</b>
                  <p>{payload.notification.body}</p>
                </div>
            ));
        });
    }, []);

    return { token, requestPermission, listenForMessages };
};
