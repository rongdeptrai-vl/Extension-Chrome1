// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// ROLE-BASED SECURITY SYSTEM
// 🔐 Hệ thống bảo mật dựa trên vai trò với BOSS level 10000

class RoleBasedSecurity {
    constructor() {
        this.version = '3.0.0';
        this.roles = new Map();
        this.permissions = new Map();
        this.userSessions = new Map();
        this.securityLevels = new Map();
        
        this.init();
    }
    
    init() {
        console.log('🔐 [ROLE-SECURITY] Role-Based Security v' + this.version + ' initializing...');
        this.setupRoleHierarchy();
        this.initializePermissions();
        this.setupBossRole();
        this.activateSecurityMatrix();
        console.log('🔐 [ROLE-SECURITY] System active with BOSS level 10000');
    }
    
    setupRoleHierarchy() {
        // Define role hierarchy (level-based)
        this.roles.set('guest', { level: 0, name: 'Guest', permissions: [] });
        this.roles.set('user', { level: 100, name: 'User', permissions: ['read'] });
        this.roles.set('moderator', { level: 500, name: 'Moderator', permissions: ['read', 'moderate'] });
        this.roles.set('admin', { level: 1000, name: 'Administrator', permissions: ['read', 'write', 'moderate', 'admin'] });
        this.roles.set('superadmin', { level: 5000, name: 'Super Administrator', permissions: ['read', 'write', 'moderate', 'admin', 'superadmin'] });
        
        // 👑 BOSS ROLE - SUPREME AUTHORITY
        this.roles.set('boss', { 
            level: 10000, 
            name: 'BOSS', 
            permissions: ['ALL_PERMISSIONS', 'UNLIMITED_ACCESS', 'SYSTEM_CONTROL'],
            immunity: true,
            bypass: true,
            infinitePower: true
        });
        
        console.log('🔐 [ROLE-SECURITY] Role hierarchy established with BOSS at level 10000');
    }
    
    initializePermissions() {
        // System permissions
        this.permissions.set('read', { level: 100, description: 'Read access' });
        this.permissions.set('write', { level: 500, description: 'Write access' });
        this.permissions.set('moderate', { level: 500, description: 'Moderate content' });
        this.permissions.set('admin', { level: 1000, description: 'Admin functions' });
        this.permissions.set('superadmin', { level: 5000, description: 'Super admin functions' });
        this.permissions.set('system_control', { level: 8000, description: 'System control' });
        
        // 👑 BOSS PERMISSIONS - UNLIMITED
        this.permissions.set('boss_unlimited', { level: 10000, description: 'Unlimited BOSS access' });
        this.permissions.set('security_bypass', { level: 10000, description: 'Bypass all security' });
        this.permissions.set('immunity', { level: 10000, description: 'Immune to restrictions' });
        this.permissions.set('absolute_control', { level: 10000, description: 'Absolute system control' });
    }
    
    setupBossRole() {
        // 👑 Special BOSS role setup
        const bossRole = {
            level: 10000,
            name: 'BOSS',
            title: 'Supreme Commander',
            permissions: [
                'ALL_PERMISSIONS',
                'UNLIMITED_ACCESS', 
                'SYSTEM_CONTROL',
                'SECURITY_BYPASS',
                'IMMUNITY',
                'ABSOLUTE_CONTROL'
            ],
            capabilities: {
                bypassAllSecurity: true,
                immuneToRestrictions: true,
                unlimitedAccess: true,
                systemOverride: true,
                emergencyControl: true,
                infinitePower: true
            },
            flags: {
                isImmune: true,
                canBypass: true,
                hasInfinitePower: true,
                immuneToOwnRules: true
            }
        };
        
        this.roles.set('boss', bossRole);
        this.securityLevels.set(10000, 'BOSS_SUPREME');
        
        console.log('👑 [ROLE-SECURITY] BOSS role configured with supreme authority');
    }
    
