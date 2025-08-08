// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI SQLite Database Adapter
 * Lightweight database solution with real data persistence
 * Author: TINI Security Team
 * Version: 1.0 - SQLite Integration
 */

class TINISQLiteAdapter {
    constructor() {
        this.version = '1.0';
        this.dbName = 'tini_admin_panel.db';
        this.isInitialized = false;
        this.db = null;
        this.cache = new Map();
        
        // Use Web SQL API or IndexedDB as fallback
        this.storageType = this.detectStorageType();
        this.init();
    }
    
    detectStorageType() {
        // Check for available storage options
        if (window.openDatabase) {
            return 'websql';
        } else if (window.indexedDB) {
            return 'indexeddb';
        } else {
            return 'localstorage';
        }
    }
    
    async init() {
        console.log('🔗 TINI SQLite Adapter initializing...');
        
        try {
            switch (this.storageType) {
                case 'websql':
                    await this.initWebSQL();
                    break;
                case 'indexeddb':
                    await this.initIndexedDB();
                    break;
                default:
                    await this.initLocalStorage();
            }
            
            await this.createTables();
            await this.seedSampleData();
            
            this.isInitialized = true;
            console.log('✅ SQLite Adapter initialized successfully');
            
            // Update database integration status
            this.updateDatabaseStatus();
            
        } catch (error) {
            console.error('❌ SQLite initialization failed:', error);
            this.fallbackToMemory();
        }
    }
    
    async initWebSQL() {
        console.log('📦 Using Web SQL Database');
        this.db = window.openDatabase(this.dbName, '1.0', 'TINI Admin Panel Database', 5 * 1024 * 1024);
    }
    
    async initIndexedDB() {
        console.log('📦 Using IndexedDB');
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores (tables)
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    userStore.createIndex('username', 'username', { unique: true });
                    userStore.createIndex('email', 'email', { unique: true });
                }
                
