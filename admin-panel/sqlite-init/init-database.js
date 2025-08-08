// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// SQLite Database Initializer
// Creates and populates TINI Admin database

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'tini_admin.db');
const sqlPath = path.join(__dirname, 'init-database.sql');

console.log('🗄️  Initializing TINI Admin Database...');
console.log('📁 Database path:', dbPath);
console.log('📄 SQL file:', sqlPath);

// Create database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error creating database:', err);
        return;
    }
    console.log('✅ Database file created successfully');
});

// Read and execute SQL file
fs.readFile(sqlPath, 'utf8', (err, sql) => {
    if (err) {
        console.error('❌ Error reading SQL file:', err);
        return;
    }
    
    console.log('📝 Executing SQL schema...');
    
    // Execute SQL statements
    db.exec(sql, (err) => {
        if (err) {
            console.error('❌ Error executing SQL:', err);
            return;
        }
        
        console.log('✅ Database schema created successfully');
        
        // Verify tables
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
                console.error('❌ Error querying tables:', err);
                return;
            }
            
            console.log('📊 Tables created:');
            tables.forEach(table => {
                console.log(`   - ${table.name}`);
            });
            
            // Close database
            db.close((err) => {
                if (err) {
                    console.error('❌ Error closing database:', err);
                } else {
                    console.log('✅ Database initialization complete!');
                    console.log('🚀 Server can now connect to real data');
                }
            });
        });
    });
});