# Authentication Testing Guide

This guide provides comprehensive testing instructions for the Cambridge Math Tracker authentication system.

## Prerequisites

1. **OAuth Consent Screen Setup Complete**
   - Follow `OAUTH_SETUP_GUIDE.md` first
   - Add your Gmail as a test user
   - Ensure Firebase project is configured

2. **Environment Variables**
   ```bash
   # Copy and configure environment variables
   cp .env.local.example .env.local
   
   # Add your Firebase configuration to .env.local
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## Testing Checklist

### Phase 1: Basic Authentication Flow

#### Test 1: Login Flow
- [ ] **Access Application**: Go to `http://localhost:3000`
- [ ] **Redirect to Login**: Verify redirect to `/login` page
- [ ] **Login UI**: Confirm clean, iPad-optimized login interface
- [ ] **Google Sign-In**: Click "Continue with Google" button
- [ ] **OAuth Popup**: Verify Google OAuth popup opens
- [ ] **Gmail Restriction**: Try non-Gmail account (should fail)
- [ ] **Successful Login**: Login with Gmail account
- [ ] **Dashboard Redirect**: Verify redirect to main dashboard
- [ ] **User Info Display**: Check user name and avatar in header

#### Test 2: Session Persistence
- [ ] **Refresh Page**: Reload browser, verify still logged in
- [ ] **New Tab**: Open new tab to same URL, verify authenticated
- [ ] **Browser Restart**: Close and reopen browser, verify session persists

#### Test 3: Logout Flow
- [ ] **User Menu**: Click user avatar/menu in header
- [ ] **Logout Button**: Click "Sign Out" in dropdown
- [ ] **Immediate Logout**: Verify immediate redirect to login
- [ ] **Session Clear**: Refresh page, verify still logged out
- [ ] **Re-login**: Login again to verify logout was complete

### Phase 2: Route Protection

#### Test 4: Protected Routes
- [ ] **Main Dashboard** (`/`): Requires authentication
- [ ] **Assessment Taking** (`/assessment/[day]`): Requires authentication  
- [ ] **Results Page** (`/results`): Requires authentication
- [ ] **Tutor Dashboard** (`/tutor`): Requires tutor role
- [ ] **Login Page** (`/login`): Accessible when logged out

#### Test 5: Role-Based Access
- [ ] **Student Access**: Login as student, verify can't access `/tutor`
- [ ] **Tutor Role Assignment**: Set user role to 'tutor' in Firestore
- [ ] **Tutor Access**: Verify tutor can access `/tutor` page
- [ ] **Role Display**: Check role shows correctly in user menu

### Phase 3: Data Isolation

#### Test 6: User-Specific Data
- [ ] **Assessment Responses**: Take assessment, verify saved under user email
- [ ] **Progress Tracking**: Check analytics are user-specific
- [ ] **Data Separation**: Login as different user, verify separate data
- [ ] **No Data Leakage**: Confirm users can't see each other's responses

#### Test 7: Database Structure
- [ ] **Firestore Collections**: Verify correct collection structure:
  ```
  users/
    {userEmail}/
      displayName, email, role, lastLogin
      
  userResponses/
    {userEmail}/
      responses/
        {responseId}/ - assessment responses
        
  userAnalytics/
    {userEmail}/ - progress analytics
    
  assessments/ - shared assessment data
  ```

### Phase 4: iPad Compatibility

#### Test 8: iPad Safari Testing
- [ ] **Touch Interface**: All buttons minimum 44px touch targets
- [ ] **Login Experience**: Google OAuth works in Safari popup
- [ ] **Canvas Drawing**: Digital canvas works with touch/Apple Pencil
- [ ] **Navigation**: Touch-friendly navigation throughout app
- [ ] **Responsive Design**: Interface adapts to portrait/landscape
- [ ] **No Zoom Issues**: Prevent accidental zoom during use

#### Test 9: Performance on iPad
- [ ] **Loading Speed**: Pages load quickly on iPad Safari
- [ ] **Smooth Animations**: No lag in transitions or animations
- [ ] **Memory Usage**: No excessive memory consumption
- [ ] **Canvas Performance**: Drawing at 60fps without lag

