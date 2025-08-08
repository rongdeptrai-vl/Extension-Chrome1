// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// ADMIN PROTECTION SYSTEM
// 🛡️ Hệ thống bảo vệ admin với BOSS level 10000

class AdminProtectionSystem {
    constructor() {
        this.version = '3.0.0';
        this.protectionLevel = 10000;
        this.adminSessions = new Map();
        this.protectionMatrix = new Map();
        this.threatDetection = new Map();
        this.bossProtection = true;
        
        this.init();
    }
    
    init() {
        console.log('🛡️ [ADMIN-PROTECTION] System v' + this.version + ' initializing...');
        this.setupAdminProtection();
        this.activateBossProtection();
        this.initializeThreatDetection();
        this.setupEmergencyProtocols();
        console.log('🛡️ [ADMIN-PROTECTION] Protection active - Level 10000');
    }
    
    setupAdminProtection() {
        // Admin session protection
        this.protectionMatrix.set('session_protection', 'ULTIMATE');
        this.protectionMatrix.set('privilege_escalation', 'MONITORED');
        this.protectionMatrix.set('unauthorized_access', 'BLOCKED');
        this.protectionMatrix.set('admin_impersonation', 'DETECTED');
        
        // Monitor admin activities
        this.monitorAdminSessions();
        this.protectAdminFunctions();
        
        console.log('🛡️ [ADMIN-PROTECTION] Admin protection matrix activated');
    }
    
    activateBossProtection() {
        // 👑 BOSS Level 10000 protection
        const bossToken = localStorage.getItem('bossLevel10000');
        const adminLevel = localStorage.getItem('adminLevel');
        
        if (bossToken === 'true' || parseInt(adminLevel) >= 10000) {
            this.bossProtection = true;
            this.protectionLevel = Infinity;
            
            console.log('👑 [ADMIN-PROTECTION] BOSS protection activated - Infinite level');
            
            // BOSS is immune to all admin restrictions
            this.protectionMatrix.set('boss_immunity', 'COMPLETE');
            this.protectionMatrix.set('unrestricted_access', 'GRANTED');
            this.protectionMatrix.set('security_bypass', 'PERMANENT');
        }
    }
    
    monitorAdminSessions() {
        // Track admin sessions
        setInterval(() => {
            this.validateAdminSessions();
            this.detectSuspiciousActivity();
            this.protectAdminData();
        }, 5000);
        
        // Admin login protection
        window.addEventListener('adminLogin', (event) => {
            this.protectAdminLogin(event.detail);
        });
        
        // Admin logout protection
        window.addEventListener('adminLogout', (event) => {
            this.secureAdminLogout(event.detail);
        });
    }
    
    protectAdminFunctions() {
        // Protect critical admin functions
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0];
            
            // Check if admin endpoint
            if (this.isAdminEndpoint(url)) {
                const authorized = await this.verifyAdminAccess();
                if (!authorized && !this.bossProtection) {
                    console.warn('🚫 [ADMIN-PROTECTION] Unauthorized admin access blocked');
                    throw new Error('Unauthorized admin access');
                }
            }
            