    activateSecurityMatrix() {
        // Security level matrix
        this.securityLevels.set(0, 'GUEST');
        this.securityLevels.set(100, 'USER');
        this.securityLevels.set(500, 'MODERATOR');
        this.securityLevels.set(1000, 'ADMIN');
        this.securityLevels.set(5000, 'SUPERADMIN');
        this.securityLevels.set(8000, 'SYSTEM_CONTROL');
        this.securityLevels.set(10000, 'BOSS_SUPREME');
        
        // Auto-detect BOSS status
        this.detectBossStatus();
    }
    
    detectBossStatus() {
        // Check for BOSS authentication
        const bossToken = localStorage.getItem('bossLevel10000');
        const ghostMode = localStorage.getItem('ghostBossMode');
        const ultimateCore = localStorage.getItem('ultimateBossCore');
        
        if (bossToken === 'true' || ghostMode === 'true' || ultimateCore === 'true') {
            this.activateBossMode();
        }
    }
    
    activateBossMode() {
        console.log('👑 [ROLE-SECURITY] BOSS mode activated - Supreme authority granted');
        
        // Set BOSS session
        const bossSession = {
            userId: 'BOSS',
            role: 'boss',
            level: 10000,
            permissions: ['ALL'],
            immunity: true,
            bypass: true,
            timestamp: Date.now(),
            sessionType: 'BOSS_SUPREME'
        };
        
        this.userSessions.set('BOSS', bossSession);
        localStorage.setItem('currentUserRole', 'boss');
        localStorage.setItem('currentSecurityLevel', '10000');
        
        // Notify other systems
        window.dispatchEvent(new CustomEvent('bossRoleActivated', {
            detail: bossSession
        }));
    }
    
    // =================== PERMISSION CHECKING ===================
    
    hasPermission(userId, permission) {
        const session = this.userSessions.get(userId);
        if (!session) return false;
        
        // 👑 BOSS always has ALL permissions
        if (session.role === 'boss' || session.level >= 10000) {
            console.log('👑 [ROLE-SECURITY] BOSS access granted - Permission: ' + permission);
            return true;
        }
        
        const role = this.roles.get(session.role);
        if (!role) return false;
        
        // Check specific permission
        if (role.permissions.includes(permission)) return true;
        if (role.permissions.includes('ALL_PERMISSIONS')) return true;
        
        // Check permission level
        const permissionData = this.permissions.get(permission);
        if (permissionData && role.level >= permissionData.level) return true;
        
        return false;
    }
    
    checkSecurityLevel(userId, requiredLevel) {
        const session = this.userSessions.get(userId);
        if (!session) return false;
        
        // 👑 BOSS bypasses ALL security levels
        if (session.role === 'boss' || session.level >= 10000) {
            console.log('👑 [ROLE-SECURITY] BOSS security bypass - Required level: ' + requiredLevel);
            return true;
        }
        
        return session.level >= requiredLevel;
    }
    
    canBypassSecurity(userId) {
        const session = this.userSessions.get(userId);
        if (!session) return false;
        
        // 👑 BOSS can ALWAYS bypass security
        if (session.role === 'boss' || session.level >= 10000 || session.bypass === true) {
            return true;
        }
        
        return false;
    }
    
    isImmune(userId) {
        const session = this.userSessions.get(userId);
        if (!session) return false;
        
        // 👑 BOSS is IMMUNE to all restrictions
        if (session.role === 'boss' || session.immunity === true || session.level >= 10000) {
            return true;
        }
        
        return false;
    }
    
    // =================== SESSION MANAGEMENT ===================
    
    createSession(userId, role, additionalData = {}) {
        const roleData = this.roles.get(role);
        if (!roleData) {
            console.error('🔐 [ROLE-SECURITY] Invalid role:', role);
            return false;
        }
        
        const session = {
            userId,
            role,
            level: roleData.level,
            permissions: roleData.permissions,
            timestamp: Date.now(),
            immunity: roleData.immunity || false,
            bypass: roleData.bypass || false,
            ...additionalData
        };
        
        this.userSessions.set(userId, session);
        
        if (role === 'boss') {
            console.log('👑 [ROLE-SECURITY] BOSS session created with supreme authority');
            this.activateBossMode();
        } else {
            console.log('🔐 [ROLE-SECURITY] Session created for user:', userId, 'Role:', role);
        }
        
        return session;
    }
    
