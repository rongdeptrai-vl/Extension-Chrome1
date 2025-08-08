// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * SECURE INPUT VALIDATOR - PRODUCTION READY
 * Purpose: Real input validation & security protection
 * Version: 1.0 PRODUCTION SECURE
 * Author: rongdeptrai-dev & GitHub Copilot
 */

// Browser-compatible crypto alternative
const crypto = window.crypto || {
    getRandomValues: function(arr) {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
    }
};

class SecureInputValidator {
    constructor() {
        console.log('🔐 SECURE INPUT VALIDATOR - ANTI SQL INJECTION LOADED!');
        
        // Whitelist patterns (an toàn)
        this.allowedPatterns = {
            username: /^[a-zA-Z0-9_-]{3,20}$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            alphanumeric: /^[a-zA-Z0-9\s\-_.]{1,100}$/,
            numeric: /^[0-9]+$/,
            url: /^https?:\/\/[^\s<>"{}|\\^`[\]]+$/,
            filename: /^[a-zA-Z0-9._-]+$/
        };
        
        // Dangerous patterns (nguy hiểm - cần chặn)
        this.dangerousPatterns = [
            // SQL Injection patterns
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)|('|(\\))/i,
            /((\%27)|(\'))\s*((\%6F)|o|(\%4F))\s*((\%72)|r|(\%52))/i,
            /((\%27)|(\'))\s*union/i,
            /exec(\s|\+)+(s|x)p\w+/i,
            
            // XSS patterns
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            
            // Path traversal
            /\.\.[\/\\]/,
            /\.\.[%2f|%5c]/i,
            
            // Command injection
            /[;&|`$(){}[\]]/,
            /\b(eval|exec|system|shell_exec|passthru)\b/i,
            
            // File inclusion
            /(include|require)(_once)?\s*[\(\[]?\s*[\"\']/i,
            
            // LDAP injection
            /[()=*!&|]/,
            
            // XXE patterns
            /<!ENTITY/i,
            /<!DOCTYPE/i
        ];
        
        // Request size limits
        this.limits = {
            maxStringLength: 10000,
            maxArrayLength: 1000,
            maxObjectDepth: 10
        };
        
        this.stats = {
            totalValidations: 0,
            blockedInputs: 0,
            allowedInputs: 0,
            lastReset: Date.now()
        };
    }

    /**
     * VALIDATE INPUT - Main validation function
     */
    validateInput(input, type = 'text', maxLength = 1000) {
        this.stats.totalValidations++;
        
        try {
            // Null/undefined check
            if (input === null || input === undefined) {
                return { valid: false, reason: 'NULL_INPUT', sanitized: '' };
            }
            
            // Convert to string
            const inputStr = String(input);
            
            // Length check
            if (inputStr.length > maxLength) {
                this.stats.blockedInputs++;
                return { 
                    valid: false, 
                    reason: 'LENGTH_EXCEEDED', 
                    maxLength: maxLength,
                    actualLength: inputStr.length,
                    sanitized: inputStr.substring(0, maxLength)
                };
            }
            
            // Check for dangerous patterns
            for (const pattern of this.dangerousPatterns) {
                if (pattern.test(inputStr)) {
                    this.stats.blockedInputs++;
                    console.warn(`🚨 DANGEROUS INPUT BLOCKED: ${pattern.toString()} in "${inputStr.substring(0, 50)}..."`);
                    return { 
                        valid: false, 
                        reason: 'DANGEROUS_PATTERN', 
                        pattern: pattern.toString(),
                        sanitized: this.sanitizeInput(inputStr)
                    };
                }
            }
            
            // Type-specific validation
            if (type && this.allowedPatterns[type]) {
                if (!this.allowedPatterns[type].test(inputStr)) {
                    this.stats.blockedInputs++;
                    return { 
                        valid: false, 
                        reason: 'TYPE_MISMATCH', 
                        expectedType: type,
                        sanitized: this.sanitizeInput(inputStr)
                    };
                }
            }
            
            this.stats.allowedInputs++;
            return { 
                valid: true, 
                sanitized: this.sanitizeInput(inputStr),
                type: type
            };
            
        } catch (error) {
            console.error('Input validation error:', error);
            this.stats.blockedInputs++;
            return { 
                valid: false, 
                reason: 'VALIDATION_ERROR', 
                error: error.message,
                sanitized: ''
            };
        }
    }

    /**
     * SANITIZE INPUT - Remove dangerous characters
     */
    sanitizeInput(input) {
        if (!input) return '';
        
        return String(input)
            // Remove script tags
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // Remove javascript: protocols
            .replace(/javascript:/gi, '')
            // Remove on event handlers
            .replace(/on\w+\s*=/gi, '')
            // Remove SQL keywords
            .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b/gi, '')
            // Remove dangerous characters
            .replace(/[<>'"&;(){}[\]]/g, '')
            // Remove path traversal
            .replace(/\.\.[\/\\]/g, '')
            // Trim whitespace
            .trim();
    }

    /**
     * VALIDATE PASSWORD STRENGTH
     */
    validatePassword(password) {
        if (!password) {
            return { valid: false, reason: 'EMPTY_PASSWORD', strength: 0 };
        }
        
        const passwordStr = String(password);
        let strength = 0;
        const requirements = [];
        
        // Length check
        if (passwordStr.length >= 8) {
            strength += 2;
            requirements.push('✅ At least 8 characters');
        } else {
            requirements.push('❌ At least 8 characters');
        }
        
        // Uppercase check
        if (/[A-Z]/.test(passwordStr)) {
            strength += 1;
            requirements.push('✅ Contains uppercase');
        } else {
            requirements.push('❌ Contains uppercase');
        }
        
        // Lowercase check
        if (/[a-z]/.test(passwordStr)) {
            strength += 1;
            requirements.push('✅ Contains lowercase');
        } else {
            requirements.push('❌ Contains lowercase');
        }
        
        // Number check
        if (/[0-9]/.test(passwordStr)) {
            strength += 1;
            requirements.push('✅ Contains numbers');
        } else {
            requirements.push('❌ Contains numbers');
        }
        
        // Special character check
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(passwordStr)) {
            strength += 2;
            requirements.push('✅ Contains special characters');
        } else {
            requirements.push('❌ Contains special characters');
        }
        
        // No common patterns
        const commonPatterns = ['123456', 'password', 'admin', 'qwerty'];
        const hasCommonPattern = commonPatterns.some(pattern => 
            passwordStr.toLowerCase().includes(pattern));
        
        if (!hasCommonPattern) {
            strength += 1;
            requirements.push('✅ No common patterns');
        } else {
            requirements.push('❌ No common patterns');
            strength -= 2;
        }
        
        const isValid = strength >= 5;
        
        return {
            valid: isValid,
            strength: Math.max(0, strength),
            maxStrength: 8,
            requirements: requirements,
            level: this.getPasswordLevel(strength)
        };
    }

    /**
     * GET PASSWORD STRENGTH LEVEL
     */
    getPasswordLevel(strength) {
        if (strength >= 7) return 'VERY_STRONG';
        if (strength >= 5) return 'STRONG';
        if (strength >= 3) return 'MEDIUM';
        if (strength >= 1) return 'WEAK';
        return 'VERY_WEAK';
    }

    /**
     * VALIDATE REQUEST PARAMETERS
     */
    validateRequestParams(params) {
        const result = {
            valid: true,
            validatedParams: {},
            errors: [],
            warnings: []
        };
        
        if (!params || typeof params !== 'object') {
            result.valid = false;
            result.errors.push('Invalid parameters object');
            return result;
        }
        
        for (const [key, value] of Object.entries(params)) {
            // Validate parameter name
            const keyValidation = this.validateInput(key, 'alphanumeric', 50);
            if (!keyValidation.valid) {
                result.errors.push(`Invalid parameter name: ${key}`);
                result.valid = false;
                continue;
            }
            
            // Validate parameter value
            const valueValidation = this.validateInput(value, 'text', 1000);
            if (!valueValidation.valid) {
                result.errors.push(`Invalid value for parameter ${key}: ${valueValidation.reason}`);
                if (valueValidation.reason === 'DANGEROUS_PATTERN') {
                    result.valid = false;
                }
            }
            
            result.validatedParams[key] = valueValidation.sanitized;
        }
        
        return result;
    }

    /**
     * VALIDATE FILE UPLOAD
     */
    validateFileUpload(file) {
        if (!file) {
            return { valid: false, reason: 'NO_FILE' };
        }
        
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs', '.php'];
        
        // Check file name
        const nameValidation = this.validateInput(file.name, 'filename', 255);
        if (!nameValidation.valid) {
            return { valid: false, reason: 'INVALID_FILENAME', details: nameValidation };
        }
        
        // Check extension
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        if (dangerousExtensions.includes(extension)) {
            return { valid: false, reason: 'DANGEROUS_EXTENSION', extension: extension };
        }
        
        if (!allowedExtensions.includes(extension)) {
            return { valid: false, reason: 'EXTENSION_NOT_ALLOWED', extension: extension };
        }
        
        // Check file size
        if (file.size > maxSize) {
            return { valid: false, reason: 'FILE_TOO_LARGE', size: file.size, maxSize: maxSize };
        }
        
        return { valid: true, sanitizedName: nameValidation.sanitized };
    }

    /**
     * CREATE SECURE HASH
     */
    createSecureHash(input, salt = null) {
        try {
            const actualSalt = salt || crypto.randomBytes(32).toString('hex');
            const hash = crypto.createHash('sha256');
            hash.update(input + actualSalt);
            return {
                hash: hash.digest('hex'),
                salt: actualSalt
            };
        } catch (error) {
            console.error('Hash creation error:', error);
            return null;
        }
    }

    /**
     * VERIFY SECURE HASH
     */
    verifySecureHash(input, hash, salt) {
        try {
            const testHash = crypto.createHash('sha256');
            testHash.update(input + salt);
            const inputHash = testHash.digest('hex');
            return inputHash === hash;
        } catch (error) {
            console.error('Hash verification error:', error);
            return false;
        }
    }
    
    /**
     * GET VALIDATION STATS
     */
    getStats() {
        return {
            totalValidations: this.stats.totalValidations,
            blockedInputs: this.stats.blockedInputs,
            allowedInputs: this.stats.allowedInputs,
            blockRate: this.stats.totalValidations > 0 ? 
                (this.stats.blockedInputs / this.stats.totalValidations * 100).toFixed(2) + '%' : '0%',
            lastReset: new Date(this.stats.lastReset).toISOString(),
            lastUpdate: new Date().toISOString()
        };
    }
}

module.exports = SecureInputValidator;
