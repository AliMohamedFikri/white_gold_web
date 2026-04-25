        // UI Helpers
        function escapeHtml(text) {
            if (text === null || text === undefined) return '';
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function setLoading(key, isLoading) {
            appState.loadingStates[key] = isLoading;
            render();
        }

        function isLoading(key) {
            return appState.loadingStates[key] || false;
        }

        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white z-50 fade-in ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        function toggleSidebar() {
            appState.isSidebarOpen = !appState.isSidebarOpen;
            render();
        }

        function toggleMobileMenu() {
            appState.isMobileMenuOpen = !appState.isMobileMenuOpen;
            render();
        }

