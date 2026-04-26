# How to Secure Your Billing App - Integration Guide

## Step 1: Add Security Headers to HTML

Add these meta tags in the `<head>` section, right after the basic meta tags:

```html
<!-- Security Headers -->
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://cdn.sheetjs.com https://accounts.google.com https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://accounts.google.com https://www.googleapis.com https://drive.google.com;
    frame-src https://accounts.google.com;
">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

## Step 2: Add Security Module Script

Add this script tag BEFORE your existing main script, but AFTER the external libraries:

```html
<!-- Security Enhancement Module - LOAD FIRST -->
<script src="security-module.js"></script>
```

## Step 3: Update Your Existing Code

### 3.1 Replace localStorage calls with SecureStorage

Find all instances of:
```javascript
localStorage.setItem(key, value)
localStorage.getItem(key)
localStorage.removeItem(key)
```

Replace with:
```javascript
SecureStorage.setItem(key, value, AuthManager.currentUser?.email)
SecureStorage.getItem(key, AuthManager.currentUser?.email)
SecureStorage.removeItem(key, AuthManager.currentUser?.email)
```

### 3.2 Sanitize All User Inputs

Find all places where user input is displayed in HTML. For example:

**BEFORE:**
```javascript
billHtml += `<strong>${clientName}</strong>`;
```

**AFTER:**
```javascript
billHtml += `<strong>${SecurityUtils.sanitizeHTML(clientName)}</strong>`;
```

Apply sanitization to:
- Client names
- Product names
- Notes/descriptions
- Any user-entered text

### 3.3 Add Rate Limiting to API Calls

Before making Google Drive API calls, add:

```javascript
if (!RateLimiter.isAllowed('google_drive_upload')) {
    showToast('تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً', 'error');
    return;
}
```

### 3.4 Initialize Security on App Start

Find your `init()` function and add security initialization at the very beginning:

```javascript
async function init() {
    // Initialize security FIRST
    if (!SecurityInit()) {
        // Authentication required but user not logged in
        // SecurityInit will show login screen
        return;
    }

    // ... rest of your initialization code
}
```

## Step 4: Update Google Sign-In Configuration

### 4.1 Get Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add your GitHub Pages URL to "Authorized JavaScript origins":
   - `https://yourusername.github.io`
6. Add redirect URI:
   - `https://yourusername.github.io/your-repo-name`
7. Copy the Client ID

### 4.2 Update Security Config

In `security-module.js`, replace:
```javascript
GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com'
```

With your actual Client ID.

### 4.3 Add Google Sign-In Script

Make sure this is in your HTML head:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

## Step 5: Specific Code Changes

### Change 1: Sanitize Client Name Input

Find the function that handles client name (around line 2636):
```javascript
function confirmClientName() {
    const input = document.getElementById('billClientName');
    // OLD: appState.currentBillClientName = input ? input.value.trim() : '';
    // NEW:
    appState.currentBillClientName = input ? 
        SecurityUtils.sanitizeClientName(input.value) : '';
    appState.billStep = 'items';
    render();
}
```

### Change 2: Sanitize Bill Items

When creating bill items, sanitize the category names:
```javascript
// In your bill generation code
items.forEach(item => {
    const sanitizedCategory = SecurityUtils.sanitizeHTML(item.category);
    const sanitizedSize = SecurityUtils.sanitizeNumber(item.size);
    const sanitizedQuantity = SecurityUtils.sanitizeNumber(item.quantity);
    const sanitizedPrice = SecurityUtils.sanitizeNumber(item.price);
    // ... use sanitized values
});
```

### Change 3: Add Rate Limiting to Save Functions

```javascript
async function saveBill() {
    // Add rate limiting
    if (!RateLimiter.isAllowed('save_bill')) {
        showToast('عدد كبير جداً من عمليات الحفظ. انتظر قليلاً', 'error');
        return;
    }

    // Audit log
    AuditLog.log('bill_saved', { 
        clientName: appState.currentBillClientName 
    });

    // ... rest of save logic
}
```

### Change 4: Add Logout Button

Add a logout button to your UI:
```javascript
function renderHeader() {
    return `
        <div class="flex justify-between items-center">
            <h1>نظام الفواتير</h1>
            <div class="flex items-center gap-4">
                ${AuthManager.currentUser ? `
                    <span class="text-sm">
                        ${SecurityUtils.sanitizeHTML(AuthManager.currentUser.name)}
                    </span>
                    <button onclick="AuthManager.logout()" 
                            class="text-sm text-red-600 hover:text-red-800">
                        تسجيل الخروج
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}
```

## Step 6: Environment Configuration

Create a `.env.example` file for GitHub (DO NOT include actual credentials):

```
# Google Cloud Configuration
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com

# Security Settings
SESSION_TIMEOUT=1800000
RATE_LIMIT_MAX_REQUESTS=100
ENCRYPTION_ENABLED=true
REQUIRE_AUTH=true
```

Add to `.gitignore`:
```
# Environment files with actual credentials
.env
config.local.js
*secret*
*credential*
```

## Step 7: Testing

1. **Test Authentication:**
   - Open the app → should show Google Sign-In
   - Sign in → should load the app
   - Wait 30 minutes inactive → should auto-logout

2. **Test Input Sanitization:**
   - Try entering `<script>alert('XSS')</script>` as client name
   - Should display as plain text, not execute

3. **Test Rate Limiting:**
   - Try saving bills rapidly
   - Should show rate limit message after 100 requests/hour

4. **Test Data Isolation:**
   - Sign in as User A, create bills
   - Sign out, sign in as User B
   - User B should not see User A's bills

## Step 8: Deployment Checklist

- [ ] Replace placeholder Google Client ID with real one
- [ ] Enable HTTPS on GitHub Pages (Settings → Pages → Enforce HTTPS)
- [ ] Test on HTTPS URL (not localhost)
- [ ] Verify Google OAuth redirect URIs match your domain
- [ ] Set Google Drive folder permissions to private
- [ ] Review OAuth consent screen settings
- [ ] Test all security features
- [ ] Monitor audit logs for suspicious activity

## Additional Security Recommendations

1. **GitHub Repository:**
   - Make repo private if possible
   - Never commit credentials
   - Use GitHub Secrets for any CI/CD

2. **Google Cloud:**
   - Restrict API key to your domain only
   - Enable OAuth consent screen
   - Review access logs regularly
   - Set up budget alerts

3. **Monitoring:**
   - Check audit logs weekly: `AuditLog.getLogs()`
   - Monitor for failed login attempts
   - Watch for rate limit violations

4. **User Education:**
   - Tell users to sign out when done
   - Warn about using on public computers
   - Recommend using strong Google passwords
   - Enable 2FA on Google accounts

## Troubleshooting

**Login screen loops infinitely:**
- Check browser console for errors
- Verify Google Client ID is correct
- Check that callback URL matches OAuth settings

**"Rate limit exceeded" errors:**
- Normal after 100 operations/hour
- Wait or increase limit in config
- Check for infinite loops in code

**Data not persisting:**
- Check if user is authenticated
- Verify localStorage is enabled
- Check browser console for errors

**"Session timeout" too frequent:**
- Increase SESSION_TIMEOUT in config
- Check activity monitoring is working
- Verify no browser extensions blocking events

## Support

For issues or questions:
1. Check browser console for errors
2. Review audit logs: `AuditLog.getLogs()`
3. Check rate limiter: `RateLimiter.getRemaining()`
4. Verify authentication: `AuthManager.isAuthenticated()`
