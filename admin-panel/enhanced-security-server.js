// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - ENHANCED SECURITY SERVER
// Enterprise-grade server with MFA, session management, and drift detection

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

// Import security modules
const TiniMFASystem = require('../core/tini-mfa-system.js');
const TiniSessionManager = require('../core/tini-session-manager.js');
const TiniDriftDetection = require('../core/tini-drift-detection.js');

// Initialize security systems
const mfaSystem = new TiniMFASystem();
const sessionManager = new TiniSessionManager();
const driftDetection = new TiniDriftDetection();

// Database connection
const dbPath = path.join(__dirname, 'tini_admin.db');
let db;

// Security configuration
const SECURITY_CONFIG = {
    REQUIRE_MFA: process.env.REQUIRE_MFA === 'true',
    ENABLE_DRIFT_DETECTION: process.env.ENABLE_DRIFT_DETECTION !== 'false',
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    SESSION_TIMEOUT: 30 * 60 * 1000,  // 30 minutes
    ADMIN_MFA_REQUIRED: true
};

// Initialize database connection
function initDatabase() {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Database connection failed:', err.message);
        } else {
            console.log('✅ Connected to SQLite database');
            createTables();
        }
    });
}

// Create all necessary tables
function createTables() {
    const tables = [
        // Users table with password_hash column
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT,
            full_name TEXT,
            department TEXT,
            role TEXT DEFAULT 'employee',
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )`,
        
        // Audit logs table
        `CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            user_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT,
            user_agent TEXT,
            session_id TEXT,
            success INTEGER DEFAULT 1,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Security events table
        `CREATE TABLE IF NOT EXISTS security_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            severity TEXT DEFAULT 'medium',
            user_id INTEGER,
            description TEXT,
            details TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Admin approval requests table
        `CREATE TABLE IF NOT EXISTS admin_approval_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_type TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            approved_at DATETIME,
            approved_by INTEGER,
            details TEXT
        )`,
        
        // User MFA settings table
        `CREATE TABLE IF NOT EXISTS user_mfa_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            enabled INTEGER DEFAULT 0,
            secret_key TEXT,
            backup_codes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`,
        
        // User sessions table
        `CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            refresh_token TEXT,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`,
        
        // Device fingerprints table
        `CREATE TABLE IF NOT EXISTS device_fingerprints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            fingerprint_hash TEXT NOT NULL,
            device_info TEXT,
            first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
            trust_score REAL DEFAULT 0.5,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`
    ];
    
    // Create each table
    tables.forEach((sql, index) => {
        db.run(sql, (err) => {
            if (err) {
                console.error(`❌ Failed to create table ${index + 1}:`, err.message);
            } else {
                console.log(`✅ Table ${index + 1} created/verified`);
            }
        });
    });
}

// Audit logging function
async function logAuditEvent(eventType, userId, action, details, req, success = true) {
    const auditData = {
        event_type: eventType,
        user_id: userId,
        action: action,
        details: JSON.stringify(details),
        ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
        user_agent: req.headers['user-agent'] || '',
        session_id: req.sessionId || null,
        success: success ? 1 : 0,
        error_message: success ? null : (details.error || null)
    };

    return new Promise((resolve) => {
        const query = `
            INSERT INTO audit_logs 
            (event_type, user_id, action, details, ip_address, user_agent, session_id, success, error_message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(query, Object.values(auditData), (err) => {
            if (err) console.error('Audit logging failed:', err);
            resolve();
        });
    });
}

