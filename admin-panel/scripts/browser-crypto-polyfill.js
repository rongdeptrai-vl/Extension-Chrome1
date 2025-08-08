// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Browser-Compatible Crypto Polyfill
class BrowserCrypto {
    constructor() {
        this.subtle = window.crypto?.subtle;
    }

    // Generate random bytes using browser crypto
    randomBytes(size) {
        const array = new Uint8Array(size);
        window.crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Generate random UUID
    randomUUID() {
        if (window.crypto?.randomUUID) {
            return window.crypto.randomUUID();
        }
        // Fallback UUID v4 generation
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Simple hash function for browser
    async createHash(algorithm) {
        return {
            update: (data) => ({
                digest: async (encoding) => {
                    const encoder = new TextEncoder();
                    const dataArray = encoder.encode(data);
                    const hashBuffer = await window.crypto.subtle.digest(algorithm.toUpperCase() === 'SHA256' ? 'SHA-256' : 'SHA-1', dataArray);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                }
            })
        };
    }

    // Synchronous hash for compatibility
    createHashSync(data) {
        // Simple hash implementation for browser
        let hash = 0;
        if (data.length === 0) return hash.toString(16);
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }
}

// Make crypto available globally for browser compatibility
if (typeof window !== 'undefined' && !window.crypto.createHash) {
    window.crypto.browserCompat = new BrowserCrypto();
    // Polyfill Node.js crypto methods
    window.crypto.randomBytes = function(size) {
        return window.crypto.browserCompat.randomBytes(size);
    };
    window.crypto.randomUUID = function() {
        return window.crypto.browserCompat.randomUUID();
    };
    window.crypto.createHash = function(algorithm) {
        return {
            update: function(data) {
                return {
                    digest: function(encoding) {
                        return window.crypto.browserCompat.createHashSync(data);
                    }
                };
            }
        };
    };
}

console.log('✅ [CRYPTO] Browser crypto polyfill loaded successfully');
