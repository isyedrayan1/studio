/**
 * One-time script to set admin custom claims on Firebase Auth users
 * 
 * Run this once to make your Firebase Auth users admins:
 * node scripts/set-admin-claims.js
 * 
 * Requires: npm install firebase-admin
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need your service account key)
// Download from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const ADMIN_EMAILS = [
  'lab91820@gmail.com',
  'mesyednr@gmail.com',
  'mesyedrn@gmail.com'
];

async function setAdminClaims() {
  try {
    for (const email of ADMIN_EMAILS) {
      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      console.log(`✅ Set admin claim for: ${email}`);
    }
    console.log('\n🎉 All done! Your admins are ready.');
  } catch (error) {
    console.error('❌ Error:', error);
  }
  process.exit();
}

setAdminClaims();
