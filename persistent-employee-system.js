// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// PERSISTENT EMPLOYEE SYSTEM
// 🏢 Hệ thống nhân viên bền vững với BOSS management

class PersistentEmployeeSystem {
    constructor() {
        this.version = '3.0.0';
        this.employees = new Map();
        this.employeeProfiles = new Map();
        this.persistentSessions = new Map();
        this.employeeMetrics = new Map();
        this.workflowStates = new Map();
        
        this.init();
    }
    
    init() {
        console.log('🏢 [PERSISTENT-EMP] Persistent Employee System v' + this.version + ' initializing...');
        this.loadStoredEmployees();
        this.setupEmployeeRoles();
        this.initializePersistentStorage();
        this.activateEmployeeMonitoring();
        this.setupBossManagement();
        console.log('🏢 [PERSISTENT-EMP] System active with BOSS management authority');
    }
    
    setupEmployeeRoles() {
        // Comprehensive employee role system
        const employeeRoles = {
            'trainee': {
                level: 50,
                title: 'Trainee',
                permissions: ['basic_access'],
                workingHours: '9-17',
                probationPeriod: 90,
                persistent: false
            },
            'junior': {
                level: 200,
                title: 'Junior Employee', 
                permissions: ['read', 'basic_write'],
                workingHours: '9-18',
                probationPeriod: 60,
                persistent: true
            },
            'regular': {
                level: 400,
                title: 'Regular Employee',
                permissions: ['read', 'write', 'collaborate'],
                workingHours: '8-18',
                probationPeriod: 30,
                persistent: true
            },
            'senior': {
                level: 600,
                title: 'Senior Employee',
                permissions: ['read', 'write', 'review', 'mentor'],
                workingHours: 'flexible',
                probationPeriod: 0,
                persistent: true
            },
            'specialist': {
                level: 800,
                title: 'Specialist',
                permissions: ['read', 'write', 'expert_review', 'consult'],
                workingHours: 'flexible',
                probationPeriod: 0,
                persistent: true
            },
            'lead': {
                level: 1000,
                title: 'Team Lead',
                permissions: ['read', 'write', 'manage_team', 'approve'],
                workingHours: 'flexible',
                probationPeriod: 0,
                persistent: true
            },
            'manager': {
                level: 1500,
                title: 'Manager',
                permissions: ['manage', 'budget', 'hire', 'strategic'],
                workingHours: 'on_demand',
                probationPeriod: 0,
                persistent: true
            },
            'director': {
                level: 3000,
                title: 'Director',
                permissions: ['strategic', 'executive', 'policy'],
                workingHours: 'executive',
                probationPeriod: 0,
                persistent: true
            },
            
            // 👑 BOSS ROLE - SUPREME MANAGEMENT
            'boss': {
                level: 10000,
                title: 'BOSS - Supreme Commander',
                permissions: ['UNLIMITED', 'ABSOLUTE_CONTROL'],
                workingHours: 'ALWAYS',
                probationPeriod: 0,
                persistent: true,
                immune: true,
                unlimited: true,
                supreme: true
            }
        };
        
        Object.entries(employeeRoles).forEach(([role, config]) => {
            this.employees.set(role, config);
        });
        
        console.log('🏢 [PERSISTENT-EMP] Employee roles configured with BOSS supremacy');
    }
    
    loadStoredEmployees() {
        try {
            // Load from localStorage
            const storedProfiles = localStorage.getItem('tini_employee_profiles');
            if (storedProfiles) {
                const profiles = JSON.parse(storedProfiles);
                Object.entries(profiles).forEach(([id, profile]) => {
                    this.employeeProfiles.set(id, profile);
                });
                console.log('🏢 [PERSISTENT-EMP] Loaded', Object.keys(profiles).length, 'employee profiles');
            }
            
            // Load persistent sessions
            const storedSessions = localStorage.getItem('tini_persistent_sessions');
            if (storedSessions) {
                const sessions = JSON.parse(storedSessions);
                Object.entries(sessions).forEach(([id, session]) => {
                    // Validate session before restoring
                    if (this.validateStoredSession(session)) {
                        this.persistentSessions.set(id, session);
                    }
                });
                console.log('🏢 [PERSISTENT-EMP] Restored', Object.keys(sessions).length, 'persistent sessions');
            }
            
            // Auto-detect BOSS
            const bossToken = localStorage.getItem('bossLevel10000');
            if (bossToken === 'true') {
                this.createBossProfile();
            }
            
        } catch (error) {
            console.error('🏢 [PERSISTENT-EMP] Error loading stored data:', error.message);
        }
    }
    
