// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 👻 GHOST Integration Bridge v3.5
 * Cầu nối tích hợp GHOST cho TINI Extension
 * Advanced communication bridge between TINI systems and GHOST monitoring
 */

class TINIGhostIntegrationBridge {
    constructor() {
        this.version = "3.5";
        this.bridgeActive = false;
        this.connections = new Map();
        this.messageQueue = [];
        this.bridgeProtocol = {
            TINI_TO_GHOST: 'tini->ghost',
            GHOST_TO_TINI: 'ghost->tini',
            SYSTEM_SYNC: 'system-sync',
            DATA_EXCHANGE: 'data-exchange'
        };
        
        console.log(`👻 [GHOST BRIDGE] Initializing Bridge v${this.version}`);
        this.initializeBridge();
    }
    
    async initializeBridge() {
        try {
            // Setup bridge infrastructure
            await this.setupBridgeInfrastructure();
            
            // Initialize communication channels
            await this.initializeCommunicationChannels();
            
            // Setup message routing
            await this.setupMessageRouting();
            
            // Initialize data synchronization
            await this.initializeDataSync();
            
            // Setup bridge monitoring
            await this.setupBridgeMonitoring();
            
            this.bridgeActive = true;
            console.log('👻 [GHOST BRIDGE] Bridge operational');
            
        } catch (error) {
            console.error('👻 [GHOST BRIDGE] Bridge initialization failed:', error);
            this.handleBridgeFailure(error);
        }
    }
    
    async setupBridgeInfrastructure() {
        console.log('👻 [GHOST BRIDGE] Setting up bridge infrastructure...');
        
        // Create bridge channels
        this.channels = {
            command: new BroadcastChannel('tini-ghost-commands'),
            data: new BroadcastChannel('tini-ghost-data'),
            sync: new BroadcastChannel('tini-ghost-sync'),
            emergency: new BroadcastChannel('tini-ghost-emergency')
        };
        
        // Setup channel listeners
        Object.keys(this.channels).forEach(channelName => {
            this.channels[channelName].onmessage = (event) => {
                this.handleChannelMessage(channelName, event.data);
            };
        });
        
        // Initialize bridge storage
        this.bridgeStorage = {
            cache: new Map(),
            pending: new Map(),
            history: []
        };
        
        console.log('👻 [GHOST BRIDGE] Infrastructure ready');
    }
    
    async initializeCommunicationChannels() {
        console.log('👻 [GHOST BRIDGE] Initializing communication channels...');
        
        // Setup TINI system connections
        this.setupTINIConnections();
        
        // Setup GHOST system connections
        this.setupGHOSTConnections();
        
        // Setup cross-system communication
        this.setupCrossSystemCommunication();
        
        console.log('👻 [GHOST BRIDGE] Communication channels established');
    }
    
    setupTINIConnections() {
        // Connect to TINI Popup
        if (window.tiniPopupIntegration) {
            this.registerConnection('tini-popup', window.tiniPopupIntegration);
        }
        
        // Connect to TINI Admin Panel
        if (window.TINIAdminPanel) {
            this.registerConnection('tini-admin', window.TINIAdminPanel);
        }
        
        // Connect to TINI Security
        if (window.TINISecuritySystem) {
            this.registerConnection('tini-security', window.TINISecuritySystem);
        }
        
        // Connect to TINI Content Scripts
        if (window.TINIContentScript) {
            this.registerConnection('tini-content', window.TINIContentScript);
        }
    }
    
    setupGHOSTConnections() {
        // Connect to GHOST Core
        if (window.TINIGHOSTCore) {
            this.registerConnection('ghost-core', window.TINIGHOSTCore);
        }
        
        // Connect to GHOST Primary
        if (window.TINIGHOSTPrimary) {
            this.registerConnection('ghost-primary', window.TINIGHOSTPrimary);
        }
        
        // Connect to GHOST Integration
        if (window.tiniGhostIntegration) {
            this.registerConnection('ghost-integration', window.tiniGhostIntegration);
        }
        
        // Connect to Boss Life Monitoring
        if (window.TINIBossLifeMonitoring) {
            this.registerConnection('ghost-boss', window.TINIBossLifeMonitoring);
        }
    }
    
