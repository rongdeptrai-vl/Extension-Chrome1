// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - DATABASE SCHEMA UPGRADE FOR SECURITY
// Comprehensive database schema upgrade for enterprise security features

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class TiniDatabaseUpgrade {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ Connected to SQLite database for upgrade');
                    resolve();
                }
            });
        });
    }

    async executeQuery(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes, lastID: this.lastID });
                }
            });
        });
    }

    async checkTableExists(tableName) {
        return new Promise((resolve, reject) => {
            const query = "SELECT name FROM sqlite_master WHERE type='table' AND name=?";
            this.db.get(query, [tableName], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }

    // Upgrade device_registrations table
    async upgradeDeviceRegistrationsTable() {
        console.log('🔄 Upgrading device_registrations table...');

        const exists = await this.checkTableExists('device_registrations');
        if (!exists) {
            console.log('❌ device_registrations table not found');
            return;
        }

        // Add new columns for security features
        const newColumns = [
            {
                name: 'device_fingerprint_raw',
                type: 'BLOB',
                description: 'Encrypted raw fingerprint data'
            },
            {
                name: 'fingerprint_version',
                type: 'INTEGER DEFAULT 1',
                description: 'Fingerprint algorithm version'
            },
            {
                name: 'pepper_salt',
                type: 'VARCHAR(64)',
                description: 'Server-side pepper for hashing'
            },
            {
                name: 'security_score',
                type: 'INTEGER DEFAULT 100',
                description: 'Device security score'
            },
            {
                name: 'drift_tolerance',
                type: 'INTEGER DEFAULT 80',
                description: 'Drift detection tolerance %'
            },
            {
                name: 'last_drift_check',
                type: 'TIMESTAMP',
                description: 'Last drift detection check'
            },
            {
                name: 'approved_by',
                type: 'VARCHAR(50)',
                description: 'Admin who approved device'
            },
            {
                name: 'approved_at',
                type: 'TIMESTAMP',
                description: 'When device was approved'
            },
            {
                name: 'blocked_reason',
                type: 'TEXT',
                description: 'Reason for blocking device'
            },
            {
                name: 'risk_level',
                type: 'VARCHAR(20) DEFAULT "LOW"',
                description: 'Risk assessment level'
            }
        ];

        for (const column of newColumns) {
            try {
                await this.executeQuery(`ALTER TABLE device_registrations ADD COLUMN ${column.name} ${column.type}`);
                console.log(`✅ Added column: ${column.name}`);
            } catch (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log(`⚠️ Column ${column.name} already exists`);
                } else {
                    console.error(`❌ Error adding column ${column.name}:`, err.message);
                }
            }
        }

        // Update device_status to include new statuses
        try {
            await this.executeQuery(`
                UPDATE device_registrations 
                SET device_status = 'approved' 
                WHERE device_status NOT IN ('pending', 'approved', 'blocked', 'drift', 'suspended')
            `);
        } catch (err) {
            console.error('❌ Error updating device_status:', err.message);
        }
    }

    // Create MFA settings table
    async createMFATable() {
        console.log('🔄 Creating MFA settings table...');

        const query = `
            CREATE TABLE IF NOT EXISTS user_mfa_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id VARCHAR(50) UNIQUE NOT NULL,
                secret VARCHAR(255) NOT NULL,
                backup_codes TEXT,
                enabled INTEGER DEFAULT 0,
                setup_completed INTEGER DEFAULT 0,
                last_used TIMESTAMP,
                failed_attempts INTEGER DEFAULT 0,
                locked_until TIMESTAMP,
                disabled_by VARCHAR(50),
                disabled_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES device_registrations(employee_id)
            )
        `;

        await this.executeQuery(query);
        console.log('✅ MFA settings table created');

        // Create indexes
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_mfa_user_id ON user_mfa_settings(user_id)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_mfa_enabled ON user_mfa_settings(enabled)');
    }

    // Create sessions table
    async createSessionsTable() {
        console.log('🔄 Creating user sessions table...');

        const query = `
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id VARCHAR(64) UNIQUE NOT NULL,
                user_id VARCHAR(50) NOT NULL,
                device_id VARCHAR(36) NOT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                access_token_hash VARCHAR(64),
                refresh_token_hash VARCHAR(64),
                csrf_token VARCHAR(64),
                mfa_verified INTEGER DEFAULT 0,
                expires_at TIMESTAMP NOT NULL,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES device_registrations(employee_id),
                FOREIGN KEY (device_id) REFERENCES device_registrations(device_id)
            )
        `;

        await this.executeQuery(query);
        console.log('✅ User sessions table created');

        // Create indexes
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_sessions_device_id ON user_sessions(device_id)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON user_sessions(session_id)');
    }

    // Create drift detection logs table
    async createDriftLogsTable() {
        console.log('🔄 Creating device drift logs table...');

        const query = `
            CREATE TABLE IF NOT EXISTS device_drift_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id VARCHAR(50) NOT NULL,
                device_id VARCHAR(36),
                old_fingerprint_hash VARCHAR(256),
                new_fingerprint_hash VARCHAR(256),
                similarity_score REAL,
                drift_status VARCHAR(50),
                action_taken VARCHAR(100),
                severity VARCHAR(20),
                requires_mfa INTEGER DEFAULT 0,
                requires_admin_review INTEGER DEFAULT 0,
                blocked INTEGER DEFAULT 0,
                admin_reviewed_by VARCHAR(50),
                admin_reviewed_at TIMESTAMP,
                admin_action VARCHAR(100),
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES device_registrations(employee_id)
            )
        `;

        await this.executeQuery(query);
        console.log('✅ Device drift logs table created');

        // Create indexes
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_drift_user_id ON device_drift_logs(user_id)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_drift_status ON device_drift_logs(drift_status)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_drift_severity ON device_drift_logs(severity)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_drift_created ON device_drift_logs(created_at)');
    }

    // Create audit logs table
    async createAuditLogsTable() {
        console.log('🔄 Creating audit logs table...');

        const query = `
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type VARCHAR(50) NOT NULL,
                user_id VARCHAR(50),
                admin_user_id VARCHAR(50),
                resource_type VARCHAR(50),
                resource_id VARCHAR(100),
                action VARCHAR(100) NOT NULL,
                details TEXT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                session_id VARCHAR(64),
                success INTEGER DEFAULT 1,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await this.executeQuery(query);
        console.log('✅ Audit logs table created');

        // Create indexes
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_logs(event_type)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_audit_admin_user ON audit_logs(admin_user_id)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action)');
    }

    // Create security events table
    async createSecurityEventsTable() {
        console.log('🔄 Creating security events table...');

        const query = `
            CREATE TABLE IF NOT EXISTS security_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type VARCHAR(50) NOT NULL,
                severity VARCHAR(20) NOT NULL,
                user_id VARCHAR(50),
                device_id VARCHAR(36),
                ip_address VARCHAR(45),
                description TEXT NOT NULL,
                details TEXT,
                resolved INTEGER DEFAULT 0,
                resolved_by VARCHAR(50),
                resolved_at TIMESTAMP,
                resolution_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await this.executeQuery(query);
        console.log('✅ Security events table created');

        // Create indexes
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_security_event_type ON security_events(event_type)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_security_severity ON security_events(severity)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_security_resolved ON security_events(resolved)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_security_created ON security_events(created_at)');
    }

    // Create admin pending approvals table
    async createPendingApprovalsTable() {
        console.log('🔄 Creating pending approvals table...');

        const query = `
            CREATE TABLE IF NOT EXISTS pending_approvals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_type VARCHAR(50) NOT NULL,
                user_id VARCHAR(50) NOT NULL,
                device_id VARCHAR(36),
                request_data TEXT,
                priority VARCHAR(20) DEFAULT 'MEDIUM',
                status VARCHAR(20) DEFAULT 'PENDING',
                assigned_to VARCHAR(50),
                approved_by VARCHAR(50),
                approved_at TIMESTAMP,
                rejected_by VARCHAR(50),
                rejected_at TIMESTAMP,
                rejection_reason TEXT,
                auto_approve_eligible INTEGER DEFAULT 0,
                expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES device_registrations(employee_id)
            )
        `;

        await this.executeQuery(query);
        console.log('✅ Pending approvals table created');

        // Create indexes
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_approvals(status)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_pending_type ON pending_approvals(request_type)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_pending_priority ON pending_approvals(priority)');
        await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_pending_expires ON pending_approvals(expires_at)');
    }

    // Run complete upgrade
    async runUpgrade() {
        console.log('🚀 Starting database upgrade for enterprise security...');
        
        try {
            await this.connect();
            
            // Create backup
            const backupPath = this.dbPath + '.backup.' + Date.now();
            await this.createBackup(backupPath);
            
            // Run upgrades
            await this.upgradeDeviceRegistrationsTable();
            await this.createMFATable();
            await this.createSessionsTable();
            await this.createDriftLogsTable();
            await this.createAuditLogsTable();
            await this.createSecurityEventsTable();
            await this.createPendingApprovalsTable();
            
            console.log('✅ Database upgrade completed successfully!');
            console.log(`📁 Backup created: ${backupPath}`);
            
            return { success: true, backupPath };
            
        } catch (error) {
            console.error('❌ Database upgrade failed:', error);
            throw error;
        } finally {
            if (this.db) {
                this.db.close();
            }
        }
    }

    // Create database backup
    async createBackup(backupPath) {
        return new Promise((resolve, reject) => {
            const sourceStream = fs.createReadStream(this.dbPath);
            const targetStream = fs.createWriteStream(backupPath);
            
            sourceStream.pipe(targetStream);
            
            targetStream.on('finish', () => {
                console.log(`✅ Database backup created: ${backupPath}`);
                resolve();
            });
            
            targetStream.on('error', reject);
            sourceStream.on('error', reject);
        });
    }

    // Get upgrade status
    async getUpgradeStatus() {
        await this.connect();
        
        const tables = [
            'user_mfa_settings',
            'user_sessions', 
            'device_drift_logs',
            'audit_logs',
            'security_events',
            'pending_approvals'
        ];
        
        const status = {};
        
        for (const table of tables) {
            status[table] = await this.checkTableExists(table);
        }
        
        this.db.close();
        return status;
    }
}

module.exports = TiniDatabaseUpgrade;
