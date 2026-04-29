/**
 * Security Enhancement Module for Billing App
 * Add this script BEFORE the main app script in your index.html
 *
 * Features:
 * - Input sanitization
 * - Data encryption helpers
 * - Rate limiting
 * - Session management helpers
 * - Audit logging
 *
 * NOTE: Authentication is handled entirely by the main app (Google Drive OAuth).
 * This module provides supporting utilities only — it does NOT enforce its own
 * login screen (REQUIRE_AUTH is false). Removing the duplicate handleGoogleSignIn
 * that previously decoded JWTs without signature verification.
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const SECURITY_CONFIG = {
        // Session timeout (30 minutes of inactivity)
        SESSION_TIMEOUT: 30 * 60 * 1000,

        // Rate limiting: max requests per time window
        RATE_LIMIT: {
            maxRequests: 100,
            timeWindow: 60 * 60 * 1000 // 1 hour
        },

        // Encryption helpers enabled
        ENCRYPTION_ENABLED: true,

        // IMPORTANT: Set to false — the main app handles Google Drive OAuth.
        // Enabling this would show a conflicting login screen.
        REQUIRE_AUTH: false
    };

    // ============================================
    // UTILITY: INPUT SANITIZATION
    // ============================================
    window.SecurityUtils = {
        /**
         * Sanitize HTML to prevent XSS attacks
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
        sanitizeNumber: function(value, defaultValue) {
            if (defaultValue === undefined) defaultValue = 0;
            const num = parseFloat(value);
            return isNaN(num) ? defaultValue : num;
        },

        /**
         * Sanitize client name (strict — no HTML tags or angle brackets)
         */
        sanitizeClientName: function(name) {
            if (!name) return '';
            return name.replace(/<[^>]*>/g, '')
                      .replace(/[<>"']/g, '')
                      .trim()
                      .substring(0, 100);
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
         * Initialize encryption key from a user identifier
         */
        initKey: function(userIdentifier) {
            if (!userIdentifier) {
                console.warn('EncryptionUtils: no identifier for key derivation');
                return;
            }
            this.encryptionKey = this.simpleHash(userIdentifier);
        },

        /**
         * Simple hash (for storage scoping — not cryptographic security)
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
         * Encode data for storage (Base64 — not true encryption, just obfuscation)
         * For real encryption, replace with AES via Web Crypto API.
         */
        encrypt: function(data) {
            if (!SECURITY_CONFIG.ENCRYPTION_ENABLED || !this.encryptionKey) {
                return data;
            }
            try {
                const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
                return btoa(unescape(encodeURIComponent(jsonStr)));
            } catch (e) {
                console.error('EncryptionUtils.encrypt error:', e);
                return data;
            }
        },

        /**
         * Decode data from storage
         */
        decrypt: function(encryptedData) {
            if (!SECURITY_CONFIG.ENCRYPTION_ENABLED || !this.encryptionKey) {
                return encryptedData;
            }
            try {
                return decodeURIComponent(escape(atob(encryptedData)));
            } catch (e) {
                console.error('EncryptionUtils.decrypt error:', e);
                return encryptedData;
            }
        }
    };

    // ============================================
    // SECURE STORAGE WRAPPER
    // ============================================
    window.SecureStorage = {
        /**
         * Set item with optional encryption and user scoping
         */
        setItem: function(key, value, userEmail) {
            try {
                const scopedKey = userEmail ? userEmail + '_' + key : key;
                const encrypted = window.EncryptionUtils.encrypt(value);
                localStorage.setItem(scopedKey, encrypted);
                window.AuditLog.log('storage_write', { key: key });
                return true;
            } catch (e) {
                console.error('SecureStorage.setItem error:', e);
                return false;
            }
        },

        /**
         * Get item with decryption and user scoping
         */
        getItem: function(key, userEmail) {
            try {
                const scopedKey = userEmail ? userEmail + '_' + key : key;
                const encrypted = localStorage.getItem(scopedKey);
                if (!encrypted) return null;
                const decrypted = window.EncryptionUtils.decrypt(encrypted);
                window.AuditLog.log('storage_read', { key: key });
                return decrypted;
            } catch (e) {
                console.error('SecureStorage.getItem error:', e);
                return null;
            }
        },

        /**
         * Remove item with user scoping
         */
        removeItem: function(key, userEmail) {
            try {
                const scopedKey = userEmail ? userEmail + '_' + key : key;
                localStorage.removeItem(scopedKey);
                window.AuditLog.log('storage_delete', { key: key });
                return true;
            } catch (e) {
                console.error('SecureStorage.removeItem error:', e);
                return false;
            }
        },

        /**
         * Clear all data scoped to a user
         */
        clearUserData: function(userEmail) {
            if (!userEmail) return;
            const keys = Object.keys(localStorage);
            const userPrefix = userEmail + '_';
            keys.forEach(function(key) {
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
         * Check if a request is within the allowed rate
         */
        isAllowed: function(action) {
            const now = Date.now();
            const config = SECURITY_CONFIG.RATE_LIMIT;

            // Remove requests outside the time window
            this.requests = this.requests.filter(function(req) {
                return now - req.timestamp < config.timeWindow;
            });

            if (this.requests.length >= config.maxRequests) {
                console.warn('RateLimiter: limit exceeded for action:', action);
                window.AuditLog.log('rate_limit_exceeded', { action: action });
                return false;
            }

            this.requests.push({ action: action, timestamp: now });
            return true;
        },

        /**
         * Get remaining allowed requests in current window
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
         * Log a security-relevant event
         */
        log: function(action, details) {
            details = details || {};
            try {
                const log = {
                    timestamp: new Date().toISOString(),
                    action: action,
                    // currentUser comes from the main app's AuthManager or window.AuthManager
                    user: (window.AuthManager && window.AuthManager.currentUser)
                        ? window.AuthManager.currentUser.email
                        : 'anonymous',
                    details: details,
                    userAgent: navigator.userAgent
                };

                let logs = [];
                try {
                    logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
                } catch (_) {}

                logs.push(log);

                if (logs.length > this.maxLogs) {
                    logs = logs.slice(-this.maxLogs);
                }

                localStorage.setItem('audit_logs', JSON.stringify(logs));

                // Console output on localhost only
                if (window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1') {
                    console.log('[AUDIT]', action, details);
                }
            } catch (e) {
                console.error('AuditLog.log error:', e);
            }
        },

        /**
         * Retrieve recent log entries
         */
        getLogs: function(limit) {
            limit = limit || 100;
            try {
                const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
                return logs.slice(-limit);
            } catch (e) {
                console.error('AuditLog.getLogs error:', e);
                return [];
            }
        },

        /**
         * Clear all logs
         */
        clearLogs: function() {
            localStorage.removeItem('audit_logs');
            this.log('logs_cleared');
        }
    };

    // ============================================
    // AUTHENTICATION MANAGER
    // (Utility layer only — does NOT enforce its own login screen.
    //  The main app handles Google Drive OAuth entirely.)
    // ============================================
    window.AuthManager = {
        currentUser: null,
        sessionTimeout: null,
        lastActivity: Date.now(),

        /**
         * Initialise: start activity monitoring and session timeout.
         * Does NOT redirect to a login screen.
         */
        init: function() {
            this.setupActivityMonitoring();
            this.resetSessionTimeout();
            window.AuditLog.log('auth_manager_initialized');
        },

        /**
         * True if the main app has set a current user
         */
        isAuthenticated: function() {
            return this.currentUser !== null;
        },

        /**
         * Called by the main app after a successful Google Drive sign-in
         * to register the user with this module's utilities.
         */
        setUser: function(userInfo) {
            this.currentUser = {
                email: userInfo.email || '',
                name:  userInfo.name  || '',
                loginTime: Date.now()
            };

            window.EncryptionUtils.initKey(this.currentUser.email || 'default');
            window.AuditLog.log('user_login', { email: this.currentUser.email });
            this.resetSessionTimeout();
        },

        /**
         * Clear the current user (called on logout by the main app)
         */
        clearUser: function() {
            if (this.currentUser) {
                window.AuditLog.log('user_logout', { email: this.currentUser.email });
            }
            this.currentUser = null;
            this.clearSessionTimeout();
        },

        /**
         * Setup inactivity monitoring for auto-logout warning
         */
        setupActivityMonitoring: function() {
            var self = this;
            var events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
            events.forEach(function(event) {
                document.addEventListener(event, function() {
                    self.lastActivity = Date.now();
                    self.resetSessionTimeout();
                }, { passive: true });
            });
        },

        /**
         * Reset the inactivity timeout timer
         */
        resetSessionTimeout: function() {
            var self = this;
            this.clearSessionTimeout();

            if (this.currentUser) {
                this.sessionTimeout = setTimeout(function() {
                    self.handleSessionTimeout();
                }, SECURITY_CONFIG.SESSION_TIMEOUT);
            }
        },

        /**
         * Clear the inactivity timeout timer
         */
        clearSessionTimeout: function() {
            if (this.sessionTimeout) {
                clearTimeout(this.sessionTimeout);
                this.sessionTimeout = null;
            }
        },

        /**
         * Handle a session timeout event
         */
        handleSessionTimeout: function() {
            var inactive = Date.now() - this.lastActivity;
            if (inactive >= SECURITY_CONFIG.SESSION_TIMEOUT) {
                window.AuditLog.log('session_timeout');
                // Notify the main app via a custom event instead of a forced reload
                document.dispatchEvent(new CustomEvent('securitySessionTimeout'));
            } else {
                this.resetSessionTimeout();
            }
        }

        // REMOVED: requireAuth() — was showing a conflicting login screen
        // REMOVED: showLoginScreen() — was showing a conflicting login screen
        // REMOVED: saveSession() / checkSession() — main app manages Drive tokens
    };

    // ============================================
    // SESSION TIMEOUT EVENT → MAIN APP HANDLER
    // The main app listens for this event and calls logout() when it fires.
    // ============================================
    document.addEventListener('securitySessionTimeout', function() {
        if (typeof logout === 'function') {
            alert('جلستك انتهت بسبب عدم النشاط. يرجى تسجيل الدخول مرة أخرى.');
            logout();
        }
    });

    // ============================================
    // SECURITY INITIALIZATION
    // Call window.SecurityInit() from the main app's init() function.
    // ============================================
    window.SecurityInit = function() {
        console.log('🔒 Security module initialized');

        window.AuthManager.init();
        window.AuditLog.log('security_module_initialized');

        // Warn if not on HTTPS in production
        if (window.location.protocol !== 'https:' &&
            window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1') {
            console.warn('⚠️ WARNING: App should be served over HTTPS for security');
            window.AuditLog.log('insecure_connection_warning');
        }

        window.addEventListener('beforeunload', function() {
            window.AuditLog.log('app_closed');
        });

        return true; // always returns true — auth check is handled by main app
    };

    // REMOVED: window.handleGoogleSignIn
    // The previous version decoded Google JWTs using atob() without verifying
    // the signature, allowing a crafted fake JWT to be accepted. The main app
    // uses google.accounts.oauth2.initTokenClient which returns a verified
    // access token directly — no JWT decoding is needed here.

    window.SECURITY_CONFIG = SECURITY_CONFIG;

    console.log('🔐 Security Enhancement Module Loaded (v2 — auth-safe)');
})();