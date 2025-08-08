// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🌟 TINI AI ULTRA - Advanced AI-Powered Web Enhancement
 * Trí tuệ nhân tạo tiên tiến để tối ưu hóa trải nghiệm web
 * Features: Smart content filtering, AI-based ad detection, intelligent protection
 */

class TiniAIUltra {
    constructor() {
        this.version = "4.0";
        this.name = "TINI AI Ultra";
        this.initialized = false;
        this.aiStats = {
            smartBlocks: 0,
            contentEnhanced: 0,
            intelligentFilters: 0,
            mlDetections: 0
        };
        
        // AI patterns for advanced detection
        this.aiPatterns = {
            // Text patterns that indicate ads
            adTextPatterns: [
                /sponsored|advertisement|promoted|ad\s*by/i,
                /click\s*here|buy\s*now|limited\s*time/i,
                /exclusive\s*deal|special\s*offer|discount/i,
                /earn\s*money|make\s*money|get\s*rich/i
            ],
            
            // Behavioral patterns
            behaviorPatterns: [
                'rapid-fire-clicks',
                'infinite-scroll-trap',
                'attention-grabbing-animations',
                'fake-notification-badges'
            ],
            
            // Machine learning features for ad detection
            mlFeatures: [
                'element-size-ratio',
                'color-contrast-analysis',
                'text-to-image-ratio',
                'click-bait-probability',
                'user-engagement-prediction'
            ]
        };
        
        // Neural network for content classification
        this.contentClassifier = {
            weights: {
                advertisement: 0.8,
                content: 0.2,
                navigation: 0.1,
                social: 0.3
            },
            
            // Feature extractors
            extractFeatures: (element) => {
                return {
                    hasAdKeywords: this.hasAdKeywords(element),
                    suspiciousSize: this.hasSuspiciousSize(element),
                    colorProfile: this.analyzeColors(element),
                    textDensity: this.calculateTextDensity(element),
                    clickability: this.analyzeClickability(element)
                };
            }
        };
        
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        console.log(`🌟 ${this.name} v${this.version} initializing AI systems...`);
        
        // Initialize AI modules
        this.initializeAI();
        
        // Start intelligent content analysis
        this.startIntelligentAnalysis();
        
        // Enable smart protection
        this.enableSmartProtection();
        
        // Start learning from user behavior
        this.startBehaviorLearning();
        
        this.initialized = true;
        console.log(`✅ ${this.name} v${this.version} AI systems online!`);
    }
    
    initializeAI() {
        console.log('🧠 Initializing AI neural networks...');
        
        // Initialize content classification model
        this.loadContentModel();
        
        // Initialize ad detection neural network
        this.loadAdDetectionModel();
        
        // Initialize behavior prediction model
        this.loadBehaviorModel();
        
        console.log('🚀 AI models loaded successfully');
    }
    
    loadContentModel() {
        // Simplified neural network for content classification
        this.contentModel = {
            // Input layer: element features
            inputLayer: 5, // hasAdKeywords, suspiciousSize, colorProfile, textDensity, clickability
            
            // Hidden layer weights (simplified)
            hiddenWeights: [
                [0.8, -0.2, 0.5, 0.3, 0.7],
                [-0.3, 0.9, 0.1, 0.6, -0.4],
                [0.6, 0.4, -0.7, 0.8, 0.2]
            ],
            
            // Output layer weights
            outputWeights: [0.9, -0.5, 0.3],
            
            predict: (features) => {
                // Forward propagation (simplified)
                const hidden = this.contentModel.hiddenWeights.map(weights => {
                    const sum = weights.reduce((acc, weight, index) => 
                        acc + weight * features[index], 0);
                    return 1 / (1 + Math.exp(-sum)); // Sigmoid activation
                });
                
                const output = this.contentModel.outputWeights.reduce((acc, weight, index) => 
                    acc + weight * hidden[index], 0);
                
                return 1 / (1 + Math.exp(-output)); // Sigmoid output
            }
        };
    }
    
