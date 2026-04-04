// Scripts for firebase and firebase-messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Standard Firebase Config (Must match the one in src/firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyAr28rOqwzqT7rQjUsuBIgWUS7wq9t9Cqk",
  authDomain: "listing-52728.firebaseapp.com",
  projectId: "listing-52728",
  storageBucket: "listing-52728.firebasestorage.app",
  messagingSenderId: "910101936969",
  appId: "1:910101936969:web:bfd832e9ba114f8a77f898"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.jpeg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
