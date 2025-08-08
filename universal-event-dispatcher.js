// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// UNIVERSAL EVENT DISPATCHER
// 🌐 Bộ điều phối sự kiện toàn cục với khả năng phân tán và xử lý đồng thời

class UniversalEventDispatcher {
    constructor() {
        this.version = '3.0.0';
        this.dispatcherId = 'TINI_DISPATCHER_' + Date.now();
        this.eventRegistry = new Map();
        this.listenerRegistry = new Map();
        this.eventQueue = [];
        this.priorityQueues = new Map();
        this.eventHistory = [];
        this.bossMode = false;
        this.dispatcherStats = {
            eventsDispatched: 0,
            listenersRegistered: 0,
            queueSize: 0,
            errors: 0,
            avgProcessingTime: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('🌐 [EVENT-DISPATCHER] v' + this.version + ' initializing...');
        this.setupEventInfrastructure();
        this.initializePrioritySystem();
        this.registerSystemEvents();
        this.activateBossMode();
        this.startDispatcherServices();
        console.log('🌐 [EVENT-DISPATCHER] Universal event dispatcher active');
    }
    
    setupEventInfrastructure() {
        // Initialize event infrastructure
        this.eventConfig = {
            maxQueueSize: 50000,
            maxHistorySize: 10000,
            batchSize: 100,
            processingInterval: 10,
            defaultTimeout: 30000,
            enableBatching: true,
            enablePersistence: false
        };
        
        // Event types classification
        this.eventTypes = {
            SYSTEM: 'system',
            SECURITY: 'security',
            AUTHENTICATION: 'authentication',
            NETWORK: 'network',
            MONITORING: 'monitoring',
            USER: 'user',
            BOSS: 'boss',
            EMERGENCY: 'emergency'
        };
        
        // Event priority levels
        this.eventPriorities = {
            EMERGENCY: 10000,
            BOSS: 9000,
            CRITICAL: 8000,
            HIGH: 7000,
            NORMAL: 5000,
            LOW: 3000,
            BACKGROUND: 1000
        };
        
        console.log('🌐 [EVENT-DISPATCHER] Infrastructure configured');
    }
    
    initializePrioritySystem() {
        // Initialize priority queues
        Object.keys(this.eventPriorities).forEach(priority => {
            this.priorityQueues.set(priority, []);
        });
        
        // Setup priority processing
        this.priorityProcessor = {
            active: false,
            batchProcessing: true,
            parallelProcessing: true,
            maxConcurrency: 10,
            currentJobs: 0
        };
        
        console.log('🌐 [EVENT-DISPATCHER] Priority system initialized');
    }
    
    registerSystemEvents() {
        // Register core system events
        this.registerEventType('system.startup', {
            priority: this.eventPriorities.HIGH,
            persistent: true,
            broadcast: true
        });
        
        this.registerEventType('system.shutdown', {
            priority: this.eventPriorities.EMERGENCY,
            persistent: true,
            broadcast: true
        });
        
        this.registerEventType('security.alert', {
            priority: this.eventPriorities.CRITICAL,
            persistent: true,
            requiresAuth: true
        });
        
        this.registerEventType('boss.command', {
            priority: this.eventPriorities.BOSS,
            persistent: true,
            requiresAuth: true,
            bossOnly: true
        });
        
        this.registerEventType('authentication.success', {
            priority: this.eventPriorities.HIGH,
            persistent: false,
            broadcast: true
        });
        
        this.registerEventType('authentication.failure', {
            priority: this.eventPriorities.HIGH,
            persistent: true,
            broadcast: true
        });
        
        this.registerEventType('network.status', {
            priority: this.eventPriorities.NORMAL,
            persistent: false,
            broadcast: false
        });
        
        this.registerEventType('monitoring.performance', {
            priority: this.eventPriorities.LOW,
            persistent: false,
            broadcast: false
        });
        
        this.registerEventType('emergency.*', {
            priority: this.eventPriorities.EMERGENCY,
            persistent: true,
            broadcast: true,
            bypassFilters: true
        });
        
        console.log('🌐 [EVENT-DISPATCHER] System events registered');
    }
    
    registerEventType(eventType, config) {
        this.eventRegistry.set(eventType, {
            type: eventType,
            ...config,
            registeredAt: Date.now(),
            listenerCount: 0,
            dispatchCount: 0,
            lastDispatched: null
        });
    }
    
    activateBossMode() {
        // 👑 BOSS mode activation using environment config
        const bossTokenKey = window.tiniConfig ? window.tiniConfig.get('BOSS_LEVEL_TOKEN') : window.tiniConfig?.get('BOSS_LEVEL_TOKEN') || 'bossLevel10000';
        const bossToken = localStorage.getItem(bossTokenKey);
        if (bossToken === 'true') {
            this.bossMode = true;
            this.activateBossPrivileges();
            console.log('👑 [EVENT-DISPATCHER] BOSS mode activated');
        }
    }
    
    activateBossPrivileges() {
        // BOSS dispatcher privileges
        this.bossPrivileges = {
            unlimited_queue_size: true,
            bypass_all_filters: true,
            highest_priority: true,
            emergency_dispatch: true,
            system_override: true,
            direct_injection: true
        };
        
        // Setup BOSS emergency dispatcher
        this.setupBossEmergencyDispatcher();
        
        // Enable unlimited processing for BOSS
        this.eventConfig.maxQueueSize = Infinity;
        this.priorityProcessor.maxConcurrency = Infinity;
    }
    
    setupBossEmergencyDispatcher() {
        // Emergency dispatcher for BOSS
        this.emergencyDispatcher = {
            active: true,
            directMode: true,
            bypassQueue: true,
            instantProcessing: true,
            unlimitedPower: true
        };
        
        // Register BOSS emergency events
        this.registerEventType('boss.emergency.*', {
            priority: this.eventPriorities.EMERGENCY + 1000,
            persistent: true,
            broadcast: true,
            bypassFilters: true,
            instantDispatch: true
        });
    }
    
    startDispatcherServices() {
        // Start event processing
        this.startEventProcessor();
        
        // Start queue monitoring
        this.startQueueMonitoring();
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        // Start cleanup service
        this.startCleanupService();
        
        this.priorityProcessor.active = true;
        
        console.log('🌐 [EVENT-DISPATCHER] Dispatcher services started');
    }
    
    startEventProcessor() {
        // Main event processing loop
        this.eventProcessor = setInterval(() => {
            this.processEventQueues();
        }, this.eventConfig.processingInterval);
    }
    
    processEventQueues() {
        if (this.priorityProcessor.currentJobs >= this.priorityProcessor.maxConcurrency) {
            return; // Too many concurrent jobs
        }
        
        // Process by priority (highest first)
        const priorities = Object.keys(this.eventPriorities)
            .sort((a, b) => this.eventPriorities[b] - this.eventPriorities[a]);
        
        for (const priority of priorities) {
            const queue = this.priorityQueues.get(priority);
            if (queue && queue.length > 0) {
                if (this.eventConfig.enableBatching) {
                    this.processBatch(priority);
                } else {
                    this.processSingleEvent(priority);
                }
                break; // Process one priority level per cycle
            }
        }
    }
    
    processBatch(priority) {
        const queue = this.priorityQueues.get(priority);
        const batchSize = Math.min(this.eventConfig.batchSize, queue.length);
        const batch = queue.splice(0, batchSize);
        
        if (this.priorityProcessor.parallelProcessing) {
            this.processEventsParallel(batch);
        } else {
            this.processEventsSequential(batch);
        }
    }
    
    processSingleEvent(priority) {
        const queue = this.priorityQueues.get(priority);
        const event = queue.shift();
        
        if (event) {
            this.processEvent(event);
        }
    }
    
    async processEventsParallel(events) {
        this.priorityProcessor.currentJobs += events.length;
        
        const promises = events.map(event => this.processEventAsync(event));
        
        try {
            await Promise.allSettled(promises);
        } catch (error) {
            console.error('🌐 [EVENT-DISPATCHER] Parallel processing error:', error);
        } finally {
            this.priorityProcessor.currentJobs -= events.length;
        }
    }
    
    processEventsSequential(events) {
        this.priorityProcessor.currentJobs++;
        
        for (const event of events) {
            try {
                this.processEvent(event);
            } catch (error) {
                console.error('🌐 [EVENT-DISPATCHER] Sequential processing error:', error);
                this.handleEventError(event, error);
            }
        }
        
        this.priorityProcessor.currentJobs--;
    }
    
    async processEventAsync(event) {
        return new Promise((resolve, reject) => {
            try {
                this.processEvent(event);
                resolve(event);
            } catch (error) {
                this.handleEventError(event, error);
                reject(error);
            }
        });
    }
    
    processEvent(event) {
        const startTime = performance.now();
        
        try {
            // Apply event filters
            if (!this.passesEventFilters(event)) {
                return;
            }
            
            // Get event listeners
            const listeners = this.getEventListeners(event.type);
            
            if (listeners.length === 0) {
                return; // No listeners
            }
            
            // Dispatch to listeners
            this.dispatchToListeners(event, listeners);
            
            // Update statistics
            this.updateDispatchStats(event, startTime);
            
            // Add to history
            this.addToHistory(event);
            
            // Update event registry
            this.updateEventRegistry(event.type);
            
        } catch (error) {
            console.error('🌐 [EVENT-DISPATCHER] Event processing error:', error);
            this.handleEventError(event, error);
        }
    }
    
    passesEventFilters(event) {
        // BOSS events bypass all filters
        if (this.bossMode && (event.bossOverride || event.type.startsWith('boss.'))) {
            return true;
        }
        
        // Emergency events bypass filters
        if (event.type.startsWith('emergency.')) {
            return true;
        }
        
        // Apply standard filters
        return this.applyStandardFilters(event);
    }
    
    applyStandardFilters(event) {
        // Check event authentication requirements
        const eventConfig = this.getEventConfig(event.type);
        if (eventConfig && eventConfig.requiresAuth && !this.isEventAuthenticated(event)) {
            return false;
        }
        
        // Check BOSS-only events
        if (eventConfig && eventConfig.bossOnly && !this.bossMode) {
            return false;
        }
        
        // Check rate limiting
        if (!this.passesRateLimit(event.type)) {
            return false;
        }
        
        return true;
    }
    
    getEventConfig(eventType) {
        // Direct match
        if (this.eventRegistry.has(eventType)) {
            return this.eventRegistry.get(eventType);
        }
        
        // Pattern match (e.g., emergency.*)
        for (const [registeredType, config] of this.eventRegistry.entries()) {
            if (this.matchesEventPattern(eventType, registeredType)) {
                return config;
            }
        }
        
        return null;
    }
    
    matchesEventPattern(eventType, pattern) {
        if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
            return regex.test(eventType);
        }
        return eventType === pattern;
    }
    