    registerConnection(systemId, systemInstance) {
        this.connections.set(systemId, {
            instance: systemInstance,
            status: 'connected',
            lastPing: Date.now(),
            messageCount: 0
        });
        
        console.log(`👻 [GHOST BRIDGE] Connected to ${systemId}`);
    }
    
    setupCrossSystemCommunication() {
        // Setup message passing between systems
        this.messageRouter = {
            route: (from, to, message) => this.routeMessage(from, to, message),
            broadcast: (message) => this.broadcastMessage(message),
            relay: (systemId, message) => this.relayMessage(systemId, message)
        };
        
        // Setup event forwarding
        this.eventForwarder = {
            forward: (event, data) => this.forwardEvent(event, data),
            subscribe: (system, event) => this.subscribeToEvent(system, event),
            unsubscribe: (system, event) => this.unsubscribeFromEvent(system, event)
        };
    }
    
    async setupMessageRouting() {
        console.log('👻 [GHOST BRIDGE] Setting up message routing...');
        
        this.messageHandlers = {
            // TINI to GHOST messages
            'tini-to-ghost': (message) => this.handleTINIToGHOSTMessage(message),
            
            // GHOST to TINI messages
            'ghost-to-tini': (message) => this.handleGHOSTToTINIMessage(message),
            
            // System synchronization
            'system-sync': (message) => this.handleSystemSyncMessage(message),
            
            // Data exchange
            'data-exchange': (message) => this.handleDataExchangeMessage(message),
            
            // Emergency messages
            'emergency': (message) => this.handleEmergencyMessage(message)
        };
        
        console.log('👻 [GHOST BRIDGE] Message routing configured');
    }
    
    async initializeDataSync() {
        console.log('👻 [GHOST BRIDGE] Initializing data synchronization...');
        
        // Setup data sync intervals
        this.syncIntervals = {
            fast: setInterval(() => this.performFastSync(), 1000),      // 1 second
            medium: setInterval(() => this.performMediumSync(), 5000),   // 5 seconds
            slow: setInterval(() => this.performSlowSync(), 30000)       // 30 seconds
        };
        
        // Setup data validation
        this.dataValidator = {
            validate: (data) => this.validateData(data),
            sanitize: (data) => this.sanitizeData(data),
            verify: (data) => this.verifyDataIntegrity(data)
        };
        
        console.log('👻 [GHOST BRIDGE] Data synchronization active');
    }
    
    async setupBridgeMonitoring() {
        console.log('👻 [GHOST BRIDGE] Setting up bridge monitoring...');
        
        // Monitor bridge health
        this.healthMonitor = setInterval(() => {
            this.checkBridgeHealth();
        }, 10000); // Every 10 seconds
        
        // Monitor connection status
        this.connectionMonitor = setInterval(() => {
            this.checkConnectionStatus();
        }, 5000); // Every 5 seconds
        
        // Monitor message queue
        this.queueMonitor = setInterval(() => {
            this.processMessageQueue();
        }, 1000); // Every second
        
        console.log('👻 [GHOST BRIDGE] Bridge monitoring active');
    }
    
    // Message handling methods
    handleChannelMessage(channelName, data) {
        console.log(`👻 [GHOST BRIDGE] Channel ${channelName} received:`, data);
        
        try {
            const message = {
                channel: channelName,
                data: data,
                timestamp: Date.now(),
                id: this.generateMessageId()
            };
            
            // Route message based on type
            if (this.messageHandlers[data.type]) {
                this.messageHandlers[data.type](message);
            } else {
                this.handleUnknownMessage(message);
            }
            
        } catch (error) {
            console.error('👻 [GHOST BRIDGE] Message handling error:', error);
        }
    }
    
    handleTINIToGHOSTMessage(message) {
        const { target, command, data } = message.data;
        
        // Find target GHOST system
        const ghostConnection = this.findGHOSTConnection(target);
        if (ghostConnection) {
            this.sendToSystem(ghostConnection, command, data);
        } else {
            console.warn(`👻 [GHOST BRIDGE] GHOST target ${target} not found`);
        }
    }
    
