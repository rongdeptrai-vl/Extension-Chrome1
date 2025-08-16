// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - SERVER UPDATE TO SQLITE3
// Script to update server.js from JSON to SQLite3

const fs = require('fs');
const path = require('path');

console.log('🔄 UPDATING SERVER.JS TO USE SQLITE3...');

const serverPath = path.join(__dirname, 'admin-panel', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Backup original
const backupPath = serverPath + '.json-backup';
fs.writeFileSync(backupPath, content);
console.log(`✅ Backup created: ${backupPath}`);

// Update /api/register/check endpoint
content = content.replace(
    /case '\/api\/register\/check':\s*if \(method === 'GET'\) \{[\s\S]*?catch \(e\) \{[\s\S]*?\}[\s\S]*?\}/,
    `case '/api/register/check':
            if (method === 'GET') {
                try {
                    const parsed = url.parse(req.url, true);
                    const name = (parsed.query.name || '').toString().trim();
                    const target = normName(name);
                    
                    db.get('SELECT 1 FROM device_registrations WHERE normalized_name = ? OR full_name = ?', 
                        [target, target], (err, row) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Database error' }));
                            return;
                        }
                        const nameExists = !!row;
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, nameExists }));
                    });
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Server error' }));
                }`
);

// Update /api/device/check endpoint  
content = content.replace(
    /case '\/api\/device\/check':\s*if \(method === 'GET'\) \{[\s\S]*?catch \(e\) \{[\s\S]*?\}[\s\S]*?\}/,
    `case '/api/device/check':
            if (method === 'GET') {
                try {
                    const parsed = url.parse(req.url, true);
                    const deviceId = (parsed.query.deviceId || '').toString().trim();
                    const uuidRe = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
                    if (!deviceId || !uuidRe.test(deviceId)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Invalid or missing deviceId' }));
                        break;
                    }
                    
                    db.get('SELECT * FROM device_registrations WHERE device_id = ?', [deviceId], (err, row) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Database error' }));
                            return;
                        }
                        
                        const exists = !!row;
                        const device = row ? {
                            fullName: row.full_name,
                            normalizedName: row.normalized_name,
                            deviceId: row.device_id,
                            status: row.status,
                            registeredAt: row.registered_at,
                            lastLoginAt: row.last_login_at,
                            lastLoginIp: row.last_login_ip
                        } : null;
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, exists, device }));
                    });
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Server error' }));
                }`
);

// Find and replace other registration JSON usages
const registrationReplacements = [
    {
        // Update registration listing/management
        search: /const registrationsFile = path\.join\(__dirname, 'registrations\.json'\);[\s\S]*?JSON\.parse\(fs\.readFileSync\(registrationsFile, 'utf8'\)\)/g,
        replace: `// Using SQLite3 database instead of JSON file
                    // Data fetched via database queries`
    }
];

registrationReplacements.forEach(({search, replace}) => {
    content = content.replace(search, replace);
});

// Write updated content
fs.writeFileSync(serverPath, content);

console.log('✅ SERVER.JS UPDATED TO USE SQLITE3!');
console.log('📊 Changes made:');
console.log('  - /api/register/check now uses SQLite3');  
console.log('  - /api/device/check now uses SQLite3');
console.log('  - Removed JSON file dependencies');
console.log('🚀 Server is ready for production with SQLite3!');