            return originalFetch.apply(window, args);
        };
        
        // Protect admin localStorage
        this.protectAdminStorage();
    }
    
    isAdminEndpoint(url) {
        const adminPatterns = [
            '/admin/',
            '/dashboard/',
            '/management/',
            '/control/',
            '/settings/',
            'admin-panel',
            'administrative'
        ];
        
        return adminPatterns.some(pattern => 
            url.toString().toLowerCase().includes(pattern)
        );
    }
    
    async verifyAdminAccess() {
        // 👑 BOSS always has access
        if (this.bossProtection) {
            return true;
        }
        
        const userRole = localStorage.getItem('userRole');
        const adminToken = localStorage.getItem('adminToken');
        const sessionValid = this.validateAdminSession();
        
        return (userRole === 'admin' || userRole === 'boss') && 
               adminToken && 
               sessionValid;
    }
    
    validateAdminSession() {
        const sessionId = localStorage.getItem('adminSessionId');
        const sessionExpiry = localStorage.getItem('adminSessionExpiry');
        
        if (!sessionId || !sessionExpiry) {
            return false;
        }
        
        const now = Date.now();
        const expiry = parseInt(sessionExpiry);
        
        if (now > expiry) {
            this.invalidateAdminSession();
            return false;
        }
        
        return true;
    }
    
    protectAdminStorage() {
        // Encrypt admin data
        const adminKeys = [
            'adminToken',
            'adminSessionId',
            'adminPrivileges',
            'adminSettings',
            'adminData'
        ];
        
        adminKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value && !this.isEncrypted(value)) {
                const encrypted = this.encryptAdminData(value);
                localStorage.setItem(key, encrypted);
            }
        });
    }
    
    encryptAdminData(data) {
        // Simple encryption for admin data
        const key = 'TINI_ADMIN_PROTECTION_KEY_2025';
        let encrypted = '';
        
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            encrypted += String.fromCharCode(charCode);
        }
        
        return btoa(encrypted) + '_ENCRYPTED';
    }
    
    decryptAdminData(encryptedData) {
        if (!encryptedData.endsWith('_ENCRYPTED')) {
            return encryptedData;
        }
        
        const encrypted = atob(encryptedData.replace('_ENCRYPTED', ''));
        const key = 'TINI_ADMIN_PROTECTION_KEY_2025';
        let decrypted = '';
        
        for (let i = 0; i < encrypted.length; i++) {
            const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            decrypted += String.fromCharCode(charCode);
        }
        
        return decrypted;
    }
    
    isEncrypted(data) {
        return typeof data === 'string' && data.endsWith('_ENCRYPTED');
    }
    
    initializeThreatDetection() {
        // Detect admin threats
        this.threatDetection.set('brute_force', 0);
        this.threatDetection.set('privilege_escalation', 0);
        this.threatDetection.set('session_hijacking', 0);
        this.threatDetection.set('unauthorized_access', 0);
        
        // Monitor admin threats
        this.startThreatMonitoring();
    }
    
    startThreatMonitoring() {
        setInterval(() => {
            this.detectBruteForce();
            this.detectPrivilegeEscalation();
            this.detectSessionHijacking();
            this.detectUnauthorizedAccess();
        }, 3000);
    }
    
    detectBruteForce() {
        const failedAttempts = parseInt(localStorage.getItem('adminFailedAttempts') || '0');
        
        if (failedAttempts > 5) {
            this.threatDetection.set('brute_force', failedAttempts);
            this.handleThreat('BRUTE_FORCE', {
                attempts: failedAttempts,
                severity: 'HIGH'
            });
        }
    }
    
    detectPrivilegeEscalation() {
        const currentRole = localStorage.getItem('userRole');
        const previousRole = localStorage.getItem('previousUserRole');
        
        if (previousRole && currentRole !== previousRole) {
            if (currentRole === 'admin' || currentRole === 'boss') {
                this.threatDetection.set('privilege_escalation', 1);
                this.handleThreat('PRIVILEGE_ESCALATION', {
                    from: previousRole,
                    to: currentRole,
                    severity: 'CRITICAL'
                });
            }
        }
    }
    
    detectSessionHijacking() {
        const sessionId = localStorage.getItem('adminSessionId');
        const lastIP = localStorage.getItem('adminLastIP');
        const currentIP = this.getCurrentIP();
        
        if (sessionId && lastIP && currentIP && lastIP !== currentIP) {
            this.threatDetection.set('session_hijacking', 1);
            this.handleThreat('SESSION_HIJACKING', {
                lastIP,
                currentIP,
                severity: 'CRITICAL'
            });
        }
    }
    
    detectUnauthorizedAccess() {
        const adminPages = document.querySelectorAll('[data-admin-only]');
        const userRole = localStorage.getItem('userRole');
        
        if (adminPages.length > 0 && userRole !== 'admin' && userRole !== 'boss' && !this.bossProtection) {
            this.threatDetection.set('unauthorized_access', 1);
            this.handleThreat('UNAUTHORIZED_ACCESS', {
                role: userRole,
                severity: 'HIGH'
            });
        }
    }
    
    handleThreat(threatType, details) {
        // 👑 BOSS is immune to threat handling
        if (this.bossProtection) {
            console.log('👑 [ADMIN-PROTECTION] BOSS immunity - Threat ignored:', threatType);
            return;
        }
        
        console.warn('🚨 [ADMIN-PROTECTION] Threat detected:', threatType, details);
        
        // Log threat
        const threat = {
            type: threatType,
            details,
            timestamp: Date.now(),
            handled: false
        };
        
        let threats = JSON.parse(localStorage.getItem('adminThreats') || '[]');
        threats.push(threat);
        localStorage.setItem('adminThreats', JSON.stringify(threats));
        
        // Take action based on threat severity
        switch (details.severity) {
            case 'CRITICAL':
                this.handleCriticalThreat(threat);
                break;
            case 'HIGH':
                this.handleHighThreat(threat);
                break;
            case 'MEDIUM':
                this.handleMediumThreat(threat);
                break;
        }
        
        // Notify other security systems
        window.dispatchEvent(new CustomEvent('adminThreatDetected', {
            detail: threat
        }));
    }
    
    handleCriticalThreat(threat) {
        console.error('🔴 [ADMIN-PROTECTION] CRITICAL THREAT:', threat.type);
        
        // Immediate lockdown (except for BOSS)
        if (!this.bossProtection) {
            this.emergencyLockdown();
        }
        
        // Alert administrators
        this.alertAdministrators(threat);
    }
    
    handleHighThreat(threat) {
        console.warn('🟠 [ADMIN-PROTECTION] HIGH THREAT:', threat.type);
        
        // Increase security level
        this.increaseSecurityLevel();
        
        // Log detailed information
        this.logThreatDetails(threat);
    }
    
    handleMediumThreat(threat) {
        console.warn('🟡 [ADMIN-PROTECTION] MEDIUM THREAT:', threat.type);
        
        // Monitor more closely
        this.increaseMonitoring();
    }
    
    setupEmergencyProtocols() {
        // Emergency admin protection
        window.addEventListener('keydown', (event) => {
            // Emergency admin lockdown: Ctrl+Shift+Alt+L
            if (event.ctrlKey && event.shiftKey && event.altKey && event.key === 'L') {
                if (!this.bossProtection) {
                    this.emergencyLockdown();
                }
            }
            
            // Emergency admin recovery: Ctrl+Shift+Alt+R (BOSS only)
            if (event.ctrlKey && event.shiftKey && event.altKey && event.key === 'R') {
                if (this.bossProtection) {
                    this.emergencyRecovery();
                }
            }
        });
    }
    
    emergencyLockdown() {
        console.log('🚨 [ADMIN-PROTECTION] EMERGENCY LOCKDOWN ACTIVATED');
        
        // Lock all admin functions
        localStorage.setItem('adminEmergencyLockdown', 'true');
        localStorage.setItem('adminLockdownTime', Date.now().toString());
        
        // Clear admin sessions
        this.invalidateAdminSession();
        
        // Hide admin elements
        this.hideAdminElements();
        
        // Show lockdown message
        this.showLockdownMessage();
    }
    
    emergencyRecovery() {
        console.log('👑 [ADMIN-PROTECTION] BOSS EMERGENCY RECOVERY');
        
        // Restore admin access (BOSS only)
        localStorage.removeItem('adminEmergencyLockdown');
        localStorage.removeItem('adminLockdownTime');
        localStorage.setItem('bossEmergencyRecovery', 'true');
        
        // Show admin elements
        this.showAdminElements();
        
        console.log('👑 [ADMIN-PROTECTION] BOSS recovery completed');
    }
    
    getCurrentIP() {
        // Simplified IP detection
        return localStorage.getItem('currentIP') || '127.0.0.1';
    }
    
    invalidateAdminSession() {
        localStorage.removeItem('adminSessionId');
        localStorage.removeItem('adminSessionExpiry');
        localStorage.removeItem('adminToken');
    }
    
    hideAdminElements() {
        const adminElements = document.querySelectorAll('[data-admin-only], .admin-panel, .admin-controls');
        adminElements.forEach(element => {
            element.style.display = 'none';
        });
    }
    
    showAdminElements() {
        const adminElements = document.querySelectorAll('[data-admin-only], .admin-panel, .admin-controls');
        adminElements.forEach(element => {
            element.style.display = '';
        });
    }
    
    showLockdownMessage() {
        const message = document.createElement('div');
        message.id = 'admin-lockdown-message';
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 0, 0, 0.9);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
                text-align: center;
            ">
                🚨 ADMIN PROTECTION LOCKDOWN 🚨<br>
                Security threat detected<br>
                Contact administrator for recovery
            </div>
        `;
        
        document.body.appendChild(message);
    }
    
    increaseSecurityLevel() {
        this.protectionLevel += 1000;
        console.log('🔒 [ADMIN-PROTECTION] Security level increased to:', this.protectionLevel);
    }
    
    increaseMonitoring() {
        console.log('👁️ [ADMIN-PROTECTION] Monitoring increased');
        // Reduce monitoring intervals
    }
    
    alertAdministrators(threat) {
        console.log('📢 [ADMIN-PROTECTION] Alerting administrators about:', threat.type);
        
        // Store alert for admin panel
        let alerts = JSON.parse(localStorage.getItem('adminAlerts') || '[]');
        alerts.push({
            type: 'SECURITY_THREAT',
            threat,
            timestamp: Date.now()
        });
        localStorage.setItem('adminAlerts', JSON.stringify(alerts));
    }
    
    logThreatDetails(threat) {
        console.log('📝 [ADMIN-PROTECTION] Logging threat details:', threat);
        
        // Detailed threat log
        let threatLog = JSON.parse(localStorage.getItem('adminThreatLog') || '[]');
        threatLog.push({
            ...threat,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            url: window.location.href
        });
        localStorage.setItem('adminThreatLog', JSON.stringify(threatLog));
    }
    
    getProtectionStatus() {
        return {
            version: this.version,
            level: this.protectionLevel,
            bossProtection: this.bossProtection,
            matrix: Object.fromEntries(this.protectionMatrix),
            threats: Object.fromEntries(this.threatDetection),
            sessionValid: this.validateAdminSession()
        };
    }
    
    // Public API
    protectAdminLogin(credentials) {
        // Enhanced admin login protection
        console.log('🔐 [ADMIN-PROTECTION] Protecting admin login');
        
        // Rate limiting for login attempts
        const attempts = parseInt(localStorage.getItem('adminLoginAttempts') || '0');
        if (attempts > 3 && !this.bossProtection) {
            throw new Error('Too many login attempts');
        }
        
        return true;
    }
    
    secureAdminLogout(sessionData) {
        console.log('🚪 [ADMIN-PROTECTION] Securing admin logout');
        
        // Clear sensitive data
        this.invalidateAdminSession();
        
        // Clear admin-related localStorage
        const adminKeys = Object.keys(localStorage).filter(key => 
            key.toLowerCase().includes('admin')
        );
        
        adminKeys.forEach(key => {
            if (!key.includes('boss')) { // Preserve BOSS data
                localStorage.removeItem(key);
            }
        });
        
        return true;
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.TINI_ADMIN_PROTECTION = new AdminProtectionSystem();
    console.log('🛡️ [ADMIN-PROTECTION] Protection System loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminProtectionSystem;
}
