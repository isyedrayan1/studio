# Setting Up Admin Custom Claims

## One-Time Setup (Required)

Your Firebase Auth users need the `admin: true` custom claim to be recognized as admins.

### Steps:

1. **Download Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project: `esport-ffmclg`
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `scripts/serviceAccountKey.json`

2. **Install Firebase Admin SDK:**
   ```bash
   npm install firebase-admin
   ```

3. **Run the Script:**
   ```bash
   node scripts/set-admin-claims.js
   ```

4. **Done!** Your 3 Firebase Auth users now have admin access.

## What This Does:

Sets custom claim `{ admin: true }` on these users:
- lab91820@gmail.com
- mesyednr@gmail.com  
- mesyedrn@gmail.com

## After Setup:

- Login with any of these emails → Admin Dashboard
- Associates use the separate associate login system
- No Firestore users collection needed!

## Security Note:

**DO NOT commit `serviceAccountKey.json` to git!** 
It's already in `.gitignore`.
