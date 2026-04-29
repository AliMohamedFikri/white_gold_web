# White Gold Factory Management System
# نظام إدارة مصنع الذهب الأبيض للملابس

![Version](https://img.shields.io/badge/version-3.2-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Platform](https://img.shields.io/badge/platform-web-orange.svg)
![License](https://img.shields.io/badge/license-private-green.svg)

---

## Overview

The **White Gold Factory Management System** is a comprehensive single-page Arabic web application for clothing factory operations. Built with pure HTML, CSS, and JavaScript (no frameworks), it runs as a static site on GitHub Pages with Google Drive as the primary cloud storage layer and `localStorage` as a seamless offline fallback.

The entire interface is fully RTL (right-to-left) and runs directly from `index.html` with zero backend infrastructure. It combines a public-facing landing page, an authenticated management dashboard, professional billing and invoicing, and extensive company branding options.

**Zero-cost architecture:** GitHub Pages for hosting (free) + Google Drive API for storage (free tier) = no monthly fees.

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Styling | Tailwind CSS (CDN), Custom CSS (Glassmorphism, Mesh gradients, Animations) |
| Hosting | GitHub Pages (static) |
| Cloud Storage | Google Drive API v3 |
| Local Storage | `localStorage` (automatic fallback) |
| Auth | Google Identity Services (GIS) — OAuth 2.0 token flow |
| PDF Export | html2pdf.js (lazy-loaded) |
| Excel Import | SheetJS / xlsx (lazy-loaded) |
| Font | Cairo (Google Fonts, Arabic-optimized) |

---

## Features

### 1. Landing Page (Public)

The landing page is the first thing visitors see. It is fully public — no login is required or prompted. It serves as both a marketing page and the entry point to the management system.

- **Hero section** with animated orbs, grid overlay, and gradient backgrounds
- **Company branding** (logo, name, tagline)
- **Responsive navigation** with mobile hamburger menu
- **Products showcase** displaying factory categories with image icons from `assets/png/`
- **About Us (من نحن)** — Bento grid layout with company statistics and feature cards
- **Contact section (تواصل معنا)** — phone number, address, and WhatsApp link
- **Admin entry button** — triggers session restore attempt before navigating to dashboard

### 2. Authentication

- **Google Sign-In** via Google Identity Services OAuth 2.0 token flow
- **Session persistence** — Drive file ID stored in `localStorage`; access token is **never** stored (it lives only in memory)
- **Silent session restore** — when a returning admin clicks the admin button, the app silently requests a fresh token from Google before showing the dashboard. No popup appears if the Google session is still active
- **Graceful fallback** — if silent restore fails (token expired, Google session ended), the login page is shown
- **Logout** with full in-memory token cleanup and session clear
- **Inactivity timeout** — 30-minute timer dispatches a `CustomEvent` that triggers clean logout via the main app's `logout()` function
- **Drive sync status** indicator showing whether data is stored in Drive or locally

### 3. Dashboard (لوحة التحكم)

- Summary stat cards for pricing models count and total bills
- Quick-create button for starting a new bill directly from the dashboard
- Recent bills table (last 5 invoices) with bill number, date, client name, total, and sync status
- **Monthly Analysis mode** — toggle that displays per-month cards with bill count, total items, and revenue
- Sync status badge showing Drive vs. local storage mode

### 4. Pricing Models (إدارة الأسعار)

Full CRUD management for pricing matrices used in bill generation.

- Create, view, edit, and delete pricing models
- Size range: 22 to 56 (step 2) covering all standard clothing sizes
- Category management with configurable product categories
- Price matrix editor with inline number inputs
- Bulk operations: fill all prices, clear all prices
- Duplicate model functionality
- Read-only view mode
- Category icons rendered from `assets/png/`
- **Excel import** from `.xlsx` files via SheetJS for rapid pricing data entry
- Model selection dropdown when creating bills

### 5. Bills & Invoicing (الفواتير)

Complete billing workflow from creation to delivery.

- **3-step bill creation flow:** select pricing model → enter client name → add items
- Standard items (pulled from pricing model) and custom one-off line items
- Bill archive with sortable table
- View, edit, delete bills
- Print via native browser print with print-optimized CSS
- Download PDF via html2pdf.js
- Share PDF via Web Share API (mobile) or clipboard/download fallback
- Auto-generated bill numbers and date tracking
- Sync status badges per bill

### 6. Bill Template System

- Template registry pattern: `window.billTemplateRegistry[version]`
- **v7 template** (default) — modern design with accent bar, watermark, glassmorphism total box, rounded corners, print/PDF-optimized layout
- **Fallback template** — simpler design for maximum compatibility
- Dynamic style injection via `upsertBillTemplateStyles()`
- Asset preloading in v7 — logo SVG fetched and converted to base64 on init for reliable PDF capture
- Template switching via `BILL_TEMPLATE_VERSION` constant

### 7. Company Settings (الإعدادات)

- Company name, phone number, address, footer text
- Logo management — upload custom logo (SVG, PNG, JPG), live preview, remove to revert to default
- Settings logo overrides the default on all pages and invoices

### 8. Centralized Logo System

A unified logo resolution chain ensures consistent branding everywhere.

- **Single source of truth:** `logo_data_uri.js` sets `window.__WHITE_GOLD_LOGO_DATA_URI__`
- **Priority chain** in `getLogoSource()`:
  1. `appState.companySettings.logo` (user-uploaded via Settings)
  2. `appState.logoDataUri` (preloaded by template_v7 for PDF reliability)
  3. `window.__WHITE_GOLD_LOGO_DATA_URI__` (centralized default)
  4. `FALLBACK_LOGO_DATA_URI` (inline SVG with "WG" text, absolute last resort)
- `onerror` fallback on all logo `<img>` tags hides broken images gracefully
- Favicon set to the same logo file

### 9. Data Storage & Sync

Dual-mode persistence architecture.

- **Google Drive mode** — full cloud sync via Drive API v3 with file ID tracking
- **`localStorage` mode** — automatic fallback when Drive is unavailable
- **Migration** — old flat pricing model format is automatically converted to grouped format on first load
- Sync badges show Drive vs. local status per bill

### 10. Security Layer

Security has been hardened across three rounds of work. See `SECURITY.md` for the full audit trail. Current controls:

- **Content Security Policy (CSP)** — strict `<meta>` tag with `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and explicit allowlists for every resource type
- **Subresource Integrity (SRI)** — `integrity` + `crossorigin` hashes on all CDN-loaded scripts (html2pdf, SheetJS)
- **XSS prevention** — all dynamic user-controlled outputs wrapped in `escapeHtml()` across all render functions
- **Input sanitization** — `sanitizeTextInput()`, `sanitizeClientNameInput()`, `sanitizeNumericInput()` helpers
- **OAuth token security** — access token stored in memory only, never in `localStorage` or `sessionStorage`
- **Session restore** — triggered only when the user explicitly requests admin access via `handleAdminAccess()`, not on every page load
- **Inactivity timeout** — 30-minute timer with clean logout; dispatches `CustomEvent` to avoid silent data loss
- **Rate limiting** — action throttling to prevent Drive API quota abuse
- **Tabnapping prevention** — `<base target="_blank">` removed; external links use `rel="noopener noreferrer"`
- **Permissions-Policy** — camera, microphone, geolocation, payment APIs disabled
- **Motion accessibility** — `prefers-reduced-motion` media query disables all animations
- **Optional security module** — `Security guide/security-module.js` provides audit logging and inactivity monitoring

### 11. UI/UX Design

- **Glassmorphism** sidebar with blur backdrop and gradient overlay
- **Mesh gradient** animated background with three floating color blobs
- Glass cards with hover lift effects and border glow transitions
- Stagger fade-in animations for dashboard content
- Neumorphic size badges with press states
- Fully responsive — mobile, tablet, and desktop
- RTL-first Arabic layout throughout
- `prefers-reduced-motion` support

### 12. Performance Optimizations

- **Lazy-loaded heavy libraries** — html2pdf (~800 KB) and SheetJS (~550 KB) load only on first use
- **Debounced rendering** — all `render()` calls batched into a single DOM update per animation frame
- **Guard on `render()`** — skipped until all bill templates are fully loaded (`_appReady` flag)
- **Resource hints** — `dns-prefetch` for CDNs, `preconnect` for Google Fonts
- **Optimized font loading** — reduced Google Fonts weights from 5 to 3

---

## Project Structure

```
white_gold_web/
├── index.html                              # Main SPA entry point (all app logic)
├── README.md                               # This file
├── SECURITY.md                             # Security audit trail (all three rounds)
├── assets/
│   ├── Logo white gold-Final-2.svg         # Default company logo
│   └── png/                                # Category icons (سليب.JPEG, نصفكم.JPEG, etc.)
├── bill_templates/
│   ├── logo_data_uri.js                    # Centralized default logo path (single source of truth)
│   ├── template_v7.js                      # v7 bill template (default, modern design)
│   └── template_fallback.js               # Fallback bill template (simple design)
└── Security guide/
    ├── security-module.js                  # Audit logging, inactivity monitoring
    ├── SECURITY_IMPROVEMENTS.md
    ├── INTEGRATION_GUIDE.md
    ├── QUICK_REFERENCE.md
    └── README.md
```

---

## Data Format

### Pricing Model

```json
{
  "type": "pricingModel",
  "pricingModelName": "نموذج التسعير الأساسي",
  "__backendId": "1714000000000",
  "data": [
    {
      "name": "سليب",
      "prices": [
        { "size": 22, "price": 45.00 },
        { "size": 24, "price": 50.00 }
      ]
    }
  ]
}
```

### Bill

```json
{
  "type": "bill",
  "bn": "INV-1714000000000",
  "bd": "2026-04-26T10:00:00.000Z",
  "bc": "أحمد محمد",
  "mn": "نموذج التسعير الأساسي",
  "bi": [
    { "c": 0, "s": 46, "q": 2, "p": 65.00 },
    { "n": "بنطلون قماش", "s": -1, "q": 4, "p": 115.00 }
  ],
  "bt": 590.00,
  "__backendId": "1714000000001"
}
```

Bill items use a compact format (`c`/`s`/`q`/`p` for standard items, `n`/`s`/`q`/`p` for custom items) to minimize Drive storage.

---

## Getting Started

### Requirements
- A modern browser (Chrome, Edge, Firefox, Safari)
- A Google account (for Drive-backed persistence)
- No backend server required

### Run Locally
1. Clone the repository
2. Open `index.html` in a browser
3. The landing page loads immediately — no login required
4. Click **"دخول الإدارة"** to access the admin dashboard
5. Sign in with Google for Drive-backed persistence, or data will be stored in `localStorage` automatically

### First-Time Setup
1. Click **"دخول الإدارة"** and sign in with Google
2. Go to **"الإعدادات"** to set company name, phone, address, logo
3. Go to **"إدارة الأسعار"** to create or import a pricing model
4. Go to **"الفواتير"** to start creating invoices

### Changing the Default Logo
1. Replace `assets/Logo white gold-Final-2.svg` with your logo file
2. Update the path in `bill_templates/logo_data_uri.js` to match
3. The new logo appears everywhere: favicon, landing page, dashboard, invoices

### Deploying to GitHub Pages
1. Push the repository to GitHub
2. Go to **Settings → Pages**
3. Set source to your main branch
4. Enable **"Enforce HTTPS"**
5. In Google Cloud Console, add `https://YOUR_USERNAME.github.io` to your OAuth client's authorized JavaScript origins

---

## Technology Stack

| Library | Purpose | Loading |
|---------|---------|---------|
| Tailwind CSS | Utility-first styling | CDN (sync) |
| html2pdf.js | Invoice PDF generation | CDN (lazy) |
| SheetJS (xlsx) | Excel file import | CDN (lazy) |
| Google Identity Services | Authentication | CDN (async defer) |
| Google Drive API v3 | Cloud storage | Fetched directly |
| Cairo Font | Arabic typography | Google Fonts |

---

## Usage Notes

- Pricing models must exist before bills can be generated
- Bill items can be standard catalog items or custom one-off lines
- PDF generation uses the v7 template by default and falls back automatically
- Clearing browser data removes `localStorage` records; Drive data is unaffected
- The app works on the `file://` protocol in `localStorage` mode for offline use
- Drive API quota: 100 requests/hour enforced client-side; Google's own quota is much higher

---

## License

This project is licensed for private use by White Gold Factory.