    createBossProfile() {
        const bossProfile = {
            id: 'BOSS',
            role: 'boss',
            level: 10000,
            title: 'Supreme Commander',
            name: 'BOSS',
            email: 'boss@tini.supreme',
            department: 'EXECUTIVE',
            status: 'ACTIVE',
            permissions: ['UNLIMITED'],
            created: Date.now(),
            lastActive: Date.now(),
            workingHours: 'ALWAYS',
            persistent: true,
            immune: true,
            supreme: true,
            metrics: {
                loginCount: 0,
                totalTime: 0,
                productivity: 100,
                authority: 'ABSOLUTE'
            }
        };
        
        this.employeeProfiles.set('BOSS', bossProfile);
        this.createPersistentSession('BOSS', bossProfile);
        
        console.log('👑 [PERSISTENT-EMP] BOSS profile created with supreme authority');
    }
    
    validateStoredSession(session) {
        // Check if session is still valid
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        
        // BOSS sessions never expire
        if (session.role === 'boss' || session.level >= 10000) {
            return true;
        }
        
        // Check expiration
        if (now - session.created > maxAge) {
            return false;
        }
        
        // Check if role still exists
        return this.employees.has(session.role);
    }
    
    initializePersistentStorage() {
        // Setup automatic save intervals
        setInterval(() => {
            this.saveEmployeeData();
        }, 60000); // Save every minute
        
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 300000); // Cleanup every 5 minutes
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveEmployeeData();
        });
        
        console.log('🏢 [PERSISTENT-EMP] Persistent storage initialized');
    }
    
    activateEmployeeMonitoring() {
        // Monitor employee activity
        setInterval(() => {
            this.updateEmployeeMetrics();
        }, 30000); // Every 30 seconds
        
        setInterval(() => {
            this.analyzeEmployeePerformance();
        }, 300000); // Every 5 minutes
        
        console.log('🏢 [PERSISTENT-EMP] Employee monitoring activated');
    }
    
    setupBossManagement() {
        // 👑 BOSS management interface
        window.addEventListener('bossEmployeeCommand', (event) => {
            this.handleBossCommand(event.detail);
        });
        
        // BOSS can manage all employees
        if (this.employeeProfiles.has('BOSS')) {
            this.grantBossManagementRights();
        }
    }
    
    grantBossManagementRights() {
        console.log('👑 [PERSISTENT-EMP] BOSS management rights activated');
        
        // BOSS can control all employee functions
        const bossRights = {
            can_hire: true,
            can_fire: true,
            can_promote: true,
            can_demote: true,
            can_access_all_data: true,
            can_override_policies: true,
            can_view_all_metrics: true,
            immune_to_monitoring: true
        };
        
        const bossProfile = this.employeeProfiles.get('BOSS');
        if (bossProfile) {
            bossProfile.managementRights = bossRights;
            this.employeeProfiles.set('BOSS', bossProfile);
        }
    }
    
    // =================== EMPLOYEE MANAGEMENT ===================
    
    createEmployee(employeeData) {
        const { id, role, name, email, department } = employeeData;
        
        // Validate role
        const roleConfig = this.employees.get(role);
        if (!roleConfig) {
            console.error('🏢 [PERSISTENT-EMP] Invalid role:', role);
            return false;
        }
        
        // Create employee profile
        const profile = {
            id,
            role,
            level: roleConfig.level,
            title: roleConfig.title,
            name,
            email,
            department,
            status: 'ACTIVE',
            permissions: roleConfig.permissions,
            workingHours: roleConfig.workingHours,
            probationPeriod: roleConfig.probationPeriod,
            created: Date.now(),
            lastActive: Date.now(),
            persistent: roleConfig.persistent,
            metrics: {
                loginCount: 0,
                totalTime: 0,
                productivity: 50,
                performance: 'AVERAGE'
            }
        };
        
        this.employeeProfiles.set(id, profile);
        
        // Create persistent session if applicable
        if (roleConfig.persistent) {
            this.createPersistentSession(id, profile);
        }
        
        // Initialize metrics
        this.employeeMetrics.set(id, {
            dailyActivity: [],
            weeklyPerformance: [],
            monthlyGoals: [],
            lastUpdate: Date.now()
        });
        
        this.saveEmployeeData();
        
        console.log('🏢 [PERSISTENT-EMP] Employee created:', name, 'Role:', role);
        return profile;
    }
    
    createPersistentSession(employeeId, profile) {
        const session = {
            id: employeeId,
            role: profile.role,
            level: profile.level,
            permissions: profile.permissions,
            created: Date.now(),
            lastActive: Date.now(),
            persistent: true,
            workflowState: {},
            preferences: {},
            activeProjects: []
        };
        
        // BOSS sessions have special properties
        if (profile.role === 'boss') {
            session.immune = true;
            session.unlimited = true;
            session.supreme = true;
            session.authority = 'ABSOLUTE';
        }
        
        this.persistentSessions.set(employeeId, session);
        
        console.log('🏢 [PERSISTENT-EMP] Persistent session created for:', employeeId);
        return session;
    }
    
    updateEmployee(employeeId, updates) {
        const profile = this.employeeProfiles.get(employeeId);
        if (!profile) {
            console.error('🏢 [PERSISTENT-EMP] Employee not found:', employeeId);
            return false;
        }
        
        // 👑 BOSS cannot be modified by others
        if (profile.role === 'boss' && updates.modifiedBy !== 'BOSS') {
            console.log('👑 [PERSISTENT-EMP] BOSS profile is immutable');
            return false;
        }
        
        // Apply updates
        const updatedProfile = { ...profile, ...updates, lastModified: Date.now() };
        this.employeeProfiles.set(employeeId, updatedProfile);
        
        // Update persistent session if exists
        if (this.persistentSessions.has(employeeId)) {
            const session = this.persistentSessions.get(employeeId);
            session.role = updatedProfile.role;
            session.level = updatedProfile.level;
            session.permissions = updatedProfile.permissions;
            session.lastActive = Date.now();
            this.persistentSessions.set(employeeId, session);
        }
        
        this.saveEmployeeData();
        
        console.log('🏢 [PERSISTENT-EMP] Employee updated:', employeeId);
        return updatedProfile;
    }
    
    removeEmployee(employeeId, removedBy) {
        const profile = this.employeeProfiles.get(employeeId);
        if (!profile) return false;
        
        // 👑 BOSS cannot be removed
        if (profile.role === 'boss') {
            console.log('👑 [PERSISTENT-EMP] BOSS cannot be removed');
            return false;
        }
        
        // Check permissions (only BOSS or higher level can remove)
        const removerProfile = this.employeeProfiles.get(removedBy);
        if (!removerProfile || (removerProfile.level < profile.level && removerProfile.role !== 'boss')) {
            console.log('🏢 [PERSISTENT-EMP] Insufficient permissions to remove employee');
            return false;
        }
        
        // Mark as inactive instead of deleting
        profile.status = 'INACTIVE';
        profile.removedBy = removedBy;
        profile.removedAt = Date.now();
        
        this.employeeProfiles.set(employeeId, profile);
        
        // Remove persistent session
        this.persistentSessions.delete(employeeId);
        
        this.saveEmployeeData();
        
        console.log('🏢 [PERSISTENT-EMP] Employee removed:', employeeId);
        return true;
    }
    
    // =================== SESSION MANAGEMENT ===================
    
    restoreEmployeeSession(employeeId) {
        const session = this.persistentSessions.get(employeeId);
        if (!session) return null;
        
        // Update last active
        session.lastActive = Date.now();
        this.persistentSessions.set(employeeId, session);
        
        // Update metrics
        const profile = this.employeeProfiles.get(employeeId);
        if (profile) {
            profile.metrics.loginCount++;
            profile.lastActive = Date.now();
            this.employeeProfiles.set(employeeId, profile);
        }
        
        console.log('🏢 [PERSISTENT-EMP] Session restored for:', employeeId);
        return session;
    }
    
    saveWorkflowState(employeeId, workflowData) {
        const session = this.persistentSessions.get(employeeId);
        if (session) {
            session.workflowState = { ...session.workflowState, ...workflowData };
            session.lastActive = Date.now();
            this.persistentSessions.set(employeeId, session);
            
            // Also store in separate workflow states
            this.workflowStates.set(employeeId, {
                ...workflowData,
                timestamp: Date.now()
            });
        }
    }
    
    getWorkflowState(employeeId) {
        const session = this.persistentSessions.get(employeeId);
        return session ? session.workflowState : {};
    }
    
    // =================== METRICS & MONITORING ===================
    
    updateEmployeeMetrics() {
        try {
            for (const [employeeId, profile] of this.employeeProfiles) {
                // Skip BOSS (immune to monitoring)
                if (profile.role === 'boss') continue;
                
                if (profile.status === 'ACTIVE') {
                    const metrics = this.employeeMetrics.get(employeeId) || {
                        dailyActivity: [],
                        weeklyPerformance: [],
                        monthlyGoals: [],
                        lastUpdate: Date.now()
                    };
                    
                    // Update activity
                    const now = Date.now();
                    const today = new Date().toDateString();
                    
                    // Add daily activity point
                    if (!metrics.dailyActivity.find(a => a.date === today)) {
                        metrics.dailyActivity.push({
                            date: today,
                            loginTime: now,
                            productivity: this.calculateProductivity(employeeId),
                            tasksCompleted: Math.floor(Math.random() * 10) // Mock data
                        });
                    }
                    
                    // Keep only last 30 days
                    if (metrics.dailyActivity.length > 30) {
                        metrics.dailyActivity = metrics.dailyActivity.slice(-30);
                    }
                    
                    metrics.lastUpdate = now;
                    this.employeeMetrics.set(employeeId, metrics);
                }
            }
        } catch (error) {
            console.error('🏢 [PERSISTENT-EMP] Error updating metrics:', error.message);
        }
    }
    
    calculateProductivity(employeeId) {
        const session = this.persistentSessions.get(employeeId);
        if (!session) return 50;
        
        // Simple productivity calculation
        const activeTime = Date.now() - session.lastActive;
        const hoursActive = activeTime / (1000 * 60 * 60);
        
        if (hoursActive < 1) return 90;
        if (hoursActive < 4) return 80;
        if (hoursActive < 8) return 70;
        return 60;
    }
    
    analyzeEmployeePerformance() {
        try {
            for (const [employeeId, metrics] of this.employeeMetrics) {
                const profile = this.employeeProfiles.get(employeeId);
                if (!profile || profile.role === 'boss') continue; // Skip BOSS
                
                const performance = this.calculatePerformanceScore(metrics);
                
                // Update profile with performance
                profile.metrics.performance = performance.level;
                profile.metrics.productivity = performance.score;
                
                this.employeeProfiles.set(employeeId, profile);
                
                // Flag low performers (but not BOSS)
                if (performance.score < 30 && profile.role !== 'boss') {
                    this.flagLowPerformance(employeeId, performance);
                }
            }
        } catch (error) {
            console.error('🏢 [PERSISTENT-EMP] Error analyzing performance:', error.message);
        }
    }
    
    calculatePerformanceScore(metrics) {
        let score = 50; // Base score
        
        // Analyze daily activity
        const recentActivity = metrics.dailyActivity.slice(-7); // Last 7 days
        if (recentActivity.length > 0) {
            const avgProductivity = recentActivity.reduce((sum, day) => sum + day.productivity, 0) / recentActivity.length;
            score = avgProductivity;
        }
        
        // Determine level
        let level = 'AVERAGE';
        if (score >= 80) level = 'EXCELLENT';
        else if (score >= 60) level = 'GOOD';
        else if (score >= 40) level = 'AVERAGE';
        else level = 'NEEDS_IMPROVEMENT';
        
        return { score, level };
    }
    
    flagLowPerformance(employeeId, performance) {
        console.warn('🏢 [PERSISTENT-EMP] Low performance detected for:', employeeId, 'Score:', performance.score);
        
        // Store performance issue
        const profile = this.employeeProfiles.get(employeeId);
        if (profile) {
            if (!profile.performanceIssues) profile.performanceIssues = [];
            
            profile.performanceIssues.push({
                date: Date.now(),
                score: performance.score,
                level: performance.level,
                action: 'FLAGGED_FOR_REVIEW'
            });
            
            this.employeeProfiles.set(employeeId, profile);
        }
    }
    
    // =================== DATA PERSISTENCE ===================
    
    saveEmployeeData() {
        try {
            // Save employee profiles
            const profilesData = {};
            for (const [id, profile] of this.employeeProfiles) {
                profilesData[id] = profile;
            }
            localStorage.setItem('tini_employee_profiles', JSON.stringify(profilesData));
            
            // Save persistent sessions
            const sessionsData = {};
            for (const [id, session] of this.persistentSessions) {
                sessionsData[id] = session;
            }
            localStorage.setItem('tini_persistent_sessions', JSON.stringify(sessionsData));
            
            // Save metrics
            const metricsData = {};
            for (const [id, metrics] of this.employeeMetrics) {
                metricsData[id] = metrics;
            }
            localStorage.setItem('tini_employee_metrics', JSON.stringify(metricsData));
            
        } catch (error) {
            console.error('🏢 [PERSISTENT-EMP] Error saving data:', error.message);
        }
    }
    
    cleanupExpiredSessions() {
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        
        for (const [id, session] of this.persistentSessions) {
            // Never cleanup BOSS sessions
            if (session.role === 'boss') continue;
            
            if (now - session.lastActive > maxAge) {
                this.persistentSessions.delete(id);
                console.log('🏢 [PERSISTENT-EMP] Expired session cleaned up:', id);
            }
        }
    }
    
    // =================== BOSS COMMANDS ===================
    
    handleBossCommand(command) {
        console.log('👑 [PERSISTENT-EMP] BOSS command received:', command.action);
        
        switch (command.action) {
            case 'VIEW_ALL_EMPLOYEES':
                return this.getAllEmployees();
            case 'PROMOTE_EMPLOYEE':
                return this.promoteEmployee(command.employeeId, command.newRole);
            case 'VIEW_EMPLOYEE_METRICS':
                return this.getEmployeeMetrics(command.employeeId);
            case 'OVERRIDE_PERFORMANCE':
                return this.overridePerformance(command.employeeId, command.newScore);
            case 'EMERGENCY_ACCESS':
                return this.grantEmergencyAccess(command.employeeId);
            default:
                console.log('👑 [PERSISTENT-EMP] Unknown BOSS command:', command.action);
                return false;
        }
    }
    
    promoteEmployee(employeeId, newRole) {
        console.log('👑 [PERSISTENT-EMP] BOSS promoting employee:', employeeId, 'to', newRole);
        
        return this.updateEmployee(employeeId, {
            role: newRole,
            modifiedBy: 'BOSS',
            promotedBy: 'BOSS',
            promotedAt: Date.now()
        });
    }
    
    overridePerformance(employeeId, newScore) {
        console.log('👑 [PERSISTENT-EMP] BOSS overriding performance for:', employeeId);
        
        const profile = this.employeeProfiles.get(employeeId);
        if (profile) {
            profile.metrics.productivity = newScore;
            profile.metrics.performance = newScore >= 80 ? 'EXCELLENT' : newScore >= 60 ? 'GOOD' : 'AVERAGE';
            profile.bossOverride = { score: newScore, timestamp: Date.now() };
            
            this.employeeProfiles.set(employeeId, profile);
            return true;
        }
        return false;
    }
    
    grantEmergencyAccess(employeeId) {
        console.log('👑 [PERSISTENT-EMP] BOSS granting emergency access to:', employeeId);
        
        const session = this.persistentSessions.get(employeeId);
        if (session) {
            session.emergencyAccess = true;
            session.emergencyGrantedBy = 'BOSS';
            session.emergencyTimestamp = Date.now();
            session.permissions = [...session.permissions, 'EMERGENCY_ACCESS'];
            
            this.persistentSessions.set(employeeId, session);
            return true;
        }
        return false;
    }
    
    // =================== PUBLIC API ===================
    
    getAllEmployees() {
        return Array.from(this.employeeProfiles.values());
    }
    
    getEmployee(employeeId) {
        return this.employeeProfiles.get(employeeId);
    }
    
    getEmployeeMetrics(employeeId) {
        return this.employeeMetrics.get(employeeId);
    }
    
    getSystemStatus() {
        return {
            version: this.version,
            totalEmployees: this.employeeProfiles.size,
            activeSessions: this.persistentSessions.size,
            bossActive: this.employeeProfiles.has('BOSS'),
            lastUpdate: Date.now()
        };
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.TINI_PERSISTENT_EMPLOYEE_SYSTEM = new PersistentEmployeeSystem();
    console.log('🏢 [PERSISTENT-EMP] Persistent Employee System loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersistentEmployeeSystem;
}
