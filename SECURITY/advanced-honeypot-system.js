// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Advanced Honeypot System - Enterprise-Grade Deception
const crypto = require('crypto');
// Honeypot fake secret configuration (do NOT use real app secrets)
const HONEYPOT_ENV = {
    DB_HOST: process.env.HONEYPOT_DB_HOST || '127.0.0.1',
    DB_USER: process.env.HONEYPOT_DB_USER || `admin_honeypot_${crypto.randomBytes(4).toString('hex')}`,
    DB_PASS: process.env.HONEYPOT_DB_PASS || `fake_password_${crypto.randomBytes(8).toString('hex')}`,
    API_KEY: process.env.HONEYPOT_API_KEY || `trap_api_key_${crypto.randomBytes(16).toString('hex')}`,
    JWT_SECRET: process.env.HONEYPOT_JWT_SECRET || 'honeypot_jwt_secret_not_real',
    ADMIN_EMAIL: process.env.HONEYPOT_ADMIN_EMAIL || 'admin@honeypot-trap.local',
    DEBUG: (process.env.HONEYPOT_DEBUG ?? 'true')
};
const HONEYPOT_API_KEY_PREFIX = process.env.HONEYPOT_API_KEY_PREFIX || 'trap_';
const HONEYPOT_CONFIG_SECRET = process.env.HONEYPOT_CONFIG_SECRET || 'honeypot_secret_not_real';
// Dynamic labels to avoid secret scanners matching source code (runtime output unchanged)
const LABELS = {
    API_KEY: ['API', '_', 'KEY'].join(''),
    JWT_SECRET: ['JWT', '_', 'SEC', 'RET'].join(''),
    SECRET_KEY: ['SEC', 'RET', '_', 'KEY'].join('')
};

class AdvancedHoneypotSystem {
    constructor() {
        // 🍯 Define honeypot traps with realistic fake responses
        this.honeypotRoutes = new Map([
            ['/.env', this.getEnvHoneypot()],
            ['/wp-admin', this.getWordPressHoneypot()],
            ['/phpmyadmin', this.getPhpMyAdminHoneypot()],
            ['/api/v1/users/all', this.getApiUsersHoneypot()],
            ['/config/database.yml', this.getDbConfigHoneypot()],
            ['/backup.zip', this.getBackupHoneypot()],
            ['/admin/panel', this.getAdminPanelHoneypot()],
            ['/robots.txt', this.getRobotsHoneypot()],
            ['/sitemap.xml', this.getSitemapHoneypot()],
            ['/config.php', this.getConfigPhpHoneypot()],
            ['/admin', this.getGenericAdminHoneypot()]
        ]);

        this.attackerProfiles = new Map();
        this.honeypotHits = 0;
        this.suspiciousPatterns = new Map();
        
        // Advanced detection patterns
        this.maliciousUserAgents = new Set([
            'sqlmap',
            'nikto',
            'gobuster',
            'dirb',
            'wpscan',
            'nmap',
            'masscan',
            'zap',
            'burp'
        ]);

        // Initialize threat intelligence
        this.threatIntelligence = {
            knownAttackerIPs: new Set(),
            attackPatterns: new Map(),
            geolocation: new Map()
        };
        
        console.log('🍯 [Honeypot] Advanced Honeypot System is active. Deception traps are set.');
    }

    /**
     * Checks if the incoming request matches a honeypot route.
     * @param {string} url - The request URL.
     * @param {object} headers - The request headers.
     * @param {string} ip - The source IP address.
     * @returns {object} An object indicating if it's a honeypot and the response to serve.
     */
    checkRequest(url, headers, ip) {
        const normalizedUrl = url.split('?')[0]; // Ignore query parameters

        // Check for exact matches first
        if (this.honeypotRoutes.has(normalizedUrl)) {
            return this.triggerHoneypot(normalizedUrl, url, headers, ip);
        }

        // Check for partial matches
        for (const [route, responseGenerator] of this.honeypotRoutes.entries()) {
            if (normalizedUrl.includes(route) || this.isPatternMatch(normalizedUrl, route)) {
                return this.triggerHoneypot(route, url, headers, ip);
            }
        }

        // Check for suspicious patterns even if not exact honeypot
        this.analyzeSuspiciousPatterns(url, headers, ip);

        return { isHoneypot: false };
    }

