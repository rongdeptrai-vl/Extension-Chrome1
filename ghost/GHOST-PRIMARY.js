// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 👻 GHOST PRIMARY CONTROLLER v2.5
 * Primary GHOST system controller and orchestrator
 * Điều khiển chính và quản lý toàn bộ hệ thống GHOST
 */

class GHOSTPrimary {
    constructor() {
        this.version = "2.5";
        this.systemName = "GHOST Primary";
        this.initialized = false;
        this.isActive = false;
        
        // Primary control status
        this.controlStatus = {
            masterControl: false,
            subsystemsOnline: 0,
            totalSubsystems: 0,
            lastUpdate: null,
            emergencyMode: false
        };
        
        // Connected GHOST subsystems
        this.subsystems = {
            core: null,
            integration: null,
            monitoring: null,
            security: null,
            performance: null,
            network: null
        };
        
        // Primary configuration
        this.primaryConfig = {
            heartbeatInterval: 3000,
            subsystemCheckInterval: 5000,
            emergencyResponseTime: 1000,
            maxSubsystemDowntime: 30000,
            autoRecoveryEnabled: true,
            bossNotificationEnabled: true
        };
        
        // System commands queue
        this.commandQueue = [];
        this.processingCommands = false;
        
        // Performance metrics
        this.metrics = {
            totalCommands: 0,
            successfulCommands: 0,
            failedCommands: 0,
            avgResponseTime: 0,
            lastPerformanceCheck: null
        };
        
        this.init();
    }
    
    async init() {
        if (this.initialized) return;
        
        console.log(`👻 [GHOST PRIMARY] Initializing ${this.systemName} v${this.version}...`);
        
        try {
            // Initialize primary control systems
            await this.initializePrimaryControl();
            
            // Discover and connect subsystems
            await this.discoverSubsystems();
            
            // Start heartbeat and monitoring
            this.startHeartbeat();
            
            // Enable command processing
            this.startCommandProcessor();
            
            // Setup emergency protocols
            this.setupEmergencyProtocols();
            
            this.initialized = true;
            this.isActive = true;
            this.controlStatus.masterControl = true;
            this.controlStatus.lastUpdate = Date.now();
            
            console.log(`👻 [GHOST PRIMARY] System online! Managing ${this.controlStatus.subsystemsOnline} subsystems`);
            
            // Send primary online signal
            this.broadcastPrimaryStatus('PRIMARY_ONLINE');
            
        } catch (error) {
            console.error('👻 [GHOST PRIMARY] Initialization failed:', error);
            this.handleInitializationFailure(error);
        }
    }
    
    async initializePrimaryControl() {
        console.log('👻 [GHOST PRIMARY] Setting up primary control...');
        
        // Setup command interface
        this.commandInterface = {
            execute: (command, params = {}) => {
                return this.executeCommand(command, params);
            },
            
            queue: (command, params = {}, priority = 'normal') => {
                return this.queueCommand(command, params, priority);
            },
            
            status: () => {
                return this.getSystemStatus();
            },
            
            emergency: () => {
                return this.activateEmergencyMode();
            }
        };
        
        // Setup subsystem management
        this.subsystemManager = {
            register: (name, subsystem) => {
                return this.registerSubsystem(name, subsystem);
            },
            
            unregister: (name) => {
                return this.unregisterSubsystem(name);
            },
            
            getStatus: (name) => {
                return this.getSubsystemStatus(name);
            },
            
            restart: (name) => {
                return this.restartSubsystem(name);
            },
            
            restartAll: () => {
                return this.restartAllSubsystems();
            }
        };
        
        // Setup performance monitor
        this.performanceMonitor = {
            track: (operation, startTime) => {
                const duration = Date.now() - startTime;
                this.updatePerformanceMetrics(operation, duration);
            },
            
            getMetrics: () => {
                return this.getPerformanceMetrics();
            },
            
            reset: () => {
                this.resetPerformanceMetrics();
            }
        };
    }
    