// Security event logging
async function logSecurityEvent(eventType, severity, userId, description, details, req) {
    const securityData = {
        event_type: eventType,
        severity: severity,
        user_id: userId,
        description: description,
        details: JSON.stringify(details),
        ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1'
    };

    return new Promise((resolve) => {
        const query = `
            INSERT INTO security_events 
            (event_type, severity, user_id, description, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(query, Object.values(securityData), (err) => {
            if (err) console.error('Security event logging failed:', err);
            resolve();
        });
    });
}

// Enhanced login endpoint with MFA and drift detection
async function handleEnhancedLogin(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
        try {
            const loginData = JSON.parse(body);
            const { fullName, deviceId, fingerprint, mfaToken } = loginData;

            // Input validation
            if (!fullName || !deviceId || !fingerprint) {
                await logSecurityEvent('LOGIN_ATTEMPT', 'MEDIUM', null, 'Invalid login data', loginData, req);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Missing required fields' }));
                return;
            }

            // Get user from database
            const user = await getUserByName(fullName);
            if (!user) {
                await logSecurityEvent('LOGIN_ATTEMPT', 'HIGH', null, 'Login attempt for non-existent user', { fullName }, req);
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid credentials' }));
                return;
            }

            // Check if device exists
            const existingDevice = await getDeviceByDeviceId(deviceId);
            let driftResult = null;

            if (existingDevice) {
                // Device exists - check for drift
                if (SECURITY_CONFIG.ENABLE_DRIFT_DETECTION && existingDevice.device_fingerprint_hash) {
                    const newFingerprintHash = crypto.createHash('sha256').update(fingerprint).digest('hex');
                    
                    // Compare fingerprints for drift
                    if (existingDevice.device_fingerprint_hash !== newFingerprintHash) {
                        driftResult = driftDetection.analyzeDrift(
                            existingDevice.device_fingerprint_raw, 
                            fingerprint, 
                            user.employee_id
                        );
                        
                        // Store drift analysis
                        await driftDetection.storeDriftAnalysis(driftResult, db);
                        
                        // Handle drift based on severity
                        if (driftResult.blocked) {
                            await logSecurityEvent('DEVICE_DRIFT', 'CRITICAL', user.employee_id, 
                                'Device blocked due to major drift', driftResult, req);
                            
                            res.writeHead(403, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ 
                                success: false, 
                                error: 'Device verification failed',
                                requiresApproval: true,
                                driftDetected: true
                            }));
                            return;
                        }
                    }
                }
            } else {
                // New device - create pending approval if required
                if (SECURITY_CONFIG.REQUIRE_MFA) {
                    await createPendingApproval('NEW_DEVICE', user.employee_id, deviceId, {
                        fingerprint: fingerprint,
                        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                        userAgent: req.headers['user-agent']
                    });

                    res.writeHead(202, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        message: 'New device requires admin approval',
                        requiresApproval: true 
                    }));
                    return;
                }
            }

            // Check MFA requirement
            const mfaStatus = await mfaSystem.getMFAStatus(user.employee_id, db);
            let mfaVerified = false;

            if (mfaStatus.enabled || (driftResult && driftResult.requiresMFA)) {
                if (!mfaToken) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        requiresMFA: true,
                        driftDetected: !!driftResult
                    }));
                    return;
                }

                // Verify MFA token
                const mfaResult = await mfaSystem.authenticateMFA(user.employee_id, mfaToken, db);
                if (!mfaResult.success) {
                    await logSecurityEvent('MFA_FAILURE', 'HIGH', user.employee_id, 'MFA verification failed', { mfaToken }, req);
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid MFA token' }));
                    return;
                }

                mfaVerified = true;
            }

            // Create session
            const sessionData = await sessionManager.createSession(
                user.employee_id,
                deviceId,
                req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                req.headers['user-agent'],
                mfaVerified,
                db
            );

            // Update device last login
            await updateDeviceLastLogin(deviceId, user.employee_id);

            // Log successful login
            await logAuditEvent('LOGIN', user.employee_id, 'SUCCESSFUL_LOGIN', {
                deviceId,
                mfaVerified,
                driftDetected: !!driftResult
            }, req);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Login successful',
                sessionData: {
                    accessToken: sessionData.accessToken,
                    refreshToken: sessionData.refreshToken,
                    expiresAt: sessionData.expiresAt
                },
                user: {
                    employeeId: user.employee_id,
                    fullName: user.full_name
                },
                security: {
                    mfaVerified,
                    driftDetected: !!driftResult,
                    sessionId: sessionData.sessionId
                }
            }));

        } catch (error) {
            console.error('Login error:', error);
            await logSecurityEvent('LOGIN_ERROR', 'HIGH', null, 'Login system error', { error: error.message }, req);
            
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
        }
    });
}

// MFA setup endpoint
async function handleMFASetup(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
        try {
            const { userId } = JSON.parse(body);

            if (!userId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'User ID required' }));
                return;
            }

            // Setup MFA
            const mfaData = await mfaSystem.setupMFA(userId, db);
            const qrCode = await mfaSystem.generateQRCode(userId, mfaData.secret);

            await logAuditEvent('MFA_SETUP', userId, 'MFA_SETUP_INITIATED', { userId }, req);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                qrCode,
                backupCodes: mfaData.backupCodes,
                secret: mfaData.secret // Only for testing - remove in production
            }));

        } catch (error) {
            console.error('MFA setup error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'MFA setup failed' }));
        }
    });
}

// MFA verification endpoint
async function handleMFAVerification(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
        try {
            const { userId, token } = JSON.parse(body);

            if (!userId || !token) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'User ID and token required' }));
                return;
            }

            // Enable MFA
            const result = await mfaSystem.enableMFA(userId, token, db);
            
            await logAuditEvent('MFA_VERIFICATION', userId, 'MFA_ENABLED', { userId }, req);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));

        } catch (error) {
            console.error('MFA verification error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
    });
}

// Get pending approvals for admin
async function handleGetPendingApprovals(req, res) {
    try {
        const query = `
            SELECT p.*, d.full_name, d.device_id
            FROM pending_approvals p
            LEFT JOIN device_registrations d ON p.user_id = d.employee_id
            WHERE p.status = 'PENDING'
            ORDER BY p.created_at ASC
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Database error' }));
                return;
            }

            const approvals = rows.map(row => ({
                ...row,
                request_data: JSON.parse(row.request_data || '{}')
            }));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, approvals }));
        });

    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Server error' }));
    }
}