    isEventAuthenticated(event) {
        // Check if event has valid authentication
        return event.authenticated === true || 
               event.source === 'BOSS_SECURITY' ||
               this.bossMode;
    }
    
    passesRateLimit(eventType) {
        // Simple rate limiting implementation
        const now = Date.now();
        const rateLimitKey = 'rate_' + eventType;
        const lastDispatch = this.rateLimitCache?.get(rateLimitKey) || 0;
        
        if (now - lastDispatch < 100) { // 100ms minimum interval
            return false;
        }
        
        if (!this.rateLimitCache) {
            this.rateLimitCache = new Map();
        }
        
        this.rateLimitCache.set(rateLimitKey, now);
        return true;
    }
    
    getEventListeners(eventType) {
        const listeners = [];
        
        // Get direct listeners
        const directListeners = this.listenerRegistry.get(eventType) || [];
        listeners.push(...directListeners);
        
        // Get pattern listeners
        for (const [pattern, patternListeners] of this.listenerRegistry.entries()) {
            if (pattern.includes('*') && this.matchesEventPattern(eventType, pattern)) {
                listeners.push(...patternListeners);
            }
        }
        
        return listeners;
    }
    
    dispatchToListeners(event, listeners) {
        listeners.forEach(listener => {
            try {
                if (typeof listener.callback === 'function') {
                    listener.callback(event);
                    listener.callCount++;
                    listener.lastCalled = Date.now();
                }
            } catch (error) {
                console.error('🌐 [EVENT-DISPATCHER] Listener error:', error);
                listener.errorCount++;
                this.handleListenerError(listener, event, error);
            }
        });
    }
    
