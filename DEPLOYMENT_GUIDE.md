# Deployment Guide for IntelliClaim

To successfully deploy the backend and frontend to Vercel and GitHub, follow these steps:

## 1. Vercel Environment Variables

Set the following secrets/environment variables in your Vercel project settings:

### Backend Project:
- `DATABASE_URL`: Your PostgreSQL connection string (from Supabase, Neon, or Vercel Postgres).
- `JWT_SECRET`: A strong random string for signing access tokens.
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
- `CORS_ORIGINS`: Set this to `https://intelliclaim-xi.vercel.app`.
- `GEMINI_API_KEY`: Your Google Gemini API Key.

### Frontend Project:
- `VITE_GOOGLE_CLIENT_ID`: Same as above.
- `VITE_API_BASE_URL`: (Optional) Can be the full URL of your backend or leave blank if using the proxied `/api`.

## 2. GitHub Secrets

For the GitHub Action to work, add these secrets to your repository (`Settings > Secrets and variables > Actions`):
- `VERCEL_TOKEN`: Your Vercel API Personal Access Token.
- `DATABASE_URL`: PostgreSQL URL for migration tests.
- `JWT_SECRET`: Same as above.
- `GOOGLE_CLIENT_ID`: Same as above.

## 3. Google Cloud Console Whitelisting

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project.
3. Go to `APIs & Services > Credentials`.
4. Edit your OAuth 2.0 Client ID.
5. Add your production URLs to **Authorized JavaScript origins**:
   - `https://intelliclaim-xi.vercel.app`
6. Add your production redirect URIs to **Authorized redirect URIs** if needed (usually just the origin is enough for the popup flow).

## 4. Final Verification

Once deployed, verify:
- [ ] Login/Signup works (persists to PostgreSQL).
- [ ] Google Login works (creates user in database).
- [ ] Document processing (uses Gemini Flash API).
- [ ] Claim Analyzer (uses AI models).
