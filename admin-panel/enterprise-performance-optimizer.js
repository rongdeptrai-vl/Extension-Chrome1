// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-17T10:00:00Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited

/**
 * ENTERPRISE PERFORMANCE OPTIMIZER
 * Performance optimizations for 2000+ concurrent users
 * Database optimization, caching, and connection pooling
 */

const sqlite3 = require('sqlite3').verbose();

// Try to load optional dependencies
let NodeCache;
try {
    NodeCache = require('node-cache');
} catch (e) {
    console.log('💾 Node-cache not available - using fallback memory cache');
    // Fallback simple cache
    NodeCache = class FallbackCache {
        constructor() { this.cache = new Map(); }
        set(key, value, ttl) { 
            setTimeout(() => this.cache.delete(key), (ttl || 600) * 1000);
            this.cache.set(key, value); 
        }
        get(key) { return this.cache.get(key); }
        del(key) { this.cache.delete(key); }
        flushAll() { this.cache.clear(); }
        getStats() { return { keys: this.cache.size, hits: 0, misses: 0 }; }
    };
}

const cluster = require('cluster');
const os = require('os');

class EnterprisePerformanceOptimizer {
    constructor(options = {}) {
        this.options = {
            maxConnections: options.maxConnections || 20,
            cacheTimeout: options.cacheTimeout || 300, // 5 minutes
            queryTimeout: options.queryTimeout || 30000, // 30 seconds
            enableClustering: options.enableClustering || false,
            enableMemoryCache: options.enableMemoryCache !== false,
            enableQueryOptimization: options.enableQueryOptimization !== false,
            ...options
        };

        this.connectionPool = [];
        this.availableConnections = [];
        this.waitingQueue = [];
        this.queryCache = null;
        this.performanceMetrics = {
            totalQueries: 0,
            cacheHits: 0,
            cacheMisses: 0,
            avgQueryTime: 0,
            connectionPoolUsage: 0
        };

        this.initializeCache();
        this.initializeConnectionPool();
    }

    /**
     * Initialize memory cache
     */
    initializeCache() {
        if (this.options.enableMemoryCache) {
            this.queryCache = new NodeCache({
                stdTTL: this.options.cacheTimeout,
                checkperiod: 60, // Check for expired keys every 60s
                useClones: false // Better performance
            });

            console.log('💾 Memory cache initialized');
        }
    }

    /**
     * Initialize SQLite connection pool
     */
    async initializeConnectionPool() {
        console.log(`🔧 Initializing connection pool (${this.options.maxConnections} connections)...`);

        for (let i = 0; i < this.options.maxConnections; i++) {
            try {
                const connection = await this.createOptimizedConnection();
                this.connectionPool.push(connection);
                this.availableConnections.push(connection);
            } catch (error) {
                console.error(`❌ Failed to create connection ${i}:`, error);
            }
        }

        console.log(`✅ Connection pool ready with ${this.connectionPool.length} connections`);
    }

