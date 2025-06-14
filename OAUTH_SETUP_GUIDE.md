# Google OAuth Consent Screen Setup Guide

This guide walks you through configuring the OAuth consent screen for the Cambridge Math Tracker application.

## Prerequisites
- Firebase project already created
- Google Authentication provider enabled in Firebase Console
- Access to Google Cloud Console

## Step-by-Step Configuration

### 1. Access Google Cloud Console

1. **Open Google Cloud Console**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Select Your Project**
   - In the top navigation bar, click the project dropdown
   - Select the same project that your Firebase project uses
   - The project name should match your Firebase project

### 2. Navigate to OAuth Consent Screen

1. **Open APIs & Services**
   - In the left sidebar, click "APIs & Services"
   - Select "OAuth consent screen"

2. **Choose User Type**
   - Select "External" (to allow any Gmail user to sign in)
   - Click "CREATE"

### 3. Configure OAuth Consent Screen

#### App Information Section

1. **App Name**
   ```
   Cambridge Math Tracker
   ```

2. **User Support Email**
   - Select your email address from the dropdown

3. **App Logo** (Optional)
   - Upload a logo if you have one (120x120px recommended)
   - Skip if not available

4. **App Domain** (Optional for testing)
   - Leave blank for development/testing

5. **Authorized Domains**
   ```
   vercel.app
   ```
   - Add `vercel.app` for Vercel deployment
   - Add your custom domain if you have one

6. **Developer Contact Information**
   - Enter your email address

#### Scopes Section

1. **Click "ADD OR REMOVE SCOPES"**

2. **Select Required Scopes**
   - Check: `.../auth/userinfo.email`
   - Check: `.../auth/userinfo.profile`
   - Check: `openid`

3. **Click "UPDATE"**

#### Test Users Section (Development Only)

1. **Add Test Users**
   - Click "ADD USERS"
   - Add Gmail addresses that need access during development
   - Include your own Gmail address
   - Include any other developers' Gmail addresses

2. **Save Test Users**
   - Click "SAVE AND CONTINUE"

### 4. Review and Submit

1. **Review Summary**
   - Check all information is correct
   - Verify scopes are minimal (email, profile, openid only)

2. **Save Configuration**
   - Click "SAVE AND CONTINUE"

### 5. Publishing for Production

#### For Development/Testing
- Your app can remain in "Testing" mode
- Only test users can access the application
- No verification needed

#### For Production
1. **Publish App**
   - Click "PUBLISH APP" in the OAuth consent screen
   - Your app will be available to all Gmail users

2. **Verification (if required)**
   - Google may require verification for certain scopes
   - For basic profile/email scopes, verification is usually not required

## Configuration Summary

Here's what you should have configured:

```yaml
App Information:
  Name: Cambridge Math Tracker
  User Type: External
  Authorized Domains: vercel.app

Scopes:
  - userinfo.email
  - userinfo.profile  
  - openid

Status: Testing (or Published for production)
```

## Common Issues and Solutions

### Issue: "Error 403: access_denied"
**Solution:** Add your Gmail address to test users list

### Issue: "Error 400: redirect_uri_mismatch"
**Solution:** Check that your domain is added to authorized domains

### Issue: "This app isn't verified"
**Solution:** 
- For development: Add users to test users list
- For production: Submit for verification if required

### Issue: Domain verification required
**Solution:** 
- Add domain to Google Search Console
- Verify ownership following Google's instructions

## Firebase Integration

After completing OAuth setup:

1. **Update Firebase Configuration**
   - No changes needed in Firebase Console
   - OAuth settings are automatically applied

2. **Test Authentication**
   - Deploy your app or test locally
   - Verify Google sign-in works with test users

## Security Notes

- **Minimize Scopes:** Only request email and profile information
- **Test Users:** Keep test user list minimal and secure
- **Domain Security:** Only add domains you control
- **Regular Review:** Periodically review and update settings

## Troubleshooting Checklist

- [ ] Project selected correctly in Google Cloud Console
- [ ] OAuth consent screen configured with correct app name
- [ ] Authorized domains include your deployment domain
- [ ] Test users added (for development)
- [ ] Scopes limited to email, profile, openid
- [ ] Firebase project matches Google Cloud project

## Next Steps

1. Complete OAuth consent screen setup using this guide
2. Test the authentication flow with the provided code
3. Deploy to Vercel and verify production authentication works
4. Add additional test users or publish for production as needed

---

**Need Help?**
- Firebase Authentication docs: https://firebase.google.com/docs/auth
- Google Cloud OAuth docs: https://cloud.google.com/docs/authentication