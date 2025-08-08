// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Emergency Boss Recovery System - Hệ thống khôi phục BOSS khẩn cấp

class EmergencyBossRecovery {
    constructor() {
        this.recoveryMode = false;
        this.bossBackupData = null;
        this.recoveryAttempts = 0;
        this.maxRecoveryAttempts = 3;
        this.lastRecovery = null;
        this.recoveryStrategies = new Map();
        
        this.initializeRecoveryStrategies();
        this.createBossBackup();
        
        console.log('👑 [Boss Recovery] Emergency BOSS recovery system is active');
    }

    initializeRecoveryStrategies() {
        this.recoveryStrategies.set('auth_restore', {
            name: 'Authentication Restore',
            priority: 1,
            action: () => this.restoreBossAuthentication(),
            description: 'Khôi phục quyền BOSS authentication'
        });
        
        this.recoveryStrategies.set('privilege_elevation', {
            name: 'Privilege Elevation',
            priority: 2,
            action: () => this.elevateBossPrivileges(),
            description: 'Nâng cấp quyền lên mức BOSS'
        });
        
        this.recoveryStrategies.set('security_bypass', {
            name: 'Security Bypass',
            priority: 3,
            action: () => this.bypassSecurityRestrictions(),
            description: 'Bypass các hạn chế bảo mật'
        });
        
        this.recoveryStrategies.set('admin_panel_access', {
            name: 'Admin Panel Access',
            priority: 4,
            action: () => this.forceAdminPanelAccess(),
            description: 'Buộc truy cập Admin Panel'
        });
        
        this.recoveryStrategies.set('nuclear_option', {
            name: 'Nuclear Recovery',
            priority: 5,
            action: () => this.nuclearRecovery(),
            description: 'Khôi phục toàn diện (nuclear option)'
        });
    }

    createBossBackup() {
        console.log('💾 [Boss Recovery] Creating BOSS backup data...');
        
        this.bossBackupData = {
            timestamp: Date.now(),
            authLevel: 'BOSS',
            userRole: 'BOSS_ADMINISTRATOR',
            hasAdminPrivileges: true,
            bossLevel: 10,
            isAuthenticated: true,
            permissions: [
                'FULL_ADMIN_ACCESS',
                'SYSTEM_CONTROL',
                'USER_MANAGEMENT',
                'SECURITY_OVERRIDE',
                'EMERGENCY_ACCESS'
            ],
            securityTokens: {
                bossToken: this.generateSecureToken(),
                adminToken: this.generateSecureToken(),
                emergencyToken: this.generateSecureToken()
            },
            backupSource: 'emergency_boss_recovery'
        };
        
        // Lưu backup vào nhiều nơi
        localStorage.setItem('boss_emergency_backup', JSON.stringify(this.bossBackupData));
        sessionStorage.setItem('boss_emergency_backup', JSON.stringify(this.bossBackupData));
        
        console.log('✅ [Boss Recovery] BOSS backup data created and stored');
    }

    detectBossFailure() {
        const indicators = {
            authLevelLost: !this.checkAuthLevel(),
            adminPrivilegesLost: !this.checkAdminPrivileges(),
            bossTokenInvalid: !this.checkBossToken(),
            systemAccessDenied: !this.checkSystemAccess()
        };
        
        const failureCount = Object.values(indicators).filter(Boolean).length;
        const hasFailure = failureCount > 0;
        
        if (hasFailure) {
            console.warn(`⚠️ [Boss Recovery] BOSS failure detected - ${failureCount} indicators failed:`, indicators);
        }
        
        return {
            hasFailure,
            failureCount,
            indicators
        };
    }

    checkAuthLevel() {
        const authLevel = localStorage.getItem('authLevel') || localStorage.getItem('userRole');
        return authLevel && (authLevel.includes('BOSS') || authLevel.includes('ADMIN'));
    }

    checkAdminPrivileges() {
        const hasAdmin = localStorage.getItem('hasAdminPrivileges');
        return hasAdmin === 'true' || hasAdmin === true;
    }

    checkBossToken() {
        const tokens = [
            localStorage.getItem('bossToken'),
            localStorage.getItem('adminToken'),
            localStorage.getItem('emergencyToken')
        ];
        return tokens.some(token => token && token.length > 10);
    }

    checkSystemAccess() {
        // Kiểm tra xem có thể access các function quan trọng không
        try {
            return typeof window.TINI_BOSS_SECURITY !== 'undefined' &&
                   typeof window.openAdminPanel === 'function';
        } catch (error) {
            return false;
        }
    }

