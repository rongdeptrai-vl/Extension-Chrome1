// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * HARDWARE FINGERPRINTING SECURITY SYSTEM
 * Advanced device identification and validation system
 * Author: TINI Security Team
 * Version: 2.0 - Enterprise Grade
 */

const crypto = require('crypto');
const os = require('os');

// Hardware Fingerprinting System - Full Implementation
class HardwareFingerprintingSystem {
    constructor() {
        this.allowedHardware = new Set();
        this.suspiciousHardware = new Set();
        this.deviceRegistry = new Map();
        this.trustedDevices = new Map();
        this.blacklistedDevices = new Set();
        this.fingerprintCache = new Map();
        
        // Security thresholds
        this.maxSimilarityThreshold = 0.85;
        this.minFingerprintComplexity = 5;
        this.maxDevicesPerUser = 10;
        
        // Initialize with system defaults
        this.initializeDefaults();
    }

    initializeDefaults() {
        // Add current system to trusted devices
        const systemFingerprint = this.generateSystemFingerprint();
        this.trustedDevices.set(systemFingerprint, {
            deviceId: 'SYSTEM_DEFAULT',
            timestamp: Date.now(),
            userAgent: 'TINI_SYSTEM',
            trusted: true,
            riskLevel: 'LOW'
        });
        
        console.log('🔐 Hardware Fingerprinting System initialized');
        console.log(`📱 System fingerprint: ${systemFingerprint.substring(0, 16)}...`);
    }

    async validateRequest(req) {
        try {
            // Extract device information from request
            const deviceInfo = this.extractDeviceInfo(req);
            const fingerprint = this.generateFingerprint(deviceInfo);
            
            // Check if device is blacklisted
            if (this.blacklistedDevices.has(fingerprint)) {
                return {
                    allowed: false,
                    reason: 'BLACKLISTED_DEVICE',
                    details: 'Device has been flagged as suspicious',
                    fingerprint: fingerprint.substring(0, 16),
                    riskLevel: 'CRITICAL'
                };
            }
            
            // Check if device is trusted
            if (this.trustedDevices.has(fingerprint)) {
                const deviceData = this.trustedDevices.get(fingerprint);
                return {
                    allowed: true,
                    reason: 'TRUSTED_DEVICE',
                    details: `Known device: ${deviceData.deviceId}`,
                    fingerprint: fingerprint.substring(0, 16),
                    riskLevel: deviceData.riskLevel
                };
            }
            
            // Analyze device characteristics
            const analysis = await this.analyzeDevice(deviceInfo, fingerprint);
            
            // Check for suspicious patterns
            const suspiciousCheck = this.checkSuspiciousPatterns(deviceInfo);
            if (suspiciousCheck.isSuspicious) {
                this.addToSuspicious(fingerprint, suspiciousCheck.reason);
                return {
                    allowed: false,
                    reason: 'SUSPICIOUS_PATTERN',
                    details: suspiciousCheck.reason,
                    fingerprint: fingerprint.substring(0, 16),
                    riskLevel: 'HIGH'
                };
            }
            
            // Check device similarity (potential spoofing)
            const similarityCheck = this.checkDeviceSimilarity(fingerprint);
            if (similarityCheck.tooSimilar) {
                return {
                    allowed: false,
                    reason: 'POTENTIAL_SPOOFING',
                    details: `Device too similar to existing: ${similarityCheck.similarDevice}`,
                    fingerprint: fingerprint.substring(0, 16),
                    riskLevel: 'HIGH'
                };
            }
            
            // New device - requires validation
            if (analysis.isNewDevice) {
                return {
                    allowed: true, // Allow but flag for review
                    reason: 'NEW_DEVICE_PENDING',
                    details: 'New device detected - monitoring required',
                    fingerprint: fingerprint.substring(0, 16),
                    riskLevel: analysis.riskLevel,
                    requiresValidation: true
                };
            }
            
            return {
                allowed: true,
                reason: 'DEVICE_VALIDATED',
                details: 'Device passed all security checks',
                fingerprint: fingerprint.substring(0, 16),
                riskLevel: analysis.riskLevel
            };
            
        } catch (error) {
            console.error('❌ Hardware validation error:', error);
            return {
                allowed: false,
                reason: 'VALIDATION_ERROR',
                details: 'Unable to validate device hardware',
                fingerprint: null,
                riskLevel: 'UNKNOWN'
            };
        }
    }