    /**
     * Create optimized SQLite connection
     */
    async createOptimizedConnection() {
        return new Promise((resolve, reject) => {
            const dbPath = this.options.dbPath || './admin-panel/tini_admin.db';
            const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, async (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                try {
                    // Apply performance optimizations
                    await this.applyConnectionOptimizations(db);
                    resolve(db);
                } catch (optimizeErr) {
                    reject(optimizeErr);
                }
            });
        });
    }

    /**
     * Apply SQLite performance optimizations
     */
    async applyConnectionOptimizations(db) {
        const optimizations = [
            // WAL mode for better concurrency
            "PRAGMA journal_mode = WAL;",
            
            // Faster synchronization
            "PRAGMA synchronous = NORMAL;",
            
            // Larger cache size (50MB)
            "PRAGMA cache_size = -50000;",
            
            // Memory for temporary tables
            "PRAGMA temp_store = memory;",
            
            // Memory-mapped I/O (512MB)
            "PRAGMA mmap_size = 536870912;",
            
            // Optimize for speed over safety
            "PRAGMA locking_mode = EXCLUSIVE;",
            
            // Increase page size for better performance
            "PRAGMA page_size = 32768;",
            
            // Auto-vacuum for space management
            "PRAGMA auto_vacuum = INCREMENTAL;",
            
            // Optimize query planning
            "PRAGMA optimize;",
            
            // Set busy timeout
            `PRAGMA busy_timeout = ${this.options.queryTimeout};`
        ];

        for (const pragma of optimizations) {
            await this.runPragma(db, pragma);
        }

        console.log('⚡ Connection optimizations applied');
    }

    /**
     * Run PRAGMA statement with promise wrapper
     */
    runPragma(db, pragma) {
        return new Promise((resolve, reject) => {
            db.run(pragma, (err) => {
                if (err) {
                    console.warn(`⚠️ PRAGMA failed: ${pragma} - ${err.message}`);
                }
                resolve(); // Continue even if PRAGMA fails
            });
        });
    }

    /**
     * Get connection from pool
     */
    async getConnection() {
        return new Promise((resolve, reject) => {
            if (this.availableConnections.length > 0) {
                const connection = this.availableConnections.pop();
                resolve(connection);
            } else {
                // Add to waiting queue
                this.waitingQueue.push({ resolve, reject });
                
                // Timeout for waiting
                setTimeout(() => {
                    const index = this.waitingQueue.findIndex(item => item.resolve === resolve);
                    if (index > -1) {
                        this.waitingQueue.splice(index, 1);
                        reject(new Error('Connection timeout - pool exhausted'));
                    }
                }, this.options.queryTimeout);
            }
        });
    }

    /**
     * Release connection back to pool
     */
    releaseConnection(connection) {
        if (this.waitingQueue.length > 0) {
            const waiter = this.waitingQueue.shift();
            waiter.resolve(connection);
        } else {
            this.availableConnections.push(connection);
        }
    }

    /**
     * Execute optimized query
     */
    async executeQuery(query, params = [], options = {}) {
        const startTime = Date.now();
        this.performanceMetrics.totalQueries++;

        // Check cache first
        if (this.options.enableMemoryCache && options.cacheable) {
            const cacheKey = this.generateCacheKey(query, params);
            const cached = this.queryCache.get(cacheKey);
            
            if (cached) {
                this.performanceMetrics.cacheHits++;
                console.log(`💾 Cache hit for query: ${query.substring(0, 50)}...`);
                return cached;
            }
            this.performanceMetrics.cacheMisses++;
        }

        let connection;
        try {
            connection = await this.getConnection();
            const result = await this.runQuery(connection, query, params);

            // Cache the result if cacheable
            if (this.options.enableMemoryCache && options.cacheable) {
                const cacheKey = this.generateCacheKey(query, params);
                this.queryCache.set(cacheKey, result, options.cacheTTL || this.options.cacheTimeout);
            }

            // Update performance metrics
            const queryTime = Date.now() - startTime;
            this.updatePerformanceMetrics(queryTime);

            return result;

        } catch (error) {
            console.error('❌ Query execution failed:', {
                query: query.substring(0, 100),
                error: error.message
            });
            throw error;
        } finally {
            if (connection) {
                this.releaseConnection(connection);
            }
        }
    }

    /**
     * Run query with promise wrapper
     */
    runQuery(db, query, params) {
        return new Promise((resolve, reject) => {
            const isSelect = query.trim().toLowerCase().startsWith('select');
            
            if (isSelect) {
                db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            } else {
                db.run(query, params, function(err) {
                    if (err) reject(err);
                    else resolve({
                        lastID: this.lastID,
                        changes: this.changes
                    });
                });
            }
        });
    }

    /**
     * Generate cache key
     */
    generateCacheKey(query, params) {
        const key = query + JSON.stringify(params);
        return require('crypto').createHash('md5').update(key).digest('hex');
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(queryTime) {
        this.performanceMetrics.avgQueryTime = 
            (this.performanceMetrics.avgQueryTime + queryTime) / 2;
        
        this.performanceMetrics.connectionPoolUsage = 
            ((this.options.maxConnections - this.availableConnections.length) / this.options.maxConnections) * 100;
    }

    /**
     * Optimize database schema for performance
     */
    async optimizeSchema() {
        console.log('🔧 Optimizing database schema for performance...');

        const indexes = [
            // Device registrations
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_employee_id ON device_registrations(employee_id);",
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_status ON device_registrations(device_status);",
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_created_at ON device_registrations(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_fingerprint ON device_registrations(device_fingerprint_hash);",
            
            // Activities
            "CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_activities_action_type ON activities(action_type);",
            
            // Sessions
            "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);",
            "CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);",
            
            // Admin sessions
            "CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);",
            "CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);",
            
            // Security events
            "CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);",
            "CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);",
            
            // Device access logs
            "CREATE INDEX IF NOT EXISTS idx_device_access_logs_employee_id ON device_access_logs(employee_id);",
            "CREATE INDEX IF NOT EXISTS idx_device_access_logs_access_time ON device_access_logs(access_time);",
            "CREATE INDEX IF NOT EXISTS idx_device_access_logs_result ON device_access_logs(access_result);",
            
            // Composite indexes for common queries
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_status_created ON device_registrations(device_status, created_at);",
            "CREATE INDEX IF NOT EXISTS idx_activities_user_created ON activities(user_id, created_at);",
            "CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON sessions(user_id, is_active);"
        ];

        for (const indexSQL of indexes) {
            try {
                await this.executeQuery(indexSQL);
                console.log('✅ Index created:', indexSQL.match(/idx_\w+/)[0]);
            } catch (error) {
                console.warn('⚠️ Index creation failed:', error.message);
            }
        }

        // Analyze tables for query optimization
        const tables = [
            'device_registrations', 'activities', 'sessions', 'users',
            'admin_sessions', 'security_events', 'device_access_logs'
        ];

        for (const table of tables) {
            try {
                await this.executeQuery(`ANALYZE ${table};`);
                console.log(`📊 Analyzed table: ${table}`);
            } catch (error) {
                console.warn(`⚠️ Analysis failed for ${table}:`, error.message);
            }
        }

        console.log('✅ Database schema optimization completed');
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const cacheStats = this.queryCache ? {
            keys: this.queryCache.keys().length,
            hitRate: this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100,
            hits: this.performanceMetrics.cacheHits,
            misses: this.performanceMetrics.cacheMisses
        } : null;

        return {
            connectionPool: {
                total: this.connectionPool.length,
                available: this.availableConnections.length,
                usage: this.performanceMetrics.connectionPoolUsage.toFixed(2) + '%',
                waitingQueue: this.waitingQueue.length
            },
            queries: {
                total: this.performanceMetrics.totalQueries,
                avgTime: this.performanceMetrics.avgQueryTime.toFixed(2) + 'ms'
            },
            cache: cacheStats,
            memory: {
                used: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + 'MB',
                total: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + 'MB'
            }
        };
    }

    /**
     * Run performance cleanup
     */
    async performCleanup() {
        console.log('🧹 Running performance cleanup...');

        try {
            // Clear expired cache entries
            if (this.queryCache) {
                const beforeKeys = this.queryCache.keys().length;
                this.queryCache.flushStats();
                const afterKeys = this.queryCache.keys().length;
                console.log(`💾 Cache cleanup: ${beforeKeys - afterKeys} expired entries removed`);
            }

            // Run database cleanup queries
            const cleanupQueries = [
                // Remove old session records
                "DELETE FROM sessions WHERE expires_at < datetime('now', '-7 days');",
                
                // Remove old activity logs (keep 30 days)
                "DELETE FROM activities WHERE created_at < datetime('now', '-30 days');",
                
                // Remove old security events (keep resolved events for 90 days)
                "DELETE FROM security_events WHERE resolved = 1 AND created_at < datetime('now', '-90 days');",
                
                // Remove old device access logs (keep 60 days)
                "DELETE FROM device_access_logs WHERE access_time < datetime('now', '-60 days');",
                
                // Vacuum database to reclaim space
                "VACUUM;",
                
                // Update statistics
                "ANALYZE;"
            ];

            for (const query of cleanupQueries) {
                try {
                    const result = await this.executeQuery(query);
                    if (result.changes) {
                        console.log(`🗑️ Cleanup: ${result.changes} records processed`);
                    }
                } catch (error) {
                    console.warn('⚠️ Cleanup query failed:', error.message);
                }
            }

            console.log('✅ Performance cleanup completed');
        } catch (error) {
            console.error('❌ Performance cleanup failed:', error);
        }
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        // Performance stats every 5 minutes
        setInterval(() => {
            const stats = this.getPerformanceStats();
            console.log('📊 Performance Stats:', stats);
        }, 5 * 60 * 1000);

        // Cleanup every hour
        setInterval(() => {
            this.performCleanup();
        }, 60 * 60 * 1000);

        console.log('📊 Performance monitoring started');
    }

    /**
     * Close all connections
     */
    async close() {
        console.log('🔌 Closing connection pool...');
        
        for (const connection of this.connectionPool) {
            try {
                await new Promise(resolve => connection.close(resolve));
            } catch (error) {
                console.warn('⚠️ Error closing connection:', error.message);
            }
        }

        this.connectionPool = [];
        this.availableConnections = [];
        
        if (this.queryCache) {
            this.queryCache.close();
        }

        console.log('✅ Connection pool closed');
    }
}

module.exports = EnterprisePerformanceOptimizer;
// ST:TINI_1755432586_e868a412
