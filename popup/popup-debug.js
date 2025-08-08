// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🐛 TINI POPUP DEBUG v2.5
 * Debug utilities and error handling for popup interface
 * Tiện ích debug và xử lý lỗi cho giao diện popup
 */

class TINIPopupDebug {
    constructor() {
        this.version = "2.5";
        this.debugMode = false;
        this.errorCount = 0;
        this.warningCount = 0;
        this.logHistory = [];
        this.maxLogHistory = 1000;
        this.debugPanel = null;
        this.isInitialized = false;
        
        this.initializeDebug();
    }
    
    initializeDebug() {
        console.log(`🐛 [DEBUG] Initializing TINI Popup Debug v${this.version}`);
        
        try {
            // Check debug mode from settings
            this.loadDebugSettings();
            
            // Setup error handlers
            this.setupErrorHandlers();
            
            // Setup console overrides
            this.setupConsoleOverrides();
            
            // Setup debug panel
            this.setupDebugPanel();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            this.isInitialized = true;
            console.log('🐛 [DEBUG] Debug system initialized');
            
        } catch (error) {
            console.error('🐛 [DEBUG] Failed to initialize debug system:', error);
        }
    }
    
    async loadDebugSettings() {
        try {
            const result = await chrome.storage.local.get(['tiniDebugSettings']);
            
            if (result.tiniDebugSettings) {
                const settings = result.tiniDebugSettings;
                this.debugMode = settings.enabled || false;
                this.maxLogHistory = settings.maxLogHistory || 1000;
                
                console.log(`🐛 [DEBUG] Debug mode: ${this.debugMode ? 'ENABLED' : 'DISABLED'}`);
            }
            
        } catch (error) {
            console.warn('🐛 [DEBUG] Failed to load debug settings:', error);
        }
    }
    
    setupErrorHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : 'No stack available',
                timestamp: new Date().toISOString(),
                url: window.location.href
            });
        });
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'Unhandled Promise Rejection',
                reason: event.reason,
                promise: event.promise,
                timestamp: new Date().toISOString(),
                url: window.location.href
            });
        });
        
        // Chrome extension error handler
        if (chrome && chrome.runtime) {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.type === 'DEBUG_ERROR') {
                    this.logError({
                        type: 'Extension Error',
                        data: message.data,
                        sender: sender,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        }
    }
    
    setupConsoleOverrides() {
        // Store original console methods
        this.originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            debug: console.debug
        };
        
        // Override console methods to capture logs
        console.log = (...args) => {
            this.captureLog('log', args);
            this.originalConsole.log.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.captureLog('warn', args);
            this.warningCount++;
            this.originalConsole.warn.apply(console, args);
        };
        
        console.error = (...args) => {
            this.captureLog('error', args);
            this.errorCount++;
            this.originalConsole.error.apply(console, args);
        };
        
        console.info = (...args) => {
            this.captureLog('info', args);
            this.originalConsole.info.apply(console, args);
        };
        
        console.debug = (...args) => {
            if (this.debugMode) {
                this.captureLog('debug', args);
                this.originalConsole.debug.apply(console, args);
            }
        };
    }
    
    captureLog(level, args) {
        const logEntry = {
            level: level,
            message: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '),
            timestamp: new Date().toISOString(),
            stack: this.getStackTrace()
        };
        
        this.logHistory.push(logEntry);
        
        // Maintain log history size
        if (this.logHistory.length > this.maxLogHistory) {
            this.logHistory = this.logHistory.slice(-this.maxLogHistory);
        }
        
        // Update debug panel if visible
        if (this.debugPanel && this.debugPanel.style.display !== 'none') {
            this.updateDebugPanel();
        }
    }
    
    getStackTrace() {
        try {
            throw new Error();
        } catch (e) {
            return e.stack ? e.stack.split('\n').slice(3, 8).join('\n') : 'No stack available';
        }
    }
    
    logError(errorInfo) {
        this.errorCount++;
        
        const errorEntry = {
            ...errorInfo,
            id: this.generateErrorId(),
            category: this.categorizeError(errorInfo),
            severity: this.assessErrorSeverity(errorInfo)
        };
        
        this.logHistory.push({
            level: 'error',
            message: `[${errorEntry.type}] ${errorInfo.message || errorInfo.reason}`,
            timestamp: errorInfo.timestamp,
            details: errorEntry
        });
        
        // Send to background for logging
        this.reportError(errorEntry);
        
        // Show in debug panel
        if (this.debugMode) {
            this.showErrorNotification(errorEntry);
        }
    }
    
    generateErrorId() {
        return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    categorizeError(errorInfo) {
        const message = errorInfo.message || errorInfo.reason || '';
        
        if (message.includes('chrome') || message.includes('extension')) {
            return 'extension';
        } else if (message.includes('network') || message.includes('fetch')) {
            return 'network';
        } else if (message.includes('permission') || message.includes('denied')) {
            return 'permissions';
        } else if (message.includes('undefined') || message.includes('null')) {
            return 'reference';
        } else {
            return 'general';
        }
    }
    
    assessErrorSeverity(errorInfo) {
        const message = errorInfo.message || errorInfo.reason || '';
        
        if (message.includes('critical') || message.includes('fatal')) {
            return 'critical';
        } else if (message.includes('permission') || message.includes('security')) {
            return 'high';
        } else if (message.includes('network') || message.includes('timeout')) {
            return 'medium';
        } else {
            return 'low';
        }
    }
    
    setupDebugPanel() {
        if (!this.debugMode) return;
        
        this.createDebugPanel();
        this.updateDebugPanel();
    }
    
    createDebugPanel() {
        this.debugPanel = document.createElement('div');
        this.debugPanel.id = 'tini-debug-panel';
        this.debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.95);
            color: #fff;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            z-index: 10000;
            display: none;
            overflow-y: auto;
        `;
        
        this.debugPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0; color: #4CAF50;">🐛 TINI Debug Panel</h4>
                <button id="debug-panel-close" style="background: #f44336; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">&times;</button>
            </div>
            <div id="debug-stats" style="margin-bottom: 10px; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 4px;"></div>
            <div id="debug-logs" style="max-height: 250px; overflow-y: auto; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 4px;"></div>
            <div style="margin-top: 10px; display: flex; gap: 5px;">
                <button id="debug-clear" style="background: #ff9800; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">Clear</button>
                <button id="debug-export" style="background: #2196F3; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">Export</button>
                <button id="debug-refresh" style="background: #4CAF50; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">Refresh</button>
            </div>
        `;
        
        document.body.appendChild(this.debugPanel);
        
        // Setup event listeners
        document.getElementById('debug-panel-close').onclick = () => this.hideDebugPanel();
        document.getElementById('debug-clear').onclick = () => this.clearLogs();
        document.getElementById('debug-export').onclick = () => this.exportLogs();
        document.getElementById('debug-refresh').onclick = () => this.updateDebugPanel();
    }
    
    updateDebugPanel() {
        if (!this.debugPanel) return;
        
        // Update stats
        const statsElement = document.getElementById('debug-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div>Errors: <span style="color: #f44336;">${this.errorCount}</span></div>
                <div>Warnings: <span style="color: #ff9800;">${this.warningCount}</span></div>
                <div>Total Logs: <span style="color: #4CAF50;">${this.logHistory.length}</span></div>
                <div>Memory: ${this.getMemoryUsage()}</div>
            `;
        }
        
        // Update logs
        const logsElement = document.getElementById('debug-logs');
        if (logsElement) {
            const recentLogs = this.logHistory.slice(-50); // Show last 50 logs
            logsElement.innerHTML = recentLogs.map(log => {
                const color = this.getLogColor(log.level);
                const time = new Date(log.timestamp).toLocaleTimeString();
                return `<div style="color: ${color}; margin-bottom: 2px;">
                    [${time}] [${log.level.toUpperCase()}] ${log.message.substring(0, 100)}${log.message.length > 100 ? '...' : ''}
                </div>`;
            }).join('');
            
            // Auto-scroll to bottom
            logsElement.scrollTop = logsElement.scrollHeight;
        }
    }
    
    getLogColor(level) {
        switch (level) {
            case 'error': return '#f44336';
            case 'warn': return '#ff9800';
            case 'info': return '#2196F3';
            case 'debug': return '#9C27B0';
            default: return '#4CAF50';
        }
    }
    
    getMemoryUsage() {
        if (performance.memory) {
            const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            return `${used}MB`;
        }
        return 'N/A';
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+D = Toggle debug panel
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                this.toggleDebugPanel();
            }
            
            // Ctrl+Shift+R = Reset debug
            if (event.ctrlKey && event.shiftKey && event.key === 'R') {
                event.preventDefault();
                this.resetDebug();
            }
            
            // Ctrl+Shift+E = Export logs
            if (event.ctrlKey && event.shiftKey && event.key === 'E') {
                event.preventDefault();
                this.exportLogs();
            }
        });
    }
    
    setupPerformanceMonitoring() {
        // Monitor performance entries
        if (window.PerformanceObserver) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 100) { // Log slow operations
                        this.logPerformanceIssue(entry);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['measure', 'navigation'] });
        }
        
        // Monitor long tasks
        if (window.PerformanceLongTaskTiming) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.logPerformanceIssue({
                        name: 'Long Task',
                        duration: entry.duration,
                        startTime: entry.startTime,
                        type: 'longtask'
                    });
                });
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        }
    }
    
    logPerformanceIssue(entry) {
        this.captureLog('warn', [
            `🚀 Performance issue: ${entry.name} took ${entry.duration.toFixed(2)}ms`
        ]);
    }
    
    // Public API methods
    enableDebugMode() {
        this.debugMode = true;
        this.saveDebugSettings();
        this.setupDebugPanel();
        console.log('🐛 [DEBUG] Debug mode enabled');
    }
    
    disableDebugMode() {
        this.debugMode = false;
        this.saveDebugSettings();
        this.hideDebugPanel();
        console.log('🐛 [DEBUG] Debug mode disabled');
    }
    
    toggleDebugMode() {
        if (this.debugMode) {
            this.disableDebugMode();
        } else {
            this.enableDebugMode();
        }
    }
    
    showDebugPanel() {
        if (!this.debugPanel) {
            this.createDebugPanel();
        }
        this.debugPanel.style.display = 'block';
        this.updateDebugPanel();
    }
    
    hideDebugPanel() {
        if (this.debugPanel) {
            this.debugPanel.style.display = 'none';
        }
    }
    
    toggleDebugPanel() {
        if (!this.debugPanel || this.debugPanel.style.display === 'none') {
            this.showDebugPanel();
        } else {
            this.hideDebugPanel();
        }
    }
    
    clearLogs() {
        this.logHistory = [];
        this.errorCount = 0;
        this.warningCount = 0;
        this.updateDebugPanel();
        console.log('🐛 [DEBUG] Logs cleared');
    }
    
    exportLogs() {
        const exportData = {
            version: this.version,
            timestamp: new Date().toISOString(),
            errorCount: this.errorCount,
            warningCount: this.warningCount,
            totalLogs: this.logHistory.length,
            logs: this.logHistory,
            systemInfo: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                memory: this.getMemoryUsage()
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tini-debug-logs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('🐛 [DEBUG] Logs exported');
    }
    
    resetDebug() {
        this.clearLogs();
        this.debugMode = false;
        this.hideDebugPanel();
        console.log('🐛 [DEBUG] Debug system reset');
    }
    
    async saveDebugSettings() {
        try {
            await chrome.storage.local.set({
                tiniDebugSettings: {
                    enabled: this.debugMode,
                    maxLogHistory: this.maxLogHistory,
                    lastUpdated: new Date().toISOString()
                }
            });
        } catch (error) {
            console.warn('🐛 [DEBUG] Failed to save debug settings:', error);
        }
    }
    
    reportError(errorEntry) {
        if (chrome && chrome.runtime) {
            chrome.runtime.sendMessage({
                type: 'DEBUG_ERROR_REPORT',
                data: errorEntry
            }).catch(err => {
                console.warn('🐛 [DEBUG] Failed to report error:', err);
            });
        }
    }
    
    showErrorNotification(errorEntry) {
        // Simple notification for critical errors
        if (errorEntry.severity === 'critical') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50px;
                right: 10px;
                background: #f44336;
                color: white;
                padding: 10px;
                border-radius: 4px;
                max-width: 300px;
                z-index: 10001;
                font-size: 12px;
            `;
            notification.innerHTML = `
                <strong>Critical Error:</strong><br>
                ${errorEntry.message || errorEntry.reason}
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }
    }
    
    // Utility methods for external use
    assert(condition, message) {
        if (!condition) {
            const error = new Error(`Assertion failed: ${message}`);
            this.logError({
                type: 'Assertion Error',
                message: message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }
    
    time(label) {
        if (this.debugMode) {
            console.time(label);
        }
    }
    
    timeEnd(label) {
        if (this.debugMode) {
            console.timeEnd(label);
        }
    }
    
    profile(label) {
        if (this.debugMode && console.profile) {
            console.profile(label);
        }
    }
    
    profileEnd(label) {
        if (this.debugMode && console.profileEnd) {
            console.profileEnd(label);
        }
    }
    
    getDebugInfo() {
        return {
            version: this.version,
            debugMode: this.debugMode,
            errorCount: this.errorCount,
            warningCount: this.warningCount,
            logCount: this.logHistory.length,
            memoryUsage: this.getMemoryUsage(),
            isInitialized: this.isInitialized
        };
    }
    
    destroy() {
        // Restore original console methods
        if (this.originalConsole) {
            console.log = this.originalConsole.log;
            console.warn = this.originalConsole.warn;
            console.error = this.originalConsole.error;
            console.info = this.originalConsole.info;
            console.debug = this.originalConsole.debug;
        }
        
        // Remove debug panel
        if (this.debugPanel && this.debugPanel.parentNode) {
            this.debugPanel.remove();
        }
        
        console.log('🐛 [DEBUG] Debug system destroyed');
    }
}

// Initialize debug system
document.addEventListener('DOMContentLoaded', () => {
    window.tiniPopupDebug = new TINIPopupDebug();
});

// Global debug utilities
window.TINIDebug = {
    enable: () => window.tiniPopupDebug && window.tiniPopupDebug.enableDebugMode(),
    disable: () => window.tiniPopupDebug && window.tiniPopupDebug.disableDebugMode(),
    toggle: () => window.tiniPopupDebug && window.tiniPopupDebug.toggleDebugMode(),
    panel: () => window.tiniPopupDebug && window.tiniPopupDebug.toggleDebugPanel(),
    clear: () => window.tiniPopupDebug && window.tiniPopupDebug.clearLogs(),
    export: () => window.tiniPopupDebug && window.tiniPopupDebug.exportLogs(),
    info: () => window.tiniPopupDebug && window.tiniPopupDebug.getDebugInfo()
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIPopupDebug;
}

console.log('🐛 [DEBUG] Popup debug system loaded');
