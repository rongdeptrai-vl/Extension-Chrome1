// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI DATABASE INTEGRATION MODULE - SQLite Edition
 * SQLite Database Management for Admin Panel with Real Data
 * Author: TINI Security Team
 * Version: 3.0 - SQLite Real Data Integration
 */

class TINIDatabaseIntegration {
    constructor() {
        this.version = '3.0-SQLite';
        this.isInitialized = false;
        this.connections = {
            sqlite: {
                status: 'DISCONNECTED',
                path: null,
                database: null,
                lastCheck: null,
                error: null,
                adapter: null
            }
        };
        
        this.config = {
            sqlite: {
                path: './admin panel/sqlite-init/tini-database.db',
                initScript: './admin panel/sqlite-init/init-database.sql',
                timeout: 5000,
                retryAttempts: 3
            }
        };
        
        this.healthCheckInterval = null;
        this.realDataMode = true;
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing TINI Database Integration v' + this.version);
        
        try {
            await this.loadEnvironmentConfig();
            this.setupUI();
            await this.initializeSQLite();
            this.startHealthMonitoring();
            this.isInitialized = true;
            
            console.log('✅ Database integration initialized successfully');
            
            // Load real data after initialization
            await this.loadRealData();
            
        } catch (error) {
            console.error('❌ Database integration initialization failed:', error);
            this.displayError('Initialization failed: ' + error.message);
        }
    }
    
    async loadEnvironmentConfig() {
        // For browser environment, use defaults with potential overrides
        if (typeof window !== 'undefined') {
            // Check for configuration in localStorage or global variables
            const savedConfig = localStorage.getItem('tini_database_config');
            if (savedConfig) {
                try {
                    const config = JSON.parse(savedConfig);
                    this.config.sqlite = { ...this.config.sqlite, ...config.sqlite };
                } catch (error) {
                    console.warn('⚠️ Failed to parse saved database config');
                }
            }
        }
        
        console.log('📦 SQLite configuration loaded:', {
            path: this.config.sqlite.path,
            timeout: this.config.sqlite.timeout
        });
    }
    
    setupUI() {
        // Add database status to dashboard
        const statusPanel = document.querySelector('.status-panel');
        if (statusPanel) {
            const dbStatusHTML = `
                <div class="db-status-section">
                    <h3 data-i18n="database_status">Database Status</h3>
                    <div class="db-connections">
                        <div class="db-connection sqlite-connection">
                            <div class="db-icon">📁</div>
                            <div class="db-info">
                                <div class="db-name">SQLite Database</div>
                                <div class="db-status" id="sqlite-status">CHECKING...</div>
                                <div class="db-details" id="sqlite-details"></div>
                            </div>
                            <div class="db-actions">
                                <button class="btn-test" onclick="tiniDatabaseIntegration.testConnection('sqlite')">
                                    <span data-i18n="test_connection">Test</span>
                                </button>
                                <button class="btn-init" onclick="tiniDatabaseIntegration.initializeDatabase()">
                                    <span data-i18n="init_database">Initialize</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="db-statistics" id="db-statistics">
                        <div class="stat-item">
                            <div class="stat-label">Total Users</div>
                            <div class="stat-value" id="stat-total-users">-</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Active Sessions</div>
                            <div class="stat-value" id="stat-active-sessions">-</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Today's Activities</div>
                            <div class="stat-value" id="stat-today-activities">-</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Security Events</div>
                            <div class="stat-value" id="stat-security-events">-</div>
                        </div>
                    </div>
                </div>
            `;
            
            statusPanel.insertAdjacentHTML('beforeend', dbStatusHTML);
        }
        
        // Add database styling
        const style = document.createElement('style');
        style.textContent = `
            .db-status-section {
                background: #2a2a2a;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                border: 1px solid #444;
            }
            
            .db-connections {
                display: flex;
                gap: 20px;
                margin: 15px 0;
                flex-wrap: wrap;
            }
            
            .db-connection {
                background: #1e1e1e;
                border: 1px solid #333;
                border-radius: 6px;
                padding: 15px;
                flex: 1;
                min-width: 300px;
                display: flex;
                gap: 12px;
                align-items: center;
            }
            
            .db-icon {
                font-size: 24px;
                width: 40px;
                text-align: center;
            }
            
            .db-info {
                flex: 1;
            }
            
            .db-name {
                font-weight: bold;
                color: #fff;
                margin-bottom: 5px;
            }
            
            .db-status {
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 12px;
                display: inline-block;
                margin-bottom: 5px;
            }
            
            .db-status.connected {
                background: #28a745;
                color: white;
            }
            
            .db-status.disconnected {
                background: #dc3545;
                color: white;
            }
            
            .db-status.checking {
                background: #ffc107;
                color: black;
            }
            
            .db-details {
                font-size: 11px;
                color: #aaa;
            }
            
            .db-actions {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .btn-test, .btn-init {
                background: #007bff;
                border: none;
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.3s;
            }
            
            .btn-test:hover, .btn-init:hover {
                background: #0056b3;
            }
            
            .btn-init {
                background: #28a745;
            }
            
            .btn-init:hover {
                background: #1e7e34;
            }
            
            .db-statistics {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
                padding: 15px;
                background: #1a1a1a;
                border-radius: 6px;
                border: 1px solid #333;
            }
            
            .stat-item {
                text-align: center;
                padding: 10px;
                background: #2a2a2a;
                border-radius: 4px;
                border: 1px solid #444;
            }
            
            .stat-label {
                font-size: 12px;
                color: #aaa;
                margin-bottom: 5px;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #4CAF50;
            }
            
            .stat-updating {
                animation: pulse 0.5s ease-in-out;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    async initializeSQLite() {
        try {
            console.log('📁 Initializing SQLite database...');
            
            // Try to use SQLite adapter if available
            // Use browser-compatible SQLite adapter
            if (typeof window !== 'undefined' && window.TINIBrowserSQLiteAdapter) {
                this.connections.sqlite.adapter = new window.TINIBrowserSQLiteAdapter();
                await this.connections.sqlite.adapter.initialize();
                
                this.connections.sqlite.status = 'CONNECTED';
                this.connections.sqlite.path = this.config.sqlite.path;
                this.connections.sqlite.lastCheck = new Date();
                this.connections.sqlite.error = null;
                
                console.log('✅ SQLite adapter connected successfully');
            } else {
                // Fallback to simulation mode
                console.log('⚠️ SQLite adapter not available, using simulation mode');
                this.connections.sqlite.status = 'SIMULATED';
                this.connections.sqlite.path = this.config.sqlite.path;
                this.connections.sqlite.lastCheck = new Date();
                this.connections.sqlite.error = null;
            }
            
            this.updateConnectionStatus('sqlite');
            return true;
            
        } catch (error) {
            console.error('❌ SQLite initialization failed:', error);
            this.connections.sqlite.status = 'ERROR';
            this.connections.sqlite.error = error.message;
            this.updateConnectionStatus('sqlite');
            throw error;
        }
    }
    
    async testConnection(type = 'sqlite') {
        if (type !== 'sqlite') return false;
        
        console.log('🔍 Testing SQLite connection...');
        
        try {
            if (this.connections.sqlite.adapter) {
                const result = await this.connections.sqlite.adapter.testConnection();
                if (result) {
                    this.connections.sqlite.status = 'CONNECTED';
                    this.connections.sqlite.error = null;
                } else {
                    this.connections.sqlite.status = 'ERROR';
                    this.connections.sqlite.error = 'Connection test failed';
                }
            } else {
                // Simulation mode test
                this.connections.sqlite.status = 'SIMULATED';
                this.connections.sqlite.error = null;
            }
            
            this.connections.sqlite.lastCheck = new Date();
            this.updateConnectionStatus('sqlite');
            
            return this.connections.sqlite.status === 'CONNECTED' || this.connections.sqlite.status === 'SIMULATED';
            
        } catch (error) {
            console.error('❌ SQLite connection test failed:', error);
            this.connections.sqlite.status = 'ERROR';
            this.connections.sqlite.error = error.message;
            this.connections.sqlite.lastCheck = new Date();
            this.updateConnectionStatus('sqlite');
            return false;
        }
    }
    
    async initializeDatabase() {
        try {
            console.log('🔧 Initializing database schema...');
            
            if (this.connections.sqlite.adapter) {
                await this.connections.sqlite.adapter.initializeSchema();
                console.log('✅ Database schema initialized');
                
                // Load sample data
                await this.loadSampleData();
                
                // Refresh statistics
                await this.loadRealData();
                
                this.displaySuccess('Database initialized successfully with sample data');
            } else {
                console.log('⚠️ Database initialization simulated');
                this.displayInfo('Database initialization simulated - real data not available');
            }
            
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            this.displayError('Database initialization failed: ' + error.message);
        }
    }
    
    async loadSampleData() {
        if (!this.connections.sqlite.adapter) {
            console.log('⚠️ Sample data loading simulated');
            return;
        }
        
        try {
            console.log('📊 Loading sample data...');
            
            // This would typically read from the SQL init file
            // For now, we'll use the adapter's sample data methods
            await this.connections.sqlite.adapter.loadSampleData();
            
            console.log('✅ Sample data loaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to load sample data:', error);
            throw error;
        }
    }
    
    async loadRealData() {
        try {
            let statistics = {
                totalUsers: 8,
                activeSessions: 6,
                todayActivities: 10,
                securityEvents: 8
            };
            
            // If we have real SQLite connection, get real data
            if (this.connections.sqlite.adapter && this.connections.sqlite.status === 'CONNECTED') {
                statistics = await this.getRealStatistics();
            }
            
            // Update UI with statistics
            this.updateStatistics(statistics);
            
        } catch (error) {
            console.error('❌ Failed to load real data:', error);
            this.displayError('Failed to load database statistics');
        }
    }
    
    async getRealStatistics() {
        if (!this.connections.sqlite.adapter) {
            return null;
        }
        
        try {
            const stats = {};
            
            // Get total users
            const userResult = await this.connections.sqlite.adapter.query('SELECT COUNT(*) as count FROM users');
            stats.totalUsers = userResult[0]?.count || 0;
            
            // Get active sessions
            const sessionResult = await this.connections.sqlite.adapter.query(
                'SELECT COUNT(*) as count FROM sessions WHERE is_active = 1 AND datetime(expires_at) > datetime("now")'
            );
            stats.activeSessions = sessionResult[0]?.count || 0;
            
            // Get today's activities
            const activityResult = await this.connections.sqlite.adapter.query(
                'SELECT COUNT(*) as count FROM activities WHERE date(created_at) = date("now")'
            );
            stats.todayActivities = activityResult[0]?.count || 0;
            
            // Get security events
            const securityResult = await this.connections.sqlite.adapter.query('SELECT COUNT(*) as count FROM security_events');
            stats.securityEvents = securityResult[0]?.count || 0;
            
            return stats;
            
        } catch (error) {
            console.error('❌ Failed to get real statistics:', error);
            return null;
        }
    }
    
    updateStatistics(stats) {
        const elements = {
            'stat-total-users': stats.totalUsers,
            'stat-active-sessions': stats.activeSessions,
            'stat-today-activities': stats.todayActivities,
            'stat-security-events': stats.securityEvents
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('stat-updating');
                setTimeout(() => {
                    element.textContent = value.toLocaleString();
                    element.classList.remove('stat-updating');
                }, 200);
            }
        });
    }
    
    updateConnectionStatus(type) {
        const connection = this.connections[type];
        if (!connection) return;
        
        const statusElement = document.getElementById(`${type}-status`);
        const detailsElement = document.getElementById(`${type}-details`);
        
        if (statusElement) {
            statusElement.className = 'db-status';
            
            switch (connection.status) {
                case 'CONNECTED':
                    statusElement.classList.add('connected');
                    statusElement.textContent = 'CONNECTED';
                    break;
                case 'SIMULATED':
                    statusElement.classList.add('connected');
                    statusElement.textContent = 'SIMULATED';
                    break;
                case 'DISCONNECTED':
                    statusElement.classList.add('disconnected');
                    statusElement.textContent = 'DISCONNECTED';
                    break;
                case 'ERROR':
                    statusElement.classList.add('disconnected');
                    statusElement.textContent = 'ERROR';
                    break;
                default:
                    statusElement.classList.add('checking');
                    statusElement.textContent = 'CHECKING...';
            }
        }
        
        if (detailsElement) {
            let details = '';
            if (connection.path) {
                details += `Path: ${connection.path}<br>`;
            }
            if (connection.lastCheck) {
                details += `Last check: ${connection.lastCheck.toLocaleTimeString()}<br>`;
            }
            if (connection.error) {
                details += `<span style="color: #ff6b6b;">Error: ${connection.error}</span>`;
            }
            detailsElement.innerHTML = details;
        }
    }
    
    startHealthMonitoring() {
        // Check database health every 30 seconds
        this.healthCheckInterval = setInterval(async () => {
            await this.testConnection('sqlite');
            
            // Refresh statistics every few checks
            if (Math.random() < 0.3) { // 30% chance
                await this.loadRealData();
            }
        }, 30000);
        
        console.log('💓 Database health monitoring started');
    }
    
    stopHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
            console.log('💓 Database health monitoring stopped');
        }
    }
    
    displaySuccess(message) {
        this.showNotification(message, 'success');
    }
    
    displayError(message) {
        this.showNotification(message, 'error');
    }
    
    displayInfo(message) {
        this.showNotification(message, 'info');
    }
    
    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        
        // Try to show in UI if notification system exists
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback to browser notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 6px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.transition = 'opacity 0.3s ease';
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 5000);
        }
    }
    
    getStatus() {
        return {
            version: this.version,
            initialized: this.isInitialized,
            realDataMode: this.realDataMode,
            connections: this.connections,
            config: this.config
        };
    }
    
    async executeQuery(query, params = []) {
        if (!this.connections.sqlite.adapter) {
            throw new Error('SQLite adapter not available');
        }
        
        try {
            return await this.connections.sqlite.adapter.query(query, params);
        } catch (error) {
            console.error('❌ Query execution failed:', error);
            throw error;
        }
    }
}

// Global instance
let tiniDatabaseIntegration = null;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    tiniDatabaseIntegration = new TINIDatabaseIntegration();
    
    // Make it globally available
    window.tiniDatabaseIntegration = tiniDatabaseIntegration;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIDatabaseIntegration;
}
