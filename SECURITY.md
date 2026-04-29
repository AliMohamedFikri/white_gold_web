# Security Audit Report
## White Gold Factory Management System

This document tracks all security issues identified and their current remediation status across three rounds of hardening work.

---

## Round 1 — Initial Audit

### Critical Vulnerabilities

#### 1. Cross-Site Scripting (XSS)
- **Location:** All render functions (global).
- **Issue:** The application rendered HTML from user-controlled data via template literals with no sanitization. Fields such as company name, client name, category names, and bill notes were injected directly into `innerHTML`.
- **Risk:** 🔴 **High.** A crafted string like `<script>alert(1)</script>` entered as a client name would execute in any browser viewing that bill.
- **Status:** ✅ **FIXED** — All dynamic user-controlled outputs in render functions are now wrapped in `escapeHtml()`. Covered fields include:
  - `appState.companySettings.name / phone / address / footer`
  - `model.pricingModelName`
  - `bill.billNumber / billClientName`
  - `cat.name` in pricing tables
  - `item.category` in bill item tables
  - Monthly analysis labels
  - `getEntryTitle()` output in the storage viewer

#### 2. Insecure Password Storage
- **Location:** `localStorage` / `handleLogin`.
- **Issue:** User passwords were stored in plain text in browser localStorage.
- **Status:** ✅ **N/A** — The app was migrated to Google Identity Services (GIS) OAuth 2.0. No passwords are stored anywhere.

---

### Best Practice Improvements

#### 3. Content Security Policy (CSP)
- **Issue:** No CSP was defined, allowing any script or resource origin.
- **Status:** ✅ **IMPLEMENTED** — CSP `<meta>` tag now enforces:
  - `object-src 'none'` — blocks Flash/Java plugins
  - `base-uri 'self'` — prevents base tag injection attacks
  - `form-action 'self'` — prevents form-based data exfiltration
  - Strict `script-src`, `style-src`, `img-src`, `connect-src`, `frame-src` allowlists
  - Note: `unsafe-eval` is still required by the Tailwind Play CDN runtime compiler. This can be eliminated by switching to a Tailwind CLI pre-built CSS file.

#### 4. Subresource Integrity (SRI)
- **Issue:** CDN-hosted scripts loaded without integrity checks.
- **Status:** ✅ **IMPLEMENTED** — SRI `integrity` + `crossorigin` attributes added to all CDN script tags:
  - `html2pdf.bundle.min.js` (lazy-loaded)
  - `xlsx.full.min.js` (lazy-loaded)
  - Note: `cdn.tailwindcss.com` and `accounts.google.com/gsi/client` do not serve CORS headers, making SRI technically unenforceable on them. The CSP allowlist provides equivalent tamper protection for those two.

#### 5. Tabnapping via `<base target="_blank">`
- **Issue:** A global `<base target="_blank">` allowed new pages to access `window.opener`, enabling the opened page to redirect the original tab.
- **Status:** ✅ **FIXED** — `<base target="_blank">` removed entirely. External links now carry `target="_blank" rel="noopener noreferrer"` individually where needed.

#### 6. Permissions Policy
- **Issue:** No Permissions-Policy header was set, leaving camera, microphone, geolocation, and payment APIs unnecessarily available.
- **Status:** ✅ **IMPLEMENTED** — `<meta http-equiv="Permissions-Policy">` now disables all four.

---

### Additional Hardening

#### 7. Motion Accessibility
- **Issue:** Heavy CSS animations (mesh blobs, orb floats, glow pulses, stagger fades) can cause discomfort for users with vestibular disorders.
- **Status:** ✅ **IMPLEMENTED** — `@media (prefers-reduced-motion: reduce)` disables all animations, transitions, hover transforms, and stagger delays when the user's OS motion preference is set.

#### 8. Performance / Attack Surface Reduction
- **Issue:** Synchronous loading of large CDN scripts (html2pdf ~800 KB, SheetJS ~550 KB) ran on every page visit, increasing the window during which a network-level attacker could inject a script.
- **Status:** ✅ **IMPLEMENTED** — Both libraries are now lazy-loaded (`loadScriptOnce()`) only on first use. Added `dns-prefetch` hints for CDN origins. Reduced Google Fonts weights from 5 to 3.

