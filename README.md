# White Gold Factory Management System (نظام إدارة مصنع الملابس)

![Version](https://img.shields.io/badge/version-3.0-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Platform](https://img.shields.io/badge/platform-web-orange.svg)

## 📄 Overview

The **White Gold Factory Management System** is a web-based Single Page Application (SPA) designed to streamline operations for clothing manufacturing businesses. It provides a focused set of tools for managing pricing models, creating bills, generating branded invoices, and keeping data in the browser with a lightweight mock SDK layer.

Built with a focus on usability and flexibility, the system features a fully responsive Arabic interface (`RTL`), making it ideal for local factory management in the MENA region.

## ✨ Key Features

### 💰 Pricing Management
*   **Dynamic Modeling:** Create and manage pricing models directly in the browser.
*   **Size & Category Matrix:** Supports sizes 22-56 and the factory categories used in the app UI.
*   **Excel Integration:** Import pricing models from `.xlsx` files using SheetJS.
*   **Bulk Operations:** Quick-fill prices, duplicate models, and batch edit values.
*   **Auto-Seeding:** Ships with seeded models that match the current index page data set.

### 🧾 Invoicing & Billing
*   **Smart Bill Flow:** Select Model → Select Client → Add Items → Auto-calculate Totals.
*   **Custom Bill Items:** Supports both standard catalog items and custom bill lines.
*   **Print-Ready Invoices:** Generates branded invoices and supports printing, PDF download, and PDF sharing through `html2pdf.js`.
*   **Sales Archive:** Searchable history of generated bills with edit and delete actions.

### 📊 Dashboard & Analytics
*   **Real-time Overview:** Visual cards displaying total sales, bill counts, and average transaction value.
*   **Activity Feed:** Recent transactions list for quick monitoring.
*   **Performance Tracking:** Visual progress bars for pricing model completion.

### ⚙️ Customization & Settings
*   **Branding:** Control company name, phone, address, footer text, and uploaded logo.
*   **Theming:** Supports primary, secondary, accent, background, and text color configuration.
*   **Local Logo Handling:** Uses a bundled data URI fallback so the logo still appears in local file mode and PDF output.

## 🛠️ Technological Stack

*   **Frontend Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
*   **UI Framework:** [Tailwind CSS](https://tailwindcss.com/) (via CDN) for modern, utility-first styling.
*   **Architecture:** Single Page Application (SPA) with client-side routing.
*   **Data Persistence:** LocalStorage API with a custom Mock SDK wrapper (simulating backend CRUD operations).
*   **Localization:** Native Arabic (RTL) support.

## 🚀 Getting Started

### Prerequisites
*   A modern web browser (Google Chrome, Microsoft Edge, Firefox, or Safari).
*   No server installation required for local usage.

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/white_gold_web.git
    ```
2.  **Navigate to the project folder:**
    ```bash
    cd white_gold_web
    ```
3.  **Launch the Application:**
    Open the `index.html` file directly in your web browser.

### Initial Setup
1.  Upon first launch, the system will load seeded pricing models if available. Otherwise, use "Import from Excel" via the `.xlsx` feature.
2.  Log in using the default dashboard access (or create a new admin user via the interface).
3.  Navigate to **Settings** to configure your factory/company details and logo.

## 📂 Project Structure

```
white_gold_web/
├── index.html           # Main application file (Core logic & UI)
├── Logo white gold-Final-2.svg  # Factory logo used in the app and PDF output
├── assets/
│   ├── png/             # Category icons used in the product cards and bill items
│   └── ...
├── v3_Billing_only/     
│   ├── Billing_v8.html  # Standalone billing build aligned with the current bill flow
│   └── bill_templates/  # Bill render templates and logo data URI helper
├── scripts/             # Legacy modular scripts kept for reference
├── v2/                  # Archived invoices and older HTML prototypes
└── README.md            # Project documentation
```

## 📝 Usage Guidelines

*   **Defining Prices:** Go to the "Pricing" section. You must have at least one active Pricing Model. You can either construct it manually or import directly using your Excel (`.xlsx`) files.
*   **Creating Bills:** Navigate to "New Bill". Select the Pricing Model, enter the Client Name, add standard or custom items, then save, print, download, or share the invoice PDF.
*   **Data Backup:** Since data is stored in the browser's LocalStorage, avoid clearing your browser cache to prevent data loss. For production use, a backend integration is recommended.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed for private use by White Gold Factory.

---
*Generated for White Gold Factory Management System*
