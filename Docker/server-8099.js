// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🚀 Simple Production API Server for 2000+ Users
 * 
 * Features:
 * - JWT authentication
 * - Rate limiting  
 * - Security headers
 * - Logging & monitoring
 * - Data validation
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables from .env file
function loadEnvironment() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        require('fs').readFileSync(envPath, 'utf8')
            .split('\n')
            .forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.startsWith('#')) {
                    const [key, ...valueParts] = trimmedLine.split('=');
                    const value = valueParts.join('=');
                    if (key && value !== undefined) {
                        process.env[key.trim()] = value.trim();
                    }
                }
            });
        console.log('📦 [ENV] Environment variables loaded');
    } catch (error) {
        console.log('⚠️ [ENV] Using system environment variables');
    }
}

// Load environment first
loadEnvironment();

// 🔗 **WEBHOOK INTEGRATION FUNCTIONS**
async function sendSlackAlert(message, level = 'INFO', details = null) {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!slackWebhookUrl) {
        console.log('⚠️ [WEBHOOK] Slack webhook not configured - alert skipped:', message);
        return { success: false, reason: 'NO_WEBHOOK_URL' };
    }

    try {
        const colors = {
            'CRITICAL': '#FF0000',
            'HIGH': '#FF6600', 
            'MEDIUM': '#FFCC00',
            'INFO': '#0099FF',
            'SUCCESS': '#00CC00'
        };

        const payload = {
            username: 'TINI Production API',
            icon_emoji: ':rocket:',
            attachments: [{
                color: colors[level] || colors['INFO'],
                title: `🚀 TINI Production API Alert - ${level}`,
                text: message,
                fields: [
                    {
                        title: 'Server Component',
                        value: 'Docker/server 5005.js (Port 5005)',
                        short: true
                    },
                    {
                        title: 'Timestamp',
                        value: new Date().toISOString(),
                        short: true
                    }
                ],
                footer: 'TINI Production Monitoring',
                ts: Math.floor(Date.now() / 1000)
            }]
        };

        if (details) {
            payload.attachments[0].fields.push({
                title: 'Details',
                value: typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details),
                short: false
            });
        }

        const https = require('https');
        const url = require('url');
        const webhookUrl = new URL(slackWebhookUrl);

        const postData = JSON.stringify(payload);
        const options = {
            hostname: webhookUrl.hostname,
            port: webhookUrl.port || 443,
            path: webhookUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        return new Promise((resolve) => {
            const req = https.request(options, (res) => {
                if (res.statusCode === 200) {
                    console.log(`✅ [WEBHOOK] Slack alert sent successfully - ${level}: ${message}`);
                    resolve({ success: true });
                } else {
                    console.log(`❌ [WEBHOOK] Slack webhook failed with status ${res.statusCode}`);
                    resolve({ success: false, reason: 'HTTP_ERROR', status: res.statusCode });
                }
            });

            req.on('error', (error) => {
                console.error('❌ [WEBHOOK] Slack webhook error:', error.message);
                resolve({ success: false, reason: 'NETWORK_ERROR', error: error.message });
            });

            req.write(postData);
            req.end();
        });

    } catch (error) {
        console.error('❌ [WEBHOOK] Slack alert error:', error.message);
        return { success: false, reason: 'EXCEPTION', error: error.message };
    }
}

// =====================
// 🔧 CONFIGURATION
// =====================

const config = {
    port: process.env.PORT || 5005,
    env: process.env.NODE_ENV || 'production',
    
    // JWT config
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-this',
        expiresIn: '24h'
    },
    
    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // requests per windowMs
    },
    
    // Security
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5004'],
        credentials: true
    }
};

// =====================
// 📊 LOGGING SETUP
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
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// =====================
// 💾 SIMPLE FILE-BASED DATABASE
// =====================

const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Initialize data directory
async function initDataStore() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize users file if not exists
        try {
            await fs.access(USERS_FILE);
        } catch {
            const defaultAdmin = {
                admin: {
                    id: 'admin',
                    username: 'admin',
                    password: await bcrypt.hash('admin123', 10),
                    role: 'admin',
                    created: new Date().toISOString(),
                    lastLogin: null
                }
            };
            await fs.writeFile(USERS_FILE, JSON.stringify(defaultAdmin, null, 2));
            logger.info('🔐 Default admin user created: admin/admin123');
        }
        
        // Initialize sessions file if not exists
        try {
            await fs.access(SESSIONS_FILE);
        } catch {
            await fs.writeFile(SESSIONS_FILE, JSON.stringify({}, null, 2));
        }
        
        logger.info('💾 Data store initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize data store:', error);
        throw error;
    }
}

// User operations
async function getUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error('Error reading users:', error);
        return {};
    }
}

async function saveUsers(users) {
    try {
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        logger.error('Error saving users:', error);
        return false;
    }
}

