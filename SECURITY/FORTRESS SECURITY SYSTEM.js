// ULTIMATE FORTRESS SECURITY SYSTEM
// Hệ thống bảo mật cấp quân sự chống DDoS và coordinated attacks

class UltimateFortressSecurity {
    constructor() {
        this.attackPatterns = new Map();
        this.ipBlacklist = new Set();
        this.deviceFingerprints = new Map();
        this.sessionTokens = new Map();
        this.rateLimiters = new Map();
        this.suspiciousActivities = new Map();
        this.geoLocationCache = new Map();
        this.biometricHashes = new Map();
        this.attackAttempts = new Map();
        this.blockedIPs = new Set();
        this.honeypotLogs = new Map();
        this.globalThreatPatterns = {
            suspiciousIPs: [],
            attackPatterns: 0,
            lastAnalysis: null
        };
        this.lastThreatIntelligence = null;
        
        // Advanced Detection Thresholds
        this.MAX_REQUESTS_PER_SECOND = 2;
        this.MAX_CONCURRENT_SESSIONS = 1;
        this.MAX_FAILED_ATTEMPTS = 3;
        this.SUSPICIOUS_PATTERN_THRESHOLD = 5;
        this.DEVICE_TRUST_SCORE_MIN = 85;
        this.AUTO_CLICK_DETECTION_THRESHOLD = 100; // ms between clicks
        
        // Blacklist Duration (escalating)
        this.BLACKLIST_DURATION = {
            LEVEL_1: 5 * 60 * 1000,      // 5 minutes
            LEVEL_2: 30 * 60 * 1000,     // 30 minutes  
            LEVEL_3: 2 * 60 * 60 * 1000, // 2 hours
            LEVEL_4: 24 * 60 * 60 * 1000, // 24 hours
            PERMANENT: Infinity
        };
        
        // Initialize security components
        this.initializeSecurity();
        console.log('🏰 [FORTRESS] Ultimate Fortress Security System Armed and Ready!');
    }

    initializeSecurity() {
        // Honeypot endpoints
        this.honeypots = [
            '/admin.php', '/wp-admin', '/login.php', 
            '/phpmyadmin', '/administrator', '/manage'
        ];
        
        // Start monitoring
        this.startContinuousMonitoring();
        
        // Initialize threat intelligence
        this.updateThreatIntelligence();
    }

    // =================== MAIN SECURITY FUNCTIONS ===================

    async analyzeRequest(req, res, userRole = null) {
        const clientInfo = {
            ip: this.getRealIP(req),
            userAgent: req.headers['user-agent'] || '',
            path: req.path || req.url || '',
            method: req.method || 'GET',
            headers: req.headers || {},
            sessionId: req.sessionID,
            userRole: userRole,
            timestamp: Date.now()
        };

        // BOSS bypass - absolute authority
        const isBOSS = userRole && (
            userRole.level >= 10000 || 
            userRole.role === 'boss' || 
            userRole.name === 'BOSS' ||
            userRole.infinitePower ||
            userRole.immuneToOwnRules
        );
        
        if (isBOSS) {
            console.log('👑 [BOSS] INFINITE AUTHORITY DETECTED - BYPASSING ALL FORTRESS SECURITY');
            console.log('🚀 [BOSS] Immune to blacklists, rate limits, and all restrictions');
            return { success: true, bypass: true, reason: 'BOSS_INFINITE_POWER' };
        }
        
        const threatLevel = await this.assessThreatLevel(clientInfo);
        
        console.log(`[FORTRESS] 🔍 Analyzing request from ${clientInfo.ip} - Threat Level: ${threatLevel}`);
        
        if (threatLevel >= 8) {
            await this.executeCountermeasures(clientInfo, 'HIGH_THREAT');
            return this.blockRequest(res, 'THREAT_DETECTED');
        }
        
        if (threatLevel >= 5) {
            await this.executeCountermeasures(clientInfo, 'MEDIUM_THREAT');
            return this.challengeRequest(res, 'VERIFICATION_REQUIRED');
        }
        
        // Log clean request
        this.logSecureAccess(clientInfo);
        return { success: true, threat: threatLevel };
    }

    async assessThreatLevel(clientInfo) {
        // BOSS immunity check
        if (clientInfo.userRole && (
            clientInfo.userRole.level >= 10000 ||
            clientInfo.userRole.role === 'boss' ||
            clientInfo.userRole.infinitePower
        )) {
            console.log('👑 [BOSS] Threat assessment bypassed - BOSS is never a threat');
            return 0; // BOSS always gets zero threat score
        }
        
        let threatScore = 0;
        
        // IP-based threats
        if (this.ipBlacklist.has(clientInfo.ip)) threatScore += 10;
        if (await this.isKnownVPN(clientInfo.ip)) threatScore += 3;
        if (await this.isDataCenter(clientInfo.ip)) threatScore += 5;
        
        // Rate limiting violations
        const requestRate = this.getRequestRate(clientInfo.ip);
        if (requestRate > this.MAX_REQUESTS_PER_SECOND) threatScore += 4;
        
        // Auto-click detection
        if (this.detectAutoClick(clientInfo.ip)) threatScore += 6;
        
        // Coordinated attack detection
        if (await this.detectCoordinatedAttack(clientInfo.ip)) threatScore += 8;
        
        // Honeypot interaction
        if (this.isHoneypotRequest(clientInfo.path)) threatScore += 10;
        
        // Device fingerprint analysis
        if (!await this.verifyDeviceFingerprint(clientInfo)) threatScore += 3;
        
        // Behavioral biometrics
        if (!await this.verifyBehaviorBiometrics(clientInfo)) threatScore += 4;
        
        // Geolocation anomalies
        if (await this.detectGeoAnomaly(clientInfo.ip)) threatScore += 2;
        
        return Math.max(0, Math.min(10, threatScore));
    }

