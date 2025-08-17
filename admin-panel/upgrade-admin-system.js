// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 661d2ea | Time: 2025-08-17T12:09:46Z
// Watermark: TINI_1755432586_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - ADMIN ROLE SYSTEM UPGRADE
// Nâng cấp hệ thống phân quyền Admin Tổng

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tini_admin.db');

console.log('🏆 UPGRADING TO SUPER ADMIN SYSTEM...');
console.log('=====================================');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Connected to SQLite database');
    upgradeAdminSystem();
});

function upgradeAdminSystem() {
    // 1. Create admins table
    const createAdminsTable = `
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id VARCHAR(50) UNIQUE NOT NULL,
            username VARCHAR(100) UNIQUE NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'admin',
            permissions TEXT NOT NULL DEFAULT '["approve","delete"]',
            created_by VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login_at TIMESTAMP,
            status VARCHAR(20) DEFAULT 'active'
        )
    `;
    
    db.run(createAdminsTable, (err) => {
        if (err) {
            console.error('❌ Failed to create admins table:', err.message);
            return;
        }
        
        console.log('✅ Admins table created');
        
        // 2. Insert Super Admin (you)
        const insertSuperAdmin = `
            INSERT OR REPLACE INTO admins (
                admin_id, username, full_name, role, permissions, created_by, status
            ) VALUES (
                'SUPER_ADMIN_001', 
                'rongdeptrai-vl', 
                'Admin Tổng - TINI System', 
                'super_admin',
                '["all","promote","demote","approve","delete","manage_admins"]',
                'SYSTEM',
                'active'
            )
        `;
        
        db.run(insertSuperAdmin, (err) => {
            if (err) {
                console.error('❌ Failed to create Super Admin:', err.message);
                return;
            }
            
            console.log('🏅 Super Admin created: rongdeptrai-vl');
            
            // 3. Create admin sessions table
            createAdminSessions();
        });
    });
}

function createAdminSessions() {
    const createSessionsTable = `
        CREATE TABLE IF NOT EXISTS admin_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id VARCHAR(100) UNIQUE NOT NULL,
            admin_id VARCHAR(50) NOT NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            status VARCHAR(20) DEFAULT 'active',
            FOREIGN KEY (admin_id) REFERENCES admins (admin_id)
        )
    `;
    
    db.run(createSessionsTable, (err) => {
        if (err) {
            console.error('❌ Failed to create admin sessions table:', err.message);
            return;
        }
        
        console.log('✅ Admin sessions table created');
        
        // 4. Create audit log table
        createAuditLog();
    });
}

function createAuditLog() {
    const createAuditTable = `
        CREATE TABLE IF NOT EXISTS admin_audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id VARCHAR(50) NOT NULL,
            action VARCHAR(100) NOT NULL,
            target_type VARCHAR(50),
            target_id VARCHAR(100),
            old_value TEXT,
            new_value TEXT,
            ip_address VARCHAR(45),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            details TEXT
        )
    `;
    
    db.run(createAuditTable, (err) => {
        if (err) {
            console.error('❌ Failed to create audit log table:', err.message);
            return;
        }
        
        console.log('✅ Audit log table created');
        
        // 5. Create indexes
        createIndexes();
    });
}

function createIndexes() {
    const indexes = [
        "CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username)",
        "CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role)",
        "CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id)",
        "CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON admin_audit_log(admin_id)",
        "CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_log(action)"
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
                finishUpgrade();
            }
        });
    });
}

function finishUpgrade() {
    // Verify the setup
    db.get("SELECT * FROM admins WHERE role = 'super_admin'", (err, row) => {
        if (err) {
            console.error('❌ Verification failed:', err.message);
        } else if (row) {
            console.log('\n🎉 ADMIN SYSTEM UPGRADE COMPLETED!');
            console.log('==================================');
            console.log(`🏅 Super Admin: ${row.username}`);
            console.log(`📋 Full Name: ${row.full_name}`);
            console.log(`🔑 Admin ID: ${row.admin_id}`);
            console.log(`⭐ Permissions: ${row.permissions}`);
            console.log('\n🚀 System ready for multi-admin management!');
        }
        
        db.close((err) => {
            if (err) {
                console.error('❌ Close failed:', err.message);
            } else {
                console.log('✅ Database upgrade completed successfully');
            }
        });
    });
}
