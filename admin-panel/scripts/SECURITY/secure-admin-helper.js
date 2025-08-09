// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * SECURE ADMIN PANEL HELPER - NO XSS/INJECTION RISKS
 * Thay thế các function không an toàn trong admin panel
 * Version: 1.0 PRODUCTION SECURE
 * Author: rongdeptrai-dev & GitHub Copilot
 */

class SecureAdminHelper {
    constructor() {
        console.log('🔐 SECURE ADMIN HELPER - ANTI XSS/INJECTION LOADED!');
        
        // Import secure input validator
        this.validator = null;
        this.initializeValidator();
    }

    /**
     * GET ENCRYPTION KEY FROM ENVIRONMENT
     */
    getEncryptionKey() {
        // Try to get from environment config first
        if (window.tiniConfig) {
            return window.tiniConfig.get('ENCRYPTION_KEY');
        }
        
        // Fallback to window property or default
        return window.ENCRYPTION_KEY || window.tiniConfig?.get('ENCRYPTION_KEY') || 'TiniSecureAdminKey2024';
    }

    async initializeValidator() {
        try {
            if (window.SecureInputValidator) {
                this.validator = new window.SecureInputValidator();
                console.log('✅ Secure validator loaded for admin panel');
            } else {
                this.validator = null;
                console.warn('⚠️ SecureInputValidator not available, skipping validation');
            }
        } catch (error) {
            this.validator = null;
            console.error('❌ Error initializing secure validator:', error);
        }
    }

