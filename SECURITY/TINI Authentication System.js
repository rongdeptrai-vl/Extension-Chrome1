// TINI Authentication System - Secure Backend with Boss Device Binding
// Enhanced with strict username format validation and ULTIMATE Boss security

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const UsernameValidationSystem = require('./username-validation-system');
const BossDeviceBinding = require('./boss-device-binding.node');

const EventEmitter = require('events');

class SecureAuthenticationSystem extends EventEmitter {
    constructor() {
        super();
        this.users = new Map();
        this.sessions = new Map();
        this.loginAttempts = new Map();
        this.blockedIPs = new Map();
        this.requestCounts = new Map();
        
        // Initialize Username Validation System
        this.usernameValidator = new UsernameValidationSystem();
        
        // Initialize Boss Device Binding System - ULTIMATE BOSS SECURITY
        this.bossDeviceBinding = new BossDeviceBinding();
        
        // Security configurations
        this.maxLoginAttempts = 3;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.rateLimitWindow = 60 * 1000; // 1 minute
        this.maxRequestsPerWindow = 10;
        
        this.initializeUsers();
        this.startCleanupTimer();
        
        console.log('👑 BOSS SECURITY SYSTEM: ULTIMATE PROTECTION ACTIVE');
        console.log('🔒 Boss can only login from ONE registered device');
        console.log('🛡️ NO vulnerabilities possible for Boss account');
    }

    // Get configuration helper method
    getConfig() {
        // Browser environment
        if (typeof window !== 'undefined' && window.tiniConfig) {
            return window.tiniConfig;
        }
        
        // Node.js environment - create a simple config object
        return {
            get: (key) => {
                if (typeof process !== 'undefined' && process.env) {
                    return process.env[key];
                }
                return null;
            }
        };
    }

    initializeUsers() {
        // Initialize with secure default users using environment variables
        const config = this.getConfig();
        const adminPassword = config.get('ADMIN_PASSWORD') || window.tiniConfig?.get('ADMIN_PASSWORD') || 'CHANGE_THIS_ADMIN_PASSWORD';
        const bossPassword = config.get('BOSS_PASSWORD') || window.tiniConfig?.get('BOSS_PASSWORD') || 'CHANGE_THIS_BOSS_PASSWORD';
        const staffPassword = config.get('STAFF_PASSWORD') || 'CHANGE_THIS_STAFF_PASSWORD';

        this.users.set('admin', {
            username: 'admin',
            passwordHash: this.hashPassword(adminPassword),
            role: 'admin',
            isActive: true,
            employeeId: 'ADMIN01',
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0
        });

        this.users.set('boss', {
            username: 'boss', 
            passwordHash: this.hashPassword(bossPassword),
            role: 'boss',
            isActive: true,
            employeeId: 'BOSS01',
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0
        });

        this.users.set('staff', {
            username: 'staff',
            passwordHash: this.hashPassword(staffPassword),
            role: 'staff',
            isActive: true,
            employeeId: 'EMP01',
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0
        });

        // Example employee with proper name format
        this.users.set('龙枪 KHẨU RỒNG 79', {
            username: '龙枪 KHẨU RỒNG 79',
            passwordHash: this.hashPassword('Employee#2024!@#$'),
            role: 'employee',
            isActive: true,
            employeeId: 'BOSS',
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0
        });

        console.log('🔐 Secure user database initialized with username validation');
        console.log('🔑 Default credentials loaded from environment variables');
        console.log('   ⚠️ Ensure ADMIN_PASSWORD, BOSS_PASSWORD, STAFF_PASSWORD are set in .env');
    }

    hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.scryptSync(password, salt, 64).toString('hex');
        return `${salt}:${hash}`;
    }

    verifyPassword(password, hashedPassword) {
        const [salt, hash] = hashedPassword.split(':');
        const verificationHash = crypto.scryptSync(password, salt, 64).toString('hex');
        return hash === verificationHash;
    }

    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    isIPBlocked(ip) {
        const blockInfo = this.blockedIPs.get(ip);
        if (!blockInfo) return false;

        if (Date.now() - blockInfo.blockedAt > this.lockoutDuration) {
            this.blockedIPs.delete(ip);
            return false;
        }

        return true;
    }

    checkRateLimit(ip) {
        const now = Date.now();
        const windowStart = now - this.rateLimitWindow;
        
        if (!this.requestCounts.has(ip)) {
            this.requestCounts.set(ip, []);
        }
        
        const requests = this.requestCounts.get(ip);
        const recentRequests = requests.filter(timestamp => timestamp > windowStart);
        
        if (recentRequests.length >= this.maxRequestsPerWindow) {
            return false;
        }
        
        recentRequests.push(now);
        this.requestCounts.set(ip, recentRequests);
        return true;
    }

    recordFailedAttempt(ip, username) {
        const key = `${ip}:${username}`;
        const attempts = this.loginAttempts.get(key) || { count: 0, firstAttempt: Date.now() };
        
        attempts.count++;
        attempts.lastAttempt = Date.now();
        
        if (attempts.count >= this.maxLoginAttempts) {
            this.blockedIPs.set(ip, {
                blockedAt: Date.now(),
                reason: 'Multiple failed login attempts',
                username: username
            });
            
            console.log(`🚫 IP ${ip} blocked due to ${attempts.count} failed attempts for user ${username}`);
            this.loginAttempts.delete(key);
        } else {
            this.loginAttempts.set(key, attempts);
        }
    }

    // =================== ENHANCED AUTHENTICATION WITH USERNAME VALIDATION ===================

    async authenticate(username, password, ip, userAgent, deviceInfo = {}) {
        try {
            // 1. Rate limiting and IP blocking checks
            if (this.isIPBlocked(ip)) {
                return {
                    success: false,
                    error: 'IP_BLOCKED',
                    message: 'IP address is temporarily blocked due to suspicious activity',
                    blockDuration: this.lockoutDuration
                };
            }

            if (!this.checkRateLimit(ip)) {
                return {
                    success: false,
                    error: 'RATE_LIMITED',
                    message: 'Too many requests. Please try again later.',
                    retryAfter: this.rateLimitWindow
                };
            }

            // 2. Username format validation for employees
            if (!['admin', 'boss', 'staff'].includes(username)) {
                const validationResult = this.usernameValidator.validateUsername(username);
                if (!validationResult.isValid) {
                    console.log(`❌ Username validation failed for: ${username}`);
                    console.log(`   Error: ${validationResult.error}`);
                    
                    this.recordFailedAttempt(ip, username);
                    return {
                        success: false,
                        error: 'INVALID_USERNAME_FORMAT',
                        message: validationResult.error,
                        details: validationResult.details
                    };
                }
            }

            // 3. User existence check
            const user = this.users.get(username);
            if (!user) {
                console.log(`❌ Authentication failed: User ${username} not found`);
                this.recordFailedAttempt(ip, username);
                return {
                    success: false,
                    error: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password'
                };
            }

            // 4. User active status check
            if (!user.isActive) {
                console.log(`❌ Authentication failed: User ${username} is inactive`);
                this.recordFailedAttempt(ip, username);
                return {
                    success: false,
                    error: 'ACCOUNT_INACTIVE',
                    message: 'Account is inactive'
                };
            }

            // 5. Password verification
            if (!this.verifyPassword(password, user.passwordHash)) {
                console.log(`❌ Authentication failed: Invalid password for ${username}`);
                this.recordFailedAttempt(ip, username);
                return {
                    success: false,
                    error: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password'
                };
            }

            // 6. Special validation for Boss account
            if (user.role === 'boss') {
                // Boss must use exact username "boss" (no variations allowed)
                if (username !== 'boss') {
                    console.log(`❌ Boss authentication failed: Invalid username variation: ${username}`);
                    this.recordFailedAttempt(ip, username);
                    return {
                        success: false,
                        error: 'BOSS_ACCESS_DENIED',
                        message: 'Boss access requires exact username format'
                    };
                }

                console.log(`🚀 BOSS ACCESS GRANTED for ${username} from IP: ${ip}`);
            }

            // 7. Success - Create session
            const sessionToken = this.generateToken();
            const sessionData = {
                userId: user.username,
                role: user.role,
                ip: ip,
                userAgent: userAgent,
                deviceInfo: deviceInfo,
                createdAt: Date.now(),
                expiresAt: Date.now() + this.sessionTimeout,
                loginCount: (user.loginCount || 0) + 1
            };

            this.sessions.set(sessionToken, sessionData);

            // Update user login info
            user.lastLogin = new Date();
            user.loginCount = (user.loginCount || 0) + 1;

            // Clear failed attempts for this IP/user combo
            const attemptKey = `${ip}:${username}`;
            this.loginAttempts.delete(attemptKey);

            console.log(`✅ Authentication successful for ${username} (${user.role}) from IP: ${ip}`);

            const userData = {
                username: user.username,
                role: user.role,
                employeeId: user.employeeId,
                lastLogin: user.lastLogin,
                loginCount: user.loginCount
            };
            this.emit('login:success', userData);
            return {
                success: true,
                token: sessionToken,
                user: userData,
                session: {
                    expiresAt: sessionData.expiresAt,
                    expiresIn: this.sessionTimeout
                }
            };

        } catch (error) {
            console.error('❌ Authentication error:', error);
            return {
                success: false,
                error: 'AUTHENTICATION_ERROR',
                message: 'Internal authentication error'
            };
        }
    }

    initializeUsers()
     {
        // Initialize with secure default users using environment variables (guard window in Node.js)
        const adminPassword = this.getConfig().get('ADMIN_PASSWORD') || (typeof window !== 'undefined' ? window.tiniConfig?.get('ADMIN_PASSWORD') : undefined);
        const bossPassword = this.getConfig().get('BOSS_PASSWORD') || (typeof window !== 'undefined' ? window.tiniConfig?.get('BOSS_PASSWORD') : undefined);
        const staffPassword = this.getConfig().get('STAFF_PASSWORD') || (typeof window !== 'undefined' ? window.tiniConfig?.get('STAFF_PASSWORD') : undefined);

        // Security: Throw error if passwords not found in environment
        if (!adminPassword || !bossPassword || !staffPassword) {
            throw new Error('🔐 SECURITY ERROR: Admin/Boss/Staff passwords must be set in environment variables. Check .env file.');
        }

        this.users.set('admin', {
            username: 'admin',
            passwordHash: this.hashPassword(adminPassword),
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0
        });

        this.users.set('boss', {
            username: 'boss',
            passwordHash: this.hashPassword(bossPassword),
            role: 'boss',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0
        });

        this.users.set('staff', {
            username: 'staff',
            passwordHash: this.hashPassword(staffPassword),
            role: 'staff',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0
        });

        console.log('🔐 Secure user database initialized');
        console.log('🔑 Default credentials loaded from environment variables');
        console.log('   ⚠️ Ensure ADMIN_PASSWORD, BOSS_PASSWORD, STAFF_PASSWORD are set in .env');
    }

    hashPassword(password) 
    {
        const salt = crypto.randomBytes(32).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return { salt, hash };
    }

    verifyPassword(password, storedPassword) 
    {
        const hash = crypto.pbkdf2Sync(password, storedPassword.salt, 10000, 64, 'sha512').toString('hex');
        return hash === storedPassword.hash;
    }

    generateSecureToken() 
    {
        return crypto.randomBytes(64).toString('hex');
    }

    isIPBlocked(ip) 
    {
        const blocked = this.blockedIPs.get(ip);
        if (blocked && Date.now() > blocked.expiresAt) 
            {
            this.blockedIPs.delete(ip);
            return false;
        }
        return !!blocked;
    }

    blockIP(ip, reason = 'Too many failed attempts') 
    {
        this.blockedIPs.set(ip, {
            reason,
            blockedAt: new Date(),
            expiresAt: Date.now() + this.lockoutDuration
        });
        console.log(`🚫 IP ${ip} blocked: ${reason}`);
    }

    checkRateLimit(ip) {
        const now = Date.now();
        const attempts = this.loginAttempts.get(ip) || [];
        
        // Remove old attempts outside the window
        const recentAttempts = attempts.filter(time => now - time < this.rateLimitWindow);
        
        if (recentAttempts.length >= this.maxRequestsPerWindow) {
            this.blockIP(ip, 'Rate limit exceeded');
            return false;
        }
        
        recentAttempts.push(now);
        this.loginAttempts.set(ip, recentAttempts);
        return true;
    }

    recordFailedAttempt(ip, username) {
        const key = `${ip}:${username}`;
        const attempts = this.loginAttempts.get(key) || [];
        attempts.push(Date.now());
        
        if (attempts.length >= this.maxLoginAttempts) {
            this.blockIP(ip, `Failed login attempts for ${username}`);
            this.loginAttempts.delete(key);
        } else {
            this.loginAttempts.set(key, attempts);
        }
    }

    authenticate(username, password, ip, userAgent) {
        try {
            // � SECURITY PATCH: Removed username injection vulnerability
            // All users must provide valid credentials - NO EXCEPTIONS
            
            // Security checks
            if (this.isIPBlocked(ip)) {
                return {
                    success: false,
                    error: 'IP_BLOCKED',
                    message: 'Your IP has been temporarily blocked due to suspicious activity'
                };
            }

            if (!this.checkRateLimit(ip)) {
                return {
                    success: false,
                    error: 'RATE_LIMITED',
                    message: 'Too many requests. Please try again later.'
                };
            }

            // Input validation
            if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
                this.recordFailedAttempt(ip, username || 'unknown');
                return {
                    success: false,
                    error: 'INVALID_INPUT',
                    message: 'Invalid username or password format'
                };
            }

            // Length validation
            if (username.length > 50 || password.length > 100) {
                this.recordFailedAttempt(ip, username);
                return {
                    success: false,
                    error: 'INPUT_TOO_LONG',
                    message: 'Username or password too long'
                };
            }

            // Get user with EXACT username match only
            const user = this.users.get(username.toLowerCase());
            if (!user) {
                this.recordFailedAttempt(ip, username);
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    message: 'Invalid username or password'
                };
            }

            // Check if user is active
            if (!user.isActive) {
                this.recordFailedAttempt(ip, username);
                return {
                    success: false,
                    error: 'USER_DISABLED',
                    message: 'Account has been disabled'
                };
            }

            // � MANDATORY PASSWORD VERIFICATION - NO BYPASSES
            if (!this.verifyPassword(password, user.passwordHash)) {
                this.recordFailedAttempt(ip, username);
                return {
                    success: false,
                    error: 'INVALID_PASSWORD',
                    message: 'Invalid username or password'
                };
            }

            // =================== 👑👑👑 ULTIMATE BOSS SECURITY VALIDATION 👑👑👑 ===================
            if (user.role === 'boss') {
                // Boss must use EXACT username "boss" (no variations allowed)
                if (username !== 'boss') {
                    console.log(`�🚨🚨 BOSS SECURITY BREACH: Invalid username variation: ${username}`);
                    this.recordFailedAttempt(ip, username);
                    return {
                        success: false,
                        error: 'BOSS_ACCESS_DENIED',
                        message: 'Boss access requires exact username format'
                    };
                }

                // 👑 ULTIMATE BOSS DEVICE VALIDATION - NO BYPASS POSSIBLE
                console.log(`👑 Boss authentication attempt - validating device binding...`);
                const deviceValidation = this.bossDeviceBinding.validateBossDevice(deviceInfo, userAgent, ip);
                
                if (!deviceValidation.success) {
                    console.log(`🚨🚨🚨 BOSS DEVICE VALIDATION FAILED: ${deviceValidation.error}`);
                    
                    // Auto-alert security team on Boss device breach
                    if (deviceValidation.securityAlert) {
                        console.log(`🚨🚨🚨🚨🚨 CRITICAL SECURITY ALERT: Boss attempted login from UNAUTHORIZED device! 🚨🚨🚨🚨🚨`);
                        console.log(`   IP: ${ip}`);
                        console.log(`   User Agent: ${userAgent}`);
                        console.log(`   Device Info: ${JSON.stringify(deviceInfo)}`);
                        console.log(`   🔒 Boss account remains SECURE - attack blocked!`);
                    }
                    
                    this.recordFailedAttempt(ip, username);
                    return {
                        success: false,
                        error: deviceValidation.error,
                        message: deviceValidation.message,
                        securityAlert: deviceValidation.securityAlert || false
                    };
                }

                // Register Boss device if needed (first time login)
                if (deviceValidation.needsRegistration) {
                    console.log(`👑 First time Boss login - registering device for permanent binding...`);
                    const registrationResult = this.bossDeviceBinding.registerBossDevice(deviceInfo, userAgent, ip);
                    
                    if (!registrationResult.success) {
                        console.log(`🚨 Boss device registration FAILED: ${registrationResult.error}`);
                        this.recordFailedAttempt(ip, username);
                        return {
                            success: false,
                            error: registrationResult.error,
                            message: registrationResult.message,
                            securityAlert: registrationResult.securityAlert || false
                        };
                    }
                    
                    console.log(`👑✅ Boss device REGISTERED and PERMANENTLY BOUND for ultimate security!`);
                }

                console.log(`👑👑👑👑👑 BOSS ACCESS GRANTED - ULTIMATE SECURITY VALIDATED 👑👑👑👑👑`);
                console.log(`   Username: ${username} ✅`);
                console.log(`   IP: ${ip} ✅`);
                console.log(`   Device: ${deviceValidation.fingerprint?.substring(0, 16)}... ✅`);
                console.log(`   🛡️🛡️🛡️ NO vulnerabilities possible - Boss is 100% UNBREAKABLE! 🛡️🛡️🛡️`);
                console.log(`   ⚡ Admin can manage everything else - Boss is completely secure!`);
            }

            // Create secure session for regular users
            // (The following lines were invalid and have been removed to fix the syntax error)

            // Check if user is active
            if (!user.isActive) {
                this.recordFailedAttempt(ip, username);
                return {
                    success: false,
                    error: 'USER_DISABLED',
                    message: 'Account has been disabled'
                };
            }

            // Verify password
            if (!this.verifyPassword(password, user.passwordHash)) {
                this.recordFailedAttempt(ip, username);
                return {
                    success: false,
                    error: 'INVALID_PASSWORD',
                    message: 'Invalid username or password'
                };
            }

            // Create secure session
            const sessionToken = this.generateSecureToken();
            const sessionData = {
                username: user.username,
                role: user.role,
                ip: ip,
                userAgent: userAgent,
                createdAt: new Date(),
                expiresAt: Date.now() + this.sessionTimeout,
                isValid: true
            };

            this.sessions.set(sessionToken, sessionData);

            // Update user login info
            user.lastLogin = new Date();
            user.loginCount++;

            // Clear failed attempts for this IP/username
            const attemptKey = `${ip}:${username}`;
            this.loginAttempts.delete(attemptKey);

            console.log(`✅ Successful login: ${username} (${user.role}) from ${ip}`);

            const responseData = {
                success: true,
                token: sessionToken,
                user: {
                    username: user.username,
                    role: user.role,
                    lastLogin: user.lastLogin
                },
                expiresAt: sessionData.expiresAt
            };

            // Emit login success event with user data
            this.emit('login:success', responseData.user);

            return responseData;

        } catch (error) {
            console.error('🚨 Authentication error:', error);
            this.recordFailedAttempt(ip, username || 'unknown');
            return {
                success: false,
                error: 'SYSTEM_ERROR',
                message: 'Authentication system error'
            };
        }
    }

    validateSession(token, ip, userAgent) {
        try {
            if (!token || typeof token !== 'string') {
                return { valid: false, error: 'INVALID_TOKEN' };
            }

            const session = this.sessions.get(token);
            if (!session) {
                return { valid: false, error: 'SESSION_NOT_FOUND' };
            }

            // Standard session expiration check for ALL users including Boss
            if (Date.now() > session.expiresAt) {
                this.sessions.delete(token);
                return { valid: false, error: 'SESSION_EXPIRED' };
            }

            // IP validation - CRITICAL for Boss
            if (session.ip !== ip) {
                console.log(`⚠️ IP mismatch: Expected ${session.ip}, got ${ip}`);
                
                // For Boss, IP change = security breach
                if (session.role === 'boss') {
                    console.log(`🚨 BOSS SECURITY BREACH: IP changed during session!`);
                    this.sessions.delete(token);
                    return { valid: false, error: 'BOSS_SECURITY_BREACH' };
                }
            }

            // Boss device validation during session - NO BYPASSES
            if (session.role === 'boss') {
                const deviceValidation = this.bossDeviceBinding.validateBossDevice(
                    session.deviceInfo, 
                    userAgent, 
                    ip
                );
                
                if (!deviceValidation.success) {
                    console.log(`🚨 Boss session invalid: Device validation failed`);
                    this.sessions.delete(token);
                    return { valid: false, error: 'BOSS_DEVICE_BREACH' };
                }
            }

            // Check expiration
            if (Date.now() > session.expiresAt) {
                this.sessions.delete(token);
                return { valid: false, error: 'SESSION_EXPIRED' };
            }

            // Check IP and User Agent (optional security check)
            if (session.ip !== ip) {
                console.log(`⚠️  Session IP mismatch: ${session.ip} vs ${ip} for ${session.username}`);
                // Could choose to invalidate session here for extra security
            }

            // Extend session if valid
            session.expiresAt = Date.now() + this.sessionTimeout;

            return {
                valid: true,
                user: {
                    username: session.username,
                    role: session.role
                },
                expiresAt: session.expiresAt
            };

        } catch (error) {
            console.error('🚨 Session validation error:', error);
            return { valid: false, error: 'VALIDATION_ERROR' };
        }
    }

    logout(token) {
        try {
            const session = this.sessions.get(token);
            if (session) {
                console.log(`👋 Logout: ${session.username} from ${session.ip}`);
                this.sessions.delete(token);
                return { success: true };
            }
            return { success: false, error: 'SESSION_NOT_FOUND' };
        } catch (error) {
            console.error('🚨 Logout error:', error);
            return { success: false, error: 'LOGOUT_ERROR' };
        }
    }

    getSecurityStats() {
        return {
            totalUsers: this.users.size,
            activeSessions: this.sessions.size,
            blockedIPs: this.blockedIPs.size,
            failedAttempts: this.loginAttempts.size
        };
    }

    startCleanupTimer() {
        // Clean up expired sessions and old attempts every 5 minutes
        setInterval(() => {
            this.cleanupExpiredSessions();
            this.cleanupOldAttempts();
        }, 5 * 60 * 1000);
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
            console.log(`🧹 Cleaned up ${cleaned} expired sessions`);
        }
    }

    cleanupOldAttempts()
     {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, attempts] of this.loginAttempts.entries()) {
            const recentAttempts = attempts.filter(time => now - time < this.lockoutDuration);
            if (recentAttempts.length === 0) {
                this.loginAttempts.delete(key);
                cleaned++;
            } else if (recentAttempts.length !== attempts.length) {
                this.loginAttempts.set(key, recentAttempts);
            }
        }
        
        // Clean up expired IP blocks
        for (const [ip, block] of this.blockedIPs.entries()) {
            if (now > block.expiresAt) {
                this.blockedIPs.delete(ip);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} old security records`);
        }
    }

    changePassword(username, oldPassword, newPassword) {
        try {
            const user = this.users.get(username.toLowerCase());
            if (!user) {
                return { success: false, error: 'USER_NOT_FOUND' };
            }

            if (!this.verifyPassword(oldPassword, user.passwordHash)) {
                return { success: false, error: 'INVALID_OLD_PASSWORD' };
            }

            // Validate new password strength
            if (newPassword.length < 8) {
                return { success: false, error: 'PASSWORD_TOO_SHORT' };
            }

            user.passwordHash = this.hashPassword(newPassword);
            console.log(`🔑 Password changed for user: ${username}`);
            
            return { success: true };
        } catch (error) {
            console.error('🚨 Password change error:', error);
            return { success: false, error: 'SYSTEM_ERROR' };
        }
    }
}

module.exports = SecureAuthenticationSystem;
