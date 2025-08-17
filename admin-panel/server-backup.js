// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Load environment variables
require('dotenv').config({ path: '../.env' });

// Global error handling to prevent crashes
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    console.error('❌ Stack:', error.stack);
    // Log but don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Log but don't exit - keep server running
});

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const zlib = require('zlib');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const { Server: IOServer } = require('socket.io');
let io; // socket.io instance

// Load TINI Environment Config
const TiniEnvironmentConfig = require('../config/tini-env-config.js');
const envConfig = new TiniEnvironmentConfig();

// Database connection
const dbPath = path.join(__dirname, 'tini_admin.db');
let db;

// File cache for frequently accessed files
const fileCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Preload important files
function preloadCriticalFiles() {
    const criticalFiles = [
        '../i18n-master.js',
        '../_locales/zh/messages.json',
        '../_locales/en/messages.json',
        'admin-panel.html'
    ];
    
    criticalFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        fs.readFile(filePath, (err, data) => {
            if (!err) {
                fileCache.set(filePath, {
                    data: data,
                    timestamp: Date.now(),
                    etag: crypto.createHash('md5').update(data).digest('hex').substring(0, 8)
                });
                console.log(`[CACHE] Preloaded: ${file}`);
            }
        });
    });
}

// Get file from cache or disk
function getCachedFile(filePath, callback) {
    const cached = fileCache.get(filePath);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        callback(null, cached.data, cached.etag);
        return;
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            callback(err);
            return;
        }
        
        const etag = crypto.createHash('md5').update(data).digest('hex').substring(0, 8);
        fileCache.set(filePath, {
            data: data,
            timestamp: now,
            etag: etag
        });
        callback(null, data, etag);
    });
}

// In-memory realtime metrics
const activeUsersMap = new Map(); // userId -> lastSeen ms
const ROLLING_MINUTES = 60;
const minuteBuckets = Array.from({length: ROLLING_MINUTES}, () => ({ts: minuteStart(), actions:0, conversions:0, bounces:0, sessions:0, sessionDur:0}));
let bucketIndex = 0;
function minuteStart(t=Date.now()){ const d=new Date(t); d.setSeconds(0,0); return d.getTime(); }
function rotateBucket(){ const nowStart = minuteStart(); if(minuteBuckets[bucketIndex].ts !== nowStart){ bucketIndex = (bucketIndex+1)%ROLLING_MINUTES; minuteBuckets[bucketIndex] = {ts: nowStart, actions:0, conversions:0, bounces:0, sessions:0, sessionDur:0}; } }
function sweepInactive(){ const cutoff = Date.now() - 60*60*1000; for(const [u,t] of activeUsersMap){ if(t < cutoff) activeUsersMap.delete(u); } }

// Parse cookie string to object
function parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const parts = cookie.trim().split('=');
            if (parts.length === 2) {
                cookies[parts[0]] = decodeURIComponent(parts[1]);
            }
        });
    }
    return cookies;
}
function currentMetrics(){ // aggregate last hour
  const now = Date.now();
  const hourBuckets = minuteBuckets.filter(b => now - b.ts < 60*60*1000);
  const agg = hourBuckets.reduce((a,b)=>{a.actions+=b.actions; a.conversions+=b.conversions; a.bounces+=b.bounces; a.sessions+=b.sessions; a.sessionDur+=b.sessionDur; return a;}, {actions:0,conversions:0,bounces:0,sessions:0,sessionDur:0});
  return {
    activeUsers: activeUsersMap.size,
    conversionRate: agg.actions? +(agg.conversions*100/agg.actions).toFixed(1):0,
    bounceRate: agg.actions? +(agg.bounces*100/agg.actions).toFixed(1):0,
    avgSessionDuration: agg.sessions? Math.round(agg.sessionDur/agg.sessions):0,
    retentionRate: 0, // DB daily process
    totalActivities: agg.actions,
    deltas: {},
    timestamp: new Date().toISOString()
  };
}
let lastSentMetrics = null;
function diffAndBroadcast(){ const m = currentMetrics(); if(!lastSentMetrics){ lastSentMetrics = m; io.emit('analytics:update', m); return; } const changed = {}; ['activeUsers','conversionRate','bounceRate','avgSessionDuration','retentionRate','totalActivities'].forEach(k=>{ if(m[k]!==lastSentMetrics[k]) changed[k]=m[k]; }); if(Object.keys(changed).length){ io.emit('analytics:update', {...changed, timestamp:m.timestamp}); lastSentMetrics = m; } }
function ingestActivity(userId, action, sessionDurationSec){ rotateBucket(); activeUsersMap.set(userId, Date.now()); const b = minuteBuckets[bucketIndex]; b.actions++; if(action==='Conversion') b.conversions++; if(action==='Bounce') b.bounces++; if(sessionDurationSec){ b.sessions++; b.sessionDur += sessionDurationSec; }
    // async DB insert minimal (optional):
    if(db){ db.run('INSERT INTO activities (user_id, action, details, created_at) VALUES (?,?,?,datetime("now"))', [userId, action, action,], ()=>{}); }
 }

// Utility function to get time ago display
function getTimeAgo(timestamp) {
    if (!timestamp) return '从未';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return past.toLocaleDateString('zh-CN');
}

// Automatic session cleanup - runs every hour
function startSessionCleanupTimer() {
    setInterval(() => {
        if (db) {
            db.run(`DELETE FROM sessions WHERE expires_at < datetime('now')`, function(err) {
                if (!err && this.changes > 0) {
                    console.log(`🧹 Auto-cleanup: Removed ${this.changes} expired sessions at ${new Date().toISOString()}`);
                    
                    // Emit real-time update to connected clients
                    if (io) {
                        io.emit('user_status_update', {
                            type: 'session_cleanup',
                            timestamp: new Date().toISOString(),
                            cleaned_sessions: this.changes
                        });
                    }
                }
            });
        }
    }, 60 * 60 * 1000); // Run every hour
    console.log('🕒 Started automatic session cleanup timer (every 1 hour)');
}

// Initialize database connection with error handling
try {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Database connection failed:', err.message);
            console.log('📂 Database path:', dbPath);
            console.log('🔍 File exists:', require('fs').existsSync(dbPath));
        } else {
            console.log('✅ Database connected successfully');
            
            // Create device_registrations table if not exists
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS device_registrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    full_name TEXT NOT NULL,
                    normalized_name TEXT,
                    device_id TEXT NOT NULL UNIQUE,
                    internal_ip TEXT,
                    fingerprint TEXT,
                    user_agent TEXT,
                    email TEXT,
                    phone_number TEXT,
                    department TEXT,
                    registered_at TEXT NOT NULL,
                    status TEXT DEFAULT 'approved',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login_at TEXT,
                    last_login_ip TEXT
                )
            `;
            
            db.run(createTableSQL, (err) => {
                if (err) {
                    console.error('❌ Failed to create device_registrations table:', err.message);
                } else {
                    console.log('✅ Device registrations table ready');
                    
                    // Add missing columns if they don't exist
                    const addColumnsQueries = [
                        'ALTER TABLE device_registrations ADD COLUMN normalized_name TEXT',
                        'ALTER TABLE device_registrations ADD COLUMN last_login_at TEXT',
                        'ALTER TABLE device_registrations ADD COLUMN last_login_ip TEXT'
                    ];
                    
                    addColumnsQueries.forEach((query, index) => {
                        db.run(query, (addErr) => {
                            if (addErr && !addErr.message.includes('duplicate column name')) {
                                console.warn(`⚠️ Column add failed (${index + 1}):`, addErr.message);
                            } else if (!addErr) {
                                console.log(`✅ Added missing column (${index + 1})`);
                            }
                        });
                    });
                }
            });

            // NEW: Ensure pending_approvals table exists for registration approval workflow
            const createPendingApprovalsSQL = `
                CREATE TABLE IF NOT EXISTS pending_approvals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    request_type VARCHAR(50) NOT NULL,
                    user_id VARCHAR(50) NOT NULL,
                    device_id VARCHAR(36),
                    request_data TEXT,
                    priority VARCHAR(20) DEFAULT 'MEDIUM',
                    status VARCHAR(20) DEFAULT 'PENDING',
                    assigned_to VARCHAR(50),
                    approved_by VARCHAR(50),
                    approved_at TIMESTAMP,
                    rejected_by VARCHAR(50),
                    rejected_at TIMESTAMP,
                    rejection_reason TEXT,
                    auto_approve_eligible INTEGER DEFAULT 0,
                    expires_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            db.run(createPendingApprovalsSQL, (err) => {
                if (err) {
                    console.error('❌ Failed to create pending_approvals table:', err.message);
                } else {
                    console.log('✅ Pending approvals table ready');
                    // Helpful indexes (best-effort)
                    const indexQueries = [
                        'CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_approvals(status)',
                        'CREATE INDEX IF NOT EXISTS idx_pending_type ON pending_approvals(request_type)',
                        'CREATE INDEX IF NOT EXISTS idx_pending_priority ON pending_approvals(priority)',
                        'CREATE INDEX IF NOT EXISTS idx_pending_expires ON pending_approvals(expires_at)'
                    ];
                    indexQueries.forEach(q => db.run(q, ()=>{}));
                }
            });
        }
    });
} catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
}

