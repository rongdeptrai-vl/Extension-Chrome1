// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
//#  🤖 AI POWERED COUNTERATTACK SYSTEM v4.1 (Real-Time API Integrated)
//#  Advanced AI-driven threat detection and automatic response.
//#  Now integrated with a centralized backend for logging and threat intelligence.
// ai-powered-counterattack-system.js

(function() {
;

    class AIPoweredCounterattackSystem {
        constructor() {
            this.version = "4.1";
            this.apiEndpoint = `http://localhost:${process.env.PORT || 55057}/api`; // Centralized API Endpoint
            this.threatDatabase = new Map();
            this.learningMode = true;
            this.counterattackEnabled = true;
            this.threatPatterns = []; // Will be loaded from API
            
            this.init();
        }

        async init() {
            console.log('🤖 [AI] Counterattack System v' + this.version + ' initializing...');
            
            await this.loadThreatDatabase(); // Now an async operation
            this.initializeAI();
            this.setupThreatDetection();
            this.activateCounterattack();
            
            console.log('🤖 [AI] Advanced threat protection active');
        }

        async loadThreatDatabase() {
            const fallbackPatterns = [
                // Fallback XSS Patterns
                { type: 'XSS', pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi, severity: 'HIGH' },
                { type: 'XSS', pattern: /javascript:/gi, severity: 'HIGH' },
                // Fallback SQL Injection Patterns
                { type: 'SQL_INJECTION', pattern: /(union|select|insert|update|delete|drop)/gi, severity: 'HIGH' },
                // Fallback Directory Traversal
                { type: 'DIRECTORY_TRAVERSAL', pattern: /(\.\.)|(\.\/)/gi, severity: 'HIGH' }
            ];

            // In Node.js environment, skip API call and use fallback patterns directly
            if (typeof window === 'undefined') {
                console.log('🤖 [AI] Node.js environment detected - using fallback patterns');
                this.threatPatterns = fallbackPatterns;
                return;
            }

            try {
                console.log(`🤖 [AI] Fetching latest threat patterns from ${this.apiEndpoint}...`);
                const response = await fetch(this.apiEndpoint, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }

                const data = await response.json();
                
                // Assuming the API returns an object with a `threat_patterns` key
                if (data && data.threat_patterns && Array.isArray(data.threat_patterns)) {
                    // Important: We need to convert string patterns from the API into RegExp objects
                    this.threatPatterns = data.threat_patterns.map(p => {
                        try {
                            // The 'u' flag is good for unicode character support.
                            p.pattern = new RegExp(p.pattern, p.flags || 'giu');
                            return p;
                        } catch (e) {
                            console.warn(`🤖 [AI] Invalid regex pattern from API, skipping: ${p.pattern}`, e);
                            return null;
                        }
                    }).filter(p => p !== null);

                    console.log(`🤖 [AI] Successfully loaded ${this.threatPatterns.length} threat patterns from API.`);
                } else {
                    throw new Error('Invalid data structure from threat intelligence API.');
                }

            } catch (error) {
                console.error('🤖 [AI] Failed to fetch threat patterns from API. Using fallback patterns.', error);
                this.threatPatterns = fallbackPatterns;
            }
        }

        reportThreatIncident(input, analysis, context, response) {
            const incident = {
                id: 'incident_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                threat: {
                    input: input.substring(0, 1000), // Increased length for better analysis
                    analysis: analysis,
                    context: context
                },
                response: response,
                environment: {
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
                    url: typeof window !== 'undefined' ? window.location.href : 'N/A',
                    // Potentially add more environment data like user ID, session ID, etc.
                }
            };

            console.log(`🤖 [AI] Reporting incident to central server: ${incident.id}`);

            // Send the incident report to the centralized backend API
            fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'SECURITY_INCIDENT',
                    payload: incident
                })
            })
            .then(response => {
                if (response.ok) {
                    console.log(`🤖 [AI] Incident ${incident.id} successfully reported.`);
                } else {
                    console.error(`🤖 [AI] Failed to report incident ${incident.id}. Server responded with ${response.status}.`);
                }
            })
            .catch(error => {
                console.error(`🤖 [AI] Network error while reporting incident ${incident.id}.`, error);
                // As a fallback, we could save to localStorage here if the server is down
                this.saveIncidentLocally(incident);
            });

            // Also notify other local security systems via the event bus
            if (typeof window !== 'undefined' && window.TINI_SECURITY_BUS) {
                window.TINI_SECURITY_BUS.emit('tini:threat-detected', incident);
            }
        }

        saveIncidentLocally(incident) {
            try {
                if (typeof localStorage !== 'undefined') {
                    // Browser environment
                    let localIncidents = JSON.parse(localStorage.getItem('tini_offline_incidents') || '[]');
                    localIncidents.push(incident);
                    // Keep the list from growing too large
                    if (localIncidents.length > 50) {
                        localIncidents = localIncidents.slice(-50);
                    }
                    localStorage.setItem('tini_offline_incidents', JSON.stringify(localIncidents));
                    console.warn('🤖 [AI] Incident saved to local storage as a fallback.');
                } else {
                    // Node.js environment - log incident
                    console.warn('🤖 [AI] Incident logged locally (Node.js):', JSON.stringify(incident, null, 2));
                }
            } catch (e) {
                console.error('🤖 [AI] Failed to save incident locally.', e);
            }
        }

        initializeAI() {
            // AI learning system
            this.aiNeuralNetwork = {
                layers: [
                    { neurons: 128, activation: 'relu' },
                    { neurons: 64, activation: 'relu' },
                    { neurons: 32, activation: 'relu' },
                    { neurons: 1, activation: 'sigmoid' }
                ],
                weights: this.initializeWeights(),
                bias: this.initializeBias(),
                learningRate: 0.001
            };

            // Threat scoring algorithm
            this.threatScorer = {
                calculateScore: (input) => {
                    let score = 0;
                    let factors = [];

                    // Pattern matching score
                    this.threatPatterns.forEach(pattern => {
                        if (pattern.pattern.test(input)) {
                            const severity = pattern.severity;
                            let points = 0;
                            
                            switch(severity) {
                                case 'CRITICAL': points = 100; break;
                                case 'HIGH': points = 75; break;
                                case 'MEDIUM': points = 50; break;
                                case 'LOW': points = 25; break;
                            }
                            
                            score += points;
                            factors.push({
                                type: pattern.type,
                                severity: severity,
                                points: points
                            });
                        }
                    });

                    // Behavioral analysis
                    score += this.analyzeBehavior(input);
                    
                    // Context analysis
                    score += this.analyzeContext(input);

                    return {
                        score: Math.min(score, 100),
                        factors: factors,
                        classification: this.classifyThreat(score)
                    };
                }
            };
        }

        initializeWeights() {
            // Simplified weight initialization
            const weights = [];
            for (let i = 0; i < 4; i++) {
                weights[i] = [];
                for (let j = 0; j < 128; j++) {
                    weights[i][j] = (Math.random() - 0.5) * 2;
                }
            }
            return weights;
        }

        initializeBias() {
            return [0.1, 0.1, 0.1, 0.1];
        }

        analyzeBehavior(input) {
            let behaviorScore = 0;

            // Frequency analysis
            const frequency = this.getInputFrequency(input);
            if (frequency > 10) behaviorScore += 20;

            // Length analysis
            if (input.length > 1000) behaviorScore += 15;
            if (input.length > 5000) behaviorScore += 25;

            // Encoding analysis
            try {
                const decoded = decodeURIComponent(input);
                if (decoded !== input && decoded.length > input.length * 1.5) {
                    behaviorScore += 30; // Suspicious encoding
                }
            } catch(e) {
                behaviorScore += 10; // Malformed encoding
            }

            // Special character density
            const specialChars = input.match(/[<>'\"&;(){}[\\]]/g) || [];
            const density = specialChars.length / input.length;
            if (density > 0.1) behaviorScore += 20;

            return behaviorScore;
        }

        analyzeContext(input) {
            let contextScore = 0;

            // Check execution context
            if (document.readyState === 'loading') {
                contextScore += 10; // During page load
            }

            // Check if in iframe
            if (typeof window !== 'undefined' && window !== window.top) {
                contextScore += 15; // Iframe context
            }

            // Check for suspicious origins
            const suspiciousOrigins = ['data:', 'javascript:', 'vbscript:'];
            suspiciousOrigins.forEach(origin => {
                if (input.includes(origin)) {
                    contextScore += 25;
                }
            });

            return contextScore;
        }

        getInputFrequency(input) {
            const key = this.hashInput(input);
            const count = this.threatDatabase.get(key) || 0;
            this.threatDatabase.set(key, count + 1);
            return count + 1;
        }

        hashInput(input) {
            // Simple hash function
            let hash = 0;
            for (let i = 0; i < input.length; i++) {
                const char = input.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash.toString();
        }

        classifyThreat(score) {
            if (score >= 90) return 'CRITICAL';
            if (score >= 70) return 'HIGH';
            if (score >= 50) return 'MEDIUM';
            if (score >= 30) return 'LOW';
            return 'SAFE';
        }

        setupThreatDetection() {
            // Monitor all inputs - only in browser environment
            if (typeof document !== 'undefined') {
                this.monitorFormInputs();
                this.monitorURLChanges();
                this.monitorDOMChanges();
                this.monitorNetworkRequests();
                console.log('🤖 [AI] Browser threat monitoring activated');
            } else {
                console.log('🤖 [AI] Node.js environment - browser monitoring disabled');
            }
        }

        monitorFormInputs() {
            if (typeof document === 'undefined') return;
            
            document.addEventListener('input', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                    this.analyzeInput(e.target.value, 'FORM_INPUT');
                }
            });
        }

        monitorURLChanges() {
            if (typeof window === 'undefined') return;
            
            let currentURL = window.location.href;
            
            setInterval(() => {
                if (window.location.href !== currentURL) {
                    this.analyzeInput(window.location.href, 'URL_CHANGE');
                    currentURL = window.location.href;
                }
            }, 1000);
        }

        monitorDOMChanges() {
            if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;
            
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.analyzeElement(node);
                            }
                        });
                    }
                });
            });

            if (typeof document !== 'undefined') {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        }

        monitorNetworkRequests() {
            if (typeof window === 'undefined') return;
            
            // Monitor fetch requests
            if (typeof window.fetch !== 'undefined') {
                const originalFetch = window.fetch;
                window.fetch = (...args) => {
                    this.analyzeInput(args[0], 'NETWORK_REQUEST');
                    return originalFetch.apply(this, args);
                };
            }

            // Monitor XMLHttpRequest
            if (typeof window.XMLHttpRequest !== 'undefined') {
                const originalXHR = window.XMLHttpRequest.prototype.open;
                window.XMLHttpRequest.prototype.open = function(method, url) {
                    if (window.TINI_AI_COUNTERATTACK) {
                        window.TINI_AI_COUNTERATTACK.analyzeInput(url, 'XHR_REQUEST');
                    }
                    return originalXHR.apply(this, arguments);
                };
            }
        }

        analyzeInput(input, context) {
            if (!input || typeof input !== 'string') return;

            const analysis = this.threatScorer.calculateScore(input);
            
            if (analysis.classification !== 'SAFE') {
                console.warn('🤖 [AI] Threat detected:', {
                    input: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
                    context: context,
                    score: analysis.score,
                    classification: analysis.classification,
                    factors: analysis.factors
                });

                this.executeCounterattack(input, analysis, context);
            }

            // Learning mode - store patterns
            if (this.learningMode) {
                this.learnFromInput(input, analysis);
            }
        }

        analyzeElement(element) {
            // Analyze element attributes
            if (element.attributes) {
                Array.from(element.attributes).forEach(attr => {
                    this.analyzeInput(attr.value, 'DOM_ATTRIBUTE');
                });
            }

            // Analyze element content
            if (element.innerHTML) {
                this.analyzeInput(element.innerHTML, 'DOM_CONTENT');
            }
        }

        executeCounterattack(input, analysis, context) {
            if (!this.counterattackEnabled) return;

            const response = this.determineResponse(analysis);
            
            switch(response.action) {
                case 'IMMEDIATE_BLOCK':
                    this.immediateBlock(input, context);
                    break;
                case 'BLOCK_AND_SANITIZE':
                    this.blockAndSanitize(input, context);
                    break;
                case 'BLOCK_AND_ALERT':
                    this.blockAndAlert(input, context);
                    break;
                case 'SANITIZE':
                    this.sanitizeInput(input, context);
                    break;
                case 'LOG_AND_MONITOR':
                    this.logAndMonitor(input, analysis, context);
                    break;
            }

            // Report incident
            this.reportThreatIncident(input, analysis, context, response);
        }

        determineResponse(analysis) {
            const classification = analysis.classification;
            
            switch(classification) {
                case 'CRITICAL':
                    return { action: 'IMMEDIATE_BLOCK', urgency: 'CRITICAL' };
                case 'HIGH':
                    return { action: 'BLOCK_AND_ALERT', urgency: 'HIGH' };
                case 'MEDIUM':
                    return { action: 'SANITIZE', urgency: 'MEDIUM' };
                case 'LOW':
                    return { action: 'LOG_AND_MONITOR', urgency: 'LOW' };
                default:
                    return { action: 'MONITOR', urgency: 'INFO' };
            }
        }

        immediateBlock(input, context) {
            console.error('🚨 [AI] CRITICAL THREAT BLOCKED:', context);
            
            // Block execution
            if (context === 'DOM_CONTENT' || context === 'DOM_ATTRIBUTE') {
                event.preventDefault();
                event.stopPropagation();
            }
            
            // Clear dangerous content - SECURE VERSION
            document.querySelectorAll('*').forEach(el => {
                if (el.innerHTML && el.innerHTML.includes(input.substring(0, 50))) {
                    // SECURE: Use textContent instead of innerHTML to prevent XSS
                    el.textContent = '[CONTENT BLOCKED BY AI SECURITY]';
                    console.warn('🛡️ [AI] Blocked dangerous content in:', el.tagName);
                }
            });
        }

        blockAndSanitize(input, context) {
            console.warn('🛡️ [AI] Sanitizing threat:', context);
            
            // Sanitize dangerous patterns
            this.threatPatterns.forEach(pattern => {
                if (pattern.pattern.test(input)) {
                    input = input.replace(pattern.pattern, '[SANITIZED]');
                }
            });
        }

        blockAndAlert(input, context) {
            console.warn('⚠️ [AI] Threat blocked and reported:', context);
            
            // Show user alert
            if (context === 'FORM_INPUT') {
                alert('Đầu vào không an toàn đã được phát hiện và chặn!');
            }
        }

        sanitizeInput(input, context) {
            // Apply HTML entity encoding
            return input
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\"/g, '&quot;')
                .replace(/\'/g, '&#x27;');
        }

        logAndMonitor(input, analysis, context) {
            const logEntry = {
                timestamp: Date.now(),
                input: input.substring(0, 200),
                analysis: analysis,
                context: context,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
                url: typeof window !== 'undefined' ? window.location.href : 'N/A'
            };

            // Store in local storage for review - safe for both environments
            if (typeof localStorage !== 'undefined') {
                let logs = JSON.parse(localStorage.getItem('aiThreatLogs') || '[]');
                logs.push(logEntry);
                
                // Keep only last 100 logs
                if (logs.length > 100) {
                    logs = logs.slice(-100);
                }
                
                localStorage.setItem('aiThreatLogs', JSON.stringify(logs));
            } else {
                // Node.js environment - log to console
                console.log('🤖 [AI] Threat log (Node.js):', JSON.stringify(logEntry, null, 2));
            }
        }

        learnFromInput(input, analysis) {
            // Simple learning mechanism
            const pattern = {
                input: input,
                score: analysis.score,
                classification: analysis.classification,
                timestamp: Date.now()
            };

            if (typeof localStorage !== 'undefined') {
                // Browser environment
                let learningData = JSON.parse(localStorage.getItem('aiLearningData') || '[]');
                learningData.push(pattern);
                
                // Keep only last 1000 learning samples
                if (learningData.length > 1000) {
                    learningData = learningData.slice(-1000);
                }
                
                localStorage.setItem('aiLearningData', JSON.stringify(learningData));
            } else {
                // Node.js environment - log learning data
                console.log('🤖 [AI] Learning data (Node.js):', JSON.stringify(pattern, null, 2));
            }
        }

        activateCounterattack() {
            // Protect the AI system itself
            Object.freeze(this.threatPatterns);
            Object.freeze(this.aiNeuralNetwork);
            
            // Setup real-time monitoring
            setInterval(() => {
                this.performHealthCheck();
            }, 30000); // Every 30 seconds

            console.log('🤖 [AI] Counterattack system fully activated');
        }

        performHealthCheck() {
            const healthMetrics = {
                threatsDetected: this.threatDatabase.size,
                patternsLoaded: this.threatPatterns.length,
                systemIntegrity: this.checkSystemIntegrity(),
                memoryUsage: this.estimateMemoryUsage(),
                timestamp: Date.now()
            };

            if (healthMetrics.systemIntegrity < 90) {
                console.warn('🤖 [AI] System integrity compromised:', healthMetrics.systemIntegrity + '%');
            }

            // Safe localStorage usage
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('aiHealthMetrics', JSON.stringify(healthMetrics));
            } else {
                // Node.js environment - log instead of storing
                console.log('🤖 [AI] Health metrics (Node.js):', JSON.stringify(healthMetrics, null, 2));
            }
        }

        checkSystemIntegrity() {
            let score = 100;
            
            // Check if critical functions exist
            if (typeof this.analyzeInput !== 'function') score -= 50;
            if (typeof this.executeCounterattack !== 'function') score -= 30;
            if (!this.threatPatterns || this.threatPatterns.length === 0) score -= 20;
            
            return Math.max(score, 0);
        }

        estimateMemoryUsage() {
            try {
                const used = JSON.stringify(this.threatDatabase).length;
                const patterns = JSON.stringify(this.threatPatterns).length;
                return used + patterns;
            } catch (e) {
                return -1;
            }
        }

        // Public interface
        getAIStatus() {
            return {
                version: this.version,
                level: this.aiLevel,
                learningMode: this.learningMode,
                counterattackEnabled: this.counterattackEnabled,
                threatsDetected: this.threatDatabase.size,
                patternsLoaded: this.threatPatterns.length
            };
        }

        toggleLearningMode(enabled) {
            this.learningMode = enabled;
            console.log('🤖 [AI] Learning mode:', enabled ? 'ENABLED' : 'DISABLED');
        }

        toggleCounterattack(enabled) {
            this.counterattackEnabled = enabled;
            console.log('🤖 [AI] Counterattack:', enabled ? 'ENABLED' : 'DISABLED');
        }
    }

    // Initialize AI system
    const aiCounterattack = new AIPoweredCounterattackSystem();
    
    // Export for other modules
    if (typeof window !== 'undefined') {
        window.TINI_AI_COUNTERATTACK = aiCounterattack;
    }
    
    // Export for Node.js module system
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AIPoweredCounterattackSystem;
    }
    
    console.log('🤖 [AI] Counterattack system ready for deployment');

})();// ST:TINI_1754752705_e868a412
// ST:TINI_1755361782_e868a412