    handleGHOSTToTINIMessage(message) {
        const { target, command, data } = message.data;
        
        // Find target TINI system
        const tiniConnection = this.findTINIConnection(target);
        if (tiniConnection) {
            this.sendToSystem(tiniConnection, command, data);
        } else {
            console.warn(`👻 [GHOST BRIDGE] TINI target ${target} not found`);
        }
    }
    
    handleSystemSyncMessage(message) {
        const { systems, syncType, data } = message.data;
        
        systems.forEach(systemId => {
            const connection = this.connections.get(systemId);
            if (connection) {
                this.syncSystemData(connection, syncType, data);
            }
        });
    }
    
    handleDataExchangeMessage(message) {
        const { from, to, dataType, payload } = message.data;
        
        // Validate and sanitize data
        const validatedData = this.dataValidator.validate(payload);
        if (validatedData) {
            this.exchangeData(from, to, dataType, validatedData);
        }
    }
    
    handleEmergencyMessage(message) {
        console.warn('👻 [GHOST BRIDGE] Emergency message received:', message);
        
        // Broadcast emergency to all systems
        this.connections.forEach((connection, systemId) => {
            if (connection.instance && typeof connection.instance.handleEmergency === 'function') {
                connection.instance.handleEmergency(message.data);
            }
        });
    }
    
    // Core bridge functionality
    sendMessage(from, to, type, data) {
        const message = {
            id: this.generateMessageId(),
            from: from,
            to: to,
            type: type,
            data: data,
            timestamp: Date.now()
        };
        
        // Add to queue for processing
        this.messageQueue.push(message);
        
        // Log message
        this.logBridgeActivity('message_sent', message);
        
        return message.id;
    }
    
    routeMessage(from, to, message) {
        const targetConnection = this.connections.get(to);
        if (targetConnection) {
            this.deliverMessage(targetConnection, message);
            return true;
        }
        
        console.warn(`👻 [GHOST BRIDGE] Cannot route to ${to} - connection not found`);
        return false;
    }
    
    broadcastMessage(message) {
        let delivered = 0;
        
        this.connections.forEach((connection, systemId) => {
            if (this.deliverMessage(connection, message)) {
                delivered++;
            }
        });
        
        console.log(`👻 [GHOST BRIDGE] Broadcast delivered to ${delivered} systems`);
        return delivered;
    }
    
    deliverMessage(connection, message) {
        try {
            if (connection.instance && typeof connection.instance.receiveMessage === 'function') {
                connection.instance.receiveMessage(message);
                connection.messageCount++;
                return true;
            }
        } catch (error) {
            console.error('👻 [GHOST BRIDGE] Message delivery failed:', error);
        }
        
        return false;
    }
    
    // Data synchronization methods
    performFastSync() {
        if (!this.bridgeActive) return;
        
        // Sync critical real-time data
        this.syncStatusData();
        this.syncPerformanceData();
    }
    
    performMediumSync() {
        if (!this.bridgeActive) return;
        
        // Sync system states
        this.syncSystemStates();
        this.syncConfigurationData();
    }
    
    performSlowSync() {
        if (!this.bridgeActive) return;
        
        // Sync historical data
        this.syncHistoricalData();
        this.syncStatisticsData();
        this.cleanupOldData();
    }
    
    syncStatusData() {
        const statusData = {
            bridgeStatus: this.getBridgeStatus(),
            systemStatus: this.getSystemStatus(),
            connectionStatus: this.getConnectionStatus()
        };
        
        this.broadcastSyncData('status', statusData);
    }
    
    syncPerformanceData() {
        const performanceData = {
            bridgePerformance: this.getBridgePerformance(),
            systemPerformance: this.getSystemPerformance(),
            networkPerformance: this.getNetworkPerformance()
        };
        
        this.broadcastSyncData('performance', performanceData);
    }
    
    // Monitoring methods
    checkBridgeHealth() {
        const health = {
            bridgeActive: this.bridgeActive,
            connectionsActive: this.connections.size,
            queueSize: this.messageQueue.length,
            memoryUsage: this.getBridgeMemoryUsage()
        };
        
        // Check for issues
        if (health.queueSize > 100) {
            console.warn('👻 [GHOST BRIDGE] Message queue backup detected');
            this.processMessageQueue(true); // Force process
        }
        
        this.logBridgeActivity('health_check', health);
    }
    