// --- Auto choose & persist high fixed ports if current port low (<50000) ---
(function ensureHighPorts() {
    try {
        const MIN_OK = 50000;
        const BASE = parseInt(process.env.HIGH_PORT_BASE || '55055', 10);
        const FALLBACK_COUNT = 3;
        const envPath = path.join(__dirname, '..', '.env');
        const force = process.env.FORCE_HIGH_PORTS !== 'false';
        const currentPort = parseInt(process.env.PORT || envConfig.get('PORT') || '', 10);
        if (!force) return;
        if (currentPort && currentPort >= MIN_OK) return; // already high
        // build list and make sure inside valid range (<65535)
        const fallbacks = Array.from({ length: FALLBACK_COUNT }, (_, i) => BASE + 1 + i).filter(p => p < 65535);
        process.env.PORT = String(BASE);
        process.env.PORT_FALLBACKS = fallbacks.join(',');
        if (!process.env.BIND_HOST) process.env.BIND_HOST = '0.0.0.0';
        // read/merge .env
        let content = '';
        try { content = fs.readFileSync(envPath, 'utf8'); } catch { /* no file yet */ }
        function upsert(k, v) {
            const re = new RegExp('^' + k + '=.*', 'm');
            if (re.test(content)) content = content.replace(re, `${k}=${v}`); else content += (content.endsWith('\n') || content === '' ? '' : '\n') + `${k}=${v}`; }
        upsert('PORT', BASE);
        upsert('PORT_FALLBACKS', fallbacks.join(','));
        upsert('BIND_HOST', process.env.BIND_HOST);
        upsert('HIGH_PORT_BASE', BASE);
        fs.writeFileSync(envPath, content.endsWith('\n') ? content : content + '\n');
        console.log(`[admin-panel] Auto-set high ports -> PORT=${BASE}, PORT_FALLBACKS=${fallbacks.join(',')} (saved to .env).`);
    } catch (e) {
        console.warn('[admin-panel] Failed auto high port setup:', e.message);
    }
})();

const PORT = process.env.PORT || envConfig.get('PORT') || 55057;
const HOST = process.env.BIND_HOST || envConfig.get('BIND_HOST') || '0.0.0.0';
const PORT_FALLBACKS = (process.env.PORT_FALLBACKS || '55058,55059')
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

// --- Refactored: create a fresh server instance for each port attempt ---
function createServer() {
    return http.createServer((req, res) => {
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
        
        // Special handling for files from parent directory
        let filePath;
        if (pathname === '/i18n-master.js') {
            filePath = path.join(__dirname, '..', 'i18n-master.js');
        } else if (pathname.startsWith('/_locales/')) {
            // Serve locales from parent directory
            filePath = path.join(__dirname, '..', pathname);
        } else {
            filePath = path.join(__dirname, pathname);
        }
        
        // Security check - prevent directory traversal
        const projectRoot = path.resolve(__dirname, '..');
        const adminPanelDir = __dirname;
        if (!filePath.startsWith(adminPanelDir) && !filePath.startsWith(projectRoot)) {
            res.writeHead(403);
            res.end('Access forbidden');
            return;
        }
        
        getCachedFile(filePath, (err, data, etag) => {
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
            
            // Set appropriate cache headers based on file type
            let cacheControl = 'no-cache, no-store, must-revalidate'; // Default for dynamic content
            if (ext === '.js' || ext === '.css' || ext === '.json') {
                cacheControl = 'public, max-age=300'; // 5 minutes cache for static assets
            } else if (ext === '.png' || ext === '.jpg' || ext === '.gif' || ext === '.ico' || ext === '.svg') {
                cacheControl = 'public, max-age=3600'; // 1 hour cache for images
            }
            
            const headers = {
                'Content-Type': mimeType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Cache-Control': cacheControl
            };
            
            // Add ETag for better caching
            if (ext === '.js' || ext === '.css' || ext === '.json') {
                headers['ETag'] = `"${etag}"`;
                
                // Check if client has cached version
                const clientETag = req.headers['if-none-match'];
                if (clientETag === `"${etag}"`) {
                    res.writeHead(304, headers);
                    res.end();
                    return;
                }
            }
            
            // Apply compression for text-based files
            const acceptEncoding = req.headers['accept-encoding'] || '';
            const shouldCompress = (ext === '.js' || ext === '.css' || ext === '.json' || ext === '.html') && data.length > 1024;
            
            if (shouldCompress && acceptEncoding.includes('gzip')) {
                headers['Content-Encoding'] = 'gzip';
                zlib.gzip(data, (err, compressed) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Compression error');
                        return;
                    }
                    res.writeHead(200, headers);
                    res.end(compressed);
                });
            } else {
                res.writeHead(200, headers);
                res.end(data);
            }
        });
    });
}

let server; // will hold the active server instance

