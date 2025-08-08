// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 👻 GHOST TRAP ENHANCED v5.0
 * Hệ thống bẫy GHOST nâng cao cho TINI Extension
 * Advanced GHOST trap system for comprehensive protection
 */

class TINIGhostTrapEnhanced {
    constructor() {
        this.version = "5.0";
        this.isActive = false;
        this.trapSystems = new Map();
        this.activeTraps = new Set();
        this.trapStatistics = {
            totalTrapsSet: 0,
            totalThreatsDetected: 0,
            totalThreatsBlocked: 0,
            totalPerformanceImprovements: 0
        };
        
        console.log(`👻 [GHOST TRAP+] Initializing Enhanced Trap System v${this.version}`);
        this.initializeGhostTraps();
    }
    
    async initializeGhostTraps() {
        try {
            // Initialize core trap systems
            await this.initializeCoreTrapSystems();
            
            // Setup advanced trap mechanisms
            await this.setupAdvancedTrapMechanisms();
            
            // Initialize intelligent threat detection
            await this.initializeIntelligentDetection();
            
            // Setup dynamic trap deployment
            await this.setupDynamicDeployment();
            
            // Initialize performance optimization traps
            await this.initializePerformanceTraps();
            
            this.isActive = true;
            console.log('👻 [GHOST TRAP+] All trap systems operational');
            
        } catch (error) {
            console.error('👻 [GHOST TRAP+] Trap initialization failed:', error);
            this.handleTrapFailure(error);
        }
    }
    
    async initializeCoreTrapSystems() {
        console.log('👻 [GHOST TRAP+] Initializing core trap systems...');
        
        // Ad Injection Traps
        this.trapSystems.set('adTraps', {
            name: 'Advanced Ad Injection Traps',
            type: 'blocking',
            priority: 'high',
            methods: this.createAdTrapMethods(),
            active: false
        });
        
        // Malware Detection Traps
        this.trapSystems.set('malwareTraps', {
            name: 'Malware Detection & Isolation Traps',
            type: 'security',
            priority: 'critical',
            methods: this.createMalwareTrapMethods(),
            active: false
        });
        
        // Tracking Prevention Traps
        this.trapSystems.set('trackingTraps', {
            name: 'Advanced Tracking Prevention Traps',
            type: 'privacy',
            priority: 'high',
            methods: this.createTrackingTrapMethods(),
            active: false
        });
        
        // Performance Optimization Traps
        this.trapSystems.set('performanceTraps', {
            name: 'Performance Optimization Traps',
            type: 'optimization',
            priority: 'medium',
            methods: this.createPerformanceTrapMethods(),
            active: false
        });
        
        // Script Injection Traps
        this.trapSystems.set('scriptTraps', {
            name: 'Script Injection Prevention Traps',
            type: 'security',
            priority: 'critical',
            methods: this.createScriptTrapMethods(),
            active: false
        });
        
        console.log('👻 [GHOST TRAP+] Core trap systems initialized');
    }
    