    checkConnectionStatus() {
        const now = Date.now();
        const staleThreshold = 30000; // 30 seconds
        
        this.connections.forEach((connection, systemId) => {
            if (now - connection.lastPing > staleThreshold) {
                console.warn(`👻 [GHOST BRIDGE] Connection ${systemId} appears stale`);
                this.attemptReconnection(systemId);
            }
        });
    }
    
    processMessageQueue(force = false) {
        if (!this.bridgeActive && !force) return;
        
        const batchSize = 10;
        const batch = this.messageQueue.splice(0, batchSize);
        
        batch.forEach(message => {
            this.routeMessage(message.from, message.to, message);
        });
        
        if (batch.length > 0) {
            console.log(`👻 [GHOST BRIDGE] Processed ${batch.length} messages`);
        }
    }
    
    // Utility methods
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    findGHOSTConnection(target) {
        const ghostSystems = ['ghost-core', 'ghost-primary', 'ghost-integration', 'ghost-boss'];
        return ghostSystems.find(system => this.connections.has(system) && system.includes(target));
    }
    
    findTINIConnection(target) {
        const tiniSystems = ['tini-popup', 'tini-admin', 'tini-security', 'tini-content'];
        return tiniSystems.find(system => this.connections.has(system) && system.includes(target));
    }
    
    logBridgeActivity(type, data) {
        if (!this.bridgeStorage.history) {
            this.bridgeStorage.history = [];
        }
        
        this.bridgeStorage.history.push({
            type: type,
            data: data,
            timestamp: Date.now()
        });
        
        // Keep only last 1000 entries
        if (this.bridgeStorage.history.length > 1000) {
            this.bridgeStorage.history = this.bridgeStorage.history.slice(-1000);
        }
    }
    
    // Public API
    getBridgeStatus() {
        return {
            version: this.version,
            active: this.bridgeActive,
            connections: this.connections.size,
            queueSize: this.messageQueue.length,
            uptime: Date.now() - this.startTime
        };
    }
    
    getConnectionList() {
        const connections = [];
        this.connections.forEach((connection, systemId) => {
            connections.push({
                id: systemId,
                status: connection.status,
                lastPing: connection.lastPing,
                messageCount: connection.messageCount
            });
        });
        return connections;
    }
    
    sendTINIToGHOST(target, command, data) {
        return this.sendMessage('bridge', target, this.bridgeProtocol.TINI_TO_GHOST, {
            target: target,
            command: command,
            data: data
        });
    }
    
    sendGHOSTToTINI(target, command, data) {
        return this.sendMessage('bridge', target, this.bridgeProtocol.GHOST_TO_TINI, {
            target: target,
            command: command,
            data: data
        });
    }
    
    emergencyBroadcast(message) {
        return this.sendMessage('bridge', 'all', 'emergency', message);
    }
    
    handleBridgeFailure(error) {
        console.error('👻 [GHOST BRIDGE] Critical bridge failure:', error);
        
        // Attempt recovery
        setTimeout(() => {
            console.log('👻 [GHOST BRIDGE] Attempting bridge recovery...');
            this.initializeBridge();
        }, 5000);
    }
    
    destroy() {
        this.bridgeActive = false;
        
        // Clear intervals
        Object.values(this.syncIntervals).forEach(interval => clearInterval(interval));
        clearInterval(this.healthMonitor);
        clearInterval(this.connectionMonitor);
        clearInterval(this.queueMonitor);
        
        // Close channels
        Object.values(this.channels).forEach(channel => channel.close());
        
        console.log('👻 [GHOST BRIDGE] Bridge destroyed');
    }
}

// Initialize GHOST Integration Bridge
document.addEventListener('DOMContentLoaded', () => {
    window.TINIGhostIntegrationBridge = TINIGhostIntegrationBridge;
    window.tiniGhostBridge = new TINIGhostIntegrationBridge();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIGhostIntegrationBridge;
}

console.log('👻 [GHOST BRIDGE] Integration bridge system loaded');