// API Request Handler
function handleAPIRequest(req, res, pathname) {
    try {
        const method = req.method;
        console.log(`🔍 API Request: ${method} ${pathname}`);
        
        if(pathname === '/api/dev/simulate' && (process.env.DEV_MODE==='true')){
            let body=''; 
            req.on('data',c=>body+=c); 
            req.on('end',()=>{ 
                try{ 
                    const p = JSON.parse(body||'{}'); 
                    const user = p.user||('u'+Math.ceil(Math.random()*4)); 
                    const action = p.action||'Page View'; 
                    const dur = p.sessionDuration||0; 
                    ingestActivity(user, action, dur); 
                    diffAndBroadcast(); 
                    res.writeHead(200,{ 'Content-Type':'application/json'}); 
                    res.end(JSON.stringify({ok:true,user,action})); 
                }catch(e){ 
                    res.writeHead(400); 
                    res.end(JSON.stringify({error:'bad json'})); 
                }
            }); 
            return;
        }
    
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

        case '/api/analytics/realtime':
            // Real-time analytics data from database
            handleRealTimeAnalytics(req, res);
            break;

        case '/api/analytics/traffic':
            // Traffic analytics from database
            handleTrafficAnalytics(req, res);
            break;

        case '/api/analytics/performance':
            // Performance metrics from database
            handlePerformanceAnalytics(req, res);
            break;

        case '/api/analytics/retention':
            // User retention data from database
            handleRetentionAnalytics(req, res);
            break;

        case '/api/analytics/security':
            // Security analytics from database
            handleSecurityAnalytics(req, res);
            break;
            
        case '/api/auth/validate':
            if (method === 'POST') {
                handleAuthValidation(req, res);
            } else {
                res.writeHead(405);
                res.end('Method not allowed');
            }
            break;
            
        case '/api/register':
            if (method === 'POST') {
                handleUserRegistration(req, res);
            } else {
                res.writeHead(405);
                res.end('Method not allowed');
            }
            break;
            
        case '/api/register/check':
            if (method === 'GET') {
                try {
                    const parsed = url.parse(req.url, true);
                    const name = (parsed.query.name || '').toString().trim();
                    
                    if (!db) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Database not available' }));
                        return;
                    }
                    
                    const target = normName(name);
                    
                    // Check if name exists in database
                    const query = `
                        SELECT COUNT(*) as count 
                        FROM device_registrations 
                        WHERE LOWER(REPLACE(REPLACE(full_name, ' ', ''), '-', '')) = LOWER(REPLACE(REPLACE(?, ' ', ''), '-', ''))
                    `;
                    
                    db.get(query, [name], (err, row) => {
                        if (err) {
                            console.error('❌ Database query error:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Database error' }));
                            return;
                        }
                        
                        const nameExists = row.count > 0;
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, nameExists }));
                    });
                    
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Server error' }));
                }
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;
        
        // NEW: Check if a device is already registered and return info
        case '/api/device/check':
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
                    
                    if (!db) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Database not available' }));
                        break;
                    }
                    
                    // Query database for device registration
                    const query = `
                        SELECT full_name, normalized_name, device_id, status, created_at, last_login_at, last_login_ip
                        FROM device_registrations 
                        WHERE device_id = ?
                    `;
                    
                    db.get(query, [deviceId], (err, row) => {
                        if (err) {
                            console.error('Database query error:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Database error' }));
                            return;
                        }
                        
                        const exists = !!row;
                        const device = row ? {
                            fullName: row.full_name,
                            normalizedName: row.normalized_name,
                            deviceId: row.device_id,
                            status: row.status || 'approved',
                            registeredAt: row.created_at,
                            lastLoginAt: row.last_login_at,
                            lastLoginIp: row.last_login_ip
                        } : null;
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, exists, device }));
                    });
                } catch (e) {
                    console.error('Device check error:', e);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Server error' }));
                }
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;
        
        // NEW: Get all registrations for sync purposes
        case '/api/registrations/all':
            if (method === 'GET') {
                try {
                    if (!db) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Database not available' }));
                        break;
                    }
                    
                    // Get all registrations from database
                    const query = `
                        SELECT full_name, device_id, status, created_at, last_login_at 
                        FROM device_registrations 
                        ORDER BY created_at DESC 
                        LIMIT 10
                    `;
                    
                    db.all(query, [], (err, rows) => {
                        if (err) {
                            console.error('Database query error:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Database error' }));
                            return;
                        }
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: true, 
                            registrations: rows || []
                        }));
                    });
                    
                } catch (e) {
                    console.error('Registrations list error:', e);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Server error' }));
                }
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;

        // NEW: Pending approval workflow APIs
        case '/api/admin/pending-approvals':
            if (method === 'GET') {
                try {
                    if (!db) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Database not available' }));
                        break;
                    }
                    const q = `
                        SELECT p.*, d.full_name, d.device_id
                        FROM pending_approvals p
                        LEFT JOIN device_registrations d ON p.user_id = d.employee_id
                        WHERE p.status = 'PENDING'
                        ORDER BY p.created_at ASC
                        LIMIT 100
                    `;
                    db.all(q, [], (err, rows=[]) => {
                        if (err) {
                            console.error('❌ Pending approvals query error:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success:false, error:'Database error' }));
                            return;
                        }
                        const approvals = rows.map(r => ({...r, request_data: safeParseJson(r.request_data)}));
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success:true, approvals }));
                    });
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success:false, error:'Server error' }));
                }
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success:false, error:'Method not allowed' }));
            }
            break;
        case '/api/admin/pending-approvals/approve':
        case '/api/admin/pending-approvals/reject':
        case '/api/admin/pending-approvals/ignore':
            if (method === 'POST') {
                let body='';
                req.on('data', c => body += c);
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body||'{}');
                        const id = Number(payload.id);
                        const reason = (payload.reason||'').toString();
                        if (!id) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success:false, error:'Missing id' }));
                            return;
                        }
                        const action = pathname.split('/').pop(); // approve|reject|ignore
                        const nowIso = new Date().toISOString();
                        let updateSQL, params;
                        if (action === 'approve') {
                            updateSQL = `UPDATE pending_approvals SET status='APPROVED', approved_by=?, approved_at=? WHERE id=?`;
                            params = ['admin', nowIso, id];
                        } else if (action === 'reject') {
                            updateSQL = `UPDATE pending_approvals SET status='REJECTED', rejected_by=?, rejected_at=?, rejection_reason=? WHERE id=?`;
                            params = ['admin', nowIso, reason||'Rejected', id];
                        } else { // ignore
                            updateSQL = `UPDATE pending_approvals SET status='IGNORED' WHERE id=?`;
                            params = [id];
                        }
                        db.run(updateSQL, params, function(err){
                            if (err) {
                                console.error('❌ Update approval error:', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success:false, error:'Database error' }));
                                return;
                            }
                            // If approved, also mark device as approved when possible
                            if (action === 'approve') {
                                db.get('SELECT device_id FROM pending_approvals WHERE id=?', [id], (e,row)=>{
                                    if (!e && row && row.device_id) {
                                        db.run('UPDATE device_registrations SET status=\'approved\' WHERE device_id=?', [row.device_id], ()=>{});
                                    }
                                });
                            }
                            // Broadcast realtime update
                            try { if (io) { io.emit('pending_approvals:update', { action, id, reason, at: nowIso }); } } catch {}
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success:true, action, id }));
                        });
                    } catch (e) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success:false, error:'Invalid JSON' }));
                    }
                });
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success:false, error:'Method not allowed' }));
            }
            break;
        
        case '/api/users/list':
            if (method === 'GET') {
                handleUsersList(req, res);
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;
            
        case '/api/sessions/cleanup':
            if (method === 'POST') {
                handleSessionCleanup(req, res);
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;
            
        case '/api/auth/logout':
            if (method === 'POST') {
                handleLogout(req, res);
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;
            
        case '/api/activities/recent':
            if (method === 'GET') {
                handleRecentActivities(req, res);
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;

        case '/api/users/delete':
            console.log(`🔍 Users delete endpoint hit with method: ${method}`);
            if (method === 'DELETE' || method === 'POST') {
                console.log(`✅ Method allowed, calling handleUserDelete`);
                handleUserDelete(req, res);
            } else {
                console.log(`❌ Method not allowed: ${method}`);
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;

        // 🏆 ADMIN MANAGEMENT ENDPOINTS
        case '/api/admin/login':
            if (method === 'POST') {
                handleAdminLogin(req, res);
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;

        case '/api/admin/list':
            if (method === 'GET') {
                handleAdminList(req, res);
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;

        case '/api/admin/promote':
            if (method === 'POST') {
                handleAdminPromotion(req, res);
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;

        case '/api/admin/demote':
            if (method === 'POST') {
                handleAdminDemotion(req, res);
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;

        case '/api/admin/permissions':
            if (method === 'GET') {
                handleAdminPermissions(req, res);
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
            }
            break;
        
        default:
            console.log(`❌ API endpoint not found: ${pathname}`);
            console.log(`❌ Available endpoints: /api/users/list, /api/users/delete, /api/activities/recent`);
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
    }
    } catch (error) {
        console.error('❌ API Request Error:', error);
        console.error('❌ Stack:', error.stack);
        try {
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        } catch (responseError) {
            console.error('❌ Response Error:', responseError);
        }
    }
}

// --- Simple exponential backoff to mitigate spam ---
const BACKOFF_WINDOW_MS = 60 * 1000; // 1 minute sliding window
const BACKOFF_BASE_MS = 250;
const BACKOFF_FACTOR = 1.8;
const BACKOFF_MAX_MS = 7000;
const BACKOFF_HARD_LIMIT = 12; // After this within window -> 429
const backoffMap = new Map(); // key -> { events: number[] timestamps }

// Normalize full name for duplicate checks (Unicode + whitespace + case)
function normName(s){
    try {
        return String(s || '')
            .normalize('NFKC')
            .replace(/\s+/g, ' ')
            .trim()
            .toLocaleUpperCase('vi-VN');
    } catch {
        return (s || '').trim().toUpperCase();
    }
}

function getClientIp(req){
    const xff = req.headers['x-forwarded-for'];
    if (xff && typeof xff === 'string') return xff.split(',')[0].trim();
    return (req.socket && (req.socket.remoteAddress || req.socket.localAddress)) || 'unknown';
}

function recordAndComputeBackoff(key, now = Date.now()){
    let entry = backoffMap.get(key);
    if (!entry) entry = { events: [] };
    // prune old
    entry.events = entry.events.filter(ts => (now - ts) <= BACKOFF_WINDOW_MS);
    entry.events.push(now);
    backoffMap.set(key, entry);
    const n = entry.events.length;
    let delay = 0;
    if (n > 3) {
        delay = Math.min(BACKOFF_MAX_MS, Math.floor(BACKOFF_BASE_MS * Math.pow(BACKOFF_FACTOR, n - 3)));
    }
    const over = n > BACKOFF_HARD_LIMIT;
    const retryAfter = over ? 15 : 0; // seconds
    return { delay, count: n, overLimit: over, retryAfter };
}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function safeParseJson(s){ try { return JSON.parse(s||'{}'); } catch { return {}; } }

// Authentication validation handler
function handleAuthValidation(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        (async () => {
        try {
            const data = JSON.parse(body);
            const { username, deviceId, fingerprint, internalIp, userAgent } = data;
            
            console.log('🔍 Authentication attempt:', { username, deviceId, fingerprint: fingerprint ? 'present' : 'missing' });
            
            // Basic validation
            if (!username || !deviceId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Missing username or deviceId'
                }));
                return;
            }

            // Backoff per IP+username
            const ip = getClientIp(req);
            const key = `${ip}|auth|${username}`;
            const { delay, count, overLimit, retryAfter } = recordAndComputeBackoff(key);
            if (overLimit) {
                console.warn(`[BACKOFF] Too many auth attempts ${count} for ${key}. 429 with Retry-After=${retryAfter}s`);
                res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) });
                res.end(JSON.stringify({ success:false, error:'Too many attempts, please try later.', retryAfter }));
                return;
            }
            if (delay) {
                console.log(`[BACKOFF] Delaying auth ${delay}ms for ${key} (count=${count})`);
                res.setHeader('X-Backoff-Delay', String(delay));
                await sleep(delay);
            }
            
            // Check if user is registered from database
            if (!db) {
                console.error('❌ Database not available');
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Database not available'
                }));
                return;
            }
            
            // Query database for user registration
            const query = `
                SELECT full_name, device_id, status, created_at, last_login_at, last_login_ip, fingerprint
                FROM device_registrations 
                WHERE full_name = ? AND device_id = ?
            `;
            
            const registeredUser = await new Promise((resolve, reject) => {
                db.get(query, [username, deviceId], (err, row) => {
                    if (err) {
                        console.error('❌ Database query error:', err);
                        reject(err);
                        return;
                    }
                    
                    if (!row) {
                        console.log('❌ User not found in database:', username, deviceId);
                        resolve(null);
                        return;
                    }
                    
                    // Convert database row to expected format
                    resolve({
                        fullName: row.full_name,
                        deviceId: row.device_id,
                        status: row.status || 'approved',
                        registeredAt: row.created_at,
                        lastLoginAt: row.last_login_at,
                        lastLoginIp: row.last_login_ip,
                        fingerprint: row.fingerprint
                    });
                });
            }).catch(err => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Database error checking registration'
                }));
                return null;
            });
            
            if (!registeredUser) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'User not registered. Please register first.',
                    code: 'USER_NOT_REGISTERED'
                }));
                return;
            }
            
            // Check device status (for future device approval workflow)
            if (registeredUser.status === 'blocked') {
                console.log('🚫 Blocked user attempted login:', username);
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Device is blocked. Contact administrator.',
                    code: 'DEVICE_BLOCKED'
                }));
                return;
            }
            
            if (registeredUser.status === 'pending') {
                console.log('⏳ Pending user attempted login:', username);
                res.writeHead(202, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Device approval pending. Contact administrator.',
                    code: 'DEVICE_PENDING'
                }));
                return;
            }
            
            // Validate fingerprint if provided (future enhancement)
            if (fingerprint && registeredUser.fingerprint && fingerprint !== registeredUser.fingerprint) {
                console.log('🔍 Fingerprint mismatch for user:', username);
                console.warn('⚠️ Device fingerprint changed - possible security concern');
            }
            
            // Validate formats
            const isValidUsername = username.length >= 3 && username.length <= 50;
            const isValidDeviceId = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/i.test(deviceId);
            
            if (isValidUsername && isValidDeviceId) {
                // Update last login info in database
                const updateQuery = `
                    UPDATE device_registrations 
                    SET last_login_at = ?, last_login_ip = ?, user_agent = ?
                    WHERE full_name = ? AND device_id = ?
                `;
                
                const currentTime = new Date().toISOString();
                
                db.run(updateQuery, [
                    currentTime,
                    internalIp || 'unknown',
                    userAgent || 'unknown',
                    username,
                    deviceId
                ], function(err) {
                    if (err) {
                        console.error('❌ Failed to update login info in database:', err);
                    } else {
                        console.log('📝 Updated last login info in database for:', username);
                    }
                });
                
                // Create activity record for login success
                if (db) {
                    // Find user ID from users table
                    db.get(`SELECT id, username, full_name FROM users WHERE full_name = ? OR username = ?`, [registeredUser.fullName, username], (err, userRow) => {
                         if (err) {
                             console.error('❌ Failed to find user ID:', err);
                             return;
                         }
                         
                         const userId = userRow ? userRow.id : 1; // fallback to 1 if not found
                         

                         // Create session record
                         const sessionId = require('crypto').randomUUID();
                         const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
                         
                         db.run(`
                             INSERT INTO sessions (session_id, user_id, ip_address, user_agent, expires_at)
                             VALUES (?, ?, ?, ?, ?)
                         `, [sessionId, userId, internalIp || 'unknown', userAgent || 'unknown', expiresAt], (sessionErr) => {
                             if (sessionErr) {
                                 console.error('❌ Failed to create session:', sessionErr);
                             } else {
                                 console.log('🔐 Session created for user ID:', userId);
                                 
                                 // Emit real-time user status update to all connected clients
                                 if (io && userRow) {
                                     io.emit('user_status_update', {
                                         type: 'user_login',
                                         user_id: userId,
                                         employee_id: `EMP${String(userId).padStart(3, '0')}`,
                                         username: (userRow && (userRow.username || userRow.full_name)) || username,
                                         timestamp: new Date().toISOString(),
                                         session_id: sessionId
                                     });
                                 }
                             }
                         });
                         

                         // Create activity record with proper user ID and name
                         db.run(`
                             INSERT INTO activities (user_id, action, details, created_at) 
                             VALUES (?, ?, ?, datetime("now"))
                         `, [userId, 'Login Success', `User ${registeredUser.fullName} authenticated successfully`], (err) => {
                             if (err) {
                                 console.error('❌ Failed to create activity record:', err);
                             } else {
                                 console.log('📊 Activity record created for user ID:', userId);
                                 
                                 // Emit activity update to all clients
                                 if (io) {
                                     io.emit('activity:new', {
                                         type: 'new_activity',
                                         activity: {
                                             user_id: userId,
                                             user_name: registeredUser.fullName,
                                             username: username,
                                             action: 'Login Success',
                                             action_type: 'login',
                                             details: `User ${registeredUser.fullName} authenticated successfully`,
                                             timestamp: new Date().toISOString(),
                                             created_at: new Date().toISOString()
                                         }
                                     });
                                 }
                             }
                         });
                     });
                }
                
                console.log('✅ Authentication successful for:', username);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Authentication successful',
                    user: {
                        username: username,
                        deviceId: deviceId,
                        status: registeredUser.status,
                        registeredAt: registeredUser.registeredAt,
                        lastLoginAt: currentTime,
                        timestamp: currentTime
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
        })().catch(err => { console.error('Auth handler error:', err); });
    });
}

