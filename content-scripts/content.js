// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI CONTENT SCRIPT - MAIN INJECTION SYSTEM
 * Inject và quản lý toàn bộ hệ thống TINI vào web pages
 * Author: TINI Security Team
 * Version: 3.0 - Content Injection System
 */

(function() {
    'use strict';
    
    console.log('🚀 TINI Content Script loaded on:', window.location.href);
    
    // Ensure TINI namespace exists
    if (!window.TINI_SYSTEM) {
        window.TINI_SYSTEM = {
            version: '3.0',
            loadedAt: Date.now(),
            domain: window.location.hostname,
            scripts: new Set(),
            security: {},
            utils: {}
        };
    }
    
    // Content Script Controller
    class TINIContentController {
        constructor() {
            this.isInitialized = false;
            this.securityLevel = 'STANDARD';
            this.injectedScripts = new Set();
            
            this.initialize();
        }
        
        async initialize() {
            console.log('🔧 Initializing TINI Content System...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startInjection());
            } else {
                this.startInjection();
            }
            
            // Initialize security monitoring
            this.initializeSecurityMonitoring();
            
            // Setup communication with background script
            this.setupBackgroundCommunication();
            
            this.isInitialized = true;
            console.log('✅ TINI Content System initialized successfully');
        }
        
        async startInjection() {
            // Determine what scripts to inject based on domain and security requirements
            const domain = window.location.hostname;
            const injectionPlan = this.createInjectionPlan(domain);
            
            console.log('📋 Injection plan created for:', domain);
            console.log('📦 Scripts to inject:', injectionPlan.scripts);
            
            // Inject scripts in sequence
            for (const scriptInfo of injectionPlan.scripts) {
                await this.injectScript(scriptInfo);
            }
            
            // Initialize injected systems
            this.initializeInjectedSystems();
        }
        
        createInjectionPlan(domain) {
            const plan = {
                domain: domain,
                securityLevel: this.determineSecurityLevel(domain),
                scripts: []
            };
            
            // Core security validation always loads first
            plan.scripts.push({
                name: 'tini-validation-system',
                path: chrome.runtime.getURL('SECURITY/tini-validation-system.js'),
                priority: 1,
                required: true
            });
            
            // Domain-specific injections
            if (this.isTikTokDomain(domain)) {
                // Always inject control center first on TikTok
                plan.scripts.push({
                    name: 'tini-control-center',
                    path: chrome.runtime.getURL('content-scripts/tini-control-center.js'),
                    priority: 1.5,
                    required: true
                });
                
                // Don't auto-inject individual models - let control center manage them
                // plan.scripts.push({
                //     name: 'tini-monster-v6',
                //     path: chrome.runtime.getURL('Script/Tini-monster-v6.js'),
                //     priority: 2,
                //     required: false
                // });
            }
            
            // Avoid injecting heavy SECURITY scripts into our own admin panel to prevent UI blocking/variable conflicts
            if (this.isInternalDomain(domain) && !this.isAdminPanelPage()) {
                plan.scripts.push({
                    name: 'enhanced-device-security',
                    path: chrome.runtime.getURL('SECURITY/ENHANCEC-device-SECURITY.js'),
                    priority: 2,
                    required: true
                });
                
                plan.scripts.push({
                    name: 'hardware-fingerprinting',
                    path: chrome.runtime.getURL('SECURITY/hardware-fingerprinting-system.js'),
                    priority: 3,
                    required: false
                });
            }
            
            // Always load master loader last
            plan.scripts.push({
                name: 'tini-master-loader',
                path: chrome.runtime.getURL('tini-master-loader.js'),
                priority: 10,
                required: true
            });
            
            // Sort by priority
            plan.scripts.sort((a, b) => a.priority - b.priority);
            
            return plan;
        }
        
        async injectScript(scriptInfo) {
            try {
                console.log(`📥 Injecting script: ${scriptInfo.name}`);
                
                // Create script element
                const script = document.createElement('script');
                script.src = scriptInfo.path;
                script.type = 'text/javascript';
                script.dataset.tiniScript = scriptInfo.name;
                script.dataset.tiniPriority = scriptInfo.priority;
                
                // Add to injected scripts tracking
                this.injectedScripts.add(scriptInfo.name);
                
                // Inject into page
                return new Promise((resolve, reject) => {
                    // Add timeout for script loading
                    const timeout = setTimeout(() => {
                        console.warn(`⚠️ Script loading timeout: ${scriptInfo.name}`);
                        if (scriptInfo.required) {
                            reject(new Error(`Script timeout: ${scriptInfo.name}`));
                        } else {
                            resolve(); // Continue even if optional script times out
                        }
                    }, 10000); // 10 second timeout
                    
                    script.onload = () => {
                        clearTimeout(timeout);
                        console.log(`✅ Script loaded: ${scriptInfo.name}`);
                        try {
                            if (window.TINI_SYSTEM && window.TINI_SYSTEM.scripts) {
                                window.TINI_SYSTEM.scripts.add(scriptInfo.name);
                            }
                        } catch (e) {
                            console.warn(`⚠️ Could not track script: ${scriptInfo.name}`, e);
                        }
                        resolve();
                    };
                    
                    script.onerror = () => {
                        clearTimeout(timeout);
                        console.error(`❌ Failed to load script: ${scriptInfo.name}`);
                        if (scriptInfo.required) {
                            reject(new Error(`Required script failed: ${scriptInfo.name}`));
                        } else {
                            resolve(); // Continue even if optional script fails
                        }
                    };
                    
                    try {
                        // Inject into head or html
                        (document.head || document.documentElement).appendChild(script);
                    } catch (error) {
                        clearTimeout(timeout);
                        console.error(`❌ Failed to inject script: ${scriptInfo.name}`, error);
                        if (scriptInfo.required) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    }
                });
                
            } catch (error) {
                console.error(`❌ Error injecting script ${scriptInfo.name}:`, error);
                if (scriptInfo.required) {
                    throw error;
                }
            }
        }
        
        initializeInjectedSystems() {
            // Initialize systems after all scripts are loaded
            setTimeout(() => {
                // Initialize device security if available
                if (window.deviceSecurity) {
                    console.log('🛡️ Device security system detected and initializing...');
                    this.initializeDeviceSecurity();
                }
                
                // Initialize TikTok blocker if available
                if (window.TikTokBlocker) {
                    console.log('🚫 TikTok blocker detected and initializing...');
                    this.initializeTikTokBlocker();
                }
                
                // Initialize master loader if available
                if (window.TINI_SYSTEM && window.TINI_SYSTEM.masterLoader) {
                    console.log('🎯 Master loader detected and initializing...');
                    this.initializeMasterLoader();
                }
                
                // Send initialization complete message
                this.sendStatusToBackground('CONTENT_INITIALIZED', {
                    domain: window.location.hostname,
                    injectedScripts: Array.from(this.injectedScripts),
                    timestamp: Date.now()
                });
                
            }, 1000); // Wait 1 second for all systems to settle
        }
        
        initializeDeviceSecurity() {
            if (window.deviceSecurity && typeof window.deviceSecurity.getSecurityInfo === 'function') {
                window.deviceSecurity.getSecurityInfo().then(info => {
                    console.log('🔐 Device security info:', info);
                    window.TINI_SYSTEM.security = info;
                });
            }
        }
        
        initializeTikTokBlocker() {
            if (window.TikTokBlocker && this.isTikTokDomain(window.location.hostname)) {
                console.log('🎯 TikTok blocker active on TikTok domain');
                // TikTok blocker auto-initializes, just log the status
            }
        }
        
        initializeMasterLoader() {
            if (window.TINI_SYSTEM.masterLoader) {
                console.log('🎛️ Master loader system ready');
            }
        }
        
        initializeSecurityMonitoring() {
            // Monitor for security events
            document.addEventListener('securityEvent', (event) => {
                console.log('🚨 Security event detected:', event.detail);
                this.sendStatusToBackground('SECURITY_EVENT', event.detail);
            });
            
            // Monitor for DOM manipulation attempts
            this.setupDOMProtection();
        }
        
        setupDOMProtection() {
            // Protect critical TINI elements from tampering
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.removedNodes.forEach((node) => {
                            if (node.dataset && node.dataset.tiniScript) {
                                console.warn('⚠️ TINI script element removed:', node.dataset.tiniScript);
                                this.sendStatusToBackground('SCRIPT_TAMPERING', {
                                    script: node.dataset.tiniScript,
                                    timestamp: Date.now()
                                });
                            }
                        });
                    }
                });
            });
            
            observer.observe(document, {
                childList: true,
                subtree: true
            });
        }
        
        setupBackgroundCommunication() {
            // Listen for messages from background script
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                console.log('📨 Message received from background:', message);
                
                switch (message.type) {
                    case 'GET_STATUS':
                        sendResponse({
                            status: 'ACTIVE',
                            domain: window.location.hostname,
                            injectedScripts: Array.from(this.injectedScripts),
                            securityLevel: this.securityLevel,
                            timestamp: Date.now()
                        });
                        break;
                        
                    case 'REINJECT_SCRIPTS':
                        this.startInjection();
                        sendResponse({ status: 'REINJECTION_STARTED' });
                        break;
                        
                    case 'UPDATE_SECURITY_LEVEL':
                        this.securityLevel = message.level;
                        sendResponse({ status: 'SECURITY_LEVEL_UPDATED' });
                        break;
                        
                    default:
                        console.log('❓ Unknown message type:', message.type);
                }
            });
        }
        
        sendStatusToBackground(type, data) {
            chrome.runtime.sendMessage({
                type: type,
                data: data,
                timestamp: Date.now(),
                domain: window.location.hostname
            }).catch(error => {
                console.warn('⚠️ Could not send message to background:', error);
            });
        }
        
        determineSecurityLevel(domain) {
            if (this.isInternalDomain(domain)) return 'HIGH';
            if (this.isTrustedDomain(domain)) return 'MEDIUM';
            return 'STANDARD';
        }
        
        isTikTokDomain(domain) {
            return domain.includes('tiktok.com') || domain.includes('douyin.com');
        }
        
        isInternalDomain(domain) {
            return domain === 'localhost' || 
                   domain.startsWith('192.168.') || 
                   domain.startsWith('10.') || 
                   domain.startsWith('172.16.') ||
                   domain.endsWith('.local');
        }
        
        // Identify our own admin panel pages to avoid injecting conflicting scripts
        isAdminPanelPage() {
            try {
                const port = window.location.port;
                const path = (window.location.pathname || '').toLowerCase();
                const host = window.location.hostname;
                // Common local admin ports and path heuristics
                if (host === 'localhost' && (port === '8099' || port === '8080' || port === '55057' || port === '55058' || port === '55059')) return true;
                if (path.includes('admin-panel') || path.includes('admin') && document.title.toLowerCase().includes('tini')) return true;
                // Look for known admin panel markers
                if (document.querySelector('.sidebar .logo-text')?.textContent?.trim() === 'TINI') return true;
            } catch (e) {
                // ignore
            }
            return false;
        }
        
        isTrustedDomain(domain) {
            const trustedDomains = [
                'github.com',
                'gitlab.com',
                'stackoverflow.com',
                'developer.mozilla.org'
            ];
            
            return trustedDomains.some(trusted => domain.includes(trusted));
        }
    }
    
    // Initialize content controller
    const contentController = new TINIContentController();
    
    // Make globally available for debugging
    window.TINI_CONTENT_CONTROLLER = contentController;
    
    console.log('🎯 TINI Content Script initialization complete');
    
})();
// ST:TINI_1754716154_e868a412
// ST:TINI_1755361782_e868a412
