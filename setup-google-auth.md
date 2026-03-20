# Quick Google Auth Setup

## ⚡ Quick Start (5 minutes)

### 1. Get Google Client ID
1. Visit: https://console.cloud.google.com/apis/credentials
2. Create new OAuth 2.0 Client ID
3. Add authorized origins: `http://localhost:3000` and `http://localhost:5173`
4. Copy your Client ID

### 2. Configure Frontend
```bash
cd frontend
echo "VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com" > .env
```

### 3. Configure Backend
```bash
cd intelliclaim-vision-backend
echo "GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com" >> .env
```

### 4. Restart Servers
The servers should already be running. If not:
```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2  
cd intelliclaim-vision-backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test It!
1. Go to http://localhost:3000
2. Click Login/Sign Up
3. Click "Sign in with Google"
4. Done! 🎉

---

## 📝 What Was Added

### Frontend Changes:
- ✅ Installed `@react-oauth/google` and `jwt-decode`
- ✅ Added Google OAuth Provider wrapper
- ✅ Added Google Sign-In button with custom styling
- ✅ Implemented automatic token handling
- ✅ Added user profile picture support

### Backend Changes:
- ✅ Installed `google-auth` libraries
- ✅ Added `/api/v1/auth/google` endpoint
- ✅ Implemented Google token verification
- ✅ Auto-creates users on first Google sign-in
- ✅ Returns JWT token for session management

### Files Modified:
- `frontend/src/components/auth.tsx` - Added Google Sign-In UI
- `frontend/src/config/api.ts` - Added Google login endpoint
- `intelliclaim-vision-backend/app/main.py` - Added Google auth endpoint
- `frontend/package.json` - Added OAuth dependencies

### Files Created:
- `frontend/.env.example` - Environment template
- `GOOGLE_AUTH_SETUP.md` - Detailed setup guide
- `setup-google-auth.md` - This quick start guide

---

## 🎨 UI Features

The Google Sign-In button:
- Appears below the regular login form
- Has a clean "Or continue with" divider
- Uses Google's official styling
- Shows "Sign in with Google" or "Sign up with Google" based on context
- Fully responsive on mobile devices

---

## 🔐 Security Features

- ✅ Google token verification (optional but recommended)
- ✅ JWT token generation for session management
- ✅ Secure password generation for Google users
- ✅ Email verification through Google
- ✅ Profile picture support
- ✅ Automatic user creation with proper defaults

---

## 📱 User Experience

1. User clicks "Sign in with Google"
2. Google popup appears
3. User selects account
4. Grants permissions
5. Automatically logged in
6. Redirected to dashboard
7. Profile picture displayed (if available)

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Get production Google Client ID
- [ ] Add production domain to authorized origins
- [ ] Enable HTTPS
- [ ] Set up proper environment variables
- [ ] Enable Google token verification
- [ ] Add rate limiting
- [ ] Implement proper error logging
- [ ] Add analytics tracking
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

---

## 💡 Tips

1. **Testing**: Use your personal Google account for testing
2. **Multiple Accounts**: Google Sign-In supports account switching
3. **Profile Pictures**: Automatically fetched from Google
4. **Email Verified**: Google accounts are pre-verified
5. **Fast Login**: No password needed for returning users

---

## 🎯 Next Features to Add

- [ ] Sign out functionality
- [ ] Account linking (connect Google to existing account)
- [ ] GitHub OAuth
- [ ] Microsoft OAuth
- [ ] Apple Sign-In
- [ ] Two-factor authentication
- [ ] Session management
- [ ] Remember me functionality

---

**Ready to test?** Just add your Google Client ID to the `.env` files and refresh the page!