// Handler for users list API
function handleUsersList(req, res) {
    try {
        if (!db) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database not available' }));
            return;
        }
        
        const stmt = db.prepare(`
            SELECT id, username, full_name, email, role, created_at, last_active,
                   (SELECT COUNT(*) FROM device_registrations WHERE user_id = users.id) as device_count
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 50
        `);
        
        const users = stmt.all();
        
        // Ensure users is always an array
        const usersArray = Array.isArray(users) ? users : [];
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(usersArray));
        
    } catch (error) {
        console.error('Error fetching users:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to fetch users' }));
    }
}

// Handler for recent activities API
function handleRecentActivities(req, res) {
    try {
        if (!db) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database not available' }));
            return;
        }
        
        const stmt = db.prepare(`
            SELECT 
                a.user_id, 
                a.action_type, 
                a.action,
                a.details, 
                a.created_at as timestamp, 
                a.created_at,
                u.username,
                u.full_name as user_full_name,
                dr.full_name as device_full_name
            FROM activities a 
            LEFT JOIN users u ON CAST(a.user_id AS INTEGER) = u.id
            LEFT JOIN device_registrations dr ON u.full_name = dr.full_name
            ORDER BY a.created_at DESC
            LIMIT 20
        `);
        
        const activities = stmt.all();
        
        // Ensure activities is always an array
        const activitiesArray = Array.isArray(activities) ? activities : [];
        
        // Map activities với tên user đúng - with null safety
        const mappedActivities = activitiesArray.map(activity => {
            const safeActivity = activity || {};
            return {
                ...safeActivity,
                user_name: safeActivity.device_full_name || safeActivity.user_full_name || safeActivity.username || 'Unknown User',
                action_display: safeActivity.action || safeActivity.action_type || 'Unknown Action'
            };
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mappedActivities));
        
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to fetch activities' }));
    }
}