---

## Round 2 — Security Module & Auth Patch

### Security Module (`security-module.js`) — Full Replacement

| # | What was broken | What was fixed |
|---|---|---|
| SM-1 | `window.handleGoogleSignIn` decoded Google JWTs using `atob()` with no signature verification — a crafted fake JWT payload would have been accepted as a valid login | Removed entirely. The main app's `initTokenClient` OAuth flow does not use this callback |
| SM-2 | `REQUIRE_AUTH: true` caused the module to inject its own conflicting login screen over the main app's Google Drive auth flow | Set to `false` — authentication is handled entirely by the main app |
| SM-3 | Session timeout fired `window.location.reload()` silently, discarding any unsaved bill data | Now dispatches `CustomEvent('securitySessionTimeout')` so the main app's `logout()` function can handle it cleanly |
| SM-4 | `AuthManager.setUser()` expected a Google One Tap JWT payload object — an incompatible format with what the main app produces | Simplified to accept `{ email, name }` — fully compatible with the main app's user object |

### `index.html` Auth Patch — 9 Targeted Changes

| Change | Issue fixed | Risk before fix |
|---|---|---|
| **A** — New internal variables | Laid the foundation for the silent restore flow | — |
| **B** — `authManager.saveSession()` rewrite | Live Google access token was being stored in `localStorage` | Any XSS or compromised CDN script could steal a live Drive token and make API calls on the user's behalf |
| **C** — `validateToken()` helper | No mechanism to check whether a restored token had already expired (Google tokens expire after 1 hour) | Stale tokens caused silent Drive read/write failures with no useful error to the user |
| **D** — `initGoogleAuth()` error callback | The silent restore path had no GIS error handler — a GIS failure left the app stuck on a loading screen | Hung loading screen with no recovery path |
| **E** — `signInWithGoogle()` nonce | No CSRF protection on the OAuth callback | Any page that could invoke the token client could trigger `handleGoogleSignIn` unexpectedly |
| **F** — `tryRestoreSession()` | Page reload always fell back to localStorage mode, ignoring any previously authenticated Drive session | Users were forced to manually sign in on every page reload |
| **G** — `handleGoogleSignIn()` rewrite | Access token stored in `localStorage`; no nonce check; no silent-restore branch | Token theft via XSS; replay attacks on the callback |
| **H** — `buildDriveDataSdk()` split from `initDriveDataSdk()` | `initDriveDataSdk()` always called `findOrCreateDriveFile()` even when the file ID was already known from the restored session | One unnecessary Drive API call on every silent restore (quota waste + latency) |
| **I** — `init()` session restore block | No session restore on app startup | Users had to manually sign in on every page load even when a valid Google session was still active |

---

## Round 3 — Landing Page Architecture Fix

### Issue
The Round 2 patch placed the session restore block inside `init()`, which runs unconditionally on every page load — including for anonymous visitors who only want to view the public landing page. This caused a Google sign-in prompt to appear before the landing page rendered.

### Root Cause
Session restore was treated as a global startup concern rather than an admin-access concern. The public landing page and the admin dashboard have different authentication requirements.

### Fix Applied

**`init()` change:** The session restore block inside `init()` is disabled. The function now unconditionally renders the landing page on startup with no auth check.

```javascript
async function init() {
    initSecurityLayer();
    await initOptionalSdks();
    // ... template loading ...

    // Notify security module of current user if already authenticated
    if (appState.isAuthenticated && window.AuthManager?.setUser) {
        window.AuthManager.setUser(appState.currentUser || { email: '', name: '' });
    }

    _appReady = true;
    _doRender(); // Always starts on landing — no auth check here
}
```

**New `handleAdminAccess()` function:** Session restore is now triggered only when the user explicitly clicks the admin entry button. This is the correct architectural boundary.

```
Anonymous visitor loads page  →  init() runs  →  landing page renders  (no auth)
User clicks "دخول الإدارة"   →  handleAdminAccess() runs  →  tries silent restore
  ├── Restore succeeds  →  dashboard renders  (seamless)
  └── Restore fails     →  login page renders  (graceful fallback)
```