// Helper functions
async function getUserByName(fullName) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM device_registrations WHERE full_name = ? OR normalized_name = ?';
        db.get(query, [fullName, fullName.toLowerCase()], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function getDeviceByDeviceId(deviceId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM device_registrations WHERE device_id = ?';
        db.get(query, [deviceId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function updateDeviceLastLogin(deviceId, userId) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE device_registrations SET last_login_at = datetime("now") WHERE device_id = ?';
        db.run(query, [deviceId], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

async function createPendingApproval(requestType, userId, deviceId, requestData) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO pending_approvals 
            (request_type, user_id, device_id, request_data, expires_at)
            VALUES (?, ?, ?, ?, datetime('now', '+7 days'))
        `;
        
        db.run(query, [requestType, userId, deviceId, JSON.stringify(requestData)], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

// User Registration Handler
async function handleUserRegistration(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
        try {
            console.log('Registration request body:', body);
            const userData = JSON.parse(body);
            const { username, email, password, fullName } = userData;
            console.log('Parsed user data:', { username, email, fullName });

            // Input validation
            if (!username || !email || !password || !fullName) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Missing required fields' }));
                return;
            }

            if (username.length < 3 || password.length < 6) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Username too short or password too weak' }));
                return;
            }

            if (!email.includes('@')) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Invalid email format' }));
                return;
            }

            console.log('Validation passed, checking existing user...');
            // Check if user exists
            const existingUser = await new Promise((resolve, reject) => {
                db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
                    if (err) {
                        console.error('Database error checking user:', err);
                        reject(err);
                    } else {
                        console.log('Existing user check result:', row);
                        resolve(row);
                    }
                });
            });

            if (existingUser) {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'User already exists' }));
                return;
            }

            // Hash password
            const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
            console.log('Password hashed, creating user...');

            // Create user
            const userId = await new Promise((resolve, reject) => {
                db.run('INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
                    [username, email, passwordHash, fullName], function(err) {
                    if (err) {
                        console.error('Database error creating user:', err);
                        reject(err);
                    } else {
                        console.log('User created with ID:', this.lastID);
                        resolve(this.lastID);
                    }
                });
            });

            console.log('Logging audit event...');
            await logAuditEvent('USER_REGISTRATION', userId, 'User account created', { username, email }, req, true);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'User registered successfully',
                userId: userId
            }));

        } catch (error) {
            console.error('Registration error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
        }
    });
}

// User Profile Handler
async function handleUserProfile(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'No authorization token' }));
            return;
        }

        const token = authHeader.split(' ')[1];
        const tokenValidation = sessionManager.validateAccessToken(token);

        if (!tokenValidation.valid) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid token' }));
            return;
        }

        const userId = tokenValidation.payload.userId;
        const user = await getUserById(userId);

        if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'User not found' }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                role: user.role || 'employee'
            }
        }));

    } catch (error) {
        console.error('Profile error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
}

// MFA Status Handler
async function handleMFAStatus(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'No authorization token' }));
            return;
        }

        const token = authHeader.split(' ')[1];
        const tokenValidation = sessionManager.validateAccessToken(token);

        if (!tokenValidation.valid) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid token' }));
            return;
        }

        const userId = tokenValidation.payload.userId;
        const mfaSettings = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM user_mfa_settings WHERE user_id = ?', [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            enabled: !!mfaSettings?.enabled,
            setupRequired: !mfaSettings?.enabled
        }));

    } catch (error) {
        console.error('MFA Status error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
}

// Admin Users Handler
async function handleAdminUsers(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'No authorization token' }));
            return;
        }

        // Note: In a real implementation, check for admin role
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Admin access required' }));

    } catch (error) {
        console.error('Admin Users error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
}

// Admin Stats Handler
async function handleAdminStats(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'No authorization token' }));
            return;
        }

        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Admin access required' }));

    } catch (error) {
        console.error('Admin Stats error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
}

// Security Events Handler
async function handleSecurityEvents(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'No authorization token' }));
            return;
        }

        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Admin access required' }));

    } catch (error) {
        console.error('Security Events error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
}

// Audit Logs Handler
async function handleAuditLogs(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'No authorization token' }));
            return;
        }

        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Admin access required' }));

    } catch (error) {
        console.error('Audit Logs error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
}

// Helper function to get user by ID
async function getUserById(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Create enhanced server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Security routes
    switch (pathname) {
        case '/api/health':
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                status: 'healthy',
                timestamp: new Date().toISOString(),
                features: ['MFA', 'Sessions', 'Audit', 'Drift Detection']
            }));
            break;

        case '/api/auth/register':
            if (method === 'POST') {
                await handleUserRegistration(req, res);
            }
            break;

        case '/api/auth/login':
            if (method === 'POST') {
                await handleEnhancedLogin(req, res);
            }
            break;

        case '/api/user/profile':
            if (method === 'GET') {
                await handleUserProfile(req, res);
            }
            break;

        case '/api/mfa/setup':
            if (method === 'POST') {
                await handleMFASetup(req, res);
            }
            break;

        case '/api/mfa/verify':
            if (method === 'POST') {
                await handleMFAVerification(req, res);
            }
            break;

        case '/api/mfa/status':
            if (method === 'GET') {
                await handleMFAStatus(req, res);
            }
            break;

        case '/api/admin/users':
            if (method === 'GET') {
                await handleAdminUsers(req, res);
            }
            break;

        case '/api/admin/stats':
            if (method === 'GET') {
                await handleAdminStats(req, res);
            }
            break;

        case '/api/admin/security-events':
            if (method === 'GET') {
                await handleSecurityEvents(req, res);
            }
            break;

        case '/api/admin/audit-logs':
            if (method === 'GET') {
                await handleAuditLogs(req, res);
            }
            break;

        case '/api/admin/pending-approvals':
            if (method === 'GET') {
                await handleGetPendingApprovals(req, res);
            }
            break;

        default:
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
    }
});

// Initialize and start server
initDatabase();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Enhanced Security Server running on port ${PORT}`);
    console.log('🔐 Enterprise security features enabled:');
    console.log('  ✅ MFA Authentication System');
    console.log('  ✅ Device Drift Detection');
    console.log('  ✅ Session Management');
    console.log('  ✅ Audit Logging');
    console.log('  ✅ Admin Approval Workflow');
});

module.exports = server;
