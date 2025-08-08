// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
#!/usr/bin/env node
/**
 * TINI Security Validation Script
 * Kiểm tra và cảnh báo về các vấn đề bảo mật trong hệ thống
 */

// Load environment variables from .env file
require('dotenv').config();

const fs = require('fs');
const path = require('path');

class SecurityValidator {
    constructor() {
        this.issues = [];
        this.rootDir = process.cwd();
    }

    validateEnvironmentVariables() {
        console.log('🔍 Checking environment variables...');
        
        const requiredEnvVars = [
            'ADMIN_PASSWORD',
            'BOSS_PASSWORD', 
            'STAFF_PASSWORD',
            'JWT_SECRET',
            'SLACK_WEBHOOK_URL'
        ];

        const missing = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missing.length > 0) {
            this.issues.push({
                type: 'CRITICAL',
                message: `Missing environment variables: ${missing.join(', ')}`,
                fix: 'Set these variables in .env file or environment'
            });
        }

        // Check for default/weak passwords
        const weakPasswords = ['admin', 'password', '123456', 'default', 'CHANGE_THIS'];
        requiredEnvVars.forEach(varName => {
            const value = process.env[varName];
            if (value && weakPasswords.some(weak => value.toLowerCase().includes(weak.toLowerCase()))) {
                this.issues.push({
                    type: 'HIGH',
                    message: `Weak ${varName} detected`,
                    fix: 'Use strong, unique passwords'
                });
            }
        });
    }

    checkHardcodedSecrets() {
        console.log('🔍 Scanning for hardcoded secrets...');
        
        const patterns = [
            /password.*=.*['"][^'"]{1,}/gi,
            /api.*key.*=.*['"][^'"]{1,}/gi,
            /secret.*=.*['"][^'"]{1,}/gi,
            /token.*=.*['"][^'"]{1,}/gi,
            /SecureAdmin|UltimateBoss|SecureStaff/gi
        ];

        this.scanDirectory(this.rootDir, patterns);
    }

    scanDirectory(dir, patterns) {
        try {
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                    this.scanDirectory(filePath, patterns);
                } else if (file.endsWith('.js') || file.endsWith('.json')) {
                    this.scanFile(filePath, patterns);
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }

    scanFile(filePath, patterns) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                patterns.forEach(pattern => {
                    if (pattern.test(line) && !line.includes('process.env') && !line.includes('FAKE') && !line.includes('honeypot')) {
                        this.issues.push({
                            type: 'HIGH',
                            message: `Potential hardcoded secret in ${filePath}:${index + 1}`,
                            fix: 'Move to environment variables',
                            line: line.trim()
                        });
                    }
                });
            });
        } catch (error) {
            // Skip files we can't read
        }
    }

    checkFilePermissions() {
        console.log('🔍 Checking file permissions...');
        
        const sensitiveFiles = ['.env', '.env.local', '.env.production'];
        
        sensitiveFiles.forEach(file => {
            const filePath = path.join(this.rootDir, file);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                const mode = stats.mode & parseInt('777', 8);
                
                if (mode > parseInt('600', 8)) {
                    this.issues.push({
                        type: 'MEDIUM',
                        message: `${file} has overly permissive permissions`,
                        fix: 'Set permissions to 600 (owner read/write only)'
                    });
                }
            }
        });
    }

    validateConfiguration() {
        console.log('🔍 Validating system configuration...');
        
        // Check if .env.example exists
        if (!fs.existsSync(path.join(this.rootDir, '.env.example'))) {
            this.issues.push({
                type: 'LOW',
                message: '.env.example file missing',
                fix: 'Create .env.example template for team members'
            });
        }

        // Check if .env exists
        if (!fs.existsSync(path.join(this.rootDir, '.env'))) {
            this.issues.push({
                type: 'MEDIUM',
                message: '.env file missing',
                fix: 'Copy .env.example to .env and configure values'
            });
        }
    }

    generateReport() {
        console.log('\n🛡️  TINI SECURITY VALIDATION REPORT');
        console.log('=====================================\n');

        if (this.issues.length === 0) {
            console.log('✅ No security issues detected!');
            return;
        }

        const critical = this.issues.filter(i => i.type === 'CRITICAL');
        const high = this.issues.filter(i => i.type === 'HIGH');
        const medium = this.issues.filter(i => i.type === 'MEDIUM');
        const low = this.issues.filter(i => i.type === 'LOW');

        console.log(`📊 Summary: ${this.issues.length} issues found`);
        console.log(`   🚨 Critical: ${critical.length}`);
        console.log(`   ⚠️  High: ${high.length}`);
        console.log(`   📋 Medium: ${medium.length}`);
        console.log(`   ℹ️  Low: ${low.length}\n`);

        // Display issues by severity
        [critical, high, medium, low].forEach((issues, index) => {
            const severity = ['🚨 CRITICAL', '⚠️  HIGH', '📋 MEDIUM', 'ℹ️  LOW'][index];
            
            if (issues.length > 0) {
                console.log(`${severity} ISSUES:`);
                console.log('─'.repeat(40));
                
                issues.forEach((issue, i) => {
                    console.log(`${i + 1}. ${issue.message}`);
                    console.log(`   Fix: ${issue.fix}`);
                    if (issue.line) console.log(`   Code: ${issue.line}`);
                    console.log('');
                });
            }
        });

        // Exit with error code if critical issues found
        if (critical.length > 0) {
            console.log('🚨 CRITICAL ISSUES DETECTED - Fix before production!');
            process.exit(1);
        }
    }

    run() {
        console.log('🔍 Starting TINI Security Validation...\n');
        
        this.validateEnvironmentVariables();
        this.checkHardcodedSecrets();
        this.checkFilePermissions();
        this.validateConfiguration();
        
        this.generateReport();
    }
}

// Run if called directly
if (require.main === module) {
    const validator = new SecurityValidator();
    validator.run();
}

module.exports = SecurityValidator;
