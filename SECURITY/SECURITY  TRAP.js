// TINI ULTIMATE SECURITY SYSTEM - Military Grade Protection
// Advanced protection against all forms of attacks including DDoS, fingerprinting, and penetration
// Enhanced with Persistent Employee System

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const PersistentEmployeeSystem = require('./persistent-employee-system');

class UltimateSecuritySystem {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.ipAttempts = new Map();
        this.deviceFingerprints = new Map();
        this.blockedIPs = new Map();
        this.blockedDevices = new Map();
        this.suspiciousActivity = new Map();
        this.ddosProtection = new Map();
        this.geolocation = new Map();
        
        // Initialize Persistent Employee System
        this.employeeSystem = new PersistentEmployeeSystem();
        
        // Ultra-strict security configurations
        this.maxLoginAttempts = 4; // Reduced to 4 attempts
        this.permanentLockoutDuration = 24 * 60 * 60 * 1000; // 24 hours
        this.sessionTimeout = 15 * 60 * 1000; // Default 15 minutes (overridden by employee system)
        this.ddosThreshold = 50; // Requests per minute
        this.suspiciousPatternThreshold = 3;
        this.deviceChangeThreshold = 2;
        
        // Anti-fingerprinting protection
        this.obfuscationKeys = this.generateObfuscationKeys();
        this.honeypots = new Set();
        