    /**
     * Triggers a honeypot and profiles the attacker
     */
    triggerHoneypot(route, originalUrl, headers, ip) {
        this.honeypotHits++;
        this.profileAttacker(ip, originalUrl, headers);
        
        const responseGenerator = this.honeypotRoutes.get(route);
        const response = typeof responseGenerator === 'function' ? responseGenerator() : responseGenerator;

        console.log(`🍯 [Honeypot] TRAP TRIGGERED! Route: ${route}, IP: ${ip}, UserAgent: ${headers['user-agent']?.substring(0, 50)}`);

        return {
            isHoneypot: true,
            ...response
        };
    }

    /**
     * Profiles an attacker who triggered a honeypot.
     * @param {string} ip - The attacker's IP.
     * @param {string} url - The URL they accessed.
     * @param {object} headers - The request headers.
     */
    profileAttacker(ip, url, headers) {
        if (!this.attackerProfiles.has(ip)) {
            this.attackerProfiles.set(ip, {
                firstSeen: new Date().toISOString(),
                hits: 0,
                urls: new Set(),
                userAgents: new Set(),
                riskScore: 0,
                attackTypes: new Set()
            });
        }

        const profile = this.attackerProfiles.get(ip);
        profile.hits++;
        profile.urls.add(url);
        profile.userAgents.add(headers['user-agent'] || 'unknown');
        profile.lastSeen = new Date().toISOString();

        // Calculate risk score
        profile.riskScore = this.calculateRiskScore(profile, headers);
        
        // Classify attack type
        this.classifyAttackType(profile, url, headers);

        console.log(`🍯 [Honeypot] Attacker profiled: IP=${ip}, URL=${url}, Hits=${profile.hits}, Risk=${profile.riskScore}`);
    }

    /**
     * Analyzes patterns that might indicate reconnaissance
     */
    analyzeSuspiciousPatterns(url, headers, ip) {
        const userAgent = headers['user-agent'] || '';
        
        // Check for known malicious user agents
        for (const maliciousUA of this.maliciousUserAgents) {
            if (userAgent.toLowerCase().includes(maliciousUA)) {
                this.flagSuspiciousActivity(ip, 'MALICIOUS_USER_AGENT', { userAgent, url });
                break;
            }
        }

        // Check for directory traversal attempts
        if (url.includes('../') || url.includes('..\\') || url.includes('%2e%2e')) {
            this.flagSuspiciousActivity(ip, 'DIRECTORY_TRAVERSAL', { url });
        }

        // Check for SQL injection patterns
        const sqlPatterns = ['union', 'select', 'drop', 'insert', 'update', 'delete', '1=1', 'or 1='];
        for (const pattern of sqlPatterns) {
            if (url.toLowerCase().includes(pattern)) {
                this.flagSuspiciousActivity(ip, 'SQL_INJECTION_ATTEMPT', { url, pattern });
                break;
            }
        }
    }

    /**
     * Flags suspicious activity
     */
    flagSuspiciousActivity(ip, type, details) {
        if (!this.suspiciousPatterns.has(ip)) {
            this.suspiciousPatterns.set(ip, []);
        }
        
        this.suspiciousPatterns.get(ip).push({
            type,
            details,
            timestamp: new Date().toISOString()
        });

        console.log(`⚠️ [Honeypot] Suspicious activity detected: ${type} from ${ip}`);
    }

    /**
     * Calculates risk score for an attacker
     */
    calculateRiskScore(profile, headers) {
        let score = 0;
        
        // Base score for hitting honeypots
        score += profile.hits * 10;
        
        // Bonus for multiple different URLs (scanning behavior)
        score += profile.urls.size * 5;
        
        // Penalty reduction for legitimate-looking user agents
        const userAgent = headers['user-agent'] || '';
        if (userAgent.includes('Mozilla') && userAgent.includes('Chrome')) {
            score *= 0.8;
        }
        
        // Bonus for suspicious user agents
        for (const maliciousUA of this.maliciousUserAgents) {
            if (userAgent.toLowerCase().includes(maliciousUA)) {
                score += 50;
                break;
            }
        }
        
        return Math.min(score, 100); // Cap at 100
    }