    createAdTrapMethods() {
        return {
            // Advanced ad detection with AI-like patterns
            detectAdvancedAds: () => {
                const adPatterns = [
                    // Visual patterns
                    /advertisement|sponsored|banner|popup|interstitial/i,
                    // Behavioral patterns
                    /onclick.*track|ga\(|gtag\(/i,
                    // Network patterns
                    /doubleclick|googlesyndication|amazon-adsystem/i,
                    // CSS patterns
                    /position:\s*fixed.*z-index:\s*999/i
                ];
                
                const suspiciousElements = [];
                const allElements = document.querySelectorAll('*');
                
                allElements.forEach(element => {
                    const elementData = this.analyzeElementForAds(element);
                    if (elementData.suspiciousScore > 0.7) {
                        suspiciousElements.push({
                            element: element,
                            score: elementData.suspiciousScore,
                            reasons: elementData.reasons
                        });
                    }
                });
                
                return suspiciousElements;
            },
            
            // Dynamic ad blocking with learning
            blockDynamicAds: (adElement) => {
                // Create invisible trap overlay
                const trapOverlay = document.createElement('div');
                trapOverlay.style.cssText = `
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: transparent;
                    pointer-events: none;
                    z-index: 10000;
                `;
                
                // Hide the ad element
                adElement.element.style.display = 'none !important';
                adElement.element.style.visibility = 'hidden !important';
                adElement.element.style.opacity = '0 !important';
                
                // Mark as trapped
                adElement.element.setAttribute('data-ghost-trapped', 'ad-blocked');
                adElement.element.setAttribute('data-trap-score', adElement.score);
                
                this.logTrapActivity('ad_blocked', {
                    element: adElement.element.tagName,
                    score: adElement.score,
                    reasons: adElement.reasons
                });
                
                this.trapStatistics.totalThreatsBlocked++;
                return true;
            },
            
            // Prevent ad re-injection
            preventAdReinjection: () => {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach((node) => {
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    this.scanNewElementForAds(node);
                                }
                            });
                        }
                    });
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                
                return observer;
            }
        };
    }
    
    createMalwareTrapMethods() {
        return {
            // Advanced malware detection
            detectMaliciousScripts: () => {
                const suspiciousScripts = [];
                const scripts = document.querySelectorAll('script');
                
                scripts.forEach(script => {
                    const malwareScore = this.analyzeMalwarePatterns(script);
                    if (malwareScore > 0.8) {
                        suspiciousScripts.push({
                            script: script,
                            score: malwareScore,
                            threats: this.identifyThreatTypes(script)
                        });
                    }
                });
                
                return suspiciousScripts;
            },
            
            // Quarantine malicious content
            quarantineMalware: (malwareElement) => {
                // Create secure sandbox
                const sandbox = document.createElement('div');
                sandbox.style.cssText = `
                    position: absolute;
                    left: -9999px;
                    top: -9999px;
                    width: 1px;
                    height: 1px;
                    overflow: hidden;
                    pointer-events: none;
                `;
                
                // Move malware to sandbox
                sandbox.appendChild(malwareElement.script.cloneNode(true));
                document.body.appendChild(sandbox);
                
                // Disable original script
                malwareElement.script.type = 'text/disabled';
                malwareElement.script.setAttribute('data-ghost-quarantined', 'true');
                
                this.logTrapActivity('malware_quarantined', {
                    threats: malwareElement.threats,
                    score: malwareElement.score
                });
                
                this.trapStatistics.totalThreatsBlocked++;
                return true;
            },
            
            // Real-time threat monitoring
            monitorRealTimeThreats: () => {
                const threatMonitor = setInterval(() => {
                    this.performThreatScan();
                }, 5000); // Every 5 seconds
                
                return threatMonitor;
            }
        };
    }
    
    createTrackingTrapMethods() {
        return {
            // Advanced tracking detection
            detectAdvancedTracking: () => {
                const trackingElements = [];
                
                // Detect tracking pixels
                const pixels = document.querySelectorAll('img[width="1"], img[height="1"]');
                pixels.forEach(pixel => {
                    if (this.isTrackingPixel(pixel)) {
                        trackingElements.push({
                            element: pixel,
                            type: 'tracking-pixel',
                            threat: 'privacy'
                        });
                    }
                });
                
                // Detect tracking scripts
                const trackingScripts = document.querySelectorAll('script[src*="analytics"], script[src*="tracking"]');
                trackingScripts.forEach(script => {
                    trackingElements.push({
                        element: script,
                        type: 'tracking-script',
                        threat: 'privacy'
                    });
                });
                
                // Detect cookie tracking
                this.detectCookieTracking(trackingElements);
                
                return trackingElements;
            },
            
            // Block tracking attempts
            blockTracking: (trackingElement) => {
                switch (trackingElement.type) {
                    case 'tracking-pixel':
                        trackingElement.element.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                        break;
                    case 'tracking-script':
                        trackingElement.element.type = 'text/blocked';
                        break;
                    case 'cookie-tracking':
                        this.blockCookieTracking(trackingElement);
                        break;
                }
                
                trackingElement.element.setAttribute('data-ghost-tracking-blocked', 'true');
                
                this.logTrapActivity('tracking_blocked', {
                    type: trackingElement.type,
                    threat: trackingElement.threat
                });
                
                this.trapStatistics.totalThreatsBlocked++;
                return true;
            },
            
            // Privacy protection layer
            createPrivacyShield: () => {
                // Override tracking functions
                const originalGA = window.ga;
                const originalGtag = window.gtag;
                const originalFbq = window.fbq;
                
                window.ga = function() {
                    console.log('👻 [GHOST TRAP+] Google Analytics call blocked');
                    return false;
                };
                
                window.gtag = function() {
                    console.log('👻 [GHOST TRAP+] Google Tag Manager call blocked');
                    return false;
                };
                
                window.fbq = function() {
                    console.log('👻 [GHOST TRAP+] Facebook Pixel call blocked');
                    return false;
                };
                
                return {
                    originalGA: originalGA,
                    originalGtag: originalGtag,
                    originalFbq: originalFbq
                };
            }
        };
    }
    
    createPerformanceTrapMethods() {
        return {
            // Detect performance killers
            detectPerformanceKillers: () => {
                const performanceKillers = [];
                
                // Heavy scripts
                const scripts = document.querySelectorAll('script');
                scripts.forEach(script => {
                    if (this.isHeavyScript(script)) {
                        performanceKillers.push({
                            element: script,
                            type: 'heavy-script',
                            impact: 'high'
                        });
                    }
                });
                
                // Large images
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                    if (this.isLargeImage(img)) {
                        performanceKillers.push({
                            element: img,
                            type: 'large-image',
                            impact: 'medium'
                        });
                    }
                });
                
                // Excessive CSS
                const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
                stylesheets.forEach(css => {
                    if (this.isExcessiveCSS(css)) {
                        performanceKillers.push({
                            element: css,
                            type: 'excessive-css',
                            impact: 'medium'
                        });
                    }
                });
                
                return performanceKillers;
            },
            
            // Optimize performance killers
            optimizePerformance: (performanceKiller) => {
                switch (performanceKiller.type) {
                    case 'heavy-script':
                        this.optimizeScript(performanceKiller.element);
                        break;
                    case 'large-image':
                        this.optimizeImage(performanceKiller.element);
                        break;
                    case 'excessive-css':
                        this.optimizeCSS(performanceKiller.element);
                        break;
                }
                
                this.logTrapActivity('performance_optimized', {
                    type: performanceKiller.type,
                    impact: performanceKiller.impact
                });
                
                this.trapStatistics.totalPerformanceImprovements++;
                return true;
            },
            
            // Memory leak detection
            detectMemoryLeaks: () => {
                if (performance.memory) {
                    const memoryInfo = {
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize,
                        limit: performance.memory.jsHeapSizeLimit
                    };
                    
                    const usagePercentage = (memoryInfo.used / memoryInfo.total) * 100;
                    
                    if (usagePercentage > 80) {
                        this.logTrapActivity('memory_leak_detected', memoryInfo);
                        return true;
                    }
                }
                return false;
            }
        };
    }
    
    createScriptTrapMethods() {
        return {
            // Detect script injection attempts
            detectScriptInjection: () => {
                const injectionAttempts = [];
                
                // Monitor eval usage
                const originalEval = window.eval;
                window.eval = function(code) {
                    injectionAttempts.push({
                        type: 'eval-injection',
                        code: code.substring(0, 100),
                        timestamp: Date.now()
                    });
                    
                    console.warn('👻 [GHOST TRAP+] eval() injection attempt detected');
                    return null; // Block the eval
                };
                
                // Monitor Function constructor
                const originalFunction = window.Function;
                window.Function = function(...args) {
                    const code = args[args.length - 1];
                    injectionAttempts.push({
                        type: 'function-injection',
                        code: code.substring(0, 100),
                        timestamp: Date.now()
                    });
                    
                    console.warn('👻 [GHOST TRAP+] Function constructor injection attempt detected');
                    return function() {}; // Return dummy function
                };
                
                return injectionAttempts;
            },
            
            // Content Security Policy enforcement
            enforceCSP: () => {
                // Create strict CSP
                const csp = `
                    default-src 'self';
                    script-src 'self' 'unsafe-inline';
                    style-src 'self' 'unsafe-inline';
                    img-src 'self' data: https:;
                    connect-src 'self';
                    font-src 'self';
                    object-src 'none';
                    media-src 'self';
                    frame-src 'none';
                `;
                
                // Apply CSP via meta tag
                const meta = document.createElement('meta');
                meta.httpEquiv = 'Content-Security-Policy';
                meta.content = csp.replace(/\s+/g, ' ').trim();
                document.head.appendChild(meta);
                
                this.logTrapActivity('csp_enforced', { csp: csp });
                return true;
            },
            
            // XSS protection
            preventXSS: () => {
                // Sanitize user inputs
                const inputs = document.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    input.addEventListener('input', (event) => {
                        const sanitized = this.sanitizeInput(event.target.value);
                        if (sanitized !== event.target.value) {
                            event.target.value = sanitized;
                            this.logTrapActivity('xss_attempt_blocked', {
                                original: event.target.value,
                                sanitized: sanitized
                            });
                        }
                    });
                });
                
                return true;
            }
        };
    }
    
    // Advanced analysis methods
    analyzeElementForAds(element) {
        let suspiciousScore = 0;
        const reasons = [];
        
        // Check element properties
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        
        // Size-based detection
        if (rect.width === 728 && rect.height === 90) { // Leaderboard
            suspiciousScore += 0.8;
            reasons.push('standard-ad-size-leaderboard');
        }
        if (rect.width === 300 && rect.height === 250) { // Medium rectangle
            suspiciousScore += 0.8;
            reasons.push('standard-ad-size-rectangle');
        }
        
        // Position-based detection
        if (computedStyle.position === 'fixed' && computedStyle.zIndex > 1000) {
            suspiciousScore += 0.6;
            reasons.push('overlay-positioning');
        }
        
        // Content-based detection
        const textContent = element.textContent.toLowerCase();
        if (/advertisement|sponsored|ads by/.test(textContent)) {
            suspiciousScore += 0.9;
            reasons.push('ad-text-content');
        }
        
        // Class/ID based detection
        const className = element.className.toLowerCase();
        const elementId = element.id.toLowerCase();
        if (/ad|banner|sponsor/.test(className + elementId)) {
            suspiciousScore += 0.7;
            reasons.push('ad-naming-pattern');
        }
        
        return { suspiciousScore: Math.min(suspiciousScore, 1), reasons: reasons };
    }
    
    analyzeMalwarePatterns(script) {
        let malwareScore = 0;
        
        const scriptContent = script.textContent || script.src || '';
        
        // Suspicious patterns
        const malwarePatterns = [
            { pattern: /eval\s*\(/g, weight: 0.3 },
            { pattern: /document\.write/g, weight: 0.2 },
            { pattern: /window\.open/g, weight: 0.2 },
            { pattern: /location\.href\s*=/g, weight: 0.2 },
            { pattern: /unescape/g, weight: 0.3 },
            { pattern: /fromCharCode/g, weight: 0.2 },
            { pattern: /base64/g, weight: 0.1 },
            { pattern: /obfuscated/g, weight: 0.4 }
        ];
        
        malwarePatterns.forEach(({ pattern, weight }) => {
            const matches = (scriptContent.match(pattern) || []).length;
            malwareScore += matches * weight;
        });
        
        return Math.min(malwareScore, 1);
    }
    
    // Utility methods
    logTrapActivity(type, data) {
        if (!this.trapLog) {
            this.trapLog = [];
        }
        
        this.trapLog.push({
            type: type,
            data: data,
            timestamp: Date.now()
        });
        
        // Keep only last 1000 entries
        if (this.trapLog.length > 1000) {
            this.trapLog = this.trapLog.slice(-1000);
        }
        
        console.log(`👻 [GHOST TRAP+] ${type}:`, data);
    }
    
    // Public API
    activateAllTraps() {
        this.trapSystems.forEach((trapSystem, name) => {
            this.activateTrap(name);
        });
        
        console.log('👻 [GHOST TRAP+] All traps activated');
    }
    
    activateTrap(trapName) {
        const trapSystem = this.trapSystems.get(trapName);
        if (trapSystem) {
            trapSystem.active = true;
            this.activeTraps.add(trapName);
            this.deployTrap(trapName);
            this.trapStatistics.totalTrapsSet++;
            
            console.log(`👻 [GHOST TRAP+] ${trapSystem.name} activated`);
        }
    }
    
    deactivateTrap(trapName) {
        const trapSystem = this.trapSystems.get(trapName);
        if (trapSystem) {
            trapSystem.active = false;
            this.activeTraps.delete(trapName);
            
            console.log(`👻 [GHOST TRAP+] ${trapSystem.name} deactivated`);
        }
    }
    
    deployTrap(trapName) {
        const trapSystem = this.trapSystems.get(trapName);
        if (trapSystem && trapSystem.active) {
            // Start trap monitoring
            this.startTrapMonitoring(trapName);
        }
    }
    
    startTrapMonitoring(trapName) {
        const trapSystem = this.trapSystems.get(trapName);
        if (!trapSystem) return;
        
        const monitor = setInterval(() => {
            if (trapSystem.active) {
                this.executeTraps(trapName);
            } else {
                clearInterval(monitor);
            }
        }, 2000); // Check every 2 seconds
        
        trapSystem.monitor = monitor;
    }
    
    executeTraps(trapName) {
        const trapSystem = this.trapSystems.get(trapName);
        if (!trapSystem || !trapSystem.active) return;
        
        const methods = trapSystem.methods;
        
        switch (trapName) {
            case 'adTraps':
                const ads = methods.detectAdvancedAds();
                ads.forEach(ad => methods.blockDynamicAds(ad));
                break;
                
            case 'malwareTraps':
                const malware = methods.detectMaliciousScripts();
                malware.forEach(mal => methods.quarantineMalware(mal));
                break;
                
            case 'trackingTraps':
                const tracking = methods.detectAdvancedTracking();
                tracking.forEach(track => methods.blockTracking(track));
                break;
                
            case 'performanceTraps':
                const killers = methods.detectPerformanceKillers();
                killers.forEach(killer => methods.optimizePerformance(killer));
                break;
                
            case 'scriptTraps':
                methods.detectScriptInjection();
                methods.enforceCSP();
                methods.preventXSS();
                break;
        }
    }
    
    getTrapStatistics() {
        return {
            ...this.trapStatistics,
            activeTraps: Array.from(this.activeTraps),
            totalTraps: this.trapSystems.size,
            uptime: Date.now() - this.startTime
        };
    }
    
    exportTrapData() {
        const exportData = {
            version: this.version,
            timestamp: new Date().toISOString(),
            statistics: this.getTrapStatistics(),
            trapLog: this.trapLog,
            activeSystems: Array.from(this.activeTraps)
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghost-trap-enhanced-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('👻 [GHOST TRAP+] Trap data exported');
    }
    
    handleTrapFailure(error) {
        console.error('👻 [GHOST TRAP+] Critical trap failure:', error);
        
        // Attempt recovery
        setTimeout(() => {
            console.log('👻 [GHOST TRAP+] Attempting trap recovery...');
            this.initializeGhostTraps();
        }, 3000);
    }
    
    destroy() {
        this.isActive = false;
        
        // Deactivate all traps
        this.trapSystems.forEach((trapSystem, name) => {
            this.deactivateTrap(name);
            if (trapSystem.monitor) {
                clearInterval(trapSystem.monitor);
            }
        });
        
        console.log('👻 [GHOST TRAP+] Enhanced trap system destroyed');
    }
}

// Initialize GHOST Trap Enhanced
document.addEventListener('DOMContentLoaded', () => {
    window.TINIGhostTrapEnhanced = TINIGhostTrapEnhanced;
    window.tiniGhostTrap = new TINIGhostTrapEnhanced();
    
    // Auto-activate all traps
    setTimeout(() => {
        if (window.tiniGhostTrap) {
            window.tiniGhostTrap.activateAllTraps();
        }
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIGhostTrapEnhanced;
}

console.log('👻 [GHOST TRAP+] Enhanced trap system loaded');
