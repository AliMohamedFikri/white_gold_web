// ============================================================
// Centralized Logo Configuration — White Gold Factory
// ============================================================
// This file is the SINGLE SOURCE OF TRUTH for the default logo.
// All scripts (index.html, template_fallback.js, template_v7.js)
// read window.__WHITE_GOLD_LOGO_DATA_URI__ as their initial logo.
//
// Priority chain in index.html getLogoSource():
//   1. appState.companySettings.logo  (user-uploaded via Settings)
//   2. appState.logoDataUri           (preloaded by template_v7)
//   3. window.__WHITE_GOLD_LOGO_DATA_URI__  ← THIS FILE
//   4. FALLBACK_LOGO_DATA_URI          (inline SVG, last resort)
//
// To change the default logo, update the path below.
// ============================================================

window.__WHITE_GOLD_LOGO_DATA_URI__ = 'assets/Logo%20white%20gold-Final-2.svg';