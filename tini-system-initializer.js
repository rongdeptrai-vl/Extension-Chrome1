// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI System Initializer - Hệ thống khởi tạo và kết nối tổng thể
// Quản lý việc load, verify và kết nối tất cả module trong project

class TiniSystemInitializer {
    constructor() {
        this.requiredModules = [
            // BOSS Security Core
            { name: 'TINI_BOSS_SECURITY', file: 'boss-ghost-security-integration.js', critical: true },
            { name: 'TINI_ULTIMATE_BOSS', file: 'ultimate-boss-core.js', critical: true },
            { name: 'TINI_BOSS_CLIENT', file: 'boss-ultimate-client.js', critical: true },
            
            // Authentication & Security
            { name: 'TINI_ROLE_SECURITY', file: 'SECURITY/tini-role-based-security.js', critical: true },
            { name: 'TINI_SECURE_AUTH', file: 'secure-auth-enhanced.js', critical: true },
            { name: 'TINI_ULTIMATE_SECURITY', file: 'SECURITY/ultimate-security.js', critical: true },
            
            // Monitoring & Performance
            { name: 'TINI_PERFORMANCE_MONITOR', file: 'performance-monitor.js', critical: false },
            { name: 'TINI_NETWORK_MONITOR', file: 'network-monitor-client.js', critical: false },
            
            // Network & Connection
            { name: 'TINI_CONNECTION_MANAGER', file: 'connection-manager.js', critical: true },
            { name: 'TINI_PHANTOM_NETWORK', file: 'phantom-network-layer.js', critical: true },
            
            // Advanced Features
            { name: 'TINI_UNIVERSAL_DISPATCHER', file: 'universal-event-dispatcher.js', critical: true },
            { name: 'TINI_DYNAMIC_CONTROLLER', file: 'advanced-dynamic-system-controller.js', critical: true },
            { name: 'TINI_NETWORK_ADAPTER', file: 'multi-protocol-network-adapter.js', critical: true },
            { name: 'TINI_SYSTEM_BRIDGE', file: 'system-integration-bridge.js', critical: true },
            { name: 'TINI_CROSS_COMMUNICATOR', file: 'cross-component-communicator.js', critical: true },
            
            // AI & Counterattack
            { name: 'TINI_AI_COUNTERATTACK', file: 'ai-powered-counterattack-system.js', critical: true },
            { name: 'TINI_COUNTERATTACK_INTEGRATION', file: 'counterattack-integration.js', critical: false },
            
            // Emergency Systems
            { name: 'TINI_ESCAPE_HATCH', file: 'escape-hatch.js', critical: false },
            { name: 'TINI_EMERGENCY_RECOVERY', file: 'emergency-boss-recovery.js', critical: false },
            
            // Advanced Security
            { name: 'TINI_HONEYPOT_SYSTEM', file: 'SECURITY/advanced-honeypot-system.js', critical: false },
            { name: 'TINI_THREAT_DETECTOR', file: 'SECURITY/internal-threat-detector.js', critical: false }
        ];

        this.loadedModules = new Map();
        this.failedModules = new Map();
        this.initializationStatus = 'pending';
        this.startTime = Date.now();
        
        console.log('🚀 [TINI Initializer] System initializer khởi động...');
    }

    async initialize() {
        console.log('🔄 [TINI Initializer] Bắt đầu quá trình khởi tạo hệ thống...');
        
        try {
            // Bước 1: Verify tất cả module đã load
            await this.verifyModules();
            
            // Bước 2: Kết nối các module với nhau
            await this.connectModules();
            
            // Bước 3: Khởi tạo event system
            await this.initializeEventSystem();
            
            // Bước 4: Chạy health check
            await this.performHealthCheck();
            
            this.initializationStatus = 'completed';
            console.log('✅ [TINI Initializer] Hệ thống đã khởi tạo thành công!');
            
            this.reportStatus();
            
        } catch (error) {
            this.initializationStatus = 'failed';
            console.error('❌ [TINI Initializer] Khởi tạo thất bại:', error);
            this.reportFailure(error);
        }
    }

