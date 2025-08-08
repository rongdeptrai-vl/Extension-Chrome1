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
// Load .env variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Load configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
const PORT = process.env.PORT || config.services.api.port;

// Import core modules
const TINISQLiteAdapter = require('../admin-panel/sqlite-init/sqlite-adapter.node.js');
const SecurityCore = require('../SECURITY/security-core.js');
// Honeypot system
const AdvancedHoneypotSystem = require('../SECURITY/advanced-honeypot-system');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Serve static files from admin panel directory
app.use('/admin panel', express.static(path.join(__dirname, 'admin panel')));
app.use('/static', express.static(path.join(__dirname, 'admin panel')));

const dbAdapter = new TINISQLiteAdapter({ dbPath: path.join(__dirname, '..', 'admin-panel', 'sqlite-init', 'tini_admin.db') });
const honeypot = new AdvancedHoneypotSystem();

// Honeypot Middleware
app.use((req, res, next) => {
    const honeypotResult = honeypot.checkRequest(req.url, req.headers, req.ip);
    if (honeypotResult.isHoneypot) {
        // Log the honeypot hit to the database
        dbAdapter.run(
            'INSERT INTO security_events (event_type, severity, description, details, ip_address) VALUES (?, ?, ?, ?, ?)',
            ['HONEYPOT_HIT', 'CRITICAL', `Honeypot trap triggered for URL: ${req.url}`, JSON.stringify(honeypotResult), req.ip]
        );
        res.status(honeypotResult.statusCode).contentType(honeypotResult.contentType).send(honeypotResult.response);
    } else {
        next();
    }
});

async function startServer() {
    try {
        await dbAdapter.initialize();
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
    const { fullName, deviceId, internalIp } = req.body;

    if (!fullName || !deviceId || !internalIp) {
        return res.status(400).json({ error: 'Full name, device ID, and internal IP are required.' });
    }

    const nameRegex = /^[\p{L}\s]+ - [\p{L}\s]+ - \d{2}$/u;
    if (!nameRegex.test(fullName)) {
        return res.status(400).json({ error: 'Invalid name format.' });
    }

    try {
        const existingDevice = await dbAdapter.query('SELECT id FROM users WHERE device_id = ?', [deviceId]);
        if (existingDevice.length > 0) {
            return res.status(409).json({ error: 'This device has already been registered.' });
        }

        const existingUser = await dbAdapter.query('SELECT id FROM users WHERE full_name = ?', [fullName]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'This employee name has already been registered.' });
        }

        const result = await dbAdapter.run(
            'INSERT INTO users (full_name, device_id, last_known_ip, role) VALUES (?, ?, ?, ?)',
            [fullName, deviceId, internalIp, 'employee']
        );

        // Log the registration activity
        try {
            await dbAdapter.run(
                'INSERT INTO activities (user_id, activity_type, description, ip_address) VALUES (?, ?, ?, ?)',
                [result.lastID, 'REGISTER', `User ${fullName} registered from device ${deviceId}`, internalIp]
            );
        } catch (err) {
            console.warn('Activity log failed:', err.message);
        }

        console.log(`✅ New user registered: ${fullName} with Device ID: ${deviceId}, IP: ${internalIp}. User ID: ${result.lastID}`);
        res.status(201).json({ success: true, message: 'User registered successfully!', userId: result.lastID });

    } catch (error) {
        console.error('❌ Registration Error:', error.message);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Device or employee name already exists.' });
        }
        res.status(500).json({ error: 'An internal server error occurred during registration.' });
    }
});

// --- NEW LOGIN ENDPOINT ---
app.post('/api/login', async (req, res) => {
    const { fullName, deviceId, internalIp } = req.body;

    if (!fullName || !deviceId || !internalIp) {
        return res.status(400).json({ error: 'Full name, device ID, and internal IP are required for login.' });
    }

    try {
        // 1. Map known admin alias and find the user by full name
        const lookupName = (fullName.trim().toLowerCase() === 'admin') ? 'boss-account' : fullName;
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
                    ['LOGIN_FAIL', `Attempted login for unknown user: ${fullName} from device ${deviceId}`, internalIp]
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
                ['DEVICE_ID_MISMATCH', 'HIGH', `Login attempt for ${fullName} from unauthorized device.`, JSON.stringify({ expected_device: user.device_id, actual_device: deviceId }), internalIp]
            );
            try {
                await dbAdapter.run(
                    'INSERT INTO activities (user_id, activity_type, description, ip_address) VALUES (?, ?, ?, ?)',
                    [user.id, 'LOGIN_FAIL', `Device ID mismatch for ${fullName}`, internalIp]
                );
            } catch (err) {
                console.warn('Activity log failed:', err.message);
            }
            return res.status(403).json({ error: 'Unauthorized device. Please use your registered device.' });
        }

        // 3. Check IP Address (for approval workflow)
        // If the user has no last_known_ip, it means this is the first login from a registered device.
        // Or if the IP has changed, it might need approval.
        if (!user.last_known_ip || user.last_known_ip !== internalIp) {
            // Log security event: IP change/first login from registered device
            await dbAdapter.run(
                'INSERT INTO security_events (event_type, severity, description, details, ip_address) VALUES (?, ?, ?, ?, ?)',
                ['IP_CHANGE_OR_FIRST_LOGIN', 'MEDIUM', `Login attempt for ${fullName} from new or changed IP.`, JSON.stringify({ registered_ip: user.last_known_ip, current_ip: internalIp }), internalIp]
            );
            try {
                await dbAdapter.run(
                    'INSERT INTO activities (user_id, activity_type, description, ip_address) VALUES (?, ?, ?, ?)',
                    [user.id, 'LOGIN_PENDING_APPROVAL', `Login pending IP approval for ${fullName}`, internalIp]
                );
            } catch (err) {
                console.warn('Activity log failed:', err.message);
            }
            
            // Update the user's last_known_ip in the database
            await dbAdapter.run(
                'UPDATE users SET last_known_ip = ? WHERE id = ?',
                [internalIp, user.id]
            );

            // For a real approval workflow, you'd notify an admin here.
            // For now, we'll allow login but inform the user.
            console.log(`⚠️ Login for ${fullName} from new IP ${internalIp}. Device ${deviceId} is registered.`);
            res.status(200).json({ success: true, message: 'Login successful. Your device and IP have been verified.', user: { id: user.id, fullName: user.full_name, role: user.role }, token: 'temp_token_for_now' });
        }

        // 4. If all checks pass, login is successful
        // Update last login time and IP
        await dbAdapter.run(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP, last_known_ip = ? WHERE id = ?',
            [internalIp, user.id]
        );

        // Log successful login
        try {
            await dbAdapter.run(
                'INSERT INTO activities (user_id, activity_type, description, ip_address) VALUES (?, ?, ?, ?)',
                [user.id, 'LOGIN_SUCCESS', `User ${fullName} logged in successfully.`, internalIp]
            );
        } catch (err) {
            console.warn('Activity log failed:', err.message);
        }

        console.log(`✅ Login successful for ${fullName} from device ${deviceId}, IP: ${internalIp}`);
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
            `INSERT OR REPLACE INTO user_profiles \n            (employee_id, full_name, email, department, language, timezone, theme, updated_at) \n            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
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
            `INSERT OR REPLACE INTO user_preferences \n            (user_id, preference_key, preference_value, updated_at) \n            VALUES (?, 'language', ?, CURRENT_TIMESTAMP)`,
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

startServer();

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
});