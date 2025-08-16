// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - CONFIDENTIAL
// TINI Rate Limiting System
// Author: Security Team
// Version: 1.0

/**
 * Advanced rate limiting system with sliding window and adaptive thresholds
 */
class TINIRateLimiter {
    constructor() {
        this.version = '1.0';
        this.limits = new Map();
        this.requests = new Map();
        this.blockedIPs = new Map();
        this.whitelist = new Set();
        this.settings = {
            windowSize: 60000,        // 1 minute sliding window
            cleanupInterval: 30000,   // Cleanup every 30 seconds
            blockDuration: 300000,    // 5 minutes block duration
            maxBlockDuration: 3600000 // 1 hour max block
        };
        
        this.init();
    }

    init() {
        console.log('🚦 TINI Rate Limiter v1.0 starting...');
        
        // Define standard rate limits
        this.setupStandardLimits();
        
        // Start cleanup routine
        this.startCleanup();
        
        console.log('✅ TINI Rate Limiter initialized');
    }

    /**
     * Setup standardized rate limits for different endpoint types
     */
    setupStandardLimits() {
        // Authentication endpoints - Very strict
        this.setLimit('/api/auth/login', {
            requests: 5,
            window: 60000,
            burst: 2,
            blockOnExceed: true,
            severity: 'CRITICAL'
        });
        
        this.setLimit('/api/auth/register', {
            requests: 3,
            window: 300000, // 5 minutes
            burst: 1,
            blockOnExceed: true,
            severity: 'CRITICAL'
        });

        // Session management - Moderate
        this.setLimit('/api/auth/validate', {
            requests: 30,
            window: 60000,
            burst: 10,
            blockOnExceed: false,
            severity: 'MEDIUM'
        });

        this.setLimit('/api/auth/logout', {
            requests: 10,
            window: 60000,
            burst: 3,
            blockOnExceed: false,
            severity: 'LOW'
        });

        // Admin and monitoring - Controlled
        this.setLimit('/admin-panel.html', {
            requests: 20,
            window: 60000,
            burst: 5,
            blockOnExceed: true,
            severity: 'HIGH'
        });

        this.setLimit('/api/security/stats', {
            requests: 15,
            window: 60000,
            burst: 5,
            blockOnExceed: false,
            severity: 'MEDIUM'
        });

        // Feedback systems - Higher but controlled
        this.setLimit('/api/monster-feedback', {
            requests: 50,
            window: 60000,
            burst: 15,
            blockOnExceed: false,
            severity: 'LOW'
        });

        // Security alerts - Critical but allow bursts
        this.setLimit('/api/security/alert', {
            requests: 25,
            window: 60000,
            burst: 10,
            blockOnExceed: true,
            severity: 'HIGH'
        });

        // Static resources - Liberal
        this.setLimit('*.js', {
            requests: 100,
            window: 60000,
            burst: 30,
            blockOnExceed: false,
            severity: 'LOW'
        });

        this.setLimit('*.css', {
            requests: 50,
            window: 60000,
            burst: 20,
            blockOnExceed: false,
            severity: 'LOW'
        });

        // Default for unspecified endpoints
        this.setLimit('default', {
            requests: 15,
            window: 60000,
            burst: 5,
            blockOnExceed: true,
            severity: 'MEDIUM'
        });

        console.log(`📋 Configured ${this.limits.size} rate limit rules`);
    }

    /**
     * Set rate limit for specific endpoint or pattern
     * @param {string} endpoint - Endpoint pattern
     * @param {object} config - Rate limit configuration
     */
    setLimit(endpoint, config) {
        const defaults = {
            requests: 15,
            window: 60000,
            burst: 5,
            blockOnExceed: true,
            severity: 'MEDIUM',
            adaptive: false,
            whitelistBoss: true
        };

        this.limits.set(endpoint, { ...defaults, ...config });
    }

