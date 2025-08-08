// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🔍 TINI POPUP PRODUCTION MONITOR v3.2
 * Production environment monitoring for popup interface
 * Giám sát môi trường sản xuất cho giao diện popup
 */

class TINIProductionMonitor {
    constructor() {
        this.version = "3.2";
        this.monitoringActive = false;
        this.performanceMetrics = {};
        this.errorLog = [];
        this.systemHealth = 100;
        
        this.init();
    }
    
    init() {
        console.log(`🔍 [PRODUCTION] Initializing Production Monitor v${this.version}`);
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Setup error tracking
        this.setupErrorTracking();
        
        // Setup system health monitoring
        this.setupHealthMonitoring();
        
        // Start monitoring cycles
        this.startMonitoring();
    }
    
    setupPerformanceMonitoring() {
        // Monitor popup load time
        this.trackPopupLoadTime();
        
        // Monitor memory usage
        this.trackMemoryUsage();
        
        // Monitor API response times
        this.trackAPIPerformance();
    }
    
    trackPopupLoadTime() {
        const startTime = performance.now();
        
        document.addEventListener('DOMContentLoaded', () => {
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.popupLoadTime = loadTime;
            
            if (loadTime > 1000) {
                this.logWarning(`Popup load time excessive: ${loadTime.toFixed(2)}ms`);
            }
        });
    }
    
