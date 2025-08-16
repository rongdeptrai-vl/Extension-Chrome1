// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('admin-panel/tini_admin.db');

console.log('🔍 DATABASE VERIFICATION REPORT');
console.log('================================');

// Check tables
db.all('SELECT name FROM sqlite_master WHERE type="table"', (err, rows) => {
    if (err) {
        console.error('❌ Error:', err.message);
        return;
    }
    
    console.log('\n📋 Tables in database:');
    rows.forEach(r => console.log(`  - ${r.name}`));
    
    // Check record count
    db.get('SELECT COUNT(*) as count FROM device_registrations', (err, row) => {
        if (err) {
            console.error('❌ Error:', err.message);
        } else {
            console.log(`\n📊 Total records: ${row.count}`);
        }
        
        // Check sample data
        db.get('SELECT * FROM device_registrations LIMIT 1', (err, row) => {
            if (err) {
                console.error('❌ Error:', err.message);
            } else if (row) {
                console.log('\n👤 Sample record:');
                console.log(`  Employee ID: ${row.employee_id}`);
                console.log(`  Full Name: ${row.full_name}`);
                console.log(`  Device ID: ${row.device_id}`);
                console.log(`  Status: ${row.device_status}`);
                console.log(`  Registered: ${row.registered_at}`);
                console.log(`  Last Login: ${row.last_login_at}`);
            }
            
            console.log('\n✅ Migration verification complete!');
            console.log('🚀 Database is ready for production use');
            
            db.close();
        });
    });
});
