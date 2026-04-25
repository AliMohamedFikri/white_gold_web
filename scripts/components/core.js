// Bill template versioning: change this value to switch bill UI version.
        const BILL_TEMPLATE_VERSION = 'v7';
        const BILL_FALLBACK_TEMPLATE_VERSION = 'fallback';
        const BILL_TEMPLATE_FILES = {
            fallback: 'v3_Billing_only/bill_templates/template_fallback.js',
            v7: 'v3_Billing_only/bill_templates/template_v7.js'
        };
        let activeBillTemplate = null;

        function upsertBillTemplateStyles(cssText) {
            const styleId = 'bill-template-styles';
            let styleTag = document.getElementById(styleId);
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = styleId;
                document.head.appendChild(styleTag);
            }
            styleTag.textContent = cssText || '';
        }

        async function loadBillTemplate(version) {
            const resolvedVersion = BILL_TEMPLATE_FILES[version] ? version : BILL_FALLBACK_TEMPLATE_VERSION;
            const versionFile = BILL_TEMPLATE_FILES[resolvedVersion];
            if (!versionFile) {
                console.error('Unknown bill template version:', version);
                return;
            }

            if (!window.billTemplateRegistry) {
                window.billTemplateRegistry = {};
            }

            if (!window.billTemplateRegistry[resolvedVersion]) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = `${versionFile}?v=${encodeURIComponent(resolvedVersion)}`;
                    script.async = true;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            activeBillTemplate = window.billTemplateRegistry[resolvedVersion] || null;

            if (resolvedVersion !== version) {
                console.error('Unknown bill template version, using fallback:', version);
            }

            if (activeBillTemplate?.styles) {
                upsertBillTemplateStyles(activeBillTemplate.styles);
            }

            if (activeBillTemplate?.preloadAssets) {
                await activeBillTemplate.preloadAssets(appState);
            }
        }

        // Mock SDK for local development
        if (!window.dataSdk) {
            window.dataSdk = {
                init: async (handler) => {
                    window._dataHandler = handler;
                    let data = JSON.parse(localStorage.getItem('app_data') || '[]');

                    // Seed initial data if empty
                    if (!data.some(d => d.type === 'pricingModel')) {
                        const SIZES = []; for (let i = 22; i <= 56; i += 2) SIZES.push(i);
                        // Map CSV sizes that are not in default generation (like 22, 24, etc.)
                        const createCategory = (name, priceMap) => ({ 
                            name, 
                            prices: SIZES.map(s => ({ 
                                size: s, 
                                price: priceMap[s] || 0 
                            })) 
                        });

                        const seedModels = [
                            {
                                name: "A",
                                data: [
                                    createCategory("????", { 26: 150, 28: 170, 30: 190, 32: 210, 34: 230, 36: 250, 38: 270, 40: 295, 42: 325, 44: 355, 46: 390, 48: 425, 50: 460, 52: 495, 54: 530, 56: 565 }),
                                    createCategory("??? ??", { 22: 205, 24: 235, 26: 265, 28: 295, 30: 325, 32: 355, 34: 385, 36: 415, 38: 445, 40: 480, 42: 515, 44: 550, 46: 600, 48: 650, 50: 700, 52: 750, 54: 800, 56: 850 }),
                                    createCategory("????", { 26: 190, 28: 220, 30: 250, 32: 280, 34: 310, 36: 340, 38: 370, 40: 400, 42: 450, 44: 495, 46: 535, 48: 580, 50: 625, 52: 670, 54: 715, 56: 760 }),
                                    createCategory("?????", { 22: 185, 24: 206, 26: 229, 28: 252, 30: 271, 32: 293, 34: 315, 36: 337, 38: 359, 40: 381, 42: 403, 44: 425, 46: 460, 48: 500, 50: 540, 52: 580, 54: 620, 56: 660 })
                                ]
                            },
                            {
                                name: "B",
                                data: [
                                    createCategory("????", { 44: 335, 46: 370, 48: 405, 50: 440, 52: 475, 54: 510, 56: 545 }),
                                    createCategory("??? ??", { 44: 535, 46: 575, 48: 625, 50: 680, 52: 730, 54: 780, 56: 830 }),
                                    createCategory("????", { 44: 470, 46: 515, 48: 560, 50: 605, 52: 650, 54: 695, 56: 740 }),
                                    createCategory("?????", { 44: 415, 46: 440, 48: 480, 50: 520, 52: 560, 54: 600, 56: 640 })
                                ]
                            },
                            {
                                name: "C",
                                data: [
                                    createCategory("????", { 26: 136, 28: 158, 30: 180, 32: 203, 34: 225, 36: 247, 38: 269, 40: 291, 42: 313, 44: 335, 46: 370, 48: 405, 50: 440, 52: 475, 54: 510, 56: 545 }),
                                    createCategory("??? ??", { 22: 191, 24: 222, 26: 253, 28: 284, 30: 315, 32: 346, 34: 377, 36: 408, 38: 439, 40: 471, 42: 503, 44: 535, 46: 575, 48: 625, 50: 680, 52: 730, 54: 780, 56: 830 }),
                                    createCategory("????", { 26: 183, 28: 214, 30: 245, 32: 276, 34: 305, 36: 334, 38: 363, 40: 392, 42: 421, 44: 470, 46: 515, 48: 560, 50: 605, 52: 650, 54: 695, 56: 740 }),
                                    createCategory("?????", { 22: 170, 24: 191, 26: 214, 28: 237, 30: 260, 32: 283, 34: 305, 36: 327, 38: 349, 40: 371, 42: 393, 44: 415, 46: 440, 48: 480, 50: 520, 52: 560, 54: 600, 56: 640 })
                                ]
                            },
                            {
                                name: "??? ?????",
                                data: [
                                    createCategory("?????", { 28: 25, 30: 30, 32: 35, 34: 40, 36: 45, 38: 50, 40: 55, 42: 60, 44: 65, 46: 85, 48: 90, 50: 95, 52: 100, 54: 105, 56: 110 }),
                                    createCategory("??", { 28: 35, 30: 40, 32: 45, 34: 50, 36: 55, 38: 60, 40: 65, 42: 70, 44: 75, 46: 95, 48: 100, 50: 105, 52: 110, 54: 115, 56: 120 }),
                                    createCategory("???????", { 28: 60, 30: 70, 32: 80, 34: 90, 36: 100, 38: 110, 40: 120, 42: 130, 44: 140, 46: 180, 48: 190, 50: 200, 52: 210, 54: 220, 56: 230 })
                                ]
                            }
                        ];

                        data = [...data, ...seedModels.map((m, i) => ({
                            type: 'pricingModel',
                            pricingModelName: m.name,
                            pricingModelData: JSON.stringify(m.data),
                            createdAt: new Date().toISOString(),
                            __backendId: 'seed_' + i
                        }))];
                        localStorage.setItem('app_data', JSON.stringify(data));
                    }

                    handler.onDataChanged(data);
                    return { isOk: true };
                },
                create: async (item) => {
                    const data = JSON.parse(localStorage.getItem('app_data') || '[]');
                    const newItem = { ...item, __backendId: Date.now().toString() };
                    data.push(newItem);
                    localStorage.setItem('app_data', JSON.stringify(data));
                    if (window._dataHandler) window._dataHandler.onDataChanged(data);
                    return { isOk: true, id: newItem.__backendId };
                },
                update: async (item) => {
                    const data = JSON.parse(localStorage.getItem('app_data') || '[]');
                    const index = data.findIndex(d => d.__backendId === item.__backendId);
                    if (index >= 0) {
                        data[index] = item;
                        localStorage.setItem('app_data', JSON.stringify(data));
                        if (window._dataHandler) window._dataHandler.onDataChanged(data);
                        return { isOk: true };
                    }
                    return { isOk: false };
                },
                delete: async (item) => {
                    let data = JSON.parse(localStorage.getItem('app_data') || '[]');
                    data = data.filter(d => d.__backendId !== item.__backendId);
                    localStorage.setItem('app_data', JSON.stringify(data));
                    if (window._dataHandler) window._dataHandler.onDataChanged(data);
                    return { isOk: true };
                }
            };
        }

        // Configuration
        const defaultConfig = {
            company_name: "???? ????? ?????? ???????",
            tagline: "???? ????? ?????? ??????",
            hero_title: "???? ???? ?????? ???????",
            hero_subtitle: "???? ??? ???? ????? ??????? ????? ????????",
            cta_button: "????? ????",
            primary_color: "#667eea",
            secondary_color: "#764ba2",
            accent_color: "#48bb78",
            background_color: "#f7fafc",
            text_color: "#2d3748",
            font_family: "Cairo",
            font_size: 16
        };

        // App State
        let appState = {
            currentView: 'landing',
            isSidebarOpen: false,
            isMobileMenuOpen: false,
            isAuthenticated: false,
            currentUser: null,
            users: [],
            settings: null,
            companySettings: {
                name: "???? ????? ?????? ???????",
                phone: "+201212813475",
                address: "?????? ?? ?????? ???????",
                footer: "????? ???????? ????"
            },
            pricingModels: [],
            bills: [],
            categories: ["????", "??? ??", "????", "?????", "?????", "??", "???????"],
            selectedModel: null,
            editingModel: null,
            viewingModel: null,
            billItems: [],
            currentBill: null,
            loadingStates: {},
            editingBillId: null,
            lastBillInput: null,
            currentBillClientName: '',
            billStep: 'selectModel',
            logoDataUri: null
        };

        // Size generation (22 to 56, step 2)
        function generateSizes() {
            const sizes = [];
            for (let i = 22; i <= 56; i += 2) {
                sizes.push(i);
            }
            return sizes;
        }

        const SIZES = generateSizes();

        // Data Handler
        const dataHandler = {
            onDataChanged(data) {
                // Organize data by type
                appState.users = data.filter(d => d.type === 'user');

                if (appState.users.length > 0 && !appState.currentUser) {
                    appState.currentUser = appState.users[0];
                }

                const settings = data.find(d => d.type === 'settings');
                if (settings) {
                    appState.settings = settings;
                    appState.companySettings = {
                        name: settings.companyName || appState.companySettings.name,
                        phone: settings.companyPhone || appState.companySettings.phone,
                        address: settings.companyAddress || appState.companySettings.address,
                        footer: settings.companyFooter || appState.companySettings.footer
                    };
                }

                appState.pricingModels = data.filter(d => d.type === 'pricingModel').map(m => ({
                    ...m,
                    data: JSON.parse(m.pricingModelData)
                }));

                appState.bills = data.filter(d => d.type === 'bill').map(b => ({
                    ...b,
                    items: JSON.parse(b.billItems)
                }));

                render();
            }
        };