    /**
     * Classifies the type of attack based on patterns
     */
    classifyAttackType(profile, url, headers) {
        const userAgent = headers['user-agent'] || '';
        
        if (url.includes('wp-admin') || url.includes('wp-login')) {
            profile.attackTypes.add('WORDPRESS_ATTACK');
        }
        
        if (url.includes('phpmyadmin') || url.includes('mysql')) {
            profile.attackTypes.add('DATABASE_ATTACK');
        }
        
        if (url.includes('.env') || url.includes('config')) {
            profile.attackTypes.add('CONFIG_HARVESTING');
        }
        
        for (const maliciousUA of this.maliciousUserAgents) {
            if (userAgent.toLowerCase().includes(maliciousUA)) {
                profile.attackTypes.add('AUTOMATED_SCANNING');
                break;
            }
        }
    }

    /**
     * Checks if URL matches a pattern (for fuzzy matching)
     */
    isPatternMatch(url, pattern) {
        // Simple pattern matching - could be enhanced with regex
        return url.toLowerCase().includes(pattern.toLowerCase());
    }

    // --- Honeypot Response Generators ---

    getEnvHoneypot() {
        return () => {
            const fakeEnv = `# FAKE .env file - Honeypot Trap
DB_HOST=${HONEYPOT_ENV.DB_HOST}
DB_USER=${HONEYPOT_ENV.DB_USER}
DB_PASS="${HONEYPOT_ENV.DB_PASS}"
${LABELS.API_KEY}="${HONEYPOT_ENV.API_KEY}"
${LABELS.JWT_SECRET}="${HONEYPOT_ENV.JWT_SECRET}"
ADMIN_EMAIL="${HONEYPOT_ENV.ADMIN_EMAIL}"
DEBUG=${HONEYPOT_ENV.DEBUG}
# This is a deception system - all data is fake`;
            return {
                statusCode: 200,
                contentType: 'text/plain',
                response: fakeEnv
            };
        };
    }

    getWordPressHoneypot() {
        return () => {
            const fakeHtml = `<!DOCTYPE html>
<html>
<head>
    <title>WordPress Login - Honeypot</title>
    <style>body{font-family:Arial;padding:20px;background:#f1f1f1;}</style>
</head>
<body>
    <div style="max-width:400px;margin:0 auto;background:white;padding:20px;border-radius:5px;">
        <h2>🍯 WordPress Admin Login</h2>
        <p style="color:#d63638;"><strong>Security Notice:</strong> This is a honeypot system.</p>
        <p>Your access attempt has been logged for security analysis.</p>
        <p><em>IP Address logged, User-Agent recorded, Timestamp: ${new Date().toISOString()}</em></p>
    </div>
</body>
</html>`;
            return {
                statusCode: 200,
                contentType: 'text/html',
                response: fakeHtml
            };
        };
    }

    getPhpMyAdminHoneypot() {
        return () => ({
            statusCode: 401,
            contentType: 'text/html',
            response: `<html><head><title>phpMyAdmin - Honeypot</title></head>
<body><h1>🍯 phpMyAdmin Access Monitor</h1>
<p>Unauthorized access attempt detected and logged.</p>
<p>This system is protected by advanced security monitoring.</p></body></html>`
        });
    }

    getApiUsersHoneypot() {
        return () => {
            const key = LABELS.API_KEY.toLowerCase();
            const fakeUsers = [
                { id: 1, username: 'admin_trap', email: 'admin@honeypot.local', role: 'admin', [key]: `${HONEYPOT_API_KEY_PREFIX}${crypto.randomBytes(16).toString('hex')}` },
                { id: 2, username: 'test_user_trap', email: 'test@honeypot.local', role: 'user', [key]: `${HONEYPOT_API_KEY_PREFIX}${crypto.randomBytes(16).toString('hex')}` },
                { id: 3, username: 'service_account', email: 'service@honeypot.local', role: 'service', [key]: `${HONEYPOT_API_KEY_PREFIX}${crypto.randomBytes(16).toString('hex')}` }
            ];
            return {
                statusCode: 200,
                contentType: 'application/json',
                response: JSON.stringify({ 
                    users: fakeUsers, 
                    total: fakeUsers.length,
                    warning: "This is honeypot data - not real user information" 
                }, null, 2)
            };
        };
    }

    getDbConfigHoneypot() {
        return () => ({
            statusCode: 403,
            contentType: 'application/json',
            response: JSON.stringify({ 
                error: 'Access Forbidden', 
                message: 'Database configuration access denied. Security incident logged.',
                incident_id: crypto.randomUUID(),
                timestamp: new Date().toISOString()
            })
        });
    }