    updateDispatchStats(event, startTime) {
        const processingTime = performance.now() - startTime;
        
        this.dispatcherStats.eventsDispatched++;
        this.dispatcherStats.avgProcessingTime = 
            (this.dispatcherStats.avgProcessingTime + processingTime) / 2;
    }
    
    addToHistory(event) {
        this.eventHistory.push({
            ...event,
            dispatchedAt: Date.now(),
            dispatcherId: this.dispatcherId
        });
        
        // Trim history if too large
        if (this.eventHistory.length > this.eventConfig.maxHistorySize) {
            this.eventHistory.shift();
        }
    }
    
    updateEventRegistry(eventType) {
        const config = this.getEventConfig(eventType);
        if (config) {
            config.dispatchCount++;
            config.lastDispatched = Date.now();
        }
    }
    
    handleEventError(event, error) {
        this.dispatcherStats.errors++;
        
        console.error('🌐 [EVENT-DISPATCHER] Event error:', {
            eventType: event.type,
            eventId: event.id,
            error: error.message,
            timestamp: Date.now()
        });
        
        // Log error
        this.logError(event, error);
        
        // Dispatch error event
        this.dispatchErrorEvent(event, error);
    }
    
    handleListenerError(listener, event, error) {
        console.error('🌐 [EVENT-DISPATCHER] Listener error:', {
            listenerId: listener.id,
            eventType: event.type,
            error: error.message
        });
        
        // Dispatch listener error event
        this.dispatch('system.listener.error', {
            listenerId: listener.id,
            eventType: event.type,
            error: error.message,
            timestamp: Date.now()
        });
    }
    
