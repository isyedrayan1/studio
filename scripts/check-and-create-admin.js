// Quick script to check and create Firestore user document for existing Firebase Auth account
// Run with: node scripts/check-and-create-admin.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you need serviceAccountKey.json)
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function checkAndCreateAdmin(email) {
  try {
    // Check if Firebase Auth user exists
    const authUser = await auth.getUserByEmail(email);
    console.log(`✅ Firebase Auth user exists: ${email} (UID: ${authUser.uid})`);
    
    // Check if Firestore document exists
    const userDoc = await db.collection('users').doc(authUser.uid).get();
    
    if (userDoc.exists) {
      console.log(`✅ Firestore document exists for ${email}`);
      console.log('Data:', userDoc.data());
    } else {
      console.log(`❌ Firestore document missing for ${email}`);
      console.log('Creating now...');
      
      // Create Firestore document
      await db.collection('users').doc(authUser.uid).set({
        email: authUser.email,
        name: authUser.email.split('@')[0], // Use email prefix as name
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`✅ Created Firestore document for ${email}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${email}:`, error.message);
  }
}

async function main() {
  console.log('Checking admin accounts...\n');
  
  // Check all your admin emails
  const adminEmails = [
    'lab91820@gmail.com',
    'mesyednr@gmail.com',
    'mesyedrn@gmail.com'
  ];
  
  for (const email of adminEmails) {
    await checkAndCreateAdmin(email);
    console.log('---\n');
  }
  
  console.log('Done! You can now login.');
  process.exit(0);
}

main();
