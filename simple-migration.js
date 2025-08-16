// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// SIMPLE MIGRATION - No complex async/await
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Simple Migration...');

// Paths
const dbPath = path.join(__dirname, 'admin-panel', 'tini_admin.db');
const jsonPath = path.join(__dirname, 'admin-panel', 'registrations.json');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('📁 Created admin-panel directory');
}

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Connected to SQLite database');
    
    // Step 1: Create table
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS device_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id VARCHAR(50) UNIQUE NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            device_id VARCHAR(36) UNIQUE NOT NULL,
            device_fingerprint_hash VARCHAR(256),
            device_status TEXT DEFAULT 'approved',
            internal_ip VARCHAR(45),
            user_agent TEXT,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login_at TIMESTAMP,
            last_login_ip VARCHAR(45),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('❌ Table creation failed:', err.message);
            process.exit(1);
        }
        
        console.log('✅ Table created successfully');
        
        // Step 2: Check if JSON file exists
        if (!fs.existsSync(jsonPath)) {
            console.log('⚠️ No registrations.json found - creating empty database');
            finishMigration();
            return;
        }
        
        // Step 3: Read and migrate JSON data
        let registrations;
        try {
            registrations = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            console.log(`📊 Found ${registrations.length} registrations to migrate`);
        } catch (err) {
            console.error('❌ Failed to read JSON file:', err.message);
            process.exit(1);
        }
        
        if (registrations.length === 0) {
            console.log('⚠️ No registrations to migrate');
            finishMigration();
            return;
        }
        
        // Step 4: Insert data
        const insertSQL = `
            INSERT OR REPLACE INTO device_registrations (
                employee_id, full_name, device_id, device_fingerprint_hash,
                device_status, internal_ip, user_agent, registered_at,
                last_login_at, last_login_ip
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        let migratedCount = 0;
        let totalCount = registrations.length;
        
        registrations.forEach((reg, index) => {
            // Generate employee_id from full_name
            const employeeId = generateEmployeeId(reg.fullName);
            
            // Prepare parameters
            const params = [
                employeeId,
                reg.fullName,
                reg.deviceId,
                reg.fingerprint && reg.fingerprint !== 'none' ? hashFingerprint(reg.fingerprint) : null,
                reg.status || 'approved',
                reg.internalIp || null,
                reg.userAgent || null,
                reg.registeredAt || new Date().toISOString(),
                reg.lastLoginAt || null,
                reg.lastLoginIp || null
            ];
            
            db.run(insertSQL, params, (err) => {
                if (err) {
                    console.error(`❌ Failed to migrate ${reg.fullName}:`, err.message);
                } else {
                    migratedCount++;
                    console.log(`✅ Migrated: ${reg.fullName} (${migratedCount}/${totalCount})`);
                }
                
                // Check if all done
                if (index === totalCount - 1) {
                    setTimeout(() => finishMigration(migratedCount, totalCount), 100);
                }
            });
        });
    });
});

function finishMigration(migratedCount = 0, totalCount = 0) {
    // Create indexes
    const indexes = [
        "CREATE INDEX IF NOT EXISTS idx_employee_id ON device_registrations(employee_id)",
        "CREATE INDEX IF NOT EXISTS idx_device_id ON device_registrations(device_id)",
        "CREATE INDEX IF NOT EXISTS idx_device_status ON device_registrations(device_status)"
    ];
    
    let indexCount = 0;
    indexes.forEach((indexSQL, i) => {
        db.run(indexSQL, (err) => {
            if (err) {
                console.error(`❌ Index ${i + 1} failed:`, err.message);
            } else {
                console.log(`✅ Index ${i + 1}/${indexes.length} created`);
            }
            
            indexCount++;
            if (indexCount === indexes.length) {
                // Final verification
                db.get("SELECT COUNT(*) as count FROM device_registrations", (err, row) => {
                    if (err) {
                        console.error('❌ Verification failed:', err.message);
                    } else {
                        console.log(`✅ Final verification: ${row.count} records in database`);
                    }
                    
                    // Close database
                    db.close((err) => {
                        if (err) {
                            console.error('❌ Close failed:', err.message);
                        } else {
                            console.log('✅ Database closed successfully');
                        }
                        
                        console.log('\n🎉 MIGRATION COMPLETED!');
                        console.log('===============================');
                        if (totalCount > 0) {
                            console.log(`📊 Migrated: ${migratedCount}/${totalCount} registrations`);
                        }
                        console.log('📱 Database ready for production');
                        console.log('\n🔍 To verify:');
                        console.log('node -e "const sqlite3=require(\'sqlite3\'); const db=new sqlite3.Database(\'admin-panel/tini_admin.db\'); db.get(\'SELECT COUNT(*) as count FROM device_registrations\', (err,row)=>console.log(\'Records:\',row?.count||0)); db.close();"');
                    });
                });
            }
        });
    });
}

// Helper functions
function generateEmployeeId(fullName) {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(fullName).digest('hex');
    return `EMP_${hash.substring(0, 8).toUpperCase()}`;
}

function hashFingerprint(fingerprint) {
    const crypto = require('crypto');
    const pepper = process.env.FINGERPRINT_PEPPER || 'TINI_FINGERPRINT_SALT_2024';
    return crypto.createHmac('sha256', pepper).update(fingerprint).digest('hex');
}
