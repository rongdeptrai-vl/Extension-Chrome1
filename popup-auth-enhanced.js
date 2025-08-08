// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🔐 TINI POPUP AUTH ENHANCED v3.1
 * Enhanced authentication and security for popup interface
 * Xác thực và bảo mật nâng cao cho giao diện popup
 */

class TINIPopupAuthEnhanced {
    constructor() {
        this.version = "3.1";
        this.isAuthenticated = false;
        this.authLevel = 'none';
        this.sessionToken = null;
        this.authTimeout = null;
        this.maxAuthTime = 30 * 60 * 1000; // 30 minutes
        this.failedAttempts = 0;
        this.maxFailedAttempts = 3;
        this.lockoutTime = 5 * 60 * 1000; // 5 minutes
        
        this.initializeAuth();
    }
    
    async initializeAuth() {
        console.log(`🔐 [AUTH] Initializing Enhanced Authentication v${this.version}`);
        
        try {
            // Check existing session
            await this.checkExistingSession();
            
            // Setup authentication monitoring
            this.setupAuthMonitoring();
            
            // Setup security features
            this.setupSecurityFeatures();
            
            // Initialize biometric if available
            this.initializeBiometric();
            
            console.log('🔐 [AUTH] Authentication system initialized');
            
        } catch (error) {
            console.error('🔐 [AUTH] Initialization failed:', error);
        }
    }
    
    async checkExistingSession() {
        try {
            const result = await chrome.storage.local.get(['tiniAuthSession']);
            
            if (result.tiniAuthSession) {
                const session = result.tiniAuthSession;
                
                // Check if session is still valid
                if (this.isSessionValid(session)) {
                    this.sessionToken = session.token;
                    this.authLevel = session.level;
                    this.isAuthenticated = true;
                    
                    console.log('🔐 [AUTH] Existing session restored');
                    this.startSessionTimeout();
                    return true;
                }
            }
            
        } catch (error) {
            console.warn('🔐 [AUTH] Failed to check existing session:', error);
        }
        
        return false;
    }
    
    isSessionValid(session) {
        if (!session.token || !session.timestamp || !session.level) {
            return false;
        }
        
        const sessionAge = Date.now() - session.timestamp;
        return sessionAge < this.maxAuthTime;
    }
    
    async authenticateUser(method = 'password', credentials = null) {
        console.log(`🔐 [AUTH] Starting authentication with method: ${method}`);
        
        // Check for lockout
        if (this.isLockedOut()) {
            throw new Error('Account temporarily locked due to failed attempts');
        }
        
        try {
            let authResult = false;
            
            switch (method) {
                case 'password':
                    authResult = await this.authenticatePassword(credentials);
                    break;
                case 'pin':
                    authResult = await this.authenticatePIN(credentials);
                    break;
                case 'biometric':
                    authResult = await this.authenticateBiometric();
                    break;
                case 'emergency':
                    authResult = await this.authenticateEmergency(credentials);
                    break;
                default:
                    throw new Error('Invalid authentication method');
            }
            
            if (authResult) {
                this.onAuthenticationSuccess(method);
                this.failedAttempts = 0;
                return true;
            } else {
                this.onAuthenticationFailure(method);
                return false;
            }
            
        } catch (error) {
            console.error('🔐 [AUTH] Authentication error:', error);
            this.onAuthenticationFailure(method, error);
            throw error;
        }
    }
    
    async authenticatePassword(credentials) {
        if (!credentials || !credentials.password) {
            return false;
        }
        
        // Get stored password hash
        const result = await chrome.storage.sync.get(['tiniAuthConfig']);
        
        if (!result.tiniAuthConfig || !result.tiniAuthConfig.passwordHash) {
            // No password set, prompt for setup
            return await this.setupPassword(credentials.password);
        }
        
        // Verify password
        const passwordHash = await this.hashPassword(credentials.password);
        return passwordHash === result.tiniAuthConfig.passwordHash;
    }
    