    async discoverSubsystems() {
        console.log('👻 [GHOST PRIMARY] Discovering subsystems...');
        
        // Check for GHOST Core
        if (window.GHOSTCore) {
            this.registerSubsystem('core', window.GHOSTCore);
            console.log('👻 [GHOST PRIMARY] Connected to GHOST Core');
        }
        
        // Check for GHOST Integration
        if (window.TINIGhostIntegration) {
            this.registerSubsystem('integration', window.TINIGhostIntegration);
            console.log('👻 [GHOST PRIMARY] Connected to GHOST Integration');
        }
        
        // Check for Boss Life Monitoring
        if (window.BossLifeMonitoring) {
            this.registerSubsystem('monitoring', window.BossLifeMonitoring);
            console.log('👻 [GHOST PRIMARY] Connected to Boss Life Monitoring');
        }
        
        // Check for System Performance Optimizer
        if (window.SystemPerformanceOptimizer) {
            this.registerSubsystem('performance', window.SystemPerformanceOptimizer);
            console.log('👻 [GHOST PRIMARY] Connected to Performance Optimizer');
        }
        
        // Set total subsystems count
        this.controlStatus.totalSubsystems = Object.keys(this.subsystems).filter(key => this.subsystems[key] !== null).length;
        this.controlStatus.subsystemsOnline = this.controlStatus.totalSubsystems;
        
        console.log(`👻 [GHOST PRIMARY] Discovered ${this.controlStatus.totalSubsystems} subsystems`);
    }
    
    registerSubsystem(name, subsystem) {
        if (this.subsystems.hasOwnProperty(name)) {
            this.subsystems[name] = {
                instance: subsystem,
                status: 'online',
                lastHeartbeat: Date.now(),
                registeredAt: Date.now(),
                restartCount: 0
            };
            
            this.controlStatus.subsystemsOnline++;
            
            console.log(`👻 [GHOST PRIMARY] Registered subsystem: ${name}`);
            return true;
        }
        
        console.warn(`👻 [GHOST PRIMARY] Unknown subsystem type: ${name}`);
        return false;
    }
    
    unregisterSubsystem(name) {
        if (this.subsystems[name]) {
            this.subsystems[name] = null;
            this.controlStatus.subsystemsOnline--;
            
            console.log(`👻 [GHOST PRIMARY] Unregistered subsystem: ${name}`);
            return true;
        }
        
        return false;
    }
    
    startHeartbeat() {
        console.log('👻 [GHOST PRIMARY] Starting heartbeat monitoring...');
        
        setInterval(() => {
            if (!this.isActive) return;
            
            this.checkSubsystemsHealth();
            this.updateControlStatus();
            this.processMaintenanceTasks();
            
        }, this.primaryConfig.heartbeatInterval);
    }
    
    checkSubsystemsHealth() {
        const currentTime = Date.now();
        let healthySubsystems = 0;
        
        for (const [name, subsystem] of Object.entries(this.subsystems)) {
            if (subsystem === null) continue;
            
            // Check if subsystem is responding
            try {
                if (this.pingSubsystem(subsystem)) {
                    subsystem.lastHeartbeat = currentTime;
                    subsystem.status = 'online';
                    healthySubsystems++;
                } else {
                    const downtime = currentTime - subsystem.lastHeartbeat;
                    
                    if (downtime > this.primaryConfig.maxSubsystemDowntime) {
                        console.warn(`👻 [GHOST PRIMARY] Subsystem ${name} unresponsive for ${downtime}ms`);
                        subsystem.status = 'unresponsive';
                        
                        if (this.primaryConfig.autoRecoveryEnabled) {
                            this.attemptSubsystemRecovery(name, subsystem);
                        }
                    } else {
                        subsystem.status = 'warning';
                    }
                }
            } catch (error) {
                console.error(`👻 [GHOST PRIMARY] Error checking subsystem ${name}:`, error);
                subsystem.status = 'error';
            }
        }
        
        this.controlStatus.subsystemsOnline = healthySubsystems;
        
        // Check if we need emergency measures
        if (healthySubsystems < this.controlStatus.totalSubsystems / 2) {
            console.warn('👻 [GHOST PRIMARY] Less than 50% subsystems online - considering emergency mode');
            
            if (!this.controlStatus.emergencyMode) {
                this.activateEmergencyMode();
            }
        }
    }
    
