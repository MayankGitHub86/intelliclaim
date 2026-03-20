# 🔐 Google Authentication Setup Guide

## Overview
This guide will help you set up Google OAuth authentication for IntelliClaim.

---

## 📋 Prerequisites
- Google Account
- Access to Google Cloud Console

---

## 🚀 Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `IntelliClaim` (or your preferred name)
4. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (for testing) or "Internal" (for organization)
3. Click "Create"
4. Fill in the required information:
   - **App name**: IntelliClaim
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `email`
   - `profile`
   - `openid`
8. Click "Save and Continue"
9. Add test users (your email addresses for testing)
10. Click "Save and Continue"

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name**: IntelliClaim Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:5173`
     - Add your production domain when ready
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `http://localhost:5173`
     - Add your production domain when ready
5. Click "Create"
6. **IMPORTANT**: Copy your Client ID (looks like: `xxxxx.apps.googleusercontent.com`)

### 5. Configure Frontend

1. Create `.env` file in the `frontend` directory:
```bash
cd frontend
cp .env.example .env
```

2. Edit `frontend/.env` and add your Google Client ID:
```env
VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:8000
```

### 6. Configure Backend

1. Edit `intelliclaim-vision-backend/.env` and add:
```env
GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
```

### 7. Restart Servers

```bash
# Stop current servers (Ctrl+C in terminals)

# Terminal 1: Start Frontend
cd frontend
npm run dev

# Terminal 2: Start Backend
cd intelliclaim-vision-backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## ✅ Testing Google Authentication

1. Open your browser and go to `http://localhost:3000`
2. Click on "Login" or "Sign Up"
3. You should see a "Sign in with Google" button
4. Click it and select your Google account
5. Grant permissions
6. You should be logged in automatically!

---

## 🔒 Security Best Practices

### For Development:
- ✅ Use `http://localhost` for testing
- ✅ Keep your Client ID in `.env` files (not committed to git)
- ✅ Add `.env` to `.gitignore`

### For Production:
- ✅ Use HTTPS only
- ✅ Add your production domain to authorized origins
- ✅ Enable token verification in backend
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting
- ✅ Add CSRF protection
- ✅ Monitor authentication logs

---

## 🐛 Troubleshooting

### "Invalid Client ID" Error
- **Solution**: Double-check your Client ID in `.env` file
- Make sure there are no extra spaces or quotes

### "Redirect URI Mismatch" Error
- **Solution**: Add your exact URL to "Authorized redirect URIs" in Google Console
- Include the port number (e.g., `http://localhost:3000`)

### "Access Blocked" Error
- **Solution**: Add your email as a test user in OAuth consent screen
- Or publish your app (for production)

### Google Button Not Showing
- **Solution**: Check browser console for errors
- Verify `@react-oauth/google` is installed: `npm list @react-oauth/google`
- Clear browser cache and reload

### Backend Authentication Fails
- **Solution**: Check backend logs for errors
- Verify `google-auth` is installed: `pip list | grep google-auth`
- Ensure `.env` file has correct `GOOGLE_CLIENT_ID`

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)

---

## 🎯 What's Implemented

### Frontend:
- ✅ Google OAuth Provider wrapper
- ✅ Google Sign-In button in auth component
- ✅ JWT token decoding
- ✅ Automatic user creation/login
- ✅ Error handling and user feedback

### Backend:
- ✅ Google token verification endpoint
- ✅ Automatic user creation for new Google users
- ✅ JWT token generation
- ✅ User profile management
- ✅ Secure password handling for Google users

---

## 🚀 Next Steps

1. **Test the authentication flow**
2. **Add user profile pictures** (already supported!)
3. **Implement "Sign out" functionality**
4. **Add more OAuth providers** (GitHub, Microsoft, etc.)
5. **Deploy to production** with HTTPS

---

**Need Help?** Check the troubleshooting section or open an issue on GitHub!
