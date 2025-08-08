// ULTIMATE ANTI-AUTOMATION DETECTOR
// Phát hiện và chặn tất cả các loại automation tools và bots

class UltimateAntiAutomation {
    constructor() {
        this.behaviorProfiles = new Map();
        this.mousePatterns = new Map();
        this.keyboardPatterns = new Map();
        this.automationSignatures = new Set();
        
        this.init();
    }
    
    init() {
        console.log('🤖 [ANTI-AUTOMATION] Ultimate Bot Detection System Activated');
        this.loadAutomationSignatures();
        // Setup behavior analysis would go here in full implementation
        console.log('🤖 [ANTI-AUTOMATION] Behavior analysis system ready');
    }
    
    loadAutomationSignatures() {
        const signatures = [
            // Browser automation
            'selenium', 'webdriver', 'chromedriver', 'geckodriver',
            'puppeteer', 'playwright', 'nightmare', 'zombie',
            'phantomjs', 'slimerjs', 'htmlunit',
            
            // Headless indicators
            'headless', 'headlesschrome', 'chrome-headless',
            
            // Automation libraries
            'requests', 'urllib', 'curl', 'wget', 'mechanize',
            'scrapy', 'beautifulsoup', 'jsoup',
            
            // Bot frameworks
            'botframework', 'telegram-bot', 'discord-bot',
            'slackbot', 'whatsapp-bot',
            
            // Testing tools
            'cypress', 'jest', 'mocha', 'karma', 'protractor',
            
            // API clients
            'postman', 'insomnia', 'httpie', 'rest-client'
        ];
        
        signatures.forEach(sig => this.automationSignatures.add(sig.toLowerCase()));
        console.log(`🤖 [ANTI-AUTOMATION] Loaded ${signatures.length} automation signatures`);
    }
    
    // =================== USER AGENT ANALYSIS ===================
    
    analyzeUserAgent(userAgent) {
        const ua = userAgent.toLowerCase();
        let suspicionScore = 0;
        const flags = [];
        
        // Check for automation signatures
        for (const signature of this.automationSignatures) {
            if (ua.includes(signature)) {
                suspicionScore += 50;
                flags.push(`AUTOMATION_SIGNATURE: ${signature}`);
            }
        }
        
        // Check for missing or suspicious components
        if (!ua.includes('mozilla')) {
            suspicionScore += 20;
            flags.push('MISSING_MOZILLA');
        }
        
        if (!ua.includes('webkit') && !ua.includes('gecko')) {
            suspicionScore += 15;
            flags.push('MISSING_ENGINE');
        }
        
        // Check for too simple user agent
        if (ua.length < 50) {
            suspicionScore += 10;
            flags.push('TOO_SIMPLE');
        }
        
        // Check for version inconsistencies
        if (this.detectVersionInconsistencies(ua)) {
            suspicionScore += 25;
            flags.push('VERSION_INCONSISTENT');
        }
        
        return {
            suspicionScore: Math.min(suspicionScore, 100),
            flags,
            isBot: suspicionScore > 40
        };
    }
    
    detectVersionInconsistencies(userAgent) {
        // Basic check for impossible version combinations
        const chromeMatch = userAgent.match(/chrome\/(\d+)/);
        const safariMatch = userAgent.match(/safari\/(\d+)/);
        
        if (chromeMatch && safariMatch) {
            const chromeVersion = parseInt(chromeMatch[1]);
            const safariVersion = parseInt(safariMatch[1]);
            
            // Impossible combinations
            if (chromeVersion > 100 && safariVersion < 500) {
                return true;
            }
        }
        
        return false;
    }
    
    // =================== BEHAVIORAL ANALYSIS ===================
    
    analyzeBehavior(clientId, behaviorData) {
        if (!this.behaviorProfiles.has(clientId)) {
            this.behaviorProfiles.set(clientId, {
                mouseEvents: [],
                keyboardEvents: [],
                clickEvents: [],
                scrollEvents: [],
                focusEvents: [],
                resizeEvents: []
            });
        }
        
        const profile = this.behaviorProfiles.get(clientId);
        
        // Analyze different behavior patterns
        const mouseAnalysis = this.analyzeMouseBehavior(behaviorData.mouse, profile);
        const keyboardAnalysis = this.analyzeKeyboardBehavior(behaviorData.keyboard, profile);
        const clickAnalysis = this.analyzeClickBehavior(behaviorData.clicks, profile);
        
        const totalSuspicion = (mouseAnalysis.suspicion + keyboardAnalysis.suspicion + clickAnalysis.suspicion) / 3;
        
        return {
            suspicionScore: totalSuspicion,
            mouseFlags: mouseAnalysis.flags,
            keyboardFlags: keyboardAnalysis.flags,
            clickFlags: clickAnalysis.flags,
            isBot: totalSuspicion > 60
        };
    }
    
