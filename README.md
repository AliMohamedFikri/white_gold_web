# White Gold Factory Management System
# نظام إدارة مصنع الذهب الأبيض للملابس

![Version](https://img.shields.io/badge/version-3.2-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Platform](https://img.shields.io/badge/platform-web-orange.svg)
![License](https://img.shields.io/badge/license-private-green.svg)

---

## Overview

The **White Gold Factory Management System** is a comprehensive single-page Arabic web application designed for clothing factory operations. Built with pure HTML, CSS, and JavaScript (no frameworks), it runs as a static site on GitHub Pages with Google Drive as the primary cloud storage layer and localStorage as a seamless offline fallback.

The entire interface is fully RTL (right-to-left) and is designed to run directly from `index.html` with zero backend infrastructure. It combines a public-facing landing page, an authenticated management dashboard, professional billing and invoicing, and extensive customization options for company branding.

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Styling | Tailwind CSS (CDN), Custom CSS (Glassmorphism, Mesh gradients, Animations) |
| Hosting | GitHub Pages (static) |
| Cloud Storage | Google Drive API v3 |
| Local Storage | localStorage (automatic fallback) |
| Auth | Google Identity Services (GIS) |
| PDF Export | html2pdf.js |
| Excel Import | SheetJS (xlsx) |
| Font | Cairo (Google Fonts, Arabic-optimized) |

---

## Features

### 1. Landing Page (Public)

The landing page is the first thing visitors see. It is a modern, responsive design with animated background effects and serves as both a marketing page and the entry point to the management system.

- **Hero Section** with animated orbs, grid overlay, and gradient backgrounds
- **Company branding** display (logo, name, tagline)
- **Navigation bar** with responsive mobile hamburger menu
- **Products showcase** displaying all factory categories with image icons from `assets/png/`
- **About Us (من نحن)** section with a Bento grid layout featuring company statistics and feature cards
- **Contact section (تواصل معنا)** with phone number, address, and WhatsApp link
- **Admin login button** linking to the authenticated dashboard

### 2. Authentication

- **Google Sign-In** via Google Identity Services (GIS)
- **Session persistence** using localStorage tokens
- **Automatic redirect** to dashboard on successful authentication
- **Logout functionality** with token cleanup
- **Loading screen** during session verification
- **Drive sync status** indicator showing whether data is stored locally or on Google Drive

### 3. Dashboard (لوحة التحكم)

The main control panel after authentication provides a high-level overview of factory operations.

- **Summary stat cards** for pricing models count and total bills
- **Quick-create button** for starting a new bill directly from the dashboard
- **Recent bills table** showing the last 5 invoices with bill number, date, client name, total, and sync status
- **Monthly Analysis mode (التحليل الشهري)** toggle that displays monthly breakdown cards with bill count, total items, and revenue per month
- **Sync status badge** showing whether data is backed up to Google Drive or stored locally

### 4. Pricing Models (إدارة الأسعار)

Full CRUD management for pricing matrices used in bill generation.

- **Create, view, edit, and delete** pricing models
- **Size range**: 22 to 56 (step 2) covering all standard clothing sizes
- **Category management**: each model contains product categories (e.g., سليب, نصف كم, كم, كلسون, شورت, حماله)
- **Price matrix editor** with inline number inputs for each category/size combination
- **Bulk operations**: fill all prices, clear all prices
- **Duplicate model** functionality for creating variants
- **View model** screen with read-only price table display
- **Category icons** rendered from `assets/png/` images
- **Excel import** from `.xlsx` files via SheetJS for rapid pricing data entry
- **Model selection dropdown** when creating bills

### 5. Bills & Invoicing (الفواتير)

Complete billing workflow from creation to delivery.

- **Bill creation flow**:
  1. Select a pricing model from the dropdown
  2. Enter optional client name
  3. Add items by selecting category, size, and quantity
  4. Add custom (one-off) items with name, quantity, and price
  5. Review and save
- **Bill archive** with sortable table showing all saved bills
- **View bill** in a professional invoice layout
- **Edit bill** functionality for modifying saved invoices
- **Delete bill** with confirmation step
- **Print bill** using native browser print with print-optimized CSS
- **Download PDF** via html2pdf.js with high-quality capture
- **Share PDF** via Web Share API (mobile) or clipboard/email fallback
- **Auto-generated bill numbers** and date tracking
- **Sync status badges** per bill indicating local vs. Drive storage

### 6. Bill Template System

A versioned template architecture for invoice rendering.

- **Template registry** pattern: `window.billTemplateRegistry[version]`
- **v7 template** (default): Modern design with accent bar, watermark, glassmorphism total box, rounded corners, and print/PDF-optimized layout
- **Fallback template**: Simpler design for maximum compatibility
- **Dynamic style injection** via `upsertBillTemplateStyles()`
- **Asset preloading** in v7 template fetches the logo SVG and converts to base64 for reliable PDF capture
- **Template switching** via `BILL_TEMPLATE_VERSION` constant

### 7. Company Settings (الإعدادات)

Full control over company branding and information.

- **Company name** displayed across all pages and invoices
- **Phone number** shown on landing page and invoices
- **Address** displayed on invoices
- **Footer text** printed at the bottom of invoices
- **Logo management**:
  - Upload custom logo (SVG, PNG, JPG supported)
  - Live preview of uploaded logo
  - Remove logo to revert to default
  - Settings logo overrides the default on all pages and invoices

### 8. Centralized Logo System

A unified logo resolution chain ensures consistent branding everywhere.

- **Single source of truth**: `logo_data_uri.js` sets `window.__WHITE_GOLD_LOGO_DATA_URI__` pointing to `assets/Logo%20white%20gold-Final-2.svg`
- **Priority chain** (in `getLogoSource()`):
  1. `appState.companySettings.logo` (user-uploaded via Settings)
  2. `appState.logoDataUri` (preloaded by template_v7 for PDF reliability)
  3. `window.__WHITE_GOLD_LOGO_DATA_URI__` (centralized default logo file)
  4. `FALLBACK_LOGO_DATA_URI` (inline SVG with "WG" text, absolute last resort)
- **All 3 JS files** (index.html, template_fallback.js, template_v7.js) use the same chain
- **onerror fallback** on all logo `<img>` tags hides broken images gracefully
- **Favicon** set to the same logo file

### 9. Data Storage & Sync

Dual-mode persistence architecture.

- **Google Drive mode**: Full cloud sync via Drive API v3 with file ID tracking
- **localStorage mode**: Automatic fallback when Google services are unavailable
- **Session management**: Auth tokens and session state persisted in localStorage
- **Sync badges**: Visual indicators showing sync status per bill

### 10. Security Layer

- **Content Security Policy (CSP)** meta tag restricting resource origins
- **X-Content-Type-Options**: nosniff header
- **X-Frame-Options**: DENY to prevent clickjacking
- **Referrer Policy**: strict-origin-when-cross-origin
- **Input sanitization**: HTML, client name, and numeric input validation
- **Rate limiting**: Action throttling to prevent abuse
- **Optional security module**: `Security guide/security-module.js` for enhanced protection
- **Secure storage abstraction**: `storageSet()`, `storageGet()`, `storageRemove()` wrappers

### 11. UI/UX Design

Premium SaaS-quality visual design built entirely with CSS.

- **Glassmorphism** sidebar with blur backdrop and gradient overlay
- **Mesh gradient** animated background with three floating color blobs
- **Glass cards** with hover lift effects and border glow transitions
- **Stagger fade-in animations** for dashboard content blocks
- **Neumorphic size badges** with press states for bill item selection
- **Glowing pulse** animation on bill total boxes
- **Landing page** with animated orbs, grid overlay, and gradient navigation
- **Bento grid** about section with feature cards and stat displays
- **Fully responsive** design adapting to mobile, tablet, and desktop
- **RTL-first** Arabic layout throughout

---

## Project Structure

```
white_gold_web/
├── index.html                              # Main SPA entry point (all app logic)
├── README.md                               # This file
├── assets/
│   ├── Logo white gold-Final-2.svg         # Default company logo
│   └── png/                                # Category icons (سليب.JPEG, نصفكم.JPEG, etc.)
├── bill_templates/
		├── logo_data_uri.js                # Centralized default logo path (single source of truth)
│       ├── template_v7.js                  # v7 bill template (default, modern design)
│       └── template_fallback.js            # Fallback bill template (simple design)
└── Security guide/
    └── security-module.js                  # Optional security enhancements
```

---

## Data Format

### Pricing Model

```json
{
  "id": "model_1",
  "version": 3,
  "pricingModelName": "نموذج التسعير الأساسي",
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
  "billNumber": "INV-001",
  "billDate": "2026-04-26T10:00:00.000Z",
  "billClientName": "أحمد محمد",
  "billItems": [
    { "category": "سليب", "size": 46, "quantity": 2, "unitPrice": 65.00, "total": 130.00 },
    { "isCustom": true, "name": "بنطلون قماش", "quantity": 4, "unitPrice": 115.00, "total": 460.00 }
  ],
  "billTotal": 590.00
}
```

---

## Getting Started

### Requirements
- A modern browser (Chrome, Edge, Firefox, Safari)
- No backend server required

### Run Locally
1. Clone the repository or copy files
2. Open `index.html` in a browser
3. Sign in with Google for Drive-backed persistence, or use localStorage mode automatically

### First Use
1. Open the app and explore the landing page
2. Click "دخول الإدارة" and sign in with Google
3. Go to "إدارة الأسعار" to create or import a pricing model
4. Go to "الإعدادات" to update company details and logo
5. Go to "الفواتير" to start creating invoices

### Changing the Default Logo
1. Replace `assets/Logo white gold-Final-2.svg` with your logo file
2. Update the path in `logo_data_uri.js` to match your new filename
3. The new logo will appear everywhere: favicon, landing page, dashboard, invoices

---

## Technology Stack

| Library | Purpose | Loaded From |
|---------|---------|-------------|
| Tailwind CSS | Utility-first styling | CDN |
| html2pdf.js | Invoice PDF generation | CDN |
| SheetJS (xlsx) | Excel file import | CDN |
| Google Identity Services | Authentication | CDN |
| Google Drive API v3 | Cloud storage | CDN |
| Cairo Font | Arabic typography | Google Fonts |

---

## Usage Notes

- Pricing models must be created before bills can be generated
- Bill items can be standard catalog items or one-off custom lines
- PDF generation uses the active bill template (v7 by default) and falls back automatically
- Clearing browser data removes localStorage records unless Google Drive sync is active
- The app works in `file://` protocol with localStorage mode for offline use

---

## License

This project is licensed for private use by White Gold Factory.