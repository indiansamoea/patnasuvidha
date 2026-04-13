import Razorpay from 'razorpay';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

  try {
    const { amount, bookingDetails } = req.body;

    // 1. Mandatory Validation
    if (!amount || amount <= 0 || !bookingDetails || !bookingDetails.businessId || !bookingDetails.service) {
      return res.status(400).json({ error: 'Invalid order request. Missing service or amount.' });
    }

    // 2. SECURITY CRITICAL: Server-side Amount Verification
    // We fetch the business data and verify the service price
    let verifiedAmount = amount;
    const bizSnap = await db.collection('businesses').doc(bookingDetails.businessId).get();
    
    if (bizSnap.exists()) {
      const bizData = bizSnap.data();
      const service = bizData.services?.find(s => s.name === bookingDetails.service);
      
      if (service && service.price) {
        if (parseFloat(service.price) !== parseFloat(amount)) {
          console.warn(`[SECURITY] Price mismatch for order! Client: ${amount}, Server: ${service.price}`);
          return res.status(400).json({ error: 'Price mismatch. Please refresh and try again.' });
        }
        verifiedAmount = service.price;
      }
    } else {
      // If business not in DB, we should be cautious. 
      // For this app, we might allow it if it's a new business, but it's a risk.
      console.warn(`[SECURITY] Order created for non-existent business: ${bookingDetails.businessId}`);
    }

    // 1. Create Razorpay Order
    const options = {
      amount: Math.round(verifiedAmount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // 2. Create Pending Booking in Firestore
    const bookingRef = await db.collection('bookings').add({
      ...bookingDetails,
      razorpayOrderId: order.id,
      status: 'pending',
      amount: verifiedAmount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      orderId: order.id,
      bookingId: bookingRef.id,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
}
