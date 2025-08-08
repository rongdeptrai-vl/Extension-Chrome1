// FAKE BACKEND + HONEYPOTS - Advanced Deception System
// Tạo API giả để bẫy và theo dõi attackers

class AdvancedHoneypotSystem {
    constructor() {
        this.attackerLogs = new Map();
        this.fakeAPIs = new Map();
        this.decoyData = this.generateDecoyData();
        this.toolkitSignatures = new Map();
        this.ipBlacklist = new Set();
        this.init();
    }
    
    init() {
        console.log('🍯 [HONEYPOT] Advanced deception system activated');
        this.setupFakeAPIs();
        this.setupAttackerProfiling();
        this.startBehaviorAnalysis();
    }
    
    generateDecoyData() {
        return {
            fakeUsers: [
                { id: 999, username: 'admin_backup', password: 'backup123', role: 'admin' },
                { id: 998, username: 'test_user', password: 'test123', role: 'user' },
                { id: 997, username: 'developer', password: 'dev123', role: 'developer' }
            ],
            // SECURITY NOTE: These are FAKE tokens for honeypot purposes only - NOT real API keys
            fakeTokens: [
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                'Bearer abcd1234567890', // FAKE Bearer token for honeypot
                'sk-1234567890abcdef'     // FAKE API key for honeypot
            ],
            fakeFiles: [
                'backup.sql', 'config.env', 'users.csv', 'logs.txt', '.env'
            ],
            fakeAPIs: [
                '/api/users', '/api/admin', '/api/config', '/api/backup'
            ]
        };
    }
    
    // =================== FAKE API ENDPOINTS ===================
    
    setupFakeAPIs() {
        // Internal admin API (fake)
        this.fakeAPIs.set('/internal/admin', {
            method: 'GET',
            response: this.generateFakeAdminData(),
            logLevel: 'CRITICAL',
            trapType: 'ADMIN_ACCESS_ATTEMPT'
        });
        
        // Config endpoints (fake)
        this.fakeAPIs.set('/api/config/database', {
            method: 'GET',
            response: this.generateFakeDatabaseConfig(),
            logLevel: 'HIGH',
            trapType: 'DATABASE_CONFIG_ACCESS'
        });
        
        // User data endpoint (fake)
        this.fakeAPIs.set('/api/users/dump', {
            method: 'GET',
            response: this.generateFakeUserDump(),
            logLevel: 'CRITICAL',
            trapType: 'USER_DATA_ACCESS'
        });
        
        // Backup endpoints (fake)
        this.fakeAPIs.set('/backup/admin.sql', {
            method: 'GET',
            response: this.generateFakeSQLDump(),
            logLevel: 'CRITICAL',
            trapType: 'BACKUP_ACCESS_ATTEMPT'
        });
        
        // Debug endpoints (fake)
        this.fakeAPIs.set('/debug/phpinfo', {
            method: 'GET',
            response: this.generateFakePHPInfo(),
            logLevel: 'MEDIUM',
            trapType: 'DEBUG_INFO_ACCESS'
        });
        
        // Secret keys (fake)
        this.fakeAPIs.set('/.env', {
            method: 'GET',
            response: this.generateFakeEnvFile(),
            logLevel: 'HIGH',
            trapType: 'ENV_FILE_ACCESS'
        });
        
        console.log(`🍯 [HONEYPOT] ${this.fakeAPIs.size} fake APIs deployed`);
    }
    
    generateFakeAdminData() {
        return {
            "success": true,
            "admin_panel": {
                "version": "3.2.1",
                "secret_key": "fake_key_12345_trap",
                "database_host": "192.168.1.100",
                "database_user": "admin_fake",
                "database_pass": "trapped_password_2024",
                "admin_accounts": [
                    {
                        "username": "admin",
                        "password_hash": "$2b$10$fakehashdecoydata123456789",
                        "role": "super_admin",
                        "last_login": "2024-07-26T10:00:00Z"
                    },
                    {
                        "username": "root",
                        "password_hash": "$2b$10$anotherfakehashfordecoy987",
                        "role": "system_admin",
                        "last_login": "2024-07-25T15:30:00Z"
                    }
                ],
                "backup_codes": [
                    "FAKE001-TRAP002-DECOY003",
                    "HONEY004-POT005-BAIT006"
                ]
            },
            "warning": "This is a honeypot. Your access has been logged."
        };
    }
    
