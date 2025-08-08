// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// NETWORK MONITOR CLIENT
// 🌐 Hệ thống giám sát mạng phía client

class NetworkMonitorClient {
    constructor() {
        this.version = '3.0.0';
        this.monitoring = true;
        this.networkData = new Map();
        this.connectionStatus = 'unknown';
        this.bandwidthTest = null;
        this.latencyTests = [];
        this.bossMode = false;
        
        this.init();
    }
    
    init() {
        console.log('🌐 [NETWORK-MONITOR] Client v' + this.version + ' initializing...');
        this.detectNetworkCapabilities();
        this.setupConnectionMonitoring();
        this.startNetworkAnalysis();
        this.initializeBossMode();
        console.log('🌐 [NETWORK-MONITOR] Client monitoring active');
    }
    
    detectNetworkCapabilities() {
        // Detect available network APIs
        this.capabilities = {
            navigator_connection: 'connection' in navigator,
            network_information: 'NetworkInformation' in window,
            performance_timing: 'performance' in window,
            fetch_api: 'fetch' in window,
            websocket: 'WebSocket' in window,
            webrtc: 'RTCPeerConnection' in window
        };
        
        console.log('🌐 [NETWORK-MONITOR] Network capabilities detected:', 
            Object.keys(this.capabilities).filter(k => this.capabilities[k]).length + '/6');
    }
    
    setupConnectionMonitoring() {
        // Monitor connection status
        window.addEventListener('online', () => {
            this.handleConnectionChange('online');
        });
        
        window.addEventListener('offline', () => {
            this.handleConnectionChange('offline');
        });
        
        // Monitor connection info if available
        if (navigator.connection) {
            this.monitorConnectionInfo();
        }
        
        // Monitor network timing
        this.monitorNetworkTiming();
    }
    
    handleConnectionChange(status) {
        console.log('🌐 [NETWORK-MONITOR] Connection status:', status);
        
        this.connectionStatus = status;
        this.recordNetworkEvent('connection_change', {
            status,
            timestamp: Date.now()
        });
        
        // Notify other systems
        window.dispatchEvent(new CustomEvent('networkStatusChange', {
            detail: { status, timestamp: Date.now() }
        }));
        
        if (status === 'offline') {
            this.handleOfflineMode();
        } else {
            this.handleOnlineMode();
        }
    }
    
    monitorConnectionInfo() {
        const connection = navigator.connection;
        
        setInterval(() => {
            const connectionInfo = {
                type: connection.type || 'unknown',
                effectiveType: connection.effectiveType || 'unknown',
                downlink: connection.downlink || 0,
                rtt: connection.rtt || 0,
                saveData: connection.saveData || false,
                timestamp: Date.now()
            };
            
            this.recordNetworkData('connection_info', connectionInfo);
            
            // Check for significant changes
            this.analyzeConnectionChanges(connectionInfo);
            
        }, 5000);
        
        // Listen for connection change events
        connection.addEventListener('change', () => {
            console.log('🌐 [NETWORK-MONITOR] Connection info changed');
            this.recordNetworkEvent('connection_info_change', {
                type: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt
            });
        });
    }
    
    monitorNetworkTiming() {
        // Monitor network timing using Performance API
        setInterval(() => {
            this.measureNetworkLatency();
            this.measureBandwidth();
            this.analyzeNetworkPerformance();
        }, 10000);
    }
    
