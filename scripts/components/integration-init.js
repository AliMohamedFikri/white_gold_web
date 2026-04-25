        // Element SDK Implementation
        async function onConfigChange(config) {
            // Update all elements that use config values
            render();
        }

        const element = {
            defaultConfig: defaultConfig,
            onConfigChange: onConfigChange,
            mapToCapabilities: (config) => ({
                recolorables: [
                    {
                        get: () => config.primary_color || defaultConfig.primary_color,
                        set: (value) => {
                            config.primary_color = value;
                            window.elementSdk.setConfig({ primary_color: value });
                        }
                    },
                    {
                        get: () => config.secondary_color || defaultConfig.secondary_color,
                        set: (value) => {
                            config.secondary_color = value;
                            window.elementSdk.setConfig({ secondary_color: value });
                        }
                    },
                    {
                        get: () => config.accent_color || defaultConfig.accent_color,
                        set: (value) => {
                            config.accent_color = value;
                            window.elementSdk.setConfig({ accent_color: value });
                        }
                    },
                    {
                        get: () => config.background_color || defaultConfig.background_color,
                        set: (value) => {
                            config.background_color = value;
                            window.elementSdk.setConfig({ background_color: value });
                        }
                    },
                    {
                        get: () => config.text_color || defaultConfig.text_color,
                        set: (value) => {
                            config.text_color = value;
                            window.elementSdk.setConfig({ text_color: value });
                        }
                    }
                ],
                borderables: [],
                fontEditable: {
                    get: () => config.font_family || defaultConfig.font_family,
                    set: (value) => {
                        config.font_family = value;
                        window.elementSdk.setConfig({ font_family: value });
                    }
                },
                fontSizeable: {
                    get: () => config.font_size || defaultConfig.font_size,
                    set: (value) => {
                        config.font_size = value;
                        window.elementSdk.setConfig({ font_size: value });
                    }
                }
            }),
            mapToEditPanelValues: (config) => new Map([
                ["company_name", config.company_name || defaultConfig.company_name],
                ["tagline", config.tagline || defaultConfig.tagline],
                ["hero_title", config.hero_title || defaultConfig.hero_title],
                ["hero_subtitle", config.hero_subtitle || defaultConfig.hero_subtitle],
                ["cta_button", config.cta_button || defaultConfig.cta_button]
            ])
        };

        function triggerFileInput() {
            document.getElementById('excelFileInput').click();
        }

        async function importFromExcel(event) {
            const file = event.target.files[0];
            if (!file) return;
            setLoading('importExcel', true);
            try {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                if (rows.length < 2) throw new Error('????? ???? ?? ?? ????? ??? ??????');
                let headerRowIndex = -1, sizeColIndex = -1;
                const categoryMap = new Map();
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row) continue;
                    const sizeIdx = row.findIndex(cell => cell && cell.toString().trim() === '??????');
                    if (sizeIdx !== -1) {
                        headerRowIndex = i; sizeColIndex = sizeIdx;
                        for (let j = 0; j < row.length; j++) {
                            if (j === sizeIdx) continue;
                            let catName = row[j]?.toString().trim();
                            if (!catName) continue;
                            if (catName === '?????') catName = '??? ??';
                            if (catName === '????') catName = '?????';
                            categoryMap.set(j, catName);
                        }
                        break;
                    }
                }
                if (headerRowIndex === -1) throw new Error('?? ??? ?????? ??? ?? ????? ???? ????? ??? "??????"');
                const modelData = [];
                const categoryNames = Array.from(categoryMap.values());
                for (let catName of categoryNames) {
                    modelData.push({ name: catName, prices: SIZES.map(s => ({ size: s, price: 0 })) });
                }
                for (let i = headerRowIndex + 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length === 0) continue;
                    const sizeCell = row[sizeColIndex];
                    if (sizeCell === undefined || sizeCell === null) continue;
                    const size = parseInt(sizeCell);
                    if (isNaN(size) || !SIZES.includes(size)) continue;
                    for (let [colIdx, catName] of categoryMap.entries()) {
                        const priceCell = row[colIdx];
                        if (priceCell === undefined || priceCell === null || priceCell === '------' || priceCell === '') continue;
                        const price = parseFloat(priceCell);
                        if (isNaN(price)) continue;
                        const catData = modelData.find(c => c.name === catName);
                        if (catData) { const priceEntry = catData.prices.find(p => p.size === size); if (priceEntry) priceEntry.price = price; }
                    }
                }
                let modelName = file.name.replace(/\.[^/.]+$/, "");
                modelName = prompt("???? ??? ???????:", modelName);
                if (!modelName || !modelName.trim()) { setLoading('importExcel', false); return; }
                const result = await window.dataSdk.create({ type: 'pricingModel', pricingModelName: modelName.trim(), pricingModelData: JSON.stringify(modelData), createdAt: new Date().toISOString() });
                showToast(result.isOk ? '?? ??????? ??????? ?????' : '??? ??? ????? ??? ???????', result.isOk ? 'success' : 'error');
            } catch (err) {
                console.error(err);
                showToast('??? ?? ????? ?????: ' + err.message, 'error');
            } finally {
                setLoading('importExcel', false);
                event.target.value = '';
                render();
            }
        }

            function confirmClientName() {
            const input = document.getElementById('billClientName');
            appState.currentBillClientName = input ? input.value.trim() : '';
            appState.billStep = 'items';
            render();
        }

            function backToModelSelect() {
            appState.selectedModel = null;
            appState.billStep = 'selectModel';
            render();
        }

            function backToClientName() {
            appState.billStep = 'clientName';
            render();
        }

            function cancelNewBill() {
            appState.currentView = 'bills';
            appState.lastBillInput = null;
            appState.editingBillId = null;
            appState.currentBillClientName = '';
            appState.selectedModel = null;
            appState.billStep = 'selectModel';
            render();
        }

        async function downloadBillPDF() {
            const element = document.getElementById('printable-bill');
            const container = document.getElementById('view-bill-container');
            if (!container) {
                showToast('???: ?? ??? ?????? ??? ????? ????????', 'error');
                return;
            }
            setLoading('downloading', true);
            container.classList.add('pdf-capture-mode');
            const opt = {
                margin: 10,
                filename: `invoice_${appState.currentBill.billNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            try {
                await html2pdf().set(opt).from(element).save();
                showToast('?? ????? PDF ?????', 'success');
            } catch (error) {
                console.error('PDF download error:', error);
                showToast('??? ??? ????? ????? PDF', 'error');
            } finally {
                container.classList.remove('pdf-capture-mode');
                setLoading('downloading', false);
            }
        }

        // Initialize
        async function init() {
            try {
                await loadBillTemplate(BILL_FALLBACK_TEMPLATE_VERSION);
                await loadBillTemplate(BILL_TEMPLATE_VERSION);
            } catch (error) {
                console.error('Failed to load bill template:', error);
                try {
                    await loadBillTemplate(BILL_FALLBACK_TEMPLATE_VERSION);
                } catch (fallbackError) {
                    console.error('Failed to load fallback bill template:', fallbackError);
                }
            }

            if (window.elementSdk) {
                await window.elementSdk.init(element);
            }

            if (window.dataSdk) {
                const result = await window.dataSdk.init(dataHandler);
                if (!result.isOk) {
                    console.error("Failed to initialize data SDK");
                }
            }

            render();
        }

        init();
    
