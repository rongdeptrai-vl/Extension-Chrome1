// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// MINIMAL WORKING SERVER FOR AUTHENTICATION TEST
const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

console.log('🚀 Starting minimal authentication server...');

// In-memory MFA code storage (use Redis in production)
const mfaCodes = new Map();

// Create database
const db = new sqlite3.Database('test-auth.db');

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    full_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, () => {
    console.log('✅ Database table created');
});

// Registration handler
function handleRegistration(req, res) {
    if (req.method !== 'POST') {
        res.writeHead(405, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: false, message: 'Method not allowed'}));
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            console.log('📝 Registration request received:', body);
            const userData = JSON.parse(body);
            const { username, email, password, fullName } = userData;

            // Simple validation
            if (!username || !email || !password || !fullName) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: false, message: 'Missing fields'}));
                return;
            }

            // Hash password
            const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

            // Insert user
            db.run('INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
                [username, email, passwordHash, fullName], function(err) {
                if (err) {
                    console.error('❌ Database error:', err);
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: false, message: 'Database error'}));
                    return;
                }

                console.log('✅ User created with ID:', this.lastID);
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({
                    success: true,
                    message: 'User registered successfully',
                    userId: this.lastID
                }));
            });

        } catch (error) {
            console.error('❌ Registration error:', error);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, message: 'Server error'}));
        }
    });
}

// Login handler
function handleLogin(req, res) {
    if (req.method !== 'POST') {
        res.writeHead(405, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: false, message: 'Method not allowed'}));
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            console.log('🔐 Login request received:', body);
            const loginData = JSON.parse(body);
            const { username, password } = loginData;

            // Simple validation
            if (!username || !password) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: false, message: 'Missing username or password'}));
                return;
            }

            // Hash provided password
            const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

            // Find user
            db.get('SELECT id, username, email, full_name FROM users WHERE username = ? AND password_hash = ?',
                [username, passwordHash], (err, user) => {
                if (err) {
                    console.error('❌ Database error:', err);
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: false, message: 'Database error'}));
                    return;
                }

                if (!user) {
                    console.log('❌ Invalid credentials for username:', username);
                    res.writeHead(401, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: false, message: 'Invalid credentials'}));
                    return;
                }

                // Generate simple access token (for demo - in production use JWT)
                const accessToken = crypto.createHash('sha256')
                    .update(user.id.toString() + Date.now().toString() + Math.random().toString())
                    .digest('hex');

                console.log('✅ Login successful for user:', user.username);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        fullName: user.full_name
                    },
                    accessToken: accessToken,
                    tokenType: 'Bearer'
                }));
            });

        } catch (error) {
            console.error('❌ Login error:', error);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, message: 'Server error'}));
        }
    });
}

// MFA Handler - Generate MFA Code
function handleMFAGenerate(req, res) {
    if (req.method !== 'POST') {
        res.writeHead(405, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: false, message: 'Method not allowed'}));
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            console.log('🔐 MFA Generate request received:', body);
            const mfaData = JSON.parse(body);
            const { username } = mfaData;

            if (!username) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: false, message: 'Username required'}));
                return;
            }

            // Generate 6-digit MFA code
            const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            // Store MFA code in memory
            mfaCodes.set(username, {
                code: mfaCode,
                expiresAt: expiresAt
            });

            console.log(`🔐 Generated MFA code for ${username}: ${mfaCode} (expires: ${expiresAt})`);

            // In production, store in Redis/cache and send via SMS/Email
            // For demo, we'll just return the code
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                success: true,
                message: 'MFA code generated',
                mfaCode: mfaCode, // Remove in production
                expiresAt: expiresAt.toISOString()
            }));

        } catch (error) {
            console.error('❌ MFA Generate error:', error);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, message: 'Server error'}));
        }
    });
}

// MFA Handler - Verify MFA Code
function handleMFAVerify(req, res) {
    if (req.method !== 'POST') {
        res.writeHead(405, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: false, message: 'Method not allowed'}));
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            console.log('🔐 MFA Verify request received:', body);
            const verifyData = JSON.parse(body);
            const { username, mfaCode, accessToken } = verifyData;

            if (!username || !mfaCode || !accessToken) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: false, message: 'Missing required fields'}));
                return;
            }

            // Verify MFA code against stored code
            const storedMFA = mfaCodes.get(username);
            
            if (!storedMFA) {
                console.log(`❌ No MFA code found for ${username}`);
                res.writeHead(401, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: false, message: 'No MFA code generated'}));
                return;
            }

            // Check if code has expired
            if (new Date() > storedMFA.expiresAt) {
                console.log(`❌ MFA code expired for ${username}`);
                mfaCodes.delete(username);
                res.writeHead(401, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: false, message: 'MFA code expired'}));
                return;
            }

            // Verify code
            if (mfaCode === storedMFA.code) {
                console.log(`✅ MFA verification successful for ${username}`);
                
                // Remove used code
                mfaCodes.delete(username);
                
                // Generate enhanced token after MFA
                const enhancedToken = crypto.createHash('sha256')
                    .update(accessToken + 'MFA_VERIFIED' + Date.now().toString())
                    .digest('hex');

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({
                    success: true,
                    message: 'MFA verification successful',
                    mfaVerified: true,
                    enhancedToken: enhancedToken,
                    tokenType: 'Bearer'
                }));
            } else {
                console.log(`❌ Invalid MFA code for ${username}: ${mfaCode} (expected: ${storedMFA.code})`);
                res.writeHead(401, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: false, message: 'Invalid MFA code'}));
            }

        } catch (error) {
            console.error('❌ MFA Verify error:', error);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, message: 'Server error'}));
        }
    });
}

// Create server
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Security Headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none';");
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`📡 Request: ${req.method} ${url.pathname}`);

    // Routes
    switch (url.pathname) {
        case '/api/health':
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true, status: 'healthy', timestamp: new Date().toISOString()}));
            break;
            
        case '/api/auth/register':
            handleRegistration(req, res);
            break;
            
        case '/api/auth/login':
            handleLogin(req, res);
            break;
            
        case '/api/auth/mfa/generate':
            handleMFAGenerate(req, res);
            break;
            
        case '/api/auth/mfa/verify':
            handleMFAVerify(req, res);
            break;
            
        default:
            res.writeHead(404, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, message: 'Not found'}));
    }
});

const PORT = process.env.PORT || 3002; // Use environment PORT or fallback to 3002
server.listen(PORT, () => {
    console.log(`🚀 Minimal auth server running on port ${PORT}`);
    console.log('✅ Ready for authentication tests');
});

module.exports = server;
