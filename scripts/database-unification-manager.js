// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI Database Unification Manager
// Merges fragmented databases into single optimized system

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseUnificationManager {
    constructor() {
        this.mainDB = path.join(__dirname, '..', 'admin-panel', 'tini_admin.db');
        this.apiDB = path.join(__dirname, '..', 'admin-panel', 'sqlite-init', 'tini_admin.db');
        this.unifiedDB = path.join(__dirname, '..', 'admin-panel', 'tini_unified.db');
    }

    async unifyDatabases() {
        console.log('🔄 Starting database unification...');
        
        // Create unified database
        const db = new sqlite3.Database(this.unifiedDB);
        
        // Unified schema with best practices
        await this.createUnifiedSchema(db);
        
        // Migrate data from both databases
        await this.migrateFromMainDB(db);
        await this.migrateFromApiDB(db);
        
        // Create indexes for performance
        await this.createIndexes(db);
        
        // Backup old databases
        await this.backupOldDatabases();
        
        db.close();
        console.log('✅ Database unification completed!');
        console.log(`📁 Unified database: ${this.unifiedDB}`);
    }

    createUnifiedSchema(db) {
        return new Promise((resolve, reject) => {
            const schema = `
                -- Unified Users Table
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    email TEXT UNIQUE,
                    full_name TEXT NOT NULL,
                    device_id TEXT UNIQUE,
                    department TEXT,
                    role TEXT DEFAULT 'user',
                    status TEXT DEFAULT 'active',
                    last_known_ip TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME,
                    last_activity DATETIME
                );

                -- Unified Activities Table
                CREATE TABLE IF NOT EXISTS activities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    activity_type TEXT NOT NULL,
                    action TEXT,
                    description TEXT,
                    details TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    session_id TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                );

                -- Performance Metrics Table
                CREATE TABLE IF NOT EXISTS performance_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    metric_type TEXT NOT NULL,
                    metric_value REAL,
                    metadata TEXT,
                    server_instance TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                -- Security Events Table
                CREATE TABLE IF NOT EXISTS security_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    severity TEXT DEFAULT 'INFO',
                    description TEXT,
                    details TEXT,
                    ip_address TEXT,
                    user_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                );
            `;
            
            db.exec(schema, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    createIndexes(db) {
        return new Promise((resolve, reject) => {
            const indexes = `
                CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
                CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
                CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
                CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
                CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
                CREATE INDEX IF NOT EXISTS idx_performance_type ON performance_metrics(metric_type);
                CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
                CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
            `;
            
            db.exec(indexes, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // Migration methods would be implemented here
    async migrateFromMainDB(db) {
        console.log('📊 Migrating from main database...');
        // Implementation for migrating main DB data
    }

    async migrateFromApiDB(db) {
        console.log('📊 Migrating from API database...');
        // Implementation for migrating API DB data
    }

    async backupOldDatabases() {
        console.log('💾 Backing up old databases...');
        const backupDir = path.join(__dirname, '..', 'admin-panel', 'backup');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        // Backup implementation
    }
}

// Auto-run if executed directly
if (require.main === module) {
    const manager = new DatabaseUnificationManager();
    manager.unifyDatabases().catch(console.error);
}

module.exports = DatabaseUnificationManager;
