// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Ultimate DDoS Shield - Military-Grade DDoS Protection
class UltimateDDoSShield {
    constructor() {
        this.requestCounts = new Map();
        this.bannedIPs = new Set();
        this.bannedUntil = new Map();
        this.suspiciousIPs = new Map();
        this.whitelistedIPs = new Set(['127.0.0.1', '::1']); // Localhost always allowed
        this.isBypassMode = false;
        this.bypassTimeout = null;
        this.attackStatistics = {
            totalBlocked: 0,
            coordinatedAttacks: 0,
            rateLimitExceeded: 0,
            lastAttackTime: null
        };

        // 🛡️ Enhanced configurable thresholds for DDoS protection
        this.config = {
            requestsPerMinute: 100,     // Standard limit over a minute
            burstLimit: 20,             // Short-term burst limit
            burstWindowMs: 5000,        // 5-second window for burst
            banDurationMs: 30 * 60 * 1000, // Ban for 30 minutes
            cleanupIntervalMs: 5 * 60 * 1000, // Clean up old request data every 5 mins
            suspiciousThreshold: 50,    // Requests that trigger suspicious monitoring
            maxConcurrentConnections: 1000, // Max concurrent connections
            progressiveBanMultiplier: 2,     // Ban duration multiplier for repeat offenders
            geoBlockEnabled: false,     // Geographic blocking (future feature)
            honeypotMode: false         // Honeypot mode for advanced attackers
        };

        // Start periodic cleanup of old request data
        setInterval(() => this.cleanupOldRequests(), this.config.cleanupIntervalMs);
        
        // Initialize security monitoring
        this.initializeAdvancedMonitoring();
        
        console.log('🛡️ [DDoS Shield] Ultimate DDoS Shield initialized with advanced protection.');
        console.log(`🔧 [Config] Rate Limit: ${this.config.requestsPerMinute}/min, Burst: ${this.config.burstLimit}/${this.config.burstWindowMs/1000}s`);
    }

    initializeAdvancedMonitoring() {
        // Advanced pattern detection for sophisticated attacks
        this.patternDetection = {
            userAgentPatterns: new Map(),
            requestPatterns: new Map(),
            timingPatterns: new Map()
        };
        
        // Start advanced monitoring cycle
        setInterval(() => this.analyzeAttackPatterns(), 30000); // Every 30 seconds
        
        console.log('🔍 [DDoS Shield] Advanced pattern detection activated.');
    }

    async validateRequest(req) {
        // 🚨 Enhanced validation with multiple security layers
        
        // Extract IP with better detection
        const ip = this.extractRealIP(req);
        
        // Check whitelist first
        if (this.whitelistedIPs.has(ip)) {
            return { allowed: true, reason: 'WHITELISTED_IP' };
        }
        
        // Bypass mode for admins or special cases
        if (this.isBypassMode) {
            return { allowed: true, reason: 'BYPASS_MODE_ACTIVE' };
        }

        // 1. Check if IP is currently banned
        if (this.bannedIPs.has(ip)) {
            if (this.bannedUntil.get(ip) < Date.now()) {
                // Ban has expired
                this.bannedIPs.delete(ip);
                this.bannedUntil.delete(ip);
                console.log(`✅ [DDoS Shield] IP unbanned: ${ip}`);
            } else {
                this.attackStatistics.totalBlocked++;
                return { 
                    allowed: false, 
                    reason: 'PERMANENTLY_BANNED', 
                    details: `Banned until ${new Date(this.bannedUntil.get(ip)).toLocaleTimeString()}`,
                    severity: 'HIGH'
                };
            }
        }

        // 2. Advanced threat analysis
        const threatLevel = await this.analyzeThreatLevel(req, ip);
        if (threatLevel.blocked) {
            return threatLevel;
        }

        // 3. Record the request and check limits
        this.recordRequest(ip);
        const requests = this.requestCounts.get(ip) || [];
        const now = Date.now();

        // Check burst limit (e.g., 20 requests in 5 seconds)
        const burstRequests = requests.filter(time => now - time < this.config.burstWindowMs);
        if (burstRequests.length > this.config.burstLimit) {
            this.banIp(ip, 'COORDINATED_ATTACK');
            this.attackStatistics.coordinatedAttacks++;
            return { 
                allowed: false, 
                reason: 'COORDINATED_ATTACK', 
                details: `Burst limit exceeded: ${burstRequests.length} reqs in ${this.config.burstWindowMs / 1000}s`,
                severity: 'CRITICAL'
            };
        }

        // Check standard limit (e.g., 100 requests in 1 minute)
        const minuteRequests = requests.filter(time => now - time < 60000);
        if (minuteRequests.length > this.config.requestsPerMinute) {
            this.banIp(ip, 'RATE_LIMIT_EXCEEDED');
            this.attackStatistics.rateLimitExceeded++;
            return { 
                allowed: false, 
                reason: 'RATE_LIMIT_EXCEEDED', 
                details: `Rate limit exceeded: ${minuteRequests.length} reqs in 1 min`,
                severity: 'HIGH'
            };
        }

        // Check suspicious threshold
        if (minuteRequests.length > this.config.suspiciousThreshold) {
            this.markSuspicious(ip, 'HIGH_REQUEST_VOLUME');
            console.log(`⚠️ [DDoS Shield] Suspicious activity from ${ip}: ${minuteRequests.length} reqs/min`);
        }

        return { allowed: true, reason: null, details: null };
    }

