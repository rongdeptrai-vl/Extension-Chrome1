// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Emergency Escape Hatch System - Hệ thống thoát hiểm khẩn cấp

class EmergencyEscapeHatch {
    constructor() {
        this.isActive = false;
        this.escapeRoutes = new Map();
        this.emergencyContacts = new Set();
        this.activationCode = this.generateSecureCode();
        this.lastActivation = null;
        this.escapeHistory = [];
        
        this.initializeEscapeRoutes();
        console.log('🚨 [Escape Hatch] Emergency escape system is ready');
    }

    initializeEscapeRoutes() {
        // Định nghĩa các route thoát hiểm
        this.escapeRoutes.set('admin_panel', {
            url: 'http://localhost:8099/admin-panel.html',
            priority: 1,
            description: 'Admin Panel Backup Route'
        });
        
        this.escapeRoutes.set('safe_mode', {
            action: () => this.activateSafeMode(),
            priority: 2,
            description: 'Safe Mode Activation'
        });
        
        this.escapeRoutes.set('data_backup', {
            action: () => this.performEmergencyBackup(),
            priority: 3,
            description: 'Emergency Data Backup'
        });
        
        this.escapeRoutes.set('system_reset', {
            action: () => this.performSystemReset(),
            priority: 4,
            description: 'Complete System Reset'
        });
    }

    activate(reason = 'unknown', severity = 'medium') {
        console.log(`🚨 [Escape Hatch] EMERGENCY ACTIVATION - Reason: ${reason}, Severity: ${severity}`);
        
        this.isActive = true;
        this.lastActivation = {
            timestamp: Date.now(),
            reason,
            severity,
            code: this.activationCode
        };
        
        this.escapeHistory.push(this.lastActivation);
        
        // Thông báo emergency
        this.notifyEmergency(reason, severity);
        
        // Thực hiện escape sequence
        this.executeEscapeSequence(severity);
        
        return this.activationCode;
    }

    executeEscapeSequence(severity) {
        const sequences = {
            'low': ['data_backup'],
            'medium': ['data_backup', 'safe_mode'],
            'high': ['data_backup', 'safe_mode', 'admin_panel'],
            'critical': ['data_backup', 'system_reset', 'admin_panel']
        };
        
        const sequence = sequences[severity] || sequences['medium'];
        
        console.log(`🔄 [Escape Hatch] Executing escape sequence for severity: ${severity}`);
        
        sequence.forEach((routeName, index) => {
            setTimeout(() => {
                this.executeRoute(routeName);
            }, index * 2000); // 2 giây delay giữa mỗi action
        });
    }

    executeRoute(routeName) {
        const route = this.escapeRoutes.get(routeName);
        if (!route) {
            console.error(`❌ [Escape Hatch] Route ${routeName} not found`);
            return;
        }
        
        console.log(`🏃 [Escape Hatch] Executing route: ${route.description}`);
        
        try {
            if (route.url) {
                // Mở URL trong tab mới
                window.open(route.url, '_blank');
            } else if (route.action) {
                // Thực hiện action
                route.action();
            }
            
            console.log(`✅ [Escape Hatch] Route ${routeName} executed successfully`);
        } catch (error) {
            console.error(`❌ [Escape Hatch] Route ${routeName} failed:`, error);
        }
    }

    activateSafeMode() {
        console.log('🛡️ [Escape Hatch] Activating Safe Mode...');
        
        // Disable các tính năng không cần thiết
        if (window.TINI_AI_COUNTERATTACK) {
            window.TINI_AI_COUNTERATTACK.disableOffensiveMode();
        }
        
        // Lưu safe mode state
        localStorage.setItem('tini_safe_mode', 'true');
        localStorage.setItem('tini_safe_mode_timestamp', Date.now().toString());
        
        // Thông báo safe mode
        if (window.TINI_UNIVERSAL_DISPATCHER) {
            window.TINI_UNIVERSAL_DISPATCHER.dispatch('tini:safe-mode-activated', {
                timestamp: Date.now(),
                activatedBy: 'escape-hatch'
            });
        }
    }

