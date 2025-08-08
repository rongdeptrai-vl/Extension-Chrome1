// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Database Connection Manager for TINI Enterprise
// Handles 2000+ concurrent users with connection pooling

const mysql = require('mysql2/promise');
const redis = require('redis');
const bcrypt = require('bcrypt');

class DatabaseManager {
    constructor(config = {}) {
        this.isShuttingDown = false;
        this.config = {
            // MySQL Configuration
            mysql: {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'tini_admin',
                password: process.env.DB_PASSWORD || 'tini_secure_2025',
                database: process.env.DB_NAME || 'tini_enterprise',
                connectionLimit: 100, // Pool for 2000+ users
                acquireTimeout: 60000,
                timeout: 60000,
                reconnect: true,
                charset: 'utf8mb4'
            },
            
            // Redis Configuration (for sessions & caching)
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || '',
                db: 0,
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3
            },
            
            // Connection pooling
            poolConfig: {
                min: 10,
                max: 100,
                idle: 30000,
                acquire: 60000,
                evict: 1000
            },
            
            ...config
        };
        
        this.pool = null;
        this.redisClient = null;
        this.isConnected = false;
    }

    // Initialize database connections
    async initialize() {
        try {
            console.log('🔗 Initializing database connections...');
            
            // Create MySQL connection pool
            this.pool = mysql.createPool({
                ...this.config.mysql,
                waitForConnections: true,
                queueLimit: 0
            });

            // Test MySQL connection
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            console.log('✅ MySQL connected successfully');

            // Initialize Redis
            this.redisClient = redis.createClient(this.config.redis);
            await this.redisClient.connect();
            console.log('✅ Redis connected successfully');

            this.isConnected = true;
            console.log('🎉 Database Manager initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    // User Management Methods
    async getUserById(userId) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }

    async getUserByEmployeeId(employeeId) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT * FROM users WHERE employee_id = ? AND status = "active"',
                [employeeId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting user by employee ID:', error);
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT * FROM users WHERE email = ? AND status = "active"',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            const {
                employee_id, username, email, password, role = 'user',
                display_name, phone, department, bio, device_id, real_device_id
            } = userData;

            // Hash password
            const password_hash = await bcrypt.hash(password, 12);

            const [result] = await this.pool.execute(
                `INSERT INTO users (
                    employee_id, username, email, password_hash, role,
                    display_name, phone, department, bio, device_id, real_device_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [employee_id, username, email, password_hash, role, 
                 display_name, phone, department, bio, device_id, real_device_id]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async updateUserProfile(userId, profileData) {
        try {
            const {
                display_name, phone, department, bio, avatar_data
            } = profileData;

            const [result] = await this.pool.execute(
                `UPDATE users SET 
                    display_name = ?, phone = ?, department = ?, 
                    bio = ?, avatar_data = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [display_name, phone, department, bio, avatar_data, userId]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    async validateUserCredentials(username, password) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT id, password_hash, role, status FROM users WHERE (username = ? OR email = ?) AND status = "active"',
                [username, username]
            );

            if (rows.length === 0) {
                return null;
            }

            const user = rows[0];
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            
            if (isValidPassword) {
                // Update login stats
                await this.pool.execute(
                    'UPDATE users SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE id = ?',
                    [user.id]
                );
                return user;
            }

            return null;
        } catch (error) {
            console.error('Error validating credentials:', error);
            throw error;
        }
    }

    /**
     * Save security metrics to database
     * @param {object} metrics
     */
    async saveSecurityMetrics(metrics) {
        try {
            const {
                totalRequests,
                blockedAttempts,
                honeypotHits,
                lastScan
            } = metrics;
            // optional: ensure security_metrics table exists
            await this.pool.execute(
                `INSERT INTO security_metrics \
                 (total_requests, blocked_attempts, honeypot_hits, last_scan) \
                 VALUES (?, ?, ?, ?)`,
                [totalRequests, blockedAttempts, honeypotHits, new Date(lastScan)]
            );
            console.log('✅ Security metrics saved to database');
        } catch (error) {
            console.error('❌ Error saving security metrics:', error);
            throw error;
        }
    }

    // Session Management
    async createSession(userId, sessionData) {
        try {
            const {
                session_id, auth_token, device_info, ip_address, user_agent, expires_at
            } = sessionData;

            const [result] = await this.pool.execute(
                `INSERT INTO user_sessions (
                    session_id, user_id, auth_token, device_info, 
                    ip_address, user_agent, expires_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [session_id, userId, auth_token, JSON.stringify(device_info), 
                 ip_address, user_agent, expires_at]
            );

            // Cache session in Redis for fast lookup
            await this.redisClient.setEx(
                `session:${session_id}`, 
                86400, // 24 hours
                JSON.stringify({ userId, auth_token, created_at: new Date() })
            );

            return result.insertId;
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    async getSession(sessionId) {
        try {
            // Try Redis first (faster)
            const cached = await this.redisClient.get(`session:${sessionId}`);
            if (cached) {
                return JSON.parse(cached);
            }

            // Fallback to MySQL
            const [rows] = await this.pool.execute(
                `SELECT s.*, u.employee_id, u.role, u.status 
                FROM user_sessions s 
                JOIN users u ON s.user_id = u.id 
                WHERE s.session_id = ? AND s.is_active = TRUE AND s.expires_at > NOW()`,
                [sessionId]
            );

            return rows[0] || null;
        } catch (error) {
            console.error('Error getting session:', error);
            throw error;
        }
    }

    async destroySession(sessionId) {
        try {
            // Remove from Redis
            await this.redisClient.del(`session:${sessionId}`);

            // Mark as inactive in MySQL
            const [result] = await this.pool.execute(
                'UPDATE user_sessions SET is_active = FALSE WHERE session_id = ?',
                [sessionId]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error destroying session:', error);
            throw error;
        }
    }

    // User Preferences
    async getUserPreference(userId, key) {
        try {
            // Try Redis cache first
            const cached = await this.redisClient.get(`pref:${userId}:${key}`);
            if (cached) {
                return cached;
            }

            // Fallback to MySQL
            const [rows] = await this.pool.execute(
                'SELECT preference_value FROM user_preferences WHERE user_id = ? AND preference_key = ?',
                [userId, key]
            );

            const value = rows[0]?.preference_value || null;
            
            // Cache for 1 hour
            if (value) {
                await this.redisClient.setEx(`pref:${userId}:${key}`, 3600, value);
            }

            return value;
        } catch (error) {
            console.error('Error getting user preference:', error);
            throw error;
        }
    }

    async setUserPreference(userId, key, value) {
        try {
            // Update MySQL
            await this.pool.execute(
                `INSERT INTO user_preferences (user_id, preference_key, preference_value) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE preference_value = ?, updated_at = CURRENT_TIMESTAMP`,
                [userId, key, value, value]
            );

            // Update Redis cache
            await this.redisClient.setEx(`pref:${userId}:${key}`, 3600, value);

            return true;
        } catch (error) {
            console.error('Error setting user preference:', error);
            throw error;
        }
    }

    // Activity logging
    async logUserActivity(userId, action, details = {}, ip = null, userAgent = null) {
        try {
            await this.pool.execute(
                'INSERT INTO user_activity (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
                [userId, action, JSON.stringify(details), ip, userAgent]
            );
        } catch (error) {
            console.error('Error logging user activity:', error);
            // Don't throw - logging shouldn't break the app
        }
    }

    // Cleanup methods
    async cleanupExpiredSessions() {
        try {
            const [result] = await this.pool.execute(
                'UPDATE user_sessions SET is_active = FALSE WHERE expires_at < NOW() AND is_active = TRUE'
            );
            console.log(`🧹 Cleaned up ${result.affectedRows} expired sessions`);
            return result.affectedRows;
        } catch (error) {
            console.error('Error cleaning up sessions:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        try {
            // Test MySQL
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();

            // Test Redis
            await this.redisClient.ping();

            return {
                mysql: true,
                redis: true,
                timestamp: new Date(),
                pools: {
                    mysql: {
                        totalConnections: this.pool.pool.totalConnections,
                        idleConnections: this.pool.pool.idleConnections,
                        queuedRequests: this.pool.pool.queuedRequests
                    }
                }
            };
        } catch (error) {
            console.error('Database health check failed:', error);
            return {
                mysql: false,
                redis: false,
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    // Graceful shutdown
    async close() {
        try {
            console.log('🔌 Closing database connections...');
            
            if (this.pool) {
                await this.pool.end();
                console.log('✅ MySQL pool closed');
            }
            
            if (this.redisClient) {
                await this.redisClient.quit();
                console.log('✅ Redis connection closed');
            }
            
            this.isConnected = false;
            console.log('🎯 Database Manager shutdown complete');
        } catch (error) {
            console.error('❌ Error during database shutdown:', error);
            throw error;
        }
    }
}

// Export DatabaseManager for use in other modules
module.exports = DatabaseManager;

module.exports = DatabaseManager;