    generateFakeDatabaseConfig() {
        return `# Database Configuration (FAKE - HONEYPOT)
DB_HOST=192.168.1.100
DB_PORT=6904
DB_NAME=company_db_fake
DB_USER=db_admin_trap
DB_PASS=honeypot_password_123
DB_CHARSET=utf8mb4

# Redis Configuration
REDIS_HOST=192.168.1.101
REDIS_PORT=6905
REDIS_PASS=redis_fake_pass

# Admin Panel
ADMIN_SECRET=fake_admin_secret_key_trap
JWT_SECRET=jwt_honeypot_secret_2024

# WARNING: This is a honeypot system
# Your access attempt has been logged and reported`;
    }
    
    generateFakeUserDump() {
        return {
            "users": [
                {
                    "id": 1,
                    "username": "john_doe_fake",
                    "email": "fake.user@honeypot.com",
                    "password_hash": "$2b$10$fakeuser1hashfordecoy123",
                    "role": "user",
                    "created_at": "2024-01-15T08:00:00Z"
                },
                {
                    "id": 2,
                    "username": "admin_trap",
                    "email": "admin.trap@honeypot.com",
                    "password_hash": "$2b$10$fakeadminhashfordecoy456",
                    "role": "admin",
                    "created_at": "2024-01-01T00:00:00Z"
                }
            ],
            "total_count": 2,
            "export_date": new Date().toISOString(),
            "honeypot_warning": "This data is fabricated for security monitoring"
        };
    }
    
    generateFakeSQLDump() {
        return `-- MySQL dump for honeypot detection
-- Host: 192.168.1.100    Database: fake_company_db
-- ------------------------------------------------------

CREATE TABLE \`fake_users\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`username\` varchar(50) NOT NULL,
  \`password\` varchar(255) NOT NULL,
  \`email\` varchar(100) NOT NULL,
  PRIMARY KEY (\`id\`)
);

INSERT INTO \`fake_users\` VALUES 
(1,'admin_fake','fake_password_hash_123','admin@honeypot.com'),
(2,'user_fake','fake_user_hash_456','user@honeypot.com');

-- HONEYPOT WARNING: This is fake data for attacker detection
-- Your access has been logged with IP, User-Agent, and timestamp`;
    }
    
    generateFakePHPInfo() {
        return `<?php
// FAKE PHP Info - Honeypot Trap
phpinfo();

// Fake sensitive information
$config = array(
    'db_host' => '192.168.1.100',
    'db_user' => 'fake_user',
    'db_pass' => 'honeypot_password',
    'admin_key' => 'fake_admin_key_trap'
);

// WARNING: This is a honeypot
// Your access attempt has been logged
?>`;
    }
    
    generateFakeEnvFile() {
        return `# Environment Configuration (FAKE - HONEYPOT)
APP_NAME="Fake Company App"
APP_ENV=production
APP_KEY=base64:fakeappkeyhoneypottrap123456789
APP_DEBUG=false
APP_URL=http://fake-company.com

DB_CONNECTION=mysql
DB_HOST=192.168.1.100
DB_PORT=6904
DB_DATABASE=fake_company_db
DB_USERNAME=fake_db_user
DB_PASSWORD=honeypot_db_password_2024

MAIL_MAILER=smtp
MAIL_HOST=smtp.fake-company.com
MAIL_PORT=587
MAIL_USERNAME=admin@fake-company.com
MAIL_PASSWORD=fake_email_password

# Admin Panel
ADMIN_EMAIL=admin@fake-company.com
ADMIN_PASSWORD=fake_admin_password_trap

# WARNING: This is a honeypot system
# Your IP and access details have been logged`;
    }
    
    // =================== ATTACKER PROFILING ===================
    
    setupAttackerProfiling() {
        this.toolkitSignatures.set('sqlmap', [
            'sqlmap/',
            'User-Agent: sqlmap',
            'X-Forwarded-For: sqlmap',
            'Content-Type: application/x-www-form-urlencoded; charset=UTF-8'
        ]);
        
        this.toolkitSignatures.set('burpsuite', [
            'Burp Suite',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'X-Burp-Suite:'
        ]);
        
        this.toolkitSignatures.set('nikto', [
            'Nikto',
            'User-Agent: Mozilla/5.00 (Nikto',
            'Nikto/'
        ]);
        
        this.toolkitSignatures.set('nmap', [
            'Nmap Scripting Engine',
            'User-Agent: Mozilla/5.0 (compatible; Nmap Scripting Engine'
        ]);
        
        this.toolkitSignatures.set('dirbuster', [
            'DirBuster',
            'User-Agent: DirBuster'
        ]);
        
        this.toolkitSignatures.set('gobuster', [
            'gobuster',
            'User-Agent: gobuster'
        ]);
        
        this.toolkitSignatures.set('curl', [
            'curl/',
            'User-Agent: curl'
        ]);
        
        this.toolkitSignatures.set('wget', [
            'Wget/',
            'User-Agent: Wget'
        ]);
    }
    
