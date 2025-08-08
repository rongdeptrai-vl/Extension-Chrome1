// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🛡️ TINI LIFE GUARDIAN - Advanced Life & Privacy Protection
 * Bảo vệ toàn diện cuộc sống số và quyền riêng tư người dùng
 * Features: Privacy protection, life monitoring, digital wellness
 */

class TiniLifeGuardian {
    constructor() {
        this.version = "3.0";
        this.name = "TINI Life Guardian";
        this.initialized = false;
        this.protectionStats = {
            privacy: 0,
            wellness: 0,
            security: 0,
            blocked: 0
        };
        
        // Privacy invasive elements
        this.privacyThreats = [
            // Fingerprinting scripts
            'script[src*="fingerprint"]',
            'script[src*="tracking"]',
            'script[src*="analytics"]',
            
            // Social media trackers
            '[data-track]',
            '[data-analytics]',
            '.fb-like',
            '.twitter-share',
            
            // Cookie banners (aggressive ones)
            '.cookie-banner',
            '.gdpr-banner',
            '.privacy-notice',
            
            // Newsletter pop-ups
            '.newsletter-popup',
            '.email-signup',
            
            // Push notification requests
            '.notification-request',
            '.push-notification'
        ];
        
        // Digital wellness threats
        this.wellnessThreats = [
            // Infinite scroll containers
            '.infinite-scroll',
            '.endless-feed',
            
            // Auto-play videos
            'video[autoplay]',
            'iframe[src*="autoplay"]',
            
            // Distraction elements
            '.sidebar-ads',
            '.recommended-content',
            '.related-content',
            
            // Time-wasting widgets
            '.viral-content',
            '.trending-now',
            '.you-might-like'
        ];
        
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        console.log(`🛡️ ${this.name} v${this.version} initializing...`);
        
        // Privacy protection
        this.enablePrivacyProtection();
        
        // Digital wellness
        this.enableDigitalWellness();
        
        // Security hardening
        this.enableSecurityHardening();
        
        // Life monitoring
        this.startLifeMonitoring();
        
        this.initialized = true;
        console.log(`✅ ${this.name} v${this.version} protecting your digital life!`);
    }
    
