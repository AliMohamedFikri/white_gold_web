(function () {
    function renderViewBill(context) {
        const { appState, config, isLoading, escapeHtml } = context;
        const bill = appState.currentBill;
        if (!bill) {
            appState.currentView = 'bills';
            return '';
        }

        const clientName = bill.billClientName || '';

        return `
            <div class="fade-in">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
                    <h1 class="text-3xl md:text-4xl font-bold" style="color: ${config.text_color};">عرض الفاتورة</h1>
                    <div class="flex flex-wrap gap-2 md:gap-3">
                        <button onclick="appState.currentView = 'bills'; render();" class="px-4 md:px-6 py-2 md:py-3 bg-gray-300 rounded-lg font-semibold text-sm md:text-base">رجوع</button>
                        <button onclick="editBill();" class="px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-white flex items-center gap-2 text-sm md:text-base" style="background-color: ${config.accent_color};">✏️ تعديل</button>
                        <button onclick="printBill();" class="px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-white flex items-center gap-2 text-sm md:text-base" style="background-color: ${config.primary_color};">🖨️ طباعة</button>
                        <button onclick="shareBill();" ${isLoading('sharing') ? 'disabled' : ''} class="px-4 md:px-6 py-2 md:py-3 bg-blue-500 rounded-lg font-semibold text-white flex items-center gap-2 text-sm md:text-base">${isLoading('sharing') ? '<div class="loading-spinner"></div>' : '📤'} ${isLoading('sharing') ? 'جاري التحضير...' : 'مشاركة PDF'}</button>
                        <button onclick="downloadBillPDF();" ${isLoading('downloading') ? 'disabled' : ''} class="px-4 md:px-6 py-2 md:py-3 bg-green-600 rounded-lg font-semibold text-white flex items-center gap-2 text-sm md:text-base">${isLoading('downloading') ? '<div class="loading-spinner"></div>' : '⬇️'} ${isLoading('downloading') ? 'جاري التحميل...' : 'تنزيل PDF'}</button>
                    </div>
                </div>

                <div id="view-bill-container" class="w-full">
                    <div id="printable-bill" class="card-shadow rounded-xl p-4 md:p-8 bg-white max-w-4xl mx-auto">
                        <div class="border-b-2 pb-6 mb-6" style="border-color: ${config.primary_color};">
                            <div class="print-header-grid">
                                <div class="print-company text-right">
                                    <div class="flex items-center gap-3 mb-2">
                                        <div class="h-12 md:h-16 flex items-center justify-center shrink-0 p-1 bg-white rounded-lg" style="border: 2px solid ${config.primary_color};">
                                            <img src="Logo%20white%20gold-Final-2.svg" alt="Logo" class="h-full w-auto object-contain" />
                                        </div>
                                        <div>
                                            <h2 class="text-xl md:text-3xl font-bold">${escapeHtml(appState.companySettings.name)}</h2>
                                            <p class="opacity-75 text-xs md:text-sm">فاتورة مبيعات</p>
                                        </div>
                                    </div>
                                    <div class="space-y-1 text-sm md:text-base mt-2">
                                        <p>📞 ${escapeHtml(appState.companySettings.phone)}</p>
                                        <p>📍 ${escapeHtml(appState.companySettings.address)}</p>
                                    </div>
                                    ${clientName ? `
                                    <div class="mt-4 pt-3 border-t border-dashed" style="border-color: ${config.primary_color}; border-opacity: 0.3;">
                                        <p class="text-xs opacity-60 mb-1">العميل</p>
                                        <p class="text-xl md:text-2xl font-bold" style="color: ${config.primary_color};">أ/ ${escapeHtml(clientName)}</p>
                                    </div>` : ''}
                                </div>

                                <div class="print-invoice text-left">
                                    <div class="mb-4">
                                        <p class="text-xs md:text-sm opacity-75 mb-1">رقم الفاتورة</p>
                                        <p class="text-2xl md:text-3xl font-bold" style="color: ${config.primary_color};">${bill.billNumber}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs md:text-sm opacity-75 mb-1">التاريخ</p>
                                        <p class="text-base md:text-lg font-semibold">${new Date(bill.billDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mb-8 overflow-x-auto">
                            <table class="mt-8 w-full min-w-[600px]">
                                <thead>
                                    <tr class="border-b-2" style="border-color: ${config.primary_color};">
                                        <th class="text-center py-2 px-2 font-bold">الإجمالي</th>
                                        <th class="text-center py-2 px-2 font-bold">الكمية</th>
                                        <th class="text-center py-2 px-2 font-bold">سعر الوحدة</th>
                                        <th class="text-center py-2 px-2 font-bold">الفئة</th>
                                        <th class="text-center py-2 px-2 font-bold">المقاس</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${bill.items.map(item => `
                                        <tr class="border-b">
                                            <td class="py-2 px-2 text-center font-semibold">${item.total.toFixed(2)}</td>
                                            <td class="py-2 px-2 text-center">${item.quantity.toFixed(2)}</td>
                                            <td class="py-2 px-2 text-center">${item.unitPrice.toFixed(2)}</td>
                                            <td class="py-2 px-2 text-center">${escapeHtml(item.category)}</td>
                                            <td class="py-2 px-2 text-center">${item.size}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="border-t-2 pt-6" style="border-color: ${config.primary_color};">
                            <div class="flex justify-between items-center">
                                <span class="text-xl md:text-2xl font-bold">الإجمالي الكلي</span>
                                <span class="text-3xl md:text-4xl font-bold" style="color: ${config.accent_color};">${bill.billTotal.toFixed(2)} جنية</span>
                            </div>
                        </div>

                        <div class="mt-4 pt-4 border-t text-center opacity-75 text-sm md:text-base">
                            <p>${escapeHtml(appState.companySettings.footer)}</p>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    window.billTemplateRegistry = window.billTemplateRegistry || {};
    window.billTemplateRegistry.fallback = {
        renderViewBill
    };
})();