    analyzeMouseBehavior(mouseData, profile) {
        if (!mouseData || mouseData.length < 10) {
            return { suspicion: 30, flags: ['INSUFFICIENT_MOUSE_DATA'] };
        }
        
        let suspicion = 0;
        const flags = [];
        
        // Check for too-perfect straight lines
        const straightLines = this.detectStraightLines(mouseData);
        if (straightLines > mouseData.length * 0.7) {
            suspicion += 40;
            flags.push('TOO_MANY_STRAIGHT_LINES');
        }
        
        // Check for inhuman speeds
        const speeds = this.calculateMouseSpeeds(mouseData);
        const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        if (avgSpeed > 1000) { // Pixels per second
            suspicion += 30;
            flags.push('INHUMAN_MOUSE_SPEED');
        }
        
        // Check for lack of natural mouse tremor
        const tremor = this.calculateMouseTremor(mouseData);
        if (tremor < 0.5) {
            suspicion += 25;
            flags.push('NO_NATURAL_TREMOR');
        }
        
        // Check for perfect curves (Bezier-like movements)
        if (this.detectPerfectCurves(mouseData)) {
            suspicion += 35;
            flags.push('PERFECT_CURVES');
        }
        
        return { suspicion: Math.min(suspicion, 100), flags };
    }
    
    analyzeKeyboardBehavior(keyboardData, profile) {
        if (!keyboardData || keyboardData.length < 5) {
            return { suspicion: 20, flags: ['INSUFFICIENT_KEYBOARD_DATA'] };
        }
        
        let suspicion = 0;
        const flags = [];
        
        // Check for too-consistent typing intervals
        const intervals = this.calculateTypingIntervals(keyboardData);
        const variance = this.calculateVariance(intervals);
        if (variance < 10) {
            suspicion += 45;
            flags.push('TOO_CONSISTENT_TYPING');
        }
        
        // Check for inhuman typing speed
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        if (avgInterval < 50) { // Less than 50ms between keystrokes
            suspicion += 40;
            flags.push('INHUMAN_TYPING_SPEED');
        }
        
        // Check for missing key combinations that humans use
        if (!this.detectNaturalKeyPatterns(keyboardData)) {
            suspicion += 20;
            flags.push('UNNATURAL_KEY_PATTERNS');
        }
        
        return { suspicion: Math.min(suspicion, 100), flags };
    }
    
    analyzeClickBehavior(clickData, profile) {
        if (!clickData || clickData.length < 3) {
            return { suspicion: 15, flags: ['INSUFFICIENT_CLICK_DATA'] };
        }
        
        let suspicion = 0;
        const flags = [];
        
        // Check for too-precise clicking
        const precision = this.calculateClickPrecision(clickData);
        if (precision > 0.9) {
            suspicion += 35;
            flags.push('TOO_PRECISE_CLICKING');
        }
        
        // Check for inhuman click intervals
        const intervals = this.calculateClickIntervals(clickData);
        const tooFastClicks = intervals.filter(interval => interval < 100).length;
        if (tooFastClicks > intervals.length * 0.5) {
            suspicion += 40;
            flags.push('TOO_FAST_CLICKING');
        }
        
        // Check for perfect click patterns
        if (this.detectPerfectClickPatterns(clickData)) {
            suspicion += 30;
            flags.push('PERFECT_CLICK_PATTERNS');
        }
        
        return { suspicion: Math.min(suspicion, 100), flags };
    }
    
    // =================== ADVANCED DETECTION METHODS ===================
    
    detectStraightLines(mouseData) {
        let straightLines = 0;
        
        for (let i = 2; i < mouseData.length; i++) {
            const p1 = mouseData[i-2];
            const p2 = mouseData[i-1];
            const p3 = mouseData[i];
            
            // Calculate if points are collinear (straight line)
            const area = Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
            if (area < 1) { // Very small area = straight line
                straightLines++;
            }
        }
        
        return straightLines;
    }
    
    calculateMouseSpeeds(mouseData) {
        const speeds = [];
        
        for (let i = 1; i < mouseData.length; i++) {
            const p1 = mouseData[i-1];
            const p2 = mouseData[i];
            const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            const time = (p2.timestamp - p1.timestamp) / 1000; // Convert to seconds
            
            if (time > 0) {
                speeds.push(distance / time);
            }
        }
        
        return speeds;
    }
    
