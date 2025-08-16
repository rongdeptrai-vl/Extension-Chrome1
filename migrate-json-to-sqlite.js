// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - CONFIDENTIAL
// Migration script: JSON to SQLite3 for Enterprise Scale
// Author: TINI Security Team
// Date: 2025-08-15

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class JSONToSQLiteMigration {
    constructor() {
        this.dbPath = path.join(__dirname, 'admin-panel', 'tini_admin.db');
        this.registrationsPath = path.join(__dirname, 'admin-panel', 'registrations.json');
        this.db = null;
    }

    async migrate() {
        console.log('🔄 Starting migration from JSON to SQLite3...');
        
        // 1. Initialize optimized SQLite
        await this.initializeOptimizedDB();
        
        // 2. Create enterprise schema
        await this.createEnterpriseSchema();
        
        // 3. Migrate data from JSON
        await this.migrateRegistrationData();
        
        // 4. Create indexes for performance
        await this.createPerformanceIndexes();
        
        // 5. Backup JSON files
        await this.backupJSONFiles();
        
        console.log('✅ Migration completed successfully!');
    }

    async initializeOptimizedDB() {
        // Connect to database first
        await new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ Database connection failed:', err);
                    reject(err);
                } else {
                    console.log('📱 Connected to SQLite database');
                    resolve();
                }
            });
        });

        // Enable WAL mode for better concurrency
        await this.runQuery("PRAGMA journal_mode = WAL;");
        
        // Optimize for 2000 users
        await this.runQuery("PRAGMA synchronous = NORMAL;");
        await this.runQuery("PRAGMA cache_size = 10000;");
        await this.runQuery("PRAGMA temp_store = memory;");
        await this.runQuery("PRAGMA mmap_size = 268435456;"); // 256MB
        
        console.log('⚡ SQLite optimized for enterprise scale');
    }

    async createEnterpriseSchema() {
        const tables = [
            // Main device registrations table
            `CREATE TABLE IF NOT EXISTS device_registrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                normalized_name VARCHAR(255) NOT NULL,
                device_id VARCHAR(36) UNIQUE NOT NULL,
                device_fingerprint_hash VARCHAR(256),
                device_fingerprint_raw BLOB, -- Encrypted with AES
                fp_version INTEGER DEFAULT 1,
                device_status TEXT DEFAULT 'approved' CHECK(device_status IN ('pending', 'approved', 'blocked', 'drift')),
                
                -- Registration info
                internal_ip VARCHAR(45),
                user_agent TEXT,
                registration_ip VARCHAR(45),
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Approval workflow
                approved_by VARCHAR(50),
                approved_at TIMESTAMP,
                
                -- Security
                pepper_salt VARCHAR(64),
                last_drift_check TIMESTAMP,
                security_score INTEGER DEFAULT 100,
                
                -- Audit trail
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            // Device access logs
            `CREATE TABLE IF NOT EXISTS device_access_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id VARCHAR(50) NOT NULL,
                device_fingerprint_hash VARCHAR(256),
                access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                access_result TEXT CHECK(access_result IN ('success', 'blocked', 'pending', 'drift_detected')),
                ip_address VARCHAR(45),
                user_agent TEXT,
                security_notes TEXT,
                
                FOREIGN KEY (employee_id) REFERENCES device_registrations(employee_id)
            )`,

            // Admin approvals log
            `CREATE TABLE IF NOT EXISTS admin_approvals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_registration_id INTEGER NOT NULL,
                admin_id VARCHAR(50) NOT NULL,
                action TEXT CHECK(action IN ('approve', 'block', 'require_mfa')),
                action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                
                FOREIGN KEY (device_registration_id) REFERENCES device_registrations(id)
            )`,

            // Security events
            `CREATE TABLE IF NOT EXISTS security_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type VARCHAR(50) NOT NULL,
                severity TEXT CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
                employee_id VARCHAR(50),
                device_fingerprint_hash VARCHAR(256),
                description TEXT NOT NULL,
                details TEXT, -- JSON data
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const tableSQL of tables) {
            await this.runQuery(tableSQL);
            console.log('✅ Table created/updated');
        }
    }

    async migrateRegistrationData() {
        if (!fs.existsSync(this.registrationsPath)) {
            console.log('⚠️ No registrations.json found - skipping data migration');
            return;
        }

        const registrations = JSON.parse(fs.readFileSync(this.registrationsPath, 'utf8'));
        console.log(`📊 Found ${registrations.length} registrations to migrate`);

        const insertSQL = `
            INSERT INTO device_registrations (
                employee_id, full_name, normalized_name, device_id, 
                device_fingerprint_hash, internal_ip, user_agent, 
                registration_ip, registered_at, device_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let migratedCount = 0;
        for (const reg of registrations) {
            try {
                // Generate employee_id from full_name if not exists
                const employeeId = reg.employeeId || this.generateEmployeeId(reg.fullName);
                
                // Hash fingerprint if exists
                const fingerprintHash = reg.fingerprint && reg.fingerprint !== 'none' 
                    ? this.hashFingerprint(reg.fingerprint) 
                    : null;

                const params = [
                    employeeId,
                    reg.fullName,
                    reg.normalizedName || this.normalizeName(reg.fullName),
                    reg.deviceId,
                    fingerprintHash,
                    reg.internalIp || reg.lastLoginIp,
                    reg.userAgent,
                    reg.lastLoginIp || reg.internalIp,
                    reg.registeredAt,
                    reg.status || 'approved'
                ];

                await this.runQuery(insertSQL, params);
                migratedCount++;

                // Log initial access
                if (reg.lastLoginAt) {
                    await this.runQuery(`
                        INSERT INTO device_access_logs 
                        (employee_id, device_fingerprint_hash, access_time, access_result, ip_address, user_agent)
                        VALUES (?, ?, ?, 'success', ?, ?)
                    `, [employeeId, fingerprintHash, reg.lastLoginAt, reg.lastLoginIp, reg.userAgent]);
                }

            } catch (error) {
                console.error(`❌ Failed to migrate registration for ${reg.fullName}:`, error.message);
            }
        }

        console.log(`✅ Successfully migrated ${migratedCount}/${registrations.length} registrations`);
    }

    async createPerformanceIndexes() {
        const indexes = [
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_employee_id ON device_registrations(employee_id)",
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_device_id ON device_registrations(device_id)",
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_fingerprint_hash ON device_registrations(device_fingerprint_hash)",
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_status ON device_registrations(device_status)",
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_created_at ON device_registrations(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_device_access_logs_employee_id ON device_access_logs(employee_id)",
            "CREATE INDEX IF NOT EXISTS idx_device_access_logs_access_time ON device_access_logs(access_time)",
            "CREATE INDEX IF NOT EXISTS idx_device_access_logs_result ON device_access_logs(access_result)",
            "CREATE INDEX IF NOT EXISTS idx_security_events_employee_id ON security_events(employee_id)",
            "CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity)",
            "CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at)",
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_employee_device_unique ON device_registrations(employee_id, device_id)"
        ];

        for (const indexSQL of indexes) {
            await this.runQuery(indexSQL);
        }

        console.log('🚀 Performance indexes created');
    }

    async backupJSONFiles() {
        const backupDir = path.join(__dirname, 'migration-backup-' + Date.now());
        fs.mkdirSync(backupDir);

        const filesToBackup = [
            'admin-panel/registrations.json',
            'admin-panel/registrations.backup.json'
        ];

        for (const file of filesToBackup) {
            const fullPath = path.join(__dirname, file);
            if (fs.existsSync(fullPath)) {
                const backupPath = path.join(backupDir, path.basename(file));
                fs.copyFileSync(fullPath, backupPath);
                console.log(`📦 Backed up: ${file}`);
            }
        }

        console.log(`💾 JSON files backed up to: ${backupDir}`);
    }

    // Helper methods
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    generateEmployeeId(fullName) {
        // Generate employee ID from name hash
        const hash = crypto.createHash('md5').update(fullName).digest('hex');
        return `EMP_${hash.substring(0, 8).toUpperCase()}`;
    }

    normalizeName(name) {
        return name.trim().replace(/\s+/g, ' ').toLowerCase();
    }

    hashFingerprint(fingerprint) {
        const pepper = process.env.FINGERPRINT_PEPPER || 'TINI_FINGERPRINT_SALT_2024';
        return crypto.createHmac('sha256', pepper).update(fingerprint).digest('hex');
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

// Run migration
if (require.main === module) {
    const migration = new JSONToSQLiteMigration();
    migration.migrate()
        .then(() => {
            console.log('🎉 Migration completed successfully!');
            migration.close();
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Migration failed:', error);
            migration.close();
            process.exit(1);
        });
}

module.exports = JSONToSQLiteMigration;
