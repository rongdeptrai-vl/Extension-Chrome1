// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Internal Threat Detector - Enterprise Insider Threat Protection
const crypto = require('crypto');

class InternalThreatDetector {
    constructor() {
        // Store for active sessions and their associated fingerprints
        this.activeSessions = new Map(); // key: sessionId, value: { ip, userAgent, fingerprint, userId, lastSeen }

        // Store for IP-based activity patterns
        this.ipProfiles = new Map(); // key: ip, value: { sessionIds: Set, fingerprints: Set, userIds: Set }

        // Store for user-based behavioral patterns
        this.userProfiles = new Map(); // key: userId, value: { lastIp, lastFingerprint, commonEndpoints: Set, lastUpdate: timestamp }

        // Advanced behavioral analytics
        this.behavioralProfiles = new Map(); // key: userId, value: { loginTimes, commonLocations, typingPatterns }

        // Time-based attack detection
        this.timeWindowAttacks = new Map(); // key: ip, value: { attempts: [], lastCleanup: timestamp }

        // Session management
        this.sessionTimeouts = new Map(); // key: sessionId, value: timeoutTimestamp
        this.maxConcurrentSessions = 3;

        // Risk scoring
        this.riskScores = new Map(); // key: userId, value: currentRiskScore

        // List of suspicious process names (can be expanded)
        this.suspiciousProcesses = new Set([
            'cheatengine', 'ollydbg', 'idaq', 'wireshark', 'fiddler', 'charles'
        ]);

        // Advanced process monitoring
        this.processWhitelist = new Set(['chrome', 'firefox', 'edge', 'safari', 'code', 'notepad']);
        this.processBlacklist = new Set(['metasploit', 'burp', 'sqlmap', 'nmap', 'hydra', 'aircrack']);

        // Network anomaly detection
        this.networkProfiles = new Map(); // key: ip, value: { bandwidth, requestTypes, timing }

        console.log('🕵️ [Internal Threat] Enterprise Detector initialized with advanced behavioral analytics.');
        console.log('🛡️ [Internal Threat] Monitoring: Sessions, Behavioral Patterns, Risk Scoring, Time-based Attacks');
    }

    /**
     * Validates an internal request against known patterns and profiles.
     * This is the main entry point for the module.
     * @param {object} req - The HTTP request object.
     * @param {object} deviceInfo - Decoded device information from the client.
     * @returns {Promise<object>} An object indicating if a threat was found.
     */
    async validateInternalRequest(req, deviceInfo) {
        const ip = this.getRealIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const { sessionId, userId, fingerprint, runningProcesses } = deviceInfo;

        if (!sessionId || !userId || !fingerprint) {
            return { threat: 'INCOMPLETE_DEVICE_INFO', details: 'Missing session, user, or fingerprint data.' };
        }

        // Enhanced validation with new checks
        const timeoutCheck = this.checkSessionTimeout(sessionId);
        if (timeoutCheck.threat) return timeoutCheck;

        const concurrentCheck = this.checkConcurrentSessions(userId, sessionId);
        if (concurrentCheck.threat) return concurrentCheck;

        const sessionCheck = this.checkSessionHijacking(sessionId, ip, userAgent);
        if (sessionCheck.threat) {
            this.calculateRiskScore(userId, sessionCheck.threat);
            return sessionCheck;
        }

        const hardwareCheck = this.checkHardwareSpoofing(userId, fingerprint);
        if (hardwareCheck.threat) {
            this.calculateRiskScore(userId, hardwareCheck.threat);
            return hardwareCheck;
        }

        const instanceCheck = this.checkMultipleInstances(ip, sessionId, fingerprint, userId);
        if (instanceCheck.threat) {
            this.calculateRiskScore(userId, instanceCheck.threat);
            return instanceCheck;
        }

        const processCheck = this.checkAdvancedProcesses(runningProcesses);
        if (processCheck.threat) {
            this.calculateRiskScore(userId, processCheck.threat);
            return processCheck;
        }

        const timeAttackCheck = this.checkTimeBasedAttacks(ip, req.method);
        if (timeAttackCheck.threat) {
            this.calculateRiskScore(userId, timeAttackCheck.threat);
            return timeAttackCheck;
        }

        const behaviorCheck = this.checkBehavioralAnomalies(userId, { ip, userAgent });
        if (behaviorCheck.threat) {
            this.calculateRiskScore(userId, behaviorCheck.threat);
            return behaviorCheck;
        }

        // Update profiles and calculate risk score
        this.updateProfiles(ip, sessionId, fingerprint, userId, userAgent);
        const riskScore = this.calculateRiskScore(userId);

        // Return risk assessment even if no immediate threat
        return { 
            threat: null, 
            riskScore,
            riskLevel: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW'
        };
    }

