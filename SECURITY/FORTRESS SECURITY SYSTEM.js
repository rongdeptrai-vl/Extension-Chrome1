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
        
        this.init();
    }

    init() {
        console.log('[ULTIMATE FORTRESS] 🏰 Military-Grade Security System Activated');
        this.startContinuousMonitoring();
        this.initializeHoneypots();
        this.setupAdvancedDetection();
    }

    setupAdvancedDetection() {
        console.log('[FORTRESS] 🔬 Advanced threat detection algorithms initialized');
        
        // Initialize advanced detection systems
        this.behaviorAnalysis = new Map();
        this.patternMatching = new Map();
        this.anomalyDetection = new Map();
        
        // Setup ML-based detection patterns
        this.trainingData = {
            normalBehavior: [],
            maliciousBehavior: [],
            thresholds: {
                anomaly: 0.8,
                threat: 0.9,
                immediate: 0.95
            }
        };
        
        console.log('[FORTRESS] ✅ Advanced detection systems ready');
    }

    // =================== DDOS PROTECTION ===================
    
    async validateRequest(req, res) {
        const clientInfo = await this.extractClientInfo(req);
        
        // 👑 BOSS Level 10000 bypass - IMMUNE TO ALL SECURITY CHECKS
        const userRole = req.session?.userRole || req.headers['x-user-role'];
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
            await this.applyAdvancedValidation(clientInfo);
        }
        
        return this.allowRequest(clientInfo);
    }
    
    async extractClientInfo(req) {
        const ip = this.getRealIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const fingerprint = await this.generateDeviceFingerprint(req);
        
        return {
            ip,
            userAgent,
            fingerprint,
            timestamp: Date.now(),
            headers: req.headers,
            sessionId: req.sessionID,
            geoLocation: { country: 'Unknown', region: 'Unknown' }, // Simplified geo location
            deviceTrustScore: await this.calculateDeviceTrustScore(fingerprint)
        };
    }
    
    async assessThreatLevel(clientInfo) {
        // 👑 BOSS protection - NEVER consider BOSS a threat
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
        if (this.detectCoordinatedAttack(clientInfo)) threatScore += 7;
        
        // Device trust score
        if (clientInfo.deviceTrustScore < this.DEVICE_TRUST_SCORE_MIN) threatScore += 3;
        
        // Browser automation detection
        if (this.detectAutomation(clientInfo.userAgent)) threatScore += 8;
        
        // Suspicious patterns (simplified check)
        if (this.checkSuspiciousPatterns(clientInfo)) threatScore += 5;
        
        return Math.min(threatScore, 10);
    }
    
    // Helper method for suspicious pattern detection
    checkSuspiciousPatterns(clientInfo) {
        const userAgent = clientInfo.userAgent || '';
        const suspiciousKeywords = ['bot', 'crawler', 'spider', 'scraper', 'hack', 'attack'];
        
        return suspiciousKeywords.some(keyword => 
            userAgent.toLowerCase().includes(keyword)
        );
    }
    }
    
    // =================== AUTO-CLICK DETECTION ===================
    
    detectAutoClick(ip) {
        const clickHistory = this.getClickHistory(ip);
        if (clickHistory.length < 5) return false;
        
        // Analyze click intervals
        const intervals = [];
        for (let i = 1; i < clickHistory.length; i++) {
            intervals.push(clickHistory[i] - clickHistory[i-1]);
        }
        
        // Detect too-consistent intervals (bot behavior)
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        
        // Human clicks have natural variance, bots are too consistent
        if (variance < 100 && avgInterval < this.AUTO_CLICK_DETECTION_THRESHOLD) {
            console.log(`[FORTRESS] 🤖 Auto-click detected from ${ip}: avg=${avgInterval}ms, variance=${variance}`);
            return true;
        }
        
        return false;
    }
    
    recordClick(ip) {
        if (!this.clickHistory) this.clickHistory = new Map();
        if (!this.clickHistory.has(ip)) this.clickHistory.set(ip, []);
        
        const history = this.clickHistory.get(ip);
        history.push(Date.now());
        
        // Keep only last 20 clicks
        if (history.length > 20) history.shift();
        
        this.clickHistory.set(ip, history);
    }
    
    getClickHistory(ip) {
        return this.clickHistory?.get(ip) || [];
    }
    
    // =================== COORDINATED ATTACK DETECTION ===================
    
    detectCoordinatedAttack(clientInfo) {
        const timeWindow = 60 * 1000; // 1 minute
        const now = Date.now();
        
        // Get all recent requests
        const recentRequests = Array.from(this.attackPatterns.entries())
            .filter(([_, data]) => now - data.lastSeen < timeWindow);
        
        if (recentRequests.length < 3) return false;
        
        // Check for similar patterns
        const patterns = recentRequests.map(([_, data]) => ({
            userAgent: data.userAgent,
            timing: data.requestTiming,
            frequency: data.requestCount
        }));
        
        // Detect synchronized timing (coordinated attack)
        const timings = patterns.map(p => p.timing);
        const timingVariance = this.calculateVariance(timings);
        
        if (timingVariance < 1000) { // Less than 1 second variance = coordinated
            console.log(`[FORTRESS] 💥 Coordinated attack detected: ${recentRequests.length} attackers`);
            return true;
        }
        
        return false;
    }
    
    // =================== DEVICE FINGERPRINTING ===================
    
    async generateDeviceFingerprint(req) {
        const components = [
            req.headers['user-agent'],
            req.headers['accept-language'],
            req.headers['accept-encoding'],
            req.headers['accept'],
            req.connection?.remoteAddress,
            req.headers['x-forwarded-for']
        ].filter(Boolean);
        
        const fingerprint = require('crypto')
            .createHash('sha256')
            .update(components.join('|'))
            .digest('hex');
            
        return fingerprint;
    }
    
    async calculateDeviceTrustScore(fingerprint) {
        if (!this.deviceFingerprints.has(fingerprint)) {
            // New device = low trust
            return 30;
        }
        
        const device = this.deviceFingerprints.get(fingerprint);
        let score = 50;
        
        // Increase trust over time
        const daysSinceSeen = (Date.now() - device.firstSeen) / (24 * 60 * 60 * 1000);
        score += Math.min(daysSinceSeen * 5, 30);
        
        // Increase trust with successful logins
        score += Math.min(device.successfulLogins * 2, 20);
        
        // Decrease trust with failed attempts
        score -= device.failedAttempts * 5;
        
        return Math.max(0, Math.min(100, score));
    }
    
    // =================== ADVANCED COUNTERMEASURES ===================
    
    async executeCountermeasures(clientInfo, level) {
        console.log(`[FORTRESS] ⚔️ Executing countermeasures level ${level} for ${clientInfo.ip}`);
        
        switch (level) {
            case 'HIGH_THREAT':
                await this.permanentBan(clientInfo.ip);
                await this.alertAdministrators(clientInfo, 'HIGH_THREAT_DETECTED');
                await this.activateDeepScan(clientInfo);
                break;
                
            case 'MEDIUM_THREAT':
                await this.temporaryBan(clientInfo.ip, this.BLACKLIST_DURATION.LEVEL_3);
                await this.increaseMonitoring(clientInfo.ip);
                break;
                
            case 'LOW_THREAT':
                await this.addToWatchlist(clientInfo.ip);
                await this.requireAdditionalValidation(clientInfo);
                break;
        }
    }
    
    async permanentBan(ip) {
        this.ipBlacklist.add(ip);
        console.log(`[FORTRESS] 🚫 PERMANENT BAN executed for ${ip}`);
        
        // Save to persistent storage
        await this.saveBanToDatabase(ip, 'PERMANENT', 'HIGH_THREAT_COORDINATED_ATTACK');
    }
    
    async activateDeepScan(clientInfo) {
        console.log(`[FORTRESS] 🔬 Deep scan activated for ${clientInfo.ip}`);
        
        // Analyze attack patterns
        const analysis = {
            timestamp: Date.now(),
            ip: clientInfo.ip,
            userAgent: clientInfo.userAgent,
            fingerprint: clientInfo.fingerprint,
            geoLocation: clientInfo.geoLocation,
            threatSignatures: await this.extractThreatSignatures(clientInfo)
        };
        
        // Share threat intelligence
        await this.shareThreatIntelligence(analysis);
    }
    
    // =================== BIOMETRIC VALIDATION ===================
    
    async validateBiometricPattern(userId, behaviorData) {
        if (!this.biometricHashes.has(userId)) {
            // First time user - create baseline
            await this.createBiometricBaseline(userId, behaviorData);
            return true;
        }
        
        const baseline = this.biometricHashes.get(userId);
        const similarity = this.calculateBehaviorSimilarity(baseline, behaviorData);
        
        if (similarity < 0.7) {
            console.log(`[FORTRESS] 🧬 Biometric mismatch for ${userId}: similarity=${similarity}`);
            return false;
        }
        
        return true;
    }
    
    async createBiometricBaseline(userId, behaviorData) {
        const baseline = {
            typingPattern: behaviorData.typingPattern,
            mouseMovement: behaviorData.mouseMovement,
            clickPattern: behaviorData.clickPattern,
            timestamp: Date.now()
        };
        
        this.biometricHashes.set(userId, baseline);
        console.log(`[FORTRESS] 🧬 Biometric baseline created for ${userId}`);
    }
    
    // =================== HONEYPOT SYSTEM ===================
    
    initializeHoneypots() {
        this.honeypots = [
            '/admin.php',
            '/wp-admin/',
            '/phpmyadmin/',
            '/config.php',
            '/.env',
            '/backup.sql',
            '/robots.txt'
        ];
        
        console.log('[FORTRESS] 🍯 Honeypots deployed');
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
    
    getRequestRate(ip) {
        if (!this.rateLimiters.has(ip)) {
            this.rateLimiters.set(ip, { count: 0, resetTime: Date.now() + 1000 });
            return 0;
        }
        
        const limiter = this.rateLimiters.get(ip);
        
        if (Date.now() > limiter.resetTime) {
            limiter.count = 1;
            limiter.resetTime = Date.now() + 1000;
            return 1;
        }
        
        limiter.count++;
        return limiter.count;
    }
    
    calculateVariance(numbers) {
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    }
    
    detectAutomation(userAgent) {
        const automationSignatures = [
            'headless', 'phantom', 'selenium', 'webdriver', 'playwright',
            'puppeteer', 'chrome-automation', 'bot', 'crawler', 'spider'
        ];
        
        return automationSignatures.some(sig => 
            userAgent.toLowerCase().includes(sig.toLowerCase())
        );
    }
    
    async isKnownVPN(ip) {
        // Simplified VPN detection - in production use VPN detection API
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
            this.cleanupExpiredData();
            this.analyzeGlobalThreatPatterns();
            this.updateThreatIntelligence();
        }, 30000); // Every 30 seconds
        
        console.log('[FORTRESS] 📡 Continuous monitoring started');
    }
    
    cleanupExpiredData() {
        const now = Date.now();
        const expiry = 60 * 60 * 1000; // 1 hour
        
        // Cleanup old attack patterns
        for (const [key, data] of this.attackPatterns.entries()) {
            if (now - data.lastSeen > expiry) {
                this.attackPatterns.delete(key);
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
        
        console.log(`[FORTRESS] 🚨 ADMIN ALERT: ${JSON.stringify(alert)}`);
        
        // In production: send email, SMS, push notifications
    }
    
    blockRequest(res, reason) {
        res.status(403).json({
            error: 'Access Denied',
            reason,
            timestamp: Date.now(),
            message: 'Hệ thống đã phát hiện hoạt động đáng ngờ. Truy cập bị từ chối.'
        });
        return false;
    }
    
    allowRequest(clientInfo) {
        this.updateClientHistory(clientInfo);
        return true;
    }
    
    updateClientHistory(clientInfo) {
        this.attackPatterns.set(clientInfo.ip, {
            userAgent: clientInfo.userAgent,
            lastSeen: Date.now(),
            requestCount: (this.attackPatterns.get(clientInfo.ip)?.requestCount || 0) + 1,
            requestTiming: Date.now()
        });
    }
    
    analyzeGlobalThreatPatterns() {
        try {
            const now = Date.now();
            const suspiciousIPs = new Set();
            
            // Analyze suspicious activities
            for (const [ip, activities] of this.suspiciousActivities.entries()) {
                if (activities.length > 15) { // High threat threshold
                    suspiciousIPs.add(ip);
                }
            }
            
            // Analyze attack patterns
            const attackPatterns = new Map();
            for (const [ip, attempts] of this.attackAttempts.entries()) {
                if (attempts.length > 10) {
                    attackPatterns.set(ip, attempts.length);
                }
            }
            
            // Log findings
            if (suspiciousIPs.size > 0) {
                console.log(`[FORTRESS] 🔍 Global threat analysis: ${suspiciousIPs.size} suspicious IPs detected`);
            }
            
            // Update global patterns
            this.globalThreatPatterns = {
                suspiciousIPs: Array.from(suspiciousIPs),
                attackPatterns: attackPatterns.size,
                lastAnalysis: now
            };
            
        } catch (error) {
            console.error('[FORTRESS] Error analyzing global threat patterns:', error.message);
        }
    }
    
    updateThreatIntelligence() {
        try {
            const now = Date.now();
            
            // Update threat intelligence database
            const threatData = {
                timestamp: now,
                totalThreats: this.suspiciousActivities.size,
                blockedIPs: this.blockedIPs.size,
                attackAttempts: this.attackAttempts.size,
                honeypotHits: this.honeypotLogs.size
            };
            
            // Store intelligence data
            this.lastThreatIntelligence = threatData;
            
            // Log update if significant activity
            if (threatData.totalThreats > 0) {
                console.log(`[FORTRESS] 📊 Threat intelligence updated: ${threatData.totalThreats} active threats`);
            }
            
        } catch (error) {
            console.error('[FORTRESS] Error updating threat intelligence:', error.message);
        }
    }
}

module.exports = UltimateFortressSecurity;
