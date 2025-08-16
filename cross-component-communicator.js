// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// CROSS COMPONENT COMMUNICATOR
// 🔄 Hệ thống giao tiếp liên thành phần với message bus và event routing

class CrossComponentCommunicator {
    constructor() {
        this.version = '3.0.0';
        this.communicatorId = 'TINI_COMMUNICATOR_' + Date.now();
        this.messageBus = new Map();
        this.eventRoutes = new Map();
        this.componentMap = new Map();
        this.messageHistory = [];
        this.bossMode = false;
        this.communicationStats = {
            messagesSent: 0,
            messagesReceived: 0,
            eventsRouted: 0,
            errors: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('🔄 [COMMUNICATOR] v' + this.version + ' initializing...');
        this.setupMessageBus();
        this.setupEventRouting();
        this.registerComponents();
        this.activateBossMode();
        this.startCommunicationServices();
        console.log('🔄 [COMMUNICATOR] Cross-component communicator active');
    }
    
    setupMessageBus() {
        // Initialize message bus infrastructure
        this.messageBusConfig = {
            maxQueueSize: 10000,
            maxHistorySize: 1000,
            messageTimeout: 30000,
            retryAttempts: 3,
            compressionEnabled: true,
            encryptionEnabled: false
        };
        
        // Message priorities
        this.messagePriorities = {
            EMERGENCY: 10000,
            BOSS: 9000,
            CRITICAL: 8000,
            HIGH: 7000,
            NORMAL: 5000,
            LOW: 3000,
            BACKGROUND: 1000
        };
        
        // Setup message queues for each priority
        this.messageQueues = new Map();
        Object.keys(this.messagePriorities).forEach(priority => {
            this.messageQueues.set(priority, []);
        });
        
        console.log('🔄 [COMMUNICATOR] Message bus configured');
    }
    
    setupEventRouting() {
        // Setup event routing system
        this.eventRouter = {
            routes: new Map(),
            filters: new Map(),
            transformers: new Map(),
            middleware: [],
            defaultHandler: null
        };
        
        // Setup default event routes
        this.addEventRoute('security/*', ['BOSS_SECURITY', 'AUTHENTICATION']);
        this.addEventRoute('network/*', ['PHANTOM_NETWORK', 'CONNECTION_MANAGER']);
        this.addEventRoute('monitoring/*', ['GHOST_INTEGRATION', 'PERFORMANCE_MONITOR']);
        this.addEventRoute('system/*', ['SYSTEM_BRIDGE']);
        this.addEventRoute('boss/*', ['BOSS_SECURITY']);
        
        // Setup event filters
        this.addEventFilter('security/*', this.securityFilter);
        this.addEventFilter('boss/*', this.bossFilter);
        this.addEventFilter('emergency/*', this.emergencyFilter);
        
        // Setup event transformers
        this.addEventTransformer('authentication', this.authTransformer);
        this.addEventTransformer('performance', this.performanceTransformer);
        
        console.log('🔄 [COMMUNICATOR] Event routing configured');
    }
    
    addEventRoute(pattern, targets) {
        this.eventRouter.routes.set(pattern, targets);
    }
    
    addEventFilter(pattern, filterFunction) {
        this.eventRouter.filters.set(pattern, filterFunction);
    }
    
    addEventTransformer(eventType, transformFunction) {
        this.eventRouter.transformers.set(eventType, transformFunction);
    }
    
    securityFilter = (event) => {
        // Security event filter
        return event.source === 'BOSS_SECURITY' || event.priority >= this.messagePriorities.HIGH;
    };
    
    bossFilter = (event) => {
        // BOSS event filter - only allow BOSS events in BOSS mode
        return this.bossMode || event.source === 'BOSS_SECURITY';
    };
    
    emergencyFilter = (event) => {
        // Emergency event filter - always allow emergency events
        return true;
    };
    
    authTransformer = (event) => {
        // Authentication event transformer
        return {
            ...event,
            transformed: true,
            authLevel: this.determineAuthLevel(event),
            timestamp: Date.now()
        };
    };
    
    performanceTransformer = (event) => {
        // Performance event transformer
        return {
            ...event,
            transformed: true,
            performanceMetrics: this.extractPerformanceMetrics(event),
            timestamp: Date.now()
        };
    };
    
    determineAuthLevel(event) {
        if (event.data && event.data.role) {
            switch (event.data.role) {
                case 'boss': return 10000;
                case 'admin': return 8000;
                case 'employee': return 5000;
                default: return 1000;
            }
        }
        return 1000;
    }
    
    extractPerformanceMetrics(event) {
        return {
            cpu: event.data?.cpu || 0,
            memory: event.data?.memory || 0,
            network: event.data?.network || 0,
            latency: event.data?.latency || 0
        };
    }
    
    registerComponents() {
        // Register all TINI components for communication
        this.registerComponent('BOSS_SECURITY', {
            priority: 10000,
            type: 'security',
            api: 'window.TINI_BOSS_SECURITY',
            events: ['security_alert', 'boss_mode_change', 'threat_detected'],
            methods: ['activate', 'deactivate', 'getStatus']
        });
        
        this.registerComponent('GHOST_INTEGRATION', {
            priority: 9000,
            type: 'monitoring',
            api: 'window.TINI_GHOST_INTEGRATION',
            events: ['ghost_status_change', 'monitoring_alert', 'performance_data'],
            methods: ['startMonitoring', 'stopMonitoring', 'getMetrics']
        });
        
        this.registerComponent('AUTHENTICATION', {
            priority: 8000,
            type: 'auth',
            api: 'window.TINI_ROLE_SECURITY',
            events: ['auth_success', 'auth_failure', 'role_change'],
            methods: ['login', 'logout', 'checkRole']
        });
        
        this.registerComponent('PHANTOM_NETWORK', {
            priority: 7000,
            type: 'network',
            api: 'window.TINI_PHANTOM_NETWORK',
            events: ['network_change', 'phantom_mode_change', 'stealth_update'],
            methods: ['setStealthLevel', 'activatePhantom', 'getStatus']
        });
        
        this.registerComponent('CONNECTION_MANAGER', {
            priority: 6000,
            type: 'connection',
            api: 'window.TINI_CONNECTION_MANAGER',
            events: ['connection_established', 'connection_lost', 'bandwidth_change'],
            methods: ['connect', 'disconnect', 'getConnections']
        });
        
        this.registerComponent('SYSTEM_BRIDGE', {
            priority: 5000,
            type: 'integration',
            api: 'window.TINI_SYSTEM_BRIDGE',
            events: ['system_health', 'integration_status', 'bridge_event'],
            methods: ['getSystemStatus', 'broadcastMessage', 'subscribeEvent']
        });
        
        console.log('🔄 [COMMUNICATOR] Components registered:', this.componentMap.size);
    }
    
    registerComponent(name, config) {
        const component = {
            name,
            id: this.generateComponentId(name),
            ...config,
            events: config.events || [], // Ensure events is always an array
            status: 'registered',
            registeredAt: Date.now(),
            lastCommunication: null,
            messageCount: 0,
            errorCount: 0,
            subscribers: new Set(),
            publishers: new Set()
        };
        
        this.componentMap.set(name, component);
        
        // Setup message bus channel for component
        this.setupComponentChannel(name, component);
        
        console.log('🔄 [COMMUNICATOR] Component registered:', name);
    }
    
    generateComponentId(name) {
        return name.toLowerCase().replace(/_/g, '-') + '-' + Math.random().toString(36).substr(2, 8);
    }
    
    setupComponentChannel(name, component) {
        // Create dedicated message channel for component
        const channel = {
            inbox: [],
            outbox: [],
            maxSize: 1000,
            filters: [],
            transformers: [],
            errorHandler: null
        };
        
        this.messageBus.set(name, channel);
        
        // Setup event subscriptions for component - safe check for events
        const componentEvents = component.events || [];
        componentEvents.forEach(eventType => {
            this.subscribeComponent(name, eventType);
        });
    }
    
    subscribeComponent(componentName, eventType) {
        const component = this.componentMap.get(componentName);
        if (component) {
            component.subscribers.add(eventType);
            
            // Add to event routing
            if (!this.eventRouter.routes.has(eventType)) {
                this.eventRouter.routes.set(eventType, []);
            }
            
            const routes = this.eventRouter.routes.get(eventType);
            if (!routes.includes(componentName)) {
                routes.push(componentName);
            }
        }
    }
    
    activateBossMode() {
        // 👑 BOSS mode activation - Safe for both Node.js and browser
        try {
            const bossToken = typeof localStorage !== 'undefined' 
                ? localStorage.getItem('bossLevel10000')
                : process.env.BOSS_LEVEL_10000;
                
            if (bossToken === 'true') {
                this.bossMode = true;
                this.activateBossPrivileges();
                console.log('👑 [COMMUNICATOR] BOSS mode activated');
            }
        } catch (error) {
            console.log('👑 [COMMUNICATOR] BOSS mode check skipped - environment limitation');
        }
    }
    
    activateBossPrivileges() {
        // BOSS communication privileges
        this.bossPrivileges = {
            unlimited_message_queue: true,
            bypass_all_filters: true,
            highest_priority: true,
            emergency_broadcast: true,
            component_override: true
        };
        
        // Add BOSS priority queue
        this.messageQueues.set('BOSS', []);
        
        // Setup BOSS emergency channel
        this.setupBossEmergencyChannel();
    }
    
    setupBossEmergencyChannel() {
        // Emergency communication channel for BOSS
        this.emergencyChannel = {
            active: true,
            directAccess: true,
            bypassFilters: true,
            maxPriority: true,
            broadcastCapability: true
        };
        
        this.messageBus.set('BOSS_EMERGENCY', {
            inbox: [],
            outbox: [],
            maxSize: Infinity, // Unlimited for BOSS
            filters: [], // No filters for BOSS
            transformers: [],
            errorHandler: this.bossErrorHandler
        });
    }
    
    bossErrorHandler = (error, message) => {
        console.error('👑 [BOSS-COMM] BOSS communication error:', error);
        // BOSS errors are always escalated
        this.escalateBossError(error, message);
    };
    
    escalateBossError(error, message) {
        // Escalate BOSS communication errors
        this.broadcastEmergency('boss_communication_error', {
            error: error.message,
            message: message,
            timestamp: Date.now(),
            severity: 'critical'
        });
    }
    
    startCommunicationServices() {
        // Start message processing
        this.startMessageProcessor();
        
        // Start event router
        this.startEventRouter();
        
        // Start health monitoring
        this.startHealthMonitoring();
        
        // Start statistics collection
        this.startStatisticsCollection();
        
        console.log('🔄 [COMMUNICATOR] Communication services started');
    }
    
    startMessageProcessor() {
        // Process messages from all queues
        this.messageProcessor = setInterval(() => {
            this.processMessageQueues();
        }, 50); // Process every 50ms for responsiveness
    }
    
    processMessageQueues() {
        // Process messages by priority (highest first)
        const priorities = Object.keys(this.messagePriorities)
            .sort((a, b) => this.messagePriorities[b] - this.messagePriorities[a]);
        
        for (const priority of priorities) {
            const queue = this.messageQueues.get(priority);
            if (queue && queue.length > 0) {
                const message = queue.shift();
                this.processMessage(message);
                
                // Process one message per cycle to maintain fairness
                break;
            }
        }
    }
    
    processMessage(message) {
        try {
            // Apply message transformers
            const transformedMessage = this.applyMessageTransformers(message);
            
            // Route message to target components
            this.routeMessage(transformedMessage);
            
            // Update statistics
            this.communicationStats.messagesSent++;
            
            // Add to history
            this.addToHistory(transformedMessage);
            
        } catch (error) {
            console.error('🔄 [COMMUNICATOR] Message processing error:', error);
            this.communicationStats.errors++;
            this.handleMessageError(message, error);
        }
    }
    
    applyMessageTransformers(message) {
        let transformedMessage = { ...message };
        
        // Apply global transformers
        transformedMessage = this.applyGlobalTransformers(transformedMessage);
        
        // Apply component-specific transformers
        transformedMessage = this.applyComponentTransformers(transformedMessage);
        
        return transformedMessage;
    }
    
    applyGlobalTransformers(message) {
        // Add communication metadata
        message.communicationMetadata = {
            processedBy: this.communicatorId,
            processedAt: Date.now(),
            messageId: this.generateMessageId(),
            priority: message.priority || this.messagePriorities.NORMAL
        };
        
        // Add BOSS override if in BOSS mode
        if (this.bossMode && message.source === 'BOSS_SECURITY') {
            message.bossOverride = true;
            message.priority = this.messagePriorities.BOSS;
        }
        
        return message;
    }
    
    applyComponentTransformers(message) {
        // Apply component-specific transformations
        if (message.target) {
            const component = this.componentMap.get(message.target);
            if (component && component.transformers) {
                component.transformers.forEach(transformer => {
                    message = transformer(message);
                });
            }
        }
        
        return message;
    }
    
    generateMessageId() {
        return 'comm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    }
    
    routeMessage(message) {
        if (message.target) {
            // Direct message to specific component
            this.deliverToComponent(message, message.target);
        } else if (message.broadcast) {
            // Broadcast message to all components
            this.broadcastToComponents(message);
        } else {
            // Route based on message type
            this.routeByType(message);
        }
    }
    
    deliverToComponent(message, componentName) {
        const component = this.componentMap.get(componentName);
        if (!component) {
            console.warn('🔄 [COMMUNICATOR] Component not found:', componentName);
            return;
        }
        
        const channel = this.messageBus.get(componentName);
        if (!channel) {
            console.warn('🔄 [COMMUNICATOR] Channel not found for:', componentName);
            return;
        }
        
        // Apply channel filters
        if (!this.passesChannelFilters(message, channel)) {
            console.log('🔄 [COMMUNICATOR] Message filtered for:', componentName);
            return;
        }
        
        // Add to component inbox
        channel.inbox.push(message);
        
        // Trim inbox if too large
        if (channel.inbox.length > channel.maxSize) {
            channel.inbox.shift();
        }
        
        // Update component statistics
        component.messageCount++;
        component.lastCommunication = Date.now();
        
        // Trigger component handler if available
        this.triggerComponentHandler(componentName, message);
    }
    
    passesChannelFilters(message, channel) {
        return channel.filters.every(filter => filter(message));
    }
    
    triggerComponentHandler(componentName, message) {
        try {
            // Try to call component handler
            const component = this.componentMap.get(componentName);
            if (component && component.api) {
                const apiObject = this.getComponentApi(component.api);
                if (apiObject && typeof apiObject.handleMessage === 'function') {
                    apiObject.handleMessage(message);
                }
            }
        } catch (error) {
            console.warn('🔄 [COMMUNICATOR] Component handler error:', error);
            const component = this.componentMap.get(componentName);
            if (component) {
                component.errorCount++;
            }
        }
    }
    
    getComponentApi(apiPath) {
        try {
            // Resolve API object from path
            const parts = apiPath.split('.');
            let obj = window;
            
            for (const part of parts) {
                if (part === 'window') continue;
                obj = obj[part];
                if (!obj) return null;
            }
            
            return obj;
        } catch (error) {
            return null;
        }
    }
    
    broadcastToComponents(message) {
        // Broadcast to all registered components except sender
        for (const [componentName, component] of this.componentMap.entries()) {
            if (componentName !== message.source) {
                this.deliverToComponent(message, componentName);
            }
        }
    }
    
    routeByType(message) {
        // Route message based on type using event router
        const routes = this.findEventRoutes(message.type);
        
        routes.forEach(componentName => {
            this.deliverToComponent(message, componentName);
        });
    }
    
    findEventRoutes(eventType) {
        const routes = [];
        
        // Check exact matches
        if (this.eventRouter.routes.has(eventType)) {
            routes.push(...this.eventRouter.routes.get(eventType));
        }
        
        // Check pattern matches
        for (const [pattern, targets] of this.eventRouter.routes.entries()) {
            if (this.matchesPattern(eventType, pattern)) {
                routes.push(...targets);
            }
        }
        
        return [...new Set(routes)]; // Remove duplicates
    }
    
    matchesPattern(eventType, pattern) {
        // Simple pattern matching with wildcards
        if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
            return regex.test(eventType);
        }
        
        return eventType === pattern;
    }
    
    startEventRouter() {
        // Start event routing service
        this.eventRouter.processor = setInterval(() => {
            this.processEventQueue();
        }, 100); // Process events every 100ms
    }
    
    processEventQueue() {
        // Process pending events in event router
        const events = this.collectPendingEvents();
        
        events.forEach(event => {
            this.routeEvent(event);
        });
    }
    
    collectPendingEvents() {
        const events = [];
        
        // Collect events from all component outboxes
        for (const [componentName, channel] of this.messageBus.entries()) {
            while (channel.outbox.length > 0) {
                const event = channel.outbox.shift();
                event.source = componentName;
                events.push(event);
            }
        }
        
        return events;
    }
    
    routeEvent(event) {
        try {
            // Apply event filters
            if (!this.passesEventFilters(event)) {
                return;
            }
            
            // Apply event transformers
            const transformedEvent = this.applyEventTransformers(event);
            
            // Route to target components
            const routes = this.findEventRoutes(event.type);
            
            routes.forEach(componentName => {
                this.deliverEventToComponent(transformedEvent, componentName);
            });
            
            // Update statistics
            this.communicationStats.eventsRouted++;
            
        } catch (error) {
            console.error('🔄 [COMMUNICATOR] Event routing error:', error);
            this.communicationStats.errors++;
        }
    }
    
    passesEventFilters(event) {
        for (const [pattern, filter] of this.eventRouter.filters.entries()) {
            if (this.matchesPattern(event.type, pattern)) {
                if (!filter(event)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    applyEventTransformers(event) {
        let transformedEvent = { ...event };
        
        for (const [eventType, transformer] of this.eventRouter.transformers.entries()) {
            if (event.type === eventType || this.matchesPattern(event.type, eventType)) {
                transformedEvent = transformer(transformedEvent);
            }
        }
        
        return transformedEvent;
    }
    
    deliverEventToComponent(event, componentName) {
        const message = {
            type: 'event',
            eventType: event.type,
            data: event.data,
            source: event.source,
            target: componentName,
            timestamp: Date.now(),
            priority: this.messagePriorities.NORMAL
        };
        
        this.deliverToComponent(message, componentName);
    }
    
    startHealthMonitoring() {
        // Monitor communication health
        this.healthMonitor = setInterval(() => {
            this.checkCommunicationHealth();
        }, 10000); // Check every 10 seconds
    }
    
    checkCommunicationHealth() {
        const health = this.getCommunicationHealth();
        
        if (health.status === 'critical') {
            this.handleCriticalCommunicationHealth(health);
        } else if (health.status === 'warning') {
            this.handleCommunicationWarning(health);
        }
    }
    
    getCommunicationHealth() {
        const now = Date.now();
        const activeComponents = Array.from(this.componentMap.values())
            .filter(comp => comp.lastCommunication && (now - comp.lastCommunication) < 60000);
        
        const totalComponents = this.componentMap.size;
        const healthRatio = activeComponents.length / totalComponents;
        
        let status = 'healthy';
        if (healthRatio < 0.5) status = 'critical';
        else if (healthRatio < 0.8) status = 'warning';
        
        return {
            status,
            activeComponents: activeComponents.length,
            totalComponents,
            healthRatio,
            messageQueueSizes: this.getMessageQueueSizes(),
            errorRate: this.calculateErrorRate(),
            timestamp: now
        };
    }
    
    getMessageQueueSizes() {
        const sizes = {};
        for (const [priority, queue] of this.messageQueues.entries()) {
            sizes[priority] = queue.length;
        }
        return sizes;
    }
    
    calculateErrorRate() {
        const total = this.communicationStats.messagesSent + this.communicationStats.eventsRouted;
        return total > 0 ? this.communicationStats.errors / total : 0;
    }
    
    handleCriticalCommunicationHealth(health) {
        console.error('🚨 [COMMUNICATOR] Critical communication health:', health);
        
        // Emergency recovery procedures
        this.attemptEmergencyRecovery();
        
        // Notify BOSS if in BOSS mode
        if (this.bossMode) {
            this.notifyBoss('critical_communication_health', health);
        }
    }
    
    handleCommunicationWarning(health) {
        console.warn('⚠️ [COMMUNICATOR] Communication health warning:', health);
        
        // Attempt component reconnection
        this.attemptComponentReconnection();
    }
    
    attemptEmergencyRecovery() {
        console.log('🚑 [COMMUNICATOR] Attempting emergency recovery...');
        
        // Clear all message queues
        this.messageQueues.forEach(queue => queue.length = 0);
        
        // Reset component error counts
        this.componentMap.forEach(component => {
            component.errorCount = 0;
        });
        
        // Reset statistics
        this.communicationStats.errors = 0;
        
        console.log('🚑 [COMMUNICATOR] Emergency recovery completed');
    }
    
    attemptComponentReconnection() {
        const now = Date.now();
        
        for (const [name, component] of this.componentMap.entries()) {
            if (!component.lastCommunication || (now - component.lastCommunication) > 30000) {
                console.log('🔄 [COMMUNICATOR] Attempting reconnection to:', name);
                this.pingComponent(name);
            }
        }
    }
    
    pingComponent(componentName) {
        const pingMessage = {
            type: 'ping',
            data: { timestamp: Date.now() },
            source: this.communicatorId,
            target: componentName,
            priority: this.messagePriorities.HIGH
        };
        
        this.sendMessage(pingMessage);
    }
    
    startStatisticsCollection() {
        // Collect communication statistics
        this.statisticsCollector = setInterval(() => {
            this.collectStatistics();
        }, 30000); // Collect every 30 seconds
    }
    
    collectStatistics() {
        const stats = {
            timestamp: Date.now(),
            ...this.communicationStats,
            componentStats: this.getComponentStatistics(),
            queueStats: this.getQueueStatistics(),
            healthStats: this.getCommunicationHealth()
        };
        
        // Store recent statistics
        if (!this.statisticsHistory) {
            this.statisticsHistory = [];
        }
        
        this.statisticsHistory.push(stats);
        
        // Keep only last 100 statistics records
        if (this.statisticsHistory.length > 100) {
            this.statisticsHistory.shift();
        }
    }
    
    getComponentStatistics() {
        const stats = {};
        
        for (const [name, component] of this.componentMap.entries()) {
            stats[name] = {
                messageCount: component.messageCount,
                errorCount: component.errorCount,
                lastCommunication: component.lastCommunication,
                status: component.status
            };
        }
        
        return stats;
    }
    
    getQueueStatistics() {
        const stats = {};
        
        for (const [priority, queue] of this.messageQueues.entries()) {
            stats[priority] = queue.length;
        }
        
        return stats;
    }
    
    addToHistory(message) {
        this.messageHistory.push({
            ...message,
            processedAt: Date.now()
        });
        
        // Keep only last 1000 messages
        if (this.messageHistory.length > this.messageBusConfig.maxHistorySize) {
            this.messageHistory.shift();
        }
    }
    
    handleMessageError(message, error) {
        console.error('🔄 [COMMUNICATOR] Message error:', {
            messageId: message.communicationMetadata?.messageId,
            type: message.type,
            target: message.target,
            error: error.message
        });
        
        // Add to error log
        if (!this.errorLog) {
            this.errorLog = [];
        }
        
        this.errorLog.push({
            message,
            error: error.message,
            timestamp: Date.now()
        });
        
        // Keep only last 100 errors
        if (this.errorLog.length > 100) {
            this.errorLog.shift();
        }
    }
    
    // Public API
    sendMessage(message) {
        // Determine priority
        const priority = this.determinePriority(message);
        
        // Add to appropriate queue
        const queue = this.messageQueues.get(priority);
        if (queue) {
            queue.push(message);
            return true;
        }
        
        return false;
    }
    
    determinePriority(message) {
        // BOSS messages get highest priority
        if (this.bossMode && message.source === 'BOSS_SECURITY') {
            return 'BOSS';
        }
        
        // Emergency messages
        if (message.type && message.type.includes('emergency')) {
            return 'EMERGENCY';
        }
        
        // Use explicit priority or default
        if (message.priority) {
            const priorityName = Object.keys(this.messagePriorities)
                .find(p => this.messagePriorities[p] === message.priority);
            return priorityName || 'NORMAL';
        }
        
        return 'NORMAL';
    }
    
    broadcastMessage(type, data, source = null) {
        const message = {
            type,
            data,
            source: source || this.communicatorId,
            broadcast: true,
            timestamp: Date.now(),
            priority: this.messagePriorities.NORMAL
        };
        
        return this.sendMessage(message);
    }
    
    broadcastEmergency(type, data) {
        const message = {
            type: 'emergency_' + type,
            data,
            source: this.communicatorId,
            broadcast: true,
            timestamp: Date.now(),
            priority: this.messagePriorities.EMERGENCY
        };
        
        return this.sendMessage(message);
    }
    
    notifyBoss(type, data) {
        const message = {
            type: 'boss_notification_' + type,
            data,
            source: this.communicatorId,
            target: 'BOSS_SECURITY',
            timestamp: Date.now(),
            priority: this.messagePriorities.BOSS
        };
        
        return this.sendMessage(message);
    }
    
    publishEvent(eventType, data, source = null) {
        const event = {
            type: eventType,
            data,
            source: source || this.communicatorId,
            timestamp: Date.now()
        };
        
        // Add to event router
        this.routeEvent(event);
        
        this.communicationStats.eventsRouted++;
        
        return true;
    }
    
    subscribeToEvent(componentName, eventType, handler) {
        this.subscribeComponent(componentName, eventType);
        
        // Setup handler
        const component = this.componentMap.get(componentName);
        if (component) {
            if (!component.eventHandlers) {
                component.eventHandlers = new Map();
            }
            component.eventHandlers.set(eventType, handler);
        }
    }
    
    getCommunicationStatus() {
        return {
            version: this.version,
            communicatorId: this.communicatorId,
            bossMode: this.bossMode,
            statistics: this.communicationStats,
            components: Array.from(this.componentMap.entries()).map(([name, comp]) => ({
                name,
                status: comp.status,
                messageCount: comp.messageCount,
                errorCount: comp.errorCount,
                lastCommunication: comp.lastCommunication
            })),
            health: this.getCommunicationHealth(),
            queueSizes: this.getMessageQueueSizes()
        };
    }
    
    exportCommunicationConfig() {
        return {
            version: this.version,
            timestamp: Date.now(),
            config: {
                communicatorId: this.communicatorId,
                bossMode: this.bossMode,
                messageBusConfig: this.messageBusConfig
            },
            status: this.getCommunicationStatus(),
            statistics: this.statisticsHistory?.slice(-10) // Last 10 statistics
        };
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.TINI_CROSS_COMMUNICATOR = new CrossComponentCommunicator();
    console.log('🔄 [COMMUNICATOR] Cross Component Communicator loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossComponentCommunicator;
}
// ST:TINI_1755361782_e868a412