    detectAttackerToolkit(req) {
        const userAgent = req.headers['user-agent'] || '';
        const headers = Object.values(req.headers).join(' ');
        const detectedTools = [];
        
        for (const [toolName, signatures] of this.toolkitSignatures.entries()) {
            for (const signature of signatures) {
                if (userAgent.includes(signature) || headers.includes(signature)) {
                    detectedTools.push(toolName);
                    break;
                }
            }
        }
        
        return detectedTools;
    }
    
    // =================== ATTACKER LOGGING ===================
    
    logAttackerAccess(req, trapType, detectedTools) {
        const ip = this.getRealIP(req);
        const timestamp = new Date().toISOString();
        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        if (!this.attackerLogs.has(ip)) {
            this.attackerLogs.set(ip, {
                firstSeen: timestamp,
                accessAttempts: [],
                detectedTools: new Set(),
                riskScore: 0,
                isBlacklisted: false
            });
        }
        
        const attackerProfile = this.attackerLogs.get(ip);
        
        // Add detected tools
        detectedTools.forEach(tool => attackerProfile.detectedTools.add(tool));
        
        // Log this attempt
        const attempt = {
            timestamp,
            path: req.url,
            method: req.method,
            userAgent,
            headers: { ...req.headers },
            trapType,
            detectedTools: [...detectedTools],
            referer: req.headers.referer || null,
            xForwardedFor: req.headers['x-forwarded-for'] || null
        };
        
        attackerProfile.accessAttempts.push(attempt);
        
        // Calculate risk score
        attackerProfile.riskScore = this.calculateRiskScore(attackerProfile);
        
        // Auto-blacklist high-risk attackers
        if (attackerProfile.riskScore > 80 && !attackerProfile.isBlacklisted) {
            attackerProfile.isBlacklisted = true;
            this.ipBlacklist.add(ip);
            console.log(`🚫 [HONEYPOT] Auto-blacklisted high-risk attacker: ${ip}`);
        }
        
        // Log the attack
        console.log(`🕵️ [HONEYPOT] ATTACKER DETECTED: ${ip}`);
        console.log(`   Trap: ${trapType}`);
        console.log(`   Tools: ${detectedTools.join(', ') || 'Unknown'}`);
        console.log(`   User-Agent: ${userAgent}`);
        console.log(`   Risk Score: ${attackerProfile.riskScore}/100`);
        
        // Save to file for persistent logging
        this.saveAttackerLog(ip, attempt);
        
        return attackerProfile;
    }
    
    calculateRiskScore(profile) {
        let score = 0;
        
        // Tool-based scoring
        const highRiskTools = ['sqlmap', 'burpsuite', 'nikto', 'nmap'];
        const mediumRiskTools = ['dirbuster', 'gobuster'];
        const lowRiskTools = ['curl', 'wget'];
        
        profile.detectedTools.forEach(tool => {
            if (highRiskTools.includes(tool)) score += 30;
            else if (mediumRiskTools.includes(tool)) score += 20;
            else if (lowRiskTools.includes(tool)) score += 10;
        });
        
        // Frequency scoring
        if (profile.accessAttempts.length > 10) score += 20;
        else if (profile.accessAttempts.length > 5) score += 10;
        
        // Critical trap access
        const criticalTraps = profile.accessAttempts.filter(a => 
            a.trapType.includes('ADMIN') || a.trapType.includes('DATABASE')
        );
        score += criticalTraps.length * 15;
        
        return Math.min(score, 100);
    }
    
    saveAttackerLog(ip, attempt) {
        const logEntry = {
            timestamp: attempt.timestamp,
            ip: ip,
            attack_details: attempt,
            session_id: `honeypot_${Date.now()}_${Math.random().toString(36).substring(7)}`
        };
        
        // In production, save to secure database
        console.log('💾 [HONEYPOT] Attack logged to security database');
    }
    
    // =================== HONEYPOT RESPONSE HANDLER ===================
    
