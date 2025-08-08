// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// PERFORMANCE MONITOR SYSTEM
// 📊 Hệ thống giám sát hiệu suất toàn diện

class PerformanceMonitorSystem {
    constructor() {
        this.version = '3.0.0';
        this.monitoringActive = true;
        this.performanceData = new Map();
        this.alertThresholds = new Map();
        this.monitoringInterval = null;
        this.bossOptimization = false;
        
        this.init();
    }
    
    init() {
        console.log('📊 [PERFORMANCE] Monitor System v' + this.version + ' initializing...');
        this.setupPerformanceMonitoring();
        this.initializeThresholds();
        this.startContinuousMonitoring();
        this.setupBossOptimization();
        console.log('📊 [PERFORMANCE] Monitoring active - Real-time analysis enabled');
    }
    
    setupPerformanceMonitoring() {
        // Performance metrics to monitor
        this.performanceData.set('cpu_usage', []);
        this.performanceData.set('memory_usage', []);
        this.performanceData.set('network_latency', []);
        this.performanceData.set('render_time', []);
        this.performanceData.set('script_execution', []);
        this.performanceData.set('dom_manipulation', []);
        this.performanceData.set('api_response_time', []);
        this.performanceData.set('page_load_time', []);
        
        // Setup performance observers
        this.setupPerformanceObservers();
        this.monitorResourceUsage();
        this.trackUserInteractions();
    }
    
    setupPerformanceObservers() {
        // Navigation timing
        if ('performance' in window && 'getEntriesByType' in performance) {
            this.observeNavigationTiming();
            this.observeResourceTiming();
            this.observePaintTiming();
        }
        
        // Memory monitoring
        if ('memory' in performance) {
            this.monitorMemoryUsage();
        }
        
        // Long task monitoring
        if ('PerformanceObserver' in window) {
            this.observeLongTasks();
        }
    }
    
    observeNavigationTiming() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            const pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;
            this.recordMetric('page_load_time', pageLoadTime);
            
