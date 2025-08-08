// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// CONNECTION MANAGER SYSTEM
// 🌐 Hệ thống quản lý kết nối toàn diện

class ConnectionManagerSystem {
    constructor() {
        this.version = '3.0.0';
        this.activeConnections = new Map();
        this.connectionPool = new Map();
        this.connectionStatus = 'initializing';
        this.retryAttempts = new Map();
        this.connectionMetrics = new Map();
        this.bossMode = false;
        this.maxConnections = 10;
        this.connectionTimeout = 30000;
        
        this.init();
    }
    
    init() {
        console.log('🌐 [CONNECTION-MGR] System v' + this.version + ' initializing...');
        this.initializeConnectionPool();
        this.setupConnectionMonitoring();
        this.establishDefaultConnections();
        this.initializeBossMode();
        console.log('🌐 [CONNECTION-MGR] Connection management active');
    }
    
    initializeConnectionPool() {
        // Initialize connection pool with default configurations
        this.connectionConfigs = {
            api_primary: {
                baseURL: window.location.origin,
                timeout: 10000,
                retries: 3,
                priority: 'high'
            },
            api_secondary: {
                baseURL: window.location.origin + '/api',
                timeout: 15000,
                retries: 2,
                priority: 'medium'
            },
            websocket_main: {
                url: this.getWebSocketURL(),
                protocols: ['tini-protocol'],
                priority: 'high',
                autoReconnect: true
            },
            admin_panel: {
                baseURL: window.location.origin + '/admin',
                timeout: 5000,
                retries: 5,
                priority: 'critical'
            },
            ghost_backend: {
                baseURL: this.getGhostBackendURL(),
                timeout: 20000,
                retries: 1,
                priority: 'low'
            }
        };
        
        console.log('🌐 [CONNECTION-MGR] Connection pool initialized with', 
            Object.keys(this.connectionConfigs).length, 'configurations');
    }
    