    pingSubsystem(subsystem) {
        try {
            // Try to get status from subsystem
            if (subsystem.instance && typeof subsystem.instance.getSystemStatus === 'function') {
                const status = subsystem.instance.getSystemStatus();
                return status && status.initialized;
            }
            
            // Fallback: check if instance exists and has basic properties
            return subsystem.instance && subsystem.instance.initialized;
        } catch (error) {
            return false;
        }
    }
    
    attemptSubsystemRecovery(name, subsystem) {
        console.log(`👻 [GHOST PRIMARY] Attempting recovery for subsystem: ${name}`);
        
        try {
            // Try restarting the subsystem
            if (subsystem.instance && typeof subsystem.instance.init === 'function') {
                subsystem.instance.init();
                subsystem.restartCount++;
                
                console.log(`👻 [GHOST PRIMARY] Restart attempt ${subsystem.restartCount} for ${name}`);
            }
        } catch (error) {
            console.error(`👻 [GHOST PRIMARY] Recovery failed for ${name}:`, error);
        }
    }
    
    startCommandProcessor() {
        console.log('👻 [GHOST PRIMARY] Starting command processor...');
        
        setInterval(() => {
            if (!this.processingCommands && this.commandQueue.length > 0) {
                this.processCommandQueue();
            }
        }, 100);
    }
    
    async processCommandQueue() {
        if (this.processingCommands || this.commandQueue.length === 0) return;
        
        this.processingCommands = true;
        
        while (this.commandQueue.length > 0) {
            const command = this.commandQueue.shift();
            await this.executeQueuedCommand(command);
        }
        
        this.processingCommands = false;
    }
    
    async executeCommand(command, params = {}) {
        const startTime = Date.now();
        this.metrics.totalCommands++;
        
        try {
            console.log(`👻 [GHOST PRIMARY] Executing command: ${command}`);
            
            let result = null;
            
            switch (command) {
                case 'GET_SYSTEM_STATUS':
                    result = this.getSystemStatus();
                    break;
                    
                case 'RESTART_SUBSYSTEM':
                    result = await this.restartSubsystem(params.name);
                    break;
                    
                case 'RESTART_ALL_SUBSYSTEMS':
                    result = await this.restartAllSubsystems();
                    break;
                    
                case 'ACTIVATE_EMERGENCY':
                    result = this.activateEmergencyMode();
                    break;
                    
                case 'DEACTIVATE_EMERGENCY':
                    result = this.deactivateEmergencyMode();
                    break;
                    
                case 'GET_PERFORMANCE_METRICS':
                    result = this.getPerformanceMetrics();
                    break;
                    
                case 'OPTIMIZE_PERFORMANCE':
                    result = await this.optimizeSystemPerformance();
                    break;
                    
                case 'GENERATE_REPORT':
                    result = this.generateSystemReport();
                    break;
                    
                default:
                    throw new Error(`Unknown command: ${command}`);
            }
            
            this.metrics.successfulCommands++;
            this.performanceMonitor.track(command, startTime);
            
            return { success: true, result: result, executionTime: Date.now() - startTime };
            
        } catch (error) {
            this.metrics.failedCommands++;
            console.error(`👻 [GHOST PRIMARY] Command failed: ${command}`, error);
            
            return { success: false, error: error.message, executionTime: Date.now() - startTime };
        }
    }
    
    queueCommand(command, params = {}, priority = 'normal') {
        const queuedCommand = {
            command: command,
            params: params,
            priority: priority,
            queuedAt: Date.now(),
            id: this.generateCommandId()
        };
        
        // Insert based on priority
        if (priority === 'high') {
            this.commandQueue.unshift(queuedCommand);
        } else {
            this.commandQueue.push(queuedCommand);
        }
        
        console.log(`👻 [GHOST PRIMARY] Queued command: ${command} (${priority} priority)`);
        return queuedCommand.id;
    }
    
    async executeQueuedCommand(queuedCommand) {
        const waitTime = Date.now() - queuedCommand.queuedAt;
        console.log(`👻 [GHOST PRIMARY] Processing queued command: ${queuedCommand.command} (waited ${waitTime}ms)`);
        
        return await this.executeCommand(queuedCommand.command, queuedCommand.params);
    }
    
