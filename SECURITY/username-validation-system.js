// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * USERNAME VALIDATION SYSTEM
 * Validates employee name format for TINI system
 */

class UsernameValidationSystem {
    constructor() {
        this.patterns = {
            // Chinese Name + Vietnamese Name + ID format
            standard: /^[\u4e00-\u9fa5\s]+\s+[A-ZÀ-ỹ\s]+-\d{1,3}$/,
            // Alternative format with dash
            alternative: /^[A-ZÀ-ỹ\s]+-\d{2,3}$/,
            // Admin/Boss format
            admin: /^(admin|boss|staff)$/i
        };
        
        this.lengthLimits = {
            min: 5,
            max: 50
        };
    }
    
    validateUsername(username) {
        const result = {
            isValid: false,
            errors: [],
            format: null
        };
        
        // Basic length check
        if (!username || username.length < this.lengthLimits.min) {
            result.errors.push(`Username must be at least ${this.lengthLimits.min} characters`);
            return result;
        }
        
        if (username.length > this.lengthLimits.max) {
            result.errors.push(`Username must not exceed ${this.lengthLimits.max} characters`);
            return result;
        }
        
        // Check admin/boss format
        if (this.patterns.admin.test(username)) {
            result.isValid = true;
            result.format = 'admin';
            return result;
        }
        
        // Check standard employee format (Chinese + Vietnamese + ID)
        if (this.patterns.standard.test(username)) {
            result.isValid = true;
            result.format = 'employee_standard';
            return result;
        }
        
        // Check alternative format (Vietnamese + ID only)
        if (this.patterns.alternative.test(username)) {
            result.isValid = true;
            result.format = 'employee_alternative';
            return result;
        }
        
        // If none match, provide helpful error
        result.errors.push('Invalid username format. Valid formats:');
        result.errors.push('• Admin: admin, boss, staff');
        result.errors.push('• Employee: "潘文勇 VĂN DŨNG 79" or "VĂN DŨNG-79"');
        
        return result;
    }
    
    sanitizeUsername(username) {
        if (!username) return '';
        
        // Remove extra spaces
        return username.trim().replace(/\s+/g, ' ');
    }
}

module.exports = UsernameValidationSystem;