async function getSessions() {
    try {
        const data = await fs.readFile(SESSIONS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error('Error reading sessions:', error);
        return {};
    }
}

async function saveSessions(sessions) {
    try {
        await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
        return true;
    } catch (error) {
        logger.error('Error saving sessions:', error);
        return false;
    }
}

// =====================
// 🛡️ MIDDLEWARE
// =====================

// JWT verification middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, config.jwt.secret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// =====================
// 🚀 EXPRESS APP SETUP
// =====================

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

// =====================
// 📡 API ROUTES
// =====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const users = await getUsers();
        const user = users[username];

        if (!user) {
            logger.warn(`Login attempt with invalid username: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            logger.warn(`Login attempt with invalid password for user: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role 
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        // Update last login
        user.lastLogin = new Date().toISOString();
        users[username] = user;
        await saveUsers(users);

        // Save session
        const sessions = await getSessions();
        sessions[token] = {
            userId: user.id,
            username: user.username,
            created: new Date().toISOString(),
            lastAccess: new Date().toISOString()
        };
        await saveSessions(sessions);

        logger.info(`User logged in successfully: ${username}`);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const users = await getUsers();
        const user = users[req.user.username];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            created: user.created,
            lastLogin: user.lastLogin
        });

    } catch (error) {
        logger.error('Get user info error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        // Remove session
        const sessions = await getSessions();
        delete sessions[token];
        await saveSessions(sessions);

        logger.info(`User logged out: ${req.user.username}`);
        res.json({ success: true, message: 'Logged out successfully' });

    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const users = await getUsers();
        const userList = Object.values(users).map(user => ({
            id: user.id,
            username: user.username,
            role: user.role,
            created: user.created,
            lastLogin: user.lastLogin
        }));

        res.json({ users: userList, total: userList.length });

    } catch (error) {
        logger.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new user (admin only)
app.post('/api/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { username, password, role = 'user' } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const users = await getUsers();

        if (users[username]) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        users[username] = {
            id: username,
            username,
            password: hashedPassword,
            role,
            created: new Date().toISOString(),
            lastLogin: null
        };

        const success = await saveUsers(users);

        if (success) {
            logger.info(`New user created: ${username} by ${req.user.username}`);
            res.status(201).json({
                success: true,
                user: {
                    id: username,
                    username,
                    role,
                    created: users[username].created
                }
            });
        } else {
            res.status(500).json({ error: 'Failed to create user' });
        }

    } catch (error) {
        logger.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete user (admin only)
app.delete('/api/users/:username', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { username } = req.params;

        if (username === 'admin') {
            return res.status(400).json({ error: 'Cannot delete admin user' });
        }

        const users = await getUsers();

        if (!users[username]) {
            return res.status(404).json({ error: 'User not found' });
        }

        delete users[username];
        const success = await saveUsers(users);

        if (success) {
            logger.info(`User deleted: ${username} by ${req.user.username}`);
            res.json({ success: true, message: 'User deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete user' });
        }

    } catch (error) {
        logger.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get system stats (admin only)
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const users = await getUsers();
        const sessions = await getSessions();

        // Count active sessions (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeSessions = Object.values(sessions).filter(session => 
            new Date(session.lastAccess) > oneDayAgo
        );

        res.json({
            totalUsers: Object.keys(users).length,
            activeSessions: activeSessions.length,
            totalSessions: Object.keys(sessions).length,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            platform: process.platform,
            nodeVersion: process.version,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Get stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// =====================
// 🚀 SERVER STARTUP
// =====================

async function startServer() {
    try {
        // Initialize data store
        await initDataStore();

        // Create logs directory
        await fs.mkdir('./logs', { recursive: true });

        // Start server
        const server = app.listen(config.port, () => {
            // Send startup webhook notification
            sendSlackAlert(
                `🚀 TINI Production API Server Successfully Started on Port ${config.port}`,
                'SUCCESS',
                {
                    server: 'Docker/server 5005.js',
                    port: config.port,
                    environment: config.env,
                    corsOrigins: config.cors.origin,
                    timestamp: new Date().toISOString(),
                    capacity: '2000+ users ready'
                }
            );
            
            logger.info(`🚀 Production API Server running on port ${config.port}`);
            logger.info(`📊 Environment: ${config.env}`);
            logger.info(`🛡️ CORS enabled for: ${config.cors.origin.join(', ')}`);
            logger.info(`⚡ Ready to handle 2000+ users!`);
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            logger.info('Received SIGINT, shutting down gracefully...');
            server.close(() => {
                logger.info('Server closed successfully');
                process.exit(0);
            });
        });

        process.on('SIGTERM', () => {
            logger.info('Received SIGTERM, shutting down gracefully...');
            server.close(() => {
                logger.info('Server closed successfully');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// WARNING: This is a duplicate of Docker/server 8099.js kept for legacy references.
// Do not run this file. Please use "Docker/server 8099.js" only.
if (require.main === module) {
    console.error('This file is deprecated. Run "node \"Docker/server 8099.js\"" instead.');
    process.exit(1);
}

// Start the server if this file is run directly
if (require.main === module) {
    startServer();
}

module.exports = {};