    getWebSocketURL() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return protocol + '//' + window.location.host + '/ws';
    }
    
    getGhostBackendURL() {
        // Ghost backend URL detection
        const ghostConfig = localStorage.getItem('ghostConfig');
        if (ghostConfig) {
            try {
                const config = JSON.parse(ghostConfig);
                return config.backendURL || window.location.origin;
            } catch (e) {
                return window.location.origin;
            }
        }
        return window.location.origin;
    }
    
    setupConnectionMonitoring() {
        // Monitor connection health
        setInterval(() => {
            this.checkConnectionHealth();
            this.optimizeConnections();
            this.cleanupDeadConnections();
        }, 10000);
        
        // Monitor network events
        window.addEventListener('online', () => {
            this.handleNetworkOnline();
        });
        
        window.addEventListener('offline', () => {
            this.handleNetworkOffline();
        });
        
        // Monitor tab visibility
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }
    
    establishDefaultConnections() {
        // Establish default connections
        console.log('🌐 [CONNECTION-MGR] Establishing default connections...');
        
        // Primary API connection
        this.createConnection('api_primary', this.connectionConfigs.api_primary);
        
        // WebSocket connection
        this.createWebSocketConnection('websocket_main', this.connectionConfigs.websocket_main);
        
        // Admin panel connection (if admin user)
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'admin' || userRole === 'boss') {
            this.createConnection('admin_panel', this.connectionConfigs.admin_panel);
        }
        
        this.connectionStatus = 'ready';
    }
    
    initializeBossMode() {
        // 👑 BOSS Mode initialization
        const bossToken = localStorage.getItem('bossLevel10000');
        if (bossToken === 'true') {
            this.bossMode = true;
            this.optimizeForBoss();
            console.log('👑 [CONNECTION-MGR] BOSS mode activated');
        }
    }
    
    optimizeForBoss() {
        // BOSS gets unlimited connections and priority
        this.maxConnections = Infinity;
        this.connectionTimeout = 60000; // Extended timeout
        
        // BOSS gets priority routing
        Object.keys(this.connectionConfigs).forEach(key => {
            this.connectionConfigs[key].priority = 'boss';
            this.connectionConfigs[key].retries = 10;
            this.connectionConfigs[key].timeout *= 2;
        });
        
        // Establish BOSS-specific connections
        this.createConnection('boss_priority', {
            baseURL: window.location.origin + '/boss',
            timeout: 5000,
            retries: Infinity,
            priority: 'boss'
        });
        
        console.log('👑 [CONNECTION-MGR] BOSS optimization complete - Unlimited priority access');
    }
    
    createConnection(connectionId, config) {
        console.log('🔗 [CONNECTION-MGR] Creating connection:', connectionId);
        
        const connection = {
            id: connectionId,
            config: config,
            status: 'connecting',
            created: Date.now(),
            lastUsed: Date.now(),
            requestCount: 0,
            errorCount: 0,
            latency: 0
        };
        
        // Test connection
        this.testConnection(connection).then(() => {
            connection.status = 'connected';
            this.activeConnections.set(connectionId, connection);
            console.log('✅ [CONNECTION-MGR] Connection established:', connectionId);
            
            this.recordConnectionMetric(connectionId, 'connected', Date.now());
            
        }).catch(error => {
            connection.status = 'failed';
            connection.error = error.message;
            this.handleConnectionError(connectionId, error);
        });
        
        return connection;
    }
    
    createWebSocketConnection(connectionId, config) {
        console.log('🔌 [CONNECTION-MGR] Creating WebSocket connection:', connectionId);
        
        try {
            const ws = new WebSocket(config.url, config.protocols);
            
            const connection = {
                id: connectionId,
                type: 'websocket',
                config: config,
                websocket: ws,
                status: 'connecting',
                created: Date.now(),
                lastUsed: Date.now(),
                messageCount: 0,
                errorCount: 0
            };
            
            ws.onopen = () => {
                console.log('✅ [CONNECTION-MGR] WebSocket connected:', connectionId);
                connection.status = 'connected';
                this.activeConnections.set(connectionId, connection);
                this.recordConnectionMetric(connectionId, 'ws_connected', Date.now());
            };
            
            ws.onclose = (event) => {
                console.log('🔌 [CONNECTION-MGR] WebSocket closed:', connectionId, event.code);
                connection.status = 'closed';
                this.handleWebSocketClose(connectionId, event);
            };
            
            ws.onerror = (error) => {
                console.error('❌ [CONNECTION-MGR] WebSocket error:', connectionId, error);
                connection.status = 'error';
                this.handleConnectionError(connectionId, error);
            };
            
            ws.onmessage = (event) => {
                connection.messageCount++;
                connection.lastUsed = Date.now();
                this.handleWebSocketMessage(connectionId, event.data);
            };
            
            return connection;
            
        } catch (error) {
            console.error('❌ [CONNECTION-MGR] Failed to create WebSocket:', error);
            this.handleConnectionError(connectionId, error);
        }
    }
    
    async testConnection(connection) {
        const startTime = performance.now();
        
        try {
            const response = await fetch(connection.config.baseURL + '/health', {
                method: 'HEAD',
                timeout: connection.config.timeout,
                signal: AbortSignal.timeout(connection.config.timeout)
            });
            
            const endTime = performance.now();
            connection.latency = endTime - startTime;
            
            if (response.ok) {
                return true;
            } else {
                throw new Error('Health check failed: ' + response.status);
            }
            
        } catch (error) {
            // Fallback test with favicon
            try {
                const response = await fetch(connection.config.baseURL + '/favicon.ico', {
                    method: 'HEAD',
                    timeout: connection.config.timeout,
                    signal: AbortSignal.timeout(connection.config.timeout)
                });
                
                const endTime = performance.now();
                connection.latency = endTime - startTime;
                return true;
                
            } catch (fallbackError) {
                throw error;
            }
        }
    }
    
    async makeRequest(connectionId, path, options = {}) {
        const connection = this.activeConnections.get(connectionId);
        
        if (!connection || connection.status !== 'connected') {
            throw new Error('Connection not available: ' + connectionId);
        }
        
        const startTime = performance.now();
        connection.requestCount++;
        connection.lastUsed = Date.now();
        
        const url = connection.config.baseURL + path;
        const requestOptions = {
            timeout: connection.config.timeout,
            signal: AbortSignal.timeout(connection.config.timeout),
            ...options
        };
        
        try {
            // 👑 BOSS priority handling
            if (this.bossMode && connection.config.priority === 'boss') {
                requestOptions.headers = {
                    ...requestOptions.headers,
                    'X-Boss-Priority': 'true',
                    'X-Boss-Level': '10000'
                };
            }
            
            const response = await fetch(url, requestOptions);
            
            const endTime = performance.now();
            const requestLatency = endTime - startTime;
            
            // Update connection metrics
            connection.latency = (connection.latency + requestLatency) / 2; // Running average
            
            this.recordConnectionMetric(connectionId, 'request_success', {
                latency: requestLatency,
                status: response.status
            });
            
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status} ${response.statusText}`);
            }
            
            return response;
            
        } catch (error) {
            connection.errorCount++;
            this.recordConnectionMetric(connectionId, 'request_error', {
                error: error.message,
                latency: performance.now() - startTime
            });
            
            // Auto-retry logic
            if (this.shouldRetry(connection, error)) {
                console.log('🔄 [CONNECTION-MGR] Retrying request:', connectionId);
                return this.retryRequest(connectionId, path, options);
            }
            
            throw error;
        }
    }
    
    shouldRetry(connection, error) {
        const retryCount = this.retryAttempts.get(connection.id) || 0;
        const maxRetries = this.bossMode ? 10 : connection.config.retries;
        
        // Network errors are retryable
        const retryableErrors = ['NetworkError', 'TimeoutError', 'AbortError'];
        const isRetryable = retryableErrors.some(type => error.name.includes(type));
        
        return retryCount < maxRetries && isRetryable;
    }
    
    async retryRequest(connectionId, path, options) {
        const retryCount = this.retryAttempts.get(connectionId) || 0;
        this.retryAttempts.set(connectionId, retryCount + 1);
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
            const result = await this.makeRequest(connectionId, path, options);
            this.retryAttempts.delete(connectionId); // Reset on success
            return result;
        } catch (error) {
            // If this was the last retry, reset the counter
            if (retryCount >= (this.bossMode ? 10 : this.activeConnections.get(connectionId).config.retries)) {
                this.retryAttempts.delete(connectionId);
            }
            throw error;
        }
    }
    
    sendWebSocketMessage(connectionId, message) {
        const connection = this.activeConnections.get(connectionId);
        
        if (!connection || connection.type !== 'websocket' || connection.status !== 'connected') {
            throw new Error('WebSocket connection not available: ' + connectionId);
        }
        
        try {
            const data = typeof message === 'string' ? message : JSON.stringify(message);
            connection.websocket.send(data);
            
            connection.messageCount++;
            connection.lastUsed = Date.now();
            
            this.recordConnectionMetric(connectionId, 'ws_message_sent', {
                size: data.length
            });
            
        } catch (error) {
            console.error('❌ [CONNECTION-MGR] Failed to send WebSocket message:', error);
            this.handleConnectionError(connectionId, error);
            throw error;
        }
    }
    
    handleWebSocketMessage(connectionId, data) {
        console.log('📨 [CONNECTION-MGR] WebSocket message received:', connectionId);
        
        try {
            const message = JSON.parse(data);
            
            // Dispatch message to appropriate handlers
            window.dispatchEvent(new CustomEvent('websocketMessage', {
                detail: {
                    connectionId,
                    message,
                    timestamp: Date.now()
                }
            }));
            
            this.recordConnectionMetric(connectionId, 'ws_message_received', {
                size: data.length,
                type: message.type || 'unknown'
            });
            
        } catch (error) {
            console.warn('⚠️ [CONNECTION-MGR] Failed to parse WebSocket message:', error);
        }
    }
    
    handleWebSocketClose(connectionId, event) {
        const connection = this.activeConnections.get(connectionId);
        
        if (connection && connection.config.autoReconnect) {
            console.log('🔄 [CONNECTION-MGR] Auto-reconnecting WebSocket:', connectionId);
            
            setTimeout(() => {
                this.createWebSocketConnection(connectionId, connection.config);
            }, 5000);
        }
        
        this.recordConnectionMetric(connectionId, 'ws_closed', {
            code: event.code,
            reason: event.reason
        });
    }
    
    checkConnectionHealth() {
        for (const [connectionId, connection] of this.activeConnections.entries()) {
            this.pingConnection(connectionId, connection);
        }
    }
    
    async pingConnection(connectionId, connection) {
        if (connection.type === 'websocket') {
            // WebSocket ping
            if (connection.websocket.readyState === WebSocket.OPEN) {
                try {
                    connection.websocket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
                } catch (error) {
                    console.warn('⚠️ [CONNECTION-MGR] WebSocket ping failed:', connectionId);
                    this.handleConnectionError(connectionId, error);
                }
            }
        } else {
            // HTTP ping
            try {
                await this.testConnection(connection);
                connection.status = 'connected';
            } catch (error) {
                console.warn('⚠️ [CONNECTION-MGR] Connection health check failed:', connectionId);
                connection.status = 'unhealthy';
                this.handleConnectionError(connectionId, error);
            }
        }
    }
    
    optimizeConnections() {
        // Connection optimization based on usage patterns
        for (const [connectionId, connection] of this.activeConnections.entries()) {
            const timeSinceLastUse = Date.now() - connection.lastUsed;
            
            // Close idle connections (except for BOSS)
            if (!this.bossMode && timeSinceLastUse > 300000 && connection.config.priority !== 'critical') {
                console.log('🗑️ [CONNECTION-MGR] Closing idle connection:', connectionId);
                this.closeConnection(connectionId);
            }
            
            // Optimize based on error rate
            if (connection.errorCount > 10 && connection.requestCount > 0) {
                const errorRate = connection.errorCount / connection.requestCount;
                if (errorRate > 0.5) {
                    console.log('🔧 [CONNECTION-MGR] Optimizing high-error connection:', connectionId);
                    this.optimizeConnection(connectionId);
                }
            }
        }
    }
    
    optimizeConnection(connectionId) {
        const connection = this.activeConnections.get(connectionId);
        if (!connection) return;
        
        // Increase timeout for problematic connections
        connection.config.timeout *= 1.5;
        
        // Reduce retry count to fail faster
        connection.config.retries = Math.max(1, Math.floor(connection.config.retries / 2));
        
        console.log('🔧 [CONNECTION-MGR] Connection optimized:', connectionId);
    }
    
    closeConnection(connectionId) {
        const connection = this.activeConnections.get(connectionId);
        if (!connection) return;
        
        if (connection.type === 'websocket' && connection.websocket) {
            connection.websocket.close();
        }
        
        this.activeConnections.delete(connectionId);
        this.retryAttempts.delete(connectionId);
        
        this.recordConnectionMetric(connectionId, 'closed', Date.now());
        console.log('🔌 [CONNECTION-MGR] Connection closed:', connectionId);
    }
    
    cleanupDeadConnections() {
        const deadConnections = [];
        
        for (const [connectionId, connection] of this.activeConnections.entries()) {
            if (connection.status === 'failed' || connection.status === 'closed') {
                deadConnections.push(connectionId);
            }
        }
        
        deadConnections.forEach(connectionId => {
            this.activeConnections.delete(connectionId);
            console.log('🗑️ [CONNECTION-MGR] Cleaned up dead connection:', connectionId);
        });
    }
    
    handleNetworkOnline() {
        console.log('🌐 [CONNECTION-MGR] Network online - Restoring connections');
        
        // Restore all connections
        for (const [connectionId, config] of Object.entries(this.connectionConfigs)) {
            if (!this.activeConnections.has(connectionId)) {
                if (config.url) {
                    this.createWebSocketConnection(connectionId, config);
                } else {
                    this.createConnection(connectionId, config);
                }
            }
        }
        
        this.connectionStatus = 'online';
    }
    
    handleNetworkOffline() {
        console.log('📴 [CONNECTION-MGR] Network offline - Entering offline mode');
        
        // Mark all connections as offline
        for (const [connectionId, connection] of this.activeConnections.entries()) {
            connection.status = 'offline';
        }
        
        this.connectionStatus = 'offline';
        
        // Enable offline mode
        localStorage.setItem('connectionManagerMode', 'offline');
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('👁️ [CONNECTION-MGR] Tab hidden - Reducing connection activity');
            this.pauseNonCriticalConnections();
        } else {
            console.log('👁️ [CONNECTION-MGR] Tab visible - Resuming connection activity');
            this.resumeConnections();
        }
    }
    
    pauseNonCriticalConnections() {
        for (const [connectionId, connection] of this.activeConnections.entries()) {
            if (connection.config.priority !== 'critical' && connection.config.priority !== 'boss') {
                connection.paused = true;
            }
        }
    }
    
    resumeConnections() {
        for (const [connectionId, connection] of this.activeConnections.entries()) {
            connection.paused = false;
        }
    }
    
    handleConnectionError(connectionId, error) {
        console.error('❌ [CONNECTION-MGR] Connection error:', connectionId, error.message);
        
        const connection = this.activeConnections.get(connectionId);
        if (connection) {
            connection.errorCount++;
            connection.lastError = {
                message: error.message,
                timestamp: Date.now()
            };
        }
        
        // Notify error handlers
        window.dispatchEvent(new CustomEvent('connectionError', {
            detail: {
                connectionId,
                error: error.message,
                timestamp: Date.now()
            }
        }));
        
        // Auto-recovery for critical connections
        if (connection && connection.config.priority === 'critical') {
            setTimeout(() => {
                this.createConnection(connectionId, connection.config);
            }, 5000);
        }
    }
    
    recordConnectionMetric(connectionId, event, data) {
        if (!this.connectionMetrics.has(connectionId)) {
            this.connectionMetrics.set(connectionId, []);
        }
        
        const metrics = this.connectionMetrics.get(connectionId);
        metrics.push({
            event,
            data,
            timestamp: Date.now()
        });
        
        // Keep only last 100 metrics per connection
        if (metrics.length > 100) {
            metrics.shift();
        }
    }
    
    // Public API
    getConnectionStatus() {
        const connections = {};
        
        for (const [connectionId, connection] of this.activeConnections.entries()) {
            connections[connectionId] = {
                status: connection.status,
                latency: connection.latency,
                requestCount: connection.requestCount,
                errorCount: connection.errorCount,
                lastUsed: connection.lastUsed
            };
        }
        
        return {
            version: this.version,
            status: this.connectionStatus,
            bossMode: this.bossMode,
            activeConnections: Object.keys(connections).length,
            connections
        };
    }
    
    async request(connectionId, path, options) {
        return this.makeRequest(connectionId, path, options);
    }
    
    websocketSend(connectionId, message) {
        return this.sendWebSocketMessage(connectionId, message);
    }
    
    addConnection(connectionId, config) {
        this.connectionConfigs[connectionId] = config;
        
        if (config.url) {
            return this.createWebSocketConnection(connectionId, config);
        } else {
            return this.createConnection(connectionId, config);
        }
    }
    
    removeConnection(connectionId) {
        this.closeConnection(connectionId);
        delete this.connectionConfigs[connectionId];
    }
    
    exportMetrics() {
        return {
            version: this.version,
            timestamp: Date.now(),
            connections: Object.fromEntries(this.connectionMetrics),
            status: this.getConnectionStatus()
        };
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.TINI_CONNECTION_MANAGER = new ConnectionManagerSystem();
    console.log('🌐 [CONNECTION-MGR] System loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConnectionManagerSystem;
}
