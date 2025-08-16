// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - CONFIDENTIAL
// Fixed Migration script: JSON to SQLite3 for Enterprise Scale
// Author: TINI Security Team
// Date: 2025-08-15

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FixedJSONToSQLiteMigration {
    constructor() {
        this.dbPath = path.join(__dirname, 'admin-panel', 'tini_admin.db');
        this.registrationsPath = path.join(__dirname, 'admin-panel', 'registrations.json');
        this.db = null;
    }

    async migrate() {
        console.log('🔄 Starting FIXED migration from JSON to SQLite3...');
        
        try {
            // 1. Initialize database connection
            await this.initializeDatabase();
            
            // 2. Create enterprise schema
            await this.createEnterpriseSchema();
            
            // 3. Migrate data from JSON
            await this.migrateRegistrationData();
            
            // 4. Create indexes for performance
            await this.createPerformanceIndexes();
            
            // 5. Verify migration
            await this.verifyMigration();
            
            // 6. Backup JSON files
            await this.backupJSONFiles();
            
            console.log('✅ Migration completed successfully!');
            return true;
            
        } catch (error) {
            console.error('💥 Migration failed:', error);
            return false;
        } finally {
            if (this.db) {
                this.db.close();
            }
        }
    }

    async initializeDatabase() {
        console.log('📱 Initializing database connection...');
        
        // Ensure directory exists
        const dbDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
            console.log('📁 Created database directory');
        }

        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, async (err) => {
                if (err) {
                    console.error('❌ Database connection failed:', err);
                    reject(err);
                } else {
                    console.log('✅ Connected to SQLite database');
                    
                    try {
                        // Apply optimizations
                        await this.applyOptimizations();
                        resolve();
                    } catch (optimizationError) {
                        reject(optimizationError);
                    }
                }
            });
        });
    }

    async applyOptimizations() {
        console.log('⚡ Applying SQLite optimizations...');
        
        const optimizations = [
            "PRAGMA journal_mode = WAL",
            "PRAGMA synchronous = NORMAL",
            "PRAGMA cache_size = 10000",
            "PRAGMA temp_store = memory",
            "PRAGMA mmap_size = 268435456"
        ];

        for (const pragma of optimizations) {
            await this.runQuery(pragma);
        }
        
        console.log('✅ SQLite optimized for enterprise scale');
    }

    async createEnterpriseSchema() {
        console.log('🏗️ Creating enterprise schema...');
        
        const tables = [
            // Main device registrations table
            `CREATE TABLE IF NOT EXISTS device_registrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                normalized_name VARCHAR(255),
                device_id VARCHAR(36) UNIQUE NOT NULL,
                device_fingerprint_hash VARCHAR(256),
                device_status TEXT DEFAULT 'approved' CHECK(device_status IN ('pending', 'approved', 'blocked', 'drift')),
                
                -- Registration info
                internal_ip VARCHAR(45),
                user_agent TEXT,
                registration_ip VARCHAR(45),
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Login tracking
                last_login_at TIMESTAMP,
                last_login_ip VARCHAR(45),
                last_user_agent TEXT,
                
                -- Security
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
                security_notes TEXT
            )`,

            // Security events
            `CREATE TABLE IF NOT EXISTS security_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type VARCHAR(50) NOT NULL,
                severity TEXT CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
                employee_id VARCHAR(50),
                description TEXT NOT NULL,
                details TEXT,
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (let i = 0; i < tables.length; i++) {
            await this.runQuery(tables[i]);
            console.log(`✅ Table ${i + 1}/${tables.length} created`);
        }
    }

    async migrateRegistrationData() {
        console.log('📊 Migrating registration data...');
        
        if (!fs.existsSync(this.registrationsPath)) {
            console.log('⚠️ No registrations.json found - skipping data migration');
            return;
        }

        const registrations = JSON.parse(fs.readFileSync(this.registrationsPath, 'utf8'));
        console.log(`📋 Found ${registrations.length} registrations to migrate`);

        if (registrations.length === 0) {
            console.log('⚠️ No registrations to migrate');
            return;
        }

        const insertSQL = `
            INSERT OR REPLACE INTO device_registrations (
                employee_id, full_name, normalized_name, device_id, 
                device_fingerprint_hash, internal_ip, user_agent, 
                registration_ip, registered_at, device_status, 
                last_login_at, last_login_ip, last_user_agent
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    reg.internalIp || null,
                    reg.userAgent || null,
                    reg.lastLoginIp || reg.internalIp || null,
                    reg.registeredAt || new Date().toISOString(),
                    reg.status || 'approved',
                    reg.lastLoginAt || null,
                    reg.lastLoginIp || null,
                    reg.lastUserAgent || reg.userAgent || null
                ];

                await this.runQuery(insertSQL, params);
                migratedCount++;

                console.log(`📝 Migrated: ${reg.fullName} (${migratedCount}/${registrations.length})`);

            } catch (error) {
                console.error(`❌ Failed to migrate registration for ${reg.fullName}:`, error.message);
            }
        }

        console.log(`✅ Successfully migrated ${migratedCount}/${registrations.length} registrations`);
    }

    async createPerformanceIndexes() {
        console.log('🚀 Creating performance indexes...');
        
        const indexes = [
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_employee_id ON device_registrations(employee_id)",
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_device_id ON device_registrations(device_id)",
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_fingerprint_hash ON device_registrations(device_fingerprint_hash)",
            "CREATE INDEX IF NOT EXISTS idx_device_registrations_status ON device_registrations(device_status)",
            "CREATE INDEX IF NOT EXISTS idx_device_access_logs_employee_id ON device_access_logs(employee_id)",
            "CREATE INDEX IF NOT EXISTS idx_device_access_logs_access_time ON device_access_logs(access_time)",
            "CREATE INDEX IF NOT EXISTS idx_security_events_employee_id ON security_events(employee_id)",
            "CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at)"
        ];

        for (let i = 0; i < indexes.length; i++) {
            await this.runQuery(indexes[i]);
            console.log(`✅ Index ${i + 1}/${indexes.length} created`);
        }
    }

    async verifyMigration() {
        console.log('🔍 Verifying migration...');
        
        const count = await this.getQuery("SELECT COUNT(*) as count FROM device_registrations");
        console.log(`✅ Total registrations in database: ${count.count}`);
        
        // Test a simple select
        const sample = await this.getQuery("SELECT * FROM device_registrations LIMIT 1");
        if (sample) {
            console.log(`✅ Sample record: ${sample.full_name} (${sample.employee_id})`);
        }
        
        return count.count;
    }

    async backupJSONFiles() {
        console.log('💾 Backing up JSON files...');
        
        const backupDir = path.join(__dirname, 'migration-backup-' + Date.now());
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        const filesToBackup = [
            'admin-panel/registrations.json',
            'admin-panel/registrations.backup.json'
        ];

        let backedUpCount = 0;
        for (const file of filesToBackup) {
            const fullPath = path.join(__dirname, file);
            if (fs.existsSync(fullPath)) {
                const backupPath = path.join(backupDir, path.basename(file));
                fs.copyFileSync(fullPath, backupPath);
                console.log(`📦 Backed up: ${file}`);
                backedUpCount++;
            }
        }

        if (backedUpCount > 0) {
            console.log(`💾 JSON files backed up to: ${backupDir}`);
        } else {
            console.log('⚠️ No JSON files found to backup');
        }
    }

    // Helper methods
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not connected'));
                return;
            }

            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('❌ Query failed:', err.message);
                    console.error('   SQL:', sql);
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
    }

    getQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not connected'));
                return;
            }

            this.db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('❌ Query failed:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    generateEmployeeId(fullName) {
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
}

// Run migration
if (require.main === module) {
    console.log('🚀 Starting Fixed Migration Process...');
    
    const migration = new FixedJSONToSQLiteMigration();
    migration.migrate()
        .then((success) => {
            if (success) {
                console.log('🎉 Migration completed successfully!');
                console.log('');
                console.log('🔍 To verify, run:');
                console.log('node -e "const sqlite3=require(\'sqlite3\'); const db=new sqlite3.Database(\'admin-panel/tini_admin.db\'); db.get(\'SELECT COUNT(*) as count FROM device_registrations\', (err,row)=>{ if(err) console.error(err); else console.log(\'Records:\',row.count); db.close(); });"');
                process.exit(0);
            } else {
                console.log('❌ Migration failed!');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('💥 Migration error:', error);
            process.exit(1);
        });
}

module.exports = FixedJSONToSQLiteMigration;
