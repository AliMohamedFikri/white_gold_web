(function () {
    const styles = `
.bill-wrapper { background: #ffffff; position: relative; }
.bill-accent-bar { height: 6px; width: 100%; border-radius: 3px 3px 0 0; }
.bill-header { display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: start; }
@media (min-width: 640px) { .bill-header { grid-template-columns: auto 1fr auto; gap: 1rem; align-items: center; } }
.bill-logo-frame { display: inline-flex; align-items: center; justify-content: center; }
.bill-logo-image { display: block; width: 100%; height: 100%; object-fit: contain; }
.bill-table { width: 100%; border-collapse: collapse; }
.bill-table thead th { background: #f8fafc; font-weight: 700; font-size: 0.8rem; letter-spacing: 0; padding: 10px 12px; border-bottom: 2px solid #e2e8f0; }
.bill-table tbody td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
.bill-table tbody tr:hover { background: #f8fafc; }
.bill-table tfoot td { padding: 14px 12px; }
.bill-total-box {
    position: relative;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 18px;
    padding: 20px 24px;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}
.bill-total-box::after {
    content: '';
    position: absolute;
    inset-inline-end: -32px;
    inset-block-start: -32px;
    width: 120px;
    height: 120px;
    border-radius: 9999px;
    background: transparent;
    pointer-events: none;
}
.bill-total-label { font-size: 1.15rem; font-weight: 800; color: #000000; margin-top: 2px; }
.bill-total-value { font-size: clamp(2rem, 5.6vw, 3.6rem); line-height: 1; font-weight: 900; color: #000000; text-shadow: none; }
.bill-total-currency { font-size: 0.82rem; font-weight: 700; color: #000000; margin-top: 6px; }
.bill-footer-line { border-top: 2px dashed #e2e8f0; }
.bill-watermark { position: absolute; top: 20%; left: 20%; transform: translate(10%, 100px) rotate(-30deg); font-size: 4rem; opacity: 0.05; pointer-events: none; font-weight: 999; }

@media print {
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    #printable-bill { display: block !important; height: auto !important; overflow: visible !important; position: static !important; background: white !important; box-shadow: none !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
    body { background: white; }
    html, body, #app, .h-full, .min-h-screen { height: auto !important; overflow: visible !important; position: static !important; }
    .flex-1, .overflow-auto, .overflow-hidden { overflow: visible !important; height: auto !important; display: block !important; }
    .fixed.inset-y-0 { display: none !important; }
    .bill-wrapper { box-shadow: none !important; border-radius: 0 !important; }
}

.pdf-capture-mode #printable-bill {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 99999 !important;
    height: auto !important;
    overflow: visible !important;
    display: block !important;
    background: white !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 16px !important;
    width: 210mm !important;
}
.pdf-capture-mode .bill-header { grid-template-columns: auto 1fr auto !important; gap: 1rem !important; align-items: center !important; }
.pdf-capture-mode .bill-watermark { display: none; }
`;

    const LOGO_PATH = 'Logo%20white%20gold-Final-2.svg';
    const FALLBACK_LOGO_DATA_URI = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' rx='32' fill='%23ffffff'/%3E%3Ccircle cx='128' cy='104' r='62' fill='%23d4af37'/%3E%3Ccircle cx='128' cy='104' r='46' fill='none' stroke='%23222222' stroke-width='10'/%3E%3Ctext x='128' y='119' text-anchor='middle' font-size='44' font-weight='700' font-family='Arial, sans-serif' fill='%23000000'%3EWG%3C/text%3E%3Crect x='54' y='188' width='148' height='16' rx='8' fill='%231f2937'/%3E%3C/svg%3E";

    function getResolvedLogoPath() {
        try {
            return new URL(LOGO_PATH, window.location.href).href;
        } catch (error) {
            return LOGO_PATH;
        }
    }

    async function preloadAssets(appState) {
        if (appState.logoDataUri) {
            return;
        }

        if (window.location.protocol === 'file:') {
            appState.logoDataUri = window.__WHITE_GOLD_LOGO_DATA_URI__ || FALLBACK_LOGO_DATA_URI;
            return;
        }

        try {
            const res = await fetch(getResolvedLogoPath());
            if (!res.ok) {
                appState.logoDataUri = FALLBACK_LOGO_DATA_URI;
                return;
            }

            const svgText = await res.text();
            appState.logoDataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)));
        } catch (error) {
            appState.logoDataUri = FALLBACK_LOGO_DATA_URI;
        }
    }

    function getLogoSource(appState) {
        return appState.logoDataUri || window.__WHITE_GOLD_LOGO_DATA_URI__ || getResolvedLogoPath();
    }

    function renderViewBill(context) {
        const { appState, config, isLoading, escapeHtml } = context;
        const bill = appState.currentBill;
        if (!bill) {
            appState.currentView = 'bills';
            return '';
        }

        const clientName = bill.billClientName || '';
        const formattedDate = new Date(bill.billDate).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const logoSrc = getLogoSource(appState);

        return `
            <div class="fade-in">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
                    <h1 class="text-3xl md:text-4xl font-bold" style="color: ${config.text_color};">عرض الفاتورة</h1>
                    <div class="flex flex-wrap gap-2 md:gap-3">
                        <button onclick="appState.currentView = 'bills'; render();" class="px-4 md:px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold text-sm md:text-base transition-colors">رجوع</button>
                        <button onclick="editBill();" class="px-4 md:px-5 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 text-sm md:text-base transition-all hover:opacity-90" style="background-color: #f59e0b;">✏️ تعديل</button>
                        <button onclick="printBill();" class="px-4 md:px-5 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 text-sm md:text-base transition-all hover:opacity-90" style="background-color: ${config.secondary_color};">🖨️ طباعة</button>
                        <button onclick="shareBill();" ${isLoading('sharing') ? 'disabled' : ''} class="px-4 md:px-5 py-2.5 bg-blue-500 rounded-xl font-semibold text-white flex items-center gap-2 text-sm md:text-base">${isLoading('sharing') ? '<div class="loading-spinner"></div>' : '📤'} ${isLoading('sharing') ? 'جاري التحضير...' : 'مشاركة PDF'}</button>
                        <button onclick="downloadBillPDF();" ${isLoading('downloading') ? 'disabled' : ''} class="px-4 md:px-5 py-2.5 bg-green-600 rounded-xl font-semibold text-white flex items-center gap-2 text-sm md:text-base">${isLoading('downloading') ? '<div class="loading-spinner"></div>' : '⬇️'} ${isLoading('downloading') ? 'جاري التحميل...' : 'تنزيل PDF'}</button>
                    </div>
                </div>

                <div id="view-bill-container" class="w-full">
                    <div id="printable-bill" class="bill-wrapper card-shadow rounded-2xl overflow-hidden max-w-4xl mx-auto">
                        <div class="bill-accent-bar" style="background: linear-gradient(135deg, ${config.primary_color} 0%, ${config.secondary_color} 100%);"></div>

                        <div class="p-2 md:p-5 relative">
                            <div class="bill-watermark">الذهب الأبيض</div>

                            <div class="bill-header mb-2">
                                <div class="bill-logo-frame h-24 md:h-32 w-24 md:w-32 shrink-0 bg-white rounded-xl shadow-sm">
                                    <img src="${logoSrc}" alt="Logo" class="bill-logo-image" />
                                </div>

                                <div class="text-right">
                                    <h2 class="text-xl md:text-3xl font-extrabold leading-tight" style="color: ${config.text_color};">${escapeHtml(appState.companySettings.name)}</h2>
                                    <div class="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs md:text-sm" style="color: #64748b;">
                                        <span>📞 ${escapeHtml(appState.companySettings.phone)}</span>
                                        <span>📍 ${escapeHtml(appState.companySettings.address)}</span>
                                    </div>
                                </div>

                                <div class="text-left bg-gray-50 rounded-xl p-4 md:p-5 border" style="border-color: #e2e8f0;">
                                    <div class="mb-3">
                                        <p class="text-[10px] md:text-xs font-semibold mb-1" style="color: #94a3b8;">رقم الفاتورة</p>
                                        <p class="text-lg md:text-2xl font-extrabold" style="color: ${config.primary_color};">${bill.billNumber}</p>
                                    </div>
                                    <div>
                                        <p class="text-[10px] md:text-xs font-semibold mb-1" style="color: #94a3b8;">التاريخ: ${formattedDate}</p>
                                    </div>
                                </div>
                            </div>

                            ${clientName ? `
                            <div class="mb-2 flex items-center gap-3 px-5 py-4 rounded-xl" style="background: linear-gradient(135deg, ${config.primary_color}08 0%, ${config.secondary_color}08 100%); border: 1px solid ${config.primary_color}20;">
                                <div>
                                    <p class="text-[10px] md:text-xs font-semibold" style="color: #94a3b8;">العميل</p>
                                    <p class="text-lg md:text-xl font-bold" style="color: ${config.primary_color};">أ/ ${escapeHtml(clientName)}</p>
                                </div>
                            </div>` : ''}

                            <div class="mb-2 overflow-x-auto rounded-xl border" style="border-color: #e2e8f0;">
                                <table class="bill-table min-w-[520px]">
                                    <thead>
                                        <tr>
                                            <th class="text-center" style="color: ${config.text_color};">الإجمالي</th>
                                            <th class="text-center" style="color: ${config.text_color};">الكمية</th>
                                            <th class="text-center" style="color: ${config.text_color};">سعر الوحدة</th>
                                            <th class="text-center" style="color: ${config.text_color};">الفئة</th>
                                            <th class="text-center" style="color: ${config.text_color};">المقاس</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${bill.items.map((item) => `
                                            <tr>
                                                <td class="text-center font-bold" style="color: ${config.accent_color};">${item.total.toFixed(2)}</td>
                                                <td class="text-center font-semibold">${item.quantity.toFixed(2)}</td>
                                                <td class="text-center">${item.unitPrice.toFixed(2)}</td>
                                                <td class="text-center">
                                                    <span class="inline-block px-2 py-0.5 rounded-md text-xs font-semibold text-white" style="background-color: ${config.primary_color};">${escapeHtml(item.category)}</span>
                                                </td>
                                                <td class="text-center font-semibold">${item.size}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>

                            <div class="bill-total-box">
                                <div class="flex justify-between items-center">
                                    <div class="relative z-10">
                                        <h3 class="bill-total-label">الإجمالي الكلي</h3>
                                    </div>
                                    <div class="text-left relative z-10">
                                        <p class="bill-total-value">${bill.billTotal.toFixed(2)}</p>
                                        <p class="bill-total-currency">جنيه مصري</p>
                                    </div>
                                </div>
                            </div>

                            <div class="bill-footer-line mt-2 pt-2 text-center">
                                <p class="text-sm font-semibold" style="color: #64748b;">${escapeHtml(appState.companySettings.footer)}</p>
                                <p class="text-xs mt-2" style="color: #cbd5e0;">تم إنشاء هذه الفاتورة إلكترونيا - ${formattedDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    window.billTemplateRegistry = window.billTemplateRegistry || {};
    window.billTemplateRegistry.v7 = {
        styles,
        preloadAssets,
        renderViewBill
    };
})();
