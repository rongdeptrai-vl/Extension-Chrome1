// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tini_admin.db');
console.log('🗃️ Initializing database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Database connected successfully');
});

// Create all necessary tables
const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        full_name TEXT,
        role TEXT DEFAULT 'user',
        is_active INTEGER DEFAULT 1,
        last_login TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Activities table
    `CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        action TEXT NOT NULL,
        action_type TEXT,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Security events table
    `CREATE TABLE IF NOT EXISTS security_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        severity TEXT DEFAULT 'info',
        source_ip TEXT,
        user_id TEXT,
        description TEXT,
        metadata TEXT,
        resolved INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Device registrations table
    `CREATE TABLE IF NOT EXISTS device_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        device_id TEXT NOT NULL UNIQUE,
        internal_ip TEXT,
        fingerprint TEXT,
        user_agent TEXT,
        email TEXT,
        phone_number TEXT,
        department TEXT,
        registered_at TEXT NOT NULL,
        status TEXT DEFAULT 'approved',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Sessions table
    `CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`
];

// Sample data
const sampleUsers = [
    ['admin', '$2b$10$example.hash', 'admin@example.com', 'System Administrator', 'admin'],
    ['boss', '$2b$10$example.hash', 'boss@example.com', 'Boss User', 'boss'],
    ['user1', '$2b$10$example.hash', 'user1@example.com', 'Test User 1', 'user'],
    ['user2', '$2b$10$example.hash', 'user2@example.com', 'Test User 2', 'user'],
    ['manager', '$2b$10$example.hash', 'manager@example.com', 'Manager User', 'manager']
];

const sampleActivities = [
    ['admin', 'System startup', 'system', 'Server initialization completed', '127.0.0.1'],
    ['user1', 'Login', 'authentication', 'Successful login attempt', '192.168.1.100'],
    ['user2', 'File access', 'file_operation', 'Accessed secure document', '192.168.1.101'],
    ['boss', 'Security scan', 'security', 'Performed security audit', '192.168.1.1'],
    ['manager', 'User management', 'admin_action', 'Updated user permissions', '192.168.1.50']
];

const sampleSecurityEvents = [
    ['login_attempt', 'info', '192.168.1.100', 'user1', 'Successful login'],
    ['failed_login', 'warning', '192.168.1.200', null, 'Multiple failed login attempts'],
    ['security_scan', 'info', '192.168.1.1', 'boss', 'Security audit completed'],
    ['suspicious_activity', 'high', '192.168.1.300', null, 'Unusual access pattern detected'],
    ['system_update', 'info', '127.0.0.1', 'admin', 'System security update applied']
];

async function initializeDatabase() {
    try {
        // Create tables
        for (const table of tables) {
            await new Promise((resolve, reject) => {
                db.run(table, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        console.log('✅ All tables created successfully');
        
        // Insert sample users
        const userInsert = `INSERT OR IGNORE INTO users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)`;
        for (const user of sampleUsers) {
            await new Promise((resolve, reject) => {
                db.run(userInsert, user, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        console.log('✅ Sample users inserted');
        
        // Insert sample activities
        const activityInsert = `INSERT INTO activities (user_id, action, action_type, details, ip_address) VALUES (?, ?, ?, ?, ?)`;
        for (const activity of sampleActivities) {
            await new Promise((resolve, reject) => {
                db.run(activityInsert, activity, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        console.log('✅ Sample activities inserted');
        
        // Insert sample security events
        const securityInsert = `INSERT INTO security_events (event_type, severity, source_ip, user_id, description) VALUES (?, ?, ?, ?, ?)`;
        for (const event of sampleSecurityEvents) {
            await new Promise((resolve, reject) => {
                db.run(securityInsert, event, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        console.log('✅ Sample security events inserted');
        
        console.log('🎉 Database initialization completed successfully!');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err.message);
            } else {
                console.log('📝 Database connection closed');
            }
        });
    }
}

initializeDatabase();