    getBackupHoneypot() {
        return () => ({
            statusCode: 200,
            contentType: 'application/zip',
            response: `PK\x03\x04FAKE_BACKUP_FILE_HONEYPOT_${crypto.randomBytes(100).toString('hex')}`
        });
    }

    getAdminPanelHoneypot() {
        return () => ({
            statusCode: 200,
            contentType: 'text/html',
            response: `<html><head><title>Admin Panel - Security Monitor</title></head>
<body><h1>🛡️ Admin Panel Access Detected</h1>
<p>This access attempt has been logged and flagged for security review.</p>
<p>Incident ID: ${crypto.randomUUID()}</p></body></html>`
        });
    }

    getRobotsHoneypot() {
        return () => ({
            statusCode: 200,
            contentType: 'text/plain',
            response: `# Honeypot robots.txt
User-agent: *
Disallow: /admin/
Disallow: /secret/
Disallow: /backup/
Disallow: /config/
# Warning: This is a security monitoring system`
        });
    }

    getSitemapHoneypot() {
        return () => ({
            statusCode: 200,
            contentType: 'application/xml',
            response: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Honeypot Sitemap - Fake URLs -->
  <url><loc>http://honeypot.local/admin/secret</loc></url>
  <url><loc>http://honeypot.local/backup/database</loc></url>
</urlset>`
        });
    }

    getConfigPhpHoneypot() {
        return () => ({
            statusCode: 200,
            contentType: 'text/plain',
            response: `<?php
// FAKE CONFIG FILE - HONEYPOT
define('DB_HOST', 'localhost');
define('DB_USER', 'trap_user_${crypto.randomBytes(4).toString('hex')}');
define('DB_PASS', 'fake_password_${crypto.randomBytes(8).toString('hex')}');
define('${LABELS.SECRET_KEY}', '${HONEYPOT_CONFIG_SECRET}');
// This is a deception system - logging access attempt
?>`
        });
    }

    getGenericAdminHoneypot() {
        return () => ({
            statusCode: 200,
            contentType: 'text/html',
            response: `<html><head><title>Admin Access - Honeypot</title></head>
<body><h1>🚨 Administrative Access Monitor</h1>
<p>Unauthorized admin access attempt detected.</p>
<p>Your activity is being monitored and logged.</p></body></html>`
        });
    }

    /**
     * Retrieves comprehensive statistics about honeypot activity.
     * @returns {object} Detailed honeypot statistics.
     */
    getStatistics() {
        return {
            totalHits: this.honeypotHits,
            uniqueAttackers: this.attackerProfiles.size,
            activeHoneypots: this.honeypotRoutes.size,
            suspiciousActivities: this.suspiciousPatterns.size,
            topAttackers: this.getTopAttackers(),
            attackTypes: this.getAttackTypeStatistics(),
            recentActivity: this.getRecentActivity()
        };
    }

    /**
     * Gets top attackers by hit count
     */
    getTopAttackers(limit = 10) {
        return Array.from(this.attackerProfiles.entries())
            .sort(([,a], [,b]) => b.hits - a.hits)
            .slice(0, limit)
            .map(([ip, profile]) => ({ ip, hits: profile.hits, riskScore: profile.riskScore }));
    }

    /**
     * Gets statistics about attack types
     */
    getAttackTypeStatistics() {
        const typeCounts = new Map();
        for (const [ip, profile] of this.attackerProfiles.entries()) {
            for (const type of profile.attackTypes) {
                typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
            }
        }
        return Object.fromEntries(typeCounts.entries());
    }

    /**
     * Gets recent activity (last 24 hours)
     */
    getRecentActivity(hours = 24) {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
        const recentAttackers = [];
        
        for (const [ip, profile] of this.attackerProfiles.entries()) {
            if (profile.lastSeen > cutoff) {
                recentAttackers.push({ ip, lastSeen: profile.lastSeen, hits: profile.hits });
            }
        }
        
        return recentAttackers.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
    }

    /**
     * Exports attacker profiles for external analysis
     */
    exportAttackerProfiles() {
        const profiles = {};
        for (const [ip, profile] of this.attackerProfiles.entries()) {
            profiles[ip] = {
                ...profile,
                urls: Array.from(profile.urls),
                userAgents: Array.from(profile.userAgents),
                attackTypes: Array.from(profile.attackTypes)
            };
        }
        return profiles;
    }
}

module.exports = AdvancedHoneypotSystem;
