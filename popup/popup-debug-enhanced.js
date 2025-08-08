// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🚀 TINI POPUP DEBUG ENHANCED v3.0
 * Advanced debugging system with enhanced features for popup interface
 * Hệ thống debug nâng cao với tính năng mở rộng cho giao diện popup
 */

class TINIPopupDebugEnhanced {
    constructor() {
        this.version = "3.0";
        this.isActive = false;
        this.debugLevel = 'info'; // debug, info, warn, error
        this.modules = new Map();
        this.breakpoints = new Set();
        this.watchers = new Map();
        this.interceptors = new Map();
        this.snapshots = [];
        this.maxSnapshots = 50;
        this.debuggerUI = null;
        this.recordingSession = null;
        
        this.initializeEnhancedDebug();
    }
    
    initializeEnhancedDebug() {
        console.log(`🚀 [DEBUG+] Initializing Enhanced Debug System v${this.version}`);
        
        try {
            // Initialize core debugging
            this.setupCoreDebugging();
            
            // Initialize advanced features
            this.setupAdvancedFeatures();
            
            // Initialize UI debugger
            this.setupDebuggerUI();
            
            // Initialize module tracking
            this.setupModuleTracking();
            
            // Initialize network interception
            this.setupNetworkInterception();
            
            // Initialize state watching
            this.setupStateWatching();
            
            console.log('🚀 [DEBUG+] Enhanced debug system initialized');
            
        } catch (error) {
            console.error('🚀 [DEBUG+] Initialization failed:', error);
        }
    }
    
    setupCoreDebugging() {
        // Enhanced error tracking with stack analysis
        this.setupEnhancedErrorTracking();
        
        // Performance profiling
        this.setupPerformanceProfiling();
        
        // Memory leak detection
        this.setupMemoryLeakDetection();
        
        // Console command injection
        this.setupConsoleCommands();
    }
    
    setupEnhancedErrorTracking() {
        const originalError = window.Error;
        
        window.Error = function(...args) {
            const error = new originalError(...args);
            
            // Enhanced stack trace analysis
            if (error.stack) {
                error.enhancedStack = window.tiniDebugEnhanced?.analyzeStackTrace(error.stack);
            }
            
            // Add debug context
            error.debugContext = window.tiniDebugEnhanced?.getDebugContext();
            
            return error;
        };
        
        // Copy static properties
        Object.setPrototypeOf(window.Error, originalError);
        Object.defineProperty(window.Error, 'prototype', {
            value: originalError.prototype,
            writable: false
        });
    }
    
    analyzeStackTrace(stack) {
        const lines = stack.split('\n');
        const analysis = {
            origin: null,
            path: [],
            modules: [],
            externalCalls: []
        };
        
        lines.forEach((line, index) => {
            if (line.includes('chrome-extension://')) {
                const match = line.match(/chrome-extension:\/\/[^\/]+\/(.+?):/);
                if (match) {
                    const file = match[1];
                    analysis.path.push(file);
                    
                    if (file.includes('popup')) analysis.modules.push('popup');
                    if (file.includes('background')) analysis.modules.push('background');
                    if (file.includes('content')) analysis.modules.push('content');
                }
            } else if (line.includes('http')) {
                analysis.externalCalls.push(line);
            }
            
            if (index === 1) {
                analysis.origin = line;
            }
        });
        
        return analysis;
    }
    
    getDebugContext() {
        return {
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            memory: this.getMemorySnapshot(),
            activeModules: Array.from(this.modules.keys()),
            currentState: this.getCurrentState()
        };
    }
    
    setupPerformanceProfiling() {
        // Advanced performance monitoring
        this.performanceMarks = new Map();
        this.performanceMeasures = [];
        
        // Override performance methods
        const originalMark = performance.mark;
        const originalMeasure = performance.measure;
        
        performance.mark = (name) => {
            this.performanceMarks.set(name, {
                timestamp: performance.now(),
                context: this.getDebugContext()
            });
            return originalMark.call(performance, name);
        };
        
        performance.measure = (name, startMark, endMark) => {
            const result = originalMeasure.call(performance, name, startMark, endMark);
            
            this.performanceMeasures.push({
                name: name,
                startMark: startMark,
                endMark: endMark,
                duration: result ? result.duration : 0,
                timestamp: Date.now()
            });
            
            return result;
        };
    }
    
