// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - CONFIDENTIAL
// TINI Memory Management & Cleanup System
// Author: Security Team
// Version: 1.0

/**
 * Advanced memory management and cleanup system
 * Prevents memory leaks in security modules
 */
class TINIMemoryManager {
    constructor() {
        this.version = '1.0';
        this.cleanupIntervals = new Map();
        this.managedMaps = new Map();
        this.managedArrays = new Map();
        this.memoryStats = {
            startTime: Date.now(),
            cleanupCount: 0,
            lastCleanup: null,
            memoryFreed: 0
        };
        
        this.init();
    }

    init() {
        console.log('🧹 TINI Memory Manager v1.0 starting...');
        
        // Start global cleanup routine
        this.startGlobalCleanup();
        
        // Monitor memory usage
        this.startMemoryMonitoring();
        
        console.log('✅ TINI Memory Manager initialized');
    }

    /**
     * Register a Map for automatic cleanup
     * @param {Map} map - Map to manage
     * @param {string} name - Identifier name
     * @param {object} options - Cleanup options
     */
    registerMap(map, name, options = {}) {
        const defaults = {
            maxSize: 10000,           // Maximum entries
            ttl: 3600000,            // 1 hour TTL
            cleanupInterval: 300000,  // 5 minutes
            keyPattern: null,        // Optional key pattern for selective cleanup
            valueValidator: null     // Optional function to validate if entry should be kept
        };
        
        const config = { ...defaults, ...options };
        
        this.managedMaps.set(name, {
            map: map,
            config: config,
            lastCleanup: Date.now(),
            stats: {
                totalEntries: 0,
                cleanedEntries: 0,
                maxSizeReached: 0
            }
        });

        // Start cleanup interval for this map
        const intervalId = setInterval(() => {
            this.cleanupMap(name);
        }, config.cleanupInterval);
        
        this.cleanupIntervals.set(name, intervalId);
        
        console.log(`📝 Registered Map '${name}' for memory management`);
    }

    /**
     * Register an Array for automatic cleanup
     * @param {Array} array - Array to manage
     * @param {string} name - Identifier name
     * @param {object} options - Cleanup options
     */
    registerArray(array, name, options = {}) {
        const defaults = {
            maxLength: 5000,         // Maximum array length
            ttl: 1800000,           // 30 minutes TTL
            cleanupInterval: 180000, // 3 minutes
            sortKey: 'timestamp',    // Key to sort by for TTL cleanup
            keepRecent: 100         // Always keep this many recent entries
        };
        
        const config = { ...defaults, ...options };
        
        this.managedArrays.set(name, {
            array: array,
            config: config,
            lastCleanup: Date.now(),
            stats: {
                totalEntries: 0,
                cleanedEntries: 0,
                maxLengthReached: 0
            }
        });

        // Start cleanup interval for this array
        const intervalId = setInterval(() => {
            this.cleanupArray(name);
        }, config.cleanupInterval);
        
        this.cleanupIntervals.set(`${name}_array`, intervalId);
        
        console.log(`📝 Registered Array '${name}' for memory management`);
    }

    /**
     * Cleanup a specific Map
     * @param {string} name - Map identifier
     */
    cleanupMap(name) {
        const managed = this.managedMaps.get(name);
        if (!managed) return;

        const { map, config, stats } = managed;
        const now = Date.now();
        let cleaned = 0;

        // TTL-based cleanup
        if (config.ttl > 0) {
            for (const [key, value] of map.entries()) {
                let shouldDelete = false;
                
                // Check TTL
                if (value && value.timestamp && (now - value.timestamp > config.ttl)) {
                    shouldDelete = true;
                }
                
                // Check custom validator
                if (!shouldDelete && config.valueValidator) {
                    try {
                        shouldDelete = !config.valueValidator(value, key, now);
                    } catch (error) {
                        console.warn(`Memory Manager: Validator error for ${name}:`, error);
                    }
                }
                
                // Check key pattern
                if (!shouldDelete && config.keyPattern) {
                    shouldDelete = !config.keyPattern.test(key);
                }
                
                if (shouldDelete) {
                    map.delete(key);
                    cleaned++;
                }
            }
        }

        // Size-based cleanup (keep most recent if over limit)
        if (map.size > config.maxSize) {
            const entries = Array.from(map.entries());
            
            // Sort by timestamp if available
            entries.sort((a, b) => {
                const timeA = a[1]?.timestamp || 0;
                const timeB = b[1]?.timestamp || 0;
                return timeB - timeA; // Most recent first
            });
            
            // Keep only the most recent entries
            const toKeep = entries.slice(0, config.maxSize);
            const toDelete = entries.slice(config.maxSize);
            
            map.clear();
            toKeep.forEach(([key, value]) => map.set(key, value));
            
            cleaned += toDelete.length;
            stats.maxSizeReached++;
        }

        if (cleaned > 0) {
            stats.cleanedEntries += cleaned;
            managed.lastCleanup = now;
            this.memoryStats.cleanupCount++;
            console.log(`🧹 Cleaned ${cleaned} entries from Map '${name}'`);
        }
    }

