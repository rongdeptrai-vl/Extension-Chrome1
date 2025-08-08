// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI Admin Dashboard Server
 * Provides real-time monitoring and control interface for the admin panel
 * Version: 4.0 - Enhanced Security & Real-time Monitoring
 */

// Load environment variables and configurations
require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Load configurations
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
const portsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/ports.json')));

// Import core modules
const UnifiedSystemActivator = require('../system/unified-system-activator.js');
const TINISQLiteAdapter = require('../admin-panel/sqlite-init/sqlite-adapter.node.js');

// Server Configuration
const ADMIN_PORT = process.env.ADMIN_PORT || portsConfig.standardPorts['admin-dashboard'];
const JWT_SECRET = process.env.JWT_SECRET || config.security.jwtSecret;
const BCRYPT_ROUNDS = config.security.bcryptRounds || 10;

// Initialize database
const dbAdapter = new TINISQLiteAdapter({
    dbPath: path.join(__dirname, '..', 'admin-panel', 'tini_admin.db')
});

// Initialize Express app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

// Routes
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await dbAdapter.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (!user || !await bcrypt.compare(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ 
            id: user.id, 
            username: user.username,
            role: user.role
        }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected routes
app.get('/dashboard-data', authenticateToken, async (req, res) => {
    try {
        const systemStatus = UnifiedSystemActivator.getStatus();
        const recentActivity = await dbAdapter.query(
            'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10'
        );

        res.json({
            systemStatus,
            recentActivity
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('🔌 Client connected');

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected');
    });

    // Real-time system monitoring
    socket.on('getSystemStatus', async () => {
        const status = UnifiedSystemActivator.getStatus();
        socket.emit('systemStatus', status);
    });

    // Real-time activity log updates
    socket.on('getActivityLogs', async () => {
        try {
            const logs = await dbAdapter.query(
                'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10'
            );
            socket.emit('activityLogs', logs);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            socket.emit('error', { message: 'Failed to fetch activity logs' });
        }
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await dbAdapter.initialize();
        console.log('✅ Database connection successful');

        server.listen(ADMIN_PORT, () => {
            console.log(`🚀 Admin Dashboard Server running on http://localhost:${ADMIN_PORT}`);
            UnifiedSystemActivator.activateAll().catch(console.error);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 Received SIGTERM signal. Shutting down gracefully...');
    await dbAdapter.close();
    server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
    });
});

// Start the server
startServer();