    setupMemoryLeakDetection() {
        this.memoryBaseline = null;
        this.memorySnapshots = [];
        
        // Take initial memory baseline
        setTimeout(() => {
            this.memoryBaseline = this.getMemorySnapshot();
        }, 1000);
        
        // Regular memory monitoring
        setInterval(() => {
            const snapshot = this.getMemorySnapshot();
            this.memorySnapshots.push(snapshot);
            
            // Keep only last 20 snapshots
            if (this.memorySnapshots.length > 20) {
                this.memorySnapshots.shift();
            }
            
            // Detect potential leaks
            this.detectMemoryLeaks();
        }, 30000); // Every 30 seconds
    }
    
    getMemorySnapshot() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };
        }
        return null;
    }
    
    detectMemoryLeaks() {
        if (this.memorySnapshots.length < 5) return;
        
        const recent = this.memorySnapshots.slice(-5);
        const growth = recent[recent.length - 1].used - recent[0].used;
        const threshold = 10 * 1024 * 1024; // 10MB
        
        if (growth > threshold) {
            this.logAdvanced('warn', 'Potential memory leak detected', {
                growth: `${(growth / 1024 / 1024).toFixed(2)}MB`,
                period: '2.5 minutes',
                snapshots: recent
            });
        }
    }
    
    setupConsoleCommands() {
        // Inject debug commands into console
        window.TINI = {
            debug: {
                start: () => this.startDebugging(),
                stop: () => this.stopDebugging(),
                status: () => this.getDebugStatus(),
                snapshot: () => this.takeSnapshot(),
                breakpoint: (condition) => this.setBreakpoint(condition),
                watch: (expr, callback) => this.watchExpression(expr, callback),
                intercept: (method, handler) => this.interceptMethod(method, handler),
                analyze: () => this.analyzePerformance(),
                memory: () => this.analyzeMemory(),
                modules: () => this.getModuleStatus(),
                record: (duration) => this.startRecording(duration),
                replay: () => this.replaySession(),
                export: () => this.exportDebugData(),
                ui: () => this.toggleDebuggerUI()
            }
        };
        
        console.log('🚀 [DEBUG+] Debug commands available via TINI.debug.*');
    }
    
    setupAdvancedFeatures() {
        // Setup DOM mutation tracking
        this.setupDOMMutationTracking();
        
        // Setup event flow monitoring
        this.setupEventFlowMonitoring();
        
        // Setup XHR/Fetch interception
        this.setupNetworkInterception();
        
        // Setup WebGL context monitoring
        this.setupWebGLMonitoring();
    }
    
    setupDOMMutationTracking() {
        this.mutationObserver = new MutationObserver((mutations) => {
            if (this.isActive) {
                mutations.forEach((mutation) => {
                    this.logAdvanced('debug', 'DOM Mutation', {
                        type: mutation.type,
                        target: mutation.target.tagName,
                        addedNodes: mutation.addedNodes.length,
                        removedNodes: mutation.removedNodes.length,
                        attributes: mutation.attributeName
                    });
                });
            }
        });
        
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true
        });
    }
    
    setupEventFlowMonitoring() {
        const eventTypes = ['click', 'keydown', 'submit', 'load', 'error'];
        
        eventTypes.forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                if (this.isActive) {
                    this.logAdvanced('debug', `Event: ${eventType}`, {
                        target: event.target.tagName,
                        timestamp: Date.now(),
                        coordinates: event.clientX ? { x: event.clientX, y: event.clientY } : null,
                        key: event.key || null
                    });
                }
            }, true);
        });
    }
    
    setupNetworkInterception() {
        // Intercept fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            
            try {
                const response = await originalFetch.apply(window, args);
                const endTime = performance.now();
                
                this.logAdvanced('info', 'Fetch Request', {
                    url: args[0],
                    method: args[1]?.method || 'GET',
                    duration: endTime - startTime,
                    status: response.status,
                    ok: response.ok
                });
                
                return response;
            } catch (error) {
                const endTime = performance.now();
                
                this.logAdvanced('error', 'Fetch Error', {
                    url: args[0],
                    duration: endTime - startTime,
                    error: error.message
                });
                
                throw error;
            }
        };
        
        // Intercept XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            const originalSend = xhr.send;
            
            let requestData = {};
            
            xhr.open = function(method, url, ...args) {
                requestData = { method, url, startTime: performance.now() };
                return originalOpen.apply(this, [method, url, ...args]);
            };
            
            xhr.send = function(...args) {
                this.addEventListener('loadend', () => {
                    const endTime = performance.now();
                    window.tiniDebugEnhanced?.logAdvanced('info', 'XHR Request', {
                        ...requestData,
                        duration: endTime - requestData.startTime,
                        status: this.status,
                        response: this.responseText?.substring(0, 100)
                    });
                });
                
                return originalSend.apply(this, args);
            };
            
            return xhr;
        };
    }
    
    setupWebGLMonitoring() {
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        
        HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {
            const context = originalGetContext.apply(this, [contextType, ...args]);
            
            if (contextType.includes('webgl')) {
                window.tiniDebugEnhanced?.logAdvanced('info', 'WebGL Context Created', {
                    contextType: contextType,
                    canvas: {
                        width: this.width,
                        height: this.height
                    }
                });
                
                // Monitor WebGL errors
                const originalGetError = context.getError;
                context.getError = function() {
                    const error = originalGetError.apply(this);
                    if (error !== context.NO_ERROR) {
                        window.tiniDebugEnhanced?.logAdvanced('error', 'WebGL Error', {
                            error: error,
                            errorName: this.getErrorName ? this.getErrorName(error) : 'Unknown'
                        });
                    }
                    return error;
                };
            }
            
            return context;
        };
    }
    
    setupDebuggerUI() {
        // Create advanced debugger UI
        this.createDebuggerUI();
        this.setupUIEventHandlers();
    }
    
    createDebuggerUI() {
        this.debuggerUI = document.createElement('div');
        this.debuggerUI.id = 'tini-debugger-enhanced';
        this.debuggerUI.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            width: 400px;
            height: 600px;
            background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
            border: 1px solid #444;
            border-radius: 12px;
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            z-index: 10000;
            display: none;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;
        
        this.debuggerUI.innerHTML = this.getDebuggerHTML();
        document.body.appendChild(this.debuggerUI);
    }
    
    getDebuggerHTML() {
        return `
            <div style="background: linear-gradient(90deg, #e65c00 0%, #ff8500 100%); padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 14px;">🚀 TINI Enhanced Debugger</h3>
                <button id="debugger-close" style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">&times;</button>
            </div>
            
            <div style="display: flex; height: calc(100% - 48px);">
                <div style="width: 30%; background: #333; padding: 10px; border-right: 1px solid #555;">
                    <h4 style="margin: 0 0 10px 0; color: #e65c00;">Modules</h4>
                    <div id="modules-list" style="font-size: 10px;"></div>
                    
                    <h4 style="margin: 15px 0 10px 0; color: #e65c00;">Breakpoints</h4>
                    <div id="breakpoints-list" style="font-size: 10px;"></div>
                    
                    <h4 style="margin: 15px 0 10px 0; color: #e65c00;">Watchers</h4>
                    <div id="watchers-list" style="font-size: 10px;"></div>
                </div>
                
                <div style="width: 70%; display: flex; flex-direction: column;">
                    <div style="background: #2a2a2a; padding: 8px; border-bottom: 1px solid #555;">
                        <button class="debug-tab active" data-tab="console">Console</button>
                        <button class="debug-tab" data-tab="network">Network</button>
                        <button class="debug-tab" data-tab="performance">Performance</button>
                        <button class="debug-tab" data-tab="memory">Memory</button>
                    </div>
                    
                    <div style="flex: 1; padding: 10px; overflow-y: auto;">
                        <div id="console-tab" class="debug-content active"></div>
                        <div id="network-tab" class="debug-content" style="display: none;"></div>
                        <div id="performance-tab" class="debug-content" style="display: none;"></div>
                        <div id="memory-tab" class="debug-content" style="display: none;"></div>
                    </div>
                    
                    <div style="background: #2a2a2a; padding: 8px; border-top: 1px solid #555;">
                        <input type="text" id="debug-command" placeholder="Enter debug command..." style="width: calc(100% - 60px); padding: 4px; background: #444; border: 1px solid #666; color: white; border-radius: 3px;">
                        <button id="execute-command" style="width: 50px; padding: 4px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Run</button>
                    </div>
                </div>
            </div>
            
            <style>
                .debug-tab {
                    background: transparent;
                    color: #ccc;
                    border: none;
                    padding: 5px 10px;
                    margin-right: 5px;
                    cursor: pointer;
                    border-radius: 3px;
                }
                .debug-tab.active {
                    background: #e65c00;
                    color: white;
                }
                .debug-content {
                    font-size: 10px;
                    line-height: 1.4;
                }
            </style>
        `;
    }
    
    setupUIEventHandlers() {
        // Tab switching
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('debug-tab')) {
                this.switchDebugTab(event.target.dataset.tab);
            }
        });
        
        // Close button
        const closeBtn = document.getElementById('debugger-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.hideDebuggerUI();
        }
        
        // Command execution
        const executeBtn = document.getElementById('execute-command');
        const commandInput = document.getElementById('debug-command');
        
        if (executeBtn && commandInput) {
            executeBtn.onclick = () => this.executeDebugCommand(commandInput.value);
            commandInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    this.executeDebugCommand(commandInput.value);
                }
            };
        }
    }
    
    switchDebugTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.debug-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.debug-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';
        
        // Load tab content
        this.loadTabContent(tabName);
    }
    
    loadTabContent(tabName) {
        const contentDiv = document.getElementById(`${tabName}-tab`);
        
        switch (tabName) {
            case 'console':
                this.loadConsoleContent(contentDiv);
                break;
            case 'network':
                this.loadNetworkContent(contentDiv);
                break;
            case 'performance':
                this.loadPerformanceContent(contentDiv);
                break;
            case 'memory':
                this.loadMemoryContent(contentDiv);
                break;
        }
    }
    
    loadConsoleContent(div) {
        div.innerHTML = this.debugLogs.slice(-50).map(log => 
            `<div style="color: ${this.getLogColor(log.level)}; margin-bottom: 2px;">
                [${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}
            </div>`
        ).join('');
    }
    
    loadNetworkContent(div) {
        div.innerHTML = this.networkLogs.slice(-20).map(log => 
            `<div style="margin-bottom: 5px; padding: 3px; background: rgba(255,255,255,0.05);">
                <div style="color: #4CAF50;">${log.method} ${log.url}</div>
                <div style="color: #ccc;">Status: ${log.status} | Duration: ${log.duration.toFixed(2)}ms</div>
            </div>`
        ).join('');
    }
    
    loadPerformanceContent(div) {
        const marks = Array.from(this.performanceMarks.entries());
        div.innerHTML = `
            <h5 style="color: #e65c00;">Performance Marks</h5>
            ${marks.map(([name, data]) => 
                `<div>${name}: ${data.timestamp.toFixed(2)}ms</div>`
            ).join('')}
            
            <h5 style="color: #e65c00; margin-top: 15px;">Measures</h5>
            ${this.performanceMeasures.slice(-10).map(measure => 
                `<div>${measure.name}: ${measure.duration.toFixed(2)}ms</div>`
            ).join('')}
        `;
    }
    
    loadMemoryContent(div) {
        const latest = this.memorySnapshots[this.memorySnapshots.length - 1];
        div.innerHTML = latest ? `
            <h5 style="color: #e65c00;">Current Memory Usage</h5>
            <div>Used: ${(latest.used / 1024 / 1024).toFixed(2)} MB</div>
            <div>Total: ${(latest.total / 1024 / 1024).toFixed(2)} MB</div>
            <div>Limit: ${(latest.limit / 1024 / 1024).toFixed(2)} MB</div>
            
            <h5 style="color: #e65c00; margin-top: 15px;">Memory Trend</h5>
            ${this.memorySnapshots.slice(-5).map((snapshot, index) => 
                `<div>T-${4-index}: ${(snapshot.used / 1024 / 1024).toFixed(2)} MB</div>`
            ).join('')}
        ` : 'No memory data available';
    }
    
    // Public API for enhanced debugging
    startDebugging() {
        this.isActive = true;
        this.debugLogs = [];
        this.networkLogs = [];
        console.log('🚀 [DEBUG+] Enhanced debugging started');
    }
    
    stopDebugging() {
        this.isActive = false;
        console.log('🚀 [DEBUG+] Enhanced debugging stopped');
    }
    
    toggleDebuggerUI() {
        if (this.debuggerUI.style.display === 'none') {
            this.showDebuggerUI();
        } else {
            this.hideDebuggerUI();
        }
    }
    
    showDebuggerUI() {
        this.debuggerUI.style.display = 'block';
        this.loadTabContent('console');
    }
    
    hideDebuggerUI() {
        this.debuggerUI.style.display = 'none';
    }
    
    logAdvanced(level, message, data = {}) {
        if (!this.debugLogs) this.debugLogs = [];
        
        const logEntry = {
            level: level,
            message: message,
            data: data,
            timestamp: Date.now(),
            stack: new Error().stack
        };
        
        this.debugLogs.push(logEntry);
        
        // Keep only last 1000 logs
        if (this.debugLogs.length > 1000) {
            this.debugLogs = this.debugLogs.slice(-1000);
        }
        
        // Update UI if visible
        if (this.debuggerUI && this.debuggerUI.style.display !== 'none') {
            this.loadTabContent('console');
        }
    }
    
    executeDebugCommand(command) {
        try {
            const result = eval(command);
            this.logAdvanced('info', `Command: ${command}`, { result: result });
            
            const commandInput = document.getElementById('debug-command');
            if (commandInput) {
                commandInput.value = '';
            }
        } catch (error) {
            this.logAdvanced('error', `Command Error: ${command}`, { error: error.message });
        }
    }
    
    getLogColor(level) {
        const colors = {
            debug: '#9C27B0',
            info: '#2196F3',
            warn: '#ff9800',
            error: '#f44336'
        };
        return colors[level] || '#4CAF50';
    }
    
    exportDebugData() {
        const data = {
            version: this.version,
            timestamp: new Date().toISOString(),
            debugLogs: this.debugLogs,
            networkLogs: this.networkLogs,
            performanceMarks: Array.from(this.performanceMarks.entries()),
            performanceMeasures: this.performanceMeasures,
            memorySnapshots: this.memorySnapshots,
            modules: Array.from(this.modules.entries()),
            context: this.getDebugContext()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tini-enhanced-debug-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('🚀 [DEBUG+] Debug data exported');
    }
    
    destroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        if (this.debuggerUI && this.debuggerUI.parentNode) {
            this.debuggerUI.remove();
        }
        
        console.log('🚀 [DEBUG+] Enhanced debug system destroyed');
    }
}

// Initialize enhanced debug system
document.addEventListener('DOMContentLoaded', () => {
    window.tiniDebugEnhanced = new TINIPopupDebugEnhanced();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIPopupDebugEnhanced;
}

console.log('🚀 [DEBUG+] Enhanced popup debug system loaded');