    extractRealIP(req) {
        // Enhanced IP extraction considering various proxy configurations
        const forwarded = req.headers['x-forwarded-for'];
        const realIP = req.headers['x-real-ip'];
        const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare
        
        if (cfConnectingIP) return cfConnectingIP;
        if (realIP) return realIP;
        if (forwarded) return forwarded.split(',')[0].trim();
        
        return req.connection?.remoteAddress || 
               req.socket?.remoteAddress || 
               req.connection?.socket?.remoteAddress || 
               '127.0.0.1';
    }

    async analyzeThreatLevel(req, ip) {
        const userAgent = req.headers['user-agent'] || '';
        const threats = [];

        // 1. User Agent Analysis
        if (this.isBotuserAgent(userAgent)) {
            threats.push('BOT_USER_AGENT');
        }

        // 2. Request Pattern Analysis
        if (this.detectSuspiciousPatterns(req, ip)) {
            threats.push('SUSPICIOUS_PATTERNS');
        }

        // 3. Timing Attack Detection
        if (this.detectTimingAttack(ip)) {
            threats.push('TIMING_ATTACK');
        }

        // 4. Geographic Analysis (if enabled)
        if (this.config.geoBlockEnabled && await this.isFromBlockedGeo(ip)) {
            threats.push('GEO_BLOCKED');
        }

        if (threats.length > 0) {
            const severity = threats.length >= 3 ? 'CRITICAL' : threats.length >= 2 ? 'HIGH' : 'MEDIUM';
            this.markSuspicious(ip, threats.join(', '));
            
            if (threats.length >= 2) {
                this.banIp(ip, 'MULTIPLE_THREAT_INDICATORS');
                return {
                    allowed: false,
                    reason: 'MULTIPLE_THREAT_INDICATORS',
                    details: `Threats detected: ${threats.join(', ')}`,
                    severity: severity
                };
            }
        }

        return { blocked: false };
    }

    isBotuserAgent(userAgent) {
        const botPatterns = [
            /bot/i, /crawler/i, /spider/i, /scraper/i,
            /curl/i, /wget/i, /python/i, /perl/i,
            /masscan/i, /nmap/i, /nikto/i, /sqlmap/i
        ];
        
        return botPatterns.some(pattern => pattern.test(userAgent)) || userAgent.length < 10;
    }