    trackMemoryUsage() {
        if (performance.memory) {
            setInterval(() => {
                const memInfo = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };
                
                this.performanceMetrics.memory = memInfo;
                
                // Alert if memory usage is high
                const usagePercent = (memInfo.used / memInfo.limit) * 100;
                if (usagePercent > 80) {
                    this.logWarning(`High memory usage: ${usagePercent.toFixed(1)}%`);
                }
            }, 10000);
        }
    }
    
    trackAPIPerformance() {
        // Intercept chrome.runtime.sendMessage calls
        if (chrome && chrome.runtime) {
            const originalSendMessage = chrome.runtime.sendMessage;
            chrome.runtime.sendMessage = (...args) => {
                const startTime = performance.now();
                const result = originalSendMessage.apply(chrome.runtime, args);
                
                if (result && result.then) {
                    result.then(() => {
                        const responseTime = performance.now() - startTime;
                        this.logAPICall(args[0], responseTime);
                    });
                }
                
                return result;
            };
        }
    }
    
    setupErrorTracking() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: new Date().toISOString()
            });
        });
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'Unhandled Promise Rejection',
                reason: event.reason,
                timestamp: new Date().toISOString()
            });
        });
        
        // Chrome extension error handler
        if (chrome && chrome.runtime) {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.type === 'ERROR_REPORT') {
                    this.logError({
                        type: 'Extension Error',
                        data: message.data,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        }
    }
    
    setupHealthMonitoring() {
        setInterval(() => {
            this.checkSystemHealth();
        }, 30000); // Check every 30 seconds
    }
    
    checkSystemHealth() {
        let healthScore = 100;
        
        // Check error rate
        const recentErrors = this.errorLog.filter(error => {
            const errorTime = new Date(error.timestamp);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            return errorTime > fiveMinutesAgo;
        });
        
        if (recentErrors.length > 5) {
            healthScore -= 20;
        } else if (recentErrors.length > 2) {
            healthScore -= 10;
        }
        
        // Check memory usage
        if (this.performanceMetrics.memory) {
            const memUsage = (this.performanceMetrics.memory.used / this.performanceMetrics.memory.limit) * 100;
            if (memUsage > 90) {
                healthScore -= 30;
            } else if (memUsage > 70) {
                healthScore -= 15;
            }
        }
        
        // Check API performance
        const slowAPICalls = this.getSlowAPICalls();
        if (slowAPICalls > 3) {
            healthScore -= 15;
        }
        
        this.systemHealth = Math.max(0, healthScore);
        
        // Report health status
        this.reportHealthStatus();
    }
    
    startMonitoring() {
        this.monitoringActive = true;
        console.log('🔍 [PRODUCTION] Production monitoring started');
        
        // Send initial status report
        setTimeout(() => {
            this.sendStatusReport();
        }, 5000);
        
        // Regular status reports
        setInterval(() => {
            this.sendStatusReport();
        }, 60000); // Every minute
    }
    
    logError(error) {
        this.errorLog.push(error);
        
        // Keep only last 100 errors
        if (this.errorLog.length > 100) {
            this.errorLog = this.errorLog.slice(-100);
        }
        
        console.error('🔍 [PRODUCTION] Error logged:', error);
        
        // Send critical errors immediately
        if (this.isCriticalError(error)) {
            this.sendCriticalAlert(error);
        }
    }
    
    logWarning(message) {
        console.warn('🔍 [PRODUCTION] Warning:', message);
        
        this.errorLog.push({
            type: 'Warning',
            message: message,
            timestamp: new Date().toISOString()
        });
    }
    
    logAPICall(request, responseTime) {
        if (!this.performanceMetrics.apiCalls) {
            this.performanceMetrics.apiCalls = [];
        }
        
        this.performanceMetrics.apiCalls.push({
            action: request.action || 'unknown',
            responseTime: responseTime,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 API calls
        if (this.performanceMetrics.apiCalls.length > 50) {
            this.performanceMetrics.apiCalls = this.performanceMetrics.apiCalls.slice(-50);
        }
        
        if (responseTime > 2000) {
            this.logWarning(`Slow API call: ${request.action} took ${responseTime.toFixed(2)}ms`);
        }
    }
    
    isCriticalError(error) {
        const criticalPatterns = [
            /cannot read property/i,
            /is not defined/i,
            /permission denied/i,
            /network error/i,
            /extension context invalidated/i
        ];
        
        return criticalPatterns.some(pattern => 
            pattern.test(error.message || error.reason || '')
        );
    }
    
    getSlowAPICalls() {
        if (!this.performanceMetrics.apiCalls) return 0;
        
        const recentCalls = this.performanceMetrics.apiCalls.filter(call => {
            const callTime = new Date(call.timestamp);
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            return callTime > fiveMinutesAgo;
        });
        
        return recentCalls.filter(call => call.responseTime > 2000).length;
    }
    
    sendStatusReport() {
        const report = {
            type: 'PRODUCTION_STATUS',
            version: this.version,
            timestamp: new Date().toISOString(),
            systemHealth: this.systemHealth,
            performanceMetrics: this.performanceMetrics,
            errorCount: this.errorLog.length,
            recentErrors: this.errorLog.slice(-5)
        };
        
        // Send to background script
        if (chrome && chrome.runtime) {
            chrome.runtime.sendMessage(report).catch(err => {
                console.warn('🔍 [PRODUCTION] Failed to send status report:', err);
            });
        }
    }
    
    sendCriticalAlert(error) {
        const alert = {
            type: 'CRITICAL_ERROR',
            timestamp: new Date().toISOString(),
            error: error,
            systemHealth: this.systemHealth,
            context: 'popup'
        };
        
        // Send to background script
        if (chrome && chrome.runtime) {
            chrome.runtime.sendMessage(alert).catch(err => {
                console.error('🔍 [PRODUCTION] Failed to send critical alert:', err);
            });
        }
    }
    
    reportHealthStatus() {
        if (this.systemHealth < 50) {
            console.error(`🔍 [PRODUCTION] System health critical: ${this.systemHealth}%`);
        } else if (this.systemHealth < 80) {
            console.warn(`🔍 [PRODUCTION] System health warning: ${this.systemHealth}%`);
        }
    }
    
    getReport() {
        return {
            version: this.version,
            monitoringActive: this.monitoringActive,
            systemHealth: this.systemHealth,
            performanceMetrics: this.performanceMetrics,
            errorLog: this.errorLog,
            timestamp: new Date().toISOString()
        };
    }
    
    exportReport() {
        const report = this.getReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tini-production-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    reset() {
        this.errorLog = [];
        this.performanceMetrics = {};
        this.systemHealth = 100;
        console.log('🔍 [PRODUCTION] Monitor reset');
    }
    
    stop() {
        this.monitoringActive = false;
        console.log('🔍 [PRODUCTION] Production monitoring stopped');
    }
}

// Initialize production monitor
if (typeof window !== 'undefined') {
    window.TINIProductionMonitor = new TINIProductionMonitor();
}

console.log('🔍 [PRODUCTION] Production monitor loaded');
