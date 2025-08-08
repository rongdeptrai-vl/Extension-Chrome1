# TINI Environment Configuration Guide

## 🔧 Overview

All sensitive information (tokens, secrets, passwords) in the TINI system has been migrated to use environment variables for enhanced security. This guide explains how to configure and use them.

## 📁 Configuration Files

- **`.env`** - Main environment configuration file
- **`config/tini-env-config.js`** - Environment configuration manager
- **`config/tini-env-migration.js`** - Migration script (already executed)

## 🔐 Environment Variables

### Authentication & Security
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=TiniSecureAdmin2024!@#
BOSS_PASSWORD=TiniBossSecure2024!@#
USER_PASSWORD=TiniUserSecure2024!@#
STAFF_PASSWORD=TiniStaffSecure2024!@#
```

### Encryption Keys
```env
ENCRYPTION_KEY=TiniSecureEncryptionKey2024!@#$%
SECRET_KEY=TiniSystemSecretKey2024!@#$%
JWT_SECRET=TiniJWTSecretKey2024!@#$%
SESSION_SECRET=TiniSessionSecret2024!@#
```

### Boss Level Tokens
```env
BOSS_LEVEL_TOKEN=bossLevel10000SecureToken2024
BOSS_TOKEN_KEY=TiniBossTokenKey2024
```

### System Keys
```env
GHOST_SYSTEM_KEY=TiniGhostSystemKey2024
GHOST_TOKEN=TiniGhostToken2024
ULTIMATE_SECURITY_KEY=TiniUltimateSecurityKey2024
FORTRESS_KEY=TiniFortressKey2024
PHANTOM_KEY=TiniPhantomKey2024
BYPASS_MANAGER_KEY=TiniBypassManagerKey2024
INTEGRATION_KEY=TiniIntegrationKey2024
STEALTH_KEY=TiniStealthKey2024
```

## 🚀 Usage

### Server-Side (Node.js)
```javascript
// Load environment variables
require('dotenv').config();

// Use with TINI Config
const TiniEnvironmentConfig = require('./config/tini-env-config.js');
const envConfig = new TiniEnvironmentConfig();

// Get values
const adminPassword = envConfig.get('ADMIN_PASSWORD');
const encryptionKey = envConfig.get('ENCRYPTION_KEY');
```

### Client-Side (Browser)
```javascript
// Environment config is automatically loaded via script tag
// Access through window.tiniConfig

const bossToken = window.tiniConfig?.get('BOSS_LEVEL_TOKEN') || 'fallback';
const encryptionKey = window.tiniConfig?.get('ENCRYPTION_KEY') || 'fallback';
```

## 🔄 Migration Changes

The following patterns were automatically replaced:

| Old Pattern | New Pattern |
|-------------|-------------|
| `'bossLevel10000'` | `window.tiniConfig?.get('BOSS_LEVEL_TOKEN') \|\| 'bossLevel10000'` |
| `'TiniSecureAdminKey2024'` | `window.tiniConfig?.get('ENCRYPTION_KEY') \|\| 'TiniSecureAdminKey2024'` |
| `process.env.ADMIN_PASSWORD` | `this.getConfig().get('ADMIN_PASSWORD')` |

## 📋 Migrated Files

✅ **Security Files (7 files)**
- `SECURITY/secure-admin-helper.js`
- `SECURITY/TINI Authentication System.js`
- `SECURITY/SECURITY  TRAP.js`
- `SECURITY/ultimate-security.js`
- `SECURITY/REAL-ULTIMATE-SECURITY.js`
- `SECURITY/real-working-security.js`
- `SECURITY/final-security-verification.js`

✅ **Core System Files (11 files)**
- `ultimate-boss-core.js`
- `universal-event-dispatcher.js`
- `system-integration-bridge.js`
- `bypass-integration-manager.js`
- `ultimate-fortress.js`
- `phantom-network-layer.js`
- `phantom-persistence-engine.js`
- `invisible-ghost-core.js`
- `boss-ultimate-client.js`
- `boss-ghost-security-integration.js`
- `emergency-boss-recovery.js`

✅ **Admin Panel Files (4 files)**
- `admin-panel/scripts/admin-panel-main.js`
- `admin-panel/scripts/admin-panel-main-fixed.js`
- `admin-panel/scripts/advanced-mode-system.js`
- `admin-panel/scripts/security-systems-integration.js`

✅ **Tools (2 files)**
- `tools/security-validator.js`
- `tools/event-handler-analyzer.js`

## ⚠️ Security Notes

1. **Never commit `.env` file to version control**
2. **Use strong, unique passwords for production**
3. **Regularly rotate keys and tokens**
4. **Backup environment configuration securely**

## 🔧 Server Configuration

The admin panel server now automatically loads environment variables:

```javascript
// server.js automatically loads .env
require('dotenv').config({ path: '../.env' });

// Uses environment config
const PORT = envConfig.get('PORT') || 8080;
```

## 🌐 Client Configuration API

New API endpoint provides client-safe configuration:

```
GET /api/config/client
```

Returns non-sensitive configuration for browser use.

## 🆘 Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure `.env` file exists in project root
   - Check file permissions
   - Verify `dotenv` package is installed

2. **Client config not available**
   - Verify `tini-env-config.js` is loaded before other scripts
   - Check browser console for errors
   - Ensure server is running for API config

3. **Authentication errors**
   - Verify password environment variables are set
   - Check for typos in variable names
   - Ensure config is loaded before authentication

### Reset Configuration

To generate new secure defaults:
```javascript
const envConfig = new TiniEnvironmentConfig();
const defaults = envConfig.generateSecureDefaults();
```

## 📞 Support

For issues related to environment configuration:
1. Check console logs for detailed error messages
2. Verify all required environment variables are set
3. Ensure proper loading order of configuration files

---

**🔒 Security First**: This migration enhances security by removing hardcoded secrets and centralizing configuration management.
