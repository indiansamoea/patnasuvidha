import { useState, useCallback, useEffect } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth, messaging } from "../firebase";
import { toast } from 'react-hot-toast';

export const usePushNotifications = () => {
    const [token, setToken] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(
      typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );

    // Sync token to Firestore whenever auth or token changes
    useEffect(() => {
        if (token && auth?.currentUser && db) {
            updateDoc(doc(db, 'users', auth.currentUser.uid), {
                fcmToken: token,
                lastActive: serverTimestamp()
            }).catch(e => console.warn("FCM sync failed:", e));
        }
    }, [token, auth?.currentUser]);

    const requestBrowserPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            toast.error("Notifications are not supported.");
            return false;
        }
        
        try {
            const firebaseMessagingSupported = await isSupported();
            if (!firebaseMessagingSupported) return false;

            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);
            
            if (permission === 'granted') {
                const currentToken = await getToken(messaging, { 
                    vapidKey: 'SerFi5Sgxan7Xe7QElYFV2mOj9oYSyJLonAmkKTfGeA' 
                });

                if (currentToken) {
                    setToken(currentToken);
                    toast.success("Notifications enabled!");
                    return true;
                }
            } else if (permission === 'denied') {
                toast.error("Notifications blocked. Check settings.");
            }
            return false;
        } catch (error) {
            console.error("Push Notification Error:", error);
            toast.error("Could not set up notifications.");
            return false;
        }
    }, []);

    // Foreground listener
    const listenForMessages = useCallback(async () => {
        try {
            const messagingSupported = await isSupported();
            if (!messagingSupported || !messaging) return;

            onMessage(messaging, (payload) => {
                const { title, body } = payload.notification;
                toast.custom((t) => (
                    <motion.div 
                      initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                      className="liquid-glass" 
                      style={{ 
                        padding: '1rem 1.25rem', borderRadius: '1.25rem', color: '#fff', 
                        border: '1px solid hsla(var(--p-h), 100%, 50%, 0.2)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', minWidth: '300px',
                        display: 'flex', gap: '1rem', alignItems: 'center'
                      }}
                    >
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                           <i className="ph-fill ph-bell-simple-ringing" style={{ color: '#fff', fontSize: '1.25rem' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <b style={{ color: 'var(--primary)', display: 'block', fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{title}</b>
                          <p style={{ fontSize: '0.8125rem', margin: 0, opacity: 0.7, lineHeight: 1.4 }}>{body}</p>
                        </div>
                    </motion.div>
                ), { duration: 6000 });
            });
        } catch (e) {
            console.warn("Foreground messaging listener failed:", e);
        }
    }, [messaging]);

    return { token, permissionStatus, requestBrowserPermission, listenForMessages };
};
