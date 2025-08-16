// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI Lightweight Performance Monitor
// Optimized version replacing heavy monitoring modules

class TINILightweightMonitor {
    constructor() {
        this.config = {
            monitoringInterval: 30000, // 30 seconds (reduced from 5s)
            metricRetention: 100, // Keep last 100 metrics only
            enabledMetrics: ['memory', 'network', 'database'], // Reduced metrics
            alertThresholds: {
                memory: 85, // Increased threshold
                network: 2000, // More tolerant
                database: 1000 // Query time threshold
            }
        };
        
        this.metrics = new Map();
        this.alerts = [];
        this.isMonitoring = false;
    }

    start() {
        if (this.isMonitoring) return;
        
        console.log('📊 [MONITOR] Starting lightweight monitoring...');
        this.isMonitoring = true;
        
        // Reduced frequency monitoring
        this.monitoringInterval = setInterval(() => {
            this.collectCriticalMetrics();
        }, this.config.monitoringInterval);
        
        // Cleanup old data every hour
        this.cleanupInterval = setInterval(() => {
            this.cleanupOldMetrics();
        }, 3600000); // 1 hour
    }

    collectCriticalMetrics() {
        const timestamp = Date.now();
        
        // Memory monitoring (essential)
        if (this.config.enabledMetrics.includes('memory') && performance.memory) {
            const memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
            this.recordMetric('memory', memoryUsage, timestamp);
            
            if (memoryUsage > this.config.alertThresholds.memory) {
                this.createAlert('HIGH_MEMORY', { usage: memoryUsage });
            }
        }

        // Network monitoring (simplified)
        if (this.config.enabledMetrics.includes('network')) {
            this.checkNetworkHealth();
        }

        // Database monitoring (minimal)
        if (this.config.enabledMetrics.includes('database')) {
            this.checkDatabaseHealth();
        }
    }

    recordMetric(type, value, timestamp) {
        if (!this.metrics.has(type)) {
            this.metrics.set(type, []);
        }
        
        const metricArray = this.metrics.get(type);
        metricArray.push({ value, timestamp });
        
        // Keep only last N metrics
        if (metricArray.length > this.config.metricRetention) {
            metricArray.shift();
        }
    }

    checkNetworkHealth() {
        // Simplified network check
        const startTime = performance.now();
        
        fetch('/api/health')
            .then(() => {
                const latency = performance.now() - startTime;
                this.recordMetric('network', latency, Date.now());
                
                if (latency > this.config.alertThresholds.network) {
                    this.createAlert('HIGH_LATENCY', { latency });
                }
            })
            .catch(err => {
                this.createAlert('NETWORK_ERROR', { error: err.message });
            });
    }

    checkDatabaseHealth() {
        // Database query time monitoring
        const startTime = performance.now();
        
        fetch('/api/health')
            .then(() => {
                const queryTime = performance.now() - startTime;
                this.recordMetric('database', queryTime, Date.now());
                
                if (queryTime > this.config.alertThresholds.database) {
                    this.createAlert('SLOW_DATABASE', { queryTime });
                }
            })
            .catch(err => {
                this.createAlert('DATABASE_ERROR', { error: err.message });
            });
    }

    createAlert(type, data) {
        const alert = {
            type,
            data,
            timestamp: Date.now(),
            severity: this.calculateSeverity(type, data)
        };
        
        this.alerts.push(alert);
        
        // Keep only last 50 alerts
        if (this.alerts.length > 50) {
            this.alerts.shift();
        }
        
        console.warn(`⚠️ [MONITOR] Alert: ${type}`, data);
    }

    calculateSeverity(type, data) {
        switch (type) {
            case 'HIGH_MEMORY':
                return data.usage > 95 ? 'CRITICAL' : 'WARNING';
            case 'HIGH_LATENCY':
                return data.latency > 5000 ? 'CRITICAL' : 'WARNING';
            case 'SLOW_DATABASE':
                return data.queryTime > 2000 ? 'CRITICAL' : 'WARNING';
            default:
                return 'INFO';
        }
    }

    cleanupOldMetrics() {
        const cutoff = Date.now() - (6 * 60 * 60 * 1000); // 6 hours
        
        for (const [type, metrics] of this.metrics.entries()) {
            const filtered = metrics.filter(m => m.timestamp > cutoff);
            this.metrics.set(type, filtered);
        }
        
        // Cleanup old alerts
        this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
        
        console.log('🧹 [MONITOR] Cleaned up old metrics and alerts');
    }

    getMetrics() {
        const result = {};
        for (const [type, metrics] of this.metrics.entries()) {
            result[type] = {
                current: metrics.length > 0 ? metrics[metrics.length - 1].value : 0,
                average: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length : 0,
                count: metrics.length
            };
        }
        return result;
    }

    getAlerts() {
        return {
            recent: this.alerts.slice(-10),
            critical: this.alerts.filter(a => a.severity === 'CRITICAL').slice(-5),
            total: this.alerts.length
        };
    }

    stop() {
        if (!this.isMonitoring) return;
        
        clearInterval(this.monitoringInterval);
        clearInterval(this.cleanupInterval);
        this.isMonitoring = false;
        
        console.log('📊 [MONITOR] Monitoring stopped');
    }
}

// Auto-start if loaded in browser
if (typeof window !== 'undefined') {
    window.TINIMonitor = new TINILightweightMonitor();
    window.TINIMonitor.start();
}

module.exports = TINILightweightMonitor;
