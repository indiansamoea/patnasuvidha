import { useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { toast } from 'react-hot-toast';

export const usePushNotifications = () => {
    const [token, setToken] = useState(null);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            toast.error("Notifications are not supported by this browser.");
            return;
        }
        
        try {
            const firebaseMessagingSupported = await isSupported();
            if (!firebaseMessagingSupported) {
                toast.error("Push messaging is not supported in this environment.");
                return;
            }

            const permission = await Notification.requestPermission();
            
            if (permission === 'denied') {
                toast.error("Notification permission denied. Please enable it in browser settings to get updates.");
                return;
            }

            if (permission === 'granted') {
                const messaging = getMessaging();
                const currentToken = await getToken(messaging, { 
                    vapidKey: 'SerFi5Sgxan7Xe7QElYFV2mOj9oYSyJLonAmkKTfGeA' 
                });

                if (currentToken) {
                    setToken(currentToken);
                    if (auth?.currentUser && db) {
                        try {
                            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                                fcmToken: currentToken,
                                lastActive: new Date().toISOString()
                            });
                        } catch (e) {
                            console.warn("Could not sync token to Firestore:", e);
                        }
                    }
                    toast.success("Notifications enabled!");
                }
            }
        } catch (error) {
            console.error("Push Notification Error:", error);
            toast.error("Could not enable notifications. Check your connection.");
        }
    }, [token]);

    // Foreground listener
    const listenForMessages = useCallback(async () => {
        try {
            const messagingSupported = await isSupported();
            if (!messagingSupported) return;

            const messaging = getMessaging();
            onMessage(messaging, (payload) => {
                toast.custom((t) => (
                    <div className="clay-card" style={{ background: '#151a20', border: '1px solid var(--primary)', padding: '1.25rem', borderRadius: '1.25rem', color: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', minWidth: '280px' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                           <i className="ph-fill ph-bell-ringing" style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <b style={{ color: 'var(--primary)', display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{payload.notification.title}</b>
                          <p style={{ fontSize: '0.8125rem', margin: 0, opacity: 0.9, lineHeight: 1.4 }}>{payload.notification.body}</p>
                        </div>
                      </div>
                    </div>
                ), { duration: 6000 });
            });
        } catch (e) {
            console.warn("Foreground messaging listener failed to start:", e);
        }
    }, []);

    return { token, requestPermission, listenForMessages };
};