    /**
     * Check if request is allowed
     * @param {string} endpoint - Request endpoint
     * @param {string} ip - Client IP
     * @param {object} options - Additional options
     * @returns {object} Rate limit result
     */
    checkLimit(endpoint, ip, options = {}) {
        // Check if IP is blocked
        if (this.isBlocked(ip)) {
            return {
                allowed: false,
                reason: 'IP_BLOCKED',
                remaining: 0,
                resetTime: this.getBlockExpiry(ip),
                severity: 'HIGH'
            };
        }

        // Check whitelist
        if (this.whitelist.has(ip)) {
            return {
                allowed: true,
                reason: 'WHITELISTED',
                remaining: Infinity,
                resetTime: null,
                severity: 'LOW'
            };
        }

        // Get rate limit config for endpoint
        const config = this.getLimitConfig(endpoint);
        if (!config) {
            return {
                allowed: true,
                reason: 'NO_LIMIT_CONFIGURED',
                remaining: Infinity,
                resetTime: null,
                severity: 'LOW'
            };
        }

        // Check BOSS bypass
        if (config.whitelistBoss && options.userRole && options.userRole.level >= 10000) {
            return {
                allowed: true,
                reason: 'BOSS_BYPASS',
                remaining: Infinity,
                resetTime: null,
                severity: 'LOW'
            };
        }

        // Get request history for this IP + endpoint
        const key = `${ip}:${endpoint}`;
        const now = Date.now();
        const requests = this.requests.get(key) || [];

        // Remove old requests outside window
        const validRequests = requests.filter(time => now - time < config.window);

        // Check if limit exceeded
        const requestCount = validRequests.length;
        const remaining = Math.max(0, config.requests - requestCount);

        if (requestCount >= config.requests) {
            // Check burst allowance
            const recentRequests = validRequests.filter(time => now - time < 5000); // Last 5 seconds
            if (recentRequests.length >= config.burst) {
                // Limit exceeded
                this.handleLimitExceeded(ip, endpoint, config, requestCount);
                
                return {
                    allowed: false,
                    reason: 'RATE_LIMIT_EXCEEDED',
                    remaining: 0,
                    resetTime: now + config.window,
                    severity: config.severity,
                    requestCount: requestCount,
                    limit: config.requests
                };
            }
        }

        // Add current request to history
        validRequests.push(now);
        this.requests.set(key, validRequests);

        return {
            allowed: true,
            reason: 'WITHIN_LIMIT',
            remaining: remaining - 1,
            resetTime: now + config.window,
            severity: config.severity,
            requestCount: requestCount + 1,
            limit: config.requests
        };
    }

    /**
     * Handle when rate limit is exceeded
     * @param {string} ip - Client IP
     * @param {string} endpoint - Endpoint
     * @param {object} config - Rate limit config
     * @param {number} requestCount - Current request count
     */
    handleLimitExceeded(ip, endpoint, config, requestCount) {
        console.log(`🚦 Rate limit exceeded: ${ip} on ${endpoint} (${requestCount}/${config.requests})`);

        // Block IP if configured
        if (config.blockOnExceed) {
            let blockDuration = this.settings.blockDuration;
            
            // Progressive blocking - increase duration for repeat offenders
            const blockHistory = this.getBlockHistory(ip);
            if (blockHistory.length > 0) {
                blockDuration = Math.min(
                    blockDuration * Math.pow(2, blockHistory.length),
                    this.settings.maxBlockDuration
                );
            }

            this.blockIP(ip, blockDuration, {
                reason: 'RATE_LIMIT_EXCEEDED',
                endpoint: endpoint,
                severity: config.severity,
                requestCount: requestCount
            });
        }

        // Emit event for monitoring
        this.emit('rateLimitExceeded', {
            ip: ip,
            endpoint: endpoint,
            config: config,
            requestCount: requestCount,
            timestamp: Date.now()
        });
    }

    /**
     * Get rate limit configuration for endpoint
     * @param {string} endpoint - Request endpoint
     * @returns {object|null} Rate limit config
     */
    getLimitConfig(endpoint) {
        // Exact match first
        if (this.limits.has(endpoint)) {
            return this.limits.get(endpoint);
        }

        // Pattern matching
        for (const [pattern, config] of this.limits.entries()) {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                if (regex.test(endpoint)) {
                    return config;
                }
            }
        }