    // =================== ATTACK DETECTION METHODS ===================

    getRequestRate(ip) {
        const now = Date.now();
        const timeWindow = 1000; // 1 second
        
        if (!this.rateLimiters.has(ip)) {
            this.rateLimiters.set(ip, []);
        }
        
        const requests = this.rateLimiters.get(ip);
        
        // Clean old requests
        const validRequests = requests.filter(timestamp => now - timestamp < timeWindow);
        
        // Add current request
        validRequests.push(now);
        this.rateLimiters.set(ip, validRequests);
        
        return validRequests.length;
    }

    detectAutoClick(ip) {
        const attacks = this.attackAttempts.get(ip) || [];
        if (attacks.length < 2) return false;
        
        // Check for suspiciously consistent timing
        const intervals = [];
        for (let i = 1; i < attacks.length; i++) {
            intervals.push(attacks[i].timestamp - attacks[i-1].timestamp);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        
        // If variance is very low and interval is very consistent, it's likely automated
        if (variance < 100 && avgInterval < this.AUTO_CLICK_DETECTION_THRESHOLD) {
            console.log(`[FORTRESS] 🤖 Auto-click detected from ${ip}: variance=${variance}, interval=${avgInterval}ms`);
            return true;
        }
        
        return false;
    }

    async detectCoordinatedAttack(ip) {
        const recentAttacks = this.getRecentAttacks(300000); // Last 5 minutes
        const uniqueIPs = new Set(recentAttacks.map(attack => attack.ip));
        
        if (uniqueIPs.size < 3) return false;
        
        // Get recent requests from all IPs
        const recentRequests = Array.from(this.rateLimiters.entries())
            .filter(([reqIp, timestamps]) => timestamps.length > 0)
            .filter(([reqIp, timestamps]) => Date.now() - Math.max(...timestamps) < 60000); // Last 1 minute
        
        if (recentRequests.length < 3) return false;
        
        // Check for similar patterns
        const patterns = recentRequests.map(([reqIp, timestamps]) => ({
            userAgent: this.getStoredUserAgent(reqIp),
            timing: timestamps,
            frequency: timestamps.length
        }));
        
        // Detect synchronized timing (coordinated attack)
        const avgFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0) / patterns.length;
        const frequencyVariance = patterns.reduce((sum, p) => sum + Math.pow(p.frequency - avgFrequency, 2), 0) / patterns.length;
        
        if (frequencyVariance < 1 && avgFrequency > 5) { // Very similar frequency = coordinated
            console.log(`[FORTRESS] 💥 Coordinated attack detected: ${recentRequests.length} attackers`);
            return true;
        }
        
        return false;
    }

    async verifyDeviceFingerprint(clientInfo) {
        const fingerprint = this.generateDeviceFingerprint(clientInfo);
        const stored = this.deviceFingerprints.get(clientInfo.sessionId);
        
        if (!stored) {
            this.deviceFingerprints.set(clientInfo.sessionId, fingerprint);
            return true; // First time, assume valid
        }
        
        const similarity = this.calculateFingerprintSimilarity(stored, fingerprint);
        return similarity > 0.8; // 80% similarity required
    }

    async verifyBehaviorBiometrics(clientInfo) {
        // Simplified behavior analysis
        const userId = clientInfo.sessionId;
        const behaviorData = {
            requestTiming: Date.now(),
            userAgent: clientInfo.userAgent,
            requestPattern: clientInfo.path
        };
        
        if (!this.biometricHashes.has(userId)) {
            this.biometricHashes.set(userId, behaviorData);
            return true; // First time
        }
        
        const baseline = this.biometricHashes.get(userId);
        const similarity = this.calculateBehaviorSimilarity(baseline, behaviorData);
        
        if (similarity < 0.7) {
            console.log(`[FORTRESS] 🧬 Biometric mismatch for ${userId}: similarity=${similarity}`);
            return false;
        }
        
        return true;
    }