    detectSuspiciousPatterns(req, ip) {
        const url = req.url || '';
        const method = req.method || 'GET';
        
        // Suspicious URL patterns
        const suspiciousUrls = [
            /\.env/, /config/, /admin/, /wp-/, /phpmyadmin/,
            /\.git/, /\.svn/, /backup/, /dump/, /sql/
        ];
        
        if (suspiciousUrls.some(pattern => pattern.test(url))) {
            return true;
        }
        
        // Suspicious methods
        if (['TRACE', 'CONNECT', 'PROPFIND'].includes(method)) {
            return true;
        }
        
        return false;
    }

    detectTimingAttack(ip) {
        const requests = this.requestCounts.get(ip) || [];
        if (requests.length < 5) return false;
        
        // Check for perfectly timed requests (possible automation)
        const intervals = [];
        for (let i = 1; i < requests.length; i++) {
            intervals.push(requests[i] - requests[i-1]);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        
        // Low variance indicates automated timing
        return variance < 100; // Very consistent timing suggests automation
    }

    async isFromBlockedGeo(ip) {
        // Placeholder for geographic blocking
        // In production, integrate with GeoIP service
        return false;
    }

    markSuspicious(ip, reason) {
        if (!this.suspiciousIPs.has(ip)) {
            this.suspiciousIPs.set(ip, []);
        }
        
        this.suspiciousIPs.get(ip).push({
            timestamp: Date.now(),
            reason: reason
        });
        
        // Auto-ban if too many suspicious activities
        const suspiciousEvents = this.suspiciousIPs.get(ip);
        if (suspiciousEvents.length >= 3) {
            this.banIp(ip, 'REPEATED_SUSPICIOUS_ACTIVITY');
        }
    }

    recordRequest(ip) {
        const now = Date.now();
        const requests = this.requestCounts.get(ip) || [];
        requests.push(now);
        this.requestCounts.set(ip, requests);
        
        // Update pattern detection
        this.updatePatternDetection(ip, now);
    }

    updatePatternDetection(ip, timestamp) {
        // Track timing patterns for this IP
        if (!this.patternDetection.timingPatterns.has(ip)) {
            this.patternDetection.timingPatterns.set(ip, []);
        }
        
        const timings = this.patternDetection.timingPatterns.get(ip);
        timings.push(timestamp);
        
        // Keep only recent timings
        const recentTimings = timings.filter(time => timestamp - time < 300000); // 5 minutes
        this.patternDetection.timingPatterns.set(ip, recentTimings);
    }

    banIp(ip, reason = 'UNSPECIFIED') {
        // Progressive ban system - longer bans for repeat offenders
        const banHistory = this.suspiciousIPs.get(ip) || [];
        const banMultiplier = Math.min(banHistory.length + 1, 5); // Max 5x multiplier
        const banDuration = this.config.banDurationMs * banMultiplier;
        
        this.bannedIPs.add(ip);
        this.bannedUntil.set(ip, Date.now() + banDuration);
        this.attackStatistics.totalBlocked++;
        this.attackStatistics.lastAttackTime = Date.now();
        
        console.log(`🚫 [DDoS Shield] IP Banned: ${ip} for ${banDuration / 60000} minutes (Reason: ${reason}, Multiplier: ${banMultiplier}x)`);
        
        // Clean up request history for banned IP
        this.requestCounts.delete(ip);
    }

    cleanupOldRequests() {
        const now = Date.now();
        let cleanedIPs = 0;
        
        // Clean request counts
        for (const [ip, timestamps] of this.requestCounts.entries()) {
            const recentTimestamps = timestamps.filter(time => now - time < 60000);
            if (recentTimestamps.length === 0) {
                this.requestCounts.delete(ip);
                cleanedIPs++;
            } else {
                this.requestCounts.set(ip, recentTimestamps);
            }
        }
        
        // Clean suspicious IPs (older than 1 hour)
        for (const [ip, events] of this.suspiciousIPs.entries()) {
            const recentEvents = events.filter(event => now - event.timestamp < 3600000);
            if (recentEvents.length === 0) {
                this.suspiciousIPs.delete(ip);
            } else {
                this.suspiciousIPs.set(ip, recentEvents);
            }
        }
        
        // Clean expired bans
        let expiredBans = 0;
        for (const [ip, banTime] of this.bannedUntil.entries()) {
            if (banTime < now) {
                this.bannedIPs.delete(ip);
                this.bannedUntil.delete(ip);
                expiredBans++;
            }
        }
        
        if (cleanedIPs > 0 || expiredBans > 0) {
            console.log(`🧹 [DDoS Shield] Cleanup: ${cleanedIPs} IP records, ${expiredBans} expired bans removed`);
        }
    }

    analyzeAttackPatterns() {
        const now = Date.now();
        const recentAttacks = [];
        
        // Analyze recent suspicious activities
        for (const [ip, events] of this.suspiciousIPs.entries()) {
            const recentEvents = events.filter(event => now - event.timestamp < 300000); // 5 minutes
            if (recentEvents.length >= 2) {
                recentAttacks.push({ ip, eventCount: recentEvents.length });
            }
        }
        
        if (recentAttacks.length > 0) {
            console.log(`🔍 [DDoS Shield] Pattern Analysis: ${recentAttacks.length} IPs with suspicious patterns detected`);
            
            // If too many concurrent attacks, enable defensive mode
            if (recentAttacks.length >= 5) {
                this.enableDefensiveMode(300000); // 5 minutes
            }
        }
    }

    enableDefensiveMode(duration) {
        const oldConfig = { ...this.config };
        
        // Temporarily reduce limits
        this.config.requestsPerMinute = Math.floor(this.config.requestsPerMinute * 0.5);
        this.config.burstLimit = Math.floor(this.config.burstLimit * 0.5);
        
        console.log(`🛡️ [DDoS Shield] DEFENSIVE MODE ACTIVATED for ${duration/60000} minutes`);
        console.log(`🔧 [Config] Reduced limits: ${this.config.requestsPerMinute}/min, Burst: ${this.config.burstLimit}`);
        
        setTimeout(() => {
            this.config = oldConfig;
            console.log('🛡️ [DDoS Shield] Defensive mode deactivated - normal limits restored');
        }, duration);
    }

    setBypassMode(enable, durationMs) {
        this.isBypassMode = enable;
        if (this.bypassTimeout) clearTimeout(this.bypassTimeout);
        if (enable && durationMs) {
            this.bypassTimeout = setTimeout(() => {
                this.isBypassMode = false;
                console.log('🛡️ [DDoS Shield] Bypass mode automatically disabled.');
            }, durationMs);
        }
        console.log(`🛡️ [DDoS Shield] Bypass mode ${enable ? `enabled for ${durationMs / 60000} mins` : 'disabled'}.`);
    }

    // 🔧 Advanced Management Methods
    addToWhitelist(ip) {
        this.whitelistedIPs.add(ip);
        // Remove from ban lists if present
        this.bannedIPs.delete(ip);
        this.bannedUntil.delete(ip);
        this.suspiciousIPs.delete(ip);
        console.log(`✅ [DDoS Shield] IP whitelisted: ${ip}`);
    }

    removeFromWhitelist(ip) {
        this.whitelistedIPs.delete(ip);
        console.log(`❌ [DDoS Shield] IP removed from whitelist: ${ip}`);
    }

    manualBan(ip, reason = 'MANUAL_BAN', durationMs = null) {
        const banDuration = durationMs || this.config.banDurationMs;
        this.bannedIPs.add(ip);
        this.bannedUntil.set(ip, Date.now() + banDuration);
        console.log(`🔨 [DDoS Shield] Manual ban applied: ${ip} for ${banDuration / 60000} mins (${reason})`);
    }

    unbanIP(ip) {
        this.bannedIPs.delete(ip);
        this.bannedUntil.delete(ip);
        this.suspiciousIPs.delete(ip);
        console.log(`🔓 [DDoS Shield] IP unbanned: ${ip}`);
    }

    getStatistics() {
        return {
            ...this.attackStatistics,
            currentlyBanned: this.bannedIPs.size,
            suspiciousIPs: this.suspiciousIPs.size,
            whitelistedIPs: this.whitelistedIPs.size,
            monitoredIPs: this.requestCounts.size,
            bypassMode: this.isBypassMode,
            config: { ...this.config }
        };
    }

    updateConfig(newConfig) {
        const oldConfig = { ...this.config };
        this.config = { ...this.config, ...newConfig };
        
        console.log('🔧 [DDoS Shield] Configuration updated:');
        for (const [key, value] of Object.entries(newConfig)) {
            if (oldConfig[key] !== value) {
                console.log(`   ${key}: ${oldConfig[key]} → ${value}`);
            }
        }
    }

    // Emergency methods
    emergencyLockdown(durationMs = 600000) { // 10 minutes default
        console.log('🚨 [DDoS Shield] EMERGENCY LOCKDOWN ACTIVATED');
        const oldConfig = { ...this.config };
        
        // Extremely restrictive settings
        this.config.requestsPerMinute = 5;
        this.config.burstLimit = 2;
        this.config.burstWindowMs = 10000;
        
        setTimeout(() => {
            this.config = oldConfig;
            console.log('🚨 [DDoS Shield] Emergency lockdown lifted - normal operation resumed');
        }, durationMs);
    }

    resetAllBans() {
        const bannedCount = this.bannedIPs.size;
        this.bannedIPs.clear();
        this.bannedUntil.clear();
        this.suspiciousIPs.clear();
        console.log(`🔄 [DDoS Shield] All bans reset - ${bannedCount} IPs unbanned`);
    }
}

// Browser-only code - only run in browser environment
if (typeof window !== 'undefined') {
    // Create a global instance of the shield
    if (!window.TINI_DDoS_SHIELD) {
        window.TINI_DDoS_SHIELD = new UltimateDDoSShield();
        console.log('✅ [DDoS Shield] Global instance created and is now active.');
    }

    // Integrate with the TINI Security Event Bus as soon as it's available
    document.addEventListener('TINI_BUS_READY', () => {
        if (window.TINI_SECURITY_BUS && window.TINI_DDoS_SHIELD) {
            console.log('🛡️ [DDoS Shield] Integrating with Security Event Bus...');

        const shield = window.TINI_DDoS_SHIELD;

        // Listen for commands from the AI Orchestrator or other modules
        window.TINI_SECURITY_BUS.on('tini:block-ip', (payload) => {
            if (payload && payload.ip) {
                console.log(`🛡️ [DDoS Shield] Received block command for IP: ${payload.ip}`);
                shield.manualBan(payload.ip, payload.reason || 'AI_COMMAND', payload.durationMs);
            }
        });

        window.TINI_SECURITY_BUS.on('tini:unblock-ip', (payload) => {
            if (payload && payload.ip) {
                console.log(`🛡️ [DDoS Shield] Received unblock command for IP: ${payload.ip}`);
                shield.unbanIP(payload.ip);
            }
        });

        window.TINI_SECURITY_BUS.on('tini:whitelist-ip', (payload) => {
            if (payload && payload.ip) {
                console.log(`🛡️ [DDoS Shield] Received whitelist command for IP: ${payload.ip}`);
                shield.addToWhitelist(payload.ip);
            }
        });

        window.TINI_SECURITY_BUS.on('tini:unwhitelist-ip', (payload) => {
            if (payload && payload.ip) {
                console.log(`🛡️ [DDoS Shield] Received remove-whitelist command for IP: ${payload.ip}`);
                shield.removeFromWhitelist(payload.ip);
            }
        });

        console.log('✅ [DDoS Shield] Successfully integrated with Event Bus. Ready for commands.');

    } else {
        console.warn('⚠️ [DDoS Shield] TINI Security Event Bus not found after ready signal.');
    }
});

    // Fallback for cases where the bus might already be ready
    if (window.TINI_SECURITY_BUS) {
        document.dispatchEvent(new CustomEvent('TINI_BUS_READY'));
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UltimateDDoSShield;
}

// ST:TINI_1754879322_e868a412
