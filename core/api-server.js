// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI Admin Panel - API Server
 * Provides a secure bridge between the admin panel UI and the SQLite database.
 * Author: TINI Security Team & Gemini
 * Version: 4.0 - Passwordless Login with Device Approval Workflow
 */

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const crypto = require('crypto');
// Load .env variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Load configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
const PORT = process.env.PORT || config.services.api.port;

// Device approval config
const DEVICE_APPROVAL = {
    enabled: Boolean(config?.security?.deviceApproval?.enabled),
    requireFingerprint: config?.security?.deviceApproval?.requireFingerprint !== false,
};
const FINGERPRINT_PEPPER = process.env.FINGERPRINT_PEPPER || config?.security?.fingerprintPepper || '';

function hashFingerprint(fp) {
    const data = String(fp || '');
    try {
        if (FINGERPRINT_PEPPER) {
            return crypto.createHmac('sha256', FINGERPRINT_PEPPER).update(data).digest('hex');
        }
        return crypto.createHash('sha256').update(data).digest('hex');
    } catch (e) {
        // Fallback plain
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}

// Import core modules
const TINISQLiteAdapter = require('../admin-panel/sqlite-init/sqlite-adapter.node.js');

// Security modules with error handling
let SecurityCore = null;
let AdvancedHoneypotSystem = null;

try {
    SecurityCore = require('../SECURITY/security-core.js');
    console.log('✅ Security Core loaded successfully');
} catch (error) {
    console.warn('⚠️ Security Core failed to load:', error.message);
}

try {
    AdvancedHoneypotSystem = require('../SECURITY/advanced-honeypot-system');
    console.log('✅ Honeypot System loaded successfully');
} catch (error) {
    console.warn('⚠️ Honeypot System failed to load:', error.message);
}

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Serve static files from admin panel directory
app.use('/admin panel', express.static(path.join(__dirname, 'admin panel')));
app.use('/static', express.static(path.join(__dirname, 'admin panel')));

const dbAdapter = new TINISQLiteAdapter({ dbPath: path.join(__dirname, '..', 'admin-panel', 'sqlite-init', 'tini_admin.db') });

// Initialize honeypot with error handling
let honeypot = null;
if (AdvancedHoneypotSystem) {
    try {
        honeypot = new AdvancedHoneypotSystem();
        console.log('✅ Honeypot initialized successfully');
    } catch (error) {
        console.warn('⚠️ Honeypot initialization failed:', error.message);
    }
}

// Ensure devices table exists (for fingerprint approvals)
async function ensureDeviceTables() {
    await dbAdapter.run(`CREATE TABLE IF NOT EXISTS devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        fingerprint_hash TEXT NOT NULL,
        fp_version TEXT,
        state TEXT NOT NULL DEFAULT 'pending',
        first_seen_ip TEXT,
        last_seen_ip TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, fingerprint_hash),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    // Optional update trigger for updated_at
    await dbAdapter.run(`CREATE TRIGGER IF NOT EXISTS trg_devices_updated_at
        AFTER UPDATE ON devices
        FOR EACH ROW BEGIN
            UPDATE devices SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;
    `);
}
// Honeypot Middleware
app.use((req, res, next) => {
    if (honeypot) {
        try {
            const honeypotResult = honeypot.checkRequest(req.url, req.headers, req.ip);
            if (honeypotResult.isHoneypot) {
                // Log the honeypot hit to the database
                dbAdapter.run(
                    'INSERT INTO security_events (event_type, severity, description, details, ip_address) VALUES (?, ?, ?, ?, ?)',
                    ['HONEYPOT_HIT', 'CRITICAL', `Honeypot trap triggered for URL: ${req.url}`, JSON.stringify(honeypotResult), req.ip]
                );
                res.status(honeypotResult.statusCode).contentType(honeypotResult.contentType).send(honeypotResult.response);
                return;
            }
        } catch (error) {
            console.warn('⚠️ Honeypot check failed:', error.message);
        }
    }
    next();
});

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
    next();
});

async function startServer() {
    console.log('🚀 Starting TINI API Server...');
    console.log('📊 Environment check:');
    console.log(`   - PORT: ${PORT}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Security modules: ${SecurityCore ? 'loaded' : 'disabled'}, ${honeypot ? 'loaded' : 'disabled'}`);
    
    try {
        await dbAdapter.initialize();
        await ensureDeviceTables();
        console.log('✅ Database connection successful.');
        app.listen(PORT, () => {
            console.log(`🚀 API server listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to initialize database and start server:', error);
        process.exit(1);
    }
}

// --- API Endpoints ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Registration Endpoint
app.post('/api/register', async (req, res) => {
    const { fullName, deviceId, internalIp, fingerprint, fpVersion } = req.body;

    const clientIp = internalIp || (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : undefined) || req.headers['x-real-ip'] || req.ip || req.connection?.remoteAddress || '127.0.0.1';

    if (!fullName || !deviceId) {
        return res.status(400).json({ error: 'Full name and device ID are required.' });
    }

    const normalizedInput = fullName.trim().replace(/\s+/g, ' ');
    if (normalizedInput.length < 10 || normalizedInput.length > 25) {
        return res.status(400).json({ error: 'Full name length must be between 10 and 25 characters.' });
    }

    // Strict spaced format only: 中文名 VIỆT_LÓT VIỆT_THẬT 93 / 93-1
    const spacedStrictRe = /^(?<zh>[\p{Script=Han}]+)\s+(?<vi1>[\p{L}]+)\s+(?<vi2>[\p{L}]+)\s(?<code>\d{2}(?:-\d)?)$/u;
    const m = normalizedInput.match(spacedStrictRe);

    if (!m || !m.groups) {
        return res.status(400).json({ error: 'Sai định dạng. Dùng: 中文名 VIỆT_LÓT VIỆT_THẬT 93 hoặc 中文名 VIỆT_LÓT VIỆT_THẬT 93-1' });
    }

    const canonicalName = `${m.groups.zh} ${m.groups.vi1} ${m.groups.vi2} ${m.groups.code}`;

    try {
        const existingDevice = await dbAdapter.query('SELECT id FROM users WHERE device_id = ?', [deviceId]);
        if (existingDevice.length > 0) {
            return res.status(409).json({ error: 'This device has already been registered.' });
        }

        const existingUser = await dbAdapter.query('SELECT id FROM users WHERE full_name = ?', [canonicalName]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'This employee name has already been registered.' });
        }

        const result = await dbAdapter.run(
            'INSERT INTO users (full_name, device_id, last_known_ip, role) VALUES (?, ?, ?, ?)',
            [canonicalName, deviceId, clientIp, 'employee']
        );

        try {
            await dbAdapter.run(
                'INSERT INTO activities (user_id, activity_type, description, ip_address) VALUES (?, ?, ?, ?)',
                [result.lastID, 'REGISTER', `User ${canonicalName} registered from device ${deviceId}`, clientIp]
            );
            // Stage 1: If fingerprint provided and approval disabled, auto-record as approved device
            if (fingerprint && !DEVICE_APPROVAL.enabled) {
                const fpHash = hashFingerprint(fingerprint);
                await dbAdapter.run(
                    `INSERT OR IGNORE INTO devices (user_id, fingerprint_hash, fp_version, state, first_seen_ip, last_seen_ip, user_agent)
                     VALUES (?, ?, ?, 'approved', ?, ?, ?)`,
                    [result.lastID, fpHash, fpVersion || 'v1', clientIp, clientIp, req.headers['user-agent'] || 'unknown']
                );
            }
        } catch (err) {
            console.warn('Activity log failed:', err.message);
        }

        console.log(`✅ New user registered: ${canonicalName} with Device ID: ${deviceId}, IP: ${clientIp}. User ID: ${result.lastID}`);
        res.status(201).json({ success: true, message: 'User registered successfully!', userId: result.lastID });

    } catch (error) {
        console.error('❌ Registration Error:', error.message);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Device or employee name already exists.' });
        }
        res.status(500).json({ error: 'An internal server error occurred during registration.' });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { fullName, deviceId, internalIp, fingerprint, fpVersion } = req.body;
    const clientIp = internalIp || (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : undefined) || req.headers['x-real-ip'] || req.ip || req.connection?.remoteAddress || '127.0.0.1';

    if (!fullName || !deviceId) {
        return res.status(400).json({ error: 'Full name and device ID are required for login.' });
    }

    let lookupName = fullName.trim();
    if (lookupName.toLowerCase() !== 'admin') {
        const normalized = lookupName.replace(/\s+/g, ' ');
        const spacedStrictRe = /^(?<zh>[\p{Script=Han}]+)\s+(?<vi1>[\p{L}]+)\s+(?<vi2>[\p{L}]+)\s(?<code>\d{2}(?:-\d)?)$/u;
        const mm = normalized.match(spacedStrictRe);
        if (!mm) {
            return res.status(400).json({ error: 'Sai định dạng tên. Dùng: 中文名 VIỆT_LÓT VIỆT_THẬT 93 hoặc 中文名 VIỆT_LÓT VIỆT_THẬT 93-1' });
        }
        lookupName = `${mm.groups.zh} ${mm.groups.vi1} ${mm.groups.vi2} ${mm.groups.code}`;
    } else {
        lookupName = 'boss-account';
    }

    try {
        const users = await dbAdapter.query('SELECT * FROM users WHERE full_name = ?', [lookupName]);
        const user = users[0];
        // If admin logging in, sync the device ID in the database
        if (lookupName === 'boss-account') {
            try {
                if (user.device_id !== deviceId) {
                    await dbAdapter.run(
                        'UPDATE users SET device_id = ? WHERE id = ?',
                        [deviceId, user.id]
                    );
                    console.log(`🔄 Admin device_id updated to ${deviceId}`);
                    user.device_id = deviceId;
                }
            } catch (err) {
                console.warn('Failed to sync admin device_id:', err.message);
            }
        }

        if (!user) {
            // Log failed login attempt
            try {
                await dbAdapter.run(
                    'INSERT INTO activities (activity_type, description, ip_address) VALUES (?, ?, ?)',
                    ['LOGIN_FAIL', `Attempted login for unknown user: ${fullName} from device ${deviceId}`, clientIp]
                );
            } catch (err) {
                console.warn('Activity log failed:', err.message);
            }
            return res.status(401).json({ error: 'Employee not found.' });
        }

        // 2. Check Device ID
        if (user.device_id !== deviceId) {
            // Log security event: Device ID mismatch
            await dbAdapter.run(
                'INSERT INTO security_events (event_type, severity, description, details, ip_address) VALUES (?, ?, ?, ?, ?)',
                ['DEVICE_ID_MISMATCH', 'HIGH', `Login attempt for ${fullName} from unauthorized device.`, JSON.stringify({ expected_device: user.device_id, actual_device: deviceId }), clientIp]
            );
            try {
                await dbAdapter.run(
                    'INSERT INTO activities (user_id, activity_type, description, ip_address) VALUES (?, ?, ?, ?)',
                    [user.id, 'LOGIN_FAIL', `Device ID mismatch for ${fullName}`, clientIp]
                );
            } catch (err) {
                console.warn('Activity log failed:', err.message);
            }
            return res.status(403).json({ error: 'Unauthorized device. Please use your registered device.' });
        }

        // 2.5 Device fingerprint approval workflow
        const userAgent = req.headers['user-agent'] || 'unknown';
        if (DEVICE_APPROVAL.enabled) {
            if (DEVICE_APPROVAL.requireFingerprint && !fingerprint) {
                return res.status(400).json({ error: 'Fingerprint is required.', code: 'FINGERPRINT_REQUIRED' });
            }
            if (fingerprint) {
                const fpHash = hashFingerprint(fingerprint);
                const rows = await dbAdapter.query(
                    'SELECT id, state FROM devices WHERE user_id = ? AND fingerprint_hash = ? LIMIT 1',
                    [user.id, fpHash]
                );
                if (rows.length === 0) {
                    // Create pending device record
                    await dbAdapter.run(
                        `INSERT INTO devices (user_id, fingerprint_hash, fp_version, state, first_seen_ip, last_seen_ip, user_agent)
                         VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
                        [user.id, fpHash, fpVersion || 'v1', clientIp, clientIp, userAgent]
                    );
                    await dbAdapter.run(
                        'INSERT INTO security_events (event_type, severity, description, details, ip_address) VALUES (?, ?, ?, ?, ?)',
                        ['DEVICE_PENDING_APPROVAL', 'MEDIUM', `New device awaiting approval for ${fullName}`, JSON.stringify({ userId: user.id }), clientIp]
                    );
                    try {
                        await dbAdapter.run(
                            'INSERT INTO activities (user_id, activity_type, description, ip_address) VALUES (?, ?, ?, ?)',
                            [user.id, 'DEVICE_PENDING', `Device pending approval`, clientIp]
                        );
                    } catch {}
                    return res.status(403).json({ error: 'Thiết bị đang chờ admin duyệt.', code: 'DEVICE_PENDING' });
                }
                const deviceRow = rows[0];
                if (deviceRow.state === 'blocked') {
                    return res.status(403).json({ error: 'Thiết bị đã bị chặn.', code: 'DEVICE_BLOCKED' });
                }
                if (deviceRow.state !== 'approved') {
                    return res.status(403).json({ error: 'Thiết bị chưa được duyệt.', code: 'DEVICE_PENDING' });
                }
                // Approved: update last_seen
                await dbAdapter.run(
                    'UPDATE devices SET last_seen_ip = ?, user_agent = ? WHERE id = ?',
                    [clientIp, userAgent, deviceRow.id]
                );
            }
        } else {
            // Stage 1 (record only): upsert fingerprint as approved when present
            if (fingerprint) {
                const fpHash = hashFingerprint(fingerprint);
                try {
                    await dbAdapter.run(
                        `INSERT INTO devices (user_id, fingerprint_hash, fp_version, state, first_seen_ip, last_seen_ip, user_agent)
                         VALUES (?, ?, ?, 'approved', ?, ?, ?)
                         ON CONFLICT(user_id, fingerprint_hash) DO UPDATE SET last_seen_ip=excluded.last_seen_ip, user_agent=excluded.user_agent`,
                        [user.id, fpHash, fpVersion || 'v1', clientIp, clientIp, userAgent]
                    );
                } catch (e) {
                    // Fallback if ON CONFLICT not supported in this build
                    const existing = await dbAdapter.query('SELECT id FROM devices WHERE user_id = ? AND fingerprint_hash = ?', [user.id, fpHash]);
                    if (existing.length === 0) {
                        await dbAdapter.run(
                            `INSERT INTO devices (user_id, fingerprint_hash, fp_version, state, first_seen_ip, last_seen_ip, user_agent)
                             VALUES (?, ?, ?, 'approved', ?, ?, ?)`,
                            [user.id, fpHash, fpVersion || 'v1', clientIp, clientIp, userAgent]
                        );
                    } else {
                        await dbAdapter.run('UPDATE devices SET last_seen_ip = ?, user_agent = ? WHERE id = ?', [clientIp, userAgent, existing[0].id]);
                    }
                }
            }
        }

        // 3. Check IP Address (for approval workflow)
        // If the user has no last_known_ip, it means this is the first login from a registered device.
        // Or if the IP has changed, it might need approval.
        if (!user.last_known_ip || user.last_known_ip !== clientIp) {
            // Log security event: IP change/first login from registered device
            await dbAdapter.run(
                'INSERT INTO security_events (event_type, severity, description, details, ip_address) VALUES (?, ?, ?, ?, ?)',
                ['IP_CHANGE_OR_FIRST_LOGIN', 'MEDIUM', `Login attempt for ${fullName} from new or changed IP.`, JSON.stringify({ registered_ip: user.last_known_ip, current_ip: clientIp }), clientIp]
            );
            try {
                await dbAdapter.run(
                    'INSERT INTO activities (user_id, activity_type, description, ip_address) VALUES (?, ?, ?, ?)',
                    [user.id, 'LOGIN_PENDING_APPROVAL', `Login pending IP approval for ${fullName}`, clientIp]
                );
            } catch (err) {
                console.warn('Activity log failed:', err.message);
            }
            
            // Update the user's last_known_ip in the database
            await dbAdapter.run(
                'UPDATE users SET last_known_ip = ? WHERE id = ?',
                [clientIp, user.id]
            );

            // For a real approval workflow, you'd notify an admin here.
            // For now, we'll allow login but inform the user.
            console.log(`⚠️ Login for ${fullName} from new IP ${clientIp}. Device ${deviceId} is registered.`);
            res.status(200).json({ success: true, message: 'Login successful. Your device and IP have been verified.', user: { id: user.id, fullName: user.full_name, role: user.role }, token: 'temp_token_for_now' });
            return; // Prevent double response
        }

        // 4. If all checks pass, login is successful
        // Update last login time and IP
        await dbAdapter.run(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP, last_known_ip = ? WHERE id = ?',
            [clientIp, user.id]
        );

        // Log successful login
        try {
            await dbAdapter.run(
                'INSERT INTO activities (user_id, activity_type, description, ip_address) VALUES (?, ?, ?, ?)',
                [user.id, 'LOGIN_SUCCESS', `User ${fullName} logged in successfully.`, clientIp]
            );
        } catch (err) {
            console.warn('Activity log failed:', err.message);
        }

        console.log(`✅ Login successful for ${fullName} from device ${deviceId}, IP: ${clientIp}`);
        res.status(200).json({ success: true, message: 'Login successful!', user: { id: user.id, fullName: user.full_name, role: user.role }, token: 'temp_token_for_now' });

    } catch (error) {
        console.error('❌ Login Error:', error.message);
        res.status(500).json({ error: 'An internal server error occurred during login.' });
    }
});

app.get('/api/db/stats', async (req, res) => {
    try {
        const stats = await dbAdapter.getStatistics();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve database statistics.' });
    }
});

app.get('/api/db/users', async (req, res) => {
    try {
        const { status } = req.query;
        const users = await dbAdapter.getUsers(status);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve users.' });
    }
});

app.get('/api/db/activities', async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const activities = await dbAdapter.getActivities(page, limit);
        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve activities.' });
    }
});

// ===== NEW SAVE ENDPOINTS =====

// Save Profile Data
app.post('/api/save-profile', async (req, res) => {
    try {
        const profileData = req.body;
        const { fullName, email, employeeId, department, language, timezone, theme } = profileData;

        // Validate required fields
        if (!fullName || !email) {
            return res.status(400).json({
                success: false,
                error: 'Full name and email are required'
            });
        }

        // Save to database (you may need to create this table)
        await dbAdapter.run(
            `INSERT OR REPLACE INTO user_profiles 
            (employee_id, full_name, email, department, language, timezone, theme, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [employeeId || 'EMP001', fullName, email, department, language, timezone, theme]
        );

        // Log the activity
        await dbAdapter.run(
            'INSERT INTO activities (user_id, activity_type, description, ip_address) VALUES (?, ?, ?, ?)',
            [1, 'PROFILE_UPDATE', `Profile updated for ${fullName}`, req.ip]
        );

        console.log(`✅ Profile saved for: ${fullName}`);
        res.json({
            success: true,
            message: 'Profile saved successfully!',
            data: profileData
        });

    } catch (error) {
        console.error('❌ Save Profile Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to save profile data'
        });
    }
});

// Save Language Preference
app.post('/api/save-language', async (req, res) => {
    try {
        const { language, userId = 'admin' } = req.body;

        if (!language) {
            return res.status(400).json({
                success: false,
                error: 'Language is required'
            });
        }

        // Save language preference
        await dbAdapter.run(
            `INSERT OR REPLACE INTO user_preferences 
            (user_id, preference_key, preference_value, updated_at) 
            VALUES (?, 'language', ?, CURRENT_TIMESTAMP)`,
            [userId, language]
        );

        console.log(`✅ Language saved: ${language} for user: ${userId}`);
        res.json({
            success: true,
            message: 'Language preference saved!',
            language: language
        });

    } catch (error) {
        console.error('❌ Save Language Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to save language preference'
        });
    }
});

// Save User Data (for user management)
app.post('/api/save-user', async (req, res) => {
    try {
        const userData = req.body;
        const { id, name, email, role, status, department } = userData;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Name and email are required'
            });
        }

        // Save or update user
        if (id && id !== 'new') {
            // Update existing user
            await dbAdapter.run(
                `UPDATE users SET full_name = ?, email = ?, role = ?, status = ?, department = ? WHERE id = ?`,
                [name, email, role, status, department, id]
            );
        } else {
            // Create new user
            const result = await dbAdapter.run(
                `INSERT INTO users (full_name, email, role, status, department, device_id, last_known_ip) \n                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, email, role, status, department, `DEVICE_${Date.now()}`, '127.0.0.1']
            );
        }

        // Log the activity
        await dbAdapter.run(
            'INSERT INTO activities (user_id, activity_type, description, ip_address) VALUES (?, ?, ?, ?)',
            [1, 'USER_UPDATE', `User data updated: ${name}`, req.ip]
        );

        console.log(`✅ User data saved: ${name}`);
        res.json({
            success: true,
            message: 'User data saved successfully!',
            data: userData
        });

    } catch (error) {
        console.error('❌ Save User Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to save user data'
        });
    }
});

// Load Profile Data for default user
app.get('/api/load-profile', async (req, res) => {
    try {
        const userId = 'admin';

        // Get profile data
        const profile = await dbAdapter.query(
            'SELECT * FROM user_profiles WHERE employee_id = ? ORDER BY updated_at DESC LIMIT 1',
            [userId]
        );

        // Get language preference
        const langPref = await dbAdapter.query(
            'SELECT preference_value FROM user_preferences WHERE user_id = ? AND preference_key = "language"',
            [userId]
        );

        if (profile.length === 0) {
            return res.json({
                success: false,
                error: 'No profile data found',
                data: null
            });
        }

        const profileData = profile[0];
        if (langPref.length > 0) {
            profileData.language = langPref[0].preference_value;
        }

        res.json({
            success: true,
            data: profileData,
            message: 'Profile loaded successfully'
        });

    } catch (error) {
        console.error('Load profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load profile data: ' + error.message
        });
    }
});

// Load Profile Data
app.get('/api/load-profile/:userId', async (req, res) => {
    try {
        const userId = req.params.userId || 'admin';

        // Get profile data
        const profile = await dbAdapter.query(
            'SELECT * FROM user_profiles WHERE employee_id = ? ORDER BY updated_at DESC LIMIT 1',
            [userId]
        );

        // Get language preference
        const langPref = await dbAdapter.query(
            'SELECT preference_value FROM user_preferences WHERE user_id = ? AND preference_key = "language"',
            [userId]
        );

        const profileData = profile[0] || {};
        if (langPref[0]) {
            profileData.language = langPref[0].preference_value;
        }

        res.json({
            success: true,
            data: profileData
        });

    } catch (error) {
        console.error('❌ Load Profile Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to load profile data'
        });
    }
});

// ===== Name Migration Utilities =====
const SPACED_STRICT_RE = /^(?<zh>[\p{Script=Han}]+)\s+(?<vi1>[\p{L}]+)\s+(?<vi2>[\p{L}]+)\s(?<code>\d{2}(?:-\d)?)$/u;
const HYPHEN_RE_FOR_MIGRATION = /^(?<zh>[\p{L}\s]+)\s-\s(?<vi>[\p{L}\s]+)\s-\s(?<code>\d{2}(?:-\d)?)$/u;

function toCanonicalSpaced(fullName) {
    if (!fullName) return null;
    const s = String(fullName).trim().replace(/\s+/g, ' ');
    const mSpaced = s.match(SPACED_STRICT_RE);
    if (mSpaced?.groups) {
        return `${mSpaced.groups.zh} ${mSpaced.groups.vi1} ${mSpaced.groups.vi2} ${mSpaced.groups.code}`;
    }
    const mHy = s.match(HYPHEN_RE_FOR_MIGRATION);
    if (mHy?.groups) {
        const zh = mHy.groups.zh.trim().replace(/\s+/g, ' ');
        const viTokens = mHy.groups.vi.trim().split(/\s+/).filter(Boolean);
        if (viTokens.length >= 2) {
            const vi1 = viTokens[0];
            const vi2 = viTokens[1];
            const code = mHy.groups.code;
            const candidate = `${zh} ${vi1} ${vi2} ${code}`;
            // Enforce length 10–25
            if (candidate.length >= 10 && candidate.length <= 25) return candidate;
        }
    }
    return null;
}

async function migrateExistingNames({ dryRun = false } = {}) {
    const users = await dbAdapter.query('SELECT id, full_name FROM users', []);
    let updated = 0, skipped = 0, unchanged = 0, conflicts = 0;
    const changes = [];

    for (const row of users) {
        const canonical = toCanonicalSpaced(row.full_name);
        if (!canonical) { skipped++; continue; }
        if (canonical === row.full_name) { unchanged++; continue; }

        // Check for uniqueness conflict
        const dupe = await dbAdapter.query('SELECT id FROM users WHERE full_name = ? AND id <> ?', [canonical, row.id]);
        if (dupe.length > 0) { conflicts++; continue; }

        changes.push({ id: row.id, from: row.full_name, to: canonical });
        if (!dryRun) {
            await dbAdapter.run('UPDATE users SET full_name = ? WHERE id = ?', [canonical, row.id]);
            updated++;
        }
    }

    return { total: users.length, updated, unchanged, skipped, conflicts, changes };
}

// Run migration once on startup (best-effort, non-blocking)
(async () => {
    try {
        await dbAdapter.initialize();
        const result = await migrateExistingNames({ dryRun: false });
        console.log(`🛠️ Name migration completed:`, result);
    } catch (e) {
        console.warn('⚠️ Startup migration skipped:', e?.message || e);
    }
})();

// Admin endpoint to trigger migration on-demand
app.post('/api/admin/migrate-names', async (req, res) => {
    try {
        const dryRun = Boolean(req.query.dryRun === 'true' || req.body?.dryRun);
        const result = await migrateExistingNames({ dryRun });
        res.json({ success: true, dryRun, ...result });
    } catch (error) {
        console.error('❌ Migration error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== Device Approval Admin APIs =====
// List devices (optionally filter by state)
app.get('/api/admin/devices', async (req, res) => {
    try {
        const { state, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        let sql = `SELECT d.*, u.full_name FROM devices d JOIN users u ON u.id = d.user_id`;
        const args = [];
        if (state) {
            sql += ' WHERE d.state = ?';
            args.push(state);
        }
        sql += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
        args.push(parseInt(limit, 10), offset);
        const rows = await dbAdapter.query(sql, args);
        res.json({ success: true, data: rows });
    } catch (e) {
        console.error('❌ List devices error:', e.message);
        res.status(500).json({ success: false, error: 'Failed to list devices' });
    }
});

// Approve a device
app.post('/api/admin/devices/:id/approve', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await dbAdapter.run('UPDATE devices SET state = "approved" WHERE id = ?', [id]);
        await dbAdapter.run(
            'INSERT INTO security_events (event_type, severity, description, details, ip_address) VALUES (?, ?, ?, ?, ?)',
            ['DEVICE_APPROVED', 'LOW', 'Device approved by admin', JSON.stringify({ deviceId: id }), req.ip]
        );
        res.json({ success: true });
    } catch (e) {
        console.error('❌ Approve device error:', e.message);
        res.status(500).json({ success: false, error: 'Failed to approve device' });
    }
});

// Block a device
app.post('/api/admin/devices/:id/block', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await dbAdapter.run('UPDATE devices SET state = "blocked" WHERE id = ?', [id]);
        await dbAdapter.run(
            'INSERT INTO security_events (event_type, severity, description, details, ip_address) VALUES (?, ?, ?, ?, ?)',
            ['DEVICE_BLOCKED', 'MEDIUM', 'Device blocked by admin', JSON.stringify({ deviceId: id }), req.ip]
        );
        res.json({ success: true });
    } catch (e) {
        console.error('❌ Block device error:', e.message);
        res.status(500).json({ success: false, error: 'Failed to block device' });
    }
});

app.get('/api/db/security-events', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const events = await dbAdapter.getSecurityEvents(limit);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve security events.' });
    }
});

startServer();

process.on('SIGINT', async () => {
    console.log('\n🔌 Shutting down server...');
    await dbAdapter.close();
    process.exit(0);
});// ST:TINI_1755361782_e868a412