    enablePrivacyProtection() {
        console.log('🔒 Enabling privacy protection...');
        
        // Block privacy invasive elements
        this.privacyThreats.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.remove();
                    this.protectionStats.privacy++;
                });
            } catch (error) {
                // Ignore selector errors
            }
        });
        
        // Disable tracking APIs
        this.disableTrackingAPIs();
        
        // Clean local storage from tracking data
        this.cleanTrackingData();
        
        // Block fingerprinting
        this.blockFingerprinting();
    }
    
    disableTrackingAPIs() {
        // Disable geolocation tracking
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition = function(success, error) {
                if (error) error({ code: 1, message: "Blocked by TINI Life Guardian" });
            };
        }
        
        // Disable battery API (used for fingerprinting)
        if (navigator.getBattery) {
            navigator.getBattery = () => Promise.reject('Blocked by TINI Life Guardian');
        }
        
        // Disable device motion/orientation
        window.DeviceMotionEvent = undefined;
        window.DeviceOrientationEvent = undefined;
        
        // Block canvas fingerprinting
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function() {
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        };
        
        console.log('🚫 Tracking APIs disabled');
    }
    
    cleanTrackingData() {
        // Remove tracking cookies
        const trackingCookies = [
            '_ga', '_gid', '_gat', '_fbp', '_fbc', 'fr', 'sb', 'wd'
        ];
        
        trackingCookies.forEach(cookie => {
            document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        
        // Clean localStorage
        const trackingKeys = Object.keys(localStorage).filter(key => 
            key.includes('tracking') || 
            key.includes('analytics') || 
            key.includes('facebook') ||
            key.includes('google')
        );
        
        trackingKeys.forEach(key => localStorage.removeItem(key));
        
        console.log('🧹 Cleaned tracking data');
    }
    
    blockFingerprinting() {
        // Spoof common fingerprinting vectors
        try {
            Object.defineProperty(navigator, 'userAgent', {
                get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                configurable: false
            });
            Object.defineProperty(navigator, 'language', {
                get: () => 'en-US',
                configurable: false
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
                configurable: false
            });
            Object.defineProperty(screen, 'width', {
                get: () => 1920,
                configurable: false
            });
            Object.defineProperty(screen, 'height', {
                get: () => 1080,
                configurable: false
            });
            console.log('🎭 Fingerprinting protection active');
        } catch (e) {
            console.warn('🎭 Fingerprinting protection limited by browser security:', e);
        }
    }
    
    enableDigitalWellness() {
        console.log('🌱 Enabling digital wellness protection...');
        
        // Remove time-wasting elements
        this.wellnessThreats.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.style.display = 'none';
                    this.protectionStats.wellness++;
                });
            } catch (error) {
                // Ignore selector errors
            }
        });
        
        // Disable auto-play videos
        this.disableAutoplay();
        
        // Add focus mode
        this.enableFocusMode();
        
        // Time management
        this.enableTimeManagement();
    }
    
    disableAutoplay() {
        // Disable video autoplay
        const videos = document.querySelectorAll('video[autoplay]');
        videos.forEach(video => {
            video.removeAttribute('autoplay');
            video.pause();
        });
        
        // Block autoplay in iframes
        const autoplayIframes = document.querySelectorAll('iframe[src*="autoplay"]');
        autoplayIframes.forEach(iframe => {
            const src = iframe.src.replace(/autoplay=1|autoplay=true/g, 'autoplay=0');
            iframe.src = src;
        });
        
        console.log('⏸️ Auto-play disabled');
    }
    
    enableFocusMode() {
        // Create focus mode toggle
        const focusToggle = document.createElement('div');
        focusToggle.id = 'tini-focus-mode';
        focusToggle.innerHTML = `
            <style>
                #tini-focus-mode {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    z-index: 999999;
                    background: #2196F3;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    cursor: pointer;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                }
                .tini-focus-active {
                    filter: blur(2px) !important;
                    pointer-events: none !important;
                }
            </style>
            🎯 Focus Mode
        `;
        
        let focusActive = false;
        focusToggle.addEventListener('click', () => {
            focusActive = !focusActive;
            
            if (focusActive) {
                // Hide distracting elements
                this.wellnessThreats.forEach(selector => {
                    try {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(element => {
                            element.classList.add('tini-focus-active');
                        });
                    } catch (error) {}
                });
                focusToggle.textContent = '🎯 Focus ON';
                focusToggle.style.background = '#4CAF50';
            } else {
                // Restore elements
                document.querySelectorAll('.tini-focus-active').forEach(element => {
                    element.classList.remove('tini-focus-active');
                });
                focusToggle.textContent = '🎯 Focus Mode';
                focusToggle.style.background = '#2196F3';
            }
        });
        
        document.body.appendChild(focusToggle);
    }
    
    enableTimeManagement() {
        // Track time spent on site
        const startTime = Date.now();
        let warningShown = false;
        
        setInterval(() => {
            const timeSpent = (Date.now() - startTime) / 1000 / 60; // minutes
            
            // Show warning after 30 minutes
            if (timeSpent > 30 && !warningShown) {
                this.showTimeWarning(timeSpent);
                warningShown = true;
            }
        }, 60000); // Check every minute
    }
    
    showTimeWarning(minutes) {
        const warning = document.createElement('div');
        warning.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid #FF9800;
                border-radius: 10px;
                padding: 20px;
                z-index: 999999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                text-align: center;
                max-width: 300px;
            ">
                <h3 style="margin: 0 0 10px 0; color: #FF9800;">⏰ Time Alert</h3>
                <p style="margin: 0 0 15px 0;">You've been on this site for ${Math.round(minutes)} minutes.</p>
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Consider taking a break!</p>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #FF9800;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    cursor: pointer;
                ">OK</button>
            </div>
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 999998;
            " onclick="this.parentElement.remove()"></div>
        `;
        
        document.body.appendChild(warning);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    }
    
    enableSecurityHardening() {
        console.log('🔐 Enabling security hardening...');
        
        // Block suspicious scripts
        this.blockSuspiciousScripts();
        
        // Prevent clickjacking
        this.preventClickjacking();
        
        // Secure forms
        this.secureForms();
        
        this.protectionStats.security += 10;
    }
    
    blockSuspiciousScripts() {
        const suspiciousPatterns = [
            'eval(',
            'document.write(',
            'innerHTML =',
            'crypto',
            'mining',
            'bitcoin'
        ];
        
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            const content = script.textContent || script.innerHTML;
            
            suspiciousPatterns.forEach(pattern => {
                if (content.includes(pattern)) {
                    script.remove();
                    this.protectionStats.blocked++;
                    console.log(`🚫 Blocked suspicious script containing: ${pattern}`);
                }
            });
        });
    }
    
    preventClickjacking() {
        // Prevent the page from being embedded in frames
        if (top !== self) {
            top.location = self.location;
        }
        
        // Add visual indication if in frame
        if (window !== window.top) {
            document.body.style.border = '5px solid red';
            document.body.style.boxSizing = 'border-box';
            
            const warning = document.createElement('div');
            warning.innerHTML = '⚠️ This page may be embedded maliciously';
            warning.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;text-align:center;z-index:999999;padding:10px;';
            document.body.appendChild(warning);
        }
    }
    
    secureForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Ensure HTTPS for sensitive forms
            if (form.action && form.action.startsWith('http://')) {
                const inputs = form.querySelectorAll('input[type="password"], input[type="email"]');
                if (inputs.length > 0) {
                    form.action = form.action.replace('http://', 'https://');
                    console.log('🔒 Secured form submission');
                }
            }
        });
    }
    
    startLifeMonitoring() {
        // Monitor page activity
        setInterval(() => {
            this.enablePrivacyProtection();
            this.enableDigitalWellness();
        }, 10000);
        
        // Report stats periodically
        setInterval(() => {
            console.log('📊 TINI Life Guardian Stats:', this.protectionStats);
        }, 60000);
    }
    
    getStats() {
        return {
            ...this.protectionStats,
            version: this.version,
            uptime: Date.now() - this.startTime
        };
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.TiniLifeGuardian = new TiniLifeGuardian();
    });
} else {
    window.TiniLifeGuardian = new TiniLifeGuardian();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TiniLifeGuardian;
}
