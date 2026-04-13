const { onCall } = require("firebase-functions/v2/https");
const { HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const crypto = require("crypto");

admin.initializeApp();

/**
 * Verify Turnstile Token with Cloudflare
 */
async function verifyTurnstile(token) {
  if (!token) return false;
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing TURNSTILE_SECRET_KEY environment variable.");
    return false;
  }
  
  try {
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      new URLSearchParams({
        secret: secretKey,
        response: token,
      }).toString()
    );
    return response.data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
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
    throw new HttpsError("internal", "Could not fetch verification keys from Truecaller.");
  }
}

/**
 * Verify Truecaller Login Signature and Create Session
 */
exports.verifyTruecallerLogin = onCall({ cors: true }, async (request) => {
  const { requestId, accessToken, profile, signature, signatureAlgorithm, turnstileToken } = request.data;

  // 1. Bot Check (Mandatory for security)
  const isHuman = await verifyTurnstile(turnstileToken);
  if (!isHuman) {
    console.error("[SECURITY] Turnstile verification failed.");
    throw new HttpsError("failed-precondition", "Bot detection failed. Please try again.");
  }

  // 2. Validate Profile Data
  if (!profile || !signature) {
    throw new HttpsError("invalid-argument", "Missing profile or signature from Truecaller.");
  }

  // Ensure profile is a string for cryptographic verification
  const profileStr = typeof profile === 'string' ? profile : JSON.stringify(profile);
  const profileObj = typeof profile === 'string' ? JSON.parse(profile) : profile;

  try {
    // 3. Fetch Truecaller Public Keys
    const keys = await getTruecallerPublicKeys();
    
    // 4. Perform RSA-SHA256 Signature Verification
    let isVerified = false;
    
    for (const key of keys) {
      try {
        const verifier = crypto.createVerify(signatureAlgorithm || 'SHA256');
        verifier.update(profileStr);
        const publicKey = `-----BEGIN PUBLIC KEY-----\n${key.key}\n-----END PUBLIC KEY-----`;
        if (verifier.verify(publicKey, signature, 'base64')) {
          isVerified = true;
          break;
        }
      } catch (err) {
        // Skip invalid keys or verification errors
      }
    }
    
    if (!isVerified) {
      console.warn(`[SECURITY] Truecaller signature verification failed for: ${profileObj.phoneNumber || profileObj.phone}`);
      throw new HttpsError("unauthenticated", "Truecaller signature verification failed.");
    }

    // 5. Extract User Data
    const phone = profileObj.phoneNumber || profileObj.phone;
    const name = (profileObj.firstName || 'User') + (profileObj.lastName ? ' ' + profileObj.lastName : '');
    
    if (!phone) {
      throw new HttpsError("invalid-argument", "Truecaller profile missing phone number.");
    }

    const formattedPhone = phone.startsWith('+') ? phone : '+' + phone;
    
    // 6. Firebase Native Auth Integration
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

    // 7. Generate Custom Token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    
    return { 
      token: customToken,
      phone: formattedPhone,
      name: name,
      uid: userRecord.uid
    };

  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("Error verifying Truecaller login:", error);
    throw new HttpsError("internal", "An internal error occurred during verification.");
  }
});
