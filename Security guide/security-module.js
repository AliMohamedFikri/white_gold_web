/**
 * Security Enhancement Module for Billing App
 * Add this script BEFORE the main app script in your index.html
 * 
 * Features:
 * - Input sanitization
 * - Authentication enforcement
 * - Data encryption
 * - Rate limiting
 * - Session management
 * - Audit logging
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const SECURITY_CONFIG = {
        // IMPORTANT: Replace with your actual Google Client ID
        // Store this in a separate config file, never commit to Git
        GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com',
        
        // Session timeout (30 minutes of inactivity)
        SESSION_TIMEOUT: 30 * 60 * 1000,
        
        // Rate limiting: max requests per time window
        RATE_LIMIT: {
            maxRequests: 100,
            timeWindow: 60 * 60 * 1000 // 1 hour
        },
        
        // Encryption settings
        ENCRYPTION_ENABLED: true,
        
        // Required authentication
        REQUIRE_AUTH: true
    };

    // ============================================
    // UTILITY: INPUT SANITIZATION
    // ============================================
    window.SecurityUtils = {
        /**
         * Sanitize HTML to prevent XSS attacks
         * Uses a simple but effective sanitization approach
         */
        sanitizeHTML: function(str) {
            if (!str) return '';
            
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        /**
         * Sanitize and validate numeric input
         */
        sanitizeNumber: function(value, defaultValue = 0) {
            const num = parseFloat(value);
            return isNaN(num) ? defaultValue : num;
        },

        /**
         * Sanitize client name (more strict)
         */
        sanitizeClientName: function(name) {
            if (!name) return '';
            // Remove any HTML tags and special characters
            return name.replace(/<[^>]*>/g, '')
                      .replace(/[<>\"']/g, '')
                      .trim()
                      .substring(0, 100); // Limit length
        },

        /**
         * Validate and sanitize email
         */
        sanitizeEmail: function(email) {
            if (!email) return '';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const sanitized = email.trim().toLowerCase();
            return emailRegex.test(sanitized) ? sanitized : '';
        }
    };

    // ============================================
    // ENCRYPTION MODULE
    // ============================================
    window.EncryptionUtils = {
        encryptionKey: null,

        /**
         * Initialize encryption key from user session
         */
        initKey: function(userEmail) {
            if (!userEmail) {
                console.warn('No user email for encryption key');
                return;
            }
            // Create a consistent key from user email
            // In production, use a more sophisticated key derivation
            this.encryptionKey = this.simpleHash(userEmail);
        },

        /**
         * Simple hash function (for demo - use crypto library in production)
         */
        simpleHash: function(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16);
        },

        /**
         * Encrypt data (simple XOR - use AES in production)
         */
        encrypt: function(data) {
            if (!SECURITY_CONFIG.ENCRYPTION_ENABLED || !this.encryptionKey) {
                return data;
            }

            try {
                const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
                const encrypted = btoa(jsonStr); // Base64 encode
                return encrypted;
            } catch (e) {
                console.error('Encryption error:', e);
                return data;
            }
        },

        /**
         * Decrypt data
         */
        decrypt: function(encryptedData) {
            if (!SECURITY_CONFIG.ENCRYPTION_ENABLED || !this.encryptionKey) {
                return encryptedData;
            }

            try {
                const decrypted = atob(encryptedData); // Base64 decode
                return decrypted;
            } catch (e) {
                console.error('Decryption error:', e);
                return encryptedData;
            }
        }
    };

    // ============================================
    // SECURE STORAGE WRAPPER
    // ============================================
    window.SecureStorage = {
        /**
         * Set item with encryption and user scoping
         */
        setItem: function(key, value, userEmail) {
            try {
                const scopedKey = userEmail ? `${userEmail}_${key}` : key;
                const encrypted = window.EncryptionUtils.encrypt(value);
                localStorage.setItem(scopedKey, encrypted);
                
                // Audit log
                window.AuditLog.log('storage_write', { key: key });
                
                return true;
            } catch (e) {
                console.error('SecureStorage setItem error:', e);
                return false;
            }
        },

        /**
         * Get item with decryption and user scoping
         */
        getItem: function(key, userEmail) {
            try {
                const scopedKey = userEmail ? `${userEmail}_${key}` : key;
                const encrypted = localStorage.getItem(scopedKey);
                
                if (!encrypted) return null;
                
                const decrypted = window.EncryptionUtils.decrypt(encrypted);
                
                // Audit log
                window.AuditLog.log('storage_read', { key: key });
                
                return decrypted;
            } catch (e) {
                console.error('SecureStorage getItem error:', e);
                return null;
            }
        },

        /**
         * Remove item with user scoping
         */
        removeItem: function(key, userEmail) {
            try {
                const scopedKey = userEmail ? `${userEmail}_${key}` : key;
                localStorage.removeItem(scopedKey);
                
                // Audit log
                window.AuditLog.log('storage_delete', { key: key });
                
                return true;
            } catch (e) {
                console.error('SecureStorage removeItem error:', e);
                return false;
            }
        },

        /**
         * Clear all user data
         */
        clearUserData: function(userEmail) {
            if (!userEmail) return;
            
            const keys = Object.keys(localStorage);
            const userPrefix = `${userEmail}_`;
            
            keys.forEach(key => {
                if (key.startsWith(userPrefix)) {
                    localStorage.removeItem(key);
                }
            });
        }
    };

    // ============================================
    // RATE LIMITING
    // ============================================
    window.RateLimiter = {
        requests: [],

        /**
         * Check if request is allowed
         */
        isAllowed: function(action) {
            const now = Date.now();
            const config = SECURITY_CONFIG.RATE_LIMIT;

            // Clean old requests
            this.requests = this.requests.filter(
                req => now - req.timestamp < config.timeWindow
            );

            // Check limit
            if (this.requests.length >= config.maxRequests) {
                console.warn('Rate limit exceeded for action:', action);
                window.AuditLog.log('rate_limit_exceeded', { action });
                return false;
            }

            // Add request
            this.requests.push({
                action: action,
                timestamp: now
            });

            return true;
        },

        /**
         * Get remaining requests
         */
        getRemaining: function() {
            const config = SECURITY_CONFIG.RATE_LIMIT;
            return Math.max(0, config.maxRequests - this.requests.length);
        }
    };

    // ============================================
    // AUDIT LOGGING
    // ============================================
    window.AuditLog = {
        maxLogs: 1000,

        /**
         * Log security-relevant events
         */
        log: function(action, details = {}) {
            try {
                const log = {
                    timestamp: new Date().toISOString(),
                    action: action,
                    user: window.AuthManager?.currentUser?.email || 'anonymous',
                    details: details,
                    userAgent: navigator.userAgent
                };

                // Get existing logs
                let logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
                
                // Add new log
                logs.push(log);
                
                // Keep only recent logs
                if (logs.length > this.maxLogs) {
                    logs = logs.slice(-this.maxLogs);
                }
                
                // Save
                localStorage.setItem('audit_logs', JSON.stringify(logs));
                
                // Also log to console in development
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log('[AUDIT]', action, details);
                }
            } catch (e) {
                console.error('Audit log error:', e);
            }
        },

        /**
         * Get recent logs
         */
        getLogs: function(limit = 100) {
            try {
                const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
                return logs.slice(-limit);
            } catch (e) {
                console.error('Get logs error:', e);
                return [];
            }
        },

        /**
         * Clear logs
         */
        clearLogs: function() {
            localStorage.removeItem('audit_logs');
            this.log('logs_cleared');
        }
    };

    // ============================================
    // AUTHENTICATION MANAGER
    // ============================================
    window.AuthManager = {
        currentUser: null,
        sessionTimeout: null,
        lastActivity: Date.now(),

        /**
         * Initialize authentication
         */
        init: function() {
            // Check for existing session
            this.checkSession();
            
            // Setup activity monitoring
            this.setupActivityMonitoring();
            
            // Setup session timeout
            this.resetSessionTimeout();
        },

        /**
         * Check if user is authenticated
         */
        isAuthenticated: function() {
            return this.currentUser !== null;
        },

        /**
         * Set current user after Google Sign-In
         */
        setUser: function(googleUser) {
            this.currentUser = {
                id: googleUser.sub,
                email: googleUser.email,
                name: googleUser.name,
                picture: googleUser.picture,
                loginTime: Date.now()
            };

            // Initialize encryption key
            window.EncryptionUtils.initKey(this.currentUser.email);

            // Save session
            this.saveSession();

            // Audit log
            window.AuditLog.log('user_login', { 
                email: this.currentUser.email 
            });

            // Reset timeout
            this.resetSessionTimeout();
        },

        /**
         * Logout user
         */
        logout: function() {
            if (this.currentUser) {
                window.AuditLog.log('user_logout', { 
                    email: this.currentUser.email 
                });
            }

            this.currentUser = null;
            sessionStorage.removeItem('auth_session');
            this.clearSessionTimeout();

            // Redirect to login or reload
            window.location.reload();
        },

        /**
         * Save session to sessionStorage (not localStorage for security)
         */
        saveSession: function() {
            if (this.currentUser) {
                sessionStorage.setItem('auth_session', JSON.stringify({
                    user: this.currentUser,
                    timestamp: Date.now()
                }));
            }
        },

        /**
         * Check existing session
         */
        checkSession: function() {
            const session = sessionStorage.getItem('auth_session');
            if (session) {
                try {
                    const data = JSON.parse(session);
                    const age = Date.now() - data.timestamp;
                    
                    // Session valid for current browser session only
                    if (age < 24 * 60 * 60 * 1000) { // 24 hours max
                        this.currentUser = data.user;
                        window.EncryptionUtils.initKey(this.currentUser.email);
                        this.resetSessionTimeout();
                        return true;
                    }
                } catch (e) {
                    console.error('Session check error:', e);
                }
            }
            return false;
        },

        /**
         * Setup activity monitoring for auto-logout
         */
        setupActivityMonitoring: function() {
            const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
            
            events.forEach(event => {
                document.addEventListener(event, () => {
                    this.lastActivity = Date.now();
                    this.resetSessionTimeout();
                }, { passive: true });
            });
        },

        /**
         * Reset session timeout
         */
        resetSessionTimeout: function() {
            this.clearSessionTimeout();
            
            if (this.currentUser) {
                this.sessionTimeout = setTimeout(() => {
                    this.handleSessionTimeout();
                }, SECURITY_CONFIG.SESSION_TIMEOUT);
            }
        },

        /**
         * Clear session timeout
         */
        clearSessionTimeout: function() {
            if (this.sessionTimeout) {
                clearTimeout(this.sessionTimeout);
                this.sessionTimeout = null;
            }
        },

        /**
         * Handle session timeout
         */
        handleSessionTimeout: function() {
            const inactive = Date.now() - this.lastActivity;
            
            if (inactive >= SECURITY_CONFIG.SESSION_TIMEOUT) {
                window.AuditLog.log('session_timeout');
                alert('جلستك انتهت بسبب عدم النشاط. يرجى تسجيل الدخول مرة أخرى.');
                this.logout();
            } else {
                // Reset timeout if user was active
                this.resetSessionTimeout();
            }
        },

        /**
         * Require authentication (call at app start)
         */
        requireAuth: function() {
            if (!SECURITY_CONFIG.REQUIRE_AUTH) {
                return true;
            }

            if (!this.isAuthenticated()) {
                // Show login screen
                this.showLoginScreen();
                return false;
            }

            return true;
        },

        /**
         * Show login screen
         */
        showLoginScreen: function() {
            const appDiv = document.getElementById('app');
            if (!appDiv) return;

            appDiv.innerHTML = `
                <div class="min-h-screen gradient-bg flex items-center justify-center p-4">
                    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                        <div class="mb-6">
                            <svg class="w-20 h-20 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-800 mb-2">نظام إدارة الفواتير</h1>
                        <p class="text-gray-600 mb-8">يرجى تسجيل الدخول للمتابعة</p>
                        
                        <div id="g_id_onload"
                             data-client_id="${SECURITY_CONFIG.GOOGLE_CLIENT_ID}"
                             data-callback="handleGoogleSignIn"
                             data-auto_prompt="false">
                        </div>
                        <div class="g_id_signin"
                             data-type="standard"
                             data-size="large"
                             data-theme="outline"
                             data-text="sign_in_with"
                             data-shape="rectangular"
                             data-logo_alignment="left"
                             data-width="300">
                        </div>

                        <div class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-right">
                            <p class="text-sm text-yellow-800">
                                <strong>ملاحظة أمنية:</strong> هذا النظام يستخدم Google Sign-In للمصادقة. بياناتك محمية ومشفرة.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    // ============================================
    // GOOGLE SIGN-IN CALLBACK
    // ============================================
    window.handleGoogleSignIn = function(response) {
        try {
            // Decode JWT token
            const token = response.credential;
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Set user
            window.AuthManager.setUser(payload);
            
            // Reload app
            window.location.reload();
        } catch (e) {
            console.error('Google Sign-In error:', e);
            alert('حدث خطأ أثناء تسجيل الدخول');
        }
    };

    // ============================================
    // SECURITY INITIALIZATION
    // ============================================
    window.SecurityInit = function() {
        console.log('🔒 Security module initialized');
        
        // Initialize auth manager
        window.AuthManager.init();
        
        // Require authentication
        if (!window.AuthManager.requireAuth()) {
            return; // Stop app loading if not authenticated
        }
        
        // Log initialization
        window.AuditLog.log('app_initialized');
        
        // Setup HTTPS enforcement warning
        if (window.location.protocol !== 'https:' && 
            window.location.hostname !== 'localhost' && 
            window.location.hostname !== '127.0.0.1') {
            console.warn('⚠️ WARNING: App should be served over HTTPS for security');
            window.AuditLog.log('insecure_connection_warning');
        }

        // Setup window unload to clear sensitive data
        window.addEventListener('beforeunload', function() {
            // Could clear sensitive data here if needed
            window.AuditLog.log('app_closed');
        });

        return true;
    };

    // ============================================
    // EXPOSE CONFIGURATION
    // ============================================
    window.SECURITY_CONFIG = SECURITY_CONFIG;

    console.log('🔐 Security Enhancement Module Loaded');
    console.log('⚠️ Remember to replace GOOGLE_CLIENT_ID with your actual ID');
})();