    loadAdDetectionModel() {
        // Advanced ad detection using multiple criteria
        this.adDetectionModel = {
            analyze: (element) => {
                let adProbability = 0;
                
                // Text analysis
                const text = element.textContent || '';
                this.aiPatterns.adTextPatterns.forEach(pattern => {
                    if (pattern.test(text)) {
                        adProbability += 0.3;
                    }
                });
                
                // Visual analysis
                const styles = window.getComputedStyle(element);
                
                // Check for ad-like styling
                if (styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                    styles.border !== 'none') {
                    adProbability += 0.2;
                }
                
                // Check for suspicious dimensions
                const rect = element.getBoundingClientRect();
                const aspectRatio = rect.width / rect.height;
                
                // Common ad dimensions
                const commonAdRatios = [
                    728/90,  // Leaderboard
                    300/250, // Medium Rectangle
                    320/50,  // Mobile Banner
                    160/600  // Wide Skyscraper
                ];
                
                if (commonAdRatios.some(ratio => Math.abs(aspectRatio - ratio) < 0.1)) {
                    adProbability += 0.4;
                }
                
                // Check for ad-related attributes
                const adAttributes = ['data-ad', 'data-ads', 'data-advertisement', 'data-google-av-adk'];
                if (adAttributes.some(attr => element.hasAttribute(attr))) {
                    adProbability += 0.5;
                }
                
                return Math.min(adProbability, 1);
            }
        };
    }
    
    loadBehaviorModel() {
        // User behavior prediction model
        this.behaviorModel = {
            userProfile: {
                clickPatterns: [],
                scrollBehavior: [],
                timeSpent: [],
                preferences: {}
            },
            
            learnFromAction: (action, context) => {
                this.behaviorModel.userProfile[action].push({
                    timestamp: Date.now(),
                    context: context
                });
                
                // Limit history to last 100 actions
                if (this.behaviorModel.userProfile[action].length > 100) {
                    this.behaviorModel.userProfile[action].shift();
                }
            },
            
            predictUserIntent: () => {
                // Simple intent prediction based on recent behavior
                const recent = this.behaviorModel.userProfile.clickPatterns.slice(-10);
                
                if (recent.length === 0) return 'exploring';
                
                const avgTimeBetweenClicks = recent.reduce((sum, action, index) => {
                    if (index === 0) return 0;
                    return sum + (action.timestamp - recent[index - 1].timestamp);
                }, 0) / (recent.length - 1);
                
                if (avgTimeBetweenClicks < 1000) return 'rushing';
                if (avgTimeBetweenClicks > 10000) return 'reading';
                return 'browsing';
            }
        };
    }
    
