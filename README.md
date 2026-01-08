# White Gold Factory Management System (نظام إدارة مصنع الملابس)

![Version](https://img.shields.io/badge/version-3.0-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Platform](https://img.shields.io/badge/platform-web-orange.svg)

## 📄 Overview

The **White Gold Factory Management System** is a robust, web-based Single Page Application (SPA) designed to streamline operations for clothing manufacturing businesses. It provides a comprehensive suite of tools for managing complex pricing models, processing sales orders, generating professional invoices, and tracking business performance.

Built with a focus on usability and flexibility, the system features a fully responsive Arabic interface (`RTL`), making it ideal for local factory management in the MENA region.

## ✨ Key Features

### 💰 Advanced Pricing Management
*   **Dynamic Modeling:** Create and manage detailed pricing models (e.g., Model A, B, C).
*   **Size & Category Matrix:** Support for a wide range of sizes (20-56) and categories (Sleep, Half Sleeve, Shorts, Heater Sets, etc.).
*   **Bulk Operations:** Features for quick-filling prices, duplicating successful models, and batch editing.
*   **Auto-Seeding:** Comes pre-loaded with standard industry pricing templates (Models A, B, C, and Heater Sets) derived from verified data sources.

### 🧾 Invoicing & Billing
*   **Smart Point of Sale:** Rapid bill creation flow: Select Model → Select Items → Auto-calculate Totals.
*   **Print-Ready Invoices:** Generates professional, branded invoices compatible with standard printers.
*   **Sales Archive:** Searchable history of all generated bills and transactions.

### 📊 Dashboard & Analytics
*   **Real-time Overview:** Visual cards displaying total sales, bill counts, and average transaction value.
*   **Activity Feed:** Recent transactions list for quick monitoring.
*   **Performance Tracking:** Visual progress bars for pricing model completion.

### ⚙️ Customization & Settings
*   **Branding:** complete control over company name, phone, address, and footer text appearing on invoices.
*   **Theming:** (Internal) Support for primary/secondary color configuration via config objects.

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
    Open the `v3.html` file directly in your web browser.

### Initial Setup
1.  Upon first launch, the system will automatically seed the database with default pricing models (A, B, C, etc.) if no data exists.
2.  Log in using the default dashboard access (or create a new admin user via the interface).
3.  Navigate to **Settings** to configure your factory/company details.

## 📂 Project Structure

```
white_gold_web/
├── v3.html           # Main application file (Core logic & UI)
├── Data/             
│   ├── A.csv         # Pricing data for Model A
│   ├── B.csv         # Pricing data for Model B
│   └── C.csv         # Pricing data for Model C
├── v2/               # Archived versions and assets
└── README.md         # Project documentation
```

## 📝 Usage Guidelines

*   **Defining Prices:** Go to the "Pricing" section. You must have at least one active Pricing Model to create bills.
*   **Creating Bills:** Navigate to "New Bill". Select the Pricing Model applicable to the customer (e.g., "Wholesale Model A"), then add items by Category and Size.
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