    logError(event, error) {
        if (!this.errorLog) {
            this.errorLog = [];
        }
        
        this.errorLog.push({
            event,
            error: error.message,
            stack: error.stack,
            timestamp: Date.now()
        });
        
        // Keep only last 1000 errors
        if (this.errorLog.length > 1000) {
            this.errorLog.shift();
        }
    }
    
    dispatchErrorEvent(event, error) {
        const errorEvent = {
            type: 'system.event.error',
            data: {
                originalEvent: event,
                error: error.message,
                timestamp: Date.now()
            },
            priority: this.eventPriorities.HIGH,
            source: this.dispatcherId,
            id: this.generateEventId()
        };
        
        // Dispatch immediately to avoid recursion
        this.processEvent(errorEvent);
    }
    
    startQueueMonitoring() {
        // Monitor queue sizes
        this.queueMonitor = setInterval(() => {
            this.monitorQueues();
        }, 5000); // Check every 5 seconds
    }
    
    monitorQueues() {
        const totalQueueSize = Array.from(this.priorityQueues.values())
            .reduce((sum, queue) => sum + queue.length, 0);
        
        this.dispatcherStats.queueSize = totalQueueSize;
        
        if (totalQueueSize > this.eventConfig.maxQueueSize * 0.8) {
            console.warn('⚠️ [EVENT-DISPATCHER] Queue size warning:', totalQueueSize);
            this.handleQueueOverload();
        }
        
        if (totalQueueSize > this.eventConfig.maxQueueSize) {
            console.error('🚨 [EVENT-DISPATCHER] Queue overflow!');
            this.handleQueueOverflow();
        }
    }
    
    handleQueueOverload() {
        // Drop low priority events
        const lowPriorityQueue = this.priorityQueues.get('LOW');
        const backgroundQueue = this.priorityQueues.get('BACKGROUND');
        
        if (lowPriorityQueue.length > 0) {
            lowPriorityQueue.splice(0, Math.floor(lowPriorityQueue.length / 2));
        }
        
        if (backgroundQueue.length > 0) {
            backgroundQueue.length = 0;
        }
        
        console.log('🧹 [EVENT-DISPATCHER] Low priority events dropped to manage overload');
    }
    
    handleQueueOverflow() {
        // Emergency queue cleanup
        this.priorityQueues.get('BACKGROUND').length = 0;
        this.priorityQueues.get('LOW').length = 0;
        
        const normalQueue = this.priorityQueues.get('NORMAL');
        normalQueue.splice(0, Math.floor(normalQueue.length / 2));
        
        console.log('🚨 [EVENT-DISPATCHER] Emergency queue cleanup performed');
        
        // Dispatch overflow event
        this.dispatch('system.queue.overflow', {
            timestamp: Date.now(),
            severity: 'critical'
        });
    }
    
    startPerformanceMonitoring() {
        // Monitor dispatcher performance
        this.performanceMonitor = setInterval(() => {
            this.monitorPerformance();
        }, 10000); // Check every 10 seconds
    }
    
