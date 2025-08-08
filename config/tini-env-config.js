// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI Environment Configuration Manager
 * Manages environment variables for both server and client-side
 * Version: 1.0
 */

class TiniEnvironmentConfig {
    constructor() {
        this.config = {};
        this.isServer = typeof window === 'undefined';
        this.isClient = typeof window !== 'undefined';
        
        this.loadConfiguration();
        console.log('🌍 TINI Environment Config loaded');
    }

    loadConfiguration() {
        if (this.isServer) {
            // Server-side: Load from process.env
            this.loadServerConfig();
        } else {
            // Client-side: Load from embedded config or API
            this.loadClientConfig();
        }
    }

    loadServerConfig() {
        // Load environment variables from process.env
        this.config = {
            // Basic System
            NODE_ENV: process.env.NODE_ENV || 'development',
            PORT: process.env.PORT || 8080,
            DEBUG: process.env.DEBUG === 'true',

            // Security Credentials
            ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
            ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'CHANGE_THIS_ADMIN_PASSWORD',
            BOSS_PASSWORD: process.env.BOSS_PASSWORD || 'CHANGE_THIS_BOSS_PASSWORD',
            USER_PASSWORD: process.env.USER_PASSWORD || 'CHANGE_THIS_USER_PASSWORD',
            STAFF_PASSWORD: process.env.STAFF_PASSWORD || 'CHANGE_THIS_STAFF_PASSWORD',

            // Encryption Keys
            ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'TiniSecureEncryptionKey2024',
            SECRET_KEY: process.env.SECRET_KEY || 'TiniSystemSecretKey2024',
            JWT_SECRET: process.env.JWT_SECRET || 'TiniJWTSecretKey2024',

            // Boss Level Token
            BOSS_LEVEL_TOKEN: process.env.BOSS_LEVEL_TOKEN || 'bossLevel10000SecureToken2024',
            BOSS_TOKEN_KEY: process.env.BOSS_TOKEN_KEY || 'TiniBossTokenKey2024',

            // Database
            DB_TYPE: process.env.DB_TYPE || 'sqlite',
            DB_PATH: process.env.DB_PATH || './tini_admin.db',

            // Security Features
            RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000,
            RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
            SESSION_SECRET: process.env.SESSION_SECRET || 'TiniSessionSecret2024',
            SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT) || 3600000,

            // Logging
            LOG_LEVEL: process.env.LOG_LEVEL || 'info',
            LOG_FILE: process.env.LOG_FILE || './logs/tini_system.log',

            // Monitoring
            ENABLE_MONITORING: process.env.ENABLE_MONITORING === 'true',
            MONITOR_INTERVAL: parseInt(process.env.MONITOR_INTERVAL) || 30000,

            // Development
            DEV_MODE: process.env.DEV_MODE === 'true',
            ENABLE_DEBUG_PANEL: process.env.ENABLE_DEBUG_PANEL === 'true',
            BYPASS_AUTH: process.env.BYPASS_AUTH === 'true',

            // Special Keys
            GHOST_SYSTEM_KEY: process.env.GHOST_SYSTEM_KEY || 'TiniGhostSystemKey2024',
            GHOST_TOKEN: process.env.GHOST_TOKEN || 'TiniGhostToken2024',
            ULTIMATE_SECURITY_KEY: process.env.ULTIMATE_SECURITY_KEY || 'TiniUltimateSecurityKey2024',
            FORTRESS_KEY: process.env.FORTRESS_KEY || 'TiniFortressKey2024',
            PHANTOM_KEY: process.env.PHANTOM_KEY || 'TiniPhantomKey2024',
            BYPASS_MANAGER_KEY: process.env.BYPASS_MANAGER_KEY || 'TiniBypassManagerKey2024',
            INTEGRATION_KEY: process.env.INTEGRATION_KEY || 'TiniIntegrationKey2024',
            STEALTH_KEY: process.env.STEALTH_KEY || 'TiniStealthKey2024'
        };
    }

    loadClientConfig() {
        // Client-side: Load from window.TINI_CONFIG or API endpoint
        this.config = window.TINI_CONFIG || {
            // Only include non-sensitive config for client
            NODE_ENV: 'production',
            DEBUG: false,
            
            // Public configuration
            DEFAULT_LANGUAGE: 'zh',
            DEFAULT_TIMEZONE: 'Asia/Ho_Chi_Minh',
            SUPPORTED_LANGUAGES: ['en', 'zh', 'vi', 'ko', 'hi'],
            
            // Client-side timeouts and limits
            SESSION_TIMEOUT: 3600000,
            MONITOR_INTERVAL: 30000,
            
            // Feature flags (non-sensitive)
            ENABLE_MONITORING: true,
            DEV_MODE: false,
            ENABLE_DEBUG_PANEL: false,
            
            // Public keys (NOT sensitive encryption keys)
            API_VERSION: 'v1.0',
            CLIENT_VERSION: '1.0.0'
        };

        // Try to load additional config from API if available
        this.loadConfigFromAPI();
    }

    async loadConfigFromAPI() {
        try {
            const response = await fetch('/api/config/client');
            if (response.ok) {
                const apiConfig = await response.json();
                this.config = { ...this.config, ...apiConfig };
                console.log('✅ Client config loaded from API');
            }
        } catch (error) {
            console.warn('⚠️ Could not load config from API, using defaults');
        }
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
    }

    getAll() {
        return { ...this.config };
    }

    // Get configuration for specific environment
    getForEnvironment(env) {
        const envConfig = { ...this.config };
        
        // Adjust config based on environment
        if (env === 'development') {
            envConfig.DEBUG = true;
            envConfig.LOG_LEVEL = 'debug';
            envConfig.DEV_MODE = true;
        } else if (env === 'production') {
            envConfig.DEBUG = false;
            envConfig.LOG_LEVEL = 'warn';
            envConfig.DEV_MODE = false;
        }
        
        return envConfig;
    }

    // Validate configuration
    validate() {
        const requiredKeys = [
            'ENCRYPTION_KEY',
            'SECRET_KEY',
            'ADMIN_PASSWORD'
        ];

        const missing = requiredKeys.filter(key => !this.config[key] || this.config[key].includes('CHANGE_THIS'));
        
        if (missing.length > 0) {
            console.error('❌ Missing or default configuration:', missing);
            console.error('⚠️ Please update your .env file with secure values');
            return false;
        }

        console.log('✅ Configuration validation passed');
        return true;
    }

    // Generate secure random values for missing configs
    generateSecureDefaults() {
        const generateRandomString = (length = 32) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        const defaults = {
            ENCRYPTION_KEY: generateRandomString(32),
            SECRET_KEY: generateRandomString(32),
            JWT_SECRET: generateRandomString(32),
            SESSION_SECRET: generateRandomString(32),
            ADMIN_PASSWORD: generateRandomString(16),
            BOSS_PASSWORD: generateRandomString(16),
            USER_PASSWORD: generateRandomString(16)
        };

        console.log('🔧 Generated secure defaults:');
        Object.entries(defaults).forEach(([key, value]) => {
            if (!this.config[key] || this.config[key].includes('CHANGE_THIS')) {
                this.config[key] = value;
                console.log(`   ${key}=${value}`);
            }
        });

        console.log('⚠️ Please save these values to your .env file');
        return defaults;
    }

    // Export configuration for .env file
    exportToEnvFormat() {
        const envLines = Object.entries(this.config)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
        
        return envLines;
    }
}

// Initialize global config
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = TiniEnvironmentConfig;
} else {
    // Browser environment
    window.TiniEnvironmentConfig = TiniEnvironmentConfig;
    window.tiniConfig = new TiniEnvironmentConfig();
}

console.log('🌍 TINI Environment Configuration Manager loaded');