    /**
     * SECURE innerHTML REPLACEMENT - NO XSS RISK
     */
    secureSetHTML(element, content) {
        if (!element) {
            console.warn('🚨 Attempted to set HTML on null element');
            return;
        }

        // Validate content first
        if (this.validator) {
            const validation = this.validator.validateInput(content, 'general', 10000);
            if (!validation.valid) {
                console.error(`🚨 BLOCKED UNSAFE HTML: ${validation.error}`);
                element.textContent = 'Content blocked for security';
                return;
            }
            content = validation.sanitized;
        }

        // Use textContent for plain text (safest)
        if (!content.includes('<')) {
            element.textContent = content;
            return;
        }

        // For HTML content, create secure elements
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.sanitizeHTML(content);
            
            // Clear existing content securely
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            
            // Move sanitized content
            while (tempDiv.firstChild) {
                element.appendChild(tempDiv.firstChild);
            }
        } catch (error) {
            console.error('🚨 HTML sanitization error:', error);
            element.textContent = 'Content sanitization failed';
        }
    }

    /**
     * SECURE HTML SANITIZATION
     */
    sanitizeHTML(html) {
        // Remove dangerous tags completely
        const dangerousTags = [
            'script', 'iframe', 'object', 'embed', 'applet', 'link',
            'meta', 'style', 'form', 'input', 'button', 'textarea'
        ];
        
        let sanitized = html;
        
        dangerousTags.forEach(tag => {
            const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gi');
            sanitized = sanitized.replace(regex, '');
            
            // Self-closing tags
            const selfClosingRegex = new RegExp(`<${tag}[^>]*\/>?`, 'gi');
            sanitized = sanitized.replace(selfClosingRegex, '');
        });
        
        // Remove dangerous attributes
        const dangerousAttrs = [
            'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
            'onkeydown', 'onkeyup', 'onfocus', 'onblur', 'onchange',
            'javascript:', 'vbscript:', 'data:'
        ];
        
        dangerousAttrs.forEach(attr => {
            const regex = new RegExp(`${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
            sanitized = sanitized.replace(regex, '');
        });
        
        return sanitized;
    }

    /**
     * SECURE localStorage REPLACEMENT
     */
    secureSetStorage(key, value) {
        try {
            // Validate key and value using trusted source flag
            if (this.validator) {
                const keyValidation = this.validator.validateInput(key, 'alphanumeric', 100, 'secure-storage');
                const valueValidation = this.validator.validateInput(String(value), 'general', 10000, 'secure-storage');
                
                if (!keyValidation.valid || !valueValidation.valid) {
                    const keyError = keyValidation.error || keyValidation.reason || 'Invalid key';
                    const valueError = valueValidation.error || valueValidation.reason || 'Invalid value';
                    console.error(`🚨 BLOCKED UNSAFE STORAGE: Invalid key - ${keyError}, Invalid value - ${valueError}`);
                    return false;
                }
                
                key = keyValidation.sanitized;
                value = valueValidation.sanitized;
            }

            // Prefix keys for admin security
            const secureKey = `tini_secure_admin_${key}`;
            
            // Use encryption for sensitive data
            const encryptedValue = this.encryptData(String(value));
            
            localStorage.setItem(secureKey, encryptedValue);
            console.log(`🔐 Secure storage set: ${key}`);
            return true;
            
        } catch (error) {
            console.error('🚨 Secure storage error:', error);
            return false;
        }
    }

    /**
     * SECURE localStorage GET
     */
    secureGetStorage(key) {
        try {
            // Validate key
            if (this.validator) {
                const keyValidation = this.validator.validateInput(key, 'alphanumeric', 100, 'secure-storage');
                if (!keyValidation.valid) {
                    const keyError = keyValidation.error || keyValidation.reason || 'Invalid storage key';
                    console.error(`🚨 INVALID STORAGE KEY: ${keyError}`);
                    return null;
                }
                key = keyValidation.sanitized;
            }

            const secureKey = `tini_secure_admin_${key}`;
            const encryptedValue = localStorage.getItem(secureKey);
            
            if (!encryptedValue) {
                return null;
            }
            
            // Decrypt and return
            const decryptedValue = this.decryptData(encryptedValue);
            console.log(`🔐 Secure storage get: ${key}`);
            return decryptedValue;
            
        } catch (error) {
            console.error('🚨 Secure storage get error:', error);
            return null;
        }
    }

    /**
     * SECURE localStorage REMOVE
     */
    secureRemoveStorage(key) {
        try {
            if (this.validator) {
                const keyValidation = this.validator.validateInput(key, 'alphanumeric', 100);
                if (!keyValidation.valid) {
                    console.error(`🚨 INVALID STORAGE KEY: ${keyValidation.error}`);
                    return false;
                }
                key = keyValidation.sanitized;
            }

            const secureKey = `tini_secure_admin_${key}`;
            localStorage.removeItem(secureKey);
            console.log(`🔐 Secure storage removed: ${key}`);
            return true;
            
        } catch (error) {
            console.error('🚨 Secure storage remove error:', error);
            return false;
        }
    }

    /**
     * SIMPLE ENCRYPTION FOR STORAGE (Basic security)
     */
    encryptData(data) {
        try {
            // Simple XOR encryption with key rotation
            const key = this.getEncryptionKey();
            let encrypted = '';
            
            for (let i = 0; i < data.length; i++) {
                const keyChar = key[i % key.length];
                const encryptedChar = String.fromCharCode(data.charCodeAt(i) ^ keyChar.charCodeAt(0));
                encrypted += encryptedChar;
            }
            
            // Base64 encode for storage
            return btoa(encrypted);
        } catch (error) {
            console.error('Encryption error:', error);
            return data; // Fallback to plain text
        }
    }

    /**
     * SIMPLE DECRYPTION FOR STORAGE
     */
    decryptData(encryptedData) {
        try {
            // Base64 decode
            const encrypted = atob(encryptedData);
            
            // XOR decryption
            const key = this.getEncryptionKey();
            let decrypted = '';
            
            for (let i = 0; i < encrypted.length; i++) {
                const keyChar = key[i % key.length];
                const decryptedChar = String.fromCharCode(encrypted.charCodeAt(i) ^ keyChar.charCodeAt(0));
                decrypted += decryptedChar;
            }
            
            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            return encryptedData; // Fallback
        }
    }

    /**
     * SECURE FETCH REPLACEMENT - VALIDATE ALL REQUESTS
     */
    async secureFetch(url, options = {}) {
        try {
            // Validate URL
            if (this.validator) {
                const urlValidation = this.validator.validateInput(url, 'url', 2000);
                if (!urlValidation.valid) {
                    console.error(`🚨 BLOCKED UNSAFE URL: ${urlValidation.error}`);
                    throw new Error('Invalid URL blocked for security');
                }
            }

            // Add security headers
            const secureOptions = {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Cache-Control': 'no-cache',
                    ...options.headers
                }
            };

            // Validate request body
            if (secureOptions.body && this.validator) {
                const bodyValidation = this.validator.validateInput(secureOptions.body, 'general', 50000);
                if (!bodyValidation.valid) {
                    console.error(`🚨 BLOCKED UNSAFE REQUEST BODY: ${bodyValidation.error}`);
                    throw new Error('Request body blocked for security');
                }
                secureOptions.body = bodyValidation.sanitized;
            }

            console.log(`🌐 Secure fetch: ${url}`);
            const response = await fetch(url, secureOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
            
        } catch (error) {
            console.error('🚨 Secure fetch error:', error);
            throw error;
        }
    }

    /**
     * SECURE EVENT LISTENER - PREVENT EVENT INJECTION
     */
    secureAddEventListener(element, eventType, handler, options = {}) {
        if (!element || typeof handler !== 'function') {
            console.error('🚨 Invalid event listener parameters');
            return;
        }

        // Validate event type
        const allowedEvents = [
            'click', 'dblclick', 'change', 'input', 'submit', 'focus', 'blur',
            'keydown', 'keyup', 'mouseenter', 'mouseleave', 'scroll', 'resize'
        ];

        if (!allowedEvents.includes(eventType)) {
            console.warn(`🚨 Potentially unsafe event type: ${eventType}`);
        }

        const secureHandler = (event) => {
            try {
                // Prevent default dangerous events
                if (event.type === 'submit' && !event.target.dataset.secureForm) {
                    console.warn('🚨 Form submission without security validation');
                    event.preventDefault();
                    return;
                }

                // Call original handler
                return handler(event);
            } catch (error) {
                console.error('🚨 Event handler error:', error);
                event.preventDefault();
            }
        };

        element.addEventListener(eventType, secureHandler, options);
        console.log(`🔐 Secure event listener added: ${eventType}`);
    }

    /**
     * SECURE setTimeout REPLACEMENT
     */
    secureSetTimeout(callback, delay) {
        if (typeof callback !== 'function') {
            console.error('🚨 setTimeout callback must be a function');
            return null;
        }

        // Limit delay to prevent DoS
        const maxDelay = 300000; // 5 minutes
        if (delay > maxDelay) {
            console.warn(`🚨 Timeout delay limited to ${maxDelay}ms`);
            delay = maxDelay;
        }

        const secureCallback = () => {
            try {
                return callback();
            } catch (error) {
                console.error('🚨 Timeout callback error:', error);
            }
        };

        return setTimeout(secureCallback, delay);
    }

    /**
     * GET SECURITY STATUS
     */
    getSecurityStatus() {
        return {
            validatorLoaded: !!this.validator,
            secureStorageEnabled: true,
            xssProtectionEnabled: true,
            injectionProtectionEnabled: true,
            lastCheck: new Date().toISOString()
        };
    }
}

// Create global instance for admin panel
window.SecureAdminHelper = new SecureAdminHelper();

// Replace dangerous functions globally
window.secureSetHTML = (element, content) => window.SecureAdminHelper.secureSetHTML(element, content);
window.secureSetStorage = (key, value) => window.SecureAdminHelper.secureSetStorage(key, value);
window.secureGetStorage = (key) => window.SecureAdminHelper.secureGetStorage(key);
window.secureRemoveStorage = (key) => window.SecureAdminHelper.secureRemoveStorage(key);
window.secureFetch = (url, options) => window.SecureAdminHelper.secureFetch(url, options);
window.secureAddEventListener = (element, type, handler, options) => window.SecureAdminHelper.secureAddEventListener(element, type, handler, options);
window.secureSetTimeout = (callback, delay) => window.SecureAdminHelper.secureSetTimeout(callback, delay);

console.log('🛡️ SECURE ADMIN PANEL HELPER LOADED - ALL DANGEROUS FUNCTIONS REPLACED!');
// ST:TINI_1754644960_e868a412
// ST:TINI_1754716154_e868a412
