# 🔥 Firebase Setup Instructions

## 📋 What You Need

Your Firebase configuration details from the backend `.env` file will be used for the frontend.

## 🚀 Setup Steps

### 1. Create Frontend Environment File

Create a file `frontend/.env.local` with these values:

```env
# Get these from your Firebase Console (same project as backend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Get Firebase Values

**From Firebase Console** (https://console.firebase.google.com/):

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. If no web app exists:
   - Click "Add app" → Web (</>) icon
   - Register app
4. You'll see the config object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",              // → NEXT_PUBLIC_FIREBASE_API_KEY
     authDomain: "...",
     projectId: "your-project-id",    // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
     storageBucket: "...",
     messagingSenderId: "123456",     // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     appId: "1:123:web:abc"          // → NEXT_PUBLIC_FIREBASE_APP_ID
   };
   ```

### 3. Enable Authentication

In Firebase Console:

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (add your email as authorized domain)

### 4. Add Authorized Domains

In **Authentication** → **Settings** → **Authorized domains**:
- Add `localhost`
- Add your production domain later

### 5. Install Dependencies

```bash
cd frontend
pnpm install
```

### 6. Run the Frontend

```bash
pnpm dev
```

## ✅ Testing the Auth Flow

### Sign Up Flow:
1. Click "Create Account"
2. Enter **Name** and **Company** first
3. Then enter **Email** and **Password**
4. Account created and logged in!

### Google Sign In Flow:
1. Click "Continue with Google"
2. Choose Google account
3. If new user: Enter **Name** and **Company**
4. Logged in!

### Sign In Flow:
1. Click "Sign In with Email"
2. Enter credentials
3. Logged in!

## 🔗 Where Files Are Located

```
frontend/
├── lib/
│   └── firebase.ts          # ✅ Firebase setup & auth functions
├── components/
│   └── auth-modal.tsx       # ✅ Updated with Firebase integration
├── .env.local               # ❌ YOU NEED TO CREATE THIS
└── FIREBASE_SETUP.md        # 📖 This file
```

backend/
├── .env                     # Your Firebase service account details
└── src/
    ├── config/
    │   └── firebase.js      # ✅ Firebase Admin SDK
    ├── routes/
    │   └── auth.js          # ✅ Updated for Firebase Auth
    └── middleware/
        └── auth.js          # ✅ Firebase token verification
```

## 🎯 New Auth Flow

### Old Flow (Removed):
```
SignUp → Email & Password → Profile Details
```

### New Flow (Current):
```
Choice Screen
├─ Google → [Auto Profile] or [Enter Profile] → Done
├─ Create Account → Profile Details → Email & Password → Done
└─ Sign In → Email & Password → Done
```

## 🔥 Features

- ✅ Google Sign-In with beautiful Google icon
- ✅ Profile details collected FIRST (better UX)
- ✅ Firebase Auth handles all authentication
- ✅ Backend verifies Firebase tokens
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Smooth animations between steps

## 🐛 Troubleshooting

**Error: "Firebase not configured"**
- Make sure `.env.local` exists in `frontend/` folder
- Restart dev server after creating `.env.local`

**Error: "Firebase Auth domain not authorized"**
- Add `localhost` to authorized domains in Firebase Console

**Error: "User not found"**
- Backend and frontend must use the same Firebase project
- Check `FIREBASE_PROJECT_ID` matches in both `.env` files

## 📱 Next Steps

After authentication works:
1. Create dashboard page at `frontend/app/dashboard/page.tsx`
2. Add protected route middleware
3. Build recruiter features
4. Add applicant flow

---

**🎉 Your auth is now fully Firebase-powered!**