    activateEmergencyMode() {
        if (this.controlStatus.emergencyMode) return;
        
        console.log('🚨 [GHOST PRIMARY] EMERGENCY MODE ACTIVATED!');
        this.controlStatus.emergencyMode = true;
        
        // Notify all subsystems
        this.broadcastToSubsystems('EMERGENCY_MODE_ACTIVATED');
        
        // Activate emergency protocols in each subsystem
        for (const [name, subsystem] of Object.entries(this.subsystems)) {
            if (subsystem && subsystem.instance) {
                try {
                    if (typeof subsystem.instance.handleEmergency === 'function') {
                        subsystem.instance.handleEmergency();
                    }
                } catch (error) {
                    console.error(`👻 [GHOST PRIMARY] Emergency activation failed for ${name}:`, error);
                }
            }
        }
        
        // Notify BOSS if enabled
        if (this.primaryConfig.bossNotificationEnabled) {
            this.notifyBoss('EMERGENCY_MODE_ACTIVATED');
        }
        
        return { emergencyMode: true, activatedAt: Date.now() };
    }
    
    deactivateEmergencyMode() {
        if (!this.controlStatus.emergencyMode) return;
        
        console.log('✅ [GHOST PRIMARY] Emergency mode deactivated');
        this.controlStatus.emergencyMode = false;
        
        // Notify all subsystems
        this.broadcastToSubsystems('EMERGENCY_MODE_DEACTIVATED');
        
        return { emergencyMode: false, deactivatedAt: Date.now() };
    }
    
    async restartSubsystem(name) {
        const subsystem = this.subsystems[name];
        if (!subsystem) {
            throw new Error(`Subsystem not found: ${name}`);
        }
        
        console.log(`👻 [GHOST PRIMARY] Restarting subsystem: ${name}`);
        
        try {
            // Mark as offline
            subsystem.status = 'restarting';
            
            // Restart the subsystem
            if (typeof subsystem.instance.init === 'function') {
                await subsystem.instance.init();
            }
            
            subsystem.status = 'online';
            subsystem.lastHeartbeat = Date.now();
            subsystem.restartCount++;
            
            console.log(`👻 [GHOST PRIMARY] Subsystem ${name} restarted successfully`);
            return { success: true, restartCount: subsystem.restartCount };
            
        } catch (error) {
            subsystem.status = 'error';
            console.error(`👻 [GHOST PRIMARY] Failed to restart ${name}:`, error);
            throw error;
        }
    }
    
    async restartAllSubsystems() {
        console.log('👻 [GHOST PRIMARY] Restarting all subsystems...');
        
        const results = {};
        
        for (const [name, subsystem] of Object.entries(this.subsystems)) {
            if (subsystem) {
                try {
                    results[name] = await this.restartSubsystem(name);
                } catch (error) {
                    results[name] = { success: false, error: error.message };
                }
            }
        }
        
        return results;
    }
    
    async optimizeSystemPerformance() {
        console.log('👻 [GHOST PRIMARY] Optimizing system performance...');
        
        const optimizations = [];
        
        // Run optimization on each subsystem
        for (const [name, subsystem] of Object.entries(this.subsystems)) {
            if (subsystem && subsystem.instance) {
                try {
                    if (typeof subsystem.instance.optimize === 'function') {
                        const result = await subsystem.instance.optimize();
                        optimizations.push({ subsystem: name, result: result });
                    }
                } catch (error) {
                    optimizations.push({ subsystem: name, error: error.message });
                }
            }
        }
        
        return { optimizations: optimizations, timestamp: Date.now() };
    }
    
    broadcastToSubsystems(message) {
        for (const [name, subsystem] of Object.entries(this.subsystems)) {
            if (subsystem && subsystem.instance) {
                try {
                    if (typeof subsystem.instance.handleMessage === 'function') {
                        subsystem.instance.handleMessage(message);
                    }
                } catch (error) {
                    console.warn(`👻 [GHOST PRIMARY] Failed to send message to ${name}:`, error);
                }
            }
        }
    }
    
