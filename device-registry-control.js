// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Device Registry Control - Quản lý đăng ký thiết bị

class DeviceRegistryControl {
    constructor() {
        this.registeredDevices = new Map();
        this.deviceFingerprints = new Map();
        this.trustedDevices = new Set();
        this.suspiciousDevices = new Set();
        this.deviceHistory = new Map();
        this.deviceCapabilities = new Map();
        this.deviceGroups = new Map();
        this.deviceLocks = new Set();
        this.deviceVerificationQueue = [];
        
        this.initializeDeviceDetection();
        this.setupRegistrySystem();
        this.activateDeviceControl();
        
        console.log('📱 [Device Registry] Device Registry Control initialized');
    }

    initializeDeviceDetection() {
        console.log('🔍 [Device Registry] Initializing device detection...');
        
        // Get current device info
        this.currentDevice = this.generateDeviceFingerprint();
        
        // Load existing device registry
        this.loadDeviceRegistry();
        
        // Setup device monitoring
        this.setupDeviceMonitoring();
        
        // Initialize device capabilities detection
        this.detectDeviceCapabilities();
        
        console.log('✅ [Device Registry] Device detection initialized');
    }

    generateDeviceFingerprint() {
        const fingerprint = {
            id: this.generateDeviceId(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            hardwareConcurrency: navigator.hardwareConcurrency,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            webGL: this.getWebGLInfo(),
            canvas: this.getCanvasFingerprint(),
            audio: this.getAudioFingerprint(),
            fonts: this.getFontFingerprint(),
            plugins: this.getPluginFingerprint(),
            connection: this.getConnectionInfo(),
            performance: this.getPerformanceInfo(),
            battery: null, // Will be set async
            timestamp: Date.now(),
            ipAddress: null, // Will be detected
            location: null, // Will be detected if permitted
            installedApps: this.detectInstalledApps(),
            storageQuota: this.getStorageQuota()
        };
        
        // Generate unique hash
        fingerprint.hash = this.hashFingerprint(fingerprint);
        
        return fingerprint;
    }

    generateDeviceId() {
        // Try multiple methods to generate stable device ID
        const sources = [
            () => localStorage.getItem('device_id'),
            () => this.generateFromHardware(),
            () => this.generateFromBrowser(),
            () => this.generateRandom()
        ];
        
        for (const source of sources) {
            const id = source();
            if (id) {
                localStorage.setItem('device_id', id);
                return id;
            }
        }
        
        return this.generateRandom();
    }

    generateFromHardware() {
        const components = [
            screen.width,
            screen.height,
            screen.colorDepth,
            navigator.hardwareConcurrency || 0,
            navigator.maxTouchPoints || 0,
            navigator.platform,
            new Date().getTimezoneOffset()
        ];
        
        return 'hw_' + this.hashString(components.join('|'));
    }

    generateFromBrowser() {
        const components = [
            navigator.userAgent,
            navigator.language,
            navigator.cookieEnabled,
            navigator.doNotTrack || 'unspecified'
        ];
        
        return 'br_' + this.hashString(components.join('|'));
    }

    generateRandom() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = 'rnd_';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    getWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) return null;
            
