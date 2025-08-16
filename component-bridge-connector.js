// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// COMPONENT BRIDGE CONNECTOR - Fixed Integration
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK

// Import all required component systems
let BossSecuritySystem, GhostIntegrationSystem, AuthenticationSystem, PhantomNetworkLayer, ConnectionManagerSystem;

try {
    BossSecuritySystem = require('./boss-security-system.js');
} catch (e) {
    console.warn('⚠️ [BRIDGE-FIX] boss-security-system.js not found');
}

try {
    GhostIntegrationSystem = require('./ghost-integration-system.js');
} catch (e) {
    console.warn('⚠️ [BRIDGE-FIX] ghost-integration-system.js not found');
}

try {
    AuthenticationSystem = require('./authentication-system.js');
} catch (e) {
    console.warn('⚠️ [BRIDGE-FIX] authentication-system.js not found');
}

try {
    PhantomNetworkLayer = require('./phantom-network-layer.js');
} catch (e) {
    console.warn('⚠️ [BRIDGE-FIX] phantom-network-layer.js not found');
}

try {
    ConnectionManagerSystem = require('./connection-manager.js');
} catch (e) {
    console.warn('⚠️ [BRIDGE-FIX] connection-manager.js not found');
}

class ComponentBridgeConnector {
    constructor() {
        this.components = new Map();
        this.initialized = false;
        
        this.initializeComponents();
    }
    
    initializeComponents() {
        console.log('🔧 [BRIDGE-FIX] Initializing missing components...');
        
        // Initialize BOSS_SECURITY
        if (BossSecuritySystem) {
            try {
                const bossSystem = new BossSecuritySystem();
                this.components.set('BOSS_SECURITY', bossSystem);
                console.log('✅ [BRIDGE-FIX] BOSS_SECURITY component created');
            } catch (e) {
                console.error('❌ [BRIDGE-FIX] Failed to create BOSS_SECURITY:', e.message);
            }
        }
        
        // Initialize GHOST_INTEGRATION
        if (GhostIntegrationSystem) {
            try {
                const ghostSystem = new GhostIntegrationSystem();
                this.components.set('GHOST_INTEGRATION', ghostSystem);
                console.log('✅ [BRIDGE-FIX] GHOST_INTEGRATION component created');
            } catch (e) {
                console.error('❌ [BRIDGE-FIX] Failed to create GHOST_INTEGRATION:', e.message);
            }
        }
        
        // Initialize AUTHENTICATION
        if (AuthenticationSystem) {
            try {
                const authSystem = new AuthenticationSystem();
                this.components.set('AUTHENTICATION', authSystem);
                console.log('✅ [BRIDGE-FIX] AUTHENTICATION component created');
            } catch (e) {
                console.error('❌ [BRIDGE-FIX] Failed to create AUTHENTICATION:', e.message);
            }
        }
        
        // Initialize PHANTOM_NETWORK
        if (PhantomNetworkLayer) {
            try {
                const phantomNetwork = new PhantomNetworkLayer();
                this.components.set('PHANTOM_NETWORK', phantomNetwork);
                console.log('✅ [BRIDGE-FIX] PHANTOM_NETWORK component created');
            } catch (e) {
                console.error('❌ [BRIDGE-FIX] Failed to create PHANTOM_NETWORK:', e.message);
            }
        }
        
        // Initialize CONNECTION_MANAGER
        if (ConnectionManagerSystem) {
            try {
                const connectionManager = new ConnectionManagerSystem();
                this.components.set('CONNECTION_MANAGER', connectionManager);
                console.log('✅ [BRIDGE-FIX] CONNECTION_MANAGER component created');
            } catch (e) {
                console.error('❌ [BRIDGE-FIX] Failed to create CONNECTION_MANAGER:', e.message);
            }
        }
        
        this.initialized = true;
        console.log(`🔧 [BRIDGE-FIX] Component initialization complete: ${this.components.size}/5 components`);
    }
    
    getComponent(name) {
        return this.components.get(name);
    }
    
    getAllComponents() {
        return this.components;
    }
    
    getComponentAPI(name) {
        const component = this.components.get(name);
        if (component && typeof component.getComponentAPI === 'function') {
            return component.getComponentAPI();
        }
        return null;
    }
    
    isInitialized() {
        return this.initialized;
    }
    
    getStatus() {
        const status = {
            initialized: this.initialized,
            totalComponents: 5,
            activeComponents: this.components.size,
            components: {}
        };
        
        this.components.forEach((component, name) => {
            try {
                status.components[name] = {
                    available: true,
                    hasAPI: typeof component.getComponentAPI === 'function',
                    status: component.getStatus ? component.getStatus() : 'unknown'
                };
            } catch (e) {
                status.components[name] = {
                    available: false,
                    error: e.message
                };
            }
        });
        
        return status;
    }
}

// Create global instance
const bridgeConnector = new ComponentBridgeConnector();

// Export for integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = bridgeConnector;
}

// Global export for browser environment
if (typeof global !== 'undefined') {
    global.TINI_BRIDGE_CONNECTOR = bridgeConnector;
}

console.log('🔧 [BRIDGE-FIX] Component Bridge Connector loaded');
// ST:TINI_1755361782_e868a412
