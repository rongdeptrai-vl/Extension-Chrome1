// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - CONFIDENTIAL
// TINI XSS Protection & Secure DOM Utilities
// Author: Security Team
// Version: 1.0

/**
 * Secure DOM manipulation utilities to prevent XSS attacks
 */
class TINISecureDOM {
    constructor() {
        this.version = '1.0';
        this.initSecureStorage();
    }

    /**
     * Safely set HTML content with XSS protection
     * @param {HTMLElement} element - Target element
     * @param {string} content - HTML content to set
     */
    secureSetHTML(element, content) {
        if (!element || typeof content !== 'string') {
            console.error('TINI Security: Invalid parameters for secureSetHTML');
            return false;
        }

        // Basic XSS protection - remove script tags and event handlers
        const sanitized = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
            .replace(/on\w+\s*=\s*'[^']*'/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/data:text\/html/gi, '');

        element.innerHTML = sanitized;
        return true;
    }

    /**
     * Safely set text content (XSS-safe)
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text content to set
     */
    secureSetText(element, text) {
        if (!element || typeof text !== 'string') {
            console.error('TINI Security: Invalid parameters for secureSetText');
            return false;
        }
        
        element.textContent = text;
        return true;
    }

    /**
     * Secure localStorage wrapper
     */
    initSecureStorage() {
        if (typeof window === 'undefined') return;

        window.secureSetStorage = (key, value) => {
            try {
                if (typeof key !== 'string' || key.length === 0) {
                    throw new Error('Invalid storage key');
                }
                
                // Encrypt sensitive data (basic implementation)
                const encrypted = btoa(JSON.stringify({
                    data: value,
                    timestamp: Date.now(),
                    checksum: this.generateChecksum(value)
                }));
                
                localStorage.setItem(`tini_${key}`, encrypted);
                return true;
            } catch (error) {
                console.error('TINI Security: Storage error:', error);
                return false;
            }
        };

        window.secureGetStorage = (key) => {
            try {
                const encrypted = localStorage.getItem(`tini_${key}`);
                if (!encrypted) return null;
                
                const decrypted = JSON.parse(atob(encrypted));
                
                // Verify checksum
                if (decrypted.checksum !== this.generateChecksum(decrypted.data)) {
                    console.warn('TINI Security: Storage checksum mismatch');
                    return null;
                }
                
                return decrypted.data;
            } catch (error) {
                console.error('TINI Security: Storage retrieval error:', error);
                return null;
            }
        };

        window.secureRemoveStorage = (key) => {
            try {
                localStorage.removeItem(`tini_${key}`);
                return true;
            } catch (error) {
                console.error('TINI Security: Storage removal error:', error);
                return false;
            }
        };

        // Secure HTML setter
        window.secureSetHTML = (element, content) => {
            return this.secureSetHTML(element, content);
        };
    }

    /**
     * Generate simple checksum for data integrity
     * @param {any} data - Data to generate checksum for
     * @returns {string} Checksum
     */
    generateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }

    /**
     * Validate and sanitize user input
     * @param {string} input - User input to validate
     * @param {object} options - Validation options
     * @returns {object} Validation result
     */
    validateInput(input, options = {}) {
        const defaults = {
            maxLength: 1000,
            allowHTML: false,
            allowSpecialChars: true,
            patterns: []
        };
        
        const config = { ...defaults, ...options };
        const result = {
            valid: true,
            sanitized: input,
            errors: []
        };

        if (typeof input !== 'string') {
            result.valid = false;
            result.errors.push('Input must be a string');
            return result;
        }

        // Length check
        if (input.length > config.maxLength) {
            result.valid = false;
            result.errors.push(`Input exceeds maximum length of ${config.maxLength}`);
        }

        // HTML check
        if (!config.allowHTML && /<[^>]*>/g.test(input)) {
            result.valid = false;
            result.errors.push('HTML tags are not allowed');
            result.sanitized = input.replace(/<[^>]*>/g, '');
        }

        // XSS patterns check
        const xssPatterns = [
            /javascript:/gi,
            /vbscript:/gi,
            /on\w+\s*=/gi,
            /<script/gi,
            /eval\s*\(/gi,
            /expression\s*\(/gi
        ];

        for (const pattern of xssPatterns) {
            if (pattern.test(input)) {
                result.valid = false;
                result.errors.push('Potentially malicious content detected');
                result.sanitized = input.replace(pattern, '');
            }
        }

        return result;
    }
}

// Initialize secure DOM utilities
if (typeof window !== 'undefined') {
    window.TINISecureDOM = new TINISecureDOM();
    console.log('✅ TINI Secure DOM utilities loaded');
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINISecureDOM;
}
