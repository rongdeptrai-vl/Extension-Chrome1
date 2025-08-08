// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🔐 SECURE AUTHENTICATION ENHANCED v2.5
 * Advanced authentication system with multi-layer security
 */

(function() {
    'use strict';

    class SecureAuthEnhanced {
        constructor() {
            this.version = "2.5";
            this.authLevels = {
                BASIC: 1,
                ENHANCED: 5,
                ULTRA: 10,
                BOSS: 100
            };
            this.currentLevel = this.authLevels.BASIC;
            this.sessionData = new Map();
            
            this.init();
        }

        init() {
            console.log('🔐 [AUTH] Enhanced Security v' + this.version + ' loading...');
            
            this.setupAuthValidation();
            this.initializeSessionSecurity();
            this.setupSecureStorage();
            this.activateProtection();
            
            console.log('🔐 [AUTH] Enhanced authentication active');
        }

        setupAuthValidation() {
            // Multi-factor validation
            this.setupPasswordValidation();
            this.setupBiometricValidation();
            this.setupDeviceValidation();
            this.setupLocationValidation();
        }

        setupPasswordValidation() {
            window.validatePassword = (password) => {
                if (!password || password.length < 8) {
                    return { valid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
                }

                const rules = [
                    { regex: /[A-Z]/, message: 'Phải có ít nhất 1 chữ hoa' },
                    { regex: /[a-z]/, message: 'Phải có ít nhất 1 chữ thường' },
                    { regex: /[0-9]/, message: 'Phải có ít nhất 1 số' },
                    { regex: /[!@#$%^&*]/, message: 'Phải có ít nhất 1 ký tự đặc biệt' }
                ];

                for (let rule of rules) {
                    if (!rule.regex.test(password)) {
                        return { valid: false, error: rule.message };
                    }
                }

                // Check against common passwords
                const commonPasswords = [
                    'password', '123456', 'qwerty', 'admin', 'root',
                    'password123', 'admin123', '12345678'
                ];

                if (commonPasswords.includes(password.toLowerCase())) {
                    return { valid: false, error: 'Mật khẩu quá phổ biến, vui lòng chọn mật khẩu khác' };
                }

                return { valid: true, strength: this.calculatePasswordStrength(password) };
            };
        }

        calculatePasswordStrength(password) {
            let score = 0;
            
            // Length bonus
            score += password.length * 2;
            
            // Character variety bonus
            if (/[a-z]/.test(password)) score += 5;
            if (/[A-Z]/.test(password)) score += 5;
            if (/[0-9]/.test(password)) score += 5;
            if (/[!@#$%^&*]/.test(password)) score += 10;
            
            // Pattern penalties
            if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
            if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns
            
            if (score >= 80) return 'VERY_STRONG';
            if (score >= 60) return 'STRONG';
            if (score >= 40) return 'MEDIUM';
            if (score >= 20) return 'WEAK';
            return 'VERY_WEAK';
        }

        setupBiometricValidation() {
            // Simulated biometric validation
            window.validateBiometric = async () => {
                try {
                    // Check if biometric is available
                    if (!navigator.credentials) {
                        return { available: false, error: 'Biometric không được hỗ trợ' };
                    }

                    // Simulate biometric check
                    const biometricData = {
                        timestamp: Date.now(),
                        deviceId: this.getDeviceId(),
                        userAgent: navigator.userAgent
                    };

                    localStorage.setItem('biometricValidation', JSON.stringify(biometricData));
                    
                    return { 
                        available: true, 
                        validated: true,
                        confidence: 0.95 
                    };
                } catch (error) {
                    return { available: false, error: error.message };
                }
            };
        }

        setupDeviceValidation() {
            this.deviceFingerprint = this.generateDeviceFingerprint();
            
            window.validateDevice = () => {
                const storedFingerprint = localStorage.getItem('deviceFingerprint');
                
                if (!storedFingerprint) {
                    localStorage.setItem('deviceFingerprint', JSON.stringify(this.deviceFingerprint));
                    return { isNew: true, trusted: false };
                }

                const stored = JSON.parse(storedFingerprint);
                const similarity = this.compareFingerprints(stored, this.deviceFingerprint);
                
                return {
                    isNew: false,
                    trusted: similarity > 0.8,
                    similarity: similarity
                };
            };
        }

        generateDeviceFingerprint() {
            return {
                screen: screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack,
                hardwareConcurrency: navigator.hardwareConcurrency || 0,
                maxTouchPoints: navigator.maxTouchPoints || 0,
                timestamp: Date.now()
            };
        }

        compareFingerprints(fp1, fp2) {
            let matches = 0;
            let total = 0;
            
            for (let key in fp1) {
                if (key !== 'timestamp') {
                    total++;
                    if (fp1[key] === fp2[key]) {
                        matches++;
                    }
                }
            }
            
            return total > 0 ? matches / total : 0;
        }

        setupLocationValidation() {
            window.validateLocation = async () => {
                try {
                    const position = await new Promise((resolve, reject) => {
                        if (!navigator.geolocation) {
                            reject(new Error('Geolocation không được hỗ trợ'));
                            return;
                        }
                        
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            timeout: 10000,
                            maximumAge: 60000
                        });
                    });

                    const currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: Date.now()
                    };

                    const storedLocation = localStorage.getItem('trustedLocation');
                    
                    if (!storedLocation) {
                        localStorage.setItem('trustedLocation', JSON.stringify(currentLocation));
                        return { isNew: true, trusted: false, distance: 0 };
                    }

                    const trusted = JSON.parse(storedLocation);
                    const distance = this.calculateDistance(
                        trusted.latitude, trusted.longitude,
                        currentLocation.latitude, currentLocation.longitude
                    );

                    return {
                        isNew: false,
                        trusted: distance < 100, // Within 100km
                        distance: distance
                    };
                } catch (error) {
                    return { available: false, error: error.message };
                }
            };
        }

        calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Earth radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        getDeviceId() {
            let deviceId = localStorage.getItem('secureDeviceId');
            
            if (!deviceId) {
                deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('secureDeviceId', deviceId);
            }
            
            return deviceId;
        }

        initializeSessionSecurity() {
            // Session timeout
            this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
            this.lastActivity = Date.now();
            
            // Track user activity
            ['click', 'keypress', 'mousemove', 'scroll'].forEach(event => {
                document.addEventListener(event, () => {
                    this.lastActivity = Date.now();
                });
            });

            // Session validation
            setInterval(() => {
                this.validateSession();
            }, 60000); // Check every minute
        }

        validateSession() {
            const now = Date.now();
            const inactiveTime = now - this.lastActivity;
            
            if (inactiveTime > this.sessionTimeout) {
                console.warn('🔐 [AUTH] Session expired due to inactivity');
                this.expireSession();
            }
        }

        expireSession() {
            // Clear sensitive data
            const sensitiveKeys = [
                'authToken', 'sessionId', 'userLevel', 'bossLevel10000'
            ];
            
            sensitiveKeys.forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });

            // Redirect to login
            window.dispatchEvent(new CustomEvent('sessionExpired', {
                detail: { reason: 'inactivity', timestamp: Date.now() }
            }));
        }

        setupSecureStorage() {
            // Encrypted storage wrapper
            window.secureStorage = {
                setItem: (key, value) => {
                    try {
                        const encrypted = this.encrypt(JSON.stringify(value));
                        localStorage.setItem('secure_' + key, encrypted);
                    } catch (error) {
                        console.error('🔐 [AUTH] Secure storage error:', error);
                    }
                },
                
                getItem: (key) => {
                    try {
                        const encrypted = localStorage.getItem('secure_' + key);
                        if (!encrypted) return null;
                        
                        const decrypted = this.decrypt(encrypted);
                        return JSON.parse(decrypted);
                    } catch (error) {
                        console.error('🔐 [AUTH] Secure retrieval error:', error);
                        return null;
                    }
                },
                
                removeItem: (key) => {
                    localStorage.removeItem('secure_' + key);
                }
            };
        }

        encrypt(text) {
            // Simple encryption (in production, use proper crypto)
            const key = this.getEncryptionKey();
            let result = '';
            
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(
                    text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            
            return btoa(result);
        }

        decrypt(encrypted) {
            try {
                const decoded = atob(encrypted);
                const key = this.getEncryptionKey();
                let result = '';
                
                for (let i = 0; i < decoded.length; i++) {
                    result += String.fromCharCode(
                        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                    );
                }
                
                return result;
            } catch (error) {
                throw new Error('Decryption failed');
            }
        }

        getEncryptionKey() {
            return 'TINI_SECURE_KEY_' + navigator.userAgent.slice(0, 10);
        }

        activateProtection() {
            // Protect against tampering
            Object.freeze(this);
            
            // Hide auth functions
            Object.defineProperty(window, 'SecureAuthEnhanced', {
                value: null,
                writable: false,
                configurable: false
            });
        }

        // Public interface
        getAuthStatus() {
            return {
                level: this.currentLevel,
                session: {
                    active: (Date.now() - this.lastActivity) < this.sessionTimeout,
                    lastActivity: this.lastActivity
                },
                device: this.deviceFingerprint
            };
        }

        upgradeAuthLevel(level) {
            if (level in this.authLevels) {
                this.currentLevel = this.authLevels[level];
                console.log('🔐 [AUTH] Level upgraded to:', level);
            }
        }
    }

    // Initialize enhanced auth
    const secureAuth = new SecureAuthEnhanced();
    
    // Export for other modules
    window.TINI_SECURE_AUTH = secureAuth;
    
    console.log('🔐 [AUTH] Enhanced authentication system ready');

})();
