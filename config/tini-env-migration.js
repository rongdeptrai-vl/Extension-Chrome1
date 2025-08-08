// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI Environment Migration Script
 * Updates all hardcoded secrets/tokens to use environment variables
 */

const fs = require('fs');
const path = require('path');

class TiniEnvironmentMigration {
    constructor() {
        this.replacements = new Map([
            // Boss Level Tokens
            ['localStorage.getItem(\'bossLevel10000\')', 'localStorage.getItem(window.tiniConfig?.get(\'BOSS_LEVEL_TOKEN\') || \'bossLevel10000\')'],
            ['\'bossLevel10000\'', 'window.tiniConfig?.get(\'BOSS_LEVEL_TOKEN\') || \'bossLevel10000\''],
            
            // Admin passwords and keys
            ['\'TiniSecureAdminKey2024\'', 'window.tiniConfig?.get(\'ENCRYPTION_KEY\') || \'TiniSecureAdminKey2024\''],
            ['process.env.ADMIN_PASSWORD', 'this.getConfig().get(\'ADMIN_PASSWORD\')'],
            ['process.env.BOSS_PASSWORD', 'this.getConfig().get(\'BOSS_PASSWORD\')'],
            ['process.env.USER_PASSWORD', 'this.getConfig().get(\'USER_PASSWORD\')'],
            ['process.env.STAFF_PASSWORD', 'this.getConfig().get(\'STAFF_PASSWORD\')'],
            ['process.env.ENCRYPTION_KEY', 'this.getConfig().get(\'ENCRYPTION_KEY\')'],
            ['process.env.SECRET_KEY', 'this.getConfig().get(\'SECRET_KEY\')'],
            ['process.env.JWT_SECRET', 'this.getConfig().get(\'JWT_SECRET\')'],
            
            // GHOST System keys
            ['TiniGhostSystemKey2024', 'window.tiniConfig?.get(\'GHOST_SYSTEM_KEY\') || \'TiniGhostSystemKey2024\''],
            ['TiniGhostToken2024', 'window.tiniConfig?.get(\'GHOST_TOKEN\') || \'TiniGhostToken2024\''],
            
            // Security keys
            ['TiniUltimateSecurityKey2024', 'window.tiniConfig?.get(\'ULTIMATE_SECURITY_KEY\') || \'TiniUltimateSecurityKey2024\''],
            ['TiniFortressKey2024', 'window.tiniConfig?.get(\'FORTRESS_KEY\') || \'TiniFortressKey2024\''],
            ['TiniPhantomKey2024', 'window.tiniConfig?.get(\'PHANTOM_KEY\') || \'TiniPhantomKey2024\''],
            ['TiniBypassManagerKey2024', 'window.tiniConfig?.get(\'BYPASS_MANAGER_KEY\') || \'TiniBypassManagerKey2024\''],
            ['TiniIntegrationKey2024', 'window.tiniConfig?.get(\'INTEGRATION_KEY\') || \'TiniIntegrationKey2024\''],
            ['TiniStealthKey2024', 'window.tiniConfig?.get(\'STEALTH_KEY\') || \'TiniStealthKey2024\''],
            
            // Default passwords
            ['\'CHANGE_THIS_ADMIN_PASSWORD\'', 'window.tiniConfig?.get(\'ADMIN_PASSWORD\') || \'CHANGE_THIS_ADMIN_PASSWORD\''],
            ['\'CHANGE_THIS_BOSS_PASSWORD\'', 'window.tiniConfig?.get(\'BOSS_PASSWORD\') || \'CHANGE_THIS_BOSS_PASSWORD\''],
            ['\'CHANGE_THIS_USER_PASSWORD\'', 'window.tiniConfig?.get(\'USER_PASSWORD\') || \'CHANGE_THIS_USER_PASSWORD\''],
            
            // Session and other tokens
            ['TiniSessionSecret2024', 'window.tiniConfig?.get(\'SESSION_SECRET\') || \'TiniSessionSecret2024\''],
            ['TiniJWTSecretKey2024', 'window.tiniConfig?.get(\'JWT_SECRET\') || \'TiniJWTSecretKey2024\'']
        ]);
        
        this.filesToMigrate = [
            // Security files
            'SECURITY/secure-admin-helper.js',
            'SECURITY/TINI Authentication System.js',
            'SECURITY/SECURITY  TRAP.js',
            'SECURITY/ultimate-security.js',
            'SECURITY/REAL-ULTIMATE-SECURITY.js',
            'SECURITY/real-working-security.js',
            'SECURITY/final-security-verification.js',
            
            // Core system files
            'ultimate-boss-core.js',
            'universal-event-dispatcher.js',
            'system-integration-bridge.js',
            'bypass-integration-manager.js',
            'ultimate-fortress.js',
            'phantom-network-layer.js',
            'phantom-persistence-engine.js',
            'invisible-ghost-core.js',
            'boss-ultimate-client.js',
            'boss-ghost-security-integration.js',
            'emergency-boss-recovery.js',
            
            // Admin panel files
            'admin-panel/scripts/admin-panel-main.js',
            'admin-panel/scripts/admin-panel-main-fixed.js',
            'admin-panel/scripts/advanced-mode-system.js',
            'admin-panel/scripts/security-systems-integration.js',
            
            // Tools
            'tools/security-validator.js',
            'tools/event-handler-analyzer.js'
        ];
    }

