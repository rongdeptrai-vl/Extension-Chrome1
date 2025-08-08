/**
 * 🚀 Unified Gateway (Port 8099)
 * - Express 5 compatible routing (no wildcard path matchers)
 * - JWT auth, rate limit, security headers, CORS
 * - Logging (Winston)
 * - SQLite-backed users and sessions (unified)
 * - Redirects to Admin Panel
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const winston = require('winston');
const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');
const TINISQLiteAdapter = require('../admin-panel/sqlite-init/sqlite-adapter.node.js');

// Ensure logs directory exists before logger initialization
try {
    fssync.mkdirSync('logs', { recursive: true });
} catch (e) {
    console.warn('⚠️ Could not ensure logs directory:', e.message);
}

// =====================
// ENV LOADING
// =====================
function loadEnvironment() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        const content = fssync.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const idx = trimmed.indexOf('=');
            if (idx === -1) return;
            const key = trimmed.slice(0, idx).trim();
            const value = trimmed.slice(idx + 1).trim();
            if (process.env[key] === undefined) process.env[key] = value;
        });
        console.log('📦 [ENV] Environment variables loaded');
    } catch {
        console.log('⚠️ [ENV] Using system environment variables');
    }
}
loadEnvironment();

// =====================
// WEBHOOK HELPERS
// =====================
async function sendSlackAlert(message, level = 'INFO', details = null) {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhookUrl) return { success: false, reason: 'NO_WEBHOOK_URL' };

    try {
        const colors = { CRITICAL: '#FF0000', HIGH: '#FF6600', MEDIUM: '#FFCC00', INFO: '#0099FF', SUCCESS: '#00CC00' };
        const payload = {
            username: 'TINI Unified Gateway',
            icon_emoji: ':rocket:',
            attachments: [{
                color: colors[level] || colors.INFO,
                title: `🚀 Unified Gateway Alert - ${level}`,
                text: message,
                fields: [
                    { title: 'Server Component', value: `Docker/server 8099.js (Port ${process.env.PORT || '8099'})`, short: true },
                    { title: 'Timestamp', value: new Date().toISOString(), short: true }
                ],
                footer: 'TINI Monitoring',
                ts: Math.floor(Date.now() / 1000)
            }]
        };
        if (details) {
            payload.attachments[0].fields.push({ title: 'Details', value: typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details), short: false });
        }

        const https = require('https');
        const webhookUrl = new URL(slackWebhookUrl);
        const postData = JSON.stringify(payload);
        const options = {
            hostname: webhookUrl.hostname,
            port: webhookUrl.port || 443,
            path: webhookUrl.pathname + (webhookUrl.search || ''),
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
        };

        return await new Promise(resolve => {
            const req = https.request(options, res => {
                res.on('data', () => {});
                res.on('end', () => resolve({ success: res.statusCode === 200, status: res.statusCode }));
            });
            req.on('error', err => resolve({ success: false, reason: 'NETWORK_ERROR', error: err.message }));
            req.write(postData); req.end();
        });
    } catch (error) {
        return { success: false, reason: 'EXCEPTION', error: error.message };
    }
}

// =====================
// CONFIG
// =====================
const config = {
    port: Number(process.env.PORT) || 8099,
    env: process.env.NODE_ENV || 'production',
    jwt: { secret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-this', expiresIn: '24h' },
    rateLimit: { windowMs: 15 * 60 * 1000, max: 100 },
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
            'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082',
            'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006',
            'http://localhost:5001'
        ],
        credentials: true
    },
    adminPanelUrl: process.env.ADMIN_PANEL_URL || 'http://localhost:8080'
};

// =====================
// LOGGER
// =====================
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) })
    ]
});

// =====================
// DATABASE (SQLite, unified)
// =====================
const DB_PATH = path.join(__dirname, '..', 'admin-panel', 'tini_admin.db');
const LEGACY_DATA_DIR = path.join(__dirname, '..', 'data');
const LEGACY_USERS_FILE = path.join(LEGACY_DATA_DIR, 'users.json');
const LEGACY_SESSIONS_FILE = path.join(LEGACY_DATA_DIR, 'sessions.json');

const dbAdapter = new TINISQLiteAdapter({ dbPath: DB_PATH });

async function initDatabase() {
    await dbAdapter.initialize();

    await dbAdapter.run(`CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TEXT,
        last_login TEXT
    )`);

    await dbAdapter.run(`CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT,
        username TEXT,
        created_at TEXT,
        last_access TEXT
    )`);

    // Default admin
    const adminRows = await dbAdapter.query('SELECT username FROM users WHERE username = ?', ['admin']);
    if (adminRows.length === 0) {
        const hash = await bcrypt.hash('admin123', 10);
        await dbAdapter.run(
            'INSERT INTO users (username, password_hash, role, created_at, last_login) VALUES (?, ?, ?, ?, ?)',
            ['admin', hash, 'admin', new Date().toISOString(), null]
        );
        logger.info('🔐 Default admin user ensured in SQLite: admin/admin123');
    }

    // Migrate legacy users
    try {
        if (fssync.existsSync(LEGACY_USERS_FILE)) {
            const raw = fssync.readFileSync(LEGACY_USERS_FILE, 'utf8');
            const legacy = JSON.parse(raw);
            const entries = Object.entries(legacy || {});
            for (const [uname, u] of entries) {
                const exists = await dbAdapter.query('SELECT username FROM users WHERE username = ?', [uname]);
                if (exists.length === 0) {
                    const role = u.role || 'user';
                    const created = u.created || new Date().toISOString();
                    const lastLogin = u.lastLogin || null;
                    await dbAdapter.run(
                        'INSERT INTO users (username, password_hash, role, created_at, last_login) VALUES (?, ?, ?, ?, ?)',
                        [uname, u.password, role, created, lastLogin]
                    );
                    logger.info(`📦 Migrated legacy user to SQLite: ${uname}`);
                }
            }
        }
    } catch (e) {
        logger.warn('⚠️ Legacy users migration skipped: ' + e.message);
    }

    // Migrate legacy sessions
    try {
        if (fssync.existsSync(LEGACY_SESSIONS_FILE)) {
            const raw = fssync.readFileSync(LEGACY_SESSIONS_FILE, 'utf8');
            const legacy = JSON.parse(raw);
            const entries = Object.entries(legacy || {});
            for (const [token, s] of entries) {
                const exists = await dbAdapter.query('SELECT token FROM sessions WHERE token = ?', [token]);
                if (exists.length === 0) {
                    await dbAdapter.run(
                        'INSERT INTO sessions (token, user_id, username, created_at, last_access) VALUES (?, ?, ?, ?, ?)',
                        [token, s.userId || s.username, s.username, s.created || new Date().toISOString(), s.lastAccess || null]
                    );
                }
            }
            logger.info('🔄 Migrated legacy sessions to SQLite');
        }
    } catch (e) {
        logger.warn('⚠️ Legacy sessions migration skipped: ' + e.message);
    }
}

// =====================
// DB helper functions
// =====================
async function getUserByUsername(username) {
    const rows = await dbAdapter.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
}

async function listUsers() {
    return dbAdapter.query('SELECT username AS id, username, role, created_at AS created, last_login AS lastLogin FROM users ORDER BY username');
}

async function createUser(username, password, role = 'user') {
    const exists = await getUserByUsername(username);
    if (exists) return { ok: false, code: 'EXISTS' };
    const hash = await bcrypt.hash(password, 10);
    await dbAdapter.run('INSERT INTO users (username, password_hash, role, created_at, last_login) VALUES (?, ?, ?, ?, ?)', [
        username, hash, role, new Date().toISOString(), null
    ]);
    return { ok: true };
}

async function deleteUser(username) {
    await dbAdapter.run('DELETE FROM users WHERE username = ?', [username]);
}

async function touchLastLogin(username) {
    await dbAdapter.run('UPDATE users SET last_login = ? WHERE username = ?', [new Date().toISOString(), username]);
}

async function addSession(token, user) {
    await dbAdapter.run('INSERT OR REPLACE INTO sessions (token, user_id, username, created_at, last_access) VALUES (?, ?, ?, ?, ?)', [
        token, user.id || user.username, user.username, new Date().toISOString(), new Date().toISOString()
    ]);
}

async function removeSession(token) {
    await dbAdapter.run('DELETE FROM sessions WHERE token = ?', [token]);
}

async function getActiveSessionsCount(hours = 24) {
    const threshold = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    const rows = await dbAdapter.query('SELECT COUNT(*) AS cnt FROM sessions WHERE last_access > ?', [threshold]);
    return rows[0]?.cnt || 0;
}

// =====================
// APP SETUP & MIDDLEWARE
// =====================
const app = express();
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({ windowMs: config.rateLimit.windowMs, max: config.rateLimit.max, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(token, config.jwt.secret, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// =====================
// ROUTES
// =====================
// Health
app.get('/healthz', async (req, res) => {
    try {
        const rows = await dbAdapter.query('SELECT 1 AS ok');
        res.json({ status: 'ok', db: rows[0]?.ok === 1, time: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message });
    }
});

// Redirects
app.get('/', (req, res) => res.redirect(config.adminPanelUrl));
app.get('/admin', (req, res) => res.redirect(config.adminPanelUrl));
app.get('/admin/', (req, res) => res.redirect(config.adminPanelUrl));

// Auth
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body || {};
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
        const user = await getUserByUsername(username);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ userId: user.username, username: user.username, role: user.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
        await touchLastLogin(username);
        await addSession(token, { id: user.username, username: user.username });
        res.json({ success: true, token, user: { id: user.username, username: user.username, role: user.role, lastLogin: user.last_login } });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await getUserByUsername(req.user.username);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ id: user.username, username: user.username, role: user.role, created: user.created_at, lastLogin: user.last_login });
    } catch (error) {
        logger.error('Get user info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) await removeSession(token);
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Users
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        const users = await listUsers();
        res.json({ users, total: users.length });
    } catch (error) {
        logger.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        const { username, password, role = 'user' } = req.body || {};
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
        const r = await createUser(username, password, role);
        if (!r.ok && r.code === 'EXISTS') return res.status(409).json({ error: 'Username already exists' });
        logger.info(`New user created: ${username} by ${req.user.username}`);
        res.status(201).json({ success: true, user: { id: username, username, role } });
    } catch (error) {
        logger.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/users/:username', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        const { username } = req.params;
        if (username === 'admin') return res.status(400).json({ error: 'Cannot delete admin user' });
        const user = await getUserByUsername(username);
        if (!user) return res.status(404).json({ error: 'User not found' });
        await deleteUser(username);
        logger.info(`User deleted: ${username} by ${req.user.username}`);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        logger.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        const totalUsersRow = await dbAdapter.query('SELECT COUNT(*) AS cnt FROM users');
        const totalUsers = totalUsersRow[0]?.cnt || 0;
        const totalSessionsRow = await dbAdapter.query('SELECT COUNT(*) AS cnt FROM sessions');
        const totalSessions = totalSessionsRow[0]?.cnt || 0;
        const activeSessions = await getActiveSessionsCount(24);
        res.json({ totalUsers, activeSessions, totalSessions, uptime: process.uptime(), memory: process.memoryUsage(), platform: process.platform, nodeVersion: process.version, timestamp: new Date().toISOString() });
    } catch (error) {
        logger.error('Get stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 404 and error handlers
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// =====================
// STARTUP
// =====================
async function startServer() {
    try {
        await fs.mkdir('./logs', { recursive: true });
        await initDatabase();
        const server = app.listen(config.port, () => {
            logger.info(`🚀 Unified Gateway running on port ${config.port} [${config.env}]`);
        });
        process.on('unhandledRejection', (reason) => logger.error('unhandledRejection', reason));
        process.on('uncaughtException', (err) => logger.error('uncaughtException', err));
        return server;
    } catch (error) {
        logger.error('Failed to start server:', error);
        await sendSlackAlert('Unified Gateway failed to start', 'CRITICAL', { error: error.message });
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = { app, config, logger, startServer };
