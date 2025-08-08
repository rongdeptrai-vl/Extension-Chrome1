// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited

// ⚠️ XSS WARNING: innerHTML usage detected - potential XSS vulnerability
// Use window.secureSetHTML(element, content) instead of element.innerHTML = content
// Or use element.textContent for plain text

// ⚠️ SECURITY WARNING: localStorage usage detected
// Consider using secure storage methods to prevent XSS attacks
// Use window.secureSetStorage(), window.secureGetStorage(), window.secureRemoveStorage()
/**
 * TINI INPUT VALIDATION & SANITIZATION SYSTEM
 * Ngăn chặn XSS, SQL Injection và các attack vectors khác
 * Author: rongdeptrai-dev
 * Version: 1.0 - Security Critical
 */

(function() {
    'use strict';

    // Ensure TINI namespace exists
    if (typeof window !== 'undefined') {
        window.TINI_SYSTEM = window.TINI_SYSTEM || {};
    } else if (typeof global !== 'undefined') {
        global.TINI_SYSTEM = global.TINI_SYSTEM || {};
    }

    const TINI = (typeof window !== 'undefined') ? window.TINI_SYSTEM : global.TINI_SYSTEM;

    // Main validation and sanitization class
    class TINIValidator {
        constructor() {
            this.patterns = {
                email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                username: /^[a-zA-Z0-9_-]{3,20}$/,
                password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                employeeId: /^[A-Z0-9]{2,10}-[0-9]{1,3}$/,
                deviceId: /^[a-zA-Z0-9]{8,32}$/,
                port: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
                ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
                jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
            };

            this.dangerousPatterns = [
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                /javascript:/gi,
                /vbscript:/gi,
                /on\w+\s*=/gi,
                /eval\s*\(/gi,
                /expression\s*\(/gi,
                /url\s*\(/gi,
                /import\s*\(/gi,
                /<iframe/gi,
                /<object/gi,
                /<embed/gi,
                /<link/gi,
                /<meta/gi,
                /document\./gi,
                /window\./gi,
                /alert\s*\(/gi,
                /confirm\s*\(/gi,
                /prompt\s*\(/gi
            ];
        
            this.sqlPatterns = [
                /('|\\')|(;)|(\-\-)|(\s+(or|and)\s+)/gi,
                /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi,
                /[*;|&]/gi
            ];
        }

        // Main validation function
        validate(input, type, options = {}) {
            const result = {
                isValid: false,
                sanitized: '',
                errors: [],
                warnings: []
            };

            try {
                // Null/undefined check
                if (input === null || input === undefined) {
                    result.errors.push('Input cannot be null or undefined');
                    return result;
                }

                // Convert to string for processing
                let value = String(input).trim();

                // Length validation
                if (options.minLength && value.length < options.minLength) {
                    result.errors.push(`Minimum length is ${options.minLength}`);
                }
                if (options.maxLength && value.length > options.maxLength) {
                    result.errors.push(`Maximum length is ${options.maxLength}`);
                }

                // Type-specific validation
                switch (type) {
                    case 'email':
                        result.isValid = this.patterns.email.test(value);
                        if (!result.isValid) result.errors.push('Invalid email format');
                        break;

                    case 'username':
                        result.isValid = this.patterns.username.test(value);
                        if (!result.isValid) result.errors.push('Username must be 3-20 characters, alphanumeric, underscore, or dash only');
                        break;

                    case 'password':
                        result.isValid = this.patterns.password.test(value);
                        if (!result.isValid) result.errors.push('Password must contain at least 8 characters with uppercase, lowercase, number, and special character');
                        break;

                    case 'employeeId':
                        result.isValid = this.patterns.employeeId.test(value);
                        if (!result.isValid) result.errors.push('Employee ID format: ABC123-45');
                        break;

                    case 'deviceId':
                        result.isValid = this.patterns.deviceId.test(value);
                        if (!result.isValid) result.errors.push('Device ID must be 8-32 alphanumeric characters');
                        break;

                    case 'port':
                        result.isValid = this.patterns.port.test(value);
                        if (!result.isValid) result.errors.push('Port must be between 1-65535');
                        break;

                    case 'ip':
                        result.isValid = this.patterns.ipAddress.test(value);
                        if (!result.isValid) result.errors.push('Invalid IP address format');
                        break;

                    case 'url':
                        result.isValid = this.patterns.url.test(value);
                        if (!result.isValid) result.errors.push('Invalid URL format');
                        break;

                    case 'jwt':
                        result.isValid = this.patterns.jwt.test(value);
                        if (!result.isValid) result.errors.push('Invalid JWT token format');
                        break;

                    case 'text':
                    case 'string':
                    default:
                        result.isValid = true; // Default to valid for general text
                        break;
                }

                // Security checks
                const securityCheck = this.checkSecurity(value);
                if (!securityCheck.isSafe) {
                    result.isValid = false;
                    result.errors.push(...securityCheck.threats);
                }

                // Sanitization
                result.sanitized = this.sanitize(value, type);

                // Final validation check
                if (result.errors.length === 0) {
                    result.isValid = true;
                }

            } catch (error) {
                result.errors.push(`Validation error: ${error.message}`);
            }

            return result;
        }

        // Security threat detection
        checkSecurity(input) {
            const result = {
                isSafe: true,
                threats: []
            };

            // Check for XSS patterns
            this.dangerousPatterns.forEach(pattern => {
                if (pattern.test(input)) {
                    result.isSafe = false;
                    result.threats.push('Potential XSS attack detected');
                }
            });

            // Check for SQL injection patterns
            this.sqlPatterns.forEach(pattern => {
                if (pattern.test(input)) {
                    result.isSafe = false;
                    result.threats.push('Potential SQL injection detected');
                }
            });

            // Check for excessive length (DoS protection)
            if (input.length > 10000) {
                result.isSafe = false;
                result.threats.push('Input too long - potential DoS attack');
            }

            return result;
        }

        // Sanitization function
        sanitize(input, type) {
            let sanitized = String(input);

            // HTML entity encoding
            sanitized = sanitized
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');

            // Remove null bytes
            sanitized = sanitized.replace(/\0/g, '');

            // Type-specific sanitization
            switch (type) {
                case 'filename':
                    sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '');
                    break;

                case 'path':
                    sanitized = sanitized.replace(/\.\./g, '');
                    break;

                case 'sql':
                    sanitized = sanitized.replace(/['";\\]/g, '');
                    break;

                case 'numeric':
                    sanitized = sanitized.replace(/[^0-9.-]/g, '');
                    break;

                case 'alphanumeric':
                    sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, '');
                    break;
            }

            return sanitized;
        }

        // Safe innerHTML replacement
        safeInnerHTML(element, content) {
            if (!element) return false;

            // Validate content first
            const validation = this.validate(content, 'text', { maxLength: 5000 });
            
            if (!validation.isValid) {
                console.error('Unsafe content blocked:', validation.errors);
                return false;
            }

            // Use textContent instead of innerHTML for safety
            element.textContent = validation.sanitized;
            return true;
        }

        // Safe value setter for form inputs
        safeSetValue(element, value, type = 'text') {
            if (!element) return false;

            const validation = this.validate(value, type);
            
            if (!validation.isValid) {
                console.error('Invalid input blocked:', validation.errors);
                return false;
            }

            element.value = validation.sanitized;
            return true;
        }

        // Form validation
        validateForm(formData, schema) {
            const results = {
                isValid: true,
                errors: {},
                sanitized: {}
            };

            Object.keys(schema).forEach(field => {
                const fieldSchema = schema[field];
                const value = formData[field];

                const validation = this.validate(value, fieldSchema.type, fieldSchema.options);
                
                if (!validation.isValid) {
                    results.isValid = false;
                    results.errors[field] = validation.errors;
                }

                results.sanitized[field] = validation.sanitized;
            });

            return results;
        }
    }

    // Initialize validator
    TINI.validator = new TINIValidator();

    // Safe global functions to replace dangerous ones
    TINI.safe = {
        // Safe localStorage wrapper
        localStorage: {
            setItem: function(key, value) {
                const validation = TINI.validator.validate(key, 'alphanumeric', { maxLength: 100 });
                if (!validation.isValid) {
                    console.error('Invalid localStorage key:', validation.errors);
                    return false;
                }

                try {
                    const sanitizedValue = JSON.stringify(value);
                    localStorage.setItem(validation.sanitized, sanitizedValue);
                    return true;
                } catch (error) {
                    console.error('localStorage setItem failed:', error);
                    return false;
                }
            },

            getItem: function(key) {
                const validation = TINI.validator.validate(key, 'alphanumeric', { maxLength: 100 });
                if (!validation.isValid) {
                    console.error('Invalid localStorage key:', validation.errors);
                    return null;
                }

                try {
                    const value = localStorage.getItem(validation.sanitized);
                    return value ? JSON.parse(value) : null;
                } catch (error) {
                    console.error('localStorage getItem failed:', error);
                    return null;
                }
            }
        },

        // Safe DOM manipulation
        dom: {
            setText: function(element, text) {
                return TINI.validator.safeInnerHTML(element, text);
            },

            setValue: function(element, value, type) {
                return TINI.validator.safeSetValue(element, value, type);
            },

            createElement: function(tagName, attributes = {}) {
                const validation = TINI.validator.validate(tagName, 'alphanumeric');
                if (!validation.isValid) {
                    console.error('Invalid tag name:', validation.errors);
                    return null;
                }

                const element = document.createElement(validation.sanitized);
                
                Object.keys(attributes).forEach(attr => {
                    const attrValidation = TINI.validator.validate(attributes[attr], 'text', { maxLength: 1000 });
                    if (attrValidation.isValid) {
                        element.setAttribute(attr, attrValidation.sanitized);
                    }
                });

                return element;
            }
        }
    };

    console.log('🛡️ TINI Validation & Sanitization System Loaded');
    console.log('✅ XSS protection active');
    console.log('✅ SQL injection protection active');
    console.log('✅ Input validation ready');

})();

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = (typeof window !== 'undefined') ? window.TINI_SYSTEM.validator : global.TINI_SYSTEM.validator;
}
