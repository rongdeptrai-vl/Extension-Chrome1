// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: ebdabf3 | Time: 2025-08-09T05:09:14Z
// Watermark: TINI_1754716154_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI MASTER LOADER
 * Central loader and coordinator for all TINI system components
 * Author: TINI Security Team
 * Version: 1.0
 */

(function() {
    'use strict';
    
    console.log('🔧 TINI Master Loader initializing...');
    
    // Ensure TINI namespace exists
    if (!window.TINI_SYSTEM) {
        window.TINI_SYSTEM = {};
    }
    
    // Master loader class
    class TINIMasterLoader {
        constructor() {
            this.loadedScripts = new Set();
            this.pendingScripts = new Set();
            this.systemReady = false;
            this.components = {};
            
            this.initialize();
        }
        
        initialize() {
            console.log('🚀 TINI Master Loader - System Initialization');
            
            // Wait for DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startSystemCoordination());
            } else {
                this.startSystemCoordination();
            }
        }
        
        startSystemCoordination() {
            console.log('📋 TINI Master Loader - Starting system coordination');
            
            // Check for loaded components
            this.detectLoadedComponents();
            
            // Initialize system communication
            this.initializeSystemCommunication();
            
            // Set up system ready state
            this.checkSystemReadiness();
            
            // Mark as initialized
            this.systemReady = true;
            console.log('✅ TINI Master Loader - System coordination complete');
            
            // Notify background script
            this.notifyBackgroundScript();
        }
        
        detectLoadedComponents() {
            // Check for TINI components in global scope
            const globalKeys = Object.keys(window);
            const tiniComponents = globalKeys.filter(key => key.includes('TINI') || key.includes('GHOST'));
            
            console.log('🔍 TINI Master Loader - Detected components:', tiniComponents);
            
            tiniComponents.forEach(component => {
                this.components[component] = window[component];
            });
        }
        
        initializeSystemCommunication() {
            // Set up communication between components
            window.TINI_SYSTEM.masterLoader = this;
            window.TINI_SYSTEM.ready = () => this.systemReady;
            window.TINI_SYSTEM.getComponents = () => this.components;
            
            // Add event listeners for component registration
            window.addEventListener('TINI_COMPONENT_LOADED', (event) => {
                this.registerComponent(event.detail);
            });
        }
        
        registerComponent(componentInfo) {
            console.log('📝 TINI Master Loader - Registering component:', componentInfo.name);
            this.components[componentInfo.name] = componentInfo.instance;
            this.loadedScripts.add(componentInfo.name);
        }
        
        checkSystemReadiness() {
            // Check if all critical components are loaded
            const criticalComponents = [
                'TINI_SYSTEM'
                // Removed TINIContentController as it's optional
            ];
            
            const missingComponents = criticalComponents.filter(comp => !this.components[comp] && !window[comp]);
            
            if (missingComponents.length === 0) {
                this.systemReady = true;
                console.log('✅ TINI System is ready - all critical components loaded');
            } else {
                console.warn('⚠️ TINI System waiting for components:', missingComponents);
            }
        }
        
        notifyBackgroundScript() {
            // Send initialization complete message to background script
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                try {
                    chrome.runtime.sendMessage({
                        action: 'MASTER_LOADER_READY',
                        data: {
                            domain: window.location.hostname,
                            components: Object.keys(this.components),
                            timestamp: Date.now()
                        }
                    });
                } catch (error) {
                    console.warn('⚠️ TINI Master Loader - Failed to notify background:', error);
                }
            }
        }
        
        // Utility methods for other scripts
        waitForSystem() {
            return new Promise((resolve) => {
                if (this.systemReady) {
                    resolve(this);
                } else {
                    const checkReady = () => {
                        if (this.systemReady) {
                            resolve(this);
                        } else {
                            setTimeout(checkReady, 100);
                        }
                    };
                    checkReady();
                }
            });
        }
        
        getComponent(name) {
            return this.components[name] || window[name];
        }
    }
    
    // Initialize master loader
    const masterLoader = new TINIMasterLoader();
    
    // Make it globally accessible
    window.TINI_MASTER_LOADER = masterLoader;
    
    // Add to TINI_SYSTEM namespace
    if (window.TINI_SYSTEM) {
        window.TINI_SYSTEM.masterLoader = masterLoader;
    }
    
    console.log('🎯 TINI Master Loader initialized successfully');
    
})();
