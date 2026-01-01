# Quick Admin Setup

Since you already have Firebase Auth accounts, you just need to sync the Firestore documents.

## Option 1: Use Script (Fastest)

1. **Get Service Account Key:**
   - Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in project root

2. **Install Firebase Admin:**
   ```bash
   npm install firebase-admin
   ```

3. **Run Script:**
   ```bash
   node scripts/check-and-create-admin.js
   ```

This will check all 3 accounts and create Firestore documents if missing.

---

## Option 2: Manual (Firestore Console)

For each of your 3 emails, create a Firestore document:

1. **Firestore Console → `users` collection**
2. **Click "Add document"**
3. **Document ID:** Copy UID from Authentication tab
4. **Fields:**
   ```
   email: "lab91820@gmail.com"
   name: "Lab Admin"
   role: "admin"
   createdAt: [click "Add field" → type: timestamp → click clock icon for now]
   ```
5. **Repeat for other 2 emails**

---

## After Setup

1. Login at http://localhost:9002/login
2. Go to /admin/admins to create more admins through UI
3. Delete this scripts folder if you want!