    async verifyModules() {
        console.log('🔍 [TINI Initializer] Đang kiểm tra module...');
        
        for (const module of this.requiredModules) {
            const exists = this.checkModuleExists(module.name);
            
            if (exists) {
                this.loadedModules.set(module.name, {
                    ...module,
                    instance: window[module.name],
                    loadTime: Date.now()
                });
                console.log(`✅ [TINI Initializer] Module ${module.name} đã load thành công`);
            } else {
                this.failedModules.set(module.name, {
                    ...module,
                    error: 'Module không tồn tại trên window object',
                    failTime: Date.now()
                });
                
                if (module.critical) {
                    console.error(`❌ [TINI Initializer] Module quan trọng ${module.name} không load được!`);
                } else {
                    console.warn(`⚠️ [TINI Initializer] Module tùy chọn ${module.name} không load được`);
                }
            }
        }
    }

    checkModuleExists(moduleName) {
        return typeof window[moduleName] !== 'undefined' && window[moduleName] !== null;
    }

    async connectModules() {
        console.log('🔗 [TINI Initializer] Đang kết nối các module...');
        
        // Kết nối Universal Event Dispatcher với tất cả module
        if (this.loadedModules.has('TINI_UNIVERSAL_DISPATCHER')) {
            const dispatcher = this.loadedModules.get('TINI_UNIVERSAL_DISPATCHER').instance;
            
            // Đăng ký tất cả module với dispatcher
            for (const [name, module] of this.loadedModules) {
                if (name !== 'TINI_UNIVERSAL_DISPATCHER' && module.instance) {
                    try {
                        dispatcher.registerModule(name, module.instance);
                        console.log(`🔗 [TINI Initializer] Đã kết nối ${name} với Event Dispatcher`);
                    } catch (error) {
                        console.warn(`⚠️ [TINI Initializer] Không thể kết nối ${name}:`, error.message);
                    }
                }
            }
        }

        // Kết nối System Bridge với các core module
        if (this.loadedModules.has('TINI_SYSTEM_BRIDGE')) {
            const bridge = this.loadedModules.get('TINI_SYSTEM_BRIDGE').instance;
            
            // Kết nối với các module quan trọng
            const coreModules = [
                'TINI_BOSS_SECURITY',
                'TINI_ROLE_SECURITY', 
                'TINI_CONNECTION_MANAGER',
                'TINI_AI_COUNTERATTACK'
            ];
            
            for (const moduleName of coreModules) {
                if (this.loadedModules.has(moduleName)) {
                    try {
                        bridge.connectModule(moduleName, this.loadedModules.get(moduleName).instance);
                        console.log(`🌉 [TINI Initializer] Bridge đã kết nối với ${moduleName}`);
                    } catch (error) {
                        console.warn(`⚠️ [TINI Initializer] Bridge không thể kết nối ${moduleName}:`, error.message);
                    }
                }
            }
        }

        // Kết nối Cross Component Communicator
        if (this.loadedModules.has('TINI_CROSS_COMMUNICATOR')) {
            const communicator = this.loadedModules.get('TINI_CROSS_COMMUNICATOR').instance;
            
            // Thiết lập communication channels
            for (const [name, module] of this.loadedModules) {
                if (name !== 'TINI_CROSS_COMMUNICATOR' && module.instance) {
                    try {
                        communicator.establishChannel(name, module.instance);
                        console.log(`📡 [TINI Initializer] Communication channel với ${name} đã thiết lập`);
                    } catch (error) {
                        console.warn(`⚠️ [TINI Initializer] Không thể thiết lập channel ${name}:`, error.message);
                    }
                }
            }
        }
    }

    async initializeEventSystem() {
        console.log('⚡ [TINI Initializer] Đang khởi tạo event system...');
        
        // Tạo global event bus nếu chưa có
        if (!window.TINI_SECURITY_BUS && this.loadedModules.has('TINI_UNIVERSAL_DISPATCHER')) {
            window.TINI_SECURITY_BUS = this.loadedModules.get('TINI_UNIVERSAL_DISPATCHER').instance;
            console.log('✅ [TINI Initializer] Global Security Event Bus đã được tạo');
        }

        // Phát sự kiện system ready
        if (window.TINI_SECURITY_BUS) {
            window.TINI_SECURITY_BUS.dispatch('tini:system-ready', {
                timestamp: Date.now(),
                loadedModules: Array.from(this.loadedModules.keys()),
                failedModules: Array.from(this.failedModules.keys()),
                initTime: Date.now() - this.startTime
            });
            
            console.log('📢 [TINI Initializer] Event system ready signal đã được phát');
        }

        // Trigger custom event cho DOM
        document.dispatchEvent(new CustomEvent('TINI_SYSTEM_READY', {
            detail: {
                status: 'ready',
                modules: Array.from(this.loadedModules.keys()),
                timestamp: Date.now()
            }
        }));
    }