    /**
     * Cleanup a specific Array
     * @param {string} name - Array identifier
     */
    cleanupArray(name) {
        const managed = this.managedArrays.get(name);
        if (!managed) return;

        const { array, config, stats } = managed;
        const now = Date.now();
        let cleaned = 0;

        // TTL-based cleanup
        if (config.ttl > 0 && config.sortKey) {
            const initialLength = array.length;
            
            // Remove expired entries
            for (let i = array.length - 1; i >= 0; i--) {
                const item = array[i];
                if (item && item[config.sortKey] && (now - item[config.sortKey] > config.ttl)) {
                    array.splice(i, 1);
                    cleaned++;
                }
            }
        }

        // Size-based cleanup
        if (array.length > config.maxLength) {
            // Sort by timestamp if available
            if (config.sortKey) {
                array.sort((a, b) => {
                    const timeA = a[config.sortKey] || 0;
                    const timeB = b[config.sortKey] || 0;
                    return timeB - timeA; // Most recent first
                });
            }
            
            // Keep only recent entries
            const toRemove = array.length - config.maxLength;
            if (toRemove > 0) {
                array.splice(config.maxLength);
                cleaned += toRemove;
                stats.maxLengthReached++;
            }
        }

        if (cleaned > 0) {
            stats.cleanedEntries += cleaned;
            managed.lastCleanup = now;
            this.memoryStats.cleanupCount++;
            console.log(`🧹 Cleaned ${cleaned} entries from Array '${name}'`);
        }
    }

    /**
     * Force cleanup all managed structures
     */
    forceCleanupAll() {
        console.log('🧹 Starting forced cleanup of all managed structures...');
        
        let totalCleaned = 0;
        
        // Cleanup all Maps
        for (const name of this.managedMaps.keys()) {
            const beforeSize = this.managedMaps.get(name).map.size;
            this.cleanupMap(name);
            const afterSize = this.managedMaps.get(name).map.size;
            totalCleaned += (beforeSize - afterSize);
        }
        
        // Cleanup all Arrays
        for (const name of this.managedArrays.keys()) {
            const beforeSize = this.managedArrays.get(name).array.length;
            this.cleanupArray(name);
            const afterSize = this.managedArrays.get(name).array.length;
            totalCleaned += (beforeSize - afterSize);
        }
        
        this.memoryStats.lastCleanup = Date.now();
        this.memoryStats.memoryFreed += totalCleaned;
        
        console.log(`✅ Forced cleanup completed. ${totalCleaned} entries freed.`);
    }

    /**
     * Start global cleanup routine
     */
    startGlobalCleanup() {
        // Run comprehensive cleanup every 10 minutes
        setInterval(() => {
            this.forceCleanupAll();
            this.performGarbageCollection();
        }, 600000);
        
        console.log('📅 Global cleanup routine started (10-minute intervals)');
    }

    /**
     * Start memory monitoring
     */
    startMemoryMonitoring() {
        if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = window.performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
                const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
                
                // Alert if memory usage is high
                if (usedMB > limitMB * 0.8) {
                    console.warn(`⚠️ High memory usage: ${usedMB}MB / ${limitMB}MB (${Math.round(usedMB/limitMB*100)}%)`);
                    this.forceCleanupAll();
                }
                
                // Log memory stats every 5 minutes
                if (Date.now() % 300000 < 10000) {
                    console.log(`📊 Memory: ${usedMB}MB used / ${totalMB}MB allocated / ${limitMB}MB limit`);
                }
            }, 10000); // Check every 10 seconds
        }
    }

    /**
     * Perform garbage collection if available
     */
    performGarbageCollection() {
        if (typeof window !== 'undefined' && window.gc) {
            try {
                window.gc();
                console.log('🗑️ Manual garbage collection performed');
            } catch (error) {
                console.warn('Manual GC failed:', error);
            }
        }
    }

    /**
     * Get memory management statistics
     * @returns {object} Memory stats
     */
    getStats() {
        const stats = {
            ...this.memoryStats,
            uptime: Date.now() - this.memoryStats.startTime,
            managedMaps: this.managedMaps.size,
            managedArrays: this.managedArrays.size,
            details: {
                maps: {},
                arrays: {}
            }
        };
        
        // Map details
        for (const [name, managed] of this.managedMaps) {
            stats.details.maps[name] = {
                size: managed.map.size,
                lastCleanup: managed.lastCleanup,
                ...managed.stats
            };
        }
        
        // Array details
        for (const [name, managed] of this.managedArrays) {
            stats.details.arrays[name] = {
                length: managed.array.length,
                lastCleanup: managed.lastCleanup,
                ...managed.stats
            };
        }
        
        return stats;
    }

    /**
     * Unregister and cleanup a managed structure
     * @param {string} name - Structure name
     */
    unregister(name) {
        // Clear intervals
        if (this.cleanupIntervals.has(name)) {
            clearInterval(this.cleanupIntervals.get(name));
            this.cleanupIntervals.delete(name);
        }
        
        if (this.cleanupIntervals.has(`${name}_array`)) {
            clearInterval(this.cleanupIntervals.get(`${name}_array`));
            this.cleanupIntervals.delete(`${name}_array`);
        }
        
        // Remove from managed structures
        this.managedMaps.delete(name);
        this.managedArrays.delete(name);
        
        console.log(`📝 Unregistered '${name}' from memory management`);
    }

    /**
     * Shutdown memory manager
     */
    shutdown() {
        console.log('🛑 Shutting down TINI Memory Manager...');
        
        // Clear all intervals
        for (const intervalId of this.cleanupIntervals.values()) {
            clearInterval(intervalId);
        }
        
        // Final cleanup
        this.forceCleanupAll();
        
        console.log('✅ TINI Memory Manager shutdown complete');
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.TINIMemoryManager = new TINIMemoryManager();
} else if (typeof global !== 'undefined') {
    global.TINIMemoryManager = new TINIMemoryManager();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIMemoryManager;
}