    monitorPerformance() {
        const performance = this.getPerformanceMetrics();
        
        if (performance.avgProcessingTime > 100) {
            console.warn('⚠️ [EVENT-DISPATCHER] High processing time:', performance.avgProcessingTime + 'ms');
        }
        
        if (performance.errorRate > 0.05) {
            console.warn('⚠️ [EVENT-DISPATCHER] High error rate:', (performance.errorRate * 100).toFixed(2) + '%');
        }
    }
    
    getPerformanceMetrics() {
        const totalEvents = this.dispatcherStats.eventsDispatched;
        const errorRate = totalEvents > 0 ? this.dispatcherStats.errors / totalEvents : 0;
        
        return {
            eventsDispatched: this.dispatcherStats.eventsDispatched,
            avgProcessingTime: this.dispatcherStats.avgProcessingTime,
            queueSize: this.dispatcherStats.queueSize,
            errorRate,
            listenersRegistered: this.dispatcherStats.listenersRegistered,
            currentJobs: this.priorityProcessor.currentJobs,
            timestamp: Date.now()
        };
    }
    
    startCleanupService() {
        // Regular cleanup of old data
        this.cleanupService = setInterval(() => {
            this.performCleanup();
        }, 300000); // Cleanup every 5 minutes
    }
    
    performCleanup() {
        // Clean up old history
        const now = Date.now();
        const maxAge = 3600000; // 1 hour
        
        this.eventHistory = this.eventHistory.filter(event => 
            (now - event.dispatchedAt) < maxAge
        );
        
        // Clean up rate limit cache
        if (this.rateLimitCache) {
            for (const [key, timestamp] of this.rateLimitCache.entries()) {
                if ((now - timestamp) > 60000) { // 1 minute
                    this.rateLimitCache.delete(key);
                }
            }
        }
        
        // Clean up error log
        if (this.errorLog) {
            this.errorLog = this.errorLog.filter(error =>
                (now - error.timestamp) < maxAge
            );
        }
        
        console.log('🧹 [EVENT-DISPATCHER] Cleanup completed');
    }
    
    // Public API
    dispatch(eventType, data = null, options = {}) {
        const event = {
            type: eventType,
            data,
            id: this.generateEventId(),
            timestamp: Date.now(),
            source: options.source || 'dispatcher',
            priority: options.priority || this.determinePriority(eventType),
            authenticated: options.authenticated || false,
            bossOverride: this.bossMode && options.bossOverride !== false,
            ...options
        };
        
        // BOSS emergency dispatch
        if (this.bossMode && this.emergencyDispatcher.active && 
            (event.type.startsWith('boss.emergency') || options.emergencyDispatch)) {
            return this.emergencyDispatch(event);
        }
        
        // Add to appropriate priority queue
        const priority = this.getPriorityName(event.priority);
        const queue = this.priorityQueues.get(priority);
        
        if (queue) {
            queue.push(event);
            return event.id;
        }
        
        return null;
    }
    
    emergencyDispatch(event) {
        // BOSS emergency immediate dispatch
        console.log('👑 [EVENT-DISPATCHER] BOSS emergency dispatch:', event.type);
        
        try {
            this.processEvent(event);
            return event.id;
        } catch (error) {
            console.error('👑 [EVENT-DISPATCHER] BOSS emergency dispatch error:', error);
            return null;
        }
    }
    
    generateEventId() {
        return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    }
    
    determinePriority(eventType) {
        // BOSS events get highest priority
        if (eventType.startsWith('boss.')) {
            return this.eventPriorities.BOSS;
        }
        
        // Emergency events
        if (eventType.startsWith('emergency.')) {
            return this.eventPriorities.EMERGENCY;
        }
        
        // Security events
        if (eventType.startsWith('security.')) {
            return this.eventPriorities.CRITICAL;
        }
        
        // System events
        if (eventType.startsWith('system.')) {
            return this.eventPriorities.HIGH;
        }
        
        return this.eventPriorities.NORMAL;
    }
    
    getPriorityName(priorityValue) {
        for (const [name, value] of Object.entries(this.eventPriorities)) {
            if (value === priorityValue) {
                return name;
            }
        }
        return 'NORMAL';
    }
    