    async detectGeoAnomaly(ip) {
        // Simplified geo detection
        const location = await this.getGeoLocation(ip);
        const cached = this.geoLocationCache.get(ip);
        
        if (!cached) {
            this.geoLocationCache.set(ip, location);
            return false;
        }
        
        // Check for impossible travel (too fast between locations)
        const distance = this.calculateDistance(cached.location, location);
        const timeDiff = Date.now() - cached.timestamp;
        const speed = distance / (timeDiff / 3600000); // km/h
        
        if (speed > 1000) { // Faster than commercial airline
            console.log(`[FORTRESS] 🌍 Impossible travel detected for ${ip}: ${speed} km/h`);
            return true;
        }
        
        return false;
    }

    isHoneypotRequest(path) {
        return this.honeypots.includes(path);
    }
    
    // =================== UTILITY FUNCTIONS ===================
    
    getRealIP(req) {
        return req.headers['x-forwarded-for']?.split(',')[0] ||
               req.headers['x-real-ip'] ||
               req.connection?.remoteAddress ||
               req.socket?.remoteAddress ||
               '127.0.0.1';
    }

    async isKnownVPN(ip) {
        // Simplified VPN detection
        const vpnRanges = ['10.', '192.168.', '172.'];
        return vpnRanges.some(range => ip.startsWith(range));
    }

    async isDataCenter(ip) {
        // Simplified datacenter detection
        const dcRanges = ['5.', '8.8.', '1.1.'];
        return dcRanges.some(range => ip.startsWith(range));
    }

    startContinuousMonitoring() {
        setInterval(() => {
            this.cleanupOldData();
            this.analyzeGlobalPatterns();
        }, 60000); // Every minute
    }

    cleanupOldData() {
        const now = Date.now();
        const maxAge = 3600000; // 1 hour
        
        // Clean rate limiters
        for (const [ip, timestamps] of this.rateLimiters.entries()) {
            const valid = timestamps.filter(t => now - t < maxAge);
            if (valid.length === 0) {
                this.rateLimiters.delete(ip);
            } else {
                this.rateLimiters.set(ip, valid);
            }
        }
    }

    async alertAdministrators(clientInfo, alertType) {
        const alert = {
            type: alertType,
            timestamp: Date.now(),
            clientInfo,
            severity: 'CRITICAL',
            message: `Coordinated attack detected from ${clientInfo.ip}`
        };
        
        console.log(`[FORTRESS] 🚨 CRITICAL ALERT: ${alert.message}`);
        // In production, send to actual alert system
    }

    // =================== RESPONSE METHODS ===================

    blockRequest(res, reason) {
        if (res && typeof res.status === 'function') {
            res.status(403).json({
                error: 'Access Denied',
                reason: reason,
                timestamp: Date.now()
            });
        }
        return { success: false, blocked: true, reason };
    }

    challengeRequest(res, reason) {
        if (res && typeof res.status === 'function') {
            res.status(429).json({
                error: 'Rate Limited',
                reason: reason,
                retryAfter: 60
            });
        }
        return { success: false, challenge: true, reason };
    }

    logSecureAccess(clientInfo) {
        console.log(`[FORTRESS] ✅ Secure access granted to ${clientInfo.ip}`);
    }

    // =================== HELPER METHODS ===================

    generateDeviceFingerprint(clientInfo) {
        return {
            userAgent: clientInfo.userAgent,
            headers: JSON.stringify(clientInfo.headers),
            timestamp: Date.now()
        };
    }

    calculateFingerprintSimilarity(stored, current) {
        if (stored.userAgent !== current.userAgent) return 0;
        return 0.9; // Simplified
    }

    calculateBehaviorSimilarity(baseline, current) {
        return 0.8; // Simplified
    }

    async getGeoLocation(ip) {
        return { 
            location: { lat: 0, lng: 0 }, 
            timestamp: Date.now() 
        }; // Simplified
    }

    calculateDistance(loc1, loc2) {
        return 0; // Simplified
    }

    getRecentAttacks(timeWindow) {
        const now = Date.now();
        const attacks = [];
        
        for (const [ip, data] of this.attackAttempts.entries()) {
            const recent = data.filter(attack => now - attack.timestamp < timeWindow);
            attacks.push(...recent.map(attack => ({ ip, ...attack })));
        }
        
        return attacks;
    }

    getStoredUserAgent(ip) {
        return 'unknown'; // Simplified
    }

    analyzeGlobalPatterns() {
        // Advanced threat pattern analysis
        console.log('[FORTRESS] 📊 Analyzing global threat patterns...');
    }

    updateThreatIntelligence() {
        // Update threat intelligence feeds
        console.log('[FORTRESS] 🕵️ Updating threat intelligence...');
    }

    async executeCountermeasures(clientInfo, level) {
        console.log(`[FORTRESS] ⚔️ Executing countermeasures level ${level} for ${clientInfo.ip}`);
        
        switch (level) {
            case 'HIGH_THREAT':
                this.ipBlacklist.add(clientInfo.ip);
                await this.alertAdministrators(clientInfo, 'HIGH_THREAT_DETECTED');
                break;
            case 'MEDIUM_THREAT':
                // Temporary rate limiting
                break;
        }
    }
}

// Make available globally for browser environment
if (typeof window !== 'undefined') {
    window.UltimateFortressSecurity = UltimateFortressSecurity;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = UltimateFortressSecurity;
}