    performEmergencyBackup() {
        console.log('💾 [Escape Hatch] Performing emergency backup...');
        
        const backupData = {
            timestamp: Date.now(),
            userSettings: this.collectUserSettings(),
            authData: this.collectAuthData(),
            systemState: this.collectSystemState(),
            escapeHistory: this.escapeHistory
        };
        
        // Lưu vào localStorage
        localStorage.setItem('tini_emergency_backup', JSON.stringify(backupData));
        
        // Lưu vào blob để download
        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tini_emergency_backup_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('✅ [Escape Hatch] Emergency backup completed');
    }

    performSystemReset() {
        console.log('🔄 [Escape Hatch] Performing system reset...');
        
        // Backup trước khi reset
        this.performEmergencyBackup();
        
        // Clear localStorage (trừ backup)
        const backup = localStorage.getItem('tini_emergency_backup');
        localStorage.clear();
        if (backup) {
            localStorage.setItem('tini_emergency_backup', backup);
        }
        
        // Reset window objects
        const tiniObjects = Object.keys(window).filter(key => key.startsWith('TINI_'));
        tiniObjects.forEach(key => {
            if (key !== 'TINI_ESCAPE_HATCH') { // Giữ lại escape hatch
                delete window[key];
            }
        });
        
        // Reload page sau 3 giây
        setTimeout(() => {
            location.reload();
        }, 3000);
        
        console.log('✅ [Escape Hatch] System reset initiated - reloading in 3 seconds');
    }

    collectUserSettings() {
        const settings = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('user') || key.includes('setting') || key.includes('preference'))) {
                settings[key] = localStorage.getItem(key);
            }
        }
        return settings;
    }

    collectAuthData() {
        const authData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('auth') || key.includes('role') || key.includes('permission'))) {
                authData[key] = localStorage.getItem(key);
            }
        }
        return authData;
    }

    collectSystemState() {
        return {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: location.href,
            loadedModules: window.TINI_INIT_REPORT?.loadedModules || [],
            healthReport: window.TINI_HEALTH_REPORT || null
        };
    }

    notifyEmergency(reason, severity) {
        // Gửi notification qua event bus
        if (window.TINI_UNIVERSAL_DISPATCHER) {
            window.TINI_UNIVERSAL_DISPATCHER.dispatch('tini:emergency-activated', {
                reason,
                severity,
                timestamp: Date.now(),
                activationCode: this.activationCode
            });
        }
        
        // Console warning
        console.warn(`
🚨 ================================
   EMERGENCY ESCAPE ACTIVATED
🚨 ================================
⚠️  Reason: ${reason}
🔥  Severity: ${severity}
🔑  Code: ${this.activationCode}
⏰  Time: ${new Date().toISOString()}
================================`);
    }

    generateSecureCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    deactivate() {
        this.isActive = false;
        console.log('✅ [Escape Hatch] Emergency system deactivated');
    }

    getStatus() {
        return {
            isActive: this.isActive,
            lastActivation: this.lastActivation,
            escapeHistory: this.escapeHistory,
            availableRoutes: Array.from(this.escapeRoutes.keys()),
            healthy: true
        };
    }
}

// Tạo global instance
if (!window.TINI_ESCAPE_HATCH) {
    window.TINI_ESCAPE_HATCH = new EmergencyEscapeHatch();
    console.log('✅ [Escape Hatch] Global emergency escape system created');
}

// Đăng ký keyboard shortcut
document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+E+E = Emergency Escape
    if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        const doublePress = Date.now() - (window.lastEscapeKeyPress || 0) < 1000;
        
        if (doublePress) {
            const reason = prompt('Emergency Escape Reason:') || 'manual_activation';
            const severity = prompt('Severity (low/medium/high/critical):') || 'medium';
            window.TINI_ESCAPE_HATCH.activate(reason, severity);
        }
        
        window.lastEscapeKeyPress = Date.now();
    }
});

console.log('🚨 [Escape Hatch] Emergency system ready - Press Ctrl+Shift+E+E for manual activation');