    async performHealthCheck() {
        console.log('🏥 [TINI Initializer] Đang thực hiện health check...');
        
        const healthResults = {
            overall: 'healthy',
            modules: {},
            criticalIssues: []
        };

        // Kiểm tra từng module
        for (const [name, module] of this.loadedModules) {
            try {
                let moduleHealth = 'healthy';
                
                // Kiểm tra basic functionality
                if (module.instance && typeof module.instance === 'object') {
                    // Kiểm tra methods cơ bản
                    if (typeof module.instance.getStatus === 'function') {
                        const status = module.instance.getStatus();
                        moduleHealth = status.healthy ? 'healthy' : 'warning';
                    }
                } else {
                    moduleHealth = 'error';
                }
                
                healthResults.modules[name] = moduleHealth;
                
                if (moduleHealth === 'error' && module.critical) {
                    healthResults.criticalIssues.push(`Critical module ${name} has errors`);
                }
                
            } catch (error) {
                healthResults.modules[name] = 'error';
                if (module.critical) {
                    healthResults.criticalIssues.push(`Critical module ${name} health check failed: ${error.message}`);
                }
            }
        }

        // Đánh giá tổng thể
        if (healthResults.criticalIssues.length > 0) {
            healthResults.overall = 'critical';
        } else if (Object.values(healthResults.modules).includes('warning')) {
            healthResults.overall = 'warning';
        }

        console.log(`🏥 [TINI Initializer] Health check hoàn thành - Status: ${healthResults.overall}`);
        
        // Lưu health report
        window.TINI_HEALTH_REPORT = healthResults;
        
        return healthResults;
    }

    reportStatus() {
        const totalModules = this.requiredModules.length;
        const loadedCount = this.loadedModules.size;
        const failedCount = this.failedModules.size;
        const initTime = Date.now() - this.startTime;

        console.log(`
🚀 === TINI SYSTEM STATUS REPORT ===
📊 Tổng số module: ${totalModules}
✅ Đã load thành công: ${loadedCount}
❌ Load thất bại: ${failedCount}
⏱️ Thời gian khởi tạo: ${initTime}ms
📈 Tỷ lệ thành công: ${Math.round((loadedCount/totalModules)*100)}%

📋 Module đã load:
${Array.from(this.loadedModules.keys()).map(name => `   ✅ ${name}`).join('\n')}

${failedCount > 0 ? `
⚠️ Module thất bại:
${Array.from(this.failedModules.keys()).map(name => `   ❌ ${name}`).join('\n')}
` : ''}
========================================`);

        // Lưu report vào global
        window.TINI_INIT_REPORT = {
            status: this.initializationStatus,
            totalModules,
            loadedCount,
            failedCount,
            initTime,
            successRate: Math.round((loadedCount/totalModules)*100),
            loadedModules: Array.from(this.loadedModules.keys()),
            failedModules: Array.from(this.failedModules.keys()),
            timestamp: Date.now()
        };
    }

    reportFailure(error) {
        console.error(`
❌ === TINI SYSTEM INITIALIZATION FAILED ===
🔥 Lỗi: ${error.message}
⏱️ Thời gian thất bại: ${Date.now() - this.startTime}ms
📊 Module đã load trước khi lỗi: ${this.loadedModules.size}
==========================================`);
    }

    // Method để restart system nếu cần
    async restart() {
        console.log('🔄 [TINI Initializer] Đang restart hệ thống...');
        this.loadedModules.clear();
        this.failedModules.clear();
        this.initializationStatus = 'pending';
        this.startTime = Date.now();
        await this.initialize();
    }
}

// Tạo global instance
if (!window.TINI_SYSTEM_INITIALIZER) {
    window.TINI_SYSTEM_INITIALIZER = new TiniSystemInitializer();
    console.log('✅ [TINI Initializer] Global System Initializer đã được tạo');
}

// Auto-initialize khi DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 [TINI Initializer] DOM ready - Bắt đầu auto-initialize...');
    
    // Delay một chút để tất cả script khác load xong
    setTimeout(async () => {
        await window.TINI_SYSTEM_INITIALIZER.initialize();
    }, 1000);
});

// Export cho sử dụng bên ngoài
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TiniSystemInitializer;
}