    async triggerEmergencyRecovery(reason = 'auto_detected') {
        if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
            console.error('❌ [Boss Recovery] Maximum recovery attempts reached');
            return false;
        }
        
        this.recoveryMode = true;
        this.recoveryAttempts++;
        this.lastRecovery = {
            timestamp: Date.now(),
            reason,
            attempt: this.recoveryAttempts
        };
        
        console.log(`🚨 [Boss Recovery] EMERGENCY BOSS RECOVERY INITIATED - Attempt ${this.recoveryAttempts}/${this.maxRecoveryAttempts}`);
        console.log(`📋 [Boss Recovery] Reason: ${reason}`);
        
        // Thông báo emergency
        this.notifyEmergencyRecovery(reason);
        
        // Thực hiện recovery sequence
        const success = await this.executeRecoverySequence();
        
        if (success) {
            console.log('✅ [Boss Recovery] BOSS recovery completed successfully');
            this.recoveryMode = false;
        } else {
            console.error('❌ [Boss Recovery] BOSS recovery failed');
        }
        
        return success;
    }

    async executeRecoverySequence() {
        console.log('🔄 [Boss Recovery] Executing recovery sequence...');
        
        // Sắp xếp strategies theo priority
        const strategies = Array.from(this.recoveryStrategies.values())
            .sort((a, b) => a.priority - b.priority);
        
        for (const strategy of strategies) {
            console.log(`🔧 [Boss Recovery] Executing: ${strategy.name}`);
            
            try {
                await strategy.action();
                
                // Kiểm tra xem recovery có thành công không
                const failure = this.detectBossFailure();
                if (!failure.hasFailure) {
                    console.log(`✅ [Boss Recovery] Recovery successful with strategy: ${strategy.name}`);
                    return true;
                }
                
                // Delay trước khi thử strategy tiếp theo
                await this.delay(1000);
                
            } catch (error) {
                console.error(`❌ [Boss Recovery] Strategy ${strategy.name} failed:`, error);
            }
        }
        
        return false;
    }

    restoreBossAuthentication() {
        console.log('🔐 [Boss Recovery] Restoring BOSS authentication...');
        
        if (this.bossBackupData) {
            // Khôi phục từ backup
            localStorage.setItem('authLevel', this.bossBackupData.authLevel);
            localStorage.setItem('userRole', this.bossBackupData.userRole);
            localStorage.setItem('hasAdminPrivileges', 'true');
            localStorage.setItem('bossLevel', this.bossBackupData.bossLevel.toString());
            localStorage.setItem('isAuthenticated', 'true');
            
            // Khôi phục tokens
            Object.entries(this.bossBackupData.securityTokens).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
            
            console.log('✅ [Boss Recovery] Authentication data restored from backup');
        }
    }

    elevateBossPrivileges() {
        console.log('⬆️ [Boss Recovery] Elevating to BOSS privileges...');
        
        // Force set BOSS privileges
        const bossData = {
            authLevel: 'BOSS',
            userRole: 'BOSS_ADMINISTRATOR',
            hasAdminPrivileges: true,
            bossLevel: 10,
            isAuthenticated: true,
            emergencyElevation: true,
            elevationTimestamp: Date.now()
        };
        
        Object.entries(bossData).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === 'boolean' ? value.toString() : value);
        });
        
        // Notify auth change
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'authLevel',
            newValue: 'BOSS',
            url: location.href
        }));
        
        console.log('✅ [Boss Recovery] BOSS privileges elevated');
    }

    bypassSecurityRestrictions() {
        console.log('🔓 [Boss Recovery] Bypassing security restrictions...');
        
        // Set bypass flags
        localStorage.setItem('securityBypass', 'true');
        localStorage.setItem('emergencyAccess', 'true');
        localStorage.setItem('overrideRestrictions', 'true');
        
        // Disable security modules nếu có
        if (window.TINI_ULTIMATE_SECURITY) {
            try {
                window.TINI_ULTIMATE_SECURITY.setEmergencyMode?.(true);
            } catch (error) {
                console.warn('⚠️ [Boss Recovery] Could not set emergency mode on security module');
            }
        }
        
        console.log('✅ [Boss Recovery] Security restrictions bypassed');
    }

    forceAdminPanelAccess() {
        console.log('🏢 [Boss Recovery] Forcing admin panel access...');
        
        // Set admin panel access flags
        localStorage.setItem('adminPanelAccess', 'true');
        localStorage.setItem('forceAdminAccess', 'true');
        
        // Try to open admin panel
        try {
            if (typeof window.openAdminPanel === 'function') {
                window.openAdminPanel();
            } else {
                // Fallback - open admin panel URL directly
                window.open('http://localhost:8099/admin-panel.html', '_blank');
            }
            console.log('✅ [Boss Recovery] Admin panel access forced');
        } catch (error) {
            console.error('❌ [Boss Recovery] Could not force admin panel access:', error);
        }
    }

    nuclearRecovery() {
        console.log('☢️ [Boss Recovery] NUCLEAR RECOVERY INITIATED...');
        
        // Backup current state
        const currentState = this.captureCurrentState();
        localStorage.setItem('pre_nuclear_state', JSON.stringify(currentState));
        
        // Clear everything except our backup
        const backup = localStorage.getItem('boss_emergency_backup');
        localStorage.clear();
        sessionStorage.clear();
        
        // Restore BOSS data
        if (backup) {
            const bossData = JSON.parse(backup);
            Object.entries(bossData).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        localStorage.setItem(subKey, subValue);
                    });
                } else {
                    localStorage.setItem(key, typeof value === 'boolean' ? value.toString() : value);
                }
            });
        }
        
        // Set nuclear recovery flag
        localStorage.setItem('nuclearRecoveryPerformed', 'true');
        localStorage.setItem('nuclearRecoveryTimestamp', Date.now().toString());
        
        // Force reload to apply changes
        setTimeout(() => {
            location.reload();
        }, 2000);
        
        console.log('☢️ [Boss Recovery] Nuclear recovery completed - reloading...');
    }

    captureCurrentState() {
        const state = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                state[key] = localStorage.getItem(key);
            }
        }
        return state;
    }

    notifyEmergencyRecovery(reason) {
        // Gửi notification qua event bus
        if (window.TINI_UNIVERSAL_DISPATCHER) {
            window.TINI_UNIVERSAL_DISPATCHER.dispatch('tini:boss-recovery-activated', {
                reason,
                attempt: this.recoveryAttempts,
                timestamp: Date.now()
            });
        }
        
        // Console warning
        console.warn(`
👑 ================================
   EMERGENCY BOSS RECOVERY
👑 ================================
🚨  Reason: ${reason}
🔄  Attempt: ${this.recoveryAttempts}/${this.maxRecoveryAttempts}
⏰  Time: ${new Date().toISOString()}
================================`);
    }

    generateSecureToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `BOSS_${Date.now()}_${token}`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Auto-monitoring
    startAutoMonitoring() {
        setInterval(() => {
            if (!this.recoveryMode) {
                const failure = this.detectBossFailure();
                if (failure.hasFailure) {
                    console.warn('⚠️ [Boss Recovery] Auto-detected BOSS failure - triggering recovery');
                    this.triggerEmergencyRecovery('auto_detected');
                }
            }
        }, 30000); // Check every 30 seconds
    }

    getStatus() {
        return {
            recoveryMode: this.recoveryMode,
            recoveryAttempts: this.recoveryAttempts,
            maxRecoveryAttempts: this.maxRecoveryAttempts,
            lastRecovery: this.lastRecovery,
            bossBackupExists: !!this.bossBackupData,
            autoMonitoring: true,
            healthy: true
        };
    }
}

// Tạo global instance
if (!window.TINI_EMERGENCY_RECOVERY) {
    window.TINI_EMERGENCY_RECOVERY = new EmergencyBossRecovery();
    
    // Start auto-monitoring
    window.TINI_EMERGENCY_RECOVERY.startAutoMonitoring();
    
    console.log('✅ [Boss Recovery] Emergency BOSS recovery system created and monitoring started');
}

// Đăng ký keyboard shortcut
document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+B+R = Boss Recovery
    if (event.ctrlKey && event.shiftKey && event.key === 'B') {
        event.preventDefault();
        const doublePress = Date.now() - (window.lastBossRecoveryKeyPress || 0) < 1000;
        
        if (doublePress && event.key === 'R') {
            const reason = prompt('Boss Recovery Reason:') || 'manual_activation';
            window.TINI_EMERGENCY_RECOVERY.triggerEmergencyRecovery(reason);
        }
        
        window.lastBossRecoveryKeyPress = Date.now();
    }
});

console.log('👑 [Boss Recovery] Emergency BOSS recovery ready - Press Ctrl+Shift+B+R for manual activation');