    destroySession(userId) {
        if (this.userSessions.has(userId)) {
            const session = this.userSessions.get(userId);
            
            // 👑 BOSS sessions cannot be destroyed by others
            if (session.role === 'boss' && userId !== 'BOSS') {
                console.log('👑 [ROLE-SECURITY] BOSS session is indestructible');
                return false;
            }
            
            this.userSessions.delete(userId);
            console.log('🔐 [ROLE-SECURITY] Session destroyed for user:', userId);
            return true;
        }
        return false;
    }
    
    getUserRole(userId) {
        const session = this.userSessions.get(userId);
        return session ? session.role : null;
    }
    
    getUserLevel(userId) {
        const session = this.userSessions.get(userId);
        return session ? session.level : 0;
    }
    
    // =================== SECURITY VALIDATION ===================
    
    validateAccess(userId, resource, action) {
        const session = this.userSessions.get(userId);
        if (!session) {
            console.log('🔐 [ROLE-SECURITY] Access denied - No session for user:', userId);
            return false;
        }
        
        // 👑 BOSS has unlimited access to everything
        if (session.role === 'boss' || session.level >= 10000) {
            console.log('👑 [ROLE-SECURITY] BOSS unlimited access granted for:', resource, action);
            return true;
        }
        
        // Check role-based access
        const role = this.roles.get(session.role);
        if (!role) return false;
        
        // Define resource-action mappings
        const accessMatrix = {
            'admin_panel': { requiredLevel: 1000, permissions: ['admin'] },
            'user_management': { requiredLevel: 1000, permissions: ['admin'] },
            'system_settings': { requiredLevel: 5000, permissions: ['superadmin'] },
            'security_controls': { requiredLevel: 8000, permissions: ['system_control'] },
            'boss_functions': { requiredLevel: 10000, permissions: ['boss_unlimited'] }
        };
        
        const resourceAccess = accessMatrix[resource];
        if (!resourceAccess) return true; // Allow if not restricted
        
        // Check level requirement
        if (session.level < resourceAccess.requiredLevel) {
            console.log('🔐 [ROLE-SECURITY] Access denied - Insufficient level:', session.level, 'Required:', resourceAccess.requiredLevel);
            return false;
        }
        
        // Check permission requirement
        const hasPermission = resourceAccess.permissions.some(perm => 
            role.permissions.includes(perm) || role.permissions.includes('ALL_PERMISSIONS')
        );
        
        if (!hasPermission) {
            console.log('🔐 [ROLE-SECURITY] Access denied - Missing permission for:', resource);
            return false;
        }
        
        console.log('🔐 [ROLE-SECURITY] Access granted for user:', userId, 'Resource:', resource, 'Action:', action);
        return true;
    }
    
    // =================== PUBLIC API ===================
    
    getCurrentUser() {
        // Check for BOSS first
        if (this.userSessions.has('BOSS')) {
            return this.userSessions.get('BOSS');
        }
        
        // Get from localStorage
        const currentRole = localStorage.getItem('currentUserRole');
        const currentLevel = parseInt(localStorage.getItem('currentSecurityLevel')) || 0;
        
        if (currentRole === 'boss' || currentLevel >= 10000) {
            return this.userSessions.get('BOSS') || { role: 'boss', level: 10000 };
        }
        
        return null;
    }
    
    getSecurityStatus() {
        return {
            version: this.version,
            totalRoles: this.roles.size,
            totalPermissions: this.permissions.size,
            activeSessions: this.userSessions.size,
            bossActive: this.userSessions.has('BOSS'),
            securityLevels: Array.from(this.securityLevels.entries())
        };
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.TINI_ROLE_SECURITY = new RoleBasedSecurity();
    console.log('🔐 [ROLE-SECURITY] Role-Based Security System loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoleBasedSecurity;
}