    async migrateAll() {
        console.log('🔄 Starting TINI Environment Migration...');
        
        for (const filePath of this.filesToMigrate) {
            const fullPath = path.resolve(__dirname, '..', filePath);
            
            try {
                if (fs.existsSync(fullPath)) {
                    await this.migrateFile(fullPath);
                    console.log(`✅ Migrated: ${filePath}`);
                } else {
                    console.log(`⚠️ File not found: ${filePath}`);
                }
            } catch (error) {
                console.error(`❌ Error migrating ${filePath}:`, error.message);
            }
        }
        
        console.log('✅ TINI Environment Migration completed!');
    }

    async migrateFile(filePath) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        // Apply replacements
        for (const [oldPattern, newPattern] of this.replacements) {
            if (content.includes(oldPattern)) {
                content = content.replaceAll(oldPattern, newPattern);
                changed = true;
            }
        }
        
        // Add getConfig method to classes that need it
        if (changed && this.needsGetConfigMethod(content)) {
            content = this.addGetConfigMethod(content);
        }
        
        // Write back if changed
        if (changed) {
            // Create backup
            fs.writeFileSync(filePath + '.backup', fs.readFileSync(filePath));
            fs.writeFileSync(filePath, content);
        }
    }

    needsGetConfigMethod(content) {
        return content.includes('this.getConfig()') && 
               !content.includes('getConfig()') && 
               content.includes('class ');
    }

    addGetConfigMethod(content) {
        // Find the end of constructor or first method
        const constructorEnd = content.indexOf('}\n\n', content.indexOf('constructor('));
        if (constructorEnd !== -1) {
            const getConfigMethod = `
    // Get configuration helper method
    getConfig() {
        // Browser environment
        if (typeof window !== 'undefined' && window.tiniConfig) {
            return window.tiniConfig;
        }
        
        // Node.js environment - create a simple config object
        return {
            get: (key) => {
                if (typeof process !== 'undefined' && process.env) {
                    return process.env[key];
                }
                return null;
            }
        };
    }
`;
            
            content = content.slice(0, constructorEnd + 2) + getConfigMethod + content.slice(constructorEnd + 2);
        }
        
        return content;
    }

    // Generate summary of migration
    generateMigrationSummary() {
        const summary = {
            totalFiles: this.filesToMigrate.length,
            replacements: Array.from(this.replacements.keys()),
            environmentVariables: [
                'ADMIN_PASSWORD',
                'BOSS_PASSWORD', 
                'USER_PASSWORD',
                'STAFF_PASSWORD',
                'ENCRYPTION_KEY',
                'SECRET_KEY',
                'JWT_SECRET',
                'BOSS_LEVEL_TOKEN',
                'BOSS_TOKEN_KEY',
                'GHOST_SYSTEM_KEY',
                'GHOST_TOKEN',
                'ULTIMATE_SECURITY_KEY',
                'FORTRESS_KEY',
                'PHANTOM_KEY',
                'BYPASS_MANAGER_KEY',
                'INTEGRATION_KEY',
                'STEALTH_KEY',
                'SESSION_SECRET'
            ]
        };
        
        console.log('\n📋 MIGRATION SUMMARY:');
        console.log(`Files to migrate: ${summary.totalFiles}`);
        console.log(`Environment variables used: ${summary.environmentVariables.length}`);
        console.log(`Pattern replacements: ${summary.replacements.length}`);
        
        return summary;
    }
}

// Run migration if called directly
if (require.main === module) {
    const migration = new TiniEnvironmentMigration();
    migration.generateMigrationSummary();
    migration.migrateAll().catch(console.error);
}

module.exports = TiniEnvironmentMigration;