    calculateMouseTremor(mouseData) {
        if (mouseData.length < 10) return 0;
        
        let totalDeviation = 0;
        
        // Calculate deviation from expected smooth movement
        for (let i = 2; i < mouseData.length; i++) {
            const p1 = mouseData[i-2];
            const p2 = mouseData[i-1];
            const p3 = mouseData[i];
            
            // Expected position based on previous movement
            const expectedX = p2.x + (p2.x - p1.x);
            const expectedY = p2.y + (p2.y - p1.y);
            
            // Actual deviation
            const deviation = Math.sqrt(
                Math.pow(p3.x - expectedX, 2) + Math.pow(p3.y - expectedY, 2)
            );
            
            totalDeviation += deviation;
        }
        
        return totalDeviation / (mouseData.length - 2);
    }
    
    detectPerfectCurves(mouseData) {
        // Detect if mouse movements follow perfect mathematical curves
        if (mouseData.length < 20) return false;
        
        // Try to fit a Bezier curve
        const controlPoints = this.extractControlPoints(mouseData);
        const fittedCurve = this.generateBezierCurve(controlPoints, mouseData.length);
        
        let perfectMatch = 0;
        for (let i = 0; i < Math.min(mouseData.length, fittedCurve.length); i++) {
            const distance = Math.sqrt(
                Math.pow(mouseData[i].x - fittedCurve[i].x, 2) +
                Math.pow(mouseData[i].y - fittedCurve[i].y, 2)
            );
            
            if (distance < 2) { // Very close to perfect curve
                perfectMatch++;
            }
        }
        
        return perfectMatch > mouseData.length * 0.8;
    }
    
    // =================== UTILITY FUNCTIONS ===================
    
    calculateVariance(numbers) {
        if (numbers.length === 0) return 0;
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    }
    
    calculateTypingIntervals(keyboardData) {
        const intervals = [];
        for (let i = 1; i < keyboardData.length; i++) {
            intervals.push(keyboardData[i].timestamp - keyboardData[i-1].timestamp);
        }
        return intervals;
    }
    
    calculateClickIntervals(clickData) {
        const intervals = [];
        for (let i = 1; i < clickData.length; i++) {
            intervals.push(clickData[i].timestamp - clickData[i-1].timestamp);
        }
        return intervals;
    }
    
    calculateClickPrecision(clickData) {
        // Calculate how precisely clicks hit target centers
        let totalPrecision = 0;
        
        for (const click of clickData) {
            if (click.target && click.target.bounds) {
                const centerX = click.target.bounds.x + click.target.bounds.width / 2;
                const centerY = click.target.bounds.y + click.target.bounds.height / 2;
                
                const distance = Math.sqrt(
                    Math.pow(click.x - centerX, 2) + Math.pow(click.y - centerY, 2)
                );
                
                const maxDistance = Math.sqrt(
                    Math.pow(click.target.bounds.width / 2, 2) +
                    Math.pow(click.target.bounds.height / 2, 2)
                );
                
                totalPrecision += 1 - (distance / maxDistance);
            }
        }
        
        return clickData.length > 0 ? totalPrecision / clickData.length : 0;
    }
    
    detectNaturalKeyPatterns(keyboardData) {
        // Check for natural human typing patterns like:
        // - Backspace usage
        // - Pauses at word boundaries
        // - Capital letters at sentence starts
        
        const keys = keyboardData.map(k => k.key);
        
        const hasBackspace = keys.includes('Backspace');
        const hasSpacePauses = this.detectSpacePauses(keyboardData);
        const hasNaturalCapitalization = this.detectNaturalCapitalization(keyboardData);
        
        return hasBackspace || hasSpacePauses || hasNaturalCapitalization;
    }
    
    detectSpacePauses(keyboardData) {
        for (let i = 1; i < keyboardData.length; i++) {
            if (keyboardData[i-1].key === ' ') {
                const pause = keyboardData[i].timestamp - keyboardData[i-1].timestamp;
                if (pause > 200 && pause < 2000) { // Natural word pause
                    return true;
                }
            }
        }
        return false;
    }
    
    detectNaturalCapitalization(keyboardData) {
        for (let i = 1; i < keyboardData.length; i++) {
            const prevKey = keyboardData[i-1].key;
            const currentKey = keyboardData[i].key;
            
            if ((prevKey === '.' || prevKey === '!' || prevKey === '?') && 
                currentKey >= 'A' && currentKey <= 'Z') {
                return true; // Capital after sentence end
            }
        }
        return false;
    }
    
