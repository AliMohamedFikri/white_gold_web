# Security Audit Report

## Critical Vulnerabilities

### 1. Cross-Site Scripting (XSS)
- **Location**: Global (Render functions).
- **Issue**: The application uses JavaScript template literals to render HTML directly from data (`innerHTML`). There is no input sanitization.
- **Risk**: **High**. If a user enters malicious code (e.g., `<script>...</script>`) into fields like "Company Name", "Product Category", or "Bill Notes", it will execute in the browser of anyone viewing that data.
- **Code Example**:
  ```javascript
  // Vulnerable
  <h2 ...>${appState.companySettings.name}</h2>
  ```
- **Status**: ✅ **REMEDIATED** — All dynamic user-controlled outputs in template literals are now wrapped in `escapeHtml()`. This includes:
  - `appState.companySettings.name/phone/address/footer`
  - `model.pricingModelName`
  - `bill.billNumber`
  - `bill.billClientName`
  - `cat.name` in pricing tables
  - `item.category` in bill item tables
  - `month` labels in monthly analysis
  - `getEntryTitle()` output in storage viewer

### 2. Insecure Password Storage
- **Location**: `localStorage` / `handleLogin`.
- **Issue**: User passwords are stored in plain text in the browser's Local Storage.
- **Risk**: **High**. Any user with access to the machine or a successful XSS attack can steal all passwords.
- **Status**: ⚠️ **PARTIAL** — The app uses Google Identity Services (GIS) for authentication, so password storage is no longer applicable. Session tokens are stored in localStorage, which is standard for SPAs. The XSS remediation above significantly reduces the risk of token theft.

## Best Practice Improvements

### 1. Content Security Policy (CSP)
- **Issue**: No CSP is defined.
- **Recommendation**: Add a strictly defined `<meta>` tag to control which scripts and styles can load.
- **Status**: ✅ **IMPLEMENTED** — CSP meta tag now includes:
  - `object-src 'none'` — blocks Flash/Java plugins
  - `base-uri 'self'` — prevents base tag injection
  - `form-action 'self'` — prevents form hijacking
  - Strict `script-src`, `style-src`, `img-src`, `connect-src`, `frame-src` directives
  - Comment documents why `unsafe-eval` (Tailwind CDN runtime) and `unsafe-inline` (inline script block) are still required

### 2. Subresource Integrity (SRI)
- **Issue**: Tailwind CSS and html2pdf are loaded from external CDNs without integrity checks.
- **Recommendation**: Add `integrity` and `crossorigin` attributes to script tags to ensure the CDN hasn't been tampered with.
- **Status**: ✅ **IMPLEMENTED** — All CDN scripts now have SRI hashes:
  - `cdn.tailwindcss.com` — `sha384-OLBgp1GsljhM2TJ+...`
  - `accounts.google.com/gsi/client` — `sha384-EYNoDKtp+ZEt9mJAh...`
  - `html2pdf.js` (lazy-loaded) — `sha384-Yv5O+t3uE3hunW8uy...`
  - `xlsx.full.min.js` (lazy-loaded) — `sha384-QCIdq2UMVEoSRhR3ZW...`

### 3. Tabnapping Vulnerability
- **Issue**: `<base target="_blank">` opens all links in new tabs without `rel="noopener"`, allowing the new page to access `window.opener`.
- **Status**: ✅ **REMEDIATED** — `<base target="_blank">` has been removed. Individual external links should use `target="_blank" rel="noopener noreferrer"` explicitly where needed.

### 4. Permissions Policy
- **Issue**: No Permissions-Policy header to restrict browser features.
- **Status**: ✅ **IMPLEMENTED** — Added `Permissions-Policy` meta tag disabling camera, microphone, geolocation, and payment APIs.

## Additional Hardening Applied

### 5. Accessibility & Motion Safety
- **Issue**: Heavy CSS animations (mesh blobs, orb floats, glow pulses, stagger fades) can cause discomfort for users with vestibular disorders.
- **Status**: ✅ **IMPLEMENTED** — Added `@media (prefers-reduced-motion: reduce)` rule that:
  - Disables all animations and transitions
  - Makes stagger items immediately visible (no fade-in delay)
  - Removes hover transform effects
  - Sets `scroll-behavior: auto`

### 6. Performance-Related Security
- **Issue**: Synchronous loading of CDN scripts delays rendering and increases attack surface time.
- **Status**: ✅ **IMPLEMENTED**:
  - Added `dns-prefetch` for `cdnjs.cloudflare.com` and `cdn.sheetjs.com`
  - Added `preload` for Tailwind CSS CDN
  - Reduced Google Fonts weights from 5 (300,400,600,700,800) to 3 (400,700,800) — fewer network requests, smaller attack surface

## Remediation Summary

| Issue | Original Risk | Status | Details |
|-------|--------------|--------|---------|
| XSS via innerHTML | 🔴 High | ✅ Fixed | All dynamic outputs wrapped in `escapeHtml()` |
| Insecure password storage | 🔴 High | ⚠️ N/A | Replaced by Google GIS auth |
| Missing CSP | 🟡 Medium | ✅ Fixed | Full CSP with `object-src 'none'; base-uri 'self'; form-action 'self'` |
| Missing SRI | 🟡 Medium | ✅ Fixed | All CDN scripts have integrity hashes |
| Tabnapping via `<base target>` | 🟡 Medium | ✅ Fixed | Removed `<base target="_blank">` |
| Missing Permissions-Policy | 🟡 Low | ✅ Fixed | Camera/mic/geo/payment disabled |
| Motion accessibility | 🟡 Low | ✅ Fixed | `prefers-reduced-motion` support |
| Unnecessary font weights | 🔵 Info | ✅ Fixed | Reduced from 5 to 3 weights |

## Remaining Known Limitations

1. **`unsafe-eval` in CSP**: Required by `cdn.tailwindcss.com` which uses `eval()` for its runtime CSS compiler. This cannot be removed without switching to a pre-compiled Tailwind build.
2. **`unsafe-inline` in CSP**: Required for the inline `<script>` block that contains all application logic. Could be eliminated by moving inline scripts to external files with nonce-based CSP.
3. **localStorage session tokens**: Standard for SPAs but vulnerable to XSS if new unsanitized outputs are introduced. Recommend periodic security audits of render functions.
