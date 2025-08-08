// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI Role Based Security - Enterprise RBAC System
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class TINIRoleBasedSecurity {
    constructor() {
        // 🛡️ Define roles with clear permission levels and capabilities
        this.roles = new Map([
            ['boss', { name: 'BOSS', level: 10000, infinitePower: true, immuneToOwnRules: true }],
            ['admin', { name: 'ADMIN', level: 100, permissions: ['all'], canToggleSafeMode: true }],
            ['staff', { name: 'STAFF', level: 50, permissions: ['read', 'write', 'view_logs'] }],
            ['tester', { name: 'TESTER', level: 30, permissions: ['read', 'view_logs'] }],
            ['guest', { name: 'GUEST', level: 10, permissions: ['read'] }],
            ['unauthenticated', { name: 'UNAUTHENTICATED', level: 0, permissions: [] }]
        ]);

        // In-memory store for security events and safe mode status
        this.securityEvents = [];
        this.safeMode = {
            enabled: false,
            enabledBy: null,
            expiresAt: null
        };

        // Secret for JWT, should be loaded from environment variables
        this.jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'); // Generate random if not set
        console.log('🛡️ [RBAC] TINI Role-Based Security system initialized.');
    }

    /**
     * Checks user access based on JWT token from the request.
     * This is the core function of the RBAC system.
     * @param {object} req - The HTTP request object.
     * @returns {Promise<object>} An object containing access control information.
     */
    async checkUserAccess(req) {
        const token = this.extractToken(req);
        let userRole = this.roles.get('unauthenticated');
        let sessionData = null;

        // 1. Verify JWT token if it exists
        if (token) {
            try {
                sessionData = jwt.verify(token, this.jwtSecret);
                userRole = this.roles.get(sessionData.role) || this.roles.get('guest');
            } catch (error) {
                // Invalid or expired token
                await this.logSecurityEvent({
                    type: 'INVALID_TOKEN',
                    reason: `Invalid token received: ${error.message}`,
                    severity: 'MEDIUM',
                    request: { ip: req.connection?.remoteAddress, url: req.url }
                });
                userRole = this.roles.get('unauthenticated');
            }
        }

        // 2. Check if Safe Mode is active and has expired
        if (this.safeMode.enabled && this.safeMode.expiresAt < Date.now()) {
            this.safeMode.enabled = false;
            await this.logSecurityEvent({
                type: 'SAFE_MODE_EXPIRED',
                reason: 'Safe Mode automatically disabled after timeout.',
                severity: 'INFO'
            });
        }

        // 3. Determine the final security level
        let securityLevel = 'STANDARD';
        if (userRole.level >= 10000) securityLevel = 'BOSS_LEVEL';
        else if (userRole.level >= 100) securityLevel = 'ADMIN_LEVEL';
        else if (this.safeMode.enabled) securityLevel = 'SAFE_MODE';

        return {
            allowed: true, // This can be enhanced with endpoint-specific checks
            userRole: userRole,
            safeMode: this.safeMode.enabled,
            securityLevel: securityLevel,
            reason: null
        };
    }

    /**
     * Logs a security-related event.
     * @param {object} event - The event object to log.
     */
    async logSecurityEvent(event) {
        event.timestamp = new Date().toISOString();
        event.id = crypto.randomUUID();
        this.securityEvents.push(event);

        // Keep the log from growing indefinitely
        if (this.securityEvents.length > 1000) {
            this.securityEvents.shift();
        }

        console.log(`🔒 [SECURITY EVENT] ${event.type}: ${event.reason}`);
    }

    /**
     * Retrieves recent security events, respecting user permission level.
     * @param {object} options - Options like limit and userLevel.
     * @returns {Promise<Array>} A list of security events.
     */
    async getSecurityEvents(options = {}) {
        const limit = options.limit || 100;
        const userLevel = options.userLevel || 0;

        // Filter events based on severity that the user is allowed to see
        const visibleEvents = this.securityEvents.filter(event => {
            if (userLevel >= 100) return true; // Admins see all
            if (userLevel >= 50) return ['HIGH', 'MEDIUM', 'LOW', 'INFO'].includes(event.severity);
            return ['LOW', 'INFO'].includes(event.severity);
        });

        return visibleEvents.slice(-limit);
    }

    /**
     * Toggles Safe Mode, which can bypass certain security checks.
     * Requires ADMIN level privileges.
     * @param {object} adminUser - The role object of the admin enabling/disabling.
     * @param {boolean} enable - True to enable, false to disable.
     * @param {number} durationMinutes - Duration in minutes for Safe Mode.
     * @returns {Promise<object>} The result of the operation.
     */
    async toggleSafeMode(adminUser, enable, durationMinutes = 30) {
        if (!adminUser || adminUser.level < 100) {
            return { success: false, error: 'Insufficient permissions for Safe Mode.' };
        }

        this.safeMode.enabled = enable;
        if (enable) {
            this.safeMode.enabledBy = adminUser.name;
            this.safeMode.expiresAt = Date.now() + durationMinutes * 60 * 1000;
            console.log(`🔧 [RBAC] Safe Mode enabled by ${adminUser.name} for ${durationMinutes} minutes.`);
        } else {
            this.safeMode.enabledBy = null;
            this.safeMode.expiresAt = null;
            console.log(`🔧 [RBAC] Safe Mode disabled by ${adminUser.name}.`);
        }

        return { success: true, safeMode: this.safeMode.enabled };
    }

    /**
     * Extracts the JWT token from the Authorization header.
     * @param {object} req - The HTTP request object.
     * @returns {string|null} The token or null if not found.
     */
    extractToken(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        return null;
    }
}

// Export the class
module.exports = TINIRoleBasedSecurity;
