// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI DATABASE INTEGRATION MODULE - SQLite Edition
 * Connects the Admin Panel UI to the backend API server.
 * Author: TINI Security Team & Gemini
 * Version: 4.0 - Full Stack API Integration
 */

class TINIDatabaseIntegration {
    constructor() {
        this.version = '4.0-API';
        this.isInitialized = false;
        this.apiBaseUrl = 'http://localhost:8080'; // The port your api-server.js is running on
        this.connections = {
            sqlite: {
                status: 'DISCONNECTED',
                path: 'via API',
                lastCheck: null,
                error: null
            }
        };
        this.healthCheckInterval = null;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing TINI Database Integration v' + this.version);
        try {
            this.setupUI();
            this.startHealthMonitoring();
            this.isInitialized = true;
            console.log('✅ Database integration UI initialized successfully');
        } catch (error) {
            console.error('❌ Database integration UI initialization failed:', error);
            this.displayError('Initialization failed: ' + error.message);
        }
    }

    setupUI() {
        const container = document.getElementById('dashboard') || document.body;
        if (!document.querySelector('.db-status-section')) {
            const dbStatusHTML = `
            <div class="db-status-section">
                <h3 data-i18n="database_status">Database Status</h3>
                <div class="db-connections">
                    <div class="db-connection sqlite-connection">
                        <div class="db-icon">📡</div>
                        <div class="db-info">
                            <div class="db-name">API Server</div>
                            <div class="db-status" id="sqlite-status">CHECKING...</div>
                            <div class="db-details" id="sqlite-details">Endpoint: ${this.apiBaseUrl}</div>
                        </div>
                        <div class="db-actions">
                            <button class="btn-test" onclick="window.tiniDatabaseIntegration.testConnection('sqlite')">
                                <span data-i18n="test_connection">Test</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="db-statistics" id="db-statistics">
                    <div class="stat-item"><div class="stat-label">Total Users</div><div class="stat-value" id="stat-total-users">-</div></div>
                    <div class="stat-item"><div class="stat-label">Active Users</div><div class="stat-value" id="stat-active-users">-</div></div>
                    <div class="stat-item"><div class="stat-label">Today's Activities</div><div class="stat-value" id="stat-today-activities">-</div></div>
                    <div class="stat-item"><div class="stat-label">Security Events</div><div class="stat-value" id="stat-security-events">-</div></div>
                </div>
            </div>`;
            container.insertAdjacentHTML('beforeend', dbStatusHTML);
        }
    }

    async testConnection(type = 'sqlite') {
        if (type !== 'sqlite') return;
        console.log(`🔍 Testing API server connection at ${this.apiBaseUrl}...`);
        this.updateConnectionStatus('sqlite', 'CHECKING');

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/health`);
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            const result = await response.json();
            if (result.status === 'ok') {
                this.updateConnectionStatus('sqlite', 'CONNECTED', `API server is healthy.`);
                this.loadRealData(); // Refresh data on successful connection
            } else {
                throw new Error('Health check returned non-ok status.');
            }
        } catch (error) {
            console.error('❌ API server connection test failed:', error);
            this.updateConnectionStatus('sqlite', 'ERROR', error.message);
        }
    }

    async loadRealData() {
        console.log('📊 Loading real data from API server...');
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/db/stats`);
            if (!response.ok) {
                throw new Error(`Failed to fetch stats, status ${response.status}`);
            }
            const statistics = await response.json();
            this.updateStatistics(statistics);
        } catch (error) {
            console.error('❌ Failed to load real data from API:', error);
            this.displayError('Failed to load database statistics.');
            // Clear stats on error
            this.updateStatistics({ totalUsers: 0, activeUsers: 0, activeSessions: 0, todayActivities: 0, securityEvents: 0 });
        }
    }

    updateStatistics(stats) {
        const elements = {
            'stat-total-users': stats.totalUsers,
            'stat-active-users': stats.activeUsers,
            'stat-active-sessions': stats.activeSessions,
            'stat-today-activities': stats.todayActivities,
            'stat-security-events': stats.securityEvents
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('stat-updating');
                setTimeout(() => {
                    element.textContent = (value !== undefined && value !== null) ? value.toLocaleString() : 'N/A';
                    element.classList.remove('stat-updating');
                }, 200);
            }
        });
    }

    updateConnectionStatus(type, status, message = '') {
        const connection = this.connections[type];
        if (!connection) return;

        connection.status = status;
        connection.lastCheck = new Date();
        connection.error = status === 'ERROR' ? message : null;

        const statusElement = document.getElementById(`${type}-status`);
        const detailsElement = document.getElementById(`${type}-details`);

        if (statusElement) {
            statusElement.className = 'db-status';
            statusElement.textContent = status;
            statusElement.classList.add(status.toLowerCase());
        }

        if (detailsElement) {
            let details = `Endpoint: ${this.apiBaseUrl}<br>Last check: ${connection.lastCheck.toLocaleTimeString()}`;
            if (connection.error) {
                details += `<br><span style="color: #ff6b6b;">Error: ${connection.error}</span>`;
            }
            detailsElement.innerHTML = details;
        }
    }

    startHealthMonitoring() {
        this.stopHealthMonitoring();
        this.testConnection('sqlite'); // Initial check
        this.healthCheckInterval = setInterval(() => {
            this.testConnection('sqlite');
        }, 60000); // Check every 60 seconds
        console.log('💓 API health monitoring started');
    }

    stopHealthMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
            console.log('💓 API health monitoring stopped');
        }
    }

    displayError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Global instance
let tiniDatabaseIntegration = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.tiniDatabaseIntegration) {
        tiniDatabaseIntegration = new TINIDatabaseIntegration();
        window.tiniDatabaseIntegration = tiniDatabaseIntegration;
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIDatabaseIntegration;
}