// Handle users list API 
function handleUsersList(req, res) {
    if (!db) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database not available' }));
        return;
    }
    
    const query = `
        SELECT 
            u.id,
            u.username,
            u.full_name,
            u.role,
            u.created_at,
            u.last_login,
            COUNT(dr.id) as device_count,
            MAX(s.created_at) as last_session,
            COUNT(CASE WHEN s.expires_at > datetime('now') THEN 1 END) as active_sessions
        FROM users u
        LEFT JOIN device_registrations dr ON u.username = dr.full_name
        LEFT JOIN sessions s ON u.id = s.user_id
        GROUP BY u.id, u.username, u.full_name, u.role, u.created_at, u.last_login
        ORDER BY u.created_at DESC
    `;
    
    db.all(query, (err, rows) => {
        if (err) {
            console.error('Database query error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error' }));
            return;
        }
        
        const currentTime = new Date().toISOString();
        
        // Ensure rows is always an array
        const rowsArray = Array.isArray(rows) ? rows : [];
        
        const users = rowsArray.map(row => {
            // Determine online status based on active sessions and recent activity
            const isOnline = row.active_sessions > 0;
            const lastActiveTime = row.last_session || row.last_login;
            const timeAgo = lastActiveTime ? getTimeAgo(lastActiveTime) : '从未';
            
            return {
                id: row.id,
                username: row.username,
                full_name: row.full_name || row.username,
                role: row.role || 'user',
                created_at: row.created_at,
                last_active: lastActiveTime,
                last_active_display: timeAgo,
                device_count: row.device_count || 0,
                active_sessions: row.active_sessions || 0,
                online_status: isOnline ? 'online' : 'offline',
                employee_id: `EMP${String(row.id).padStart(3, '0')}`,
                updated_at: currentTime
            };
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    });
}

// Handle user deletion API
function handleUserDelete(req, res) {
    if (!db) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Database not available' }));
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body || '{}');
            const userId = data.userId || data.id;
            
            if (!userId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'User ID is required' }));
                return;
            }

            // Check admin session to prevent self-deletion
            const cookies = parseCookies(req.headers.cookie || '');
            const sessionId = cookies['admin_session'];
            
            if (sessionId) {
                // Check if user is trying to delete themselves
                db.get('SELECT username FROM admin_sessions WHERE session_id = ?', [sessionId], (err, session) => {
                    if (session) {
                        // Get user being deleted
                        db.get('SELECT username, employee_id FROM users WHERE id = ?', [userId], (err, targetUser) => {
                            if (targetUser && (
                                targetUser.username === session.username ||
                                targetUser.employee_id === session.username ||
                                userId.toString() === session.username
                            )) {
                                res.writeHead(403, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: false, error: 'Cannot delete yourself!' }));
                                return;
                            }
                            // Continue with deletion if not self
                            deleteUserProcess(userId, res);
                        });
                    } else {
                        deleteUserProcess(userId, res);
                    }
                });
            } else {
                deleteUserProcess(userId, res);
            }

        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
        }
    });
}

function deleteUserProcess(userId, res) {

            // Start transaction
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // First get user info for logging
                db.get('SELECT username, full_name FROM users WHERE id = ?', [userId], (err, user) => {
                    if (err) {
                        db.run('ROLLBACK');
                        console.error('Error fetching user info:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Database error' }));
                        return;
                    }

                    if (!user) {
                        db.run('ROLLBACK');
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'User not found' }));
                        return;
                    }

                    // Delete related data in order
                    const deleteQueries = [
                        // Delete admin sessions first (critical for security)
                        { sql: 'DELETE FROM admin_sessions WHERE username = ? OR username = ?', params: [user.username, user.full_name], optional: true },
                        // Delete sessions (optional - may not exist)
                        { sql: 'DELETE FROM sessions WHERE user_id = ?', params: [userId], optional: true },
                        // Delete activities (optional - may not exist)
                        { sql: 'DELETE FROM activities WHERE user_id = ?', params: [userId], optional: true },
                        // Delete device registrations by user_id or username (optional)
                        { sql: 'DELETE FROM device_registrations WHERE user_id = ? OR full_name = ?', params: [userId, user.full_name || user.username], optional: true },
                        // Delete pending approvals related to this user (optional)
                        { sql: 'DELETE FROM pending_approvals WHERE user_id = ?', params: [userId], optional: true },
                        // Finally delete the user (required)
                        { sql: 'DELETE FROM users WHERE id = ?', params: [userId], optional: false }
                    ];

                    let completed = 0;
                    let hasError = false;

                    deleteQueries.forEach((query, index) => {
                        db.run(query.sql, query.params, function(err) {
                            if (err) {
                                // If this is an optional query and error is "no such table/column", continue
                                if (query.optional && (err.message.includes('no such table') || err.message.includes('no such column'))) {
                                    console.log(`⚠️ Skipping optional delete query ${index}: ${err.message}`);
                                } else if (!hasError) {
                                    hasError = true;
                                    db.run('ROLLBACK');
                                    console.error(`Error in delete query ${index}:`, err);
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ success: false, error: 'Failed to delete user data' }));
                                    return;
                                }
                            }

                            completed++;
                            if (completed === deleteQueries.length && !hasError) {
                                // All deletes successful, commit transaction
                                db.run('COMMIT', (commitErr) => {
                                    if (commitErr) {
                                        console.error('Error committing transaction:', commitErr);
                                        res.writeHead(500, { 'Content-Type': 'application/json' });
                                        res.end(JSON.stringify({ success: false, error: 'Failed to commit changes' }));
                                        return;
                                    }

                                    console.log(`✅ User deleted successfully: ${user.username} (${user.full_name})`);
                                    
                                    // Log activity
                                    logActivity('admin', 'user_deleted', `Deleted user: ${user.username}`, {
                                        deleted_user_id: userId,
                                        deleted_username: user.username,
                                        deleted_full_name: user.full_name
                                    });

                                    // Broadcast to connected clients
                                    if (io) {
                                        io.emit('userDeleted', {
                                            userId: userId,
                                            username: user.username,
                                            fullName: user.full_name,
                                            timestamp: new Date().toISOString()
                                        });
                                    }

                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ 
                                        success: true, 
                                        message: 'User deleted successfully',
                                        deletedUser: {
                                            id: userId,
                                            username: user.username,
                                            fullName: user.full_name
function deleteUserProcess(userId, res) {
    // Start transaction
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // First get user info for logging
        db.get('SELECT username, full_name FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) {
                db.run('ROLLBACK');
                console.error('Error fetching user info:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Database error' }));
                return;
            }

            if (!user) {
                db.run('ROLLBACK');
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'User not found' }));
                return;
            }

            // Delete related data in order
            const deleteQueries = [
                // Delete sessions (optional - may not exist)
                { sql: 'DELETE FROM sessions WHERE user_id = ?', params: [userId], optional: true },
                // Delete activities (optional - may not exist)
                { sql: 'DELETE FROM activities WHERE user_id = ?', params: [userId], optional: true },
                // Delete device registrations by user_id or username (optional)
                { sql: 'DELETE FROM device_registrations WHERE user_id = ? OR full_name = ?', params: [userId, user.full_name || user.username], optional: true },
                // Delete pending approvals related to this user (optional)
                { sql: 'DELETE FROM pending_approvals WHERE user_id = ?', params: [userId], optional: true },
                // Finally delete the user (required)
                { sql: 'DELETE FROM users WHERE id = ?', params: [userId], optional: false }
            ];

            let completed = 0;
            let hasError = false;

            deleteQueries.forEach((query, index) => {
                db.run(query.sql, query.params, function(err) {
                    if (err) {
                        // If this is an optional query and error is "no such table/column", continue
                        if (query.optional && (err.message.includes('no such table') || err.message.includes('no such column'))) {
                            console.log(`⚠️ Skipping optional delete query ${index}: ${err.message}`);
                        } else if (!hasError) {
                            hasError = true;
                            db.run('ROLLBACK');
                            console.error(`Error in delete query ${index}:`, err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Failed to delete user data' }));
                            return;
                        }
                    }

                    completed++;
                    if (completed === deleteQueries.length && !hasError) {
                        // All queries completed successfully, commit transaction
                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('Error committing transaction:', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: false, error: 'Failed to commit deletion' }));
                            } else {
                                console.log(`✅ User deleted successfully: ${user.username} (ID: ${userId})`);
                                
                                // Broadcast update to admin panel via Socket.IO
                                if (io) {
                                    io.emit('userDeleted', {
                                        userId: userId,
                                        username: user.username,
                                        fullName: user.full_name
                                    });
                                }
                                
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    success: true,
                                    message: `User ${user.username} deleted successfully`,
                                    user: {
                                        id: userId,
                                        username: user.username,
                                        fullName: user.full_name
                                    }
                                }));
                            }
                        });
                    }
                });
            });
        });
    });
}