                if (!db.objectStoreNames.contains('activities')) {
                    const activityStore = db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
                    activityStore.createIndex('user_id', 'user_id');
                    activityStore.createIndex('timestamp', 'created_at');
                }
                
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionStore = db.createObjectStore('sessions', { keyPath: 'session_id' });
                    sessionStore.createIndex('user_id', 'user_id');
                }
                
                if (!db.objectStoreNames.contains('system_stats')) {
                    db.createObjectStore('system_stats', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }
    
    async initLocalStorage() {
        console.log('📦 Using LocalStorage fallback');
        this.db = {
            users: JSON.parse(localStorage.getItem('tini_users') || '[]'),
            activities: JSON.parse(localStorage.getItem('tini_activities') || '[]'),
            sessions: JSON.parse(localStorage.getItem('tini_sessions') || '[]'),
            system_stats: JSON.parse(localStorage.getItem('tini_system_stats') || '[]')
        };
    }
    
    async createTables() {
        if (this.storageType === 'websql') {
            await this.createWebSQLTables();
        }
        // IndexedDB and LocalStorage tables created in init methods
    }
    
    async createWebSQLTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE,
                full_name TEXT,
                role TEXT DEFAULT 'user',
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )`,
            `CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                activity_type TEXT NOT NULL,
                description TEXT,
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                user_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                is_active BOOLEAN DEFAULT 1
            )`,
            `CREATE TABLE IF NOT EXISTS system_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stat_name TEXT NOT NULL,
                stat_value REAL,
                category TEXT,
                recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];
        
        for (const sql of tables) {
            await this.executeSQL(sql);
        }
    }
    
    async seedSampleData() {
        console.log('🌱 Seeding sample data...');
        
        // Check if data already exists
        const existingUsers = await this.getUsers();
        if (existingUsers.length > 0) {
            console.log('📊 Sample data already exists');
            return;
        }
        
        // Sample users
        const sampleUsers = [
            {
                username: 'admin',
                email: 'admin@tini-security.com',
                full_name: 'TINI Administrator',
                role: 'admin',
                status: 'active'
            },
            {
                username: 'john.doe',
                email: 'john.doe@company.com',
                full_name: 'John Doe',
                role: 'user',
                status: 'active'
            },
            {
                username: 'jane.smith',
                email: 'jane.smith@company.com',
                full_name: 'Jane Smith',
                role: 'manager',
                status: 'active'
            },
            {
                username: 'bob.wilson',
                email: 'bob.wilson@company.com',
                full_name: 'Bob Wilson',
                role: 'user',
                status: 'inactive'
            }
        ];
        
        // Insert sample users
        for (const user of sampleUsers) {
            await this.insertUser(user);
        }
        
        // Sample activities
        const sampleActivities = [
            { user_id: 1, activity_type: 'LOGIN', description: 'Admin logged in', ip_address: '192.168.1.100' },
            { user_id: 2, activity_type: 'PROFILE_UPDATE', description: 'Updated profile information', ip_address: '192.168.1.101' },
            { user_id: 3, activity_type: 'PASSWORD_CHANGE', description: 'Changed password', ip_address: '192.168.1.102' },
            { user_id: 2, activity_type: 'LOGOUT', description: 'User logged out', ip_address: '192.168.1.101' },
            { user_id: 1, activity_type: 'SECURITY_SCAN', description: 'Performed security scan', ip_address: '192.168.1.100' }
        ];
        
        for (const activity of sampleActivities) {
            await this.insertActivity(activity);
        }
        
        // Sample system statistics
        const sampleStats = [
            { stat_name: 'active_users', stat_value: 3, category: 'users' },
            { stat_name: 'total_logins_today', stat_value: 15, category: 'activity' },
            { stat_name: 'blocked_items', stat_value: 247, category: 'security' },
            { stat_name: 'system_uptime_hours', stat_value: 72.5, category: 'performance' },
            { stat_name: 'memory_usage_percent', stat_value: 45.2, category: 'performance' },
            { stat_name: 'cpu_usage_percent', stat_value: 23.8, category: 'performance' }
        ];
        
        for (const stat of sampleStats) {
            await this.insertSystemStat(stat);
        }
        
        console.log('✅ Sample data seeded successfully');
    }
    
    // User Management Methods
    async getUsers() {
        switch (this.storageType) {
            case 'websql':
                return await this.executeSQL('SELECT * FROM users ORDER BY created_at DESC');
            case 'indexeddb':
                return await this.getFromIndexedDB('users');
            default:
                return this.db.users || [];
        }
    }
    
    async getUserById(id) {
        switch (this.storageType) {
            case 'websql':
                const result = await this.executeSQL('SELECT * FROM users WHERE id = ?', [id]);
                return result[0] || null;
            case 'indexeddb':
                return await this.getFromIndexedDBById('users', id);
            default:
                return this.db.users.find(u => u.id === id) || null;
        }
    }
    
    async insertUser(userData) {
        const user = {
            ...userData,
            created_at: new Date().toISOString(),
            id: Date.now() + Math.random() // Simple ID generation
        };
        
        switch (this.storageType) {
            case 'websql':
                return await this.executeSQL(
                    'INSERT INTO users (username, email, full_name, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [user.username, user.email, user.full_name, user.role, user.status, user.created_at]
                );
            case 'indexeddb':
                return await this.insertToIndexedDB('users', user);
            default:
                this.db.users.push(user);
                localStorage.setItem('tini_users', JSON.stringify(this.db.users));
                return user;
        }
    }
    
    async updateUser(id, userData) {
        switch (this.storageType) {
            case 'websql':
                return await this.executeSQL(
                    'UPDATE users SET username=?, email=?, full_name=?, role=?, status=? WHERE id=?',
                    [userData.username, userData.email, userData.full_name, userData.role, userData.status, id]
                );
            case 'indexeddb':
                return await this.updateInIndexedDB('users', id, userData);
            default:
                const userIndex = this.db.users.findIndex(u => u.id === id);
                if (userIndex !== -1) {
                    this.db.users[userIndex] = { ...this.db.users[userIndex], ...userData };
                    localStorage.setItem('tini_users', JSON.stringify(this.db.users));
                }
                return userData;
        }
    }
    
    // Activity Management Methods
    async getActivities(limit = 50) {
        switch (this.storageType) {
            case 'websql':
                return await this.executeSQL(
                    'SELECT a.*, u.username, u.full_name FROM activities a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT ?',
                    [limit]
                );
            case 'indexeddb':
                const activities = await this.getFromIndexedDB('activities');
                return activities.slice(0, limit);
            default:
                return this.db.activities.slice(0, limit);
        }
    }
    
    async insertActivity(activityData) {
        const activity = {
            ...activityData,
            created_at: new Date().toISOString(),
            id: Date.now() + Math.random()
        };
        
        switch (this.storageType) {
            case 'websql':
                return await this.executeSQL(
                    'INSERT INTO activities (user_id, activity_type, description, ip_address, created_at) VALUES (?, ?, ?, ?, ?)',
                    [activity.user_id, activity.activity_type, activity.description, activity.ip_address, activity.created_at]
                );
            case 'indexeddb':
                return await this.insertToIndexedDB('activities', activity);
            default:
                this.db.activities.unshift(activity);
                localStorage.setItem('tini_activities', JSON.stringify(this.db.activities));
                return activity;
        }
    }
    
    // System Statistics Methods
    async getSystemStats() {
        switch (this.storageType) {
            case 'websql':
                return await this.executeSQL('SELECT * FROM system_stats ORDER BY recorded_at DESC');
            case 'indexeddb':
                return await this.getFromIndexedDB('system_stats');
            default:
                return this.db.system_stats || [];
        }
    }
    
    async insertSystemStat(statData) {
        const stat = {
            ...statData,
            recorded_at: new Date().toISOString(),
            id: Date.now() + Math.random()
        };
        
        switch (this.storageType) {
            case 'websql':
                return await this.executeSQL(
                    'INSERT INTO system_stats (stat_name, stat_value, category, recorded_at) VALUES (?, ?, ?, ?)',
                    [stat.stat_name, stat.stat_value, stat.category, stat.recorded_at]
                );
            case 'indexeddb':
                return await this.insertToIndexedDB('system_stats', stat);
            default:
                this.db.system_stats.push(stat);
                localStorage.setItem('tini_system_stats', JSON.stringify(this.db.system_stats));
                return stat;
        }
    }
    
    // Helper Methods for different storage types
    async executeSQL(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                tx.executeSql(sql, params, (tx, result) => {
                    const rows = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        rows.push(result.rows.item(i));
                    }
                    resolve(rows);
                }, (tx, error) => {
                    reject(error);
                });
            });
        });
    }
    
    async getFromIndexedDB(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async insertToIndexedDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    updateDatabaseStatus() {
        // Update the database integration status
        if (window.tiniDatabaseIntegration) {
            window.tiniDatabaseIntegration.connections.sqlite = {
                status: 'CONNECTED',
                type: this.storageType,
                database: this.dbName,
                lastCheck: new Date().toISOString(),
                error: null
            };
            
            // Update UI
            this.updateDatabaseUI();
        }
    }
    
    updateDatabaseUI() {
        // Update Database Status section in admin panel
        const sqliteStatus = document.createElement('div');
        sqliteStatus.className = 'db-connection sqlite-connection';
        sqliteStatus.innerHTML = `
            <div class="db-icon">💾</div>
            <div class="db-info">
                <div class="db-name">SQLite</div>
                <div class="db-status connected" id="sqlite-status">CONNECTED</div>
                <div class="db-details" id="sqlite-details">${this.storageType} | ${this.dbName}</div>
            </div>
            <div class="db-actions">
                <button class="btn-test" onclick="tiniSQLiteAdapter.testConnection()">
                    <span data-i18n="test_connection">Test</span>
                </button>
            </div>
        `;
        
        // Add to database status section if it exists
        const dbConnections = document.querySelector('.db-connections');
        if (dbConnections) {
            dbConnections.appendChild(sqliteStatus);
        }
    }
    
    async testConnection() {
        console.log('🔍 Testing SQLite connection...');
        try {
            const testResult = await this.getUsers();
            console.log('✅ SQLite connection test successful:', testResult.length, 'users found');
            return true;
        } catch (error) {
            console.error('❌ SQLite connection test failed:', error);
            return false;
        }
    }
    
    fallbackToMemory() {
        console.log('⚠️ Falling back to memory storage');
        this.storageType = 'memory';
        this.db = {
            users: [],
            activities: [],
            sessions: [],
            system_stats: []
        };
        this.isInitialized = true;
    }
    
    // Public API for admin panel integration
    async getDashboardData() {
        const users = await this.getUsers();
        const activities = await this.getActivities(10);
        const stats = await this.getSystemStats();
        
        return {
            users: {
                total: users.length,
                active: users.filter(u => u.status === 'active').length,
                recent: users.slice(0, 5)
            },
            activities: activities,
            statistics: stats,
            summary: {
                totalUsers: users.length,
                activeUsers: users.filter(u => u.status === 'active').length,
                recentActivities: activities.length,
                systemHealth: 95.8
            }
        };
    }
    
    async searchUsers(query) {
        const users = await this.getUsers();
        return users.filter(user => 
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.full_name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    async getUserActivities(userId, limit = 20) {
        const activities = await this.getActivities(100);
        return activities.filter(activity => activity.user_id === userId).slice(0, limit);
    }
}

// Initialize for the appropriate environment
if (typeof window !== 'undefined') {
    // Browser environment
    window.tiniSQLiteAdapter = new TINISQLiteAdapter();
    
    // Integration with existing database module
    if (window.tiniDatabaseIntegration) {
        // Override some methods to use SQLite
    }
} else {
    // Node.js environment
    module.exports = TINISQLiteAdapter;
}
    const originalGetDashboardData = window.tiniDatabaseIntegration.getDashboardData;
    
    if (typeof window !== 'undefined') {
        window.tiniDatabaseIntegration.getDashboardData = async function() {
            if (window.tiniSQLiteAdapter && window.tiniSQLiteAdapter.isInitialized) {
                return await window.tiniSQLiteAdapter.getDashboardData();
            }
            return originalGetDashboardData ? originalGetDashboardData.call(this) : {};
        };
    }

// Handle different environments
if (typeof window !== 'undefined') {
    // Browser environment
    window.tiniSQLiteAdapter = new TINISQLiteAdapter();
    globalThis.TINI_SQLITE_ADAPTER = window.tiniSQLiteAdapter;
} else {
    // Node.js environment
    module.exports = TINISQLiteAdapter;
}

console.log('🎯 TINI SQLite Adapter loaded successfully');
