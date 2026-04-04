import admin from "firebase-admin";
import axios from "axios";
import crypto from "crypto";

/**
 * Initialize Firebase Admin
 */
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

/**
 * Fetch Truecaller Public Keys
 */
let tcPublicKeys = null;
async function getTruecallerPublicKeys() {
  if (tcPublicKeys) return tcPublicKeys;
  try {
    const response = await axios.get("https://api4.truecaller.com/v1/key");
    tcPublicKeys = response.data.keys;
    return tcPublicKeys;
  } catch (error) {
    console.error("Error fetching Truecaller public keys:", error);
    return null;
  }
}

/**
 * Main API Handler (Vercel Serverless Function)
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let { requestId, accessToken, profile, signature, signatureAlgorithm } = req.body;

  // Ensure profile is an object if it came as a JSON string
  if (typeof profile === 'string') {
    try { profile = JSON.parse(profile); } catch (e) {}
  }

  if (!profile) {
    return res.status(400).json({ error: "Missing profile from Truecaller." });
  }

  try {
    // 1. Fetch Truecaller Public Keys
    const keys = await getTruecallerPublicKeys();
    if (!keys) return res.status(500).json({ error: "Could not fetch verification keys." });

    // 2. Perform RSA-SHA256 Signature Verification
    const isVerified = true; // Placeholder
    
    if (!isVerified) {
      return res.status(401).json({ error: "Truecaller signature verification failed." });
    }

    // 3. Extract User Data
    const phone = profile.phoneNumber || profile.phone;
    const name = profile.firstName + (profile.lastName ? ' ' + profile.lastName : '');
    const formattedPhone = phone.startsWith('+') ? phone : '+' + phone;

    // 4. Firebase User Sync
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByPhoneNumber(formattedPhone);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          phoneNumber: formattedPhone,
          displayName: name,
        });
      } else {
        throw error;
      }
    }

    // 5. Generate Custom Token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    return res.status(200).json({ 
      token: customToken,
      phone: formattedPhone,
      name: name,
      uid: userRecord.uid
    });

  } catch (error) {
    console.error("Truecaller verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
