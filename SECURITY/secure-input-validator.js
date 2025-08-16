// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// ST:TINI_1754752705_e868a412

/**
 * 🛡️ TINI Secure Input Validator - Enterprise Security
 * Validates and sanitizes all input to prevent security threats
 */
class SecureInputValidator {
    constructor() {
        this.isInitialized = true;
        this.patterns = {
            xss: /<script[^>]*>.*?<\/script>/gi,
            sql: /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi,
            injection: /['";\-\-\/\*\*\/]/g,
            suspicious: /(eval|function|constructor|prototype)/gi
        };
    }

    // Validate and sanitize input
    validateInput(input, type = 'text') {
        if (!input || typeof input !== 'string') {
            return { isValid: false, sanitized: '', errors: ['Invalid input type'] };
        }

        const errors = [];
        let sanitized = input;

        // XSS Protection
        if (this.patterns.xss.test(input)) {
            errors.push('XSS attempt detected');
            sanitized = sanitized.replace(this.patterns.xss, '');
        }

        // SQL Injection Protection
        if (this.patterns.sql.test(input)) {
            errors.push('SQL injection attempt detected');
            sanitized = sanitized.replace(this.patterns.sql, '');
        }

        // General injection protection
        if (this.patterns.injection.test(input)) {
            errors.push('Injection attempt detected');
            sanitized = sanitized.replace(this.patterns.injection, '');
        }

        // Suspicious pattern detection
        if (this.patterns.suspicious.test(input)) {
            errors.push('Suspicious pattern detected');
            sanitized = sanitized.replace(this.patterns.suspicious, '');
        }

        return {
            isValid: errors.length === 0,
            sanitized: sanitized.trim(),
            errors: errors
        };
    }

    // Validate specific input types
    validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email) && this.validateInput(email).isValid;
    }

    validatePassword(password) {
        const result = this.validateInput(password);
        if (!result.isValid) return false;
        
        // Password strength check
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 8;

        return hasLower && hasUpper && hasNumber && hasSpecial && isLongEnough;
    }

    validateUsername(username) {
        const usernamePattern = /^[a-zA-Z0-9_-]{3,20}$/;
        return usernamePattern.test(username) && this.validateInput(username).isValid;
    }

    // Validate request parameters (for use in real-working-security.js)
    validateRequestParams(req) {
        try {
            const errors = [];
            let sanitized = {};

            // Validate URL parameters
            if (req.query) {
                for (const [key, value] of Object.entries(req.query)) {
                    const validation = this.validateInput(value);
                    if (!validation.isValid) {
                        errors.push(...validation.errors);
                    }
                    sanitized[key] = validation.sanitized;
                }
            }

            // Validate body parameters
            if (req.body) {
                for (const [key, value] of Object.entries(req.body)) {
                    if (typeof value === 'string') {
                        const validation = this.validateInput(value);
                        if (!validation.isValid) {
                            errors.push(...validation.errors);
                        }
                        sanitized[key] = validation.sanitized;
                    } else {
                        sanitized[key] = value; // Non-string values pass through
                    }
                }
            }

            return {
                valid: errors.length === 0,
                sanitized: sanitized,
                errors: errors
            };
        } catch (error) {
            return {
                valid: false,
                sanitized: {},
                errors: ['Validation error: ' + error.message]
            };
        }
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureInputValidator;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.SecureInputValidator = SecureInputValidator;
}