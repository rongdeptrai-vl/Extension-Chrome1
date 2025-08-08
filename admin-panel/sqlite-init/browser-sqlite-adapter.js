// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI Browser SQLite Adapter
 * Browser-compatible SQLite adapter for TINI Admin Panel
 * Uses localStorage and API calls instead of direct SQLite
 *
 * @author TINI Security Team
 * @version 1.0.0 - Browser Compatible
 * @license MIT
 */

class TINIBrowserSQLiteAdapter {
    constructor(options = {}) {
        this.apiUrl = options.apiUrl || 'http://localhost:8099/api';
        this.isInitialized = false;
        this.simulationMode = true; // Browser always uses simulation mode
        
        console.log('🌐 TINI Browser SQLite Adapter v1.0.0 initialized');
        console.log('📝 Using localStorage + API simulation for browser compatibility');
    }

    /**
     * Initialize the browser adapter
     */
    async initialize() {
        try {
            console.log('🔧 Initializing Browser SQLite adapter...');
            
            // Check if we can access localStorage
            if (typeof localStorage === 'undefined') {
                throw new Error('localStorage not available');
            }
            
            // Initialize default data if not exists
            this.initializeDefaultData();
            
            this.isInitialized = true;
            console.log('✅ Browser SQLite adapter initialized successfully');
            return Promise.resolve();
            
        } catch (error) {
            console.error('❌ Browser SQLite adapter initialization failed:', error);
            this.isInitialized = false;
            return Promise.reject(error);
        }
    }

    /**
     * Initialize default data in localStorage
     */
    initializeDefaultData() {
        try {
            // Initialize users table
            if (!localStorage.getItem('tini_users')) {
                const defaultUsers = [
                    {
                        id: 1,
                        employee_id: 'EMP001',
                        username: 'admin',
                        email: 'admin@tini.com',
                        name: 'Administrator',
                        role: 'admin',
                        department: 'IT',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        last_login: new Date().toISOString()
                    },
                    {
                        id: 2,
                        employee_id: 'EMP002',
                        username: 'manager',
                        email: 'manager@tini.com',
                        name: 'Manager User',
                        role: 'manager',
                        department: 'Operations',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        last_login: new Date().toISOString()
                    },
                    {
                        id: 3,
                        employee_id: 'EMP003',
                        username: 'user',
                        email: 'user@tini.com',
                        name: 'Regular User',
                        role: 'user',
                        department: 'Sales',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        last_login: null
                    }
                ];
                localStorage.setItem('tini_users', JSON.stringify(defaultUsers));
                console.log('📊 Default users data initialized');
            }

            // Initialize activities table
            if (!localStorage.getItem('tini_activities')) {
                const defaultActivities = [
                    {
                        id: 1,
                        user_id: 1,
                        action: 'login',
                        description: 'Admin logged into system',
                        ip_address: '127.0.0.1',
                        user_agent: navigator.userAgent || 'Unknown',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 2,
                        user_id: 2,
                        action: 'view_dashboard',
                        description: 'Manager viewed dashboard',
                        ip_address: '127.0.0.1',
                        user_agent: navigator.userAgent || 'Unknown',
                        created_at: new Date(Date.now() - 3600000).toISOString()
                    }
                ];
                localStorage.setItem('tini_activities', JSON.stringify(defaultActivities));
                console.log('📊 Default activities data initialized');
            }

            // Initialize system stats
            if (!localStorage.getItem('tini_system_stats')) {
                const defaultStats = {
                    total_users: 3,
                    active_users: 2,
                    total_activities: 2,
                    last_updated: new Date().toISOString()
                };
                localStorage.setItem('tini_system_stats', JSON.stringify(defaultStats));
                console.log('📊 Default system stats initialized');
            }

        } catch (error) {
            console.error('❌ Error initializing default data:', error);
        }
    }

    /**
     * Execute a query (simulated for browser)
     */
    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.isInitialized) {
                    return reject(new Error('Database not initialized'));
                }

                console.log(`📝 Executing query: ${sql}`);
                
                // Parse SQL and simulate results
                const result = this.simulateQuery(sql, params);
                resolve(result);
                
            } catch (error) {
                console.error('❌ Query execution error:', error);
                reject(error);
            }
        });
    }

    /**
     * Simulate SQL queries using localStorage
     */
    simulateQuery(sql, params = []) {
        const sqlLower = sql.toLowerCase().trim();
        
        try {
            // SELECT queries
            if (sqlLower.startsWith('select')) {
                if (sqlLower.includes('from users')) {
                    const users = JSON.parse(localStorage.getItem('tini_users') || '[]');
                    return { rows: users };
                }
                
                if (sqlLower.includes('from activities')) {
                    const activities = JSON.parse(localStorage.getItem('tini_activities') || '[]');
                    return { rows: activities };
                }
                
                if (sqlLower.includes('count')) {
                    if (sqlLower.includes('users')) {
                        const users = JSON.parse(localStorage.getItem('tini_users') || '[]');
                        return { rows: [{ count: users.length }] };
                    }
                    if (sqlLower.includes('activities')) {
                        const activities = JSON.parse(localStorage.getItem('tini_activities') || '[]');
                        return { rows: [{ count: activities.length }] };
                    }
                }
            }
            
            // INSERT queries
            if (sqlLower.startsWith('insert')) {
                if (sqlLower.includes('into users')) {
                    const users = JSON.parse(localStorage.getItem('tini_users') || '[]');
                    const newUser = {
                        id: users.length + 1,
                        employee_id: params[0] || `EMP${String(users.length + 1).padStart(3, '0')}`,
                        username: params[1] || 'newuser',
                        email: params[2] || 'newuser@tini.com',
                        name: params[3] || 'New User',
                        role: params[4] || 'user',
                        department: params[5] || 'General',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        last_login: null
                    };
                    users.push(newUser);
                    localStorage.setItem('tini_users', JSON.stringify(users));
                    return { insertId: newUser.id };
                }
                
                if (sqlLower.includes('into activities')) {
                    const activities = JSON.parse(localStorage.getItem('tini_activities') || '[]');
                    const newActivity = {
                        id: activities.length + 1,
                        user_id: params[0] || 1,
                        action: params[1] || 'unknown',
                        description: params[2] || 'Unknown action',
                        ip_address: params[3] || '127.0.0.1',
                        user_agent: params[4] || navigator.userAgent,
                        created_at: new Date().toISOString()
                    };
                    activities.push(newActivity);
                    localStorage.setItem('tini_activities', JSON.stringify(activities));
                    return { insertId: newActivity.id };
                }
            }
            
            // UPDATE queries
            if (sqlLower.startsWith('update')) {
                if (sqlLower.includes('users')) {
                    const users = JSON.parse(localStorage.getItem('tini_users') || '[]');
                    // Simple update simulation
                    localStorage.setItem('tini_users', JSON.stringify(users));
                    return { changes: 1 };
                }
            }
            
            // DELETE queries
            if (sqlLower.startsWith('delete')) {
                if (sqlLower.includes('from users')) {
                    const users = JSON.parse(localStorage.getItem('tini_users') || '[]');
                    // Simple delete simulation
                    localStorage.setItem('tini_users', JSON.stringify(users));
                    return { changes: 1 };
                }
            }
            
            // Default response
            return { rows: [], changes: 0 };
            
        } catch (error) {
            console.error('❌ Query simulation error:', error);
            throw error;
        }
    }

    /**
     * Close connection (no-op for browser)
     */
    close() {
        console.log('🔚 Browser SQLite adapter closed');
        this.isInitialized = false;
        return Promise.resolve();
    }

    /**
     * Test connection
     */
    async testConnection() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            const result = await this.query('SELECT 1 as test');
            console.log('✅ Browser SQLite connection test successful');
            return true;
        } catch (error) {
            console.error('❌ Browser SQLite connection test failed:', error);
            return false;
        }
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.TINIBrowserSQLiteAdapter = TINIBrowserSQLiteAdapter;
    console.log('🌐 TINIBrowserSQLiteAdapter registered to window object');
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIBrowserSQLiteAdapter;
}
