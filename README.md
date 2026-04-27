# White Gold Factory Management System (نظام إدارة مصنع الملابس)

![Version](https://img.shields.io/badge/version-3.1-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Platform](https://img.shields.io/badge/platform-web-orange.svg)

## Overview

The **White Gold Factory Management System** is a single-page Arabic web app for clothing factory operations. It is built with pure HTML, CSS, and JavaScript, designed to run as a static site on GitHub Pages, and uses Google Drive as the primary storage layer.

The interface is fully RTL and designed to run directly from `index.html`. It includes a landing page, authenticated dashboard, pricing tools, bill workflow, invoice preview/print/share actions, and a settings page for company branding.

# 📄 Billing App (Zero-Cost Architecture)

A lightweight billing web app built with **pure HTML, CSS, and JavaScript**, hosted on **GitHub Pages**, and using **Google Drive as storage**.

## 🚀 Goals

- ✅ Zero backend cost
- ✅ Fast static website
- ✅ Persistent bill storage
- ✅ Scalable data structure
- ✅ Accurate historical billing (no data corruption)

---

# 🏗️ Architecture

| Layer | Technology |
|-------------|------------------|
| Frontend | HTML, CSS, JS |
| Hosting | GitHub Pages |
| Storage | Google Drive |
| Data Format | JSON |

---

# 📦 Storage Strategy (Enterprise-Level)

To balance:
- ⚡ Performance
- 💾 Small size
- 🔒 Historical accuracy

We use:

> ✅ **Mapping Table + Versioning + Snapshot**

---

# 🧠 Core Idea

Each bill:
1. References a **pricing model**
2. Uses **compact mapping (indexes instead of names)**
3. Stores a **snapshot of price at billing time**

---

# 📊 Data Structure

## 1. Pricing Model (Versioned)

```json
{
	"id": "model_1",
	"version": 3,
	"categories": [
		{ "name": "سليب" },
		{ "name": "نصف كم" },
		{ "name": "شورت" }
	]
}
```

## 2. Bill Schema

```json
{
	"id": "bill_001",
	"date": "2026-04-26",
	"m": "model_1",
	"mv": 3,
	"items": [
		{ "c": 1, "s": 46, "q": 2, "p": 650 },
		{ "t": "c", "n": "بنطلون", "q": 4, "p": 115 }
	]
}
```

## Key Features

### Pricing Models
* Create pricing matrices in the browser.
* Work with sizes 22 to 56 in steps of 2.
* Use the factory categories built into the app: حماله, نصف كم, كم, كلسون, شورت, سليب.
* Import pricing models from `.xlsx` files through SheetJS.
* Duplicate, edit, bulk-fill, and clear model prices.

### Billing and Invoices
* Build bills in the flow: select model, enter client name, add items, then save.
* Add both standard catalog items and custom bill lines.
* Generate printable invoices with `html2pdf.js` support for download and sharing.
* Use the current bill template registry with the v7 billing template and fallback template.
* View, edit, and delete saved bills from the archive.

### Dashboard and Reporting
* Show recent bills and monthly totals.
* Display quick summary cards for sales and activity.
* Include a lightweight analysis mode for billing insights.

### Branding and Settings
* Configure company name, phone, address, footer text, and logo.
* Use a bundled logo fallback so the invoice still renders in local-file mode.
* Adjust app colors and text configuration through the element settings layer.

## Data Storage and Auth

The app supports two data paths:

* Google Drive sync through Google Identity Services and the Drive API when the browser context is online and authenticated.
* A localStorage-based mock SDK fallback when Google services are unavailable.

Session state is stored locally so the app can restore authentication between visits when available.

## Technology

* HTML5, CSS3, and Vanilla JavaScript.
* Tailwind CSS loaded from CDN.
* `html2pdf.js` for invoice export.
* SheetJS for Excel import.
* Google Identity Services for Drive-based auth.

## Getting Started

### Requirements
* A modern browser such as Chrome, Edge, Firefox, or Safari.
* No backend server is required for local use.

### Run Locally
1. Open `index.html` in a browser.
2. Sign in with Google if you want Drive-backed persistence.
3. Otherwise the app will fall back to localStorage automatically.

### First Use
1. Open the app and let the seeded pricing models load if available.
2. Go to Pricing to create or import a model.
3. Go to Settings to update company details and logo.

## Project Structure

```
white_gold_web/
├── index.html                 # Main SPA entry point and app logic
├── README.md                  # Project overview and usage notes
├── SECURITY.md                # Security guidance
├── assets/                    # Category icons and supporting assets
├── Logo white gold-*.svg      # Logo assets used by the app
├── claude version/            # Alternate template/runtime helpers
├── v2/                        # Archived HTML artifacts
└── v3_Billing_only/           # Billing-focused build and template files
```

## Usage Notes

* Pricing models are required before creating a bill.
* Bill items can be standard catalog items or custom items.
* Invoice PDF generation uses the active billing template and falls back automatically if needed.
* Because local persistence is browser-based, clearing site data will remove saved records unless Drive sync is being used.

## Contributing

Contributions are welcome.

1. Fork the project.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a pull request.

## License

This project is licensed for private use by White Gold Factory.

---
Generated for White Gold Factory Management System