        // Default fallback
        return this.limits.get('default');
    }

    /**
     * Block IP address
     * @param {string} ip - IP to block
     * @param {number} duration - Block duration in ms
     * @param {object} reason - Block reason details
     */
    blockIP(ip, duration, reason = {}) {
        const blockInfo = {
            blockedAt: Date.now(),
            expiresAt: Date.now() + duration,
            duration: duration,
            reason: reason,
            attempts: 1
        };

        // If already blocked, extend the block
        if (this.blockedIPs.has(ip)) {
            const existing = this.blockedIPs.get(ip);
            blockInfo.attempts = existing.attempts + 1;
            blockInfo.expiresAt = Math.max(existing.expiresAt, blockInfo.expiresAt);
        }

        this.blockedIPs.set(ip, blockInfo);
        
        console.log(`🚫 Blocked IP ${ip} for ${Math.round(duration/1000)}s (attempt #${blockInfo.attempts})`);
    }

    /**
     * Check if IP is currently blocked
     * @param {string} ip - IP to check
     * @returns {boolean} Is blocked
     */
    isBlocked(ip) {
        const blockInfo = this.blockedIPs.get(ip);
        if (!blockInfo) return false;

        if (Date.now() > blockInfo.expiresAt) {
            this.blockedIPs.delete(ip);
            return false;
        }

        return true;
    }

    /**
     * Get block expiry time
     * @param {string} ip - IP address
     * @returns {number|null} Expiry timestamp
     */
    getBlockExpiry(ip) {
        const blockInfo = this.blockedIPs.get(ip);
        return blockInfo ? blockInfo.expiresAt : null;
    }

    /**
     * Get block history for IP
     * @param {string} ip - IP address
     * @returns {Array} Block history
     */
    getBlockHistory(ip) {
        // This is a simplified version - in production, store in persistent storage
        const blockInfo = this.blockedIPs.get(ip);
        return blockInfo ? [blockInfo] : [];
    }

    /**
     * Add IP to whitelist
     * @param {string} ip - IP to whitelist
     */
    addToWhitelist(ip) {
        this.whitelist.add(ip);
        console.log(`✅ Added ${ip} to whitelist`);
    }

    /**
     * Remove IP from whitelist
     * @param {string} ip - IP to remove
     */
    removeFromWhitelist(ip) {
        this.whitelist.delete(ip);
        console.log(`❌ Removed ${ip} from whitelist`);
    }

    /**
     * Unblock IP address
     * @param {string} ip - IP to unblock
     */
    unblockIP(ip) {
        if (this.blockedIPs.delete(ip)) {
            console.log(`✅ Unblocked IP ${ip}`);
            return true;
        }
        return false;
    }

    /**
     * Start cleanup routine
     */
    startCleanup() {
        setInterval(() => {
            this.cleanup();
        }, this.settings.cleanupInterval);
    }

    /**
     * Cleanup expired data
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        // Cleanup old request records
        for (const [key, requests] of this.requests.entries()) {
            const validRequests = requests.filter(time => now - time < this.settings.windowSize * 2);
            if (validRequests.length === 0) {
                this.requests.delete(key);
                cleaned++;
            } else if (validRequests.length !== requests.length) {
                this.requests.set(key, validRequests);
            }
        }

        // Cleanup expired blocks
        for (const [ip, blockInfo] of this.blockedIPs.entries()) {
            if (now > blockInfo.expiresAt) {
                this.blockedIPs.delete(ip);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Rate limiter cleaned ${cleaned} expired records`);
        }
    }

    /**
     * Get statistics
     * @returns {object} Rate limiter stats
     */
    getStats() {
        return {
            configuredLimits: this.limits.size,
            activeRequests: this.requests.size,
            blockedIPs: this.blockedIPs.size,
            whitelistedIPs: this.whitelist.size,
            settings: this.settings
        };
    }

    /**
     * Simple event emitter
     */
    emit(event, data) {
        // Could integrate with proper event system
        console.log(`📡 Rate Limiter Event: ${event}`, data);
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.TINIRateLimiter = new TINIRateLimiter();
} else if (typeof global !== 'undefined') {
    global.TINIRateLimiter = new TINIRateLimiter();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIRateLimiter;
}