    getSystemStatus() {
        return {
            primary: {
                system: this.systemName,
                version: this.version,
                active: this.isActive,
                initialized: this.initialized,
                emergencyMode: this.controlStatus.emergencyMode
            },
            control: this.controlStatus,
            subsystems: Object.keys(this.subsystems).reduce((status, name) => {
                const subsystem = this.subsystems[name];
                status[name] = subsystem ? {
                    status: subsystem.status,
                    lastHeartbeat: subsystem.lastHeartbeat,
                    registeredAt: subsystem.registeredAt,
                    restartCount: subsystem.restartCount
                } : null;
                return status;
            }, {}),
            performance: this.getPerformanceMetrics(),
            commandQueue: {
                length: this.commandQueue.length,
                processing: this.processingCommands
            }
        };
    }
    
    getPerformanceMetrics() {
        return {
            ...this.metrics,
            successRate: this.metrics.totalCommands > 0 ? 
                (this.metrics.successfulCommands / this.metrics.totalCommands * 100).toFixed(2) + '%' : '0%',
            lastCheck: Date.now()
        };
    }
    
    generateSystemReport() {
        const status = this.getSystemStatus();
        
        return {
            timestamp: Date.now(),
            report: {
                systemOverview: {
                    primaryController: status.primary,
                    totalSubsystems: this.controlStatus.totalSubsystems,
                    onlineSubsystems: this.controlStatus.subsystemsOnline,
                    systemHealth: this.calculateSystemHealth()
                },
                subsystemDetails: status.subsystems,
                performance: status.performance,
                emergencyStatus: {
                    active: this.controlStatus.emergencyMode,
                    protocols: this.getEmergencyProtocols()
                },
                recommendations: this.generateRecommendations()
            }
        };
    }
    
    calculateSystemHealth() {
        const onlineRatio = this.controlStatus.subsystemsOnline / this.controlStatus.totalSubsystems;
        const successRate = this.metrics.totalCommands > 0 ? 
            this.metrics.successfulCommands / this.metrics.totalCommands : 1;
        
        const health = (onlineRatio * 0.6 + successRate * 0.4) * 100;
        
        if (health >= 90) return 'Excellent';
        if (health >= 75) return 'Good';
        if (health >= 60) return 'Fair';
        if (health >= 40) return 'Poor';
        return 'Critical';
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        if (this.controlStatus.subsystemsOnline < this.controlStatus.totalSubsystems) {
            recommendations.push('Investigate offline subsystems and attempt recovery');
        }
        
        const failureRate = this.metrics.totalCommands > 0 ? 
            this.metrics.failedCommands / this.metrics.totalCommands : 0;
        
        if (failureRate > 0.1) {
            recommendations.push('High command failure rate detected - check system stability');
        }
        
        if (this.commandQueue.length > 10) {
            recommendations.push('Command queue backlog detected - consider performance optimization');
        }
        
        return recommendations;
    }
    
    // Utility methods
    generateCommandId() {
        return 'cmd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    updateControlStatus() {
        this.controlStatus.lastUpdate = Date.now();
    }
    
    processMaintenanceTasks() {
        // Cleanup old commands from queue
        const cutoffTime = Date.now() - 300000; // 5 minutes
        this.commandQueue = this.commandQueue.filter(cmd => cmd.queuedAt > cutoffTime);
    }
    
    broadcastPrimaryStatus(status) {
        const message = {
            timestamp: Date.now(),
            source: 'GHOST_PRIMARY',
            status: status,
            version: this.version,
            subsystemsOnline: this.controlStatus.subsystemsOnline
        };
        
        window.postMessage({ type: 'GHOST_PRIMARY_STATUS', data: message }, '*');
    }
    
    notifyBoss(event) {
        console.log(`👻 [GHOST PRIMARY] BOSS Notification: ${event}`);
        // Notification logic for BOSS
    }
    
    setupEmergencyProtocols() {
        // Emergency protocols setup
        console.log('👻 [GHOST PRIMARY] Emergency protocols ready');
    }
    
    getEmergencyProtocols() {
        return ['SUBSYSTEM_ISOLATION', 'PERFORMANCE_LOCKDOWN', 'SECURITY_ENHANCEMENT'];
    }
    
    handleInitializationFailure(error) {
        console.error('👻 [GHOST PRIMARY] Operating in degraded mode');
    }
}

// Auto-initialize GHOST Primary
window.GHOSTPrimary = new GHOSTPrimary();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GHOSTPrimary;
}

console.log('👻 [GHOST PRIMARY] System loaded and ready for primary control');