**Landing page button change:** Both the desktop nav button and mobile menu button now call `handleAdminAccess()` instead of setting `appState.currentView` directly.

### Security Impact
This change does not weaken any security control. The admin dashboard still requires a valid Google access token. The only change is *when* the auth check is initiated — deferred from app startup to the moment the user requests admin access.

---

## Cumulative Remediation Summary

| Issue | Risk Level | Status | Round Fixed |
|---|---|---|---|
| XSS via unsanitized innerHTML | 🔴 High | ✅ Fixed | Round 1 |
| Insecure password storage | 🔴 High | ✅ N/A — replaced by GIS OAuth | Round 1 |
| Fake JWT accepted without signature check | 🔴 High | ✅ Fixed | Round 2 |
| Live OAuth token stored in localStorage | 🔴 High | ✅ Fixed | Round 2 |
| No CSRF nonce on OAuth callback | 🟡 Medium | ✅ Fixed | Round 2 |
| Conflicting login screens (module vs app) | 🟡 Medium | ✅ Fixed | Round 2 |
| Missing Content Security Policy | 🟡 Medium | ✅ Fixed | Round 1 |
| Missing Subresource Integrity | 🟡 Medium | ✅ Fixed | Round 1 |
| Tabnapping via `<base target="_blank">` | 🟡 Medium | ✅ Fixed | Round 1 |
| Session restore forced auth on landing page | 🟡 Medium | ✅ Fixed | Round 3 |
| Stale token causing silent Drive failures | 🟡 Medium | ✅ Fixed | Round 2 |
| No session restore on page reload | 🟡 Medium | ✅ Fixed | Round 2 |
| Silent restore had no error handler | 🟡 Medium | ✅ Fixed | Round 2 |
| `session_timeout` causing data loss | 🟡 Medium | ✅ Fixed | Round 2 |
| Unnecessary Drive API call on restore | 🔵 Low | ✅ Fixed | Round 2 |
| Missing Permissions-Policy | 🔵 Low | ✅ Fixed | Round 1 |
| Motion accessibility (vestibular disorders) | 🔵 Low | ✅ Fixed | Round 1 |
| Heavy CDN scripts loaded synchronously | 🔵 Low | ✅ Fixed | Round 1 |

---

## Remaining Known Limitations

These are architectural constraints of a zero-backend, client-side application. They cannot be eliminated without introducing a server.

1. **`unsafe-eval` in CSP** — Required by the Tailwind Play CDN runtime. Eliminate by switching to `tailwind` CLI and serving a pre-built CSS file.

2. **`unsafe-inline` in CSP** — Required because all application logic is in an inline `<script>` block. Eliminate by moving the script to an external `.js` file and using a nonce-based CSP.

3. **Drive file ID in `localStorage`** — The file ID is stored so that session restore does not need an extra Drive search API call. The ID is useless without a valid Google access token, so the risk is low. If you want to remove it, delete `storageSet('wg_drive_id', driveFileId)` from `authManager.saveSession()` and accept one extra Drive API call per session restore.

4. **Third-party CDN scripts** — `html2pdf.js` and `SheetJS` are served from third-party CDNs. SRI hashes protect against tampering in transit. If the CDN origin itself were compromised, a malicious script could access `localStorage` — but the access token is no longer stored there, significantly reducing the impact.

5. **No server-side validation** — All data validation is client-side. A determined user could manipulate `appState` or send arbitrary data to their own Google Drive file. This is acceptable given the single-admin, private-Drive architecture.

---

## Google Cloud Console Checklist

Ensure your OAuth 2.0 Client ID in Google Cloud Console is configured as follows:

- **Authorized JavaScript origins:** `https://YOUR_USERNAME.github.io` only
- **Authorized redirect URIs:** `https://YOUR_USERNAME.github.io/YOUR_REPO` only
- Remove any `http://localhost` entries unless actively needed for local development

This prevents any other website from initiating an OAuth flow that appears to originate from your application.