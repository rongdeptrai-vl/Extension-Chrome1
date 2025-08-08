// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🚀 TINI Popup Integration System v4.5
 * Hệ thống tích hợp giao diện popup TINI hoàn chỉnh
 * Tích hợp tất cả các thành phần popup đã được khôi phục
 */

class TINIPopupIntegrationSystem {
    constructor() {
        this.version = "4.5";
        this.components = new Map();
        this.integrationStatus = new Map();
        this.systemReady = false;
        
        console.log(`🚀 [TINI POPUP] Integration System v${this.version} initializing...`);
        this.initializeIntegrationSystem();
    }
    
    async initializeIntegrationSystem() {
        try {
            // Khởi tạo các thành phần cốt lõi
            await this.initializeCoreComponents();
            
            // Tích hợp hệ thống debug
            await this.integrateDebugSystems();
            
            // Tích hợp hệ thống authentication
            await this.integrateAuthSystems();
            
            // Tích hợp hệ thống monitoring
            await this.integrateMonitoringSystems();
            
            // Tích hợp CSP handlers
            await this.integrateCSPHandlers();
            
            // Khởi động controller chính
            await this.initializeMainController();
            
            // Kiểm tra tính toàn vẹn hệ thống
            await this.performIntegrityCheck();
            
            this.systemReady = true;
            console.log('🚀 [TINI POPUP] All systems integrated successfully');
            
        } catch (error) {
            console.error('🚀 [TINI POPUP] Integration failed:', error);
            this.handleIntegrationFailure(error);
        }
    }
    
    async initializeCoreComponents() {
        console.log('🚀 [TINI POPUP] Initializing core components...');
        
        // Đăng ký các thành phần chính
        this.registerComponent('controller', 'Popup Controller.js');
        this.registerComponent('auth', 'popup-auth-enhanced.js');
        this.registerComponent('csp', 'popup-csp-handlers.js');
        this.registerComponent('debug', 'popup-debug.js');
        this.registerComponent('debugEnhanced', 'popup-debug-enhanced.js');
        this.registerComponent('monitor', 'popup-production-monitor.js');
        
        // Khởi tạo popup chính
        await this.initializeMainPopup();
        
        console.log('🚀 [TINI POPUP] Core components registered');
    }
    
    registerComponent(name, filename) {
        this.components.set(name, {
            filename: filename,
            loaded: false,
            instance: null,
            status: 'pending'
        });
    }
    
    async initializeMainPopup() {
        // Kiểm tra HTML popup có tồn tại
        const popupHTML = document.querySelector('html');
        if (popupHTML) {
            console.log('🚀 [TINI POPUP] Main popup HTML detected');
            
            // Thiết lập CSS styling
            this.applyPopupStyling();
            
            // Thiết lập event listeners cơ bản
            this.setupBasicEventListeners();
        }
    }
    
    applyPopupStyling() {
        // Áp dụng styling cơ bản cho popup
        if (!document.querySelector('#tini-popup-base-styles')) {
            const style = document.createElement('style');
            style.id = 'tini-popup-base-styles';
            style.textContent = `
                .tini-popup-container {
                    min-width: 350px;
                    min-height: 400px;
                    background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
                    color: white;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .tini-header {
                    background: linear-gradient(90deg, #e65c00 0%, #ff8500 100%);
                    padding: 15px;
                    text-align: center;
                    font-weight: bold;
                }
                
                .tini-status-indicator {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #4CAF50;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    setupBasicEventListeners() {
        // Thiết lập keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+D - Toggle debug mode
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                this.toggleDebugMode();
                event.preventDefault();
            }
            
            // Ctrl+Shift+M - Toggle monitoring
            if (event.ctrlKey && event.shiftKey && event.key === 'M') {
                this.toggleMonitoring();
                event.preventDefault();
            }
            
            // Ctrl+Shift+A - Toggle authentication
            if (event.ctrlKey && event.shiftKey && event.key === 'A') {
                this.toggleAuthentication();
                event.preventDefault();
            }
        });
    }
    
    async integrateDebugSystems() {
        console.log('🚀 [TINI POPUP] Integrating debug systems...');
        
        try {
            // Khởi tạo debug cơ bản
            if (window.TINIPopupDebug) {
                const debugInstance = new window.TINIPopupDebug();
                this.components.get('debug').instance = debugInstance;
                this.components.get('debug').loaded = true;
                this.components.get('debug').status = 'active';
                console.log('🚀 [DEBUG] Basic debug system integrated');
            }
            
            // Khởi tạo debug nâng cao
            if (window.TINIPopupDebugEnhanced) {
                const debugEnhancedInstance = new window.TINIPopupDebugEnhanced();
                this.components.get('debugEnhanced').instance = debugEnhancedInstance;
                this.components.get('debugEnhanced').loaded = true;
                this.components.get('debugEnhanced').status = 'active';
                console.log('🚀 [DEBUG+] Enhanced debug system integrated');
            }
            
            this.integrationStatus.set('debug', 'success');
            
        } catch (error) {
            console.error('🚀 [TINI POPUP] Debug integration failed:', error);
            this.integrationStatus.set('debug', 'failed');
        }
    }
    
    async integrateAuthSystems() {
        console.log('🚀 [TINI POPUP] Integrating authentication systems...');
        
        try {
            if (window.TINIPopupAuthEnhanced) {
                const authInstance = new window.TINIPopupAuthEnhanced();
                this.components.get('auth').instance = authInstance;
                this.components.get('auth').loaded = true;
                this.components.get('auth').status = 'active';
                console.log('🚀 [AUTH] Enhanced authentication system integrated');
            }
            
            this.integrationStatus.set('auth', 'success');
            
        } catch (error) {
            console.error('🚀 [TINI POPUP] Auth integration failed:', error);
            this.integrationStatus.set('auth', 'failed');
        }
    }
    
    async integrateMonitoringSystems() {
        console.log('🚀 [TINI POPUP] Integrating monitoring systems...');
        
        try {
            if (window.TINIPopupProductionMonitor) {
                const monitorInstance = new window.TINIPopupProductionMonitor();
                this.components.get('monitor').instance = monitorInstance;
                this.components.get('monitor').loaded = true;
                this.components.get('monitor').status = 'active';
                console.log('🚀 [MONITOR] Production monitoring system integrated');
            }
            
            this.integrationStatus.set('monitor', 'success');
            
        } catch (error) {
            console.error('🚀 [TINI POPUP] Monitor integration failed:', error);
            this.integrationStatus.set('monitor', 'failed');
        }
    }
    
    async integrateCSPHandlers() {
        console.log('🚀 [TINI POPUP] Integrating CSP handlers...');
        
        try {
            if (window.TINIPopupCSPHandlers) {
                const cspInstance = new window.TINIPopupCSPHandlers();
                this.components.get('csp').instance = cspInstance;
                this.components.get('csp').loaded = true;
                this.components.get('csp').status = 'active';
                console.log('🚀 [CSP] CSP handlers integrated');
            }
            
            this.integrationStatus.set('csp', 'success');
            
        } catch (error) {
            console.error('🚀 [TINI POPUP] CSP integration failed:', error);
            this.integrationStatus.set('csp', 'failed');
        }
    }
    
    async initializeMainController() {
        console.log('🚀 [TINI POPUP] Initializing main controller...');
        
        try {
            if (window.TINIPopupController) {
                const controllerInstance = new window.TINIPopupController();
                this.components.get('controller').instance = controllerInstance;
                this.components.get('controller').loaded = true;
                this.components.get('controller').status = 'active';
                console.log('🚀 [CONTROLLER] Main popup controller integrated');
            }
            
            this.integrationStatus.set('controller', 'success');
            
        } catch (error) {
            console.error('🚀 [TINI POPUP] Controller integration failed:', error);
            this.integrationStatus.set('controller', 'failed');
        }
    }
    
    async performIntegrityCheck() {
        console.log('🚀 [TINI POPUP] Performing system integrity check...');
        
        const results = {
            totalComponents: this.components.size,
            loadedComponents: 0,
            failedComponents: 0,
            integrityScore: 0
        };
        
        for (const [name, component] of this.components) {
            if (component.loaded && component.status === 'active') {
                results.loadedComponents++;
            } else {
                results.failedComponents++;
                console.warn(`🚀 [INTEGRITY] Component ${name} failed to load`);
            }
        }
        
        results.integrityScore = (results.loadedComponents / results.totalComponents) * 100;
        
        console.log('🚀 [INTEGRITY] Check results:', results);
        
        if (results.integrityScore >= 80) {
            console.log('🚀 [INTEGRITY] ✅ System integrity: EXCELLENT');
        } else if (results.integrityScore >= 60) {
            console.log('🚀 [INTEGRITY] ⚠️ System integrity: GOOD');
        } else {
            console.warn('🚀 [INTEGRITY] ❌ System integrity: POOR');
        }
        
        return results;
    }
    
    // Public API methods
    toggleDebugMode() {
        const debugComponent = this.components.get('debug');
        const debugEnhancedComponent = this.components.get('debugEnhanced');
        
        if (debugComponent?.instance) {
            debugComponent.instance.toggle();
        }
        
        if (debugEnhancedComponent?.instance) {
            debugEnhancedComponent.instance.toggleDebuggerUI();
        }
        
        console.log('🚀 [TINI POPUP] Debug mode toggled');
    }
    
    toggleMonitoring() {
        const monitorComponent = this.components.get('monitor');
        
        if (monitorComponent?.instance) {
            if (monitorComponent.instance.isActive) {
                monitorComponent.instance.stopMonitoring();
            } else {
                monitorComponent.instance.startMonitoring();
            }
        }
        
        console.log('🚀 [TINI POPUP] Monitoring toggled');
    }
    
    toggleAuthentication() {
        const authComponent = this.components.get('auth');
        
        if (authComponent?.instance) {
            authComponent.instance.toggleAuthMode();
        }
        
        console.log('🚀 [TINI POPUP] Authentication toggled');
    }
    
    getSystemStatus() {
        const status = {
            version: this.version,
            systemReady: this.systemReady,
            components: Array.from(this.components.entries()).map(([name, comp]) => ({
                name: name,
                loaded: comp.loaded,
                status: comp.status,
                filename: comp.filename
            })),
            integrationStatus: Array.from(this.integrationStatus.entries()),
            timestamp: new Date().toISOString()
        };
        
        return status;
    }
    
    async reinitializeComponent(componentName) {
        console.log(`🚀 [TINI POPUP] Reinitializing component: ${componentName}`);
        
        const component = this.components.get(componentName);
        if (!component) {
            console.error(`🚀 [TINI POPUP] Component ${componentName} not found`);
            return false;
        }
        
        try {
            // Reset component state
            component.loaded = false;
            component.instance = null;
            component.status = 'reinitializing';
            
            // Reinitialize based on component type
            switch (componentName) {
                case 'debug':
                    await this.integrateDebugSystems();
                    break;
                case 'auth':
                    await this.integrateAuthSystems();
                    break;
                case 'monitor':
                    await this.integrateMonitoringSystems();
                    break;
                case 'csp':
                    await this.integrateCSPHandlers();
                    break;
                case 'controller':
                    await this.initializeMainController();
                    break;
                default:
                    console.warn(`🚀 [TINI POPUP] Unknown component: ${componentName}`);
                    return false;
            }
            
            console.log(`🚀 [TINI POPUP] Component ${componentName} reinitialized successfully`);
            return true;
            
        } catch (error) {
            console.error(`🚀 [TINI POPUP] Failed to reinitialize ${componentName}:`, error);
            component.status = 'failed';
            return false;
        }
    }
    
    handleIntegrationFailure(error) {
        console.error('🚀 [TINI POPUP] Integration failure detected:', error);
        
        // Thử khôi phục tự động
        console.log('🚀 [TINI POPUP] Attempting automatic recovery...');
        
        setTimeout(() => {
            this.initializeIntegrationSystem();
        }, 2000);
    }
    
    exportSystemDiagnostics() {
        const diagnostics = {
            system: this.getSystemStatus(),
            performance: this.getPerformanceMetrics(),
            errors: this.getErrorLog(),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(diagnostics, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tini-popup-diagnostics-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('🚀 [TINI POPUP] System diagnostics exported');
    }
    
    getPerformanceMetrics() {
        return {
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            timing: performance.timing,
            navigation: performance.navigation
        };
    }
    
    getErrorLog() {
        // Trả về log lỗi từ các component debug
        const debugComponent = this.components.get('debug');
        const debugEnhancedComponent = this.components.get('debugEnhanced');
        
        let errorLog = [];
        
        if (debugComponent?.instance?.debugLogs) {
            errorLog = errorLog.concat(debugComponent.instance.debugLogs.filter(log => log.level === 'error'));
        }
        
        if (debugEnhancedComponent?.instance?.debugLogs) {
            errorLog = errorLog.concat(debugEnhancedComponent.instance.debugLogs.filter(log => log.level === 'error'));
        }
        
        return errorLog;
    }
}

// Khởi tạo hệ thống tích hợp TINI Popup
document.addEventListener('DOMContentLoaded', () => {
    window.tiniPopupIntegration = new TINIPopupIntegrationSystem();
    
    // Expose global commands
    window.TINI = window.TINI || {};
    window.TINI.popup = {
        status: () => window.tiniPopupIntegration.getSystemStatus(),
        debug: () => window.tiniPopupIntegration.toggleDebugMode(),
        monitor: () => window.tiniPopupIntegration.toggleMonitoring(),
        auth: () => window.tiniPopupIntegration.toggleAuthentication(),
        restart: (component) => window.tiniPopupIntegration.reinitializeComponent(component),
        diagnostics: () => window.tiniPopupIntegration.exportSystemDiagnostics()
    };
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIPopupIntegrationSystem;
}

console.log('🚀 [TINI POPUP] Integration system ready - Use TINI.popup.* commands');
