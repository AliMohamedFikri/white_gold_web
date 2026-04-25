        // Render Functions
        function render() {
            const app = document.getElementById('app');

            if (!appState.isAuthenticated) {
                if (appState.currentView === 'landing') {
                    app.innerHTML = renderLanding();
                } else {
                    app.innerHTML = renderLogin();
                }
            } else {
                app.innerHTML = renderDashboardLayout();
            }
        }

        function renderLanding() {
            const config = window.elementSdk?.config || defaultConfig;
            const companyName = config.company_name || defaultConfig.company_name;
            const heroTitle = config.hero_title || defaultConfig.hero_title;
            const heroSubtitle = config.hero_subtitle || defaultConfig.hero_subtitle;
            const ctaButton = config.cta_button || defaultConfig.cta_button;

            return `
        <div class="min-h-screen w-full relative" style="background-color: ${config.background_color || defaultConfig.background_color};">
          <!-- Navigation -->
          <nav class="w-full py-4 px-4 md:py-6 md:px-8 relative z-50 shadow-sm" style="background: linear-gradient(135deg, ${config.primary_color || defaultConfig.primary_color} 0%, ${config.secondary_color || defaultConfig.secondary_color} 100%);">
            <div class="max-w-7xl mx-auto flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="h-10 md:h-12 flex items-center justify-center p-1 bg-white rounded-lg">
                  <img src="Logo%20white%20gold-Final-2.svg" alt="Logo" class="h-full w-auto object-contain" />
                </div>
                <div>
                  <h1 class="text-xl md:text-2xl font-bold text-white">${escapeHtml(companyName)}</h1>
                  <p class="text-xs md:text-sm text-white opacity-90 hidden md:block">${escapeHtml(config.tagline || defaultConfig.tagline)}</p>
                </div>
              </div>
              
              <!-- Desktop Menu -->
              <div class="hidden md:flex gap-6 items-center">
                <a href="#" onclick="event.preventDefault(); appState.currentView = 'landing'; render();" class="text-white font-semibold hover:opacity-80 transition-opacity">????????</a>
                <a href="#" onclick="event.preventDefault(); scrollToProducts();" class="text-white font-semibold hover:opacity-80 transition-opacity">????????</a>
                <a href="#" onclick="event.preventDefault(); scrollToAbout();" class="text-white font-semibold hover:opacity-80 transition-opacity">?? ???</a>
                <a href="#" onclick="event.preventDefault(); scrollToContact();" class="text-white font-semibold hover:opacity-80 transition-opacity">????? ????</a>
                <button onclick="appState.currentView = 'login'; render();" class="px-6 py-2 bg-white rounded-lg font-semibold hover:shadow-lg transition-all" style="color: ${config.primary_color || defaultConfig.primary_color};">
                  ???? ???????
                </button>
              </div>

               <!-- Mobile Menu Button -->
              <button onclick="toggleMobileMenu()" class="md:hidden text-white text-2xl">
                 ${appState.isMobileMenuOpen ? '?' : '?'}
              </button>
            </div>

            <!-- Mobile Menu Dropdown -->
            ${appState.isMobileMenuOpen ? `
            <div class="absolute top-full left-0 w-full bg-white shadow-xl md:hidden z-50 flex flex-col fade-in border-t border-gray-100">
                <a href="#" onclick="event.preventDefault(); toggleMobileMenu(); appState.currentView = 'landing'; render();" class="py-4 px-6 border-b border-gray-100 hover:bg-gray-50 font-semibold" style="color: ${config.text_color || defaultConfig.text_color};">????????</a>
                <a href="#" onclick="event.preventDefault(); toggleMobileMenu(); scrollToProducts();" class="py-4 px-6 border-b border-gray-100 hover:bg-gray-50 font-semibold" style="color: ${config.text_color || defaultConfig.text_color};">????????</a>
                <a href="#" onclick="event.preventDefault(); toggleMobileMenu(); scrollToAbout();" class="py-4 px-6 border-b border-gray-100 hover:bg-gray-50 font-semibold" style="color: ${config.text_color || defaultConfig.text_color};">?? ???</a>
                <a href="#" onclick="event.preventDefault(); toggleMobileMenu(); scrollToContact();" class="py-4 px-6 border-b border-gray-100 hover:bg-gray-50 font-semibold" style="color: ${config.text_color || defaultConfig.text_color};">????? ????</a>
                <div class="p-4">
                    <button onclick="toggleMobileMenu(); appState.currentView = 'login'; render();" class="w-full py-3 rounded-lg font-bold text-white shadow-md" style="background: linear-gradient(135deg, ${config.primary_color || defaultConfig.primary_color} 0%, ${config.secondary_color || defaultConfig.secondary_color} 100%);">
                    ???? ???????
                    </button>
                </div>
            </div>
            ` : ''}
          </nav>

          <!-- Hero Section -->
          <section class="w-full py-16 md:py-24 px-4 md:px-8">
            <div class="max-w-7xl mx-auto text-center">
              <h2 class="text-4xl md:text-6xl font-bold mb-6 fade-in leading-tight" style="color: ${config.text_color || defaultConfig.text_color};">${escapeHtml(heroTitle)}</h2>
              <p class="text-xl md:text-2xl mb-12 opacity-75 fade-in leading-relaxed" style="color: ${config.text_color || defaultConfig.text_color};">${escapeHtml(heroSubtitle)}</p>
              <button onclick="scrollToContact();" class="btn-primary text-white px-8 md:px-10 py-3 md:py-4 rounded-lg text-lg md:text-xl font-bold shadow-lg hover:shadow-xl transition-shadow">
                ${escapeHtml(ctaButton)}
              </button>
            </div>
          </section>

          <!-- Products Section -->
          <section id="products" class="w-full py-12 md:py-20 px-4 md:px-8" style="background-color: white;">
            <div class="max-w-7xl mx-auto">
              <h2 class="text-3xl md:text-5xl font-bold text-center mb-10 md:mb-16" style="color: ${config.text_color || defaultConfig.text_color};">????????</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                ${appState.categories.map(category => `
                  <div class="card-shadow rounded-xl p-6 hover-scale transition-all duration-300" style="background-color: ${config.background_color || defaultConfig.background_color};">
                    <div class="text-5xl md:text-6xl text-center mb-4 transform hover:scale-110 transition-transform">
                      ${getCategoryIcon(category)}
                    </div>
                    <h3 class="text-xl md:text-2xl font-bold text-center mb-4" style="color: ${config.text_color || defaultConfig.text_color};">${category}</h3>
                    <div class="mb-4">
                      <p class="text-sm font-semibold mb-2" style="color: ${config.text_color || defaultConfig.text_color};">???????? ????????:</p>
                      <div class="flex flex-wrap gap-2">
                        ${SIZES.slice(0, 8).map(size => `
                          <span class="size-badge px-3 py-1 rounded-full text-xs md:text-sm font-semibold shadow-sm" style="background-color: ${config.primary_color || defaultConfig.primary_color}; color: white;">
                            ${size}
                          </span>
                        `).join('')}
                        ${SIZES.length > 8 ? `<span class="px-3 py-1 text-xs md:text-sm font-semibold" style="color: ${config.primary_color || defaultConfig.primary_color};">+${SIZES.length - 8}</span>` : ''}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>

          <!-- About Section -->
          <section id="about" class="w-full py-12 md:py-20 px-4 md:px-8">
            <div class="max-w-4xl mx-auto text-center">
              <h2 class="text-3xl md:text-5xl font-bold mb-8" style="color: ${config.text_color || defaultConfig.text_color};">?? ???</h2>
              <p class="text-lg md:text-xl leading-relaxed mb-6" style="color: ${config.text_color || defaultConfig.text_color};">
                ${escapeHtml(companyName)} ????? ?????? ?? ???? ???? ?? ????? ??????? ????? ??????. ???? ?????? ???? ???????? ???? ???? ??? ?????? ???????? ????????.
              </p>
              <p class="text-lg md:text-xl leading-relaxed" style="color: ${config.text_color || defaultConfig.text_color};">
                ?????? ???? ???????? ????? ?????? ????? ??? ??????? ??????. ?????? ?? ????????? ??? ?????? ??????? ?? ??? ?????? ???? ??? ????? ???? ??????????.
              </p>
            </div>
          </section>

          <!-- Contact Section -->
          <section id="contact" class="w-full py-12 md:py-20 px-4 md:px-8" style="background: linear-gradient(135deg, ${config.primary_color || defaultConfig.primary_color} 0%, ${config.secondary_color || defaultConfig.secondary_color} 100%);">
            <div class="max-w-4xl mx-auto text-center text-white">
              <h2 class="text-3xl md:text-5xl font-bold mb-12">????? ????</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                <div class="bg-white bg-opacity-20 rounded-xl p-6 md:p-8 hover-scale">
                  <div class="text-5xl mb-4">??</div>
                  <h3 class="text-2xl font-bold mb-2">??????</h3>
                  <p class="text-xl">${escapeHtml(appState.companySettings.phone)}</p>
                </div>
                <div class="bg-white bg-opacity-20 rounded-xl p-6 md:p-8 hover-scale">
                  <div class="text-5xl mb-4">??</div>
                  <h3 class="text-2xl font-bold mb-2">??????</h3>
                  <a href="https://wa.me/${appState.companySettings.phone.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener noreferrer" class="text-xl hover:underline">
                    ????? ??? ??????
                  </a>
                </div>
                <div class="bg-white bg-opacity-20 rounded-xl p-6 md:p-8 hover-scale">
                  <div class="text-5xl mb-4">??</div>
                  <h3 class="text-2xl font-bold mb-2">??????</h3>
                  <p class="text-xl">${escapeHtml(appState.companySettings.address)}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Footer -->
          <footer class="w-full py-8 px-4 md:px-8" style="background-color: ${config.text_color || defaultConfig.text_color};">
            <div class="max-w-7xl mx-auto text-center text-white">
              <p class="text-base md:text-lg">${escapeHtml(appState.companySettings.footer)}</p>
              <p class="text-xs md:text-sm mt-4 opacity-75">© 2026 ${escapeHtml(companyName)}. ???? ?????? ??????.</p>
            </div>
          </footer>
        </div>
      `;
        }

        function renderLogin() {
            const config = window.elementSdk?.config || defaultConfig;

            return `
        <div class="min-h-screen w-full flex items-center justify-center" style="background: linear-gradient(135deg, ${config.primary_color || defaultConfig.primary_color} 0%, ${config.secondary_color || defaultConfig.secondary_color} 100%);">
          <div class="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md">
            <div class="text-center mb-8">
              <div class="flex justify-center mb-4"><img src="Logo%20white%20gold-Final-2.svg" alt="Logo" class="w-24 h-24 object-contain" /></div>
              <h1 class="text-3xl font-bold mb-2" style="color: ${config.text_color || defaultConfig.text_color};">???? ???????</h1>
              <p class="opacity-75" style="color: ${config.text_color || defaultConfig.text_color};">???? ????? ???? ???????</p>
            </div>
            
            <form onsubmit="handleLogin(event)">
              <div class="mb-6">
                <label for="username" class="block text-sm font-semibold mb-2" style="color: ${config.text_color || defaultConfig.text_color};">??? ????????</label>
                <input type="text" id="username" required class="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all" style="border-color: ${config.primary_color || defaultConfig.primary_color};">
              </div>
              
              <div class="mb-8">
                <label for="password" class="block text-sm font-semibold mb-2" style="color: ${config.text_color || defaultConfig.text_color};">???? ??????</label>
                <input type="password" id="password" required class="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all" style="border-color: ${config.primary_color || defaultConfig.primary_color};">
              </div>
              
              <button type="submit" ${isLoading('login') ? 'disabled' : ''} class="w-full btn-primary text-white py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-3">
                ${isLoading('login') ? '<div class="loading-spinner"></div>' : ''}
                <span>????</span>
              </button>
            </form>
            
            <div class="mt-6 text-center">
              <button onclick="appState.currentView = 'landing'; render();" class="text-sm hover:underline" style="color: ${config.primary_color || defaultConfig.primary_color};">
                ?????? ?????? ????????
              </button>
            </div>
          </div>
        </div>
      `;
        }

        function renderDashboardLayout() {
            const config = window.elementSdk?.config || defaultConfig;
            const sidebarClasses = appState.isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0";
            return `
                <div class="h-full w-full flex flex-col md:flex-row relative overflow-hidden" style="background-color: ${config.background_color};">
                    <div class="md:hidden w-full p-4 flex justify-between items-center shadow-md z-30 relative no-print" style="background: linear-gradient(135deg, ${config.primary_color} 0%, ${config.secondary_color} 100%);">
                        <button onclick="toggleSidebar()" class="text-white text-2xl">${appState.isSidebarOpen ? '?' : '?'}</button>
                        <div class="flex items-center gap-2"><div class="h-8 flex items-center justify-center p-[2px] bg-white rounded"><img src="Logo%20white%20gold-Final-2.svg" alt="Logo" class="h-full w-auto object-contain" /></div><span class="text-white font-bold text-lg">${escapeHtml(appState.companySettings.name)}</span></div>
                    </div>
                    ${appState.isSidebarOpen ? `<div class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onclick="toggleSidebar()"></div>` : ''}
                    <div class="fixed inset-y-0 right-0 z-50 w-64 h-full shadow-lg no-print transition-transform duration-300 ease-in-out md:relative md:block ${sidebarClasses}" style="background: linear-gradient(135deg, ${config.primary_color} 0%, ${config.secondary_color} 100%);">
                        <div class="p-6 h-full overflow-y-auto">
                            <div class="flex items-center justify-between gap-3 mb-8">
                                <div class="flex items-center gap-3"><div class="h-12 flex items-center justify-center p-1 bg-white rounded"><img src="Logo%20white%20gold-Final-2.svg" alt="Logo" class="h-full w-auto object-contain" /></div><div class="text-white"><h2 class="font-bold text-lg">???? ???????</h2><p class="text-sm opacity-90">${escapeHtml(appState.companySettings.name)}</p></div></div>
                                <button onclick="toggleSidebar()" class="md:hidden text-white text-xl">?</button>
                            </div>
                            <nav class="space-y-2">
                                ${['dashboard', 'pricing', 'bills', 'settings'].map(view => `
                                    <button onclick="appState.currentView = '${view}'; appState.isSidebarOpen = false; render();" class="w-full text-right px-4 py-3 rounded-lg font-semibold transition-all ${appState.currentView === view ? 'bg-white' : 'text-white hover:bg-white hover:bg-opacity-20'}" style="${appState.currentView === view ? `color: ${config.primary_color}` : ''}">
                                        ${view === 'dashboard' ? '?? ???? ??????' : view === 'pricing' ? '?? ????? ???????' : view === 'bills' ? '?? ????????' : '?? ?????????'}
                                    </button>
                                `).join('')}
                            </nav>
                            <div class="mt-8 pt-8 border-t border-white border-opacity-30"><div class="text-white text-sm opacity-90">???? ??????? ?????</div><button onclick="logout();" class="w-full text-right px-4 py-3 mt-4 rounded-lg font-semibold text-white hover:bg-white hover:bg-opacity-20 transition-all opacity-80 hover:opacity-100 flex items-center justify-between"><span>????? ??????</span><span class="transition-transform">??</span></button></div>
                        </div>
                    </div>
                    <div class="flex-1 h-full overflow-hidden flex flex-col"><div class="flex-1 overflow-auto p-4 md:p-8">${renderCurrentView()}</div></div>
                </div>`;
        }

        function renderCurrentView() {
            const views = { dashboard: renderDashboard, pricing: renderPricing, viewModel: renderViewModel, bills: renderBills, newBill: renderNewBill, viewBill: renderViewBill, settings: renderSettings };
            return (views[appState.currentView] || renderDashboard)();
        }

        function renderDashboard() {
            const config = window.elementSdk?.config || defaultConfig;
            const recentBills = appState.bills.slice(-5).reverse();
            return `
                <div class="fade-in">
                    <h1 class="text-4xl font-bold mb-8" style="color: ${config.text_color};">???? ??????</h1>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="card-shadow rounded-xl p-6 hover-scale" style="background: linear-gradient(135deg, ${config.primary_color}, ${config.secondary_color});"><div class="text-white"><div class="text-4xl mb-2">??</div><h3 class="text-lg font-semibold opacity-90 mb-1">????? ???????</h3><p class="text-4xl font-bold">${appState.pricingModels.length}</p></div></div>
                        <div class="card-shadow rounded-xl p-6 hover-scale" style="background: linear-gradient(135deg, ${config.accent_color}, #38a169);"><div class="text-white"><div class="text-4xl mb-2">??</div><h3 class="text-lg font-semibold opacity-90 mb-1">?????? ????????</h3><p class="text-4xl font-bold">${appState.bills.length}</p></div></div>
                        <div class="card-shadow rounded-xl p-6 hover-scale bg-white"><button onclick="startNewBill();" class="w-full h-full flex flex-col items-center justify-center gap-3 group"><div class="text-5xl group-hover:scale-110 transition-transform">?</div><span class="text-xl font-bold" style="color: ${config.primary_color};">????? ?????? ?????</span></button></div>
                    </div>
                    <div class="card-shadow rounded-xl p-6 bg-white">
                        <h2 class="text-2xl font-bold mb-6" style="color: ${config.text_color};">???????? ???????</h2>
                        ${recentBills.length === 0 ? `<div class="text-center py-12 opacity-50"><div class="text-6xl mb-4">??</div><p class="text-xl">?? ???? ?????? ???</p></div>` : `
                            <div class="overflow-x-auto"><table class="w-full"><thead><tr class="border-b-2" style="border-color: ${config.primary_color};"><th class="text-right py-3 px-4">??? ????????</th><th class="text-right py-3 px-4">???????</th><th class="text-right py-3 px-4">??????</th><th class="text-right py-3 px-4">?????? ????????</th><th class="text-center py-3 px-4">?????????</th></tr></thead>
                            <tbody>${recentBills.map(bill => `<tr class="border-b"><td class="py-3 px-4">${bill.billNumber}</td><td class="py-3 px-4">${new Date(bill.billDate).toLocaleDateString('ar-SA')}</td><td class="py-3 px-4">${bill.billClientName ? '?/ ' + escapeHtml(bill.billClientName) : '-'}</td><td class="py-3 px-4 font-bold" style="color: ${config.accent_color};">${bill.billTotal.toFixed(2)} ????</td><td class="py-3 px-4 text-center"><button onclick="viewBill(appState.bills.find(b => b.__backendId === '${bill.__backendId}'));" class="px-4 py-2 rounded-lg font-semibold text-white" style="background-color: ${config.primary_color};">???</button></td></tr>`).join('')}</tbody></table></div>`}
                    </div>
                </div>`;
        }

        function renderViewModel() {
            const config = window.elementSdk?.config || defaultConfig;
            const model = appState.viewingModel;
            if (!model) { appState.currentView = 'pricing'; render(); return ''; }
            return `
                <div class="fade-in">
                    <div class="flex justify-between items-center mb-8"><h1 class="text-4xl font-bold" style="color: ${config.text_color};">??? ?????: ${escapeHtml(model.pricingModelName)}</h1><button onclick="appState.currentView = 'pricing'; render();" class="px-6 py-3 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400">????</button></div>
                    <div class="card-shadow rounded-xl p-6 bg-white overflow-x-auto">
                        <table class="w-full border-collapse">
                            <thead><tr class="border-b-2" style="border-color: ${config.primary_color};"><th class="text-right py-3 px-4 font-bold sticky right-0 bg-white z-10">?????</th>${SIZES.map(s => `<th class="text-center py-3 px-4 font-bold">${s}</th>`).join('')}</tr></thead>
                            <tbody>${model.data.map(cat => `<tr class="border-b"><td class="py-3 px-4 font-semibold sticky right-0 bg-white z-10"><div class="flex items-center gap-2">${getCategoryIcon(cat.name)}<span>${cat.name}</span></div></td>${SIZES.map(size => { const p = cat.prices.find(pr => pr.size === size); const price = p ? p.price : 0; return `<td class="py-3 px-4 text-center ${price > 0 ? 'font-semibold' : 'opacity-50'}" style="color: ${price > 0 ? config.accent_color : config.text_color};">${price > 0 ? price.toFixed(2) : '-'}</td>`; }).join('')}</tr>`).join('')}</tbody>
                        </table>
                    </div>
                </div>`;
        }

        function renderPricing() {
            const config = window.elementSdk?.config || defaultConfig;
            if (appState.editingModel) {
                return `
                    <div class="fade-in">
                        <div class="flex justify-between items-center mb-8"><h1 class="text-4xl font-bold" style="color: ${config.text_color};">????? ?????: ${appState.editingModel.pricingModelName}</h1><div class="flex gap-3"><button onclick="cancelEdit();" class="px-6 py-3 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400">?????</button><button onclick="saveModelEdits();" ${isLoading('updateModel') ? 'disabled' : ''} class="px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2" style="background-color: ${config.accent_color};">${isLoading('updateModel') ? '<div class="loading-spinner"></div>' : ''}<span>??? ?????????</span></button></div></div>
                        <div class="card-shadow rounded-xl p-6 bg-white overflow-x-auto">
                            <div class="mb-4 flex flex-wrap gap-3"><button onclick="fillAllPrices();" class="px-4 py-2 rounded-lg font-semibold text-white" style="background-color: ${config.primary_color};">????? ?????</button><button onclick="clearAllPrices();" class="px-4 py-2 bg-gray-500 rounded-lg font-semibold text-white">??? ????</button><input type="number" id="quickFillPrice" placeholder="?????" min="0" step="0.01" class="px-4 py-2 border-2 rounded-lg w-32" style="border-color: ${config.primary_color};"></div>
                            <table class="w-full border-collapse">
                                <thead><tr class="border-b-2" style="border-color: ${config.primary_color};"><th class="text-right py-3 px-4 font-bold sticky right-0 bg-white z-10">?????</th>${SIZES.map(s => `<th class="text-center py-3 px-4 font-bold">${s}</th>`).join('')}</tr></thead>
                                <tbody>${appState.editingModel.data.map((cat, catIdx) => `<tr class="border-b"><td class="py-3 px-4 font-semibold sticky right-0 bg-white z-10"><div class="flex items-center gap-2">${getCategoryIcon(cat.name)}<span>${cat.name}</span></div></td>${cat.prices.map((p, sizeIdx) => `<td class="py-3 px-4"><input type="number" min="0" step="0.01" value="${p.price}" onchange="updatePrice(${catIdx}, ${sizeIdx}, this.value);" class="w-20 px-2 py-1 border rounded text-center" style="border-color: ${config.primary_color};"></td>`).join('')}</tr>`).join('')}</tbody>
                            </table>
                        </div>
                    </div>`;
            }
            return `
                <div class="fade-in">
                    <h1 class="text-4xl font-bold mb-8" style="color: ${config.text_color};">????? ???????</h1>
                    <div class="card-shadow rounded-xl p-6 bg-white mb-8">
                        <h2 class="text-2xl font-bold mb-4" style="color: ${config.text_color};">????? ????? ????? ????</h2>
                        <div class="flex flex-col md:flex-row gap-3">
                            <form onsubmit="createPricingModel(event);" class="flex-1 flex flex-col md:flex-row gap-3">
                                <input type="text" id="modelName" required placeholder="??? ???????" class="flex-1 px-4 py-3 border-2 rounded-lg" style="border-color: ${config.primary_color};">
                                <button type="submit" ${isLoading('createModel') ? 'disabled' : ''} class="px-8 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2" style="background-color: ${config.primary_color};">${isLoading('createModel') ? '<div class="loading-spinner"></div>' : ''}<span>?????</span></button>
                            </form>
                            <div class="flex gap-2">
                                <input type="file" id="excelFileInput" accept=".xlsx, .xls" onchange="importFromExcel(event)" class="hidden">
                                <button onclick="triggerFileInput()" ${isLoading('importExcel') ? 'disabled' : ''} class="px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2" style="background-color: #10b981;">${isLoading('importExcel') ? '<div class="loading-spinner"></div>' : '??'}<span>??????? ?? Excel</span></button>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-6">
                        ${appState.pricingModels.length === 0 ? `<div class="card-shadow rounded-xl p-12 bg-white text-center"><div class="text-6xl mb-4">??</div><h3 class="text-2xl font-bold mb-2">?? ???? ????? ?????</h3><p class="text-lg opacity-75">?? ?????? ????? ??????? ????? ????? ??</p></div>` : appState.pricingModels.map(model => {
                            const totalPrices = model.data.reduce((sum, cat) => sum + cat.prices.filter(p => p.price > 0).length, 0);
                            const totalPossible = model.data.length * SIZES.length;
                            const percent = Math.round((totalPrices / totalPossible) * 100);
                            return `
                                <div class="card-shadow rounded-xl p-6 bg-white hover-scale">
                                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                        <div class="flex-1"><h3 class="text-2xl font-bold mb-2">${escapeHtml(model.pricingModelName)}</h3><div class="flex items-center gap-4"><div class="flex-1 bg-gray-200 rounded-full h-2 max-w-xs"><div class="h-2 rounded-full" style="width: ${percent}%; background-color: ${config.accent_color};"></div></div><span class="text-sm font-semibold">${totalPrices}/${totalPossible} (${percent}%)</span></div></div>
                                        <div class="flex flex-wrap gap-2">
                                            <button onclick="viewModelDetails('${model.__backendId}');" class="px-3 py-2 bg-gray-200 rounded-lg font-semibold">???</button>
                                            <button onclick="editModel(appState.pricingModels.find(m => m.__backendId === '${model.__backendId}'));" class="px-3 py-2 rounded-lg font-semibold text-white" style="background-color: ${config.primary_color};">?????</button>
                                            <button onclick="duplicateModel('${model.__backendId}');" class="px-3 py-2 bg-blue-500 rounded-lg font-semibold text-white">???</button>
                                            <div class="flex gap-2">
                                                <button onclick="deletePricingModel(appState.pricingModels.find(m => m.__backendId === '${model.__backendId}'));" id="delete-${model.__backendId}" ${isLoading(`delete-${model.__backendId}`) ? 'disabled' : ''} class="px-3 py-2 bg-red-500 rounded-lg font-semibold text-white flex items-center gap-2">${isLoading(`delete-${model.__backendId}`) ? '<div class="loading-spinner"></div>' : ''}<span>???</span></button>
                                                <button id="confirm-${model.__backendId}" onclick="deletePricingModel(appState.pricingModels.find(m => m.__backendId === '${model.__backendId}'));" style="display: none;" class="px-3 py-2 bg-red-700 rounded-lg font-semibold text-white">?????</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        ${model.data.slice(0, 4).map(cat => `<div class="p-3 rounded-lg" style="background-color: ${config.background_color};"><div class="flex items-center gap-2 mb-1"><span>${getCategoryIcon(cat.name)}</span><p class="font-semibold text-sm">${cat.name}</p></div><p class="text-xs opacity-75">${cat.prices.filter(p => p.price > 0).length}/${SIZES.length} ?????? ?????</p></div>`).join('')}
                                        ${model.data.length > 4 ? `<div class="p-3 rounded-lg flex items-center justify-center" style="background-color: ${config.background_color};"><p class="font-semibold text-sm" style="color: ${config.primary_color};">+${model.data.length - 4} ????</p></div>` : ''}
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                </div>`;
        }

        function renderBills() {
            const config = window.elementSdk?.config || defaultConfig;
            const sortedBills = [...appState.bills].sort((a, b) => new Date(b.billDate) - new Date(a.billDate));
            return `
                <div class="fade-in">
                    <div class="flex justify-between items-center mb-8"><h1 class="text-4xl font-bold" style="color: ${config.text_color};">????????</h1><button onclick="startNewBill();" class="px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2" style="background-color: ${config.primary_color};"><span class="text-2xl">?</span><span>?????? ?????</span></button></div>
                    ${appState.bills.length === 0 ? `<div class="card-shadow rounded-xl p-12 bg-white text-center"><div class="text-6xl mb-4">??</div><h3 class="text-2xl font-bold mb-2">?? ???? ??????</h3><p class="text-lg opacity-75 mb-6">?? ?????? ??? ?????? ??</p><button onclick="startNewBill();" class="px-8 py-3 rounded-lg font-semibold text-white" style="background-color: ${config.primary_color};">????? ??????</button></div>` : `
                        <div class="mb-6"><input type="text" id="billSearch" onkeyup="filterBills();" placeholder="??? ???? ????????..." class="w-full px-4 py-3 border-2 rounded-lg" style="border-color: ${config.primary_color};"></div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div class="card-shadow rounded-xl p-6" style="background-color: ${config.primary_color};"><div class="text-white"><p class="text-sm opacity-90 mb-1">?????? ????????</p><p class="text-3xl font-bold">${appState.bills.length}</p></div></div>
                            <div class="card-shadow rounded-xl p-6" style="background-color: ${config.accent_color};"><div class="text-white"><p class="text-sm opacity-90 mb-1">?????? ????????</p><p class="text-3xl font-bold">${appState.bills.reduce((s, b) => s + b.billTotal, 0).toFixed(2)} ????</p></div></div>
                            <div class="card-shadow rounded-xl p-6 bg-white"><div><p class="text-sm opacity-75 mb-1">????? ???? ????????</p><p class="text-3xl font-bold" style="color: ${config.primary_color};">${(appState.bills.reduce((s, b) => s + b.billTotal, 0) / appState.bills.length).toFixed(2)} ????</p></div></div>
                        </div>
                        <div id="billsList" class="card-shadow rounded-xl p-6 bg-white">
                            <div class="overflow-x-auto"><table class="w-full"><thead><tr class="border-b-2" style="border-color: ${config.primary_color};"><th class="text-right py-3 px-4">??? ????????</th><th class="text-right py-3 px-4">???????</th><th class="text-right py-3 px-4">??????</th><th class="text-right py-3 px-4">??? ???????</th><th class="text-right py-3 px-4">?????? ????????</th><th class="text-center py-3 px-4">?????????</th></tr></thead>
                            <tbody>${sortedBills.map(bill => `<tr class="bill-row border-b" data-bill-number="${bill.billNumber}"><td class="py-3 px-4 font-semibold" style="color: ${config.primary_color};">${bill.billNumber}</td><td class="py-3 px-4">${new Date(bill.billDate).toLocaleDateString('ar-SA')}</td><td class="py-3 px-4">${bill.billClientName ? '?/ ' + escapeHtml(bill.billClientName) : '-'}</td><td class="py-3 px-4">${bill.items.length}</td><td class="py-3 px-4 font-bold" style="color: ${config.accent_color};">${bill.billTotal.toFixed(2)} ????</td><td class="py-3 px-4 text-center"><div class="flex gap-2 justify-center"><button onclick="viewBill(appState.bills.find(b => b.__backendId === '${bill.__backendId}'));" class="px-4 py-2 rounded-lg font-semibold text-white" style="background-color: ${config.primary_color};">???</button><button onclick="deleteBill(appState.bills.find(b => b.__backendId === '${bill.__backendId}'));" ${isLoading(`delete-bill-${bill.__backendId}`) ? 'disabled' : ''} class="px-4 py-2 bg-red-500 rounded-lg font-semibold text-white flex items-center gap-2">${isLoading(`delete-bill-${bill.__backendId}`) ? '<div class="loading-spinner"></div>' : ''}<span>???</span></button><button id="confirm-bill-${bill.__backendId}" onclick="deleteBill(appState.bills.find(b => b.__backendId === '${bill.__backendId}'));" style="display: none;" class="px-4 py-2 bg-red-700 rounded-lg font-semibold text-white">?????</button></div></td></tr>`).join('')}</tbody></table></div>
                        </div>`}
                </div>`;
        }

        function filterBills() {
            const searchTerm = document.getElementById('billSearch').value.toLowerCase();
            document.querySelectorAll('.bill-row').forEach(row => { row.style.display = row.getAttribute('data-bill-number').toLowerCase().includes(searchTerm) ? '' : 'none'; });
        }

        function renderNewBill() {
            const config = window.elementSdk?.config || defaultConfig;
            const lastInput = appState.lastBillInput || {};
            const isEditing = !!appState.editingBillId;

            const stepsBar = `
                <div class="flex items-center justify-center gap-2 md:gap-4 mb-8 no-print">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base ${appState.billStep === 'selectModel' ? 'ring-4 ring-offset-2' : ''}" style="background-color: ${appState.billStep === 'selectModel' || appState.billStep === 'clientName' || appState.billStep === 'items' ? config.primary_color : '#cbd5e0'};">1</div>
                        <span class="font-semibold text-sm md:text-base hidden sm:inline" style="color: ${appState.billStep === 'selectModel' ? config.primary_color : '#a0aec0'};">????? ???????</span>
                    </div>
                    <div class="w-8 md:w-16 h-0.5 rounded" style="background-color: ${appState.billStep !== 'selectModel' ? config.primary_color : '#cbd5e0'};"></div>
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base ${appState.billStep === 'clientName' ? 'ring-4 ring-offset-2' : ''}" style="background-color: ${appState.billStep === 'clientName' || appState.billStep === 'items' ? config.primary_color : '#cbd5e0'};">2</div>
                        <span class="font-semibold text-sm md:text-base hidden sm:inline" style="color: ${appState.billStep === 'clientName' ? config.primary_color : '#a0aec0'};">??? ??????</span>
                    </div>
                    <div class="w-8 md:w-16 h-0.5 rounded" style="background-color: ${appState.billStep === 'items' ? config.primary_color : '#cbd5e0'};"></div>
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base ${appState.billStep === 'items' ? 'ring-4 ring-offset-2' : ''}" style="background-color: ${appState.billStep === 'items' ? config.primary_color : '#cbd5e0'};">3</div>
                        <span class="font-semibold text-sm md:text-base hidden sm:inline" style="color: ${appState.billStep === 'items' ? config.primary_color : '#a0aec0'};">???????</span>
                    </div>
                </div>`;

            const cancelButton = `<button onclick="cancelNewBill();" class="px-6 py-3 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400">?????</button>`;

            let content = '';

            if (appState.billStep === 'selectModel') {
                content = `
                    <div class="card-shadow rounded-xl p-6 bg-white"><h2 class="text-2xl font-bold mb-6" style="color: ${config.text_color};">???? ????? ???????</h2>
                        ${appState.pricingModels.length === 0 ? `<div class="text-center py-12"><div class="text-6xl mb-4">??</div><p class="text-xl mb-4">?? ???? ????? ????? ?????</p><button onclick="appState.currentView = 'pricing'; render();" class="px-6 py-3 rounded-lg font-semibold text-white" style="background-color: ${config.primary_color};">????? ????? ?????</button></div>` : `
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${appState.pricingModels.map(model => `<button onclick="selectModelForBill('${model.__backendId}');" class="card-shadow rounded-lg p-6 text-right hover-scale bg-white border-2" style="border-color: ${config.primary_color}; border-opacity: 0.3;"><h3 class="text-xl font-bold mb-2">${escapeHtml(model.pricingModelName)}</h3><p class="text-sm opacity-75">${model.data.length} ???? ?????</p></button>`).join('')}</div>`}
                    </div>`;
            } else if (appState.billStep === 'clientName') {
                content = `
                    <div class="card-shadow rounded-xl p-6 bg-white max-w-lg mx-auto">
                        <div class="text-center mb-6">
                            <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style="background-color: ${config.background_color};"><span class="text-4xl">??</span></div>
                            <h2 class="text-2xl font-bold mb-2" style="color: ${config.text_color};">??? ??????</h2>
                            <p class="opacity-75">???? ??? ?????? ?? ???? ??????</p>
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-semibold mb-2">??? ??????</label>
                            <input type="text" id="billClientName" value="${escapeHtml(appState.currentBillClientName)}" placeholder="???? ??? ?????? (???????)" class="w-full px-4 py-4 border-2 rounded-lg text-lg" style="border-color: ${config.primary_color};" onkeydown="if(event.key==='Enter') confirmClientName();">
                        </div>
                        <div class="flex gap-3">
                            <button onclick="backToModelSelect();" class="flex-1 px-6 py-3 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400">????</button>
                            <button onclick="confirmClientName();" class="flex-1 px-6 py-3 rounded-lg font-semibold text-white text-lg" style="background-color: ${config.primary_color};">??????</button>
                        </div>
                    </div>`;
            } else if (appState.billStep === 'items') {
                content = `
                    <div class="space-y-6">
                        <div class="card-shadow rounded-xl p-6 bg-white"><h2 class="text-2xl font-bold mb-4">????? ????</h2>
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <select id="billCategory" class="px-4 py-3 border-2 rounded-lg" style="border-color: ${config.primary_color};">${appState.selectedModel.data.map(cat => `<option value="${cat.name}" ${lastInput.category === cat.name ? 'selected' : ''}>${cat.name}</option>`).join('')}</select>
                                <select id="billSize" class="px-4 py-3 border-2 rounded-lg" style="border-color: ${config.primary_color};">${SIZES.map(s => `<option value="${s}" ${lastInput.size === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
                                <input type="number" id="billQuantity" min="0.01" step="0.01" placeholder="??????" value="${lastInput.quantity || ''}" class="px-4 py-3 border-2 rounded-lg" style="border-color: ${config.primary_color};">
                                <button onclick="addBillItem();" class="px-6 py-3 rounded-lg font-semibold text-white" style="background-color: ${config.accent_color};">?????</button>
                            </div>
                        </div>
                        ${appState.billItems.length > 0 ? `<div class="card-shadow rounded-xl p-6 bg-white"><h2 class="text-2xl font-bold mb-4">????? ????????</h2><div class="overflow-x-auto"><table class="w-full"><thead><tr class="border-b-2" style="border-color: ${config.primary_color};"><th class="text-center py-3 px-4">?????</th><th class="text-center py-3 px-4">????????</th><th class="text-center py-3 px-4">?????</th><th class="text-center py-3 px-4">??????</th><th class="text-center py-3 px-4">??????</th><th class="text-right py-3 px-4">?????</th></tr></thead><tbody>${appState.billItems.map((item, idx) => `<tr class="border-b"><td class="text-center"><button onclick="removeBillItem(${idx});" class="px-3 py-1 bg-red-500 rounded text-white text-sm">???</button></td><td class="text-center font-bold" style="color: ${config.accent_color};">${item.total.toFixed(2)}</td><td class="text-center">${item.unitPrice.toFixed(2)}</td><td class="text-center">${item.quantity.toFixed(2)}</td><td class="text-center">${item.size}</td><td>${item.category}</td></tr>`).join('')}</tbody><tfoot><tr class="border-t-2" style="border-color: ${config.primary_color};"><td colspan="5" class="py-4 px-4 text-left font-bold text-xl">???????? ?????:</td><td class="py-4 px-4 text-center font-bold text-2xl" style="color: ${config.accent_color};">${appState.billItems.reduce((s, i) => s + i.total, 0).toFixed(2)} ????</td></tr></tfoot></table></div><div class="mt-6 flex justify-end"><button onclick="saveBill();" ${isLoading('saveBill') ? 'disabled' : ''} class="px-8 py-3 rounded-lg font-bold text-white text-lg flex items-center gap-2" style="background-color: ${config.primary_color};">${isLoading('saveBill') ? '<div class="loading-spinner"></div>' : ''}<span>??? ????????</span></button></div></div>` : ''}
                    </div>`;
            }

            return `
                <div class="fade-in">
                    <div class="flex justify-between items-center mb-4">
                        <h1 class="text-3xl md:text-4xl font-bold" style="color: ${config.text_color};">${isEditing ? '????? ????????' : '????? ?????? ?????'}</h1>
                        ${cancelButton}
                    </div>
                    ${stepsBar}
                    ${appState.billStep === 'items' ? `<div class="mb-4 no-print"><button onclick="backToClientName();" class="px-4 py-2 bg-gray-200 rounded-lg font-semibold text-sm hover:bg-gray-300">? ???? ???? ??????</button></div>` : ''}
                    ${content}
                </div>`;
        }

        function renderViewBill() {
            const config = window.elementSdk?.config || defaultConfig;
            const fallbackTemplate = window.billTemplateRegistry?.[BILL_FALLBACK_TEMPLATE_VERSION];
            const templateToUse = activeBillTemplate?.renderViewBill ? activeBillTemplate : fallbackTemplate;

            if (templateToUse?.renderViewBill) {
                return templateToUse.renderViewBill({
                    appState,
                    config,
                    defaultConfig,
                    isLoading,
                    escapeHtml
                });
            }

            return `<div class="fade-in"><div class="card-shadow rounded-xl p-6 bg-white"><p class="text-center">???? ????? ???? ????????</p></div></div>`;
        }

        function renderSettings() {
            const config = window.elementSdk?.config || defaultConfig;
            return `
                <div class="fade-in">
                    <h1 class="text-4xl font-bold mb-8" style="color: ${config.text_color};">?????????</h1>
                    <div class="card-shadow rounded-xl p-6 bg-white max-w-2xl"><h2 class="text-2xl font-bold mb-6">??????? ??????</h2>
                        <form onsubmit="saveSettings(event);" class="space-y-6">
                            <div><label class="block text-sm font-semibold mb-2">??? ??????</label><input type="text" id="settingsName" value="${escapeHtml(appState.companySettings.name)}" required class="w-full px-4 py-3 border-2 rounded-lg" style="border-color: ${config.primary_color};"></div>
                            <div><label class="block text-sm font-semibold mb-2">??? ??????</label><input type="text" id="settingsPhone" value="${escapeHtml(appState.companySettings.phone)}" required class="w-full px-4 py-3 border-2 rounded-lg" style="border-color: ${config.primary_color};"></div>
                            <div><label class="block text-sm font-semibold mb-2">???????</label><input type="text" id="settingsAddress" value="${escapeHtml(appState.companySettings.address)}" required class="w-full px-4 py-3 border-2 rounded-lg" style="border-color: ${config.primary_color};"></div>
                            <div><label class="block text-sm font-semibold mb-2">?? ???????</label><input type="text" id="settingsFooter" value="${escapeHtml(appState.companySettings.footer)}" required class="w-full px-4 py-3 border-2 rounded-lg" style="border-color: ${config.primary_color};"></div>
                            <button type="submit" ${isLoading('saveSettings') ? 'disabled' : ''} class="w-full py-3 rounded-lg font-bold text-white text-lg flex items-center justify-center gap-2" style="background-color: ${config.primary_color};">${isLoading('saveSettings') ? '<div class="loading-spinner"></div>' : ''}<span>??? ?????????</span></button>
                        </form>
                    </div>
                </div>`;
        }

        function getCategoryIcon(category) { const icons = { '????': '??', '??? ??': '??', '????': '??', '?????': '??', '?????': '??', '??': '??', '???????': '??' }; return icons[category] || '??'; }

        function scrollToProducts() {
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        }

        function scrollToAbout() {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
        }

        function scrollToContact() {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        }