    generateFingerprint(deviceInfo) {
        try {
            // Create comprehensive device fingerprint
            const fingerprintData = {
                // Hardware identifiers
                cpuCores: deviceInfo.cpuCores || os.cpus().length,
                totalMemory: deviceInfo.totalMemory || os.totalmem(),
                platform: deviceInfo.platform || os.platform(),
                arch: deviceInfo.arch || os.arch(),
                
                // Network and browser info
                userAgent: deviceInfo.userAgent || 'unknown',
                language: deviceInfo.language || 'en-US',
                timezone: deviceInfo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                screen: deviceInfo.screen || { width: 1920, height: 1080 },
                
                // Browser capabilities
                webgl: deviceInfo.webgl || 'unknown',
                canvas: deviceInfo.canvas || 'unknown',
                audio: deviceInfo.audio || 'unknown',
                
                // Additional identifiers
                plugins: deviceInfo.plugins || [],
                fonts: deviceInfo.fonts || [],
                
                // Security markers
                timestamp: Date.now(),
                version: '2.0'
            };
            
            // Generate hash with salt
            const salt = 'TINI_HARDWARE_SALT_2024';
            const dataString = JSON.stringify(fingerprintData, Object.keys(fingerprintData).sort());
            
            return crypto.createHash('sha256')
                .update(salt + dataString)
                .digest('hex');
                
        } catch (error) {
            console.error('❌ Fingerprint generation error:', error);
            // Fallback fingerprint
            return crypto.createHash('sha256')
                .update(JSON.stringify(deviceInfo) + Date.now())
                .digest('hex');
        }
    }

    generateSystemFingerprint() {
        const systemInfo = {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus().length,
            totalmem: os.totalmem(),
            userInfo: os.userInfo(),
            networkInterfaces: Object.keys(os.networkInterfaces())
        };
        
        return this.generateFingerprint(systemInfo);
    }

    extractDeviceInfo(req) {
        const headers = req.headers || {};
        
        return {
            userAgent: headers['user-agent'],
            acceptLanguage: headers['accept-language'],
            acceptEncoding: headers['accept-encoding'],
            connection: headers.connection,
            xForwardedFor: headers['x-forwarded-for'],
            xRealIp: headers['x-real-ip'],
            
            // Custom headers for fingerprinting
            cpuCores: headers['x-cpu-cores'],
            totalMemory: headers['x-total-memory'],
            screen: headers['x-screen-resolution'],
            timezone: headers['x-timezone'],
            webgl: headers['x-webgl-vendor'],
            canvas: headers['x-canvas-fingerprint'],
            
            // Request metadata
            ip: req.ip || req.connection?.remoteAddress,
            timestamp: Date.now()
        };
    }

    async analyzeDevice(deviceInfo, fingerprint) {
        const analysis = {
            isNewDevice: false,
            riskLevel: 'LOW',
            confidence: 0.9,
            characteristics: []
        };
        
        // Check if device exists in registry
        if (!this.deviceRegistry.has(fingerprint)) {
            analysis.isNewDevice = true;
            analysis.riskLevel = 'MEDIUM';
            
            // Register new device
            this.deviceRegistry.set(fingerprint, {
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                requestCount: 1,
                deviceInfo: deviceInfo
            });
        } else {
            // Update existing device
            const device = this.deviceRegistry.get(fingerprint);
            device.lastSeen = Date.now();
            device.requestCount++;
        }
        
        // Analyze device characteristics
        if (deviceInfo.userAgent) {
            if (this.isHeadlessBrowser(deviceInfo.userAgent)) {
                analysis.characteristics.push('HEADLESS_BROWSER');
                analysis.riskLevel = 'HIGH';
            }
            
            if (this.isAutomationTool(deviceInfo.userAgent)) {
                analysis.characteristics.push('AUTOMATION_TOOL');
                analysis.riskLevel = 'CRITICAL';
            }
        }
        
        // Check for virtual environment indicators
        if (this.isVirtualEnvironment(deviceInfo)) {
            analysis.characteristics.push('VIRTUAL_ENVIRONMENT');
            analysis.riskLevel = analysis.riskLevel === 'LOW' ? 'MEDIUM' : analysis.riskLevel;
        }
        
        return analysis;
    }

    checkSuspiciousPatterns(deviceInfo) {
        const suspicious = {
            isSuspicious: false,
            reason: null,
            confidence: 0
        };
        
        // Check for missing standard headers
        if (!deviceInfo.userAgent) {
            suspicious.isSuspicious = true;
            suspicious.reason = 'Missing User-Agent header';
            suspicious.confidence = 0.8;
            return suspicious;
        }
        
        // Check for unusual screen resolutions
        if (deviceInfo.screen) {
            const { width, height } = deviceInfo.screen;
            if (width < 100 || height < 100 || width > 10000 || height > 10000) {
                suspicious.isSuspicious = true;
                suspicious.reason = 'Unusual screen resolution detected';
                suspicious.confidence = 0.7;
                return suspicious;
            }
        }
        
        // Check for bot signatures
        const botPatterns = [
            /bot/i, /crawl/i, /spider/i, /scrape/i,
            /headless/i, /phantom/i, /selenium/i, /puppeteer/i
        ];
        
        if (deviceInfo.userAgent && botPatterns.some(pattern => pattern.test(deviceInfo.userAgent))) {
            suspicious.isSuspicious = true;
            suspicious.reason = 'Bot signature detected in User-Agent';
            suspicious.confidence = 0.9;
            return suspicious;
        }
        
        return suspicious;
    }