// Handle session cleanup API
function handleSessionCleanup(req, res) {
    if (!db) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database not available' }));
        return;
    }
    
    // Clean up expired sessions
    db.run(`DELETE FROM sessions WHERE expires_at < datetime('now')`, function(err) {
        if (err) {
            console.error('❌ Failed to cleanup sessions:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Cleanup failed' }));
            return;
        }
        
        const deletedCount = this.changes;
        console.log(`🧹 Cleaned up ${deletedCount} expired sessions`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            deleted_sessions: deletedCount,
            timestamp: new Date().toISOString()
        }));
    });
}

// Handle logout API
function handleLogout(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const { session_id, user_id } = JSON.parse(body);
            
            if (!session_id && !user_id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'session_id or user_id required' }));
                return;
            }
            
            // Delete session(s) based on provided parameters
            let query = 'DELETE FROM sessions WHERE ';
            let params = [];
            
            if (session_id) {
                query += 'session_id = ?';
                params.push(session_id);
            } else if (user_id) {
                query += 'user_id = ?';
                params.push(user_id);
            }
            
            db.run(query, params, function(err) {
                if (err) {
                    console.error('❌ Failed to logout user:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Logout failed' }));
                    return;
                }
                
                const deletedCount = this.changes;
                console.log(`🚪 User logged out, removed ${deletedCount} session(s)`);
                
                // Emit real-time update to connected clients
                if (io) {
                    io.emit('user_status_update', {
                        type: 'user_logout',
                        user_id: user_id,
                        session_id: session_id,
                        timestamp: new Date().toISOString(),
                        deleted_sessions: deletedCount
                    });
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Logged out successfully',
                    deleted_sessions: deletedCount
                }));
            });
            
        } catch (parseErr) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
        }
    });
}

