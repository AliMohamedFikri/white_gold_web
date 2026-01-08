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

### 2. Insecure Password Storage
- **Location**: `localStorage` / `handleLogin`.
- **Issue**: User passwords are stored in plain text in the browser's Local Storage.
- **Risk**: **High**. Any user with access to the machine or a successful XSS attack can steal all passwords.
- **Recommendation**: In a client-side only app, this is difficult to solve perfectly. At minimum, use a hashing algorithm (like SHA-256) so plain text passwords aren't sitting in storage.

## Best Practice Improvements

### 1. Content Security Policy (CSP)
- **Issue**: No CSP is defined.
- **Recommendation**: Add a strictly defined `<meta>` tag to control which scripts and styles can load.

### 2. Subresource Integrity (SRI)
- **Issue**: Tailwind CSS and html2pdf are loaded from external CDNs without integrity checks.
- **Recommendation**: Add `integrity` and `crossorigin` attributes to script tags to ensure the CDN hasn't tampered with the code.

## Remediation Plan
1. Helper function `escapeHtml` has been added to `index.html`.
2. Wrapping all dynamic variable outputs in `escapeHtml()` is recommended.