    checkDeviceSimilarity(fingerprint) {
        const result = {
            tooSimilar: false,
            similarDevice: null,
            similarity: 0
        };
        
        // Compare with existing fingerprints
        for (const [existingFingerprint, deviceData] of this.deviceRegistry.entries()) {
            if (existingFingerprint === fingerprint) continue;
            
            const similarity = this.calculateSimilarity(fingerprint, existingFingerprint);
            
            if (similarity > this.maxSimilarityThreshold) {
                result.tooSimilar = true;
                result.similarDevice = existingFingerprint.substring(0, 16);
                result.similarity = similarity;
                break;
            }
        }
        
        return result;
    }

    calculateSimilarity(fingerprint1, fingerprint2) {
        // Simple similarity calculation based on common characters
        let matches = 0;
        const length = Math.min(fingerprint1.length, fingerprint2.length);
        
        for (let i = 0; i < length; i++) {
            if (fingerprint1[i] === fingerprint2[i]) {
                matches++;
            }
        }
        
        return matches / length;
    }

    isHeadlessBrowser(userAgent) {
        const headlessPatterns = [
            /HeadlessChrome/i,
            /PhantomJS/i,
            /SlimerJS/i,
            /HtmlUnit/i
        ];
        
        return headlessPatterns.some(pattern => pattern.test(userAgent));
    }

    isAutomationTool(userAgent) {
        const automationPatterns = [
            /Selenium/i,
            /WebDriver/i,
            /Puppeteer/i,
            /Playwright/i,
            /ChromeDriver/i
        ];
        
        return automationPatterns.some(pattern => pattern.test(userAgent));
    }

    isVirtualEnvironment(deviceInfo) {
        // Check for VM indicators
        const vmIndicators = [
            'VirtualBox',
            'VMware',
            'QEMU',
            'Xen',
            'Hyper-V'
        ];
        
        const userAgent = deviceInfo.userAgent || '';
        return vmIndicators.some(indicator => userAgent.includes(indicator));
    }

    // Device management methods
    addToTrusted(fingerprint, deviceId, userAgent = 'unknown') {
        this.trustedDevices.set(fingerprint, {
            deviceId,
            timestamp: Date.now(),
            userAgent,
            trusted: true,
            riskLevel: 'LOW'
        });
        
        console.log(`✅ Device added to trusted: ${deviceId} (${fingerprint.substring(0, 16)}...)`);
    }

    addToSuspicious(fingerprint, reason) {
        this.suspiciousHardware.add(fingerprint);
        console.log(`⚠️ Device flagged as suspicious: ${fingerprint.substring(0, 16)}... - ${reason}`);
    }

    blacklistDevice(fingerprint, reason = 'Security violation') {
        this.blacklistedDevices.add(fingerprint);
        this.trustedDevices.delete(fingerprint);
        console.log(`🚫 Device blacklisted: ${fingerprint.substring(0, 16)}... - ${reason}`);
    }

    removeFromBlacklist(fingerprint) {
        this.blacklistedDevices.delete(fingerprint);
        console.log(`✅ Device removed from blacklist: ${fingerprint.substring(0, 16)}...`);
    }

    // Analytics and reporting
    getDeviceStats() {
        return {
            totalDevices: this.deviceRegistry.size,
            trustedDevices: this.trustedDevices.size,
            suspiciousDevices: this.suspiciousHardware.size,
            blacklistedDevices: this.blacklistedDevices.size,
            cacheSize: this.fingerprintCache.size
        };
    }

    getDeviceHistory(fingerprint) {
        return this.deviceRegistry.get(fingerprint) || null;
    }

    exportDeviceRegistry() {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            stats: this.getDeviceStats(),
            trustedDevices: Array.from(this.trustedDevices.entries()),
            suspiciousDevices: Array.from(this.suspiciousHardware),
            blacklistedDevices: Array.from(this.blacklistedDevices)
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    // Cleanup and maintenance
    cleanupOldDevices(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [fingerprint, deviceData] of this.deviceRegistry.entries()) {
            if (now - deviceData.lastSeen > maxAge) {
                this.deviceRegistry.delete(fingerprint);
                this.trustedDevices.delete(fingerprint);
                cleanedCount++;
            }
        }
        
        console.log(`🧹 Cleaned up ${cleanedCount} old device records`);
        return cleanedCount;
    }
}

module.exports = HardwareFingerprintingSystem;
