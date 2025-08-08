// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI Environment Validation Script
 * Validates environment configuration and checks for security issues
 */

const fs = require('fs');
const path = require('path');

class TiniEnvironmentValidator {
    constructor() {
        this.requiredVars = [
            'ADMIN_PASSWORD',
            'BOSS_PASSWORD', 
            'USER_PASSWORD',
            'ENCRYPTION_KEY',
            'SECRET_KEY',
            'JWT_SECRET',
            'BOSS_LEVEL_TOKEN',
            'SESSION_SECRET'
        ];
        
        this.defaultValues = [
            'CHANGE_THIS',
            'TiniSecureAdminKey2024',
            'TiniSystemSecretKey2024',
            'TiniJWTSecretKey2024',
            'bossLevel10000',
            'TiniSessionSecret2024'
        ];
        
        this.minPasswordLength = 12;
        this.minKeyLength = 24;
    }

    async validateEnvironment() {
        console.log('🔍 TINI Environment Validation Started...\n');
        
        const results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            errors: []
        };
        
        // Check .env file exists
        const envPath = path.join(__dirname, '..', '.env');
        if (!fs.existsSync(envPath)) {
            results.errors.push('❌ .env file not found');
            results.failed++;
        } else {
            console.log('✅ .env file found');
            results.passed++;
        }
        
        // Load environment variables
        require('dotenv').config({ path: envPath });
        
        // Validate required variables
        for (const varName of this.requiredVars) {
            const value = process.env[varName];
            const validation = this.validateVariable(varName, value);
            
            if (validation.status === 'error') {
                console.log(`❌ ${varName}: ${validation.message}`);
                results.errors.push(`${varName}: ${validation.message}`);
                results.failed++;
            } else if (validation.status === 'warning') {
                console.log(`⚠️ ${varName}: ${validation.message}`);
                results.warnings++;
            } else {
                console.log(`✅ ${varName}: Valid`);
                results.passed++;
            }
        }
        
        // Check for default values
        this.checkDefaultValues(results);
        
        // Check file permissions
        this.checkFilePermissions(results);
        
        // Print summary
        this.printSummary(results);
        
        return results;
    }

    validateVariable(name, value) {
        if (!value) {
            return { status: 'error', message: 'Variable not set' };
        }
        
        // Check for default values
        if (this.defaultValues.some(defaultVal => value.includes(defaultVal))) {
            return { status: 'warning', message: 'Using default value - should be changed for production' };
        }
        
        // Password validation
        if (name.includes('PASSWORD')) {
            if (value.length < this.minPasswordLength) {
                return { status: 'error', message: `Password too short (minimum ${this.minPasswordLength} characters)` };
            }
            
            if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value) || !/[!@#$%^&*]/.test(value)) {
                return { status: 'warning', message: 'Password should contain uppercase, lowercase, numbers, and special characters' };
            }
        }
        
        // Key validation
        if (name.includes('KEY') || name.includes('SECRET')) {
            if (value.length < this.minKeyLength) {
                return { status: 'error', message: `Key too short (minimum ${this.minKeyLength} characters)` };
            }
        }
        
        // Token validation
        if (name.includes('TOKEN')) {
            if (value.length < 16) {
                return { status: 'error', message: 'Token too short (minimum 16 characters)' };
            }
        }
        
        return { status: 'ok', message: 'Valid' };
    }

    checkDefaultValues(results) {
        console.log('\n🔍 Checking for default values...');
        
        const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
        
        for (const defaultValue of this.defaultValues) {
            if (envContent.includes(defaultValue)) {
                console.log(`⚠️ Found default value: ${defaultValue}`);
                results.warnings++;
            }
        }
        
        console.log('✅ Default value check completed');
    }

    checkFilePermissions(results) {
        console.log('\n🔍 Checking file permissions...');
        
        try {
            const envPath = path.join(__dirname, '..', '.env');
            const stats = fs.statSync(envPath);
            
            // Check if file is readable by others (basic check)
            if (stats.mode & parseInt('004', 8)) {
                console.log('⚠️ .env file is readable by others - consider restricting permissions');
                results.warnings++;
            } else {
                console.log('✅ .env file permissions look good');
            }
        } catch (error) {
            console.log('⚠️ Could not check file permissions:', error.message);
            results.warnings++;
        }
    }

    printSummary(results) {
        console.log('\n📊 VALIDATION SUMMARY');
        console.log('====================');
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`⚠️ Warnings: ${results.warnings}`);
        console.log(`❌ Failed: ${results.failed}`);
        
        if (results.failed === 0) {
            console.log('\n🎉 Environment validation completed successfully!');
        } else {
            console.log('\n🚨 Environment validation found issues that need attention:');
            results.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        if (results.warnings > 0) {
            console.log('\n💡 Recommendations:');
            console.log('   - Change default values for production');
            console.log('   - Use strong passwords with mixed case, numbers, and symbols');
            console.log('   - Regularly rotate keys and tokens');
            console.log('   - Restrict .env file permissions');
        }
    }

    generateSecureConfig() {
        console.log('\n🔧 Generating secure configuration...');
        
        const generateRandomString = (length = 32) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        const secureConfig = {
            ADMIN_PASSWORD: generateRandomString(16),
            BOSS_PASSWORD: generateRandomString(16),
            USER_PASSWORD: generateRandomString(16),
            STAFF_PASSWORD: generateRandomString(16),
            ENCRYPTION_KEY: generateRandomString(32),
            SECRET_KEY: generateRandomString(32),
            JWT_SECRET: generateRandomString(32),
            SESSION_SECRET: generateRandomString(32),
            BOSS_LEVEL_TOKEN: 'bossLevel10000SecureToken' + generateRandomString(8),
            BOSS_TOKEN_KEY: 'TiniBossTokenKey' + generateRandomString(8)
        };

        console.log('\n🔑 Secure configuration generated:');
        Object.entries(secureConfig).forEach(([key, value]) => {
            console.log(`${key}=${value}`);
        });

        console.log('\n⚠️ Save these values to your .env file and keep them secure!');
        
        return secureConfig;
    }

    async checkMigrationStatus() {
        console.log('\n🔄 Checking migration status...');
        
        const filesToCheck = [
            'SECURITY/secure-admin-helper.js',
            'ultimate-boss-core.js',
            'admin-panel/scripts/admin-panel-main.js'
        ];
        
        let migratedFiles = 0;
        let totalFiles = filesToCheck.length;
        
        for (const file of filesToCheck) {
            const filePath = path.join(__dirname, '..', file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('window.tiniConfig') || content.includes('this.getConfig()')) {
                    console.log(`✅ ${file}: Migrated`);
                    migratedFiles++;
                } else {
                    console.log(`❌ ${file}: Not migrated`);
                }
            } else {
                console.log(`⚠️ ${file}: File not found`);
            }
        }
        
        console.log(`\n📊 Migration Status: ${migratedFiles}/${totalFiles} files migrated`);
        
        return migratedFiles === totalFiles;
    }
}

// CLI interface
async function main() {
    const validator = new TiniEnvironmentValidator();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'validate':
            await validator.validateEnvironment();
            break;
            
        case 'generate':
            validator.generateSecureConfig();
            break;
            
        case 'check-migration':
            await validator.checkMigrationStatus();
            break;
            
        case 'full':
        default:
            await validator.validateEnvironment();
            await validator.checkMigrationStatus();
            break;
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = TiniEnvironmentValidator;