            return {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                extensions: gl.getSupportedExtensions()
            };
        } catch (e) {
            return null;
        }
    }

    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Device fingerprint test', 2, 2);
            
            return canvas.toDataURL();
        } catch (e) {
            return null;
        }
    }

    getAudioFingerprint() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            return {
                sampleRate: audioContext.sampleRate,
                maxChannelCount: audioContext.destination.maxChannelCount,
                numberOfInputs: audioContext.destination.numberOfInputs,
                numberOfOutputs: audioContext.destination.numberOfOutputs,
                channelCount: audioContext.destination.channelCount
            };
        } catch (e) {
            return null;
        }
    }

    getFontFingerprint() {
        const testFonts = [
            'Arial', 'Times New Roman', 'Courier New', 'Helvetica', 'Georgia',
            'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS'
        ];
        
        const detectedFonts = [];
        
        for (const font of testFonts) {
            if (this.isFontAvailable(font)) {
                detectedFonts.push(font);
            }
        }
        
        return detectedFonts;
    }

    isFontAvailable(fontName) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const baseline = 'Arial';
        const testText = 'mmmmmmmmmmlli';
        
        context.font = '72px ' + baseline;
        const baselineWidth = context.measureText(testText).width;
        
        context.font = '72px ' + fontName + ', ' + baseline;
        const testWidth = context.measureText(testText).width;
        
        return testWidth !== baselineWidth;
    }

    getPluginFingerprint() {
        const plugins = [];
        
        for (let i = 0; i < navigator.plugins.length; i++) {
            const plugin = navigator.plugins[i];
            plugins.push({
                name: plugin.name,
                description: plugin.description,
                filename: plugin.filename,
                version: plugin.version
            });
        }
        
        return plugins;
    }

    getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (!connection) return null;
        
        return {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        };
    }

    getPerformanceInfo() {
        if (!performance) return null;
        
        return {
            timing: performance.timing ? {
                navigationStart: performance.timing.navigationStart,
                domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd,
                loadEventEnd: performance.timing.loadEventEnd
            } : null,
            memory: performance.memory ? {
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                usedJSHeapSize: performance.memory.usedJSHeapSize
            } : null
        };
    }

    detectInstalledApps() {
        // Detect commonly installed applications via protocol handlers
        const commonApps = [
            'skype:', 'spotify:', 'discord:', 'slack:', 'zoom:', 'teams:',
            'steam:', 'whatsapp:', 'telegram:', 'viber:', 'line:'
        ];
        
        const installedApps = [];
        
        for (const app of commonApps) {
            try {
                // This is a simplified detection method
                // Real detection would require more sophisticated techniques
                const supported = this.isProtocolSupported(app);
                if (supported) {
                    installedApps.push(app.replace(':', ''));
                }
            } catch (e) {
                // App not installed or detection failed
            }
        }
        
        return installedApps;
    }

    isProtocolSupported(protocol) {
        // Simplified protocol detection
        // In practice, this would use more sophisticated methods
        return false;
    }

    async getStorageQuota() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                return {
                    quota: estimate.quota,
                    usage: estimate.usage,
                    available: estimate.quota - estimate.usage
                };
            }
        } catch (e) {
            return null;
        }
    }

    hashFingerprint(fingerprint) {
        const str = JSON.stringify(fingerprint, Object.keys(fingerprint).sort());
        return this.hashString(str);
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    setupRegistrySystem() {
        console.log('📊 [Device Registry] Setting up registry system...');
        
        // Register current device
        this.registerDevice(this.currentDevice);
        
        // Setup device groups
        this.initializeDeviceGroups();
        
        // Setup verification queue processing
        this.setupVerificationQueue();
        
        // Setup device trust system
        this.setupDeviceTrustSystem();
        
        console.log('✅ [Device Registry] Registry system setup complete');
    }

    registerDevice(deviceInfo) {
        console.log(`📝 [Device Registry] Registering device: ${deviceInfo.id}`);
        
        const registrationData = {
            ...deviceInfo,
            registeredAt: Date.now(),
            lastSeen: Date.now(),
            sessionCount: 1,
            trustLevel: 'unknown',
            verificationStatus: 'pending',
            capabilities: this.detectDeviceCapabilities(deviceInfo),
            riskScore: this.calculateDeviceRiskScore(deviceInfo),
            group: this.assignDeviceGroup(deviceInfo)
        };
        
        // Store in registry
        this.registeredDevices.set(deviceInfo.id, registrationData);
        this.deviceFingerprints.set(deviceInfo.hash, deviceInfo.id);
        
        // Add to verification queue
        this.deviceVerificationQueue.push(deviceInfo.id);
        
        // Store in persistent storage
        this.saveDeviceRegistry();
        
        console.log(`✅ [Device Registry] Device registered with ID: ${deviceInfo.id}`);
        
        return registrationData;
    }

    detectDeviceCapabilities(deviceInfo) {
        const capabilities = {
            storage: this.detectStorageCapabilities(),
            crypto: this.detectCryptoCapabilities(),
            network: this.detectNetworkCapabilities(),
            biometric: this.detectBiometricCapabilities(),
            security: this.detectSecurityCapabilities(),
            performance: this.detectPerformanceLevel(deviceInfo),
            features: this.detectSpecialFeatures(deviceInfo)
        };
        
        this.deviceCapabilities.set(deviceInfo.id, capabilities);
        return capabilities;
    }

    detectStorageCapabilities() {
        return {
            localStorage: typeof localStorage !== 'undefined',
            sessionStorage: typeof sessionStorage !== 'undefined',
            indexedDB: typeof indexedDB !== 'undefined',
            webSQL: typeof openDatabase !== 'undefined',
            cookies: navigator.cookieEnabled,
            cacheStorage: 'caches' in window,
            persistent: 'storage' in navigator && 'persist' in navigator.storage
        };
    }

    detectCryptoCapabilities() {
        return {
            subtle: 'crypto' in window && 'subtle' in crypto,
            random: 'crypto' in window && 'getRandomValues' in crypto,
            webAuthn: 'credentials' in navigator,
            algorithms: this.detectCryptoAlgorithms()
        };
    }

    detectCryptoAlgorithms() {
        // This would test for supported crypto algorithms
        return {
            aes: true,
            rsa: true,
            ecdsa: true,
            sha256: true,
            pbkdf2: true
        };
    }

    detectNetworkCapabilities() {
        return {
            online: navigator.onLine,
            connection: !!navigator.connection,
            serviceWorker: 'serviceWorker' in navigator,
            webSocket: 'WebSocket' in window,
            webRTC: 'RTCPeerConnection' in window,
            fetch: 'fetch' in window,
            cors: true // Assume CORS is supported
        };
    }

    detectBiometricCapabilities() {
        return {
            webAuthn: 'credentials' in navigator && 'create' in navigator.credentials,
            touchID: 'TouchID' in window, // iOS specific
            faceID: 'FaceID' in window, // iOS specific
            fingerprint: this.detectFingerprintSupport(),
            voice: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
        };
    }

    detectFingerprintSupport() {
        // Detect fingerprint reader support
        return navigator.userAgent.includes('Mobile') && 
               (navigator.userAgent.includes('Android') || navigator.userAgent.includes('iPhone'));
    }

    detectSecurityCapabilities() {
        return {
            contentSecurityPolicy: this.detectCSPSupport(),
            strictTransportSecurity: true,
            mixedContent: this.detectMixedContentSupport(),
            permissions: 'permissions' in navigator,
            secureContext: window.isSecureContext,
            origin: window.location.protocol === 'https:'
        };
    }

    detectCSPSupport() {
        // Detect Content Security Policy support
        return document.createElement('div').style.contentSecurityPolicy !== undefined;
    }

    detectMixedContentSupport() {
        // Detect mixed content restrictions
        return window.location.protocol === 'https:';
    }

    detectPerformanceLevel(deviceInfo) {
        const performanceScore = this.calculatePerformanceScore(deviceInfo);
        
        if (performanceScore >= 8) return 'high';
        if (performanceScore >= 5) return 'medium';
        return 'low';
    }

    calculatePerformanceScore(deviceInfo) {
        let score = 0;
        
        // Hardware concurrency
        const cores = deviceInfo.hardwareConcurrency || 1;
        score += Math.min(cores / 2, 3);
        
        // Memory
        if (deviceInfo.performance?.memory) {
            const memoryGB = deviceInfo.performance.memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
            score += Math.min(memoryGB, 3);
        }
        
        // Screen resolution
        const pixels = deviceInfo.screen.width * deviceInfo.screen.height;
        if (pixels > 2000000) score += 2; // 2M+ pixels
        else if (pixels > 1000000) score += 1; // 1M+ pixels
        
        return Math.min(score, 10);
    }

    detectSpecialFeatures(deviceInfo) {
        return {
            mobile: this.isMobileDevice(deviceInfo),
            tablet: this.isTabletDevice(deviceInfo),
            desktop: this.isDesktopDevice(deviceInfo),
            chromium: deviceInfo.userAgent.includes('Chrome'),
            webkit: deviceInfo.userAgent.includes('WebKit'),
            gecko: deviceInfo.userAgent.includes('Gecko'),
            touch: deviceInfo.maxTouchPoints > 0,
            retina: deviceInfo.screen.pixelDepth > 24
        };
    }

    isMobileDevice(deviceInfo) {
        return /Mobile|Android|iPhone|iPad/.test(deviceInfo.userAgent);
    }

    isTabletDevice(deviceInfo) {
        return /iPad|Tablet/.test(deviceInfo.userAgent) || 
               (deviceInfo.maxTouchPoints > 0 && deviceInfo.screen.width >= 768);
    }

    isDesktopDevice(deviceInfo) {
        return !this.isMobileDevice(deviceInfo) && !this.isTabletDevice(deviceInfo);
    }

    calculateDeviceRiskScore(deviceInfo) {
        let riskScore = 0;
        
        // Unknown or suspicious user agent
        if (!deviceInfo.userAgent || deviceInfo.userAgent.length < 50) {
            riskScore += 3;
        }
        
        // No cookies enabled
        if (!deviceInfo.cookiesEnabled) {
            riskScore += 2;
        }
        
        // Do not track enabled (privacy focused but could be hiding)
        if (deviceInfo.doNotTrack === '1') {
            riskScore += 1;
        }
        
        // Very old or very new browser
        const browserVersion = this.extractBrowserVersion(deviceInfo.userAgent);
        if (browserVersion && (browserVersion < 80 || browserVersion > 120)) {
            riskScore += 2;
        }
        
        // Unusual screen resolution
        const commonResolutions = [
            {w: 1920, h: 1080}, {w: 1366, h: 768}, {w: 1536, h: 864},
            {w: 1440, h: 900}, {w: 1280, h: 720}, {w: 375, h: 667}
        ];
        
        const isCommonResolution = commonResolutions.some(res => 
            Math.abs(res.w - deviceInfo.screen.width) < 50 && 
            Math.abs(res.h - deviceInfo.screen.height) < 50
        );
        
        if (!isCommonResolution) {
            riskScore += 1;
        }
        
        return Math.min(riskScore, 10);
    }

    extractBrowserVersion(userAgent) {
        const match = userAgent.match(/Chrome\/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    assignDeviceGroup(deviceInfo) {
        // Assign device to appropriate group
        if (this.isMobileDevice(deviceInfo)) {
            return 'mobile';
        } else if (this.isTabletDevice(deviceInfo)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    initializeDeviceGroups() {
        this.deviceGroups.set('mobile', {
            name: 'Mobile Devices',
            devices: new Set(),
            capabilities: ['touch', 'location', 'camera', 'accelerometer'],
            restrictions: ['limited_storage', 'battery_dependent'],
            securityLevel: 'standard'
        });
        
        this.deviceGroups.set('tablet', {
            name: 'Tablet Devices',
            devices: new Set(),
            capabilities: ['touch', 'location', 'camera', 'large_screen'],
            restrictions: ['battery_dependent'],
            securityLevel: 'enhanced'
        });
        
        this.deviceGroups.set('desktop', {
            name: 'Desktop Devices',
            devices: new Set(),
            capabilities: ['keyboard', 'mouse', 'unlimited_storage', 'high_performance'],
            restrictions: [],
            securityLevel: 'maximum'
        });
        
        this.deviceGroups.set('trusted', {
            name: 'Trusted Devices',
            devices: new Set(),
            capabilities: ['all'],
            restrictions: [],
            securityLevel: 'maximum'
        });
        
        this.deviceGroups.set('suspicious', {
            name: 'Suspicious Devices',
            devices: new Set(),
            capabilities: ['limited'],
            restrictions: ['restricted_access', 'enhanced_monitoring'],
            securityLevel: 'restricted'
        });
    }

    setupVerificationQueue() {
        // Process verification queue periodically
        setInterval(() => {
            this.processVerificationQueue();
        }, 30000); // Every 30 seconds
    }

    processVerificationQueue() {
        if (this.deviceVerificationQueue.length === 0) return;
        
        console.log(`🔍 [Device Registry] Processing ${this.deviceVerificationQueue.length} devices in verification queue`);
        
        const deviceId = this.deviceVerificationQueue.shift();
        this.verifyDevice(deviceId);
    }

    async verifyDevice(deviceId) {
        const device = this.registeredDevices.get(deviceId);
        if (!device) return;
        
        console.log(`✅ [Device Registry] Verifying device: ${deviceId}`);
        
        // Perform various verification checks
        const verificationResults = {
            consistencyCheck: this.performConsistencyCheck(device),
            behaviorAnalysis: await this.analyzeBehaviorPattern(device),
            securityScan: this.performSecurityScan(device),
            capabilityVerification: this.verifyCapabilities(device),
            riskAssessment: this.assessRisk(device)
        };
        
        // Calculate overall verification score
        const verificationScore = this.calculateVerificationScore(verificationResults);
        
        // Update device status
        device.verificationStatus = verificationScore >= 7 ? 'verified' : 
                                  verificationScore >= 4 ? 'partial' : 'failed';
        device.verificationScore = verificationScore;
        device.verificationResults = verificationResults;
        device.lastVerified = Date.now();
        
        // Update trust level
        this.updateDeviceTrustLevel(deviceId, verificationScore);
        
        console.log(`📊 [Device Registry] Device ${deviceId} verification complete - Score: ${verificationScore}/10`);
    }

    performConsistencyCheck(device) {
        // Check for consistency in device fingerprint
        let score = 10;
        
        // Check if device properties are logical
        if (device.screen.width > 10000 || device.screen.height > 10000) {
            score -= 3; // Unrealistic screen size
        }
        
        if (device.hardwareConcurrency > 64) {
            score -= 2; // Too many cores
        }
        
        if (device.languages && device.languages.length === 0) {
            score -= 1; // No languages
        }
        
        return Math.max(score, 0);
    }

    async analyzeBehaviorPattern(device) {
        // Analyze device behavior patterns
        const history = this.deviceHistory.get(device.id) || [];
        
        let score = 5; // Neutral score
        
        // Check session frequency
        const avgSessionGap = this.calculateAverageSessionGap(history);
        if (avgSessionGap > 0 && avgSessionGap < 86400000) { // Less than 24 hours
            score += 2; // Regular usage pattern
        }
        
        // Check consistency in access times
        const timeConsistency = this.checkTimeConsistency(history);
        if (timeConsistency > 0.7) {
            score += 1; // Consistent timing
        }
        
        return Math.max(Math.min(score, 10), 0);
    }

    performSecurityScan(device) {
        let score = 8; // Start with good score
        
        // Check for security red flags
        if (device.riskScore > 5) {
            score -= device.riskScore / 2;
        }
        
        // Check for secure context
        if (!device.secureContext) {
            score -= 2;
        }
        
        // Check for privacy indicators
        if (device.doNotTrack === '1') {
            score += 1; // Privacy conscious
        }
        
        return Math.max(Math.min(score, 10), 0);
    }

    verifyCapabilities(device) {
        const capabilities = device.capabilities || {};
        let score = 0;
        
        // Verify claimed capabilities
        if (capabilities.storage?.localStorage) score += 1;
        if (capabilities.crypto?.subtle) score += 1;
        if (capabilities.network?.webSocket) score += 1;
        if (capabilities.security?.secureContext) score += 2;
        
        return Math.min(score, 10);
    }

    assessRisk(device) {
        return Math.max(10 - device.riskScore, 0);
    }

    calculateVerificationScore(results) {
        const weights = {
            consistencyCheck: 0.3,
            behaviorAnalysis: 0.2,
            securityScan: 0.25,
            capabilityVerification: 0.15,
            riskAssessment: 0.1
        };
        
        let totalScore = 0;
        for (const [category, score] of Object.entries(results)) {
            totalScore += score * weights[category];
        }
        
        return Math.round(totalScore);
    }

    updateDeviceTrustLevel(deviceId, verificationScore) {
        const device = this.registeredDevices.get(deviceId);
        if (!device) return;
        
        const oldTrustLevel = device.trustLevel;
        
        if (verificationScore >= 8) {
            device.trustLevel = 'high';
            this.trustedDevices.add(deviceId);
            this.suspiciousDevices.delete(deviceId);
        } else if (verificationScore >= 5) {
            device.trustLevel = 'medium';
            this.trustedDevices.delete(deviceId);
            this.suspiciousDevices.delete(deviceId);
        } else {
            device.trustLevel = 'low';
            this.trustedDevices.delete(deviceId);
            this.suspiciousDevices.add(deviceId);
        }
        
        if (oldTrustLevel !== device.trustLevel) {
            console.log(`🔄 [Device Registry] Device ${deviceId} trust level changed: ${oldTrustLevel} → ${device.trustLevel}`);
        }
        
        this.saveDeviceRegistry();
    }

    setupDeviceTrustSystem() {
        // Monitor device behavior for trust updates
        setInterval(() => {
            this.updateDeviceTrustScores();
        }, 300000); // Every 5 minutes
    }

    updateDeviceTrustScores() {
        for (const [deviceId, device] of this.registeredDevices) {
            // Update based on recent activity
            const recentActivity = this.getRecentActivity(deviceId);
            if (recentActivity.suspicious) {
                device.trustLevel = 'low';
                this.suspiciousDevices.add(deviceId);
            }
        }
    }

    getRecentActivity(deviceId) {
        // Placeholder for activity monitoring
        return { suspicious: false };
    }

    activateDeviceControl() {
        console.log('⚡ [Device Registry] Activating device control...');
        
        // Setup device monitoring
        this.setupDeviceMonitoring();
        
        // Setup automatic device updates
        this.setupAutomaticUpdates();
        
        // Setup device sync
        this.setupDeviceSync();
        
        console.log('✅ [Device Registry] Device control fully activated');
    }

    setupDeviceMonitoring() {
        // Monitor for device changes
        addEventListener('beforeunload', () => {
            this.updateDeviceActivity();
        });
        
        addEventListener('focus', () => {
            this.recordDeviceInteraction('focus');
        });
        
        addEventListener('blur', () => {
            this.recordDeviceInteraction('blur');
        });
    }

    updateDeviceActivity() {
        const device = this.registeredDevices.get(this.currentDevice.id);
        if (device) {
            device.lastSeen = Date.now();
            device.sessionCount = (device.sessionCount || 0) + 1;
            this.saveDeviceRegistry();
        }
    }

    recordDeviceInteraction(type) {
        const deviceId = this.currentDevice.id;
        const history = this.deviceHistory.get(deviceId) || [];
        
        history.push({
            timestamp: Date.now(),
            type,
            url: window.location.href
        });
        
        // Keep only last 100 interactions
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        this.deviceHistory.set(deviceId, history);
    }

    setupAutomaticUpdates() {
        // Automatically update device info periodically
        setInterval(() => {
            this.updateCurrentDevice();
        }, 60000); // Every minute
    }

    updateCurrentDevice() {
        const updatedFingerprint = this.generateDeviceFingerprint();
        
        // Check if significant changes occurred
        if (this.hasSignificantChanges(this.currentDevice, updatedFingerprint)) {
            console.log('🔄 [Device Registry] Significant device changes detected, updating registration');
            this.currentDevice = updatedFingerprint;
            this.registerDevice(this.currentDevice);
        } else {
            // Update last seen
            this.updateDeviceActivity();
        }
    }

    hasSignificantChanges(oldDevice, newDevice) {
        const significantFields = ['userAgent', 'screen', 'language'];
        
        for (const field of significantFields) {
            if (JSON.stringify(oldDevice[field]) !== JSON.stringify(newDevice[field])) {
                return true;
            }
        }
        
        return false;
    }

    setupDeviceSync() {
        // Sync device registry with server if available
        if (window.TINI_PHANTOM_PERSISTENCE) {
            setInterval(() => {
                this.syncDeviceRegistry();
            }, 300000); // Every 5 minutes
        }
    }

    async syncDeviceRegistry() {
        try {
            const registryData = {
                devices: Object.fromEntries(this.registeredDevices),
                fingerprints: Object.fromEntries(this.deviceFingerprints),
                trustedDevices: Array.from(this.trustedDevices),
                suspiciousDevices: Array.from(this.suspiciousDevices),
                lastSync: Date.now()
            };
            
            await window.TINI_PHANTOM_PERSISTENCE.persistData('device_registry', 'registry_data', registryData);
            console.log('☁️ [Device Registry] Registry synced to phantom storage');
        } catch (error) {
            console.warn('⚠️ [Device Registry] Failed to sync registry:', error);
        }
    }

    loadDeviceRegistry() {
        try {
            const stored = localStorage.getItem('device_registry');
            if (stored) {
                const data = JSON.parse(stored);
                
                if (data.devices) {
                    this.registeredDevices = new Map(Object.entries(data.devices));
                }
                if (data.fingerprints) {
                    this.deviceFingerprints = new Map(Object.entries(data.fingerprints));
                }
                if (data.trustedDevices) {
                    this.trustedDevices = new Set(data.trustedDevices);
                }
                if (data.suspiciousDevices) {
                    this.suspiciousDevices = new Set(data.suspiciousDevices);
                }
                
                console.log(`📂 [Device Registry] Loaded ${this.registeredDevices.size} devices from storage`);
            }
        } catch (error) {
            console.warn('⚠️ [Device Registry] Failed to load registry:', error);
        }
    }

    saveDeviceRegistry() {
        try {
            const data = {
                devices: Object.fromEntries(this.registeredDevices),
                fingerprints: Object.fromEntries(this.deviceFingerprints),
                trustedDevices: Array.from(this.trustedDevices),
                suspiciousDevices: Array.from(this.suspiciousDevices),
                lastSaved: Date.now()
            };
            
            localStorage.setItem('device_registry', JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ [Device Registry] Failed to save registry:', error);
        }
    }

    calculateAverageSessionGap(history) {
        if (history.length < 2) return 0;
        
        let totalGap = 0;
        for (let i = 1; i < history.length; i++) {
            totalGap += history[i].timestamp - history[i-1].timestamp;
        }
        
        return totalGap / (history.length - 1);
    }

    checkTimeConsistency(history) {
        if (history.length < 3) return 0;
        
        const hours = history.map(h => new Date(h.timestamp).getHours());
        const hourCounts = {};
        
        hours.forEach(hour => {
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        
        const maxCount = Math.max(...Object.values(hourCounts));
        return maxCount / hours.length;
    }

    getDeviceInfo(deviceId) {
        return this.registeredDevices.get(deviceId);
    }

    getCurrentDevice() {
        return this.currentDevice;
    }

    isDeviceTrusted(deviceId) {
        return this.trustedDevices.has(deviceId);
    }

    isDeviceSuspicious(deviceId) {
        return this.suspiciousDevices.has(deviceId);
    }

    lockDevice(deviceId, reason) {
        this.deviceLocks.add(deviceId);
        console.log(`🔒 [Device Registry] Device ${deviceId} locked: ${reason}`);
    }

    unlockDevice(deviceId) {
        this.deviceLocks.delete(deviceId);
        console.log(`🔓 [Device Registry] Device ${deviceId} unlocked`);
    }

    isDeviceLocked(deviceId) {
        return this.deviceLocks.has(deviceId);
    }

    getStatus() {
        return {
            registeredDevices: this.registeredDevices.size,
            trustedDevices: this.trustedDevices.size,
            suspiciousDevices: this.suspiciousDevices.size,
            lockedDevices: this.deviceLocks.size,
            verificationQueue: this.deviceVerificationQueue.length,
            currentDevice: this.currentDevice.id,
            healthy: true
        };
    }
}

// Tạo global instance
if (!window.TINI_DEVICE_REGISTRY) {
    window.TINI_DEVICE_REGISTRY = new DeviceRegistryControl();
    console.log('✅ [Device Registry] Global device registry control created');
}

console.log('📱 [Device Registry] Device Registry Control ready - comprehensive device management enabled');