    measureNetworkLatency() {
        const startTime = performance.now();
        const testUrl = window.location.origin + '/favicon.ico?t=' + Date.now();
        
        fetch(testUrl, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
        }).then(() => {
            const latency = performance.now() - startTime;
            this.recordNetworkData('latency', latency);
            
            // Keep recent latency tests
            this.latencyTests.push({
                latency,
                timestamp: Date.now()
            });
            
            // Keep only last 20 tests
            if (this.latencyTests.length > 20) {
                this.latencyTests.shift();
            }
            
            if (latency > 1000) {
                console.warn('⚠️ [NETWORK-MONITOR] High latency detected:', latency + 'ms');
                this.handleNetworkIssue('HIGH_LATENCY', { latency });
            }
            
        }).catch(error => {
            console.warn('🌐 [NETWORK-MONITOR] Latency test failed:', error.message);
            this.recordNetworkEvent('latency_test_failed', {
                error: error.message,
                timestamp: Date.now()
            });
        });
    }
    
    measureBandwidth() {
        // Simple bandwidth test using small resource
        const testSize = 10000; // 10KB
        const testUrl = window.location.origin + '/favicon.ico?size=' + testSize + '&t=' + Date.now();
        const startTime = performance.now();
        
        fetch(testUrl, {
            cache: 'no-cache'
        }).then(response => {
            if (response.ok) {
                const endTime = performance.now();
                const duration = endTime - startTime;
                const bandwidth = (testSize * 8) / (duration / 1000); // bits per second
                
                this.recordNetworkData('bandwidth', {
                    bandwidth: bandwidth,
                    duration: duration,
                    size: testSize,
                    timestamp: Date.now()
                });
                
                console.log('🌐 [NETWORK-MONITOR] Bandwidth estimate:', 
                    this.formatBandwidth(bandwidth));
            }
        }).catch(error => {
            console.warn('🌐 [NETWORK-MONITOR] Bandwidth test failed:', error.message);
        });
    }
    
    formatBandwidth(bps) {
        if (bps >= 1000000) {
            return (bps / 1000000).toFixed(2) + ' Mbps';
        } else if (bps >= 1000) {
            return (bps / 1000).toFixed(2) + ' Kbps';
        } else {
            return bps.toFixed(0) + ' bps';
        }
    }
    
    startNetworkAnalysis() {
        // Start continuous network analysis
        setInterval(() => {
            this.analyzeNetworkTrends();
            this.detectNetworkAnomalies();
            this.generateNetworkReport();
            this.cleanupOldNetworkData();
        }, 30000); // Every 30 seconds
        
        console.log('🌐 [NETWORK-MONITOR] Network analysis started');
    }
    
    analyzeConnectionChanges(newInfo) {
        const previousData = this.networkData.get('connection_info');
        if (previousData && previousData.length > 0) {
            const lastInfo = previousData[previousData.length - 1];
            
            // Check for significant changes
            if (lastInfo.effectiveType !== newInfo.effectiveType) {
                console.log('🌐 [NETWORK-MONITOR] Connection type changed:', 
                    lastInfo.effectiveType + ' → ' + newInfo.effectiveType);
                
                this.recordNetworkEvent('connection_type_change', {
                    from: lastInfo.effectiveType,
                    to: newInfo.effectiveType,
                    timestamp: Date.now()
                });
            }
            
            // Check for significant bandwidth changes
            if (Math.abs(lastInfo.downlink - newInfo.downlink) > 1) {
                console.log('🌐 [NETWORK-MONITOR] Bandwidth changed:', 
                    lastInfo.downlink + ' → ' + newInfo.downlink + ' Mbps');
            }
        }
    }
    
    analyzeNetworkTrends() {
        // Analyze latency trends
        if (this.latencyTests.length > 5) {
            const recentLatencies = this.latencyTests.slice(-5).map(t => t.latency);
            const avgLatency = recentLatencies.reduce((sum, l) => sum + l, 0) / recentLatencies.length;
            
            this.recordNetworkData('avg_latency', avgLatency);
            
            // Check for degrading performance
            const trend = this.calculateLatencyTrend();
            if (trend === 'degrading') {
                console.warn('📉 [NETWORK-MONITOR] Network performance degrading');
                this.handleNetworkIssue('DEGRADING_PERFORMANCE', {
                    average_latency: avgLatency,
                    trend: 'degrading'
                });
            }
        }
        
        // Analyze bandwidth trends
        const bandwidthData = this.networkData.get('bandwidth');
        if (bandwidthData && bandwidthData.length > 3) {
            const recentBandwidth = bandwidthData.slice(-3);
            const avgBandwidth = recentBandwidth.reduce((sum, b) => sum + b.bandwidth, 0) / recentBandwidth.length;
            
            this.recordNetworkData('avg_bandwidth', avgBandwidth);
        }
    }
    
    calculateLatencyTrend() {
        if (this.latencyTests.length < 5) return 'unknown';
        
        const recent = this.latencyTests.slice(-5);
        let increasing = 0;
        
        for (let i = 1; i < recent.length; i++) {
            if (recent[i].latency > recent[i-1].latency) {
                increasing++;
            }
        }
        
        return increasing >= 3 ? 'degrading' : 'stable';
    }
    
    detectNetworkAnomalies() {
        // Detect network anomalies
        const currentTime = Date.now();
        
        // Check for connection drops
        this.checkConnectionDrops();
        
        // Check for unusual latency spikes
        this.checkLatencySpikes();
        
        // Check for bandwidth fluctuations
        this.checkBandwidthFluctuations();
    }
    
    checkConnectionDrops() {
        const connectionEvents = this.networkData.get('connection_change') || [];
        const recentEvents = connectionEvents.filter(e => 
            Date.now() - e.timestamp < 300000 // Last 5 minutes
        );
        
        const offlineEvents = recentEvents.filter(e => e.status === 'offline');
        if (offlineEvents.length > 3) {
            console.warn('🔴 [NETWORK-MONITOR] Frequent connection drops detected');
            this.handleNetworkIssue('FREQUENT_DROPS', {
                drops: offlineEvents.length,
                timeframe: '5 minutes'
            });
        }
    }
    
    checkLatencySpikes() {
        if (this.latencyTests.length > 0) {
            const lastLatency = this.latencyTests[this.latencyTests.length - 1].latency;
            const avgLatency = this.latencyTests.reduce((sum, t) => sum + t.latency, 0) / this.latencyTests.length;
            
            if (lastLatency > avgLatency * 2 && lastLatency > 500) {
                console.warn('📈 [NETWORK-MONITOR] Latency spike detected:', lastLatency + 'ms');
                this.handleNetworkIssue('LATENCY_SPIKE', {
                    current: lastLatency,
                    average: avgLatency
                });
            }
        }
    }
    
    checkBandwidthFluctuations() {
        const bandwidthData = this.networkData.get('bandwidth');
        if (bandwidthData && bandwidthData.length > 5) {
            const recent = bandwidthData.slice(-5);
            const bandwidths = recent.map(b => b.bandwidth);
            const min = Math.min(...bandwidths);
            const max = Math.max(...bandwidths);
            
            // Check for significant fluctuation
            if (max / min > 3) {
                console.warn('📊 [NETWORK-MONITOR] Bandwidth fluctuation detected');
                this.handleNetworkIssue('BANDWIDTH_FLUCTUATION', {
                    min: this.formatBandwidth(min),
                    max: this.formatBandwidth(max),
                    ratio: (max / min).toFixed(2)
                });
            }
        }
    }
    
    initializeBossMode() {
        // 👑 BOSS Mode optimization
        const bossToken = localStorage.getItem('bossLevel10000');
        if (bossToken === 'true') {
            this.bossMode = true;
            this.optimizeForBoss();
            console.log('👑 [NETWORK-MONITOR] BOSS mode activated');
        }
    }
    
    optimizeForBoss() {
        // BOSS gets priority network monitoring
        console.log('👑 [NETWORK-MONITOR] BOSS optimization active');
        
        // Reduce monitoring frequency to save bandwidth
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = setInterval(() => {
            this.analyzeNetworkTrends();
            this.generateNetworkReport();
        }, 60000); // Every minute for BOSS
        
        // BOSS is immune to network restrictions
        this.networkRestrictions = false;
        
        // Priority bandwidth allocation (simulated)
        this.priorityBandwidth = true;
    }
    
    recordNetworkData(metric, value) {
        if (!this.networkData.has(metric)) {
            this.networkData.set(metric, []);
        }
        
        const data = this.networkData.get(metric);
        data.push({
            value,
            timestamp: Date.now()
        });
        
        // Keep only last 50 entries
        if (data.length > 50) {
            data.shift();
        }
        
        this.networkData.set(metric, data);
    }
    
    recordNetworkEvent(eventType, details) {
        this.recordNetworkData(eventType, details);
        
        console.log('🌐 [NETWORK-MONITOR] Event:', eventType, details);
    }
    
    handleNetworkIssue(issueType, details) {
        // 👑 BOSS mode - less restrictive handling
        if (this.bossMode) {
            console.log('👑 [NETWORK-MONITOR] BOSS mode - Issue noted:', issueType);
            return;
        }
        
        console.warn('⚠️ [NETWORK-MONITOR] Network issue:', issueType, details);
        
        // Log issue
        const issue = {
            type: issueType,
            details,
            timestamp: Date.now(),
            severity: this.calculateIssueSeverity(issueType, details)
        };
        
        let issues = JSON.parse(localStorage.getItem('networkIssues') || '[]');
        issues.push(issue);
        localStorage.setItem('networkIssues', JSON.stringify(issues));
        
        // Notify other systems
        window.dispatchEvent(new CustomEvent('networkIssue', {
            detail: issue
        }));
        
        // Auto-remediation for critical issues
        if (issue.severity === 'critical') {
            this.attemptNetworkRemediation(issue);
        }
    }
    
    calculateIssueSeverity(issueType, details) {
        switch (issueType) {
            case 'FREQUENT_DROPS':
                return details.drops > 5 ? 'critical' : 'high';
            case 'HIGH_LATENCY':
                return details.latency > 2000 ? 'critical' : 'medium';
            case 'LATENCY_SPIKE':
                return details.current > 1000 ? 'high' : 'medium';
            default:
                return 'low';
        }
    }
    
    attemptNetworkRemediation(issue) {
        console.log('🔧 [NETWORK-MONITOR] Attempting network remediation:', issue.type);
        
        switch (issue.type) {
            case 'HIGH_LATENCY':
                this.optimizeForHighLatency();
                break;
            case 'BANDWIDTH_FLUCTUATION':
                this.stabilizeBandwidth();
                break;
            case 'FREQUENT_DROPS':
                this.implementConnectionRecovery();
                break;
        }
    }
    
    optimizeForHighLatency() {
        // High latency optimization
        console.log('🔧 [NETWORK-MONITOR] Optimizing for high latency');
        
        // Increase request timeouts
        localStorage.setItem('networkOptimization', 'high_latency');
        localStorage.setItem('requestTimeout', '10000');
        
        // Enable request queuing
        this.enableRequestQueuing();
    }
    
    stabilizeBandwidth() {
        // Bandwidth stabilization
        console.log('🔧 [NETWORK-MONITOR] Stabilizing bandwidth usage');
        
        // Reduce concurrent requests
        localStorage.setItem('maxConcurrentRequests', '2');
        
        // Enable bandwidth throttling
        this.enableBandwidthThrottling();
    }
    
    implementConnectionRecovery() {
        // Connection recovery
        console.log('🔧 [NETWORK-MONITOR] Implementing connection recovery');
        
        // Enable automatic retry
        localStorage.setItem('autoRetry', 'true');
        localStorage.setItem('maxRetries', '3');
        
        // Setup connection backup
        this.setupConnectionBackup();
    }
    
    enableRequestQueuing() {
        // Request queuing implementation
        if (!window._requestQueue) {
            window._requestQueue = [];
            window._processingQueue = false;
            
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                return new Promise((resolve, reject) => {
                    window._requestQueue.push({ args, resolve, reject });
                    this.processRequestQueue();
                });
            };
        }
    }
    
    processRequestQueue() {
        if (window._processingQueue || window._requestQueue.length === 0) {
            return;
        }
        
        window._processingQueue = true;
        const request = window._requestQueue.shift();
        
        window._originalFetch.apply(window, request.args)
            .then(request.resolve)
            .catch(request.reject)
            .finally(() => {
                window._processingQueue = false;
                setTimeout(() => this.processRequestQueue(), 100);
            });
    }
    
    enableBandwidthThrottling() {
        // Bandwidth throttling
        console.log('🔧 [NETWORK-MONITOR] Bandwidth throttling enabled');
        
        // Add delays between requests
        localStorage.setItem('requestDelay', '500');
    }
    
    setupConnectionBackup() {
        // Connection backup setup
        console.log('🔧 [NETWORK-MONITOR] Connection backup setup');
        
        // Store offline capabilities
        localStorage.setItem('offlineMode', 'enabled');
    }
    
    handleOfflineMode() {
        console.log('📴 [NETWORK-MONITOR] Entering offline mode');
        
        // Enable offline capabilities
        localStorage.setItem('currentNetworkMode', 'offline');
        
        // Cache current state
        this.cacheCurrentState();
        
        // Notify user
        this.showOfflineNotification();
    }
    
    handleOnlineMode() {
        console.log('🌐 [NETWORK-MONITOR] Entering online mode');
        
        // Restore online capabilities
        localStorage.setItem('currentNetworkMode', 'online');
        
        // Sync cached data
        this.syncCachedData();
        
        // Hide offline notification
        this.hideOfflineNotification();
    }
    
    cacheCurrentState() {
        // Cache important data for offline mode
        const state = {
            timestamp: Date.now(),
            networkData: Object.fromEntries(this.networkData),
            userPreferences: this.getUserPreferences(),
            criticalData: this.getCriticalData()
        };
        
        localStorage.setItem('offlineCache', JSON.stringify(state));
    }
    
    syncCachedData() {
        // Sync cached data when back online
        const cachedState = localStorage.getItem('offlineCache');
        if (cachedState) {
            try {
                const state = JSON.parse(cachedState);
                console.log('🔄 [NETWORK-MONITOR] Syncing cached data from', 
                    new Date(state.timestamp).toLocaleString());
                
                // Sync data here
                this.uploadCachedData(state);
                
            } catch (e) {
                console.error('❌ [NETWORK-MONITOR] Failed to sync cached data:', e);
            }
        }
    }
    
    uploadCachedData(state) {
        // Upload cached data to server
        console.log('⬆️ [NETWORK-MONITOR] Uploading cached data');
        
        // Implementation would depend on server API
    }
    
    showOfflineNotification() {
        // Show offline notification
        const notification = document.createElement('div');
        notification.id = 'network-offline-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: #ff6b6b;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 10000;
                font-size: 14px;
            ">
                📴 Offline Mode - Data will sync when reconnected
            </div>
        `;
        
        document.body.appendChild(notification);
    }
    
    hideOfflineNotification() {
        // Hide offline notification
        const notification = document.getElementById('network-offline-notification');
        if (notification) {
            notification.remove();
        }
    }
    
    generateNetworkReport() {
        // Generate network status report
        const report = {
            timestamp: Date.now(),
            connection_status: this.connectionStatus,
            capabilities: this.capabilities,
            current_performance: this.getCurrentPerformance(),
            issues: this.getActiveNetworkIssues(),
            optimization_status: this.getOptimizationStatus()
        };
        
        localStorage.setItem('networkReport', JSON.stringify(report));
        return report;
    }
    
    getCurrentPerformance() {
        const latencyData = this.networkData.get('latency');
        const bandwidthData = this.networkData.get('bandwidth');
        
        return {
            latency: latencyData && latencyData.length > 0 ? 
                latencyData[latencyData.length - 1].value : null,
            bandwidth: bandwidthData && bandwidthData.length > 0 ? 
                bandwidthData[bandwidthData.length - 1].value.bandwidth : null,
            connection_type: navigator.connection ? 
                navigator.connection.effectiveType : 'unknown'
        };
    }
    
    getActiveNetworkIssues() {
        const issues = JSON.parse(localStorage.getItem('networkIssues') || '[]');
        return issues.filter(issue => 
            Date.now() - issue.timestamp < 600000 // Last 10 minutes
        );
    }
    
    getOptimizationStatus() {
        return {
            boss_mode: this.bossMode,
            request_queuing: !!window._requestQueue,
            bandwidth_throttling: !!localStorage.getItem('requestDelay'),
            offline_mode: localStorage.getItem('currentNetworkMode') === 'offline',
            auto_retry: localStorage.getItem('autoRetry') === 'true'
        };
    }
    
    getUserPreferences() {
        // Get user network preferences
        return {
            data_saver: navigator.connection ? navigator.connection.saveData : false,
            preferred_quality: localStorage.getItem('preferredQuality') || 'auto'
        };
    }
    
    getCriticalData() {
        // Get critical data that needs to be preserved
        return {
            session_data: localStorage.getItem('sessionData'),
            user_preferences: localStorage.getItem('userPreferences'),
            auth_tokens: localStorage.getItem('authTokens')
        };
    }
    
    cleanupOldNetworkData() {
        // Clean up old network data
        const cutoff = Date.now() - (2 * 60 * 60 * 1000); // 2 hours
        
        for (const [metric, data] of this.networkData.entries()) {
            const filteredData = data.filter(d => d.timestamp > cutoff);
            this.networkData.set(metric, filteredData);
        }
        
        // Clean up old issues
        let issues = JSON.parse(localStorage.getItem('networkIssues') || '[]');
        issues = issues.filter(issue => issue.timestamp > cutoff);
        localStorage.setItem('networkIssues', JSON.stringify(issues));
    }
    
    // Public API
    getNetworkStatus() {
        return {
            version: this.version,
            monitoring: this.monitoring,
            connection_status: this.connectionStatus,
            boss_mode: this.bossMode,
            performance: this.getCurrentPerformance(),
            issues_count: this.getActiveNetworkIssues().length
        };
    }
    
    exportNetworkData() {
        return {
            version: this.version,
            timestamp: Date.now(),
            data: Object.fromEntries(this.networkData),
            capabilities: this.capabilities,
            latency_tests: this.latencyTests,
            report: JSON.parse(localStorage.getItem('networkReport') || '{}')
        };
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.TINI_NETWORK_MONITOR = new NetworkMonitorClient();
    console.log('🌐 [NETWORK-MONITOR] Client loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkMonitorClient;
}