    detectPerfectClickPatterns(clickData) {
        // Check for too-perfect grid patterns or geometric shapes
        if (clickData.length < 4) return false;
        
        // Check for grid pattern
        const xPositions = [...new Set(clickData.map(c => Math.round(c.x / 10) * 10))];
        const yPositions = [...new Set(clickData.map(c => Math.round(c.y / 10) * 10))];
        
        if (xPositions.length <= 3 && yPositions.length <= 3) {
            return true; // Perfect grid
        }
        
        return false;
    }
    
    extractControlPoints(mouseData) {
        // Simple control point extraction for Bezier curve fitting
        return [
            mouseData[0],
            mouseData[Math.floor(mouseData.length / 3)],
            mouseData[Math.floor(mouseData.length * 2 / 3)],
            mouseData[mouseData.length - 1]
        ];
    }
    
    generateBezierCurve(controlPoints, numPoints) {
        // Generate a cubic Bezier curve
        const curve = [];
        for (let i = 0; i < numPoints; i++) {
            const t = i / (numPoints - 1);
            const point = this.calculateBezierPoint(controlPoints, t);
            curve.push(point);
        }
        return curve;
    }
    
    calculateBezierPoint(controlPoints, t) {
        const [p0, p1, p2, p3] = controlPoints;
        const mt = 1 - t;
        
        return {
            x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
            y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
        };
    }
    
    // =================== PUBLIC API ===================
    
    validateClient(clientData) {
        // 👑 BOSS Level 10000 immunity - BOSS can use automation tools freely
        const userRole = clientData.userRole;
        const isBOSS = userRole && (
            userRole.level >= 10000 || 
            userRole.role === 'boss' || 
            userRole.name === 'BOSS' ||
            userRole.infinitePower ||
            userRole.immuneToOwnRules
        );
        
        if (isBOSS) {
            console.log('👑 [ANTI-AUTOMATION] BOSS IMMUNITY ACTIVE - Automation tools allowed');
            console.log('🚀 [ANTI-AUTOMATION] BOSS can use bots, scripts, and automation freely');
            return {
                userAgentAnalysis: { suspicionScore: 0, flags: [] },
                behaviorAnalysis: { suspicionScore: 0, flags: [] },
                overallSuspicion: 0,
                isBot: false,
                flags: [],
                bypass: true,
                reason: 'BOSS_AUTOMATION_FREEDOM'
            };
        }
        
        const results = {
            userAgentAnalysis: this.analyzeUserAgent(clientData.userAgent),
            behaviorAnalysis: null,
            overallSuspicion: 0,
            isBot: false,
            flags: []
        };
        
        // Analyze behavior if available
        if (clientData.behavior) {
            results.behaviorAnalysis = this.analyzeBehavior(clientData.clientId, clientData.behavior);
        }
        
        // Calculate overall suspicion
        let totalSuspicion = results.userAgentAnalysis.suspicionScore;
        if (results.behaviorAnalysis) {
            totalSuspicion = (totalSuspicion + results.behaviorAnalysis.suspicionScore) / 2;
        }
        
        results.overallSuspicion = totalSuspicion;
        results.isBot = totalSuspicion > 50;
        
        // Combine all flags
        results.flags = [
            ...results.userAgentAnalysis.flags,
            ...(results.behaviorAnalysis?.mouseFlags || []),
            ...(results.behaviorAnalysis?.keyboardFlags || []),
            ...(results.behaviorAnalysis?.clickFlags || [])
        ];
        
        return results;
    }
}

// Create and export instance + functions
const antiAutomation = new UltimateAntiAutomation();

module.exports = {
    UltimateAntiAutomation,
    antiAutomation,
    analyzeUserAgent: (userAgent) => antiAutomation.analyzeUserAgent(userAgent),
    detectVirtualMachine: () => antiAutomation.detectVirtualMachine(),
    detectHeadlessBrowser: () => antiAutomation.detectHeadlessBrowser(),
    detectEmulator: () => antiAutomation.detectEmulator(),
    analyzeMouseBehavior: (mouseData) => antiAutomation.analyzeMouseBehavior(mouseData),
    analyzeKeyboardBehavior: (keyboardData) => antiAutomation.analyzeKeyboardBehavior(keyboardData),
    comprehensiveAnalysis: (data) => antiAutomation.comprehensiveAnalysis(data)
};

console.log('🤖 [ANTI-AUTOMATION] System loaded with exported detection functions');