### Phase 5: Error Handling

#### Test 10: Network Issues
- [ ] **Offline Login**: Graceful handling when network unavailable
- [ ] **Firebase Errors**: Appropriate error messages for service issues
- [ ] **Token Expiry**: Automatic re-authentication when needed
- [ ] **API Failures**: User-friendly error messages for API issues

#### Test 11: Edge Cases
- [ ] **Popup Blocked**: Clear message when OAuth popup blocked
- [ ] **Cancelled Login**: Handle user cancelling OAuth flow
- [ ] **Invalid Tokens**: Handle corrupted authentication tokens
- [ ] **Concurrent Sessions**: Multiple tabs/devices with same user

### Phase 6: Security Testing

#### Test 12: Authentication Security
- [ ] **Gmail Restriction**: Only Gmail accounts can authenticate
- [ ] **Token Security**: No sensitive tokens exposed in client
- [ ] **Session Security**: Secure session management
- [ ] **Data Access**: Users can only access their own data

#### Test 13: API Security
- [ ] **Authentication Required**: API endpoints require valid user
- [ ] **User Isolation**: API enforces user-specific data access
- [ ] **Input Validation**: Proper validation of user inputs
- [ ] **Error Disclosure**: No sensitive information in error messages

## Testing Tools

### Browser Developer Tools
```javascript
// Check authentication state in console
localStorage.getItem('firebase:authUser')

// Check current user
firebase.auth().currentUser

// Test user role
await fetch('/api/analytics?userEmail=test@gmail.com')
```

### Firebase Console
- Monitor user authentication events
- Check Firestore data structure
- Verify security rules are working
- Review authentication logs

### Network Tab
- Verify API calls include authentication
- Check for proper error handling
- Monitor data transfer sizes
- Ensure no credentials in URLs

## Common Issues & Solutions

### Issue: "Error 403: access_denied"
**Cause**: User not in test users list
**Solution**: Add user to OAuth consent screen test users

### Issue: "Popup blocked"
**Cause**: Browser blocking OAuth popup
**Solution**: Allow popups for your domain

### Issue: "User not authenticated" errors
**Cause**: Token expiry or storage issues
**Solution**: Clear localStorage and re-login

### Issue: iPad canvas not working
**Cause**: Touch events not properly handled
**Solution**: Verify `touch-action: none` on canvas

### Issue: Data not loading
**Cause**: User email not properly passed to API
**Solution**: Check network tab for correct API calls

## Performance Benchmarks

### Target Performance Metrics
- **Login Time**: < 3 seconds from click to dashboard
- **Page Load**: < 2 seconds for any page
- **Canvas Response**: < 50ms touch-to-draw latency
- **API Response**: < 1 second for data fetching

### Monitoring
- Use browser dev tools Performance tab
- Monitor Firebase usage in console
- Track API response times
- Test with throttled network speeds

## Security Checklist

### Authentication Security
- [ ] Only Gmail accounts can access
- [ ] No credentials stored in localStorage
- [ ] Tokens properly secured
- [ ] Session timeout handled gracefully

### Data Security
- [ ] User data properly isolated
- [ ] No cross-user data access
- [ ] API endpoints secured
- [ ] Input sanitization working

### Firebase Security
- [ ] Security rules enforced
- [ ] User authentication required
- [ ] Data access properly restricted
- [ ] No anonymous access

## Deployment Testing

### Pre-Deployment
- [ ] All tests pass in development
- [ ] Build completes without errors
- [ ] Environment variables configured
- [ ] Firebase project ready for production

### Post-Deployment
- [ ] OAuth consent screen configured for production domain
- [ ] All authentication flows work on deployed site
- [ ] iPad Safari compatibility confirmed
- [ ] Performance meets benchmarks

---

**Testing Complete**: ✅ All tests passed - Ready for production deployment

**Issues Found**: Document any issues and solutions in this section