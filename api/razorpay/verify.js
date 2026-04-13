import crypto from 'crypto';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // CORS Headers - restrict to authorized domains
  const allowedOrigins = [
    'https://patnasuvidha.com',
    'https://www.patnasuvidha.com',
    'https://patnasuvidha.vercel.app',
    'http://localhost:5173'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // 1. Input Validation
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required payment details' });
  }

  // 2. Verify Signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isSignatureValid = expectedSignature === razorpay_signature;

  if (!isSignatureValid) {
    console.warn(`[SECURITY] Invalid Razorpay signature for order: ${razorpay_order_id}`);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    // 2. Update Booking Status
    const bookingsRef = db.collection('bookings');
    const snapshot = await bookingsRef.where('razorpayOrderId', '==', razorpay_order_id).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingDoc = snapshot.docs[0];
    const bookingData = bookingDoc.data();

    await bookingDoc.ref.update({
      status: 'paid',
      razorpayPaymentId: razorpay_payment_id,
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. Trigger Notifications
    const { businessName, businessId, customerName, customerPhone, service, date, time, customerAddress } = bookingData;

    // --- Admin Alert (Telegram) ---
    const telegramMsg = `🚀 *New Paid Booking!*
━━━━━━━━━━━━━━
🏢 *Service:* ${service}
💰 *Business:* ${businessName}
👤 *Customer:* ${customerName}
📱 *Phone:* ${customerPhone}
📍 *Address:* ${customerAddress}
📅 *Time:* ${date} at ${time}
━━━━━━━━━━━━━━`;

    try {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
          text: telegramMsg,
          parse_mode: 'Markdown',
        }),
      });
    } catch (err) {
      console.error('Telegram Notify Error:', err);
    }

    // --- Vendor Alert (FCM) ---
    try {
      // Fetch Vendor UID from Business
      const bizSnap = await db.collection('businesses').doc(businessId).get();
      const bizData = bizSnap.data();
      const ownerId = bizData?.ownerId; // Assuming ownerId exists

      if (ownerId) {
        // Fetch FCM Token from User document
        const userSnap = await db.collection('users').doc(ownerId).get();
        const userData = userSnap.data();
        const fcmToken = userData?.fcmToken;

        if (fcmToken) {
          const message = {
            notification: {
              title: "New Paid Booking! 🚀",
              body: `${service} at ${time}. Tap to view customer address and phone number.`,
            },
            data: {
              bookingId: bookingDoc.id,
              type: 'NEW_BOOKING',
            },
            token: fcmToken,
          };
          await admin.messaging().send(message);
        }
      }
    } catch (err) {
      console.error('FCM Notify Error:', err);
    }

    return res.status(200).json({ success: true, bookingId: bookingDoc.id });
  } catch (error) {
    console.error('Verification Error:', error);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
}
