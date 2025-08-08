// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI Security Core
 * Centralizes and coordinates all security components
 * Version: 4.0 - Enterprise Security Integration
 */

const TINIRoleBasedSecurity = require('./tini-role-based-security');
const AdvancedHoneypotSystem = require('./advanced-honeypot-system');
const SecureAuthenticationSystem = require('./TINI Authentication System');
const DatabaseManager = require('../core/data-base-connect');
const gracefulShutdown = require('../core/graceful-shutdown');
const crypto = require('crypto');
const EventEmitter = require('events');

class SecurityCore extends EventEmitter {
    constructor() {
        super();
        
        // Initialize database
        this.db = new DatabaseManager();
        
        // Initialize security components
        this.rbac = new TINIRoleBasedSecurity();
        this.honeypot = new AdvancedHoneypotSystem();
        this.auth = new SecureAuthenticationSystem();
        
        // Register shutdown handlers
        this.registerShutdownHandlers();
        
        // Security state
        this.securityLevel = 'high';
        this.threats = new Map();
        this.blockedEntities = new Set();
        
        // Metrics
        this.metrics = {
            totalRequests: 0,
            blockedAttempts: 0,
            honeypotHits: 0,
            lastScan: Date.now()
        };

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Listen for authentication events
        if (typeof this.auth.on === 'function') {
            this.auth.on('login:success', (user) => {
                this.emit('security:event', {
                    type: 'authentication',
                    subtype: 'login:success',
                    user: user.username,
                    timestamp: Date.now()
                });
            });
        }

        // Listen for honeypot triggers
        if (typeof this.honeypot.on === 'function') {
            this.honeypot.on('trap:triggered', (data) => {
                this.metrics.honeypotHits++;
                this.emit('security:event', {
                    type: 'honeypot',
                    subtype: 'trap:triggered',
                    path: data.path,
                    ip: data.ip,
                    timestamp: Date.now()
                });
            });
        }

        // Listen for RBAC violations
        if (typeof this.rbac.on === 'function') {
            this.rbac.on('access:denied', (data) => {
                this.emit('security:event', {
                    type: 'rbac',
                    subtype: 'access:denied',
                    user: data.user,
                    resource: data.resource,
                    timestamp: Date.now()
                });
            });
        }
    }

    async authenticateRequest(req) {
        const token = this.extractToken(req);
        if (!token) return null;

        try {
            const decoded = await this.auth.verifyToken(token);
            const role = await this.rbac.getUserRole(decoded.userId);
            return { ...decoded, role };
        } catch (error) {
            console.error('Authentication failed:', error);
            return null;
        }
    }

    extractToken(req) {
        const authHeader = req.headers.authorization;
        return authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;
    }

    async checkPermission(user, resource, action) {
        return this.rbac.checkPermission(user.role, resource, action);
    }

    registerThreat(threat) {
        const threatId = crypto.randomBytes(16).toString('hex');
        this.threats.set(threatId, {
            ...threat,
            detected: Date.now(),
            status: 'active'
        });
        
        this.emit('security:threat', { threatId, ...threat });
        return threatId;
    }

    blockEntity(entity, reason) {
        this.blockedEntities.add(entity);
        this.emit('security:block', { entity, reason });
    }

    isBlocked(entity) {
        return this.blockedEntities.has(entity);
    }

    getMetrics() {
        return {
            ...this.metrics,
            activeThreats: this.threats.size,
            blockedEntities: this.blockedEntities.size,
            uptime: process.uptime()
        };
    }

    scanSystem() {
        this.metrics.lastScan = Date.now();
        // Implement system security scan
        return {
            timestamp: Date.now(),
            threatLevel: this.securityLevel,
            activeThreats: Array.from(this.threats.values()),
            metrics: this.getMetrics()
        };
    }

    registerShutdownHandlers() {
        // Register handlers with graceful shutdown manager
        gracefulShutdown.registerHandler('security-core', async () => {
            console.log('🛡️ Shutting down security core...');

            try {
                // Cleanup authentication system
                if (typeof this.auth.shutdown === 'function') {
                    await this.auth.shutdown();
                }

                // Cleanup RBAC
                if (typeof this.rbac.shutdown === 'function') {
                    await this.rbac.shutdown();
                }

                // Cleanup honeypot
                if (typeof this.honeypot.shutdown === 'function') {
                    await this.honeypot.shutdown();
                }

                // Save security metrics
                await this.db.saveSecurityMetrics(this.metrics);

                // Close database connection
                await this.db.close();

                console.log('✅ Security core shutdown complete');
            } catch (error) {
                console.error('❌ Error during security core shutdown:', error);
                throw error;
            }
        }, 10); // High priority (10)

        // Handle process warnings
        process.on('warning', (warning) => {
            console.warn('⚠️ Process warning:', warning.name, warning.message);
            this.emit('security:warning', {
                type: 'process_warning',
                name: warning.name,
                message: warning.message,
                stack: warning.stack
            });
        });
    }

    async initialize() {
        try {
            // Connect to database
            await this.db.connect();

            // Initialize components with database
            await this.auth.initialize(this.db);
            await this.rbac.initialize(this.db);
            await this.honeypot.initialize(this.db);

            // Start periodic cleanup
            this.startCleanupTasks();

            console.log('✅ Security core initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing security core:', error);
            throw error;
        }
    }

    startCleanupTasks() {
        // Cleanup every hour
        setInterval(() => {
            this.cleanupTasks();
        }, 60 * 60 * 1000);
    }

    async cleanupTasks() {
        try {
            // Cleanup old threats
            const now = Date.now();
            for (const [id, threat] of this.threats) {
                if (now - threat.detected > 7 * 24 * 60 * 60 * 1000) { // 7 days
                    this.threats.delete(id);
                }
            }

            // Archive old metrics to database
            await this.db.archiveMetrics(this.metrics);
            
            // Reset volatile metrics
            this.metrics.honeypotHits = 0;
            
            console.log('✨ Security cleanup tasks completed');
        } catch (error) {
            console.error('❌ Error during security cleanup:', error);
        }
    }
}


// Export singleton instance
module.exports = new SecurityCore();
