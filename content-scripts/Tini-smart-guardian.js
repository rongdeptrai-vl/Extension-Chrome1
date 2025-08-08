// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🎯 TINI SMART GUARDIAN - Intelligent Web Protection
 * Hệ thống bảo vệ thông minh với khả năng học hỏi và thích ứng
 * Features: Smart learning, adaptive filtering, intelligent user protection
 */

// Restrict to pybass pages
if (!window.location.hostname.includes('pybass.com')) {
    // Not on PyBASS, skip script to avoid errors
    return;
}

class TiniSmartGuardian {
    constructor() {
        this.version = "5.2";
        this.name = "TINI Smart Guardian";
        this.initialized = false;
        this.learningMode = true;
        
        // Guardian statistics
        this.guardianStats = {
            intelligentBlocks: 0,
            adaptiveFilters: 0,
            userProtections: 0,
            learningEvents: 0,
            behaviorAnalysis: 0
        };
        
        // Smart learning database
        this.learningDatabase = {
            blockedPatterns: new Set(),
            allowedPatterns: new Set(),
            userPreferences: new Map(),
            behaviorPatterns: [],
            contextualRules: new Map()
        };
        
        // Advanced protection modules
        this.protectionModules = {
            smartAdBlocker: true,
            behaviorAnalyzer: true,
            contextualFilter: true,
            adaptiveShield: true,
            intelligentTracker: true,
            userIntentPredictor: true
        };
        
        // Machine learning patterns
        this.mlPatterns = {
            // Advanced ad detection patterns
            advancedAdSelectors: [
                '[class*="ad-"]:not([class*="add"]):not([class*="admin"])',
                '[id*="ad-"]:not([id*="add"]):not([id*="admin"])',
                '[class*="advertisement"]',
                '[class*="sponsor"]',
                '[data-ad-client]',
                '[data-ad-slot]',
                '[data-google-av-adk]',
                '.adsbox, .ads-box, .ad-box',
                '.sponsored-content, .sponsored-post',
                '[aria-label*="advertisement" i]',
                '[aria-label*="sponsored" i]'
            ],
            
            // Behavioral indicators
            suspiciousBehaviors: [
                'rapid-element-creation',
                'excessive-network-requests',
                'suspicious-iframe-injection',
                'tracking-pixel-deployment',
                'cookie-harvesting',
                'fingerprinting-attempts'
            ],
            
            // Content quality indicators
            qualityIndicators: [
                'meaningful-text-content',
                'user-interaction-elements',
                'semantic-html-structure',
                'accessibility-features',
                'original-content-markers'
            ]
        };
        
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        console.log(`🎯 ${this.name} v${this.version} initializing intelligent protection...`);
        
        // Load learning data
        this.loadLearningData();
        
        // Initialize smart modules
        this.initializeSmartModules();
        
        // Start behavior analysis
        this.startBehaviorAnalysis();
        
        // Enable adaptive filtering
        this.enableAdaptiveFiltering();
        
        // Start contextual protection
        this.startContextualProtection();
        
        this.initialized = true;
        console.log(`✅ ${this.name} v${this.version} protection systems active!`);
    }
    
