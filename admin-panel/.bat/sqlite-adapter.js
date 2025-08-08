// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI SQLite Adapter
 * Lightweight SQLite database adapter for TINI Admin Panel
 * Provides file-based database functionality with real data connection.
 *
 * @author TINI Security Team & Gemini
 * @version 2.0.0 - Real SQLite Integration
 * @license MIT
 */

// Use require for Node.js environment
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class TINISQLiteAdapter {
    constructor(options = {}) {
        // Ensure the path is resolved correctly from the project root
        this.dbPath = options.dbPath || path.resolve(process.cwd(), 'admin panel', 'sqlite-init', 'tini_admin.db');
        this.isInitialized = false;
        this.connection = null;
        // Simulation mode is now deprecated in favor of a real connection.
        this.simulationMode = false; 

        console.log('📁 TINI SQLite Adapter v2.0.0 initialized');
    }

    /**
     * Initialize the SQLite database connection.
     * Returns a promise that resolves when the connection is established.
     */
    initialize() {
        return new Promise((resolve, reject) => {
            console.log(`🔧 Initializing SQLite database at: ${this.dbPath}`);
            
            // Check if running in a browser, if so, cannot proceed.
            if (typeof window !== 'undefined') {
                const errorMsg = 'SQLite cannot run in a browser environment. This adapter is for server-side use.';
                console.error(`❌ ${errorMsg}`);
                this.isInitialized = false;
                return reject(new Error(errorMsg));
            }

            this.connection = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ SQLite connection failed:', err.message);
                    this.isInitialized = false;
                    return reject(err);
                }
                console.log('✅ SQLite database connected successfully.');
                this.isInitialized = true;
                resolve(true);
            });
        });
    }

    /**
     * Test database connection by running a simple query.
     */
    async testConnection() {
        try {
            if (!this.isInitialized || !this.connection) {
                console.warn('⚠️ Connection not initialized. Attempting to initialize...');
                await this.initialize();
            }
            await this.query('SELECT 1');
            console.log('✅ SQLite connection test successful.');
            return true;
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        }
    }

    /**
     * Execute an SQL query that returns multiple rows.
     * @param {string} sql The SQL query to execute.
     * @param {Array} params The parameters for the query.
     * @returns {Promise<Array>} A promise that resolves with an array of rows.
     */
    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized) {
                return reject(new Error('Database not initialized.'));
            }
            this.connection.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('❌ SQL query error:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Execute an SQL query that is not expected to return rows (e.g., INSERT, UPDATE, DELETE).
     * @param {string} sql The SQL query to execute.
     * @param {Array} params The parameters for the query.
     * @returns {Promise<{changes: number, lastID: number}>} A promise that resolves with an object containing the number of changed rows and the last inserted ID.
     */
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.isInitialized) {
                return reject(new Error('Database not initialized.'));
            }
            // Using 'function()' to get access to 'this' from the library context
            this.connection.run(sql, params, function(err) {
                if (err) {
                    console.error('❌ SQL run error:', err.message);
                    reject(err);
                } else {
                    // 'this' refers to the statement object
                    resolve({ changes: this.changes, lastID: this.lastID });
                }
            });
        });
    }

    /**
     * Close the database connection.
     */
    close() {
        return new Promise((resolve, reject) => {
            if (this.connection) {
                this.connection.close((err) => {
                    if (err) {
                        console.error('❌ Failed to close SQLite connection:', err.message);
                        return reject(err);
                    }
                    console.log('🔌 SQLite connection closed.');
                    this.isInitialized = false;
                    this.connection = null;
                    resolve(true);
                });
            } else {
                resolve(true); // Already closed
            }
        });
    }

    /**
     * Get database statistics.
     */
    async getStatistics() {
        if (!this.isInitialized) {
             console.warn("⚠️ Cannot get stats, database not initialized.");
             return { totalUsers: 0, activeUsers: 0, activeSessions: 0, todayActivities: 0, securityEvents: 0 };
        }
        try {
            const [totalUsers] = await this.query('SELECT COUNT(*) as count FROM users');
            const [activeUsers] = await this.query('SELECT COUNT(*) as count FROM users WHERE status = ?', ['active']);
            const [activeSessions] = await this.query('SELECT COUNT(*) as count FROM sessions WHERE is_active = 1 AND datetime(expires_at) > datetime("now")');
            const [todayActivities] = await this.query('SELECT COUNT(*) as count FROM activities WHERE date(created_at) = "now"')
            const [securityEvents] = await this.query('SELECT COUNT(*) as count FROM security_events');

            return {
                totalUsers: totalUsers?.count || 0,
                activeUsers: activeUsers?.count || 0,
                activeSessions: activeSessions?.count || 0,
                todayActivities: todayActivities?.count || 0,
                securityEvents: securityEvents?.count || 0
            };
        } catch (error) {
            console.error('❌ Failed to get statistics:', error);
            return { totalUsers: 0, activeUsers: 0, activeSessions: 0, todayActivities: 0, securityEvents: 0 };
        }
    }
    
    /**
     * Get recent activities for dashboard
     */
    async getRecentActivities(limit = 10) {
        return this.query('SELECT * FROM activities ORDER BY created_at DESC LIMIT ?', [limit]);
    }

    /**
     * Get security events for dashboard
     */
    async getSecurityEvents(limit = 10) {
        return this.query('SELECT * FROM security_events ORDER BY created_at DESC LIMIT ?', [limit]);
    }

    /**
     * Get user list for admin panel
     */
    async getUsers(status = null) {
        let sql = 'SELECT * FROM users';
        let params = [];

        if (status) {
            sql += ' WHERE status = ?';
            params.push(status);
        }

        sql += ' ORDER BY created_at DESC';
        return this.query(sql, params);
    }

    /**
     * Set up the initial database schema with all required tables
     * This method includes the new tables for profiles and user preferences
     */
    async setupDatabase() {
        try {
            console.log('🏗️ Setting up database schema...');

            // Original tables (users, activities, security_events)
            const tables = [
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    full_name TEXT NOT NULL UNIQUE,
                    device_id TEXT NOT NULL UNIQUE,
                    role TEXT DEFAULT 'employee',
                    last_known_ip TEXT,
                    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'active'
                );`,

                `CREATE TABLE IF NOT EXISTS activities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    activity_type TEXT NOT NULL,
                    description TEXT,
                    ip_address TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                );`,

                `CREATE TABLE IF NOT EXISTS security_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    severity TEXT DEFAULT 'LOW',
                    description TEXT,
                    details TEXT,
                    ip_address TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );`,

                // NEW: User Profiles Table
                `CREATE TABLE IF NOT EXISTS user_profiles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    email TEXT,
                    department TEXT,
                    language TEXT DEFAULT 'zh',
                    timezone TEXT DEFAULT 'UTC+7',
                    theme TEXT DEFAULT 'dark',
                    avatar_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(employee_id)
                );`,

                // NEW: User Preferences Table
                `CREATE TABLE IF NOT EXISTS user_preferences (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    preference_key TEXT NOT NULL,
                    preference_value TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, preference_key)
                );`,

                // NEW: System Settings Table
                `CREATE TABLE IF NOT EXISTS system_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    setting_key TEXT NOT NULL UNIQUE,
                    setting_value TEXT,
                    description TEXT,
                    updated_by TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );`
            ];

            // Execute all table creation queries
            for (const tableSql of tables) {
                await this.run(tableSql);
            }

            // Insert default data
            await this.insertDefaultData();

            console.log('✅ Database schema setup completed successfully');
            return true;

        } catch (error) {
            console.error('❌ Database setup failed:', error);
            throw error;
        }
    }

    /**
     * Insert default data into tables
     */
    async insertDefaultData() {
        try {
            // Check if default admin profile exists
            const existingProfile = await this.query(
                'SELECT id FROM user_profiles WHERE employee_id = ?', 
                ['EMP001']
            );

            if (existingProfile.length === 0) {
                // Insert default admin profile
                await this.run(
                    `INSERT INTO user_profiles 
                    (employee_id, full_name, email, department, language, timezone, theme) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ['EMP001', 'Administrator', 'admin@tini.com', 'IT Department', 'zh', 'UTC+7', 'dark']
                );
                console.log('✅ Default admin profile created');
            }

            // Insert default language preference
            const existingLangPref = await this.query(
                'SELECT id FROM user_preferences WHERE user_id = ? AND preference_key = ?',
                ['admin', 'language']
            );

            if (existingLangPref.length === 0) {
                await this.run(
                    `INSERT INTO user_preferences (user_id, preference_key, preference_value) 
                    VALUES (?, ?, ?)`,
                    ['admin', 'language', 'zh']
                );
                console.log('✅ Default language preference created');
            }

            // Insert default system settings
            const defaultSettings = [
                ['default_language', 'zh', 'Default system language'],
                ['theme', 'dark', 'Default system theme'],
                ['auto_save', 'true', 'Auto-save user preferences'],
                ['session_timeout', '3600', 'Session timeout in seconds']
            ];

            for (const [key, value, description] of defaultSettings) {
                const existingSetting = await this.query(
                    'SELECT id FROM system_settings WHERE setting_key = ?',
                    [key]
                );

                if (existingSetting.length === 0) {
                    await this.run(
                        `INSERT INTO system_settings (setting_key, setting_value, description, updated_by) 
                        VALUES (?, ?, ?, ?)`,
                        [key, value, description, 'system']
                    );
                }
            }

            console.log('✅ Default data insertion completed');

        } catch (error) {
            console.error('❌ Error inserting default data:', error);
            throw error;
        }
    }
}

// Make it globally available
if (typeof window !== 'undefined') {
    window.TINISQLiteAdapter = TINISQLiteAdapter;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINISQLiteAdapter;
}

console.log('📁 TINI SQLite Adapter v2.0.0 module loaded');