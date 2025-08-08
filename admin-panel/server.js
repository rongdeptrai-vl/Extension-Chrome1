// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Load environment variables
require('dotenv').config({ path: '../.env' });

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load TINI Environment Config
const TiniEnvironmentConfig = require('../config/tini-env-config.js');
const envConfig = new TiniEnvironmentConfig();

const PORT = process.env.PORT || envConfig.get('PORT') || 8080;
const PORT_FALLBACKS = (process.env.PORT_FALLBACKS || '8081,8082')
  .split(',')
  .map(p => parseInt(p.trim(), 10))
  .filter(p => Number.isInteger(p));

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;
    const method = req.method;
    
    // Enable CORS for API requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // API Routes
    if (pathname.startsWith('/api/')) {
        handleAPIRequest(req, res, pathname);
        return;
    }
    
    // Default to admin panel
    if (pathname === '/') {
        pathname = '/admin-panel.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    
    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Access forbidden');
        return;
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }
        
        const ext = path.extname(pathname);
        const mimeType = mimeTypes[ext] || 'text/plain';
        
        res.writeHead(200, {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        
        res.end(data);
    });
});

// API Request Handler
function handleAPIRequest(req, res, pathname) {
    const method = req.method;
    
    switch (pathname) {
        case '/api/config/client':
            // Provide client-safe configuration
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: {
                    DEFAULT_LANGUAGE: envConfig.get('DEFAULT_LANGUAGE') || 'zh',
                    DEFAULT_TIMEZONE: envConfig.get('DEFAULT_TIMEZONE') || 'Asia/Ho_Chi_Minh',
                    SUPPORTED_LANGUAGES: envConfig.get('SUPPORTED_LANGUAGES') || ['en', 'zh', 'vi', 'ko', 'hi'],
                    SESSION_TIMEOUT: envConfig.get('SESSION_TIMEOUT') || 3600000,
                    MONITOR_INTERVAL: envConfig.get('MONITOR_INTERVAL') || 30000,
                    ENABLE_MONITORING: envConfig.get('ENABLE_MONITORING') || true,
                    DEV_MODE: envConfig.get('DEV_MODE') || false,
                    ENABLE_DEBUG_PANEL: envConfig.get('ENABLE_DEBUG_PANEL') || false,
                    API_VERSION: 'v1.0',
                    CLIENT_VERSION: '1.0.0'
                }
            }));
            break;
            
        case '/api/health':
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'healthy',
                service: 'TINI Admin Panel',
                version: '4.1.0',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            }));
            break;
            
        case '/api/status':
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'online',
                server: 'admin-panel',
                port: PORT,
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            }));
            break;
            
        case '/api/ping':
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                ping: 'pong',
                timestamp: new Date().toISOString(),
                server: 'TINI-Admin-Panel'
            }));
            break;
            
        case '/api/auth/validate':
            if (method === 'POST') {
                handleAuthValidation(req, res);
            } else {
                res.writeHead(405);
                res.end('Method not allowed');
            }
            break;
            
        default:
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
}

// Authentication validation handler
function handleAuthValidation(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const { username, deviceId } = data;
            
            // Basic validation
            if (!username || !deviceId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Missing username or deviceId'
                }));
                return;
            }
            
            // Validate using TINI validation patterns
            const isValidUsername = username.length >= 3 && username.length <= 50;
            const isValidDeviceId = /^[a-zA-Z0-9-]{8,36}$/.test(deviceId);
            
            if (isValidUsername && isValidDeviceId) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Authentication successful',
                    user: {
                        username: username,
                        deviceId: deviceId,
                        timestamp: new Date().toISOString()
                    }
                }));
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Invalid username or device ID format'
                }));
            }
            
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Invalid JSON data'
            }));
        }
    });
}

// Replace direct listen with fallback-aware listener
function startWithFallback(ports) {
    const candidates = Array.from(new Set(ports));
    let idx = 0;

    const tryListen = () => {
        const port = candidates[idx];
        server.once('error', (err) => {
            if (err && err.code === 'EADDRINUSE' && idx < candidates.length - 1) {
                idx++;
                console.warn(`[admin-panel] Port ${port} in use, trying ${candidates[idx]}...`);
                tryListen();
            } else {
                console.error('[admin-panel] Failed to start server:', err);
                process.exit(1);
            }
        });

        server.listen(port, () => {
            console.log('========================================');
            console.log('   TINI ADMIN PANEL - NODE.JS SERVER');
            console.log('========================================');
            console.log('');
            console.log(`🚀 Server running on: http://localhost:${port}`);
            console.log(`📱 Admin Panel: http://localhost:${port}/admin-panel.html`);
            console.log('');
            console.log('Press Ctrl+C to stop the server');
            console.log('========================================');
        });
    };

    tryListen();
}

startWithFallback([PORT, ...PORT_FALLBACKS]);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Server shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});
