// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Removed outer guard; using IIFE for domain check
/**
 * 🚀 TINI MONSTER v6 - Advanced Ad Blocker & Web Protection
 * Phiên bản nâng cao chặn quảng cáo và bảo vệ web toàn diện
 * Features: Smart ad blocking, tracker prevention, malware protection
 */

(function() {
    if (!window.location.hostname.includes('tiktok.com')) {
        console.log('TiniMonster: skipping on non-TikTok domain');
        return;
    }

    class TiniMonster {
        constructor() {
            this.version = "6.0";
            this.name = "TINI Monster";
            this.initialized = false;
            this.blockedAds = 0;
            this.blockedTrackers = 0;
            this.protectionLevel = 'aggressive';
            
            // Ad selectors to block
            this.adSelectors = [
                // TikTok & generic selectors only (Google selectors removed)
                
                // Facebook Ads
                '[data-pagelet="FeedAds"]',
                '[data-testid*="sponsored"]',
                
                // YouTube Ads
                '.ytp-ad-module',
                '.video-ads',
                '.masthead-ad',
                
                // Generic Ad containers
                '.advertisement',
                '.ad-container',
                '.ad-banner',
                '.ad-slot',
                '.sponsored',
                '[id*="ad-"]',
                '[class*="ad-"]',
                '[id*="banner"]',
                '[class*="banner"]',
                
                // Pop-up and overlay ads
                '.popup-ad',
                '.overlay-ad',
                '.modal-ad',
                '.interstitial',
                
                // Tracking pixels
                'img[width="1"][height="1"]',
                'iframe[width="1"][height="1"]'
            ];
            
            // Tracker domains to block
            this.trackerDomains = [
                'googletagmanager.com',
                'google-analytics.com',
                'facebook.com/tr',
                'doubleclick.net',
                'googlesyndication.com',
                'amazon-adsystem.com',
                'outbrain.com',
                'taboola.com',
                'adsystem.amazon.com',
                // TikTok tracking domains
                'tiktok.com',
                'tiktokcdn.com'
            ];
            
            this.init();
        }
        
        init() {
            // Only activate on TikTok pages
            if (this.initialized || !window.location.hostname.includes('tiktok.com')) return;
            console.log(`🚀 ${this.name} v${this.version} initializing for TikTok...`);
            // Block TikTok ads and live streams only
            this.blockTikTok();
            this.initialized = true;
            console.log(`✅ ${this.name} v${this.version} TikTok blocking activated!`);
        }
        
        /**
         * Block TikTok-specific ad iframes, scripts, and live video elements
         */
        blockTikTok() {
            let removedCount = 0;
            // Remove TikTok iframes (ads, embedded content)
            const iframes = document.querySelectorAll('iframe[src*="tiktok.com"]');
            iframes.forEach(iframe => { iframe.remove(); removedCount++; });
            // Remove TikTok script embeds
            const scripts = document.querySelectorAll('script[src*="tiktok.com"]');
            scripts.forEach(script => { script.remove(); removedCount++; });
            // Remove live video elements served by TikTok
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                if (video.src.includes('tiktokcdn.com')) {
                    try { video.pause(); } catch {};
                    video.remove();
                    removedCount++;
                }
            });
            if (removedCount > 0) {
                console.log(`🚫 Blocked ${removedCount} TikTok elements`);
            }
        }
        
        blockAds() {
            let blockedCount = 0;
            
            // Remove existing ads
            this.adSelectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        element.remove();
                        blockedCount++;
                    });
                } catch (error) {
                    // Ignore selector errors
                }
            });
            
            this.blockedAds += blockedCount;   
            if (blockedCount > 0) {
                console.log(`🚫 Blocked ${blockedCount} ad elements`);
            }
        }
        
        blockTrackers() {
            let blockedCount = 0;
            
            // Block tracking scripts
            const scripts = document.querySelectorAll('script[src]');
            scripts.forEach(script => {
                const src = script.src;
                if (this.trackerDomains.some(domain => src.includes(domain))) {
                    script.remove();
                    blockedCount++;
                }
            });
            
            // Block tracking pixels
            const images = document.querySelectorAll('img[src]');
            images.forEach(img => {
                const src = img.src;
                if (this.trackerDomains.some(domain => src.includes(domain))) {
                    img.remove();
                    blockedCount++;
                }
            });
            
            this.blockedTrackers += blockedCount;
            
            if (blockedCount > 0) {
                console.log(`🚫 Blocked ${blockedCount} tracking elements`);
            }
        }
        
        startAdMonitoring() {
            // Monitor DOM changes for new ads
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.checkAndBlockElement(node);
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Periodic cleanup
            setInterval(() => {
                this.blockAds();
            }, 5000);
        }
        
        checkAndBlockElement(element) {
            // Check if element is an ad
            this.adSelectors.forEach(selector => {
                try {
                    if (element.matches && element.matches(selector)) {
                        element.remove();
                        this.blockedAds++;
                        return;
                    }
                    
                    // Check children
                    const adElements = element.querySelectorAll(selector);
                    adElements.forEach(ad => {
                        ad.remove();
                        this.blockedAds++;
                    });
                } catch (error) {
                    // Ignore selector errors
                }
            });
        }
        
        cleanDocument() {
            // Remove common ad-related attributes
            const elementsWithAdAttrs = document.querySelectorAll('[data-ad], [data-ads], [data-advertisement]');
            elementsWithAdAttrs.forEach(element => {
                element.removeAttribute('data-ad');
                element.removeAttribute('data-ads');
                element.removeAttribute('data-advertisement');
            });
            
            // Clean URLs from tracking parameters
            this.cleanTrackingParams();
        }
        
        cleanTrackingParams() {
            const trackingParams = [
                'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                'fbclid', 'gclid', 'msclkid', 'mc_eid', 'mc_cid'
            ];
            
            const url = new URL(window.location);
            let cleaned = false;
            
            trackingParams.forEach(param => {
                if (url.searchParams.has(param)) {
                    url.searchParams.delete(param);
                    cleaned = true;
                }
            });
            
            if (cleaned) {
                window.history.replaceState({}, document.title, url.toString());
                console.log('🧹 Cleaned tracking parameters from URL');
            }
        }
        
        getStats() {
            return {
                blockedAds: this.blockedAds,
                blockedTrackers: this.blockedTrackers,
                protectionLevel: this.protectionLevel,
                version: this.version
            };
        }
        
        // Anti-detection methods
        disguiseFromAdBlockDetectors() {
            // Fake AdBlock detection variables
            try {
                Object.defineProperty(window, 'blockAdBlock', {
                get: () => undefined,
                set: () => {},
                configurable: false
                });
            } catch (e) {
                console.warn('⚠️ Could not define blockAdBlock:', e);
            }
            
            try {
                Object.defineProperty(window, 'canRunAds', {
                get: () => true,
                set: () => {},
                configurable: false
                });
            } catch (e) {
                console.warn('⚠️ Could not define canRunAds:', e);
            }
            
            // Hide from popular ad block detectors
            const fakeAdElements = document.querySelectorAll('.adsbygoogle');
            fakeAdElements.forEach(element => {
                element.style.display = 'block';
                element.style.visibility = 'visible';
                element.style.opacity = '1';
                element.innerHTML = '<!-- Ad blocked by TINI Monster -->';
            });
        }
        
        // YouTube specific ad blocking
        blockYouTubeAds() {
            // Skip YouTube video ads
            const skipButton = document.querySelector('.ytp-ad-skip-button');
            if (skipButton) {
                skipButton.click();
            }
            
            // Remove ad overlays
            const adOverlays = document.querySelectorAll('.ytp-ad-overlay-container');
            adOverlays.forEach(overlay => overlay.remove());
            
            // Speed up ads (make them invisible)
            const videoAd = document.querySelector('.video-ads video');
            if (videoAd) {
                videoAd.playbackRate = 16;
                videoAd.currentTime = videoAd.duration;
            }
        }
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.TiniMonster = new TiniMonster();
        });
    } else {
        window.TiniMonster = new TiniMonster();
    }

    // YouTube specific initialization
    if (window.location.hostname.includes('youtube.com')) {
        setInterval(() => {
            if (window.TiniMonster) {
                window.TiniMonster.blockYouTubeAds();
            }
        }, 1000);
    }

    // Export for use in other scripts
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TiniMonster;
    }
})();