    startIntelligentAnalysis() {
        console.log('🔍 Starting intelligent content analysis...');
        
        // Analyze all existing elements
        this.analyzePageContent();
        
        // Set up continuous monitoring
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.analyzeElement(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    analyzePageContent() {
        const elements = document.querySelectorAll('*');
        let analyzed = 0;
        
        elements.forEach(element => {
            if (this.shouldAnalyze(element)) {
                this.analyzeElement(element);
                analyzed++;
            }
        });
        
        console.log(`🧠 Analyzed ${analyzed} elements with AI`);
    }
    
    shouldAnalyze(element) {
        // Skip script, style, and other non-content elements
        const skipTags = ['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE'];
        if (skipTags.includes(element.tagName)) return false;
        
        // Skip elements that are too small
        const rect = element.getBoundingClientRect();
        if (rect.width < 10 || rect.height < 10) return false;
        
        return true;
    }
    
    analyzeElement(element) {
        // Extract features for AI analysis
        const features = this.extractElementFeatures(element);
        
        // Use content classifier
        const contentScore = this.contentModel.predict(features);
        
        // Use ad detection model
        const adProbability = this.adDetectionModel.analyze(element);
        
        // Make decision based on AI analysis
        if (adProbability > 0.7) {
            this.handleAdElement(element, adProbability);
        } else if (contentScore > 0.8) {
            this.enhanceContentElement(element, contentScore);
        }
        
        this.aiStats.mlDetections++;
    }
    
    extractElementFeatures(element) {
        return [
            this.hasAdKeywords(element) ? 1 : 0,
            this.hasSuspiciousSize(element) ? 1 : 0,
            this.analyzeColors(element),
            this.calculateTextDensity(element),
            this.analyzeClickability(element)
        ];
    }
    
    hasAdKeywords(element) {
        const text = element.textContent || '';
        return this.aiPatterns.adTextPatterns.some(pattern => pattern.test(text));
    }
    
    hasSuspiciousSize(element) {
        const rect = element.getBoundingClientRect();
        const aspectRatio = rect.width / rect.height;
        
        // Check for common ad aspect ratios
        const adRatios = [728/90, 300/250, 320/50, 160/600];
        return adRatios.some(ratio => Math.abs(aspectRatio - ratio) < 0.1);
    }
    
    analyzeColors(element) {
        try {
            const styles = window.getComputedStyle(element);
            const bgColor = styles.backgroundColor;
            const textColor = styles.color;
            
            // Simple color analysis (return contrast ratio approximation)
            if (bgColor === 'rgba(0, 0, 0, 0)') return 0.5;
            
            // High contrast often indicates ads
            return bgColor !== textColor ? 0.8 : 0.2;
        } catch (error) {
            return 0.5;
        }
    }
    
    calculateTextDensity(element) {
        const text = element.textContent || '';
        const rect = element.getBoundingClientRect();
        const area = rect.width * rect.height;
        
        if (area === 0) return 0;
        
        return Math.min(text.length / area * 10000, 1); // Normalize
    }
    
    analyzeClickability(element) {
        const styles = window.getComputedStyle(element);
        
        let clickability = 0;
        
        if (styles.cursor === 'pointer') clickability += 0.3;
        if (element.tagName === 'A' || element.tagName === 'BUTTON') clickability += 0.4;
        if (element.onclick || element.addEventListener) clickability += 0.3;
        
        return Math.min(clickability, 1);
    }
    
    handleAdElement(element, probability) {
        // AI detected this as an ad
        element.style.display = 'none';
        element.setAttribute('data-tini-ai-blocked', 'ad');
        
        this.aiStats.smartBlocks++;
        
        console.log(`🤖 AI blocked ad element (${(probability * 100).toFixed(1)}% confidence)`);
    }
    
    enhanceContentElement(element, score) {
        // AI detected this as valuable content
        element.setAttribute('data-tini-ai-enhanced', 'content');
        
        // Add subtle enhancement
        element.style.boxShadow = '0 0 3px rgba(76, 175, 80, 0.3)';
        element.style.transition = 'all 0.3s ease';
        
        this.aiStats.contentEnhanced++;
    }
    
    enableSmartProtection() {
        console.log('🛡️ Enabling AI-powered smart protection...');
        
        // Smart cookie management
        this.enableSmartCookieFilter();
        
        // Intelligent script analysis
        this.enableSmartScriptFilter();
        
        // Adaptive user interface protection
        this.enableUIProtection();
    }
    
    enableSmartCookieFilter() {
        // AI-based cookie classification
        const originalSetCookie = document.__defineSetter__;
        
        Object.defineProperty(document, 'cookie', {
            get: () => document._tiniCookies || '',
            set: (value) => {
                // Analyze cookie with AI
                const cookieRisk = this.analyzeCookieRisk(value);
                
                if (cookieRisk < 0.5) {
                    document._tiniCookies = (document._tiniCookies || '') + '; ' + value;
                    console.log('🍪 Cookie allowed by AI filter');
                } else {
                    console.log('🚫 Cookie blocked by AI filter (risk: ' + (cookieRisk * 100).toFixed(1) + '%)');
                }
            }
        });
    }
    
    analyzeCookieRisk(cookieString) {
        const trackingIndicators = [
            'track', 'analytics', 'ads', 'marketing', 'facebook', 'google'
        ];
        
        let risk = 0;
        
        trackingIndicators.forEach(indicator => {
            if (cookieString.toLowerCase().includes(indicator)) {
                risk += 0.2;
            }
        });
        
        // Check expiration (long-term cookies are more suspicious)
        if (cookieString.includes('expires') || cookieString.includes('max-age')) {
            risk += 0.1;
        }
        
        return Math.min(risk, 1);
    }
    
    enableSmartScriptFilter() {
        // Monitor script execution with AI
        const originalCreateElement = document.createElement;
        
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            
            if (tagName.toLowerCase() === 'script') {
                // AI analysis of script before execution
                element.addEventListener('beforeload', (event) => {
                    if (element.src) {
                        const risk = this.analyzeScriptRisk(element.src);
                        if (risk > 0.7) {
                            event.preventDefault();
                            console.log('🚫 Script blocked by AI: ' + element.src);
                        }
                    }
                });
            }
            
            return element;
        }.bind(this);
    }
    
    analyzeScriptRisk(scriptUrl) {
        const suspiciousDomains = [
            'doubleclick', 'googlesyndication', 'amazon-adsystem',
            'outbrain', 'taboola', 'criteo', 'adsystem'
        ];
        
        let risk = 0;
        
        suspiciousDomains.forEach(domain => {
            if (scriptUrl.includes(domain)) {
                risk += 0.3;
            }
        });
        
        // Check for common ad script patterns
        if (scriptUrl.includes('ads') || scriptUrl.includes('ad.')) {
            risk += 0.4;
        }
        
        return Math.min(risk, 1);
    }
    
    enableUIProtection() {
        // Protect against deceptive UI patterns
        this.detectDarkPatterns();
        this.protectFromClickjacking();
        this.preventFakeCursors();
    }
    
    detectDarkPatterns() {
        // AI detection of dark UX patterns
        const buttons = document.querySelectorAll('button, input[type="submit"], a');
        
        buttons.forEach(button => {
            const text = button.textContent || button.value || '';
            const isDarkPattern = this.analyzeDarkPattern(text, button);
            
            if (isDarkPattern > 0.6) {
                button.style.border = '2px solid red';
                button.title = 'Potentially deceptive - TINI AI Warning';
                
                this.aiStats.intelligentFilters++;
            }
        });
    }
    
    analyzeDarkPattern(text, element) {
        const darkPatterns = [
            /yes|ok|i agree|accept|continue/i,
            /free|unlimited|exclusive/i,
            /hurry|limited|expires/i
        ];
        
        let score = 0;
        
        // Text analysis
        darkPatterns.forEach(pattern => {
            if (pattern.test(text)) score += 0.2;
        });
        
        // Visual analysis
        const styles = window.getComputedStyle(element);
        
        // Bright, attention-grabbing colors
        if (styles.backgroundColor.includes('rgb(255') || 
            styles.backgroundColor.includes('red') ||
            styles.backgroundColor.includes('orange')) {
            score += 0.2;
        }
        
        // Large or prominent size
        const rect = element.getBoundingClientRect();
        if (rect.width > 200 || rect.height > 50) {
            score += 0.1;
        }
        
        return Math.min(score, 1);
    }
    
    protectFromClickjacking() {
        // AI-based clickjacking detection
        if (window.top !== window.self) {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 0, 0, 0.1);
                z-index: 999999;
                pointer-events: none;
                border: 5px solid red;
                box-sizing: border-box;
            `;
            
            document.body.appendChild(overlay);
            console.log('🚨 Clickjacking protection activated');
        }
    }
    
    preventFakeCursors() {
        // Detect fake cursor elements
        const suspiciousElements = document.querySelectorAll('[style*="cursor"], .cursor, #cursor');
        
        suspiciousElements.forEach(element => {
            if (element.style.position === 'absolute' || element.style.position === 'fixed') {
                element.remove();
                console.log('🚫 Removed fake cursor element');
            }
        });
    }
    
    startBehaviorLearning() {
        // Learn from user interactions
        document.addEventListener('click', (event) => {
            this.behaviorModel.learnFromAction('clickPatterns', {
                target: event.target.tagName,
                x: event.clientX,
                y: event.clientY
            });
        });
        
        document.addEventListener('scroll', () => {
            this.behaviorModel.learnFromAction('scrollBehavior', {
                scrollY: window.scrollY,
                documentHeight: document.documentElement.scrollHeight
            });
        });
        
        // Adapt protection based on user behavior
        setInterval(() => {
            this.adaptProtectionLevel();
        }, 30000);
    }
    
    adaptProtectionLevel() {
        const intent = this.behaviorModel.predictUserIntent();
        
        switch (intent) {
            case 'rushing':
                // User is in a hurry, be more aggressive with blocking
                this.protectionLevel = 'aggressive';
                break;
            case 'reading':
                // User is reading, focus on content enhancement
                this.protectionLevel = 'content-focused';
                break;
            default:
                this.protectionLevel = 'balanced';
        }
        
        console.log(`🧠 AI adapted protection level to: ${this.protectionLevel}`);
    }
    
    getAIStats() {
        return {
            ...this.aiStats,
            version: this.version,
            protectionLevel: this.protectionLevel,
            userIntent: this.behaviorModel.predictUserIntent()
        };
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.TiniAIUltra = new TiniAIUltra();
    });
} else {
    window.TiniAIUltra = new TiniAIUltra();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TiniAIUltra;
}