    addEventListener(eventType, callback, options = {}) {
        const listener = {
            id: this.generateListenerId(),
            eventType,
            callback,
            options,
            registeredAt: Date.now(),
            callCount: 0,
            errorCount: 0,
            lastCalled: null
        };
        
        if (!this.listenerRegistry.has(eventType)) {
            this.listenerRegistry.set(eventType, []);
        }
        
        this.listenerRegistry.get(eventType).push(listener);
        this.dispatcherStats.listenersRegistered++;
        
        console.log('👂 [EVENT-DISPATCHER] Listener registered:', eventType);
        
        return listener.id;
    }
    
    generateListenerId() {
        return 'listener_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
    
    removeEventListener(listenerId) {
        for (const [eventType, listeners] of this.listenerRegistry.entries()) {
            const index = listeners.findIndex(listener => listener.id === listenerId);
            if (index !== -1) {
                listeners.splice(index, 1);
                this.dispatcherStats.listenersRegistered--;
                console.log('🚫 [EVENT-DISPATCHER] Listener removed:', listenerId);
                return true;
            }
        }
        return false;
    }
    
    removeAllEventListeners(eventType) {
        if (this.listenerRegistry.has(eventType)) {
            const count = this.listenerRegistry.get(eventType).length;
            this.listenerRegistry.delete(eventType);
            this.dispatcherStats.listenersRegistered -= count;
            console.log('🚫 [EVENT-DISPATCHER] All listeners removed for:', eventType);
            return count;
        }
        return 0;
    }
    
    hasEventListeners(eventType) {
        const listeners = this.listenerRegistry.get(eventType);
        return listeners && listeners.length > 0;
    }
    
    getEventListenerCount(eventType) {
        const listeners = this.listenerRegistry.get(eventType);
        return listeners ? listeners.length : 0;
    }
    
    broadcastEvent(eventType, data, options = {}) {
        return this.dispatch(eventType, data, {
            ...options,
            broadcast: true,
            priority: options.priority || this.eventPriorities.HIGH
        });
    }
    
    dispatchBossEvent(eventType, data, options = {}) {
        if (!this.bossMode) {
            console.warn('👑 [EVENT-DISPATCHER] BOSS event requires BOSS mode');
            return null;
        }
        
        return this.dispatch('boss.' + eventType, data, {
            ...options,
            bossOverride: true,
            priority: this.eventPriorities.BOSS,
            authenticated: true
        });
    }
    
    dispatchEmergencyEvent(eventType, data, options = {}) {
        return this.dispatch('emergency.' + eventType, data, {
            ...options,
            priority: this.eventPriorities.EMERGENCY,
            bypassFilters: true,
            emergencyDispatch: this.bossMode
        });
    }
    
    getDispatcherStatus() {
        return {
            version: this.version,
            dispatcherId: this.dispatcherId,
            bossMode: this.bossMode,
            active: this.priorityProcessor.active,
            statistics: this.dispatcherStats,
            performance: this.getPerformanceMetrics(),
            queueSizes: Object.fromEntries(
                Array.from(this.priorityQueues.entries()).map(([priority, queue]) => [
                    priority, queue.length
                ])
            ),
            registeredEvents: this.eventRegistry.size,
            registeredListeners: this.listenerRegistry.size
        };
    }
    
    exportDispatcherConfig() {
        return {
            version: this.version,
            timestamp: Date.now(),
            config: {
                dispatcherId: this.dispatcherId,
                bossMode: this.bossMode,
                eventConfig: this.eventConfig
            },
            status: this.getDispatcherStatus(),
            eventHistory: this.eventHistory.slice(-100), // Last 100 events
            errorLog: this.errorLog?.slice(-50) // Last 50 errors
        };
    }
    
    // Cleanup
    destroy() {
        // Stop all services
        if (this.eventProcessor) clearInterval(this.eventProcessor);
        if (this.queueMonitor) clearInterval(this.queueMonitor);
        if (this.performanceMonitor) clearInterval(this.performanceMonitor);
        if (this.cleanupService) clearInterval(this.cleanupService);
        
        // Clear all data
        this.eventQueue.length = 0;
        this.priorityQueues.clear();
        this.eventHistory.length = 0;
        this.listenerRegistry.clear();
        this.eventRegistry.clear();
        
        this.priorityProcessor.active = false;
        
        console.log('🌐 [EVENT-DISPATCHER] Dispatcher destroyed');
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.TINI_UNIVERSAL_DISPATCHER = new UniversalEventDispatcher();
    console.log('🌐 [EVENT-DISPATCHER] Universal Event Dispatcher loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalEventDispatcher;
}