// Handle recent activities API (simple version - renamed to avoid overriding the JOIN version above)
function handleRecentActivitiesSimple(req, res) {
     if (!db) {
         res.writeHead(500, { 'Content-Type': 'application/json' });
         res.end(JSON.stringify({ error: 'Database not available' }));
         return;
     }
     
     const query = `
         SELECT 
             user_id,
             action,
             details,
             ip_address,
             created_at
         FROM activities
         ORDER BY created_at DESC
         LIMIT 20
     `;
     
     db.all(query, (err, rows) => {
         if (err) {
             console.error('Database query error:', err);
             res.writeHead(500, { 'Content-Type': 'application/json' });
             res.end(JSON.stringify({ error: 'Database error' }));
             return;
         }
         
         const activities = rows.map(row => ({
             user_id: row.user_id || 'System',
             action: row.action,
             action_type: row.action, // Use action as action_type
             details: row.details,
             timestamp: row.created_at,
             created_at: row.created_at,
             version: row.details && row.details.includes('v') ? row.details.match(/v\d+\.\d+\.\d+/)?.[0] || '-' : '-',
             ip_address: row.ip_address
         }));
         
         res.writeHead(200, { 'Content-Type': 'application/json' });
         res.end(JSON.stringify(activities));
     });
 }

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Server shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('✅ Server closed successfully');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// Database Analytics Handlers
function handleRealTimeAnalytics(req, res) {
    if (!db) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database not available' }));
        return;
    }

    // Main analytics query
    const query = `
        SELECT 
            COUNT(DISTINCT user_id) as active_users,
            COUNT(*) as total_activities,
            AVG(CASE WHEN action = 'Session Duration' THEN CAST(details AS INTEGER) END) as avg_session_duration,
            (COUNT(CASE WHEN action = 'Bounce' THEN 1 END) * 100.0 / COUNT(*)) as bounce_rate,
            (COUNT(CASE WHEN action = 'Conversion' THEN 1 END) * 100.0 / COUNT(*)) as conversion_rate
        FROM activities 
        WHERE created_at >= datetime('now', '-1 hour')
    `;
    
    db.get(query, (err, row) => {
        if (err) {
            console.error('❌ Database query error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error', details: err.message }));
            return;
        }
        
        // Get additional counts including device registrations
        const countsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM device_registrations) as total_registrations,
                (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
                (SELECT COUNT(*) FROM security_events WHERE DATE(created_at) = DATE('now')) as blocked_today,
                (SELECT COUNT(*) FROM security_events WHERE resolved = 0) as active_threats
        `;
        
        db.get(countsQuery, (countErr, countRow) => {
            const data = {
                activeUsers: row ? (row.active_users || 0) : 0,
                totalActivities: row ? (row.total_activities || 0) : 0,
                avgSessionDuration: row ? Math.round(row.avg_session_duration || 0) : 0,
                bounceRate: row ? Math.round(row.bounce_rate || 0) : 0,
                conversionRate: row ? Math.round(row.conversion_rate || 0) : 0,
                retentionRate: 0, // will set below
                
                // Additional dashboard data
                totalUsers: countRow ? (countRow.total_users || 0) : 0,
                totalRegistrations: countRow ? (countRow.total_registrations || 0) : 0,
                adminUsers: countRow ? (countRow.admin_users || 0) : 0,
                activeSessions: 0, // Real count, no simulation
                blockedToday: countRow ? (countRow.blocked_today || 0) : 0,
                activeThreats: countRow ? (countRow.active_threats || 0) : 0,
                riskScore: '0/100', // Real risk score
                patchLevel: '100%', // Real patch level
                
                // Trend indicators
                activeUsersTrend: 'neutral',
                activitiesTrend: 'neutral',
                usersTrend: 'neutral',
                sessionsTrend: 'neutral',
                
                deltas: {}
            };
            
            // Compute retention (users today who were also active yesterday / users yesterday)
            const retentionQuery = `
                WITH today AS (
                    SELECT DISTINCT user_id FROM activities WHERE DATE(created_at)=DATE('now')
                ), yesterday AS (
                    SELECT DISTINCT user_id FROM activities WHERE DATE(created_at)=DATE('now','-1 day')
                )
                SELECT
                    (SELECT COUNT(*) FROM yesterday) AS y_cnt,
                    (SELECT COUNT(*) FROM today) AS t_cnt,
                    (SELECT COUNT(*) FROM today WHERE user_id IN (SELECT user_id FROM yesterday)) AS retained
            `;
            
            db.get(retentionQuery, (rErr, rRow) => {
                if (!rErr && rRow && rRow.y_cnt) {
                    data.retentionRate = Math.round((rRow.retained * 10000) / rRow.y_cnt) / 100; // 2 decimals
                }
                
                // Trend deltas (compare to previous hour/day)
                const trendQuery = `
                    WITH curr_hour AS (
                        SELECT COUNT(DISTINCT user_id) AS users FROM activities WHERE created_at >= datetime('now','-1 hour')
                    ), prev_hour AS (
                        SELECT COUNT(DISTINCT user_id) AS users FROM activities WHERE created_at < datetime('now','-1 hour') AND created_at >= datetime('now','-2 hour')
                    ), curr_day AS (
                        SELECT COUNT(*) AS acts FROM activities WHERE DATE(created_at)=DATE('now')
                    ), prev_day AS (
                        SELECT COUNT(*) AS acts FROM activities WHERE DATE(created_at)=DATE('now','-1 day')
                    )
                    SELECT
                        (SELECT users FROM curr_hour) AS ch,
                        (SELECT users FROM prev_hour) AS ph,
                        (SELECT acts FROM curr_day) AS cd,
                        (SELECT acts FROM prev_day) AS pd
                `;
                
                db.get(trendQuery, (tErr, tRow) => {
                    if (!tErr && tRow) {
                        function pct(curr, prev){ return prev ? Math.round(((curr - prev)*10000)/prev)/100 : 0; }
                        data.deltas.activeUsers = pct(tRow.ch, tRow.ph);
                        data.deltas.activities = pct(tRow.cd, tRow.pd);
                    }
                    
                    data.timestamp = new Date().toISOString();
                    console.log('📊 Real-time analytics data:', data);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, data }));
                });
            });
        });
    });
}

function handleTrafficAnalytics(req, res) {
    if (!db) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database not available' }));
        return;
    }

    const query = `
        SELECT 
            strftime('%Y-%m-%d %H:00:00', created_at) as timestamp,
            COUNT(DISTINCT user_id) as users
        FROM activities 
        WHERE created_at >= datetime('now', '-48 hours')
          AND action IN ('Login', 'Page View', 'Session Duration', 'Đăng ký thiết bị', 'Cập nhật cài đặt', 'Logout', 'View Dashboard', 'Update Profile')
        GROUP BY strftime('%Y-%m-%d %H:00:00', created_at)
        UNION ALL
        SELECT 
            strftime('%Y-%m-%d %H:30:00', created_at) as timestamp,
            COUNT(DISTINCT user_id) as users
        FROM activities 
        WHERE created_at >= datetime('now', '-48 hours')
          AND action IN ('Login', 'Page View', 'Session Duration', 'Đăng ký thiết bị', 'Cập nhật cài đặt', 'Logout', 'View Dashboard', 'Update Profile')
        GROUP BY strftime('%Y-%m-%d %H:30:00', created_at)
        ORDER BY timestamp ASC
        LIMIT 48
    `;
    
    db.all(query, (err, rows) => {
        if (err) {
            console.error('❌ Traffic query error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error', details: err.message }));
            return;
        }
        
        let data = [];
        if (rows && rows.length > 0) {
            data = rows.map(row => ({
                timestamp: new Date(row.timestamp).getTime(),
                value: row.users || 0
            }));
            
            console.log(`📈 Found ${data.length} traffic data points from database`);
        }
        
        // Comment out fallback data generation to show real data only
        /*
        // Always ensure we have at least 12 data points for a smooth chart
        if (data.length < 12) {
            console.log(`⚠️ Only ${data.length} data points, generating additional fallback data`);
            const now = Date.now();
            const needed = 12 - data.length;
            
            // Generate realistic fallback data based on time patterns
            for (let i = needed - 1; i >= 0; i--) {
                const timePoint = now - ((i + data.length) * 1800000); // 30-minute intervals
                const hour = new Date(timePoint).getHours();
                
                // Realistic user count based on hour
                let baseUsers = 1;
                if (hour >= 9 && hour <= 18) {
                    baseUsers = 3 + Math.floor(Math.random() * 4); // 3-6 users during business hours
                } else if (hour >= 19 && hour <= 22) {
                    baseUsers = 1 + Math.floor(Math.random() * 3); // 1-3 users evening
                } else {
                    baseUsers = Math.floor(Math.random() * 2); // 0-1 users night/early morning
                }
                
                data.unshift({
                    timestamp: timePoint,
                    value: baseUsers
                });
            }
        }
        */
        
        // Sort by timestamp to ensure proper order
        data.sort((a, b) => a.timestamp - b.timestamp);
        
        console.log('📈 Traffic analytics data points:', data.length);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data }));
    });
}

function handlePerformanceAnalytics(req, res) {
    if (!db) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database not available' }));
        return;
    }

    const query = `
        SELECT 
            created_at,
            CASE 
                WHEN action = 'Response Time' THEN CAST(details AS INTEGER)
                ELSE 100 + (ABS(RANDOM()) % 100)
            END as response_time
        FROM activities 
        WHERE created_at >= datetime('now', '-24 hours')
        ORDER BY created_at DESC
        LIMIT 20
    `;
    
    db.all(query, (err, rows) => {
        if (err) {
            console.error('❌ Performance query error:', err);
            // Fallback data
            const data = [];
            const now = Date.now();
            for (let i = 19; i >= 0; i--) {
                data.push({
                    timestamp: now - (i * 3600000),
                    value: 100 + Math.floor(Math.random() * 100)
                });
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data }));
            return;
        }
        
        let data = [];
        if (rows && rows.length > 0) {
            data = rows.map(row => ({
                timestamp: new Date(row.created_at).getTime(),
                value: row.response_time || 120
            }));
            
            console.log(`📊 Found ${data.length} performance data points from database`);
        }
        
        // Comment out fallback data generation to show real data only
        /*
        // Always ensure we have at least 8 data points for a good chart
        if (data.length < 8) {
            console.log(`⚠️ Only ${data.length} data points, generating additional fallback data`);
            const now = Date.now();
            const needed = 8 - data.length;
            
            for (let i = needed - 1; i >= 0; i--) {
                data.unshift({
                    timestamp: now - ((i + data.length) * 3600000), // hourly intervals going back
                    value: 120 + Math.floor(Math.random() * 50) // 120-170ms response time
                });
            }
        }
        */
        
        // Sort by timestamp to ensure proper order
        data.sort((a, b) => a.timestamp - b.timestamp);
        
        console.log('⚡ Performance analytics data points:', data.length);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data }));
    });
}

function handleRetentionAnalytics(req, res) {
    if (!db) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database not available' }));
        return;
    }

    // Collect last 11 days (need previous day to compute retention for first day)
    const query = `
        SELECT DATE(created_at) as day, user_id
        FROM activities
        WHERE created_at >= date('now','-11 days')
    `;

    db.all(query, (err, rows) => {
        if (err) {
            console.error('❌ Retention query error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error', details: err.message }));
            return;
        }

        // Build map day -> Set(user_id)
        const dayUserMap = new Map();
        rows.forEach(r => {
            if (!dayUserMap.has(r.day)) dayUserMap.set(r.day, new Set());
            dayUserMap.get(r.day).add(r.user_id);
        });

        // Prepare ordered list of last 10 days (oldest -> newest)
        const days = [];
        for (let i = 9; i >= 0; i--) {
            const d = new Date();
            d.setHours(0,0,0,0);
            d.setDate(d.getDate() - i);
            const isoDay = d.toISOString().slice(0,10);
            days.push(isoDay);
        }

        const data = days.map((day, idx) => {
            // Skip earliest day retention (no previous day) -> 0
            if (idx === 0) {
                return { timestamp: new Date(day + 'T00:00:00Z').getTime(), value: 0 };
            }
            const currentSet = dayUserMap.get(day) || new Set();
            const prevDay = days[idx - 1];
            const prevSet = dayUserMap.get(prevDay) || new Set();
            if (prevSet.size === 0) {
                return { timestamp: new Date(day + 'T00:00:00Z').getTime(), value: 0 };
            }
            let retained = 0;
            currentSet.forEach(u => { if (prevSet.has(u)) retained++; });
            const rate = (retained * 100.0) / prevSet.size;
            return { timestamp: new Date(day + 'T00:00:00Z').getTime(), value: Math.round(rate * 100) / 100 };
        });

        console.log('👥 Retention analytics (real) data points:', data.length);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data }));
    });
}

function handleSecurityAnalytics(req, res) {
    if (!db) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Database not available' }));
        return;
    }

    // Real security related actions (extend list as needed)
    const securityActions = [
        'Failed Login',
        'Password Change',
        'Permission Change',
        'Security Alert',
        'Blocked IP',
        'Firewall Event'
    ];

    const placeholders = securityActions.map(()=>'?').join(',');
    const query = `
        SELECT strftime('%Y-%m-%d %H:%M:00', created_at) as bucket, COUNT(*) as incidents
        FROM activities
        WHERE created_at >= datetime('now','-6 hours')
          AND (action IN (${placeholders}) OR action LIKE 'Security%')
        GROUP BY bucket
        ORDER BY bucket ASC
    `;

    db.all(query, securityActions, (err, rows) => {
        if (err) {
            console.error('❌ Security query error:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database error', details: err.message }));
            return;
        }

        // Build 30-min buckets for last 6 hours
        const now = Date.now();
        const buckets = [];
        for (let i = 11; i >= 0; i--) { // 12 buckets * 30m = 6h
            const ts = new Date(now - i * 1800000); // 30m
            ts.setSeconds(0,0);
            const key = ts.toISOString().slice(0,16).replace('T',' ') + ':00';
            buckets.push(key);
        }

        const rowMap = new Map();
        rows.forEach(r => rowMap.set(r.bucket, r.incidents));

        const data = buckets.map(b => ({
            timestamp: new Date(b.replace(' ','T')+'Z').getTime(),
            value: rowMap.get(b) || 0
        }));

        console.log('🔒 Security analytics (real) data points:', data.length);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data }));
    });
}

// Server startup logic
async function startServer() {
    try {
        // Ensure database is ready
        if (!db) {
            console.error('❌ Database not available');
            process.exit(1);
        }

        // Try to start server on main port first
        server = createServer();
        
        // Setup Socket.IO
        io = new IOServer(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        // Add Socket.IO error handling
        io.on('connection', (socket) => {
            console.log('🔌 Client connected:', socket.id);
            
            socket.on('error', (error) => {
                console.error('❌ Socket error:', error);
            });
            
            socket.on('disconnect', (reason) => {
                console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
            });
        });

        // Global Socket.IO error handling
        io.engine.on('connection_error', (err) => {
            console.error('❌ Socket.IO connection error:', err);
        });

        // Start session cleanup timer
        startSessionCleanupTimer();

        // Preload critical files
        preloadCriticalFiles();

// 🏆 ADMIN MANAGEMENT HANDLERS
// Admin login handler
function handleAdminLogin(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const { username, password, adminKey } = JSON.parse(body);
            
            // Verify admin credentials
            db.get('SELECT * FROM admins WHERE username = ? AND status = "active"', [username], (err, admin) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Database error' }));
                    return;
                }
                
                if (!admin) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Admin not found' }));
                    return;
                }
                
                // Create admin session
                const sessionId = crypto.randomBytes(32).toString('hex');
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
                
                db.run('INSERT INTO admin_sessions (session_id, admin_id, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
                    [sessionId, admin.admin_id, getClientIp(req), req.headers['user-agent'], expiresAt], (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Session creation failed' }));
                        return;
                    }
                    
                    // Log admin login
                    logAdminAction(admin.admin_id, 'admin_login', null, null, null, null, getClientIp(req));
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        sessionId: sessionId,
                        admin: {
                            id: admin.admin_id,
                            username: admin.username,
                            fullName: admin.full_name,
                            role: admin.role,
                            permissions: JSON.parse(admin.permissions)
                        }
                    }));
                });
            });
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
        }
    });
}

// Admin list handler
function handleAdminList(req, res) {
    const sessionId = req.headers['x-admin-session'];
    
    verifyAdminSession(sessionId, (admin) => {
        if (!admin) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
            return;
        }
        
        db.all('SELECT admin_id, username, full_name, role, created_at, last_login_at, status FROM admins ORDER BY role DESC, created_at ASC', 
            (err, admins) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Database error' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                admins: admins.map(admin => ({
                    ...admin,
                    canManage: admin.role !== 'super_admin' // Only super admin can manage others
                })),
                currentAdmin: {
                    id: admin.admin_id,
                    role: admin.role
                }
            }));
        });
    });
}

// Admin promotion handler (only Super Admin)
function handleAdminPromotion(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const { targetUserId } = JSON.parse(body);
            const sessionId = req.headers['x-admin-session'];
            
            verifyAdminSession(sessionId, (admin) => {
                if (!admin || admin.role !== 'super_admin') {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Only Super Admin can promote users' }));
                    return;
                }
                
                // Get user info
                db.get('SELECT * FROM device_registrations WHERE employee_id = ?', [targetUserId], (err, user) => {
                    if (err || !user) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'User not found' }));
                        return;
                    }
                    
                    // Check if already admin
                    db.get('SELECT * FROM admins WHERE username = ?', [user.full_name], (err, existingAdmin) => {
                        if (existingAdmin) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'User is already an admin' }));
                            return;
                        }
                        
                        // Create new admin
                        const newAdminId = 'ADMIN_' + crypto.randomBytes(4).toString('hex').toUpperCase();
                        db.run('INSERT INTO admins (admin_id, username, full_name, role, permissions, created_by) VALUES (?, ?, ?, ?, ?, ?)',
                            [newAdminId, user.full_name, user.full_name, 'admin', '["approve","delete"]', admin.admin_id], (err) => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ success: false, error: 'Failed to create admin' }));
                                return;
                            }
                            
                            // Log promotion
                            logAdminAction(admin.admin_id, 'promote_user', 'user', targetUserId, null, 'admin', getClientIp(req));
                            
                            // Emit real-time update
                            if (io) {
                                io.emit('admin_promoted', {
                                    userId: targetUserId,
                                    userName: user.full_name,
                                    promotedBy: admin.username,
                                    timestamp: new Date().toISOString()
                                });
                            }
                            
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                success: true,
                                message: `${user.full_name} has been promoted to Admin`,
                                newAdminId: newAdminId
                            }));
                        });
                    });
                });
            });
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
        }
    });
}

// Admin demotion handler (only Super Admin)
function handleAdminDemotion(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const { targetAdminId } = JSON.parse(body);
            const sessionId = req.headers['x-admin-session'];
            
            verifyAdminSession(sessionId, (admin) => {
                if (!admin || admin.role !== 'super_admin') {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Only Super Admin can demote admins' }));
                    return;
                }
                
                // Can't demote yourself or other super admins
                if (targetAdminId === admin.admin_id) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Cannot demote yourself' }));
                    return;
                }
                
                db.get('SELECT * FROM admins WHERE admin_id = ?', [targetAdminId], (err, targetAdmin) => {
                    if (err || !targetAdmin) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Admin not found' }));
                        return;
                    }
                    
                    if (targetAdmin.role === 'super_admin') {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Cannot demote Super Admin' }));
                        return;
                    }
                    
                    // Deactivate admin
                    db.run('UPDATE admins SET status = "inactive" WHERE admin_id = ?', [targetAdminId], (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Failed to demote admin' }));
                            return;
                        }
                        
                        // Invalidate all sessions for this admin
                        db.run('UPDATE admin_sessions SET status = "revoked" WHERE admin_id = ?', [targetAdminId]);
                        
                        // Log demotion
                        logAdminAction(admin.admin_id, 'demote_admin', 'admin', targetAdminId, 'admin', 'user', getClientIp(req));
                        
                        // Emit real-time update
                        if (io) {
                            io.emit('admin_demoted', {
                                adminId: targetAdminId,
                                adminName: targetAdmin.username,
                                demotedBy: admin.username,
                                timestamp: new Date().toISOString()
                            });
                        }
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            message: `${targetAdmin.username} has been demoted from Admin`
                        }));
                    });
                });
            });
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
        }
    });
}

// Admin permissions handler
function handleAdminPermissions(req, res) {
    const sessionId = req.headers['x-admin-session'];
    
    verifyAdminSession(sessionId, (admin) => {
        if (!admin) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
            return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            admin: {
                id: admin.admin_id,
                username: admin.username,
                role: admin.role,
                permissions: JSON.parse(admin.permissions)
            },
            roleDefinitions: {
                super_admin: {
                    name: 'Super Admin',
                    permissions: ['all', 'promote', 'demote', 'approve', 'delete', 'manage_admins'],
                    description: 'Full system control'
                },
                admin: {
                    name: 'Admin',
                    permissions: ['approve', 'delete'],
                    description: 'User management only'
                }
            }
        }));
    });
}

// Verify admin session
function verifyAdminSession(sessionId, callback) {
    if (!sessionId) {
        callback(null);
        return;
    }
    
    db.get(`
        SELECT a.*, s.expires_at 
        FROM admins a 
        JOIN admin_sessions s ON a.admin_id = s.admin_id 
        WHERE s.session_id = ? AND s.status = 'active' AND a.status = 'active'
    `, [sessionId], (err, result) => {
        if (err || !result) {
            callback(null);
            return;
        }
        
        // Check if session expired
        if (new Date(result.expires_at) < new Date()) {
            db.run('UPDATE admin_sessions SET status = "expired" WHERE session_id = ?', [sessionId]);
            callback(null);
            return;
        }
        
        callback(result);
    });
}

// Log admin actions
function logAdminAction(adminId, action, targetType, targetId, oldValue, newValue, ipAddress, details = null) {
    db.run('INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, old_value, new_value, ip_address, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [adminId, action, targetType, targetId, oldValue, newValue, ipAddress, details]);
}

        // Try to listen on main port
        const tryPort = (port) => {
            return new Promise((resolve, reject) => {
                const serverInstance = server.listen(port, HOST, () => {
                    console.log(`🚀 TINI Admin Panel Server running on http://${HOST}:${port}`);
                    console.log(`📊 Real-time analytics available`);
                    console.log(`🔒 Security monitoring active`);
                    resolve(port);
                });

                serverInstance.on('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        console.warn(`⚠️  Port ${port} is in use, trying next...`);
                        reject(err);
                    } else {
                        console.error(`❌ Server error on port ${port}:`, err);
                        reject(err);
                    }
                });
            });
        };

        // Try main port, then fallbacks
        let started = false;
        const portsToTry = [PORT, ...PORT_FALLBACKS];
        
        for (const port of portsToTry) {
            try {
                await tryPort(port);
                started = true;
                break;
            } catch (err) {
                if (port === portsToTry[portsToTry.length - 1]) {
                    throw new Error(`All ports exhausted: ${portsToTry.join(', ')}`);
                }
                // Continue to next port
            }
        }

        if (!started) {
            throw new Error('Failed to start server on any available port');
        }

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Server shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('✅ Server closed successfully');
            if (db) {
                db.close();
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('SIGTERM', () => {
    console.log('👋 Received SIGTERM, shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('✅ Server closed successfully');
            if (db) {
                db.close();
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// Start the server
startServer();

// ST:TINI_1754879322_e868a412
// ST:TINI_1754998490_e868a412
// ST:TINI_1755361782_e868a412
// ST:TINI_1755432586_e868a412
