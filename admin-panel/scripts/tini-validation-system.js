// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: ebdabf3 | Time: 2025-08-09T05:09:14Z
// Watermark: TINI_1754716154_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI Validation System - Browser Compatible
// Khắc phục lỗi content script injection

class TiniValidationSystem {
    constructor() {
        this.validationRules = new Map();
        this.securityPatterns = new Set();
        this.init();
    }
    
    init() {
        console.log('🔍 TINI Validation System initialized');
        this.setupValidationRules();
    }
    
    setupValidationRules() {
        // Basic validation rules
        this.validationRules.set('username', {
            minLength: 3,
            maxLength: 50,
            pattern: /^[a-zA-Z0-9_-]+$/,
            required: true
        });
        
        this.validationRules.set('password', {
            minLength: 8,
            maxLength: 128,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            required: true
        });
        
        this.validationRules.set('email', {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            required: true
        });
        
        console.log('✅ Validation rules configured');
    }
    
    validate(field, value) {
        const rule = this.validationRules.get(field);
        if (!rule) return { valid: true };
        
        const errors = [];
        
        if (rule.required && (!value || value.trim() === '')) {
            errors.push(`${field} is required`);
        }
        
        if (value && rule.minLength && value.length < rule.minLength) {
            errors.push(`${field} must be at least ${rule.minLength} characters`);
        }
        
        if (value && rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${field} must not exceed ${rule.maxLength} characters`);
        }
        
        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${field} format is invalid`);
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    validateForm(formData) {
        const results = {};
        let allValid = true;
        
        for (const [field, value] of Object.entries(formData)) {
            const result = this.validate(field, value);
            results[field] = result;
            if (!result.valid) allValid = false;
        }
        
        return {
            valid: allValid,
            fields: results
        };
    }
    
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }
    
    getStatus() {
        return {
            active: true,
            loaded: true,
            initialized: true,
            rules: this.validationRules.size
        };
    }
}

// Make available globally
window.TiniValidationSystem = TiniValidationSystem;

// Auto-initialize
if (typeof window !== 'undefined') {
    window.tiniValidator = new TiniValidationSystem();
    console.log('🔍 TINI Validation System ready');
}