    async authenticatePIN(credentials) {
        if (!credentials || !credentials.pin) {
            return false;
        }
        
        const result = await chrome.storage.sync.get(['tiniAuthConfig']);
        
        if (!result.tiniAuthConfig || !result.tiniAuthConfig.pinHash) {
            return await this.setupPIN(credentials.pin);
        }
        
        const pinHash = await this.hashPassword(credentials.pin);
        return pinHash === result.tiniAuthConfig.pinHash;
    }
    
    async authenticateBiometric() {
        if (!this.isBiometricAvailable()) {
            throw new Error('Biometric authentication not available');
        }
        
        try {
            // Use WebAuthn API for biometric authentication
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: new Uint8Array(32),
                    rp: {
                        name: "TINI Security Extension",
                        id: "tini-extension"
                    },
                    user: {
                        id: new Uint8Array(16),
                        name: "tini-user",
                        displayName: "TINI User"
                    },
                    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "required"
                    }
                }
            });
            
            return credential !== null;
            
        } catch (error) {
            console.warn('🔐 [AUTH] Biometric authentication failed:', error);
            return false;
        }
    }
    
    async authenticateEmergency(credentials) {
        if (!credentials || !credentials.emergencyCode) {
            return false;
        }
        
        // Emergency codes are one-time use
        const result = await chrome.storage.sync.get(['tiniAuthConfig']);
        
        if (!result.tiniAuthConfig || !result.tiniAuthConfig.emergencyCodes) {
            return false;
        }
        
        const codes = result.tiniAuthConfig.emergencyCodes;
        const codeIndex = codes.findIndex(code => code.code === credentials.emergencyCode && !code.used);
        
        if (codeIndex !== -1) {
            // Mark code as used
            codes[codeIndex].used = true;
            codes[codeIndex].usedAt = new Date().toISOString();
            
            await chrome.storage.sync.set({
                tiniAuthConfig: {
                    ...result.tiniAuthConfig,
                    emergencyCodes: codes
                }
            });
            
            return true;
        }
        
        return false;
    }
    
    async setupPassword(password) {
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        
        const passwordHash = await this.hashPassword(password);
        
        await this.updateAuthConfig({
            passwordHash: passwordHash,
            passwordSetAt: new Date().toISOString()
        });
        
        console.log('🔐 [AUTH] Password setup complete');
        return true;
    }
    
    async setupPIN(pin) {
        if (!pin || pin.length < 4) {
            throw new Error('PIN must be at least 4 digits long');
        }
        
        const pinHash = await this.hashPassword(pin);
        
        await this.updateAuthConfig({
            pinHash: pinHash,
            pinSetAt: new Date().toISOString()
        });
        
        console.log('🔐 [AUTH] PIN setup complete');
        return true;
    }
    
    async generateEmergencyCodes() {
        const codes = [];
        
        for (let i = 0; i < 10; i++) {
            codes.push({
                code: this.generateSecureCode(),
                generated: new Date().toISOString(),
                used: false
            });
        }
        
        await this.updateAuthConfig({
            emergencyCodes: codes
        });
        
        return codes.map(c => c.code);
    }
    
    generateSecureCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return code;
    }
    
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'tini-salt-2024');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    async updateAuthConfig(updates) {
        const result = await chrome.storage.sync.get(['tiniAuthConfig']);
        const currentConfig = result.tiniAuthConfig || {};
        
        await chrome.storage.sync.set({
            tiniAuthConfig: {
                ...currentConfig,
                ...updates,
                lastUpdated: new Date().toISOString()
            }
        });
    }
    
    onAuthenticationSuccess(method) {
        this.isAuthenticated = true;
        this.authLevel = this.getAuthLevel(method);
        this.sessionToken = this.generateSessionToken();
        
        // Save session
        this.saveSession();
        
        // Start session timeout
        this.startSessionTimeout();
        
        // Log success
        this.logAuthEvent('success', method);
        
        console.log(`🔐 [AUTH] Authentication successful with ${method}`);
        
        // Notify other components
        this.notifyAuthChange('authenticated', method);
    }
    
    onAuthenticationFailure(method, error = null) {
        this.failedAttempts++;
        
        // Log failure
        this.logAuthEvent('failure', method, error);
        
        console.warn(`🔐 [AUTH] Authentication failed with ${method}. Attempts: ${this.failedAttempts}`);
        
        // Check for lockout
        if (this.failedAttempts >= this.maxFailedAttempts) {
            this.initiateLocko
            ut();
        }
        
        // Notify other components
        this.notifyAuthChange('failed', method);
    }
    
    getAuthLevel(method) {
        switch (method) {
            case 'biometric':
                return 'high';
            case 'password':
                return 'medium';
            case 'pin':
                return 'medium';
            case 'emergency':
                return 'low';
            default:
                return 'none';
        }
    }
    
    generateSessionToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    async saveSession() {
        const session = {
            token: this.sessionToken,
            level: this.authLevel,
            timestamp: Date.now(),
            method: this.authLevel,
            userAgent: navigator.userAgent
        };
        
        await chrome.storage.local.set({ tiniAuthSession: session });
    }
    
    startSessionTimeout() {
        // Clear existing timeout
        if (this.authTimeout) {
            clearTimeout(this.authTimeout);
        }
        
        // Set new timeout
        this.authTimeout = setTimeout(() => {
            this.logout('timeout');
        }, this.maxAuthTime);
    }
    
    logout(reason = 'manual') {
        this.isAuthenticated = false;
        this.authLevel = 'none';
        this.sessionToken = null;
        
        // Clear timeout
        if (this.authTimeout) {
            clearTimeout(this.authTimeout);
            this.authTimeout = null;
        }
        
        // Clear session storage
        chrome.storage.local.remove(['tiniAuthSession']);
        
        // Log logout
        this.logAuthEvent('logout', reason);
        
        console.log(`🔐 [AUTH] User logged out: ${reason}`);
        
        // Notify other components
        this.notifyAuthChange('logout', reason);
    }
    
    initiateL
        ockout() {
        const lockoutUntil = Date.now() + this.lockoutTime;
        
        chrome.storage.local.set({
            tiniAuthLockout: {
                lockedAt: Date.now(),
                lockoutUntil: lockoutUntil,
                reason: 'failed_attempts'
            }
        });
        
        console.warn(`🔐 [AUTH] Account locked until ${new Date(lockoutUntil).toLocaleString()}`);
        
        // Notify lockout
        this.notifyAuthChange('lockout', 'failed_attempts');
    }
    
    async isLockedOut() {
        try {
            const result = await chrome.storage.local.get(['tiniAuthLockout']);
            
            if (result.tiniAuthLockout) {
                const lockout = result.tiniAuthLockout;
                
                if (Date.now() < lockout.lockoutUntil) {
                    return true;
                } else {
                    // Lockout expired, clear it
                    chrome.storage.local.remove(['tiniAuthLockout']);
                    return false;
                }
            }
            
        } catch (error) {
            console.warn('🔐 [AUTH] Failed to check lockout status:', error);
        }
        
        return false;
    }
    
    isBiometricAvailable() {
        return 'credentials' in navigator && 
               'create' in navigator.credentials &&
               window.PublicKeyCredential !== undefined;
    }
    
    initializeBiometric() {
        if (this.isBiometricAvailable()) {
            console.log('🔐 [AUTH] Biometric authentication available');
        } else {
            console.log('🔐 [AUTH] Biometric authentication not available');
        }
    }
    
    setupAuthMonitoring() {
        // Monitor for suspicious activity
        this.monitorFailedAttempts();
        this.monitorSessionActivity();
        this.monitorLocationChanges();
    }
    
    monitorFailedAttempts() {
        // Track failed attempts pattern
        setInterval(async () => {
            if (this.failedAttempts > 0) {
                this.logAuthEvent('monitoring', 'failed_attempts_check', {
                    attempts: this.failedAttempts,
                    timestamp: Date.now()
                });
            }
        }, 60000); // Check every minute
    }
    
    monitorSessionActivity() {
        // Monitor for session hijacking attempts
        let lastActivity = Date.now();
        
        document.addEventListener('mousedown', () => {
            lastActivity = Date.now();
        });
        
        document.addEventListener('keydown', () => {
            lastActivity = Date.now();
        });
        
        // Check for inactivity
        setInterval(() => {
            const inactiveTime = Date.now() - lastActivity;
            
            if (inactiveTime > 10 * 60 * 1000 && this.isAuthenticated) { // 10 minutes
                this.logout('inactivity');
            }
        }, 30000); // Check every 30 seconds
    }
    
    monitorLocationChanges() {
        // Monitor for suspicious location/IP changes (if available)
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.lastKnownLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    timestamp: Date.now()
                };
            });
        }
    }
    
    setupSecurityFeatures() {
        // Setup additional security features
        this.setupScreenLock();
        this.setupClipboardProtection();
        this.setupDevToolsDetection();
    }
    
    setupScreenLock() {
        // Lock screen when window loses focus (if configured)
        window.addEventListener('blur', () => {
            if (this.isAuthenticated && this.authLevel !== 'high') {
                // Optional: lock on window blur
                console.log('🔐 [AUTH] Window lost focus - security alert');
            }
        });
    }
    
    setupClipboardProtection() {
        // Monitor clipboard for sensitive data
        document.addEventListener('copy', () => {
            if (this.isAuthenticated) {
                this.logAuthEvent('security', 'clipboard_copy');
            }
        });
    }
    
    setupDevToolsDetection() {
        // Detect developer tools opening
        let devtools = {open: false, orientation: null};
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 200 || 
                window.outerWidth - window.innerWidth > 200) {
                
                if (!devtools.open) {
                    devtools.open = true;
                    console.warn('🔐 [AUTH] Developer tools detected');
                    this.logAuthEvent('security', 'devtools_detected');
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }
    
    async logAuthEvent(type, method, details = {}) {
        const event = {
            type: 'AUTH_EVENT',
            eventType: type,
            method: method,
            timestamp: new Date().toISOString(),
            sessionToken: this.sessionToken,
            authLevel: this.authLevel,
            userAgent: navigator.userAgent,
            details: details
        };
        
        // Send to background for logging
        if (chrome && chrome.runtime) {
            chrome.runtime.sendMessage(event).catch(err => {
                console.warn('🔐 [AUTH] Failed to log auth event:', err);
            });
        }
        
        console.log('🔐 [AUTH] Event logged:', event);
    }
    
    notifyAuthChange(status, method) {
        const notification = {
            type: 'AUTH_STATUS_CHANGE',
            status: status,
            method: method,
            authLevel: this.authLevel,
            timestamp: new Date().toISOString()
        };
        
        // Send to other components
        window.postMessage(notification, '*');
        
        // Send to background
        if (chrome && chrome.runtime) {
            chrome.runtime.sendMessage(notification).catch(err => {
                console.warn('🔐 [AUTH] Failed to notify auth change:', err);
            });
        }
    }
    
    // Public API
    requireAuth(level = 'medium') {
        if (!this.isAuthenticated) {
            throw new Error('Authentication required');
        }
        
        const levelValues = { none: 0, low: 1, medium: 2, high: 3 };
        
        if (levelValues[this.authLevel] < levelValues[level]) {
            throw new Error(`Higher authentication level required: ${level}`);
        }
        
        return true;
    }
    
    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated,
            authLevel: this.authLevel,
            sessionToken: this.sessionToken ? '***masked***' : null,
            timeRemaining: this.authTimeout ? 
                Math.max(0, this.maxAuthTime - (Date.now() - this.sessionStartTime)) : 0
        };
    }
    
    // Cleanup
    destroy() {
        if (this.authTimeout) {
            clearTimeout(this.authTimeout);
        }
        
        console.log('🔐 [AUTH] Authentication system destroyed');
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.tiniAuthEnhanced = new TINIPopupAuthEnhanced();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIPopupAuthEnhanced;
}

console.log('🔐 [AUTH] Enhanced authentication loaded');