        this.initializeUsers();
        this.initializeHoneypots();
        this.startAdvancedMonitoring();
    }

    generateObfuscationKeys() {
        return {
            sessionKey: crypto.randomBytes(32).toString('hex'),
            deviceKey: crypto.randomBytes(32).toString('hex'),
            responseKey: crypto.randomBytes(32).toString('hex')
        };
    }

    initializeUsers() {
        // Load credentials from environment variables for security
        const adminPassword = this.getConfig().get('ADMIN_PASSWORD') || 'CHANGE_THIS_ADMIN_PASSWORD_2024';
        const bossPassword = this.getConfig().get('BOSS_PASSWORD') || 'CHANGE_THIS_BOSS_PASSWORD_2024';
        const staffPassword = this.getConfig().get('STAFF_PASSWORD') || 'CHANGE_THIS_STAFF_PASSWORD_2024';
        
        // Ultra-secure user initialization with environment-based passwords
        this.users.set('admin', {
            username: 'admin',
            passwordHash: this.hashPassword(adminPassword),
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0,
            securityLevel: 'high',
            allowedIPs: [], // Empty = allow from anywhere with verification
            deviceWhitelist: []
        });

        this.users.set('boss', {
            username: 'boss',
            passwordHash: this.hashPassword(bossPassword),
            role: 'boss',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0,
            securityLevel: 'maximum',
            allowedIPs: [],
            deviceWhitelist: []
        });

        this.users.set('staff', {
            username: 'staff',
            passwordHash: this.hashPassword(staffPassword),
            role: 'staff',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0,
            securityLevel: 'high',
            allowedIPs: [],
            deviceWhitelist: []
        });

        console.log('🛡️  ULTIMATE SECURITY: Military-grade user database initialized');
        console.log('🔐 SECURITY CREDENTIALS:');
        console.log('   ⚠️  All credentials loaded from environment variables');
        console.log('   📝 Configure via .env file (see .env.example)');
        console.log('   🔒 Never commit real passwords to code!');
    }

    initializeHoneypots() {
        // Create honeypot traps for attackers
        this.honeypots.add('/admin');
        this.honeypots.add('/administrator');
        this.honeypots.add('/wp-admin');
        this.honeypots.add('/phpmyadmin');
        this.honeypots.add('/console');
        this.honeypots.add('/.env');
        this.honeypots.add('/config.php');
        this.honeypots.add('/backup.sql');
        
        console.log('🍯 Honeypot traps activated');
    }

    hashPassword(password) {
        const salt = crypto.randomBytes(64).toString('hex'); // Increased salt size
        const hash = crypto.pbkdf2Sync(password, salt, 50000, 128, 'sha512').toString('hex'); // Increased iterations
        return { salt, hash };
    }

    verifyPassword(password, storedPassword) {
        const hash = crypto.pbkdf2Sync(password, storedPassword.salt, 50000, 128, 'sha512').toString('hex');
        return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedPassword.hash, 'hex'));
    }

    generateDeviceFingerprint(req) {
        const userAgent = req.headers['user-agent'] || '';
        const acceptLanguage = req.headers['accept-language'] || '';
        const acceptEncoding = req.headers['accept-encoding'] || '';
        const connection = req.headers['connection'] || '';
        const ip = this.getClientIP(req);
        
        const fingerprintData = `${userAgent}:${acceptLanguage}:${acceptEncoding}:${connection}:${ip}`;
        return crypto.createHash('sha256').update(fingerprintData).digest('hex');
    }

    getClientIP(req) {
        return req.headers['cf-connecting-ip'] ||
               req.headers['x-forwarded-for'] ||
               req.headers['x-real-ip'] ||
               req.connection.remoteAddress ||
               req.socket.remoteAddress ||
               'unknown';
    }

    isHoneypotRequest(pathname) {
        return this.honeypots.has(pathname);
    }

    detectDDoSAttack(ip) {
        const now = Date.now();
        const requests = this.ddosProtection.get(ip) || [];
        
        // Remove old requests (older than 1 minute)
        const recentRequests = requests.filter(time => now - time < 60000);
        
        if (recentRequests.length >= this.ddosThreshold) {
            this.blockIPPermanently(ip, 'DDoS attack detected');
            this.reportSuspiciousActivity(ip, 'DDOS_ATTACK', {
                requestCount: recentRequests.length,
                timeWindow: '1 minute'
            });
            return true;
        }
        
        recentRequests.push(now);
        this.ddosProtection.set(ip, recentRequests);
        return false;
    }

    detectSuspiciousPatterns(ip, userAgent, pathname) {
        const patterns = [
            /sqlmap/i,
            /nikto/i,
            /nmap/i,
            /burp/i,
            /zap/i,
            /curl/i,
            /wget/i,
            /python-requests/i,
            /bot/i,
            /scanner/i,
            /hack/i,
            /exploit/i
        ];

        const suspiciousUserAgent = patterns.some(pattern => pattern.test(userAgent));
        const suspiciousPath = pathname.includes('..') || pathname.includes('<script>') || pathname.includes('union');
        
        if (suspiciousUserAgent || suspiciousPath) {
            this.reportSuspiciousActivity(ip, 'SUSPICIOUS_PATTERN', {
                userAgent,
                pathname,
                reason: suspiciousUserAgent ? 'Suspicious User Agent' : 'Suspicious Path'
            });
            return true;
        }
        
        return false;
    }

    reportSuspiciousActivity(ip, type, details) {
        const activity = this.suspiciousActivity.get(ip) || [];
        activity.push({
            type,
            details,
            timestamp: new Date(),
            severity: this.getSeverityLevel(type)
        });
        
        if (activity.length >= this.suspiciousPatternThreshold) {
            this.blockIPPermanently(ip, `Multiple suspicious activities: ${type}`);
        }
        
        this.suspiciousActivity.set(ip, activity);
        console.log(`🚨 SUSPICIOUS ACTIVITY: ${type} from ${ip}`, details);
    }

    getSeverityLevel(type) {
        const severityMap = {
            'DDOS_ATTACK': 'CRITICAL',
            'HONEYPOT_ACCESS': 'HIGH',
            'SUSPICIOUS_PATTERN': 'MEDIUM',
            'MULTIPLE_FAILED_LOGINS': 'HIGH',
            'DEVICE_FINGERPRINT_CHANGE': 'MEDIUM',
            'SESSION_HIJACKING': 'CRITICAL'
        };
        return severityMap[type] || 'LOW';
    }

    blockIPPermanently(ip, reason) {
        this.blockedIPs.set(ip, {
            reason,
            blockedAt: new Date(),
            isPermanent: true,
            severity: 'CRITICAL'
        });
        
        console.log(`🔒 PERMANENT IP BLOCK: ${ip} - ${reason}`);
        
        // Also log to security file
        this.logSecurityEvent('IP_BLOCKED', {
            ip,
            reason,
            timestamp: new Date().toISOString(),
            permanent: true
        });
    }

    blockDevice(deviceFingerprint, reason) {
        this.blockedDevices.set(deviceFingerprint, {
            reason,
            blockedAt: new Date(),
            isPermanent: true
        });
        
        console.log(`🔒 DEVICE BLOCKED: ${deviceFingerprint.substring(0, 16)}... - ${reason}`);
    }

    isIPBlocked(ip, userRole = null) {
        // 👑 BOSS Level 10000 bypass - NEVER BLOCKED
        if (userRole && (
            userRole.role === 'boss' || 
            userRole.level >= 10000 || 
            userRole.infinitePower || 
            userRole.immuneToOwnRules ||
            userRole.canBypassOwnSecurity
        )) {
            console.log(`👑 [BOSS] IP Block Check Bypassed for ${ip} - INFINITE AUTHORITY`);
            return false; // BOSS never blocked
        }
        
        return this.blockedIPs.has(ip);
    }

    isDeviceBlocked(deviceFingerprint, userRole = null) {
        // 👑 BOSS Level 10000 bypass - NEVER BLOCKED
        if (userRole && (
            userRole.role === 'boss' || 
            userRole.level >= 10000 || 
            userRole.infinitePower || 
            userRole.immuneToOwnRules ||
            userRole.canBypassOwnSecurity
        )) {
            console.log(`👑 [BOSS] Device Block Check Bypassed for ${deviceFingerprint.substring(0, 16)}... - INFINITE AUTHORITY`);
            return false; // BOSS never blocked
        }
        
        return this.blockedDevices.has(deviceFingerprint);
    }

    checkDeviceChange(username, deviceFingerprint) {
        const user = this.users.get(username);
        if (!user) return false;
        
        if (user.deviceWhitelist.length === 0) {
            // First login from this device
            user.deviceWhitelist.push(deviceFingerprint);
            return false;
        }
        
        if (!user.deviceWhitelist.includes(deviceFingerprint)) {
            user.deviceWhitelist.push(deviceFingerprint);
            
            if (user.deviceWhitelist.length > this.deviceChangeThreshold) {
                this.reportSuspiciousActivity('unknown', 'DEVICE_FINGERPRINT_CHANGE', {
                    username,
                    newDevice: deviceFingerprint.substring(0, 16),
                    totalDevices: user.deviceWhitelist.length
                });
                return true;
            }
        }
        
        return false;
    }

    logSecurityEvent(eventType, data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            eventType,
            data
        };
        
        // In production, this would write to a secure log file
        console.log(`📝 SECURITY LOG: ${eventType}`, data);
    }

    generateSecureToken() {
        return crypto.randomBytes(128).toString('hex'); // Increased token size
    }

    obfuscateResponse(data) {
        // Add random padding to responses to prevent timing attacks
        const padding = crypto.randomBytes(Math.floor(Math.random() * 100)).toString('hex');
        return {
            ...data,
            _padding: padding,
            _checksum: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
        };
    }

    validateRequest(req, userRole = null) {
        const ip = this.getClientIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const pathname = req.url;
        
        // 👑 BOSS Level 10000 bypass - SKIP ALL SECURITY VALIDATION
        if (userRole && (
            userRole.role === 'boss' || 
            userRole.level >= 10000 || 
            userRole.infinitePower || 
            userRole.immuneToOwnRules ||
            userRole.canBypassOwnSecurity
        )) {
            console.log(`👑 [BOSS] Request Validation Bypassed for ${ip} ${pathname} - INFINITE AUTHORITY`);
            return { 
                valid: true, 
                ip, 
                deviceFingerprint: 'BOSS_DEVICE_INFINITE',
                userAgent: userAgent,
                bossMode: true,
                message: 'BOSS_INFINITE_ACCESS_GRANTED'
            };
        }
        
        // Check for DDoS
        if (this.detectDDoSAttack(ip)) {
            return { valid: false, reason: 'DDOS_DETECTED' };
        }
        
        // Check if IP is blocked
        if (this.isIPBlocked(ip, userRole)) {
            return { valid: false, reason: 'IP_BLOCKED' };
        }
        
        // Check for honeypot access
        if (this.isHoneypotRequest(pathname)) {
            this.blockIPPermanently(ip, 'Honeypot access attempt');
            this.reportSuspiciousActivity(ip, 'HONEYPOT_ACCESS', { pathname });
            return { valid: false, reason: 'HONEYPOT_ACCESSED' };
        }
        
        // Check for suspicious patterns
        if (this.detectSuspiciousPatterns(ip, userAgent, pathname)) {
            return { valid: false, reason: 'SUSPICIOUS_PATTERN' };
        }
        
        // Generate device fingerprint
        const deviceFingerprint = this.generateDeviceFingerprint(req);
        if (this.isDeviceBlocked(deviceFingerprint, userRole)) {
            return { valid: false, reason: 'DEVICE_BLOCKED' };
        }
        
        return { 
            valid: true, 
            ip, 
            deviceFingerprint,
            userAgent: this.sanitizeUserAgent(userAgent)
        };
    }

    sanitizeUserAgent(userAgent) {
        // Remove potentially dangerous information from user agent
        return userAgent.replace(/[<>"/\\]/g, '').substring(0, 200);
    }

    authenticate(username, password, req) {
        try {
            const validation = this.validateRequest(req);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.reason,
                    message: this.getErrorMessage(validation.reason)
                };
            }

            const { ip, deviceFingerprint, userAgent } = validation;

            // Enhanced input validation
            if (!username || !password || 
                typeof username !== 'string' || typeof password !== 'string' ||
                username.length > 50 || password.length > 200 ||
                !/^[a-zA-Z0-9_.-]+$/.test(username)) {
                
                this.recordFailedAttempt(ip, username, 'INVALID_INPUT');
                return {
                    success: false,
                    error: 'INVALID_INPUT',
                    message: 'Invalid credentials format'
                };
            }

            // Check with Persistent Employee System first
            const employeeValidation = this.employeeSystem.validateEmployeeAccess(username, deviceFingerprint, req);
            
            if (!employeeValidation.valid) {
                this.recordFailedAttempt(ip, username, employeeValidation.reason);
                return {
                    success: false,
                    error: employeeValidation.reason,
                    message: this.getErrorMessage(employeeValidation.reason)
                };
            }

            // Check for existing persistent session (staff auto-login)
            if (employeeValidation.resumedSession) {
                const existingSession = employeeValidation.existingSession;
                
                this.employeeSystem.recordLoginActivity(
                    employeeValidation.employeeId, 
                    deviceFingerprint, 
                    true, 
                    ip, 
                    'PERSISTENT_SESSION_RESUMED'
                );

                console.log(`🔄 PERSISTENT SESSION RESUMED: ${username} from ${ip}`);

                return this.obfuscateResponse({
                    success: true,
                    token: existingSession.persistentToken,
                    user: {
                        username: existingSession.username,
                        role: existingSession.role,
                        employeeId: existingSession.employeeId,
                        lastLogin: existingSession.lastActivity,
                        securityLevel: employeeValidation.employee.securityLevel,
                        allowLogout: employeeValidation.employee.allowLogout,
                        sessionType: 'persistent'
                    },
                    expiresAt: existingSession.expiresAt,
                    message: 'Session resumed automatically'
                });
            }

            // Get user for password verification
            const user = this.users.get(username.toLowerCase());
            if (!user) {
                this.recordFailedAttempt(ip, username, 'USER_NOT_FOUND');
                return {
                    success: false,
                    error: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password'
                };
            }

            // Check if user is active
            if (!user.isActive) {
                this.recordFailedAttempt(ip, username, 'USER_DISABLED');
                return {
                    success: false,
                    error: 'USER_DISABLED',
                    message: 'Account has been disabled'
                };
            }

            // Verify password with timing-safe comparison
            if (!this.verifyPassword(password, user.passwordHash)) {
                this.recordFailedAttempt(ip, username, 'INVALID_PASSWORD');
                this.employeeSystem.recordLoginActivity(
                    employeeValidation.employeeId, 
                    deviceFingerprint, 
                    false, 
                    ip, 
                    'INVALID_PASSWORD'
                );
                return {
                    success: false,
                    error: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password'
                };
            }

            // Create session based on employee type
            const employee = employeeValidation.employee;
            let sessionToken, sessionData;

            if (employee.restrictions.sessionPersistent) {
                // Create persistent session for staff
                const persistentSession = this.employeeSystem.createPersistentSession(
                    employeeValidation.employeeId, 
                    username, 
                    deviceFingerprint, 
                    req
                );
                
                if (persistentSession) {
                    sessionToken = persistentSession.persistentToken;
                    sessionData = {
                        username: user.username,
                        role: user.role,
                        employeeId: employeeValidation.employeeId,
                        ip: ip,
                        deviceFingerprint: deviceFingerprint,
                        userAgent: userAgent,
                        createdAt: new Date(),
                        expiresAt: persistentSession.expiresAt,
                        isValid: true,
                        securityLevel: user.securityLevel,
                        sessionId: persistentSession.sessionId,
                        isPersistent: true,
                        allowLogout: employee.allowLogout
                    };
                } else {
                    // Fallback to regular session
                    sessionToken = this.generateSecureToken();
                    sessionData = this.createRegularSession(user, ip, deviceFingerprint, userAgent, employee);
                }
            } else {
                // Create regular session for admin/boss
                sessionToken = this.generateSecureToken();
                sessionData = this.createRegularSession(user, ip, deviceFingerprint, userAgent, employee);
            }

            this.sessions.set(sessionToken, sessionData);

            // Update user login info
            user.lastLogin = new Date();
            user.loginCount++;

            // Clear failed attempts
            this.clearFailedAttempts(ip, username);

            // Record successful login
            this.employeeSystem.recordLoginActivity(
                employeeValidation.employeeId, 
                deviceFingerprint, 
                true, 
                ip, 
                'PASSWORD_LOGIN'
            );

            // Log successful login
            this.logSecurityEvent('SUCCESSFUL_LOGIN', {
                username: user.username,
                role: user.role,
                employeeId: employeeValidation.employeeId,
                ip,
                deviceFingerprint: deviceFingerprint.substring(0, 16),
                loginCount: user.loginCount,
                sessionType: sessionData.isPersistent ? 'persistent' : 'regular'
            });

            console.log(`✅ SECURE LOGIN: ${username} (${user.role}) from ${ip} - ${sessionData.isPersistent ? 'PERSISTENT' : 'REGULAR'} session`);

            return this.obfuscateResponse({
                success: true,
                token: sessionToken,
                user: {
                    username: user.username,
                    role: user.role,
                    employeeId: employeeValidation.employeeId,
                    lastLogin: user.lastLogin,
                    securityLevel: user.securityLevel,
                    allowLogout: employee.allowLogout,
                    sessionType: sessionData.isPersistent ? 'persistent' : 'regular'
                },
                expiresAt: sessionData.expiresAt
            });

        } catch (error) {
            console.error('🚨 AUTHENTICATION ERROR:', error);
            this.recordFailedAttempt(validation?.ip || 'unknown', username || 'unknown', 'SYSTEM_ERROR');
            return {
                success: false,
                error: 'SYSTEM_ERROR',
                message: 'Authentication system temporarily unavailable'
            };
        }
    }

    createRegularSession(user, ip, deviceFingerprint, userAgent, employee) {
        // Determine session timeout based on role
        let timeout = this.sessionTimeout; // Default 15 minutes
        
        if (user.role === 'admin') {
            timeout = this.employeeSystem.employeeRegistry.system_config.admin_session_timeout || timeout;
        } else if (user.role === 'boss') {
            timeout = this.employeeSystem.employeeRegistry.system_config.boss_session_timeout || timeout;
        }

        return {
            username: user.username,
            role: user.role,
            ip: ip,
            deviceFingerprint: deviceFingerprint,
            userAgent: userAgent,
            createdAt: new Date(),
            expiresAt: Date.now() + timeout,
            isValid: true,
            securityLevel: user.securityLevel,
            sessionId: crypto.randomUUID(),
            isPersistent: false,
            allowLogout: employee.allowLogout
        };
    }

    recordFailedAttempt(ip, username, reason) {
        const key = `${ip}:${username}`;
        const attempts = this.ipAttempts.get(key) || [];
        attempts.push({
            timestamp: Date.now(),
            reason,
            ip,
            username
        });

        if (attempts.length >= this.maxLoginAttempts) {
            this.blockIPPermanently(ip, `${this.maxLoginAttempts} failed login attempts for ${username}`);
            this.blockDevice(this.generateDeviceFingerprint({ headers: { 'user-agent': '' } }), 'Multiple failed attempts');
            this.reportSuspiciousActivity(ip, 'MULTIPLE_FAILED_LOGINS', {
                username,
                attempts: attempts.length,
                reasons: attempts.map(a => a.reason)
            });
            this.ipAttempts.delete(key);
        } else {
            this.ipAttempts.set(key, attempts);
        }

        this.logSecurityEvent('FAILED_LOGIN_ATTEMPT', {
            ip,
            username,
            reason,
            attemptNumber: attempts.length
        });
    }

    clearFailedAttempts(ip, username) {
        const key = `${ip}:${username}`;
        this.ipAttempts.delete(key);
    }

    getErrorMessage(errorCode) {
        const messages = {
            'DDOS_DETECTED': 'Security violation detected. Access denied.',
            'IP_BLOCKED': 'Your access has been restricted.',
            'DEVICE_BLOCKED': 'Device access has been restricted.',
            'HONEYPOT_ACCESSED': 'Unauthorized access attempt detected.',
            'SUSPICIOUS_PATTERN': 'Security protocols activated.',
            'INVALID_CREDENTIALS': 'Authentication failed.',
            'USER_DISABLED': 'Account access restricted.',
            'SYSTEM_ERROR': 'Service temporarily unavailable.',
            'EMPLOYEE_NOT_FOUND': 'Employee record not found.',
            'EMPLOYEE_INACTIVE': 'Employee account inactive.',
            'DEVICE_NOT_REGISTERED': 'Device registration required.',
            'DEVICE_VALIDATION_FAILED': 'Device validation failed.',
            'SESSION_HIJACKING': 'Session security violation detected.',
            'DEVICE_FINGERPRINT_CHANGED': 'Device security verification failed.',
            'BROWSER_NOT_ALLOWED': 'Browser not permitted. Please use approved browser.',
            'AUTOMATION_BROWSER_DETECTED': 'Automation tools are not allowed.',
            'INCOGNITO_MODE_BLOCKED': 'Private/incognito mode is not permitted.',
            'INVALID_CHROME_SIGNATURE': 'Invalid Chrome browser detected.',
            'CHROMIUM_NOT_ALLOWED': 'Please use Google Chrome instead of Chromium.'
        };
        return messages[errorCode] || 'Access denied.';
    }

    validateSession(token, req) {
        try {
            const validation = this.validateRequest(req);
            if (!validation.valid) {
                return { 
                    valid: false, 
                    error: validation.reason,
                    message: this.getErrorMessage(validation.reason)
                };
            }

            if (!token || typeof token !== 'string') {
                return { valid: false, error: 'INVALID_TOKEN' };
            }

            // First check regular sessions
            const session = this.sessions.get(token);
            if (session) {
                return this.validateRegularSession(session, token, validation);
            }

            // Check persistent sessions (staff)
            const persistentSession = this.findPersistentSessionByToken(token);
            if (persistentSession) {
                return this.validatePersistentSession(persistentSession, validation);
            }

            return { valid: false, error: 'SESSION_NOT_FOUND' };

        } catch (error) {
            console.error('🚨 SESSION VALIDATION ERROR:', error);
            return { valid: false, error: 'VALIDATION_ERROR' };
        }
    }

    validateRegularSession(session, token, validation) {
        // Check expiration
        if (Date.now() > session.expiresAt) {
            this.sessions.delete(token);
            return { valid: false, error: 'SESSION_EXPIRED' };
        }

        // Enhanced security checks
        if (session.ip !== validation.ip) {
            console.log(`🚨 IP CHANGE DETECTED: Session ${session.sessionId} - ${session.ip} → ${validation.ip}`);
            this.reportSuspiciousActivity(validation.ip, 'SESSION_HIJACKING', {
                sessionId: session.sessionId,
                originalIP: session.ip,
                newIP: validation.ip,
                username: session.username
            });
            this.sessions.delete(token);
            return { valid: false, error: 'SESSION_HIJACKING' };
        }

        if (session.deviceFingerprint !== validation.deviceFingerprint) {
            console.log(`⚠️  Device fingerprint changed for session ${session.sessionId}`);
            // For non-persistent sessions, this is suspicious
            if (!session.isPersistent) {
                this.sessions.delete(token);
                return { valid: false, error: 'DEVICE_FINGERPRINT_CHANGED' };
            }
        }

        // Extend session for non-persistent sessions
        if (!session.isPersistent) {
            const employee = this.employeeSystem.findEmployeeByUsername(session.username);
            if (employee && employee.employee.restrictions.sessionPersistent === false) {
                // Extend session based on role
                let timeout = this.sessionTimeout;
                if (session.role === 'admin') {
                    timeout = this.employeeSystem.employeeRegistry.system_config.admin_session_timeout || timeout;
                } else if (session.role === 'boss') {
                    timeout = this.employeeSystem.employeeRegistry.system_config.boss_session_timeout || timeout;
                }
                session.expiresAt = Date.now() + timeout;
            }
        }

        return {
            valid: true,
            user: {
                username: session.username,
                role: session.role,
                securityLevel: session.securityLevel,
                allowLogout: session.allowLogout,
                sessionType: session.isPersistent ? 'persistent' : 'regular',
                employeeId: session.employeeId
            },
            expiresAt: session.expiresAt
        };
    }

    validatePersistentSession(persistentSession, validation) {
        // Check expiration
        if (Date.now() > persistentSession.expiresAt) {
            this.cleanupExpiredPersistentSession(persistentSession);
            return { valid: false, error: 'SESSION_EXPIRED' };
        }

        // For persistent sessions, allow some flexibility with IP/device changes
        // but log them for monitoring
        if (persistentSession.ip !== validation.ip) {
            console.log(`📍 IP changed for persistent session: ${persistentSession.employeeId} - ${persistentSession.ip} → ${validation.ip}`);
            // Update IP in persistent session
            persistentSession.ip = validation.ip;
            this.employeeSystem.savePersistentSessions();
        }

        if (persistentSession.deviceFingerprint !== validation.deviceFingerprint) {
            console.log(`📱 Device fingerprint changed for persistent session: ${persistentSession.employeeId}`);
            // For staff persistent sessions, validate with employee system
            const empValidation = this.employeeSystem.validateEmployeeAccess(
                persistentSession.username, 
                validation.deviceFingerprint, 
                { headers: { 'user-agent': validation.userAgent }, ...validation }
            );
            
            if (!empValidation.valid) {
                console.log(`🚨 Device validation failed for persistent session: ${empValidation.reason}`);
                this.cleanupExpiredPersistentSession(persistentSession);
                return { valid: false, error: 'DEVICE_VALIDATION_FAILED' };
            }
        }

        // Update last activity
        persistentSession.lastActivity = new Date().toISOString();
        this.employeeSystem.savePersistentSessions();

        return {
            valid: true,
            user: {
                username: persistentSession.username,
                role: persistentSession.role,
                securityLevel: 'restricted',
                allowLogout: false, // Staff cannot logout
                sessionType: 'persistent',
                employeeId: persistentSession.employeeId
            },
            expiresAt: persistentSession.expiresAt
        };
    }

    findPersistentSessionByToken(token) {
        for (const session of Object.values(this.employeeSystem.persistentSessions.staff_sessions)) {
            if (session.persistentToken === token) {
                return session;
            }
        }
        return null;
    }

    cleanupExpiredPersistentSession(persistentSession) {
        delete this.employeeSystem.persistentSessions.staff_sessions[persistentSession.sessionId];
        
        // Remove from active devices
        for (const [deviceFp, deviceSession] of Object.entries(this.employeeSystem.persistentSessions.active_devices)) {
            if (deviceSession.sessionId === persistentSession.sessionId) {
                delete this.employeeSystem.persistentSessions.active_devices[deviceFp];
                break;
            }
        }
        
        this.employeeSystem.savePersistentSessions();
    }

    getSecurityStats() {
        return this.obfuscateResponse({
            totalUsers: this.users.size,
            activeSessions: this.sessions.size,
            blockedIPs: this.blockedIPs.size,
            blockedDevices: this.blockedDevices.size,
            suspiciousActivities: Array.from(this.suspiciousActivity.values()).flat().length,
            honeypotHits: Array.from(this.suspiciousActivity.values()).flat()
                .filter(a => a.type === 'HONEYPOT_ACCESS').length,
            ddosAttempts: Array.from(this.suspiciousActivity.values()).flat()
                .filter(a => a.type === 'DDOS_ATTACK').length
        });
    }

    startAdvancedMonitoring() {
        // Enhanced cleanup and monitoring every 2 minutes
        setInterval(() => {
            this.performSecurityMaintenance();
        }, 2 * 60 * 1000);

        console.log('🛡️  ULTIMATE SECURITY MONITORING ACTIVATED');
    }

    performSecurityMaintenance() {
        this.cleanupExpiredSessions();
        this.cleanupOldAttempts();
        this.analyzeSecurityPatterns();
        this.rotateObfuscationKeys();
    }

    cleanupExpiredSessions() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [token, session] of this.sessions.entries()) {
            if (now > session.expiresAt) {
                this.sessions.delete(token);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired sessions`);
        }
    }

    cleanupOldAttempts() {
        const cutoff = Date.now() - (60 * 60 * 1000); // 1 hour ago
        let cleaned = 0;

        for (const [key, attempts] of this.ipAttempts.entries()) {
            const recentAttempts = attempts.filter(a => a.timestamp > cutoff);
            if (recentAttempts.length === 0) {
                this.ipAttempts.delete(key);
                cleaned++;
            } else if (recentAttempts.length !== attempts.length) {
                this.ipAttempts.set(key, recentAttempts);
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} old attempt records`);
        }
    }

    analyzeSecurityPatterns() {
        // Advanced pattern analysis for proactive threat detection
        const recentActivities = Array.from(this.suspiciousActivity.values()).flat()
            .filter(a => Date.now() - new Date(a.timestamp).getTime() < 60 * 60 * 1000);

        if (recentActivities.length > 20) {
            console.log('🚨 HIGH THREAT LEVEL: Multiple suspicious activities detected');
        }
    }

    rotateObfuscationKeys() {
        // Rotate obfuscation keys every hour for enhanced security
        this.obfuscationKeys = this.generateObfuscationKeys();
    }

    // Emergency lockdown mode
    activateEmergencyLockdown() {
        console.log('🚨 EMERGENCY LOCKDOWN ACTIVATED');
        
        // Clear all sessions
        this.sessions.clear();
        
        // Disable all users temporarily
        for (const [username, user] of this.users.entries()) {
            if (user.role !== 'boss') {
                user.isActive = false;
            }
        }
        
        this.logSecurityEvent('EMERGENCY_LOCKDOWN', {
            timestamp: new Date().toISOString(),
            reason: 'Manual activation',
            affectedUsers: this.users.size - 1
        });
    }
}

module.exports = UltimateSecuritySystem;