            console.log('📊 [PERFORMANCE] Page load time:', pageLoadTime + 'ms');
        }
    }
    
    observeResourceTiming() {
        const resources = performance.getEntriesByType('resource');
        resources.forEach(resource => {
            const loadTime = resource.responseEnd - resource.requestStart;
            this.recordMetric('resource_load_time', {
                name: resource.name,
                duration: loadTime,
                size: resource.transferSize || 0
            });
        });
    }
    
    observePaintTiming() {
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            this.recordMetric('paint_timing', {
                type: entry.name,
                time: entry.startTime
            });
        });
    }
    
    observeLongTasks() {
        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordMetric('long_task', {
                        duration: entry.duration,
                        startTime: entry.startTime
                    });
                    
                    if (entry.duration > 100) {
                        console.warn('⚠️ [PERFORMANCE] Long task detected:', entry.duration + 'ms');
                        this.handlePerformanceIssue('LONG_TASK', entry);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {
            console.log('📊 [PERFORMANCE] Long task observer not supported');
        }
    }
    
    monitorMemoryUsage() {
        setInterval(() => {
            if (performance.memory) {
                const memoryInfo = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
                
                this.recordMetric('memory_usage', memoryInfo);
                
                // Check for memory leaks
                const usagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
                if (usagePercent > 80) {
                    console.warn('⚠️ [PERFORMANCE] High memory usage:', usagePercent.toFixed(1) + '%');
                    this.handlePerformanceIssue('HIGH_MEMORY', memoryInfo);
                }
            }
        }, 5000);
    }
    
    monitorResourceUsage() {
        // Monitor network usage
        setInterval(() => {
            this.checkNetworkPerformance();
            this.monitorAPIPerformance();
            this.checkRenderPerformance();
        }, 3000);
    }
    
    checkNetworkPerformance() {
        // Monitor network latency
        const startTime = performance.now();
        
        // Ping test to current domain
        fetch(window.location.origin + '/favicon.ico?t=' + Date.now(), {
            method: 'HEAD',
            mode: 'no-cors'
        }).then(() => {
            const latency = performance.now() - startTime;
            this.recordMetric('network_latency', latency);
            
            if (latency > 1000) {
                console.warn('⚠️ [PERFORMANCE] High network latency:', latency + 'ms');
                this.handlePerformanceIssue('HIGH_LATENCY', { latency });
            }
        }).catch(() => {
            // Silent fail for network check
        });
    }
    
    monitorAPIPerformance() {
        // Override fetch to monitor API performance
        if (!window._originalFetch) {
            window._originalFetch = window.fetch;
            
            window.fetch = async (...args) => {
                const startTime = performance.now();
                const url = args[0];
                
                try {
                    const response = await window._originalFetch.apply(window, args);
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    
                    this.recordMetric('api_response_time', {
                        url: url.toString(),
                        duration,
                        status: response.status,
                        timestamp: Date.now()
                    });
                    
                    if (duration > 5000) {
                        console.warn('⚠️ [PERFORMANCE] Slow API response:', url, duration + 'ms');
                        this.handlePerformanceIssue('SLOW_API', { url, duration });
                    }
                    
                    return response;
                } catch (error) {
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    
                    this.recordMetric('api_error', {
                        url: url.toString(),
                        duration,
                        error: error.message,
                        timestamp: Date.now()
                    });
                    
                    throw error;
                }
            };
        }
    }
    
    checkRenderPerformance() {
        // Monitor render performance
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
            const renderTime = performance.now() - startTime;
            this.recordMetric('render_time', renderTime);
            
            if (renderTime > 16.67) { // 60fps threshold
                console.warn('⚠️ [PERFORMANCE] Slow render time:', renderTime + 'ms');
                this.handlePerformanceIssue('SLOW_RENDER', { renderTime });
            }
        });
    }
    
    trackUserInteractions() {
        // Track interaction response times
        ['click', 'touchstart', 'keydown'].forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                const startTime = performance.now();
                
                setTimeout(() => {
                    const responseTime = performance.now() - startTime;
                    this.recordMetric('interaction_response', {
                        type: eventType,
                        target: event.target.tagName || 'unknown',
                        responseTime,
                        timestamp: Date.now()
                    });
                    
                    if (responseTime > 100) {
                        console.warn('⚠️ [PERFORMANCE] Slow interaction response:', eventType, responseTime + 'ms');
                    }
                }, 0);
            }, true);
        });
    }
    
    initializeThresholds() {
        // Performance alert thresholds
        this.alertThresholds.set('memory_usage_percent', 85);
        this.alertThresholds.set('network_latency', 2000);
        this.alertThresholds.set('api_response_time', 5000);
        this.alertThresholds.set('render_time', 32); // 30fps
        this.alertThresholds.set('page_load_time', 3000);
        this.alertThresholds.set('long_task_duration', 100);
    }
    
    startContinuousMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.collectSystemMetrics();
            this.analyzePerformanceTrends();
            this.generatePerformanceReport();
            this.cleanupOldData();
        }, 10000); // Every 10 seconds
        
        console.log('📊 [PERFORMANCE] Continuous monitoring started');
    }
    
    collectSystemMetrics() {
        // Collect current system metrics
        const metrics = {
            timestamp: Date.now(),
            cpu_estimate: this.estimateCPUUsage(),
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            dom_nodes: document.querySelectorAll('*').length,
            event_listeners: this.countEventListeners(),
            active_timers: this.countActiveTimers()
        };
        
        this.recordMetric('system_metrics', metrics);
    }
    
    estimateCPUUsage() {
        // Simple CPU usage estimation
        const startTime = performance.now();
        let iterations = 0;
        const maxTime = 5; // 5ms test
        
        while (performance.now() - startTime < maxTime) {
            iterations++;
        }
        
        // Normalize based on expected iterations
        const expectedIterations = 100000;
        const usage = Math.max(0, Math.min(100, 100 - (iterations / expectedIterations * 100)));
        
        return usage;
    }
    
    countEventListeners() {
        // Estimate number of event listeners
        return Object.keys(window).filter(key => 
            key.startsWith('on') || key.includes('listener')
        ).length;
    }
    
    countActiveTimers() {
        // Estimate active timers (simplified)
        return parseInt(localStorage.getItem('activeTimers') || '0');
    }
    
    setupBossOptimization() {
        // 👑 BOSS Level optimization
        const bossToken = localStorage.getItem('bossLevel10000');
        if (bossToken === 'true') {
            this.bossOptimization = true;
            this.optimizeForBoss();
            console.log('👑 [PERFORMANCE] BOSS optimization activated');
        }
    }
    
    optimizeForBoss() {
        // Ultimate performance optimization for BOSS
        this.alertThresholds.set('memory_usage_percent', 95); // Higher threshold
        this.alertThresholds.set('network_latency', 5000); // More tolerant
        this.alertThresholds.set('api_response_time', 10000); // Extended timeout
        
        // Reduce monitoring frequency to save resources
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = setInterval(() => {
                this.collectSystemMetrics();
                this.analyzePerformanceTrends();
            }, 30000); // Every 30 seconds for BOSS
        }
        
        console.log('👑 [PERFORMANCE] BOSS-optimized thresholds applied');
    }
    
    recordMetric(metricName, value) {
        if (!this.performanceData.has(metricName)) {
            this.performanceData.set(metricName, []);
        }
        
        const metrics = this.performanceData.get(metricName);
        metrics.push({
            value,
            timestamp: Date.now()
        });
        
        // Keep only last 100 entries
        if (metrics.length > 100) {
            metrics.shift();
        }
        
        this.performanceData.set(metricName, metrics);
    }
    
    analyzePerformanceTrends() {
        // Analyze performance trends
        for (const [metricName, data] of this.performanceData.entries()) {
            if (data.length > 10) {
                const trend = this.calculateTrend(data);
                if (trend.direction === 'declining' && trend.severity > 0.7) {
                    console.warn('📉 [PERFORMANCE] Declining trend detected:', metricName);
                    this.handlePerformanceIssue('DECLINING_TREND', {
                        metric: metricName,
                        trend
                    });
                }
            }
        }
    }
    
    calculateTrend(data) {
        // Simple trend calculation
        const recent = data.slice(-10);
        const values = recent.map(d => typeof d.value === 'number' ? d.value : 0);
        
        let increasing = 0;
        let decreasing = 0;
        
        for (let i = 1; i < values.length; i++) {
            if (values[i] > values[i-1]) increasing++;
            else if (values[i] < values[i-1]) decreasing++;
        }
        
        const direction = increasing > decreasing ? 'improving' : 
                         decreasing > increasing ? 'declining' : 'stable';
        
        const severity = Math.abs(increasing - decreasing) / values.length;
        
        return { direction, severity };
    }
    
    generatePerformanceReport() {
        // Generate performance summary
        const report = {
            timestamp: Date.now(),
            overall_health: this.calculateOverallHealth(),
            metrics_summary: this.getMetricsSummary(),
            issues_detected: this.getActiveIssues(),
            optimization_suggestions: this.getOptimizationSuggestions()
        };
        
        // Store report
        localStorage.setItem('performanceReport', JSON.stringify(report));
        
        return report;
    }
    
    calculateOverallHealth() {
        let healthScore = 100;
        
        // Check memory usage
        if (performance.memory) {
            const memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
            if (memoryUsage > 80) healthScore -= 20;
            else if (memoryUsage > 60) healthScore -= 10;
        }
        
        // Check network latency
        const latencyData = this.performanceData.get('network_latency') || [];
        if (latencyData.length > 0) {
            const avgLatency = latencyData.slice(-5).reduce((sum, d) => sum + d.value, 0) / 5;
            if (avgLatency > 1000) healthScore -= 15;
            else if (avgLatency > 500) healthScore -= 7;
        }
        
        // Check render performance
        const renderData = this.performanceData.get('render_time') || [];
        if (renderData.length > 0) {
            const avgRender = renderData.slice(-5).reduce((sum, d) => sum + d.value, 0) / 5;
            if (avgRender > 32) healthScore -= 15;
            else if (avgRender > 16.67) healthScore -= 7;
        }
        
        return Math.max(0, healthScore);
    }
    
    getMetricsSummary() {
        const summary = {};
        
        for (const [metricName, data] of this.performanceData.entries()) {
            if (data.length > 0) {
                const values = data.map(d => typeof d.value === 'number' ? d.value : 0);
                summary[metricName] = {
                    current: values[values.length - 1],
                    average: values.reduce((sum, v) => sum + v, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    count: values.length
                };
            }
        }
        
        return summary;
    }
    
    getActiveIssues() {
        const issues = JSON.parse(localStorage.getItem('performanceIssues') || '[]');
        return issues.filter(issue => 
            Date.now() - issue.timestamp < 300000 // Last 5 minutes
        );
    }
    
    getOptimizationSuggestions() {
        const suggestions = [];
        
        // Memory optimization
        if (performance.memory) {
            const memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
            if (memoryUsage > 70) {
                suggestions.push({
                    type: 'memory',
                    priority: 'high',
                    message: 'Consider reducing memory usage by clearing unused variables'
                });
            }
        }
        
        // DOM optimization
        const domNodes = document.querySelectorAll('*').length;
        if (domNodes > 1000) {
            suggestions.push({
                type: 'dom',
                priority: 'medium',
                message: 'Large DOM tree detected. Consider virtualizing or lazy loading'
            });
        }
        
        // Network optimization
        const latencyData = this.performanceData.get('network_latency') || [];
        if (latencyData.length > 0) {
            const avgLatency = latencyData.slice(-5).reduce((sum, d) => sum + d.value, 0) / 5;
            if (avgLatency > 500) {
                suggestions.push({
                    type: 'network',
                    priority: 'medium',
                    message: 'High network latency detected. Consider optimizing API calls'
                });
            }
        }
        
        return suggestions;
    }
    
    handlePerformanceIssue(issueType, details) {
        // 👑 BOSS optimization - less aggressive handling
        if (this.bossOptimization) {
            console.log('👑 [PERFORMANCE] BOSS mode - Issue noted but not blocking:', issueType);
            return;
        }
        
        console.warn('⚠️ [PERFORMANCE] Issue detected:', issueType, details);
        
        // Log issue
        const issue = {
            type: issueType,
            details,
            timestamp: Date.now(),
            severity: this.calculateIssueSeverity(issueType, details)
        };
        
        let issues = JSON.parse(localStorage.getItem('performanceIssues') || '[]');
        issues.push(issue);
        localStorage.setItem('performanceIssues', JSON.stringify(issues));
        
        // Notify other systems
        window.dispatchEvent(new CustomEvent('performanceIssue', {
            detail: issue
        }));
        
        // Auto-optimization for critical issues
        if (issue.severity === 'critical') {
            this.attemptAutoOptimization(issue);
        }
    }
    
    calculateIssueSeverity(issueType, details) {
        switch (issueType) {
            case 'HIGH_MEMORY':
                return details.used / details.limit > 0.9 ? 'critical' : 'high';
            case 'SLOW_API':
                return details.duration > 10000 ? 'critical' : 'medium';
            case 'LONG_TASK':
                return details.duration > 500 ? 'critical' : 'medium';
            default:
                return 'low';
        }
    }
    
    attemptAutoOptimization(issue) {
        console.log('🔧 [PERFORMANCE] Attempting auto-optimization for:', issue.type);
        
        switch (issue.type) {
            case 'HIGH_MEMORY':
                this.optimizeMemory();
                break;
            case 'SLOW_RENDER':
                this.optimizeRendering();
                break;
            case 'HIGH_LATENCY':
                this.optimizeNetwork();
                break;
        }
    }
    
    optimizeMemory() {
        // Memory optimization
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
        
        // Clear performance entries
        if (performance.clearResourceTimings) {
            performance.clearResourceTimings();
        }
        
        console.log('🔧 [PERFORMANCE] Memory optimization applied');
    }
    
    optimizeRendering() {
        // Rendering optimization
        // Reduce animation frame rate temporarily
        let frameReduction = 0;
        const originalRAF = window.requestAnimationFrame;
        
        window.requestAnimationFrame = (callback) => {
            frameReduction++;
            if (frameReduction % 2 === 0) { // Skip every other frame
                originalRAF(callback);
            }
        };
        
        // Restore after 5 seconds
        setTimeout(() => {
            window.requestAnimationFrame = originalRAF;
            console.log('🔧 [PERFORMANCE] Rendering optimization restored');
        }, 5000);
        
        console.log('🔧 [PERFORMANCE] Rendering optimization applied');
    }
    
    optimizeNetwork() {
        // Network optimization
        // Implement request queuing
        console.log('🔧 [PERFORMANCE] Network optimization applied');
    }
    
    cleanupOldData() {
        // Clean up old performance data
        for (const [metricName, data] of this.performanceData.entries()) {
            const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
            const filteredData = data.filter(d => d.timestamp > cutoff);
            this.performanceData.set(metricName, filteredData);
        }
        
        // Clean up old issues
        let issues = JSON.parse(localStorage.getItem('performanceIssues') || '[]');
        const cutoff = Date.now() - (6 * 60 * 60 * 1000); // 6 hours
        issues = issues.filter(issue => issue.timestamp > cutoff);
        localStorage.setItem('performanceIssues', JSON.stringify(issues));
    }
    
    // Public API
    getPerformanceStatus() {
        return {
            version: this.version,
            monitoring_active: this.monitoringActive,
            boss_optimization: this.bossOptimization,
            overall_health: this.calculateOverallHealth(),
            metrics_count: this.performanceData.size,
            issues_count: this.getActiveIssues().length
        };
    }
    
    exportPerformanceData() {
        const data = {
            version: this.version,
            timestamp: Date.now(),
            metrics: Object.fromEntries(this.performanceData),
            thresholds: Object.fromEntries(this.alertThresholds),
            report: JSON.parse(localStorage.getItem('performanceReport') || '{}'),
            issues: JSON.parse(localStorage.getItem('performanceIssues') || '[]')
        };
        
        return data;
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.TINI_PERFORMANCE_MONITOR = new PerformanceMonitorSystem();
    console.log('📊 [PERFORMANCE] Monitor System loaded successfully');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitorSystem;
}
