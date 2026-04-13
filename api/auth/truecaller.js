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
  // CORS Headers - restrict to authorized domains
  const allowedOrigins = [
    'https://patnasuvidha.com',
    'https://www.patnasuvidha.com',
    'https://patnasuvidha.online',
    'https://www.patnasuvidha.online',
    'https://patnasuvidha.vercel.app',
    'https://patnasuvidha-5o2s7z1cs-indiansamoeas-projects.vercel.app',
    'http://localhost:5173' // for local dev
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
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

  // Ensure profile is an object for analysis
  let profileObj = profile;
  if (typeof profile === 'string') {
    try { profileObj = JSON.parse(profile); } catch (e) {
      return res.status(400).json({ error: "Invalid profile format." });
    }
  }

  // 1. Extract signature and algorithm if nested (SDK behavior)
  signature = signature || profileObj?.signature;
  signatureAlgorithm = signatureAlgorithm || profileObj?.signatureAlgorithm || 'SHA256';

  // 1. Input Validation
  if (!profile || !signature) {
    return res.status(400).json({ error: "Missing profile or signature from Truecaller." });
  }

  // We need the raw string for signature check if profile was passed as a string
  // If profile was an object, we use stringify to keep it consistent
  let profileStr = typeof profile === 'string' ? profile : JSON.stringify(profile);

  try {
    // 2. Fetch Truecaller Public Keys
    const keys = await getTruecallerPublicKeys();
    if (!keys || !Array.isArray(keys)) {
      return res.status(500).json({ error: "Could not fetch verification keys." });
    }

    // 3. Perform RSA-SHA256 Signature Verification
    let isVerified = false;
    
    // Truecaller uses multiple keys. We need to find the right one (usually based on key id if provided, or try all)
    // For the Web SDK, we often verify the profile string
    for (const key of keys) {
      try {
        const verifier = crypto.createVerify(signatureAlgorithm || 'SHA256');
        verifier.update(profileStr);
        // Note: The public key from Truecaller is in a specific format, we might need to wrap it in PEM
        const publicKey = `-----BEGIN PUBLIC KEY-----\n${key.key}\n-----END PUBLIC KEY-----`;
        if (verifier.verify(publicKey, signature, 'base64')) {
          isVerified = true;
          break;
        }
      } catch (err) {
        // Continue to next key if verification fails for this specific key
      }
    }
    
    if (!isVerified) {
      // Security Log: Potential impersonation attempt
      console.warn(`[SECURITY] Signature verification failed for phone: ${profileObj.phoneNumber || profileObj.phone}`);
      return res.status(401).json({ error: "Truecaller signature verification failed." });
    }

    // 4. Extract User Data
    const phone = profileObj.phoneNumber || profileObj.phone;
    const name = (profileObj.firstName || 'User') + (profileObj.lastName ? ' ' + profileObj.lastName : '');
    
    if (!phone) {
      return res.status(400).json({ error: "Profile missing phone number." });
    }
    
    const formattedPhone = phone.startsWith('+') ? phone : '+' + phone;

    // 5. Firebase User Sync
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

    // 6. Generate Custom Token
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