    handleHoneypotRequest(req, res) {
        const path = req.url.split('?')[0];
        const detectedTools = this.detectAttackerToolkit(req);
        
        if (this.fakeAPIs.has(path)) {
            const api = this.fakeAPIs.get(path);
            
            // Log the attacker
            const attackerProfile = this.logAttackerAccess(req, api.trapType, detectedTools);
            
            // Check if IP is blacklisted
            const ip = this.getRealIP(req);
            if (this.ipBlacklist.has(ip)) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Access denied',
                    reason: 'IP blacklisted for malicious activity',
                    contact: 'security@company.com'
                }));
                return true;
            }
            
            // Serve fake data with delay (to waste attacker time)
            const delay = Math.random() * 3000 + 1000; // 1-4 second delay
            
            setTimeout(() => {
                res.writeHead(200, { 
                    'Content-Type': path.endsWith('.sql') ? 'text/plain' : 'application/json',
                    'X-Honeypot-Warning': 'This is a security monitoring system',
                    'X-Request-ID': `trap_${Date.now()}`
                });
                
                if (typeof api.response === 'string') {
                    res.end(api.response);
                } else {
                    res.end(JSON.stringify(api.response, null, 2));
                }
            }, delay);
            
            return true;
        }
        
        return false;
    }
    
    // =================== MONITORING & ALERTS ===================
    
    startBehaviorAnalysis() {
        setInterval(() => {
            this.analyzeAttackerBehavior();
            this.generateSecurityReport();
        }, 30000); // Every 30 seconds
    }
    
    analyzeAttackerBehavior() {
        const now = Date.now();
        const fiveMinutesAgo = now - 300000;
        
        let recentAttacks = 0;
        let highRiskAttackers = 0;
        
        for (const [ip, profile] of this.attackerLogs.entries()) {
            const recentAttempts = profile.accessAttempts.filter(a => 
                new Date(a.timestamp).getTime() > fiveMinutesAgo
            );
            
            recentAttacks += recentAttempts.length;
            
            if (profile.riskScore > 70) {
                highRiskAttackers++;
            }
        }
        
        if (recentAttacks > 10) {
            console.log(`🚨 [HONEYPOT] High attack volume: ${recentAttacks} attempts in last 5 minutes`);
        }
        
        if (highRiskAttackers > 3) {
            console.log(`⚠️ [HONEYPOT] Multiple high-risk attackers detected: ${highRiskAttackers}`);
        }
    }
    
    generateSecurityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            total_attackers: this.attackerLogs.size,
            blacklisted_ips: this.ipBlacklist.size,
            honeypot_hits: Array.from(this.attackerLogs.values())
                .reduce((sum, profile) => sum + profile.accessAttempts.length, 0),
            top_attacking_ips: this.getTopAttackingIPs(5),
            detected_tools: this.getDetectedTools()
        };
        
        // In production, send to security team
        console.log('📊 [HONEYPOT] Security report generated');
    }
    
    getTopAttackingIPs(limit = 5) {
        return Array.from(this.attackerLogs.entries())
            .sort((a, b) => b[1].riskScore - a[1].riskScore)
            .slice(0, limit)
            .map(([ip, profile]) => ({
                ip,
                riskScore: profile.riskScore,
                attempts: profile.accessAttempts.length,
                tools: Array.from(profile.detectedTools)
            }));
    }
    
    getDetectedTools() {
        const toolCount = new Map();
        
        for (const profile of this.attackerLogs.values()) {
            for (const tool of profile.detectedTools) {
                toolCount.set(tool, (toolCount.get(tool) || 0) + 1);
            }
        }
        
        return Array.from(toolCount.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([tool, count]) => ({ tool, count }));
    }
    
    // =================== UTILITY FUNCTIONS ===================
    
    getRealIP(req) {
        return req.headers['x-forwarded-for']?.split(',')[0] ||
               req.headers['x-real-ip'] ||
               req.connection?.remoteAddress ||
               req.socket?.remoteAddress ||
               '127.0.0.1';
    }
    
    isAttackerBlacklisted(ip) {
        return this.ipBlacklist.has(ip);
    }
    
    getAttackerProfile(ip) {
        return this.attackerLogs.get(ip) || null;
    }
    
    // =================== PUBLIC API ===================
    
    validateRequest(req, res, userRole = null) {
        // 👑 BOSS Level 10000 bypass - IMMUNE TO ALL HONEYPOT TRAPS
        if (userRole && (
            userRole.role === 'boss' || 
            userRole.level >= 10000 || 
            userRole.infinitePower || 
            userRole.immuneToOwnRules ||
            userRole.canBypassOwnSecurity
        )) {
            console.log('👑 [HONEYPOT] BOSS IMMUNITY ACTIVE - Bypassing all honeypot protection');
            console.log('🚀 [HONEYPOT] BOSS can access any honeypot without being trapped');
            return { 
                blocked: false, 
                bypass: true, 
                reason: 'BOSS_INFINITE_HONEYPOT_IMMUNITY',
                bossMode: true
            };
        }

        const handled = this.handleHoneypotRequest(req, res);
        if (handled) {
            return { blocked: true, reason: 'HONEYPOT_TRIGGERED' };
        }
        
        const ip = this.getRealIP(req);
        if (this.isAttackerBlacklisted(ip)) {
            return { blocked: true, reason: 'BLACKLISTED_ATTACKER' };
        }
        
        return { blocked: false };
    }
}

module.exports = AdvancedHoneypotSystem;