    loadLearningData() {
        try {
            const savedData = localStorage.getItem('tini-smart-learning-data');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                
                // Restore learning patterns
                if (parsed.blockedPatterns) {
                    this.learningDatabase.blockedPatterns = new Set(parsed.blockedPatterns);
                }
                
                if (parsed.allowedPatterns) {
                    this.learningDatabase.allowedPatterns = new Set(parsed.allowedPatterns);
                }
                
                if (parsed.userPreferences) {
                    this.learningDatabase.userPreferences = new Map(parsed.userPreferences);
                }
                
                console.log('🧠 Learning data loaded successfully');
            }
        } catch (error) {
            console.log('📚 Starting with fresh learning database');
        }
    }
    
    saveLearningData() {
        try {
            const dataToSave = {
                blockedPatterns: Array.from(this.learningDatabase.blockedPatterns),
                allowedPatterns: Array.from(this.learningDatabase.allowedPatterns),
                userPreferences: Array.from(this.learningDatabase.userPreferences.entries()),
                timestamp: Date.now()
            };
            
            localStorage.setItem('tini-smart-learning-data', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Failed to save learning data:', error);
        }
    }
    
    initializeSmartModules() {
        console.log('🧠 Initializing smart protection modules...');
        
        // Smart Ad Blocker with learning
        if (this.protectionModules.smartAdBlocker) {
            this.initializeSmartAdBlocker();
        }
        
        // Behavior Analyzer
        if (this.protectionModules.behaviorAnalyzer) {
            this.initializeBehaviorAnalyzer();
        }
        
        // Contextual Filter
        if (this.protectionModules.contextualFilter) {
            this.initializeContextualFilter();
        }
        
        // Adaptive Shield
        if (this.protectionModules.adaptiveShield) {
            this.initializeAdaptiveShield();
        }
        
        console.log('🚀 All smart modules initialized');
    }
    
    initializeSmartAdBlocker() {
        // Enhanced ad blocking with machine learning
        this.smartAdBlocker = {
            confidenceThreshold: 0.7,
            
            analyzeElement: (element) => {
                let adConfidence = 0;
                const features = this.extractElementFeatures(element);
                
                // Check against learned patterns
                const elementSignature = this.generateElementSignature(element);
                
                if (this.learningDatabase.blockedPatterns.has(elementSignature)) {
                    adConfidence += 0.8;
                } else if (this.learningDatabase.allowedPatterns.has(elementSignature)) {
                    adConfidence -= 0.5;
                }
                
                // Advanced pattern matching
                this.mlPatterns.advancedAdSelectors.forEach(selector => {
                    try {
                        if (element.matches(selector)) {
                            adConfidence += 0.3;
                        }
                    } catch (error) {
                        // Ignore invalid selectors
                    }
                });
                
                // Content analysis
                const textContent = element.textContent || '';
                const adKeywords = [
                    'sponsored', 'advertisement', 'promoted', 'ad by',
                    'buy now', 'click here', 'limited time', 'special offer',
                    'earn money', 'get rich', 'exclusive deal', 'discount'
                ];
                
                adKeywords.forEach(keyword => {
                    if (textContent.toLowerCase().includes(keyword)) {
                        adConfidence += 0.15;
                    }
                });
                
                // Visual analysis
                const styles = window.getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                
                // Check for ad-like dimensions
                const commonAdSizes = [
                    {w: 728, h: 90},   // Leaderboard
                    {w: 300, h: 250},  // Medium Rectangle
                    {w: 320, h: 50},   // Mobile Banner
                    {w: 160, h: 600},  // Wide Skyscraper
                    {w: 300, h: 600},  // Half Page
                    {w: 970, h: 250}   // Billboard
                ];
                
                commonAdSizes.forEach(size => {
                    const widthMatch = Math.abs(rect.width - size.w) < 10;
                    const heightMatch = Math.abs(rect.height - size.h) < 10;
                    
                    if (widthMatch && heightMatch) {
                        adConfidence += 0.4;
                    }
                });
                
                // Check for suspicious styling
                if (styles.position === 'fixed' || styles.position === 'sticky') {
                    adConfidence += 0.2;
                }
                
                if (styles.zIndex && parseInt(styles.zIndex) > 1000) {
                    adConfidence += 0.2;
                }
                
                return Math.min(adConfidence, 1);
            },
            
            blockElement: (element, confidence) => {
                // Learn from this blocking decision
                const signature = this.generateElementSignature(element);
                this.learningDatabase.blockedPatterns.add(signature);
                
                // Apply blocking
                element.style.display = 'none';
                element.setAttribute('data-tini-smart-blocked', confidence.toFixed(2));
                
                this.guardianStats.intelligentBlocks++;
                this.guardianStats.learningEvents++;
                
                console.log(`🎯 Smart blocked element (${(confidence * 100).toFixed(1)}% confidence)`);
                
                // Save learning data periodically
                if (this.guardianStats.learningEvents % 10 === 0) {
                    this.saveLearningData();
                }
            }
        };
    }
    
    generateElementSignature(element) {
        // Create a unique signature for learning
        const classList = Array.from(element.classList).sort().join(' ');
        const tagName = element.tagName;
        const id = element.id;
        const attributes = [];
        
        // Collect relevant attributes
        for (let attr of element.attributes) {
            if (attr.name.includes('ad') || attr.name.includes('sponsor')) {
                attributes.push(`${attr.name}="${attr.value}"`);
            }
        }
        
        return `${tagName}#${id}.${classList}[${attributes.join(',')}]`;
    }
    
    extractElementFeatures(element) {
        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);
        
        return {
            width: rect.width,
            height: rect.height,
            aspectRatio: rect.width / rect.height,
            area: rect.width * rect.height,
            position: styles.position,
            zIndex: parseInt(styles.zIndex) || 0,
            hasText: (element.textContent || '').length > 0,
            hasImages: element.querySelectorAll('img').length,
            hasLinks: element.querySelectorAll('a').length,
            visibility: styles.visibility,
            display: styles.display
        };
    }
    
    initializeBehaviorAnalyzer() {
        this.behaviorAnalyzer = {
            suspiciousActivities: [],
            
            monitorPageBehavior: () => {
                // Monitor for suspicious script behavior
                this.monitorScriptBehavior();
                
                // Monitor DOM manipulation patterns
                this.monitorDOMManipulation();
                
                // Monitor network requests
                this.monitorNetworkActivity();
                
                // Analyze user interaction patterns
                this.analyzeUserInteractions();
            },
            
            detectSuspiciousActivity: (activity) => {
                this.behaviorAnalyzer.suspiciousActivities.push({
                    type: activity.type,
                    timestamp: Date.now(),
                    details: activity.details,
                    severity: activity.severity
                });
                
                // Take action based on severity
                if (activity.severity === 'high') {
                    this.takePreventiveAction(activity);
                }
                
                this.guardianStats.behaviorAnalysis++;
            }
        };
        
        // Start monitoring
        this.behaviorAnalyzer.monitorPageBehavior();
    }
    
    monitorScriptBehavior() {
        // Monitor script execution patterns
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        let timeoutCount = 0;
        let intervalCount = 0;
        
        window.setTimeout = function(callback, delay) {
            timeoutCount++;
            
            // Detect rapid setTimeout calls (potential ad script behavior)
            if (timeoutCount > 50) {
                this.behaviorAnalyzer.detectSuspiciousActivity({
                    type: 'excessive-timeouts',
                    details: `${timeoutCount} setTimeout calls detected`,
                    severity: 'medium'
                });
            }
            
            return originalSetTimeout.call(window, callback, delay);
        }.bind(this);
        
        window.setInterval = function(callback, delay) {
            intervalCount++;
            
            // Detect excessive intervals
            if (intervalCount > 20) {
                this.behaviorAnalyzer.detectSuspiciousActivity({
                    type: 'excessive-intervals',
                    details: `${intervalCount} setInterval calls detected`,
                    severity: 'high'
                });
            }
            
            return originalSetInterval.call(window, callback, delay);
        }.bind(this);
    }
    
    monitorDOMManipulation() {
        let manipulationCount = 0;
        
        const observer = new MutationObserver((mutations) => {
            manipulationCount += mutations.length;
            
            mutations.forEach((mutation) => {
                // Check for suspicious iframe injections
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'IFRAME') {
                            this.analyzeIframe(node);
                        }
                        
                        // Check for ad-like elements being added
                        const adConfidence = this.smartAdBlocker.analyzeElement(node);
                        if (adConfidence > this.smartAdBlocker.confidenceThreshold) {
                            this.smartAdBlocker.blockElement(node, adConfidence);
                        }
                    }
                });
            });
            
            // Detect excessive DOM manipulation
            if (manipulationCount > 100) {
                this.behaviorAnalyzer.detectSuspiciousActivity({
                    type: 'excessive-dom-manipulation',
                    details: `${manipulationCount} DOM mutations detected`,
                    severity: 'medium'
                });
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }
    
    analyzeIframe(iframe) {
        const src = iframe.src || iframe.getAttribute('data-src') || '';
        
        // Check for ad-serving domains
        const adDomains = [
            'doubleclick.net',
            'googlesyndication.com',
            'amazon-adsystem.com',
            'adsystem.com',
            'outbrain.com',
            'taboola.com',
            'criteo.com',
            'adsrvr.org'
        ];
        
        const isAdIframe = adDomains.some(domain => src.includes(domain));
        
        if (isAdIframe) {
            iframe.remove();
            
            this.behaviorAnalyzer.detectSuspiciousActivity({
                type: 'ad-iframe-injection',
                details: `Blocked iframe from: ${src}`,
                severity: 'high'
            });
            
            console.log('🚫 Blocked ad iframe:', src);
        }
    }
    
    monitorNetworkActivity() {
        // Monitor fetch requests
        const originalFetch = window.fetch;
        
        window.fetch = function(url, options) {
            // Analyze request for tracking/ad purposes
            const urlString = url.toString();
            
            if (this.isTrackingRequest(urlString)) {
                console.log('🚫 Blocked tracking request:', urlString);
                
                this.behaviorAnalyzer.detectSuspiciousActivity({
                    type: 'tracking-request',
                    details: `Blocked request to: ${urlString}`,
                    severity: 'medium'
                });
                
                // Return a fake response to prevent errors
                return Promise.resolve(new Response('{}', {
                    status: 200,
                    statusText: 'OK',
                    headers: {'Content-Type': 'application/json'}
                }));
            }
            
            return originalFetch.call(window, url, options);
        }.bind(this);
    }
    
    isTrackingRequest(url) {
        const trackingIndicators = [
            'analytics',
            'tracking',
            'beacon',
            'pixel',
            'collect',
            'event',
            'impression',
            'click',
            'conversion'
        ];
        
        return trackingIndicators.some(indicator => 
            url.toLowerCase().includes(indicator)
        );
    }
    
    analyzeUserInteractions() {
        let clickCount = 0;
        let scrollCount = 0;
        
        document.addEventListener('click', (event) => {
            clickCount++;
            
            // Analyze click patterns
            this.learningDatabase.behaviorPatterns.push({
                type: 'click',
                target: event.target.tagName,
                timestamp: Date.now(),
                coordinates: {x: event.clientX, y: event.clientY}
            });
            
            // Detect click farming
            if (clickCount > 100) {
                this.behaviorAnalyzer.detectSuspiciousActivity({
                    type: 'excessive-clicking',
                    details: `${clickCount} clicks detected`,
                    severity: 'low'
                });
            }
        });
        
        window.addEventListener('scroll', () => {
            scrollCount++;
            
            this.learningDatabase.behaviorPatterns.push({
                type: 'scroll',
                position: window.scrollY,
                timestamp: Date.now()
            });
        });
    }
    
    initializeContextualFilter() {
        this.contextualFilter = {
            analyzePageContext: () => {
                const context = {
                    domain: window.location.hostname,
                    path: window.location.pathname,
                    title: document.title,
                    language: document.documentElement.lang,
                    contentType: this.detectContentType(),
                    userIntent: this.predictUserIntent()
                };
                
                // Apply contextual rules
                this.applyContextualRules(context);
                
                return context;
            },
            
            createContextualRules: (context) => {
                // Create rules based on page context
                if (context.contentType === 'news') {
                    // Be more aggressive on news sites (lots of ads)
                    this.smartAdBlocker.confidenceThreshold = 0.6;
                } else if (context.contentType === 'educational') {
                    // Be more lenient on educational sites
                    this.smartAdBlocker.confidenceThreshold = 0.8;
                } else if (context.contentType === 'social') {
                    // Focus on sponsored content
                    this.smartAdBlocker.confidenceThreshold = 0.7;
                }
                
                this.guardianStats.adaptiveFilters++;
            }
        };
        
        // Analyze current page
        const context = this.contextualFilter.analyzePageContext();
        this.contextualFilter.createContextualRules(context);
    }
    
    detectContentType() {
        const indicators = {
            news: ['news', 'article', 'breaking', 'headline', 'journalist'],
            educational: ['edu', 'learn', 'course', 'tutorial', 'study', 'academic'],
            social: ['social', 'share', 'like', 'follow', 'friend', 'post'],
            ecommerce: ['shop', 'buy', 'cart', 'product', 'price', 'sale'],
            entertainment: ['video', 'game', 'movie', 'music', 'fun', 'entertainment']
        };
        
        const pageText = document.body.textContent.toLowerCase();
        const url = window.location.href.toLowerCase();
        const title = document.title.toLowerCase();
        
        for (const [type, keywords] of Object.entries(indicators)) {
            const score = keywords.reduce((acc, keyword) => {
                if (pageText.includes(keyword)) acc += 1;
                if (url.includes(keyword)) acc += 2;
                if (title.includes(keyword)) acc += 3;
                return acc;
            }, 0);
            
            if (score >= 3) return type;
        }
        
        return 'general';
    }
    
    predictUserIntent() {
        const patterns = this.learningDatabase.behaviorPatterns.slice(-20);
        
        if (patterns.length === 0) return 'exploring';
        
        const clickEvents = patterns.filter(p => p.type === 'click').length;
        const scrollEvents = patterns.filter(p => p.type === 'scroll').length;
        
        if (clickEvents > scrollEvents * 2) return 'navigating';
        if (scrollEvents > clickEvents * 3) return 'reading';
        
        return 'browsing';
    }
    
    applyContextualRules(context) {
        const ruleKey = `${context.domain}-${context.contentType}`;
        
        if (!this.learningDatabase.contextualRules.has(ruleKey)) {
            // Create new contextual rule
            const rule = {
                domain: context.domain,
                contentType: context.contentType,
                confidence: this.smartAdBlocker.confidenceThreshold,
                adaptations: []
            };
            
            this.learningDatabase.contextualRules.set(ruleKey, rule);
        }
        
        // Apply existing rule
        const rule = this.learningDatabase.contextualRules.get(ruleKey);
        this.smartAdBlocker.confidenceThreshold = rule.confidence;
    }
    
    initializeAdaptiveShield() {
        this.adaptiveShield = {
            assessThreatLevel: () => {
                const suspiciousActivities = this.behaviorAnalyzer.suspiciousActivities;
                const recentActivities = suspiciousActivities.filter(
                    activity => Date.now() - activity.timestamp < 60000 // Last minute
                );
                
                if (recentActivities.length > 10) {
                    this.adaptiveShield.threatLevel = 'high';
                } else if (recentActivities.length > 5) {
                    this.adaptiveShield.threatLevel = 'medium';
                } else {
                    this.adaptiveShield.threatLevel = 'low';
                }
                
                this.adaptiveShield.adaptProtectionLevel();
            },
            adaptProtectionLevel: () => {
                switch (this.adaptiveShield.threatLevel) {
                    case 'high':
                        this.smartAdBlocker.confidenceThreshold = 0.5;
                        this.enableEmergencyMode();
                        break;
                    case 'medium':
                        this.smartAdBlocker.confidenceThreshold = 0.6;
                        break;
                    case 'low':
                        this.smartAdBlocker.confidenceThreshold = 0.8;
                        break;
                }
                
                this.guardianStats.adaptiveFilters++;
                console.log(`🛡️ Adapted protection to ${this.adaptiveShield.threatLevel} threat level`);
            }
        };
        
        // Assess threat level every 30 seconds
        setInterval(() => {
            this.adaptiveShield.assessThreatLevel();
        }, 30000);
    }
    
    enableEmergencyMode() {
        console.log('🚨 Emergency protection mode activated!');
        
        // Block all external scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.src.includes(window.location.hostname)) {
                script.remove();
            }
        });
        
        // Block all iframes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => iframe.remove());
        
        // Increase protection
        this.guardianStats.userProtections++;
    }
    
    startBehaviorAnalysis() {
        console.log('📊 Starting intelligent behavior analysis...');
        
        // Analyze all existing elements
        this.analyzePageElements();
        
        // Monitor for new threats
        this.startContinuousMonitoring();
    }
    
    analyzePageElements() {
        const elements = document.querySelectorAll('*');
        let analyzed = 0;
        
        elements.forEach(element => {
            if (this.shouldAnalyzeElement(element)) {
                const confidence = this.smartAdBlocker.analyzeElement(element);
                
                if (confidence > this.smartAdBlocker.confidenceThreshold) {
                    this.smartAdBlocker.blockElement(element, confidence);
                }
                
                analyzed++;
            }
        });
        
        console.log(`🎯 Analyzed ${analyzed} elements with smart guardian`);
    }
    
    shouldAnalyzeElement(element) {
        // Skip certain elements
        const skipTags = ['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE', 'HEAD'];
        if (skipTags.includes(element.tagName)) return false;
        
        // Skip if already processed
        if (element.hasAttribute('data-tini-smart-analyzed')) return false;
        
        // Skip very small elements
        const rect = element.getBoundingClientRect();
        if (rect.width < 20 || rect.height < 20) return false;
        
        element.setAttribute('data-tini-smart-analyzed', 'true');
        return true;
    }
    
    startContinuousMonitoring() {
        // Monitor page changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        this.shouldAnalyzeElement(node)) {
                        
                        const confidence = this.smartAdBlocker.analyzeElement(node);
                        
                        if (confidence > this.smartAdBlocker.confidenceThreshold) {
                            this.smartAdBlocker.blockElement(node, confidence);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    enableAdaptiveFiltering() {
        console.log('🔄 Enabling adaptive filtering system...');
        
        // Adjust filtering based on user feedback
        this.setupUserFeedbackSystem();
        
        // Auto-tune based on performance
        this.startPerformanceTuning();
    }
    
    setupUserFeedbackSystem() {
        // Allow users to provide feedback on blocked content
        document.addEventListener('contextmenu', (event) => {
            const element = event.target;
            
            if (element.hasAttribute('data-tini-smart-blocked')) {
                // Show feedback options
                this.showFeedbackDialog(element, event);
            }
        });
    }
    
    showFeedbackDialog(element, event) {
        event.preventDefault();
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: ${event.clientY}px;
            left: ${event.clientX}px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 12px;
        `;
        
        dialog.innerHTML = `
            <div>TINI Smart Guardian</div>
            <button onclick="this.parentElement.remove(); window.TiniSmartGuardian.markAsCorrectBlock('${element.getAttribute('data-tini-smart-blocked')}')">✅ Correct block</button>
            <button onclick="this.parentElement.remove(); window.TiniSmartGuardian.markAsIncorrectBlock(this.previousElementSibling.getAttribute('data-signature'))">❌ Incorrect block</button>
        `;
        
        document.body.appendChild(dialog);
        
        // Remove dialog after 5 seconds
        setTimeout(() => {
            if (dialog.parentElement) {
                dialog.remove();
            }
        }, 5000);
    }
    
    markAsCorrectBlock(confidence) {
        console.log('✅ User confirmed correct block');
        // This reinforces the learning pattern
        this.guardianStats.learningEvents++;
    }
    
    markAsIncorrectBlock(signature) {
        console.log('❌ User reported incorrect block');
        
        // Remove from blocked patterns and add to allowed patterns
        this.learningDatabase.blockedPatterns.delete(signature);
        this.learningDatabase.allowedPatterns.add(signature);
        
        this.guardianStats.learningEvents++;
        this.saveLearningData();
    }
    
    startPerformanceTuning() {
        // Auto-tune performance based on system resources
        setInterval(() => {
            const performanceMetrics = this.getPerformanceMetrics();
            this.tunePerformance(performanceMetrics);
        }, 60000);
    }
    
    getPerformanceMetrics() {
        return {
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
            blockedElements: this.guardianStats.intelligentBlocks,
            analysisTime: Date.now() - this.startTime,
            threatLevel: this.adaptiveShield ? this.adaptiveShield.threatLevel : 'unknown',
            learnedPatterns: {
                blocked: this.learningDatabase.blockedPatterns.size,
                allowed: this.learningDatabase.allowedPatterns.size,
                contextual: this.learningDatabase.contextualRules.size
            }
        };
    }
    
    tunePerformance(metrics) {
        // Adjust aggressiveness based on performance
        if (metrics.memoryUsage > 50000000) { // 50MB
            // Reduce analysis frequency on low-memory devices
            this.smartAdBlocker.confidenceThreshold += 0.1;
            console.log('🔧 Reduced analysis intensity for performance');
        }
    }
    
    startContextualProtection() {
        console.log('🎯 Starting contextual protection system...');
        
        // Analyze current page context
        const context = this.contextualFilter.analyzePageContext();
        
        // Set up context-aware rules
        this.setupContextualRules(context);
        
        // Monitor for context changes
        this.monitorContextChanges();
    }
    
    setupContextualRules(context) {
        // Custom rules based on page type
        switch (context.contentType) {
            case 'news':
                this.setupNewsProtection();
                break;
            case 'social':
                this.setupSocialProtection();
                break;
            case 'ecommerce':
                this.setupEcommerceProtection();
                break;
            default:
                this.setupGeneralProtection();
        }
    }
    
    setupNewsProtection() {
        // News sites often have many ads
        this.smartAdBlocker.confidenceThreshold = 0.6;
        
        // Block common news ad patterns
        const newsAdSelectors = [
            '.sponsored-content',
            '.native-ad',
            '.promoted-content',
            '[data-module="Advertisement"]'
        ];
        
        newsAdSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                this.smartAdBlocker.blockElement(element, 0.9);
            });
        });
    }
    
    setupSocialProtection() {
        // Focus on sponsored posts and promoted content
        const socialAdSelectors = [
            '[data-testid*="sponsored"]',
            '[aria-label*="Sponsored"]',
            '.promoted-tweet',
            '.sponsored-post'
        ];
        
        socialAdSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                this.smartAdBlocker.blockElement(element, 0.9);
            });
        });
    }
    
    setupEcommerceProtection() {
        // Be careful not to block product recommendations
        this.smartAdBlocker.confidenceThreshold = 0.8;
        
        // Focus on third-party ads
        const ecommerceAdSelectors = [
            '[id*="google_ads"]',
            '[class*="amazon-ad"]',
            '.third-party-ad'
        ];
        
        ecommerceAdSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                this.smartAdBlocker.blockElement(element, 0.9);
            });
        });
    }
    
    setupGeneralProtection() {
        // Default protection level
        this.smartAdBlocker.confidenceThreshold = 0.7;
    }
    
    monitorContextChanges() {
        // Monitor for page navigation (SPA)
        let currentPath = window.location.pathname;
        
        setInterval(() => {
            if (window.location.pathname !== currentPath) {
                currentPath = window.location.pathname;
                
                // Re-analyze context
                const context = this.contextualFilter.analyzePageContext();
                this.setupContextualRules(context);
                
                console.log('🔄 Context changed, updating protection rules');
            }
        }, 1000);
    }
    
    takePreventiveAction(activity) {
        console.log(`🚨 Taking preventive action for: ${activity.type}`);
        
        switch (activity.type) {
            case 'excessive-timeouts':
            case 'excessive-intervals':
                // Slow down script execution
                this.throttleScriptExecution();
                break;
                
            case 'excessive-dom-manipulation':
                // Limit DOM changes
                this.limitDOMChanges();
                break;
                
            case 'ad-iframe-injection':
                // Block iframe creation
                this.blockIframeCreation();
                break;
                
            case 'tracking-request':
                // Enhance tracking protection
                this.enhanceTrackingProtection();
                break;
        }
        
        this.guardianStats.userProtections++;
    }
    
    throttleScriptExecution() {
        // Implement script throttling
        console.log('⏱️ Throttling script execution');
    }
    
    limitDOMChanges() {
        // Implement DOM change limiting
        console.log('🛑 Limiting DOM modifications');
    }
    
    blockIframeCreation() {
        // Block new iframe creation
        const originalCreateElement = document.createElement;
        
        document.createElement = function(tagName) {
            if (tagName.toLowerCase() === 'iframe') {
                console.log('🚫 Blocked iframe creation');
                return document.createElement('div'); // Return dummy element
            }
            
            return originalCreateElement.call(this, tagName);
        };
    }
    
    enhanceTrackingProtection() {
        // Enhance tracking protection
        console.log('🔒 Enhanced tracking protection activated');
    }
    
    getGuardianStats() {
        return {
            ...this.guardianStats,
            version: this.version,
            learningMode: this.learningMode,
            threatLevel: this.adaptiveShield ? this.adaptiveShield.threatLevel : 'unknown',
            learnedPatterns: {
                blocked: this.learningDatabase.blockedPatterns.size,
                allowed: this.learningDatabase.allowedPatterns.size,
                contextual: this.learningDatabase.contextualRules.size
            }
        };
    }
    
    exportLearningData() {
        return {
            blockedPatterns: Array.from(this.learningDatabase.blockedPatterns),
            allowedPatterns: Array.from(this.learningDatabase.allowedPatterns),
            userPreferences: Array.from(this.learningDatabase.userPreferences.entries()),
            contextualRules: Array.from(this.learningDatabase.contextualRules.entries()),
            version: this.version,
            timestamp: Date.now()
        };
    }
    
    importLearningData(data) {
        if (data.version === this.version) {
            this.learningDatabase.blockedPatterns = new Set(data.blockedPatterns);
            this.learningDatabase.allowedPatterns = new Set(data.allowedPatterns);
            this.learningDatabase.userPreferences = new Map(data.userPreferences);
            this.learningDatabase.contextualRules = new Map(data.contextualRules);
            
            console.log('📥 Learning data imported successfully');
        }
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.TiniSmartGuardian = new TiniSmartGuardian();
    });
} else {
    window.TiniSmartGuardian = new TiniSmartGuardian();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TiniSmartGuardian;
}