    /**
     * Checks for signs of session hijacking by comparing current request info with stored session data.
     */
    checkSessionHijacking(sessionId, currentIp, currentUserAgent) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            // Allow for minor User-Agent changes, but flag major ones.
            const userAgentMismatch = session.userAgent.substring(0, 50) !== currentUserAgent.substring(0, 50);
            
            // IP mismatch is a strong indicator of hijacking.
            if (session.ip !== currentIp || userAgentMismatch) {
                return {
                    threat: 'SESSION_HIJACKING_OR_CLONING',
                    details: `Session token used from a new location. Original IP: ${session.ip}, New IP: ${currentIp}.`
                };
            }
        }
        return { threat: null };
    }

    /**
     * Checks for hardware spoofing by comparing the current fingerprint with the user's known fingerprint.
     */
    checkHardwareSpoofing(userId, currentFingerprint) {
        const profile = this.userProfiles.get(userId);
        if (profile && profile.lastFingerprint && profile.lastFingerprint !== currentFingerprint) {
            return {
                threat: 'HARDWARE_SPOOFING',
                details: `Device fingerprint changed for user ${userId} without a new login.`
            };
        }
        return { threat: null };
    }

    /**
     * Detects if a single IP is using an unusual number of different sessions or devices.
     */
    checkMultipleInstances(ip, sessionId, fingerprint, userId) {
        const profile = this.ipProfiles.get(ip);
        if (profile) {
            const newSession = !profile.sessionIds.has(sessionId);
            const newFingerprint = !profile.fingerprints.has(fingerprint);

            // If an IP has more than 5 unique fingerprints or 10 unique sessions, it's suspicious.
            if ((newFingerprint && profile.fingerprints.size > 5) || (newSession && profile.sessionIds.size > 10)) {
                return {
                    threat: 'MULTIPLE_BROWSER_INSTANCES',
                    details: `Suspiciously high number of unique sessions/devices from IP ${ip}.`
                };
            }
        }
        return { threat: null };
    }

    /**
     * Advanced process monitoring with whitelist/blacklist
     */
    checkAdvancedProcesses(processes = []) {
        if (!Array.isArray(processes)) return { threat: null };
        
        const suspiciousProcesses = [];
        const whitelistedProcesses = [];
        const blacklistedProcesses = [];
        
        for (const processName of processes) {
            const cleanProcess = processName.toLowerCase().replace(/\.(exe|app|dmg)$/i, '');
            
            if (this.processBlacklist.has(cleanProcess)) {
                blacklistedProcesses.push(processName);
            } else if (this.processWhitelist.has(cleanProcess)) {
                whitelistedProcesses.push(processName);
            } else if (this.suspiciousProcesses.has(cleanProcess)) {
                suspiciousProcesses.push(processName);
            }
        }
        
        // Critical threat: Blacklisted processes
        if (blacklistedProcesses.length > 0) {
            return {
                threat: 'BLACKLISTED_PROCESSES',
                severity: 'CRITICAL',
                details: `Detected blacklisted security tools: ${blacklistedProcesses.join(', ')}`
            };
        }
        
        // High threat: Multiple suspicious processes
        if (suspiciousProcesses.length > 2) {
            return {
                threat: 'MULTIPLE_SUSPICIOUS_PROCESSES',
                severity: 'HIGH',
                details: `Multiple suspicious tools detected: ${suspiciousProcesses.join(', ')}`
            };
        }
        
        // Medium threat: Single suspicious process
        if (suspiciousProcesses.length > 0) {
            return {
                threat: 'SUSPICIOUS_PROCESSES',
                severity: 'MEDIUM',
                details: `Detected suspicious process: ${suspiciousProcesses.join(', ')}`
            };
        }
        
        return { threat: null };
    }

    /**
     * Legacy method for backward compatibility
     */
    checkSuspiciousProcesses(processes = []) {
        return this.checkAdvancedProcesses(processes);
    }

    /**
     * Updates the internal profiles with the latest activity data.
     */
    updateProfiles(ip, sessionId, fingerprint, userId, userAgent) {
        const now = Date.now();

        // Update session profile
        this.activeSessions.set(sessionId, { ip, userAgent, fingerprint, userId, lastSeen: now });

        // Update IP profile
        if (!this.ipProfiles.has(ip)) {
            this.ipProfiles.set(ip, { sessionIds: new Set(), fingerprints: new Set(), userIds: new Set() });
        }
        const ipProfile = this.ipProfiles.get(ip);
        ipProfile.sessionIds.add(sessionId);
        ipProfile.fingerprints.add(fingerprint);
        ipProfile.userIds.add(userId);

        // Update user profile
        if (!this.userProfiles.has(userId)) {
            this.userProfiles.set(userId, { 
                lastIp: ip, 
                lastFingerprint: fingerprint, 
                commonEndpoints: new Set(),
                lastUpdate: now
            });
        } else {
            const userProfile = this.userProfiles.get(userId);
            userProfile.lastIp = ip;
            userProfile.lastFingerprint = fingerprint;
            userProfile.lastUpdate = now;
        }
    }

    /**
     * Utility to get the real IP address from a request.
     */
    getRealIP(req) {
        return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
               req.headers['x-real-ip'] ||
               req.connection?.remoteAddress ||
               '127.0.0.1';
    }

    /**
     * Session timeout and cleanup management
     */
    checkSessionTimeout(sessionId) {
        const timeout = this.sessionTimeouts.get(sessionId);
        const now = Date.now();
        
        if (timeout && now > timeout) {
            // Session expired
            this.cleanupExpiredSession(sessionId);
            return {
                threat: 'SESSION_EXPIRED',
                details: `Session ${sessionId} has expired and been cleaned up`
            };
        }
        
        // Update session timeout (30 minutes from now)
        this.sessionTimeouts.set(sessionId, now + 1800000);
        return { threat: null };
    }

    /**
     * Check concurrent session limits per user
     */
    checkConcurrentSessions(userId, sessionId) {
        let userSessions = 0;
        for (const [id, session] of this.activeSessions) {
            if (session.userId === userId) {
                userSessions++;
            }
        }
        
        if (userSessions > this.maxConcurrentSessions) {
            return {
                threat: 'EXCESSIVE_CONCURRENT_SESSIONS',
                details: `User ${userId} has ${userSessions} concurrent sessions (limit: ${this.maxConcurrentSessions})`
            };
        }
        
        return { threat: null };
    }

    /**
     * Advanced behavioral analysis based on user patterns
     */
    checkBehavioralAnomalies(userId, currentActivity) {
        const profile = this.behavioralProfiles.get(userId);
        if (!profile) {
            // Create new behavioral profile
            this.behavioralProfiles.set(userId, {
                loginTimes: [new Date().getHours()],
                commonLocations: new Set(),
                typingPatterns: [],
                lastActivity: Date.now()
            });
            return { threat: null };
        }

        // Check for unusual login time
        const currentHour = new Date().getHours();
        const usualHours = profile.loginTimes;
        const isUnusualTime = !usualHours.some(hour => Math.abs(hour - currentHour) <= 2);
        
        if (isUnusualTime && usualHours.length > 5) {
            return {
                threat: 'UNUSUAL_ACCESS_TIME',
                details: `User ${userId} accessing at unusual time: ${currentHour}:00. Normal times: ${usualHours.join(',')}`
            };
        }

        // Update profile
        if (!usualHours.includes(currentHour)) {
            profile.loginTimes.push(currentHour);
            // Keep only last 20 login times
            if (profile.loginTimes.length > 20) {
                profile.loginTimes.shift();
            }
        }

        return { threat: null };
    }

    /**
     * Detects time-based attacks (rapid requests, timing attacks)
     */
    checkTimeBasedAttacks(ip, requestType) {
        const now = Date.now();
        const timeWindow = 300000; // 5 minutes
        
        if (!this.timeWindowAttacks.has(ip)) {
            this.timeWindowAttacks.set(ip, { attempts: [], lastCleanup: now });
        }
        
        const profile = this.timeWindowAttacks.get(ip);
        
        // Clean old attempts
        profile.attempts = profile.attempts.filter(attempt => 
            now - attempt.timestamp < timeWindow
        );
        
        // Add current attempt
        profile.attempts.push({ timestamp: now, type: requestType });
        
        // Check for rapid fire attacks
        if (profile.attempts.length > 50) { // More than 50 requests in 5 minutes
            return {
                threat: 'RAPID_FIRE_ATTACK',
                details: `IP ${ip} made ${profile.attempts.length} requests in ${timeWindow/1000} seconds`
            };
        }
        
        // Check for timing attack patterns
        const intervals = [];
        for (let i = 1; i < profile.attempts.length; i++) {
            intervals.push(profile.attempts[i].timestamp - profile.attempts[i-1].timestamp);
        }
        
        if (intervals.length > 10) {
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((sum, interval) => 
                sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
            
            // Very consistent timing might indicate automated attack
            if (variance < 100 && avgInterval < 1000) { // Less than 100ms variance, less than 1s intervals
                return {
                    threat: 'TIMING_ATTACK_PATTERN',
                    details: `Detected automated timing pattern from ${ip}. Avg interval: ${avgInterval}ms`
                };
            }
        }
        
        return { threat: null };
    }

    /**
     * Calculate and update risk score for user
     */
    calculateRiskScore(userId, threatType = null) {
        let currentScore = this.riskScores.get(userId) || 0;
        
        // Increment risk based on threat type
        if (threatType) {
            const riskIncrements = {
                'SESSION_HIJACKING_OR_CLONING': 50,
                'HARDWARE_SPOOFING': 40,
                'BLACKLISTED_PROCESSES': 80,
                'MULTIPLE_SUSPICIOUS_PROCESSES': 60,
                'SUSPICIOUS_PROCESSES': 30,
                'RAPID_FIRE_ATTACK': 45,
                'TIMING_ATTACK_PATTERN': 35,
                'UNUSUAL_ACCESS_TIME': 20,
                'EXCESSIVE_CONCURRENT_SESSIONS': 25
            };
            
            currentScore += riskIncrements[threatType] || 10;
        }
        
        // Decay risk score over time (reduce by 1 point per hour)
        const lastUpdate = this.userProfiles.get(userId)?.lastUpdate || Date.now();
        const hoursPassed = (Date.now() - lastUpdate) / 3600000;
        currentScore = Math.max(0, currentScore - Math.floor(hoursPassed));
        
        this.riskScores.set(userId, currentScore);
        
        // Update last update time
        if (this.userProfiles.has(userId)) {
            this.userProfiles.get(userId).lastUpdate = Date.now();
        }
        
        return currentScore;
    }

    /**
     * Cleanup expired sessions
     */
    cleanupExpiredSession(sessionId) {
        this.activeSessions.delete(sessionId);
        this.sessionTimeouts.delete(sessionId);
        
        // Clean IP profiles
        for (const [ip, profile] of this.ipProfiles) {
            profile.sessionIds.delete(sessionId);
            if (profile.sessionIds.size === 0) {
                this.ipProfiles.delete(ip);
            }
        }
    }

    /**
     * Retrieves statistics about internal threat detection.
     * @returns {object} Threat statistics.
     */
    getStatistics() {
        return {
            activeSessions: this.activeSessions.size,
            monitoredIPs: this.ipProfiles.size,
            monitoredUsers: this.userProfiles.size
        };
    }

    /**
     * Enhanced statistics with risk assessment
     */
    getEnhancedStatistics() {
        const basicStats = this.getStatistics();
        
        // Calculate average risk score
        const riskScores = Array.from(this.riskScores.values());
        const avgRiskScore = riskScores.length > 0 ? 
            riskScores.reduce((a, b) => a + b, 0) / riskScores.length : 0;
        
        // Count high-risk users (score > 50)
        const highRiskUsers = riskScores.filter(score => score > 50).length;
        
        return {
            ...basicStats,
            behavioralProfiles: this.behavioralProfiles.size,
            averageRiskScore: Math.round(avgRiskScore),
            highRiskUsers,
            activeTimeWindows: this.timeWindowAttacks.size,
            expiredSessions: 0 // Could track this separately
        };
    }
}

module.exports = InternalThreatDetector;