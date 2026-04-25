        // Authentication
        async function handleLogin(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            setLoading('login', true);

            try {
                // First, check if we have loaded users
                const users = appState.users || [];
                const existingUser = users.find(u => u.username === username);

                if (existingUser) {
                    // In a real app, use proper password hashing
                    // For now, we'll do a basic comparison
                    if (existingUser.password === password) {
                        appState.isAuthenticated = true;
                        appState.currentUser = existingUser;
                        appState.currentView = 'dashboard';
                        render();
                        showToast('?? ?????? ?????', 'success');
                    } else {
                        showToast('???? ?????? ??? ?????', 'error');
                    }
                } else {
                    // Create new user
                    const userData = {
                        type: 'user',
                        username: username,
                        password: password, // In production, hash this
                        role: 'admin',
                        createdAt: new Date().toISOString()
                    };

                    const result = await window.dataSdk.create(userData);

                    if (result.isOk) {
                        appState.isAuthenticated = true;
                        appState.currentUser = userData;
                        appState.currentView = 'dashboard';
                        render();
                        showToast('?? ????? ?????? ?????', 'success');
                    } else {
                        showToast('??? ???? ?????? ???????? ??? ????', 'error');
                    }
                }
            } catch (error) {
                showToast('??? ??? ?? ??????', 'error');
                console.error('Login error:', error);
            }

            setLoading('login', false);
        }

        function logout() {
            appState.isAuthenticated = false;
            appState.currentView = 'landing';
            render();
        }

        // Pricing Model Management
        async function createPricingModel(e) {
            e.preventDefault();
            const name = document.getElementById('modelName').value;
            if (!name.trim()) return showToast('?????? ????? ??? ???????', 'error');
            setLoading('createModel', true);
            const modelData = appState.categories.map(category => ({ name: category, prices: SIZES.map(size => ({ size, price: 0 })) }));
            const result = await window.dataSdk.create({ type: 'pricingModel', pricingModelName: name, pricingModelData: JSON.stringify(modelData), createdAt: new Date().toISOString() });
            if (result.isOk) { document.getElementById('modelName').value = ''; showToast('?? ????? ??????? ?????', 'success'); }
            else { showToast('??? ??? ????? ???????', 'error'); }
            setLoading('createModel', false);
        }

        async function updatePricingModel(model) {
            setLoading('updateModel', true);
            const result = await window.dataSdk.update({ ...model, pricingModelData: JSON.stringify(model.data) });
            if (result.isOk) { appState.editingModel = null; showToast('?? ????? ??????? ?????', 'success'); }
            else { showToast('??? ??? ????? ???????', 'error'); }
            setLoading('updateModel', false);
        }

        async function deletePricingModel(model) {
            const modelId = model.__backendId;
            const confirmBtn = document.getElementById(`confirm-${modelId}`);
            if (confirmBtn && confirmBtn.style.display !== 'none') {
                setLoading(`delete-${modelId}`, true);
                const result = await window.dataSdk.delete(model);
                if (result.isOk) { showToast('?? ??? ??????? ?????', 'success'); appState.pricingModels = appState.pricingModels.filter(m => m.__backendId !== modelId); render(); }
                else { showToast('??? ??? ????? ?????', 'error'); }
                setLoading(`delete-${modelId}`, false);
            } else {
                const deleteBtn = document.getElementById(`delete-${modelId}`);
                if (deleteBtn) deleteBtn.style.display = 'none';
                if (confirmBtn) { confirmBtn.style.display = 'inline-flex'; setTimeout(() => { confirmBtn.style.display = 'none'; if (deleteBtn) deleteBtn.style.display = 'inline-flex'; }, 5000); }
            }
        }

        function editModel(model) { appState.editingModel = JSON.parse(JSON.stringify(model)); render(); }

        function updatePrice(categoryIndex, sizeIndex, price) { if (appState.editingModel) { appState.editingModel.data[categoryIndex].prices[sizeIndex].price = parseFloat(price) || 0; } }

        async function saveModelEdits() { if (appState.editingModel) updatePricingModel(appState.editingModel); }

        function cancelEdit() { appState.editingModel = null; render(); }

        function fillAllPrices() {
            const price = parseFloat(document.getElementById('quickFillPrice').value);
            if (!price || price <= 0) return showToast('?????? ????? ??? ????', 'error');
            if (appState.editingModel) { appState.editingModel.data.forEach(cat => cat.prices.forEach(p => p.price = price)); render(); }
        }

        function clearAllPrices() { if (appState.editingModel) { appState.editingModel.data.forEach(cat => cat.prices.forEach(p => p.price = 0)); render(); } }

        async function duplicateModel(modelId) {
            const model = appState.pricingModels.find(m => m.__backendId === modelId);
            if (!model) return;
            setLoading('duplicateModel', true);
            const result = await window.dataSdk.create({ type: 'pricingModel', pricingModelName: `${model.pricingModelName} (????)`, pricingModelData: model.pricingModelData, createdAt: new Date().toISOString() });
            showToast(result.isOk ? '?? ??? ??????? ?????' : '??? ??? ????? ?????', result.isOk ? 'success' : 'error');
            setLoading('duplicateModel', false);
        }

        function viewModelDetails(modelId) {
            const model = appState.pricingModels.find(m => m.__backendId === modelId);
            if (model) { appState.viewingModel = model; appState.currentView = 'viewModel'; render(); }
        }

        // Billing
        function startNewBill() {
            appState.currentView = 'newBill';
            appState.billItems = [];
            appState.selectedModel = null;
            appState.editingBillId = null;
            appState.lastBillInput = null;
            appState.currentBillClientName = '';
            appState.billStep = 'selectModel';
            render();
        }

        function editBill() {
            if (!appState.currentBill) return;
            const bill = appState.currentBill;
            appState.editingBillId = bill.__backendId;
            appState.billItems = JSON.parse(JSON.stringify(bill.items));
            appState.currentBillClientName = bill.billClientName || '';
            appState.currentView = 'newBill';
            const model = appState.pricingModels.find(m => m.__backendId === bill.billModelId);
            if (model) appState.selectedModel = model;
            appState.billStep = 'items';
            render();
        }

        function selectModelForBill(modelId) {
            appState.selectedModel = appState.pricingModels.find(m => m.__backendId === modelId);
            appState.billStep = 'clientName';
            render();
        }

        function addBillItem() {
            const category = document.getElementById('billCategory').value;
            const size = parseInt(document.getElementById('billSize').value);
            const quantity = parseFloat(document.getElementById('billQuantity').value);
            if (!category || !size || !quantity) return showToast('?????? ????? ???? ??????', 'error');
            const categoryData = appState.selectedModel.data.find(c => c.name === category);
            const priceData = categoryData.prices.find(p => p.size === size);
            const unitPrice = priceData.price;
            const total = unitPrice * quantity;
            appState.billItems.push({ category, size, quantity, unitPrice, total });
            const nextSize = size + 2 <= 56 ? size + 2 : size;
            appState.lastBillInput = { category, size: nextSize, quantity };
            render();
        }

        function removeBillItem(index) {
            appState.billItems.splice(index, 1);
            render();
        }

        async function saveBill() {
            if (appState.billItems.length === 0) return showToast('?????? ????? ????? ????????', 'error');
            setLoading('saveBill', true);
            const billTotal = appState.billItems.reduce((sum, item) => sum + item.total, 0);
            let result;
            if (appState.editingBillId) {
                const originalBill = appState.bills.find(b => b.__backendId === appState.editingBillId);
                result = await window.dataSdk.update({ ...originalBill, billItems: JSON.stringify(appState.billItems), billTotal, billClientName: appState.currentBillClientName });
            } else {
                const billNumber = `INV-${Date.now()}`;
                result = await window.dataSdk.create({ type: 'bill', billNumber, billDate: new Date().toISOString(), billModelId: appState.selectedModel.__backendId, billItems: JSON.stringify(appState.billItems), billTotal, billClientName: appState.currentBillClientName, createdAt: new Date().toISOString() });
            }
            if (result.isOk) {
                showToast(appState.editingBillId ? '?? ????? ???????? ?????' : '?? ??? ???????? ?????', 'success');
                cancelNewBill();
            } else {
                showToast('??? ??? ????? ?????', 'error');
            }
            setLoading('saveBill', false);
        }

        function viewBill(bill) {
            appState.currentBill = bill;
            appState.currentView = 'viewBill';
            render();
        }

        function printBill() {
            window.print();
        }

        async function shareBill() {
            const element = document.getElementById('printable-bill');
            const container = document.getElementById('view-bill-container');
            if (!container) {
                showToast('???: ?? ??? ?????? ??? ????? ????????', 'error');
                return;
            }
            setLoading('sharing', true);
            container.classList.add('pdf-capture-mode');
            const opt = {
                margin: 10,
                filename: `invoice_${appState.currentBill.billNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            try {
                const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], opt.filename, { type: 'application/pdf' })] })) {
                    const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
                    await navigator.share({ title: `?????? ${appState.currentBill.billNumber}`, text: `?????? ?? ${appState.companySettings.name}`, files: [file] });
                    showToast('?? ??? ????? ????????', 'success');
                } else {
                    const url = URL.createObjectURL(pdfBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = opt.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast('?????? ??????? ??? ??????? ?? ????? PDF ????? ?? ???', 'info');
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('PDF sharing error:', error);
                    showToast('??? ??? ????? ????? ?? ?????? PDF', 'error');
                }
            } finally {
                container.classList.remove('pdf-capture-mode');
                setLoading('sharing', false);
            }
        }

        async function deleteBill(bill) {
            const confirmDelete = document.getElementById(`confirm-bill-${bill.__backendId}`);
            if (confirmDelete && confirmDelete.style.display === 'inline-flex') {
                setLoading(`delete-bill-${bill.__backendId}`, true);
                const result = await window.dataSdk.delete(bill);
                if (result.isOk) {
                    showToast('?? ??? ???????? ?????', 'success');
                    appState.currentView = 'bills';
                } else {
                    showToast('??? ??? ????? ?????', 'error');
                }
                setLoading(`delete-bill-${bill.__backendId}`, false);
            } else {
                if (confirmDelete) {
                    confirmDelete.style.display = 'inline-flex';
                    setTimeout(() => confirmDelete.style.display = 'none', 3000);
                }
            }
        }

        // Settings
        async function saveSettings(e) {
            e.preventDefault();
            const name = document.getElementById('settingsName').value, phone = document.getElementById('settingsPhone').value, address = document.getElementById('settingsAddress').value, footer = document.getElementById('settingsFooter').value;
            setLoading('saveSettings', true);
            const settingsData = { type: 'settings', companyName: name, companyPhone: phone, companyAddress: address, companyFooter: footer, createdAt: appState.settings ? appState.settings.createdAt : new Date().toISOString() };
            let result;
            if (appState.settings?.__backendId) result = await window.dataSdk.update({ ...appState.settings, ...settingsData });
            else result = await window.dataSdk.create(settingsData);
            showToast(result.isOk ? '?? ??? ????????? ?????' : '??? ??? ????? ?????', result.isOk ? 'success' : 'error');
            setLoading('saveSettings', false);
        }

