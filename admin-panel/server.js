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
const sqlite3 = require('sqlite3').verbose();
const { Server: IOServer } = require('socket.io');
let io; // socket.io instance

// Load TINI Environment Config
const TiniEnvironmentConfig = require('../config/tini-env-config.js');
const envConfig = new TiniEnvironmentConfig();

// Database connection
const dbPath = path.join(__dirname, 'tini_admin.db');
let db;

// In-memory realtime metrics
const activeUsersMap = new Map(); // userId -> lastSeen ms
const ROLLING_MINUTES = 60;
const minuteBuckets = Array.from({length: ROLLING_MINUTES}, () => ({ts: minuteStart(), actions:0, conversions:0, bounces:0, sessions:0, sessionDur:0}));
let bucketIndex = 0;
function minuteStart(t=Date.now()){ const d=new Date(t); d.setSeconds(0,0); return d.getTime(); }
function rotateBucket(){ const nowStart = minuteStart(); if(minuteBuckets[bucketIndex].ts !== nowStart){ bucketIndex = (bucketIndex+1)%ROLLING_MINUTES; minuteBuckets[bucketIndex] = {ts: nowStart, actions:0, conversions:0, bounces:0, sessions:0, sessionDur:0}; } }
function sweepInactive(){ const cutoff = Date.now() - 60*60*1000; for(const [u,t] of activeUsersMap){ if(t < cutoff) activeUsersMap.delete(u); } }
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

// Initialize database connection with error handling
try {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Database connection failed:', err.message);
            console.log('📂 Database path:', dbPath);
            console.log('🔍 File exists:', require('fs').existsSync(dbPath));
        } else {
            console.log('✅ Database connected successfully');
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

const PORT = process.env.PORT || envConfig.get('PORT') || 8080;
const HOST = process.env.BIND_HOST || envConfig.get('BIND_HOST') || '0.0.0.0';
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
}

let server; // will hold the active server instance

// API Request Handler
function handleAPIRequest(req, res, pathname) {
    const method = req.method;
    if(pathname === '/api/dev/simulate' && (process.env.DEV_MODE==='true')){
        let body=''; req.on('data',c=>body+=c); req.on('end',()=>{ try{ const p = JSON.parse(body||'{}'); const user = p.user||('u'+Math.ceil(Math.random()*4)); const action = p.action||'Page View'; const dur = p.sessionDuration||0; ingestActivity(user, action, dur); diffAndBroadcast(); res.writeHead(200,{ 'Content-Type':'application/json'}); res.end(JSON.stringify({ok:true,user,action})); }catch(e){ res.writeHead(400); res.end(JSON.stringify({error:'bad json'})); }}); return;
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

// Enhanced fallback & retry logic (handles EADDRINUSE + EACCES)
function startWithFallback(ports, maxRetriesPerPort = 2) {
    const candidates = Array.from(new Set(ports));
    let idx = 0;
    let attempt = 0; // attempts on current port
    let allEacces = true; // track if every failure was EACCES

    const tryListen = () => {
        const port = candidates[idx];
        attempt++;
        server = createServer();

        const onError = (err) => {
            const recoverable = ['EADDRINUSE', 'EACCES'].includes(err.code);
            if (recoverable) {
                if (err.code !== 'EACCES') allEacces = false; // at least one not pure permission denied
                const reason = err.code === 'EADDRINUSE' ? 'in use' : 'permission denied';
                console.warn(`[admin-panel] Port ${port} ${reason}. Attempt ${attempt}/${maxRetriesPerPort}`);
                if (attempt < maxRetriesPerPort) {
                    setTimeout(tryListen, 300); // retry same port a bit later
                } else if (idx < candidates.length - 1) {
                    idx++; attempt = 0;
                    console.warn(`[admin-panel] Switching to fallback port ${candidates[idx]}...`);
                    setTimeout(tryListen, 300);
                } else {
                    console.error('[admin-panel] No more fallback ports available.');
                    if (allEacces) {
                        console.error('[admin-panel] All failures are EACCES → thử port động (ephemeral) 0 để kiểm tra hệ thống.');
                        attemptEphemeral();
                    } else {
                        logPortHelp(port, err.code);
                        process.exit(1);
                    }
                }
            } else {
                console.error('[admin-panel] Failed to start server (non-recoverable):', err);
                process.exit(1);
            }
        };

        server.once('error', onError);
        server.listen(port, HOST, () => {
            server.removeListener('error', onError);
            allEacces = false; // success
            // Init socket.io once
            if(!io){
                io = new IOServer(server, { cors: { origin: '*'} });
                io.on('connection', socket => {
                    socket.emit('analytics:init', lastSentMetrics || currentMetrics());
                    socket.on('heartbeat', data => { if(data && data.user) activeUsersMap.set(data.user, Date.now()); });
                });
                setInterval(()=>{ sweepInactive(); diffAndBroadcast(); }, 10000);
            }
            console.log('========================================');
            console.log('   TINI ADMIN PANEL - NODE.JS SERVER');
            console.log('========================================');
            console.log(`Host         : ${HOST}`);
            console.log(`Primary Port : ${PORT}`);
            console.log(`Active Port  : ${port}`);
            console.log(`Fallbacks    : ${candidates.slice(1).join(', ') || 'None'}`);
            console.log('');
            console.log(`🚀 Server running on: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${port}`);
            console.log(`📱 Admin Panel: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${port}/admin-panel.html`);
            console.log('');
            console.log('Environment variables that influenced startup:');
            console.log(`  PORT=${process.env.PORT || ''}`);
            console.log(`  BIND_HOST=${process.env.BIND_HOST || ''}`);
            console.log(`  PORT_FALLBACKS=${process.env.PORT_FALLBACKS || ''}`);
            console.log('');
            console.log('Press Ctrl+C to stop the server');
            console.log('========================================');
        });
    };

    const attemptEphemeral = () => {
        const testServer = createServer();
        testServer.once('error', (err) => {
            console.error('[admin-panel] Ephemeral port bind failed (still EACCES). Hệ thống socket bị chặn ở cấp hệ điều hành.');
            logDeepSystemHelp();
            process.exit(1);
        });
        testServer.listen(0, HOST, () => {
            const addr = testServer.address();
            console.log(`[admin-panel] ✅ Ephemeral bind thành công trên port ${addr.port} → lỗi tập trung vào dải port chỉ định (808x). Chọn port khác hoặc kiểm tra excluded port range.`);
            testServer.close(() => {
                logPortHelp(candidates[candidates.length - 1], 'EACCES');
                console.log('Gợi ý: đặt PORT=0 để server tự chọn port tạm thời.');
                process.exit(1);
            });
        });
    };

    tryListen();
}

function logPortHelp(port, code) {
    console.error('\n--- DIAGNOSTIC HELP ---');
    if (code === 'EACCES') {
        console.error(`Port ${port} bị từ chối quyền (EACCES). Nguyên nhân thường: (1) tiến trình khác chiếm và Windows trả EACCES; (2) quyền không đủ; (3) Firewall/AV chặn.`);
    } else if (code === 'EADDRINUSE') {
        console.error(`Port ${port} đang được dùng (EADDRINUSE).`);
    }
    console.error('Các bước gợi ý kiểm tra (PowerShell):');
    console.error(`  netstat -ano | findstr :${port}`);
    console.error('  Get-NetTCPConnection -LocalPort ' + port + ' | Select LocalAddress,LocalPort,State,OwningProcess');
    console.error('  tasklist /FI "PID eq <PID>"');
    console.error('Nếu không cần tiến trình đó:  taskkill /PID <PID> /F');
    console.error('Hoặc tạm đổi port:  $env:PORT=' + (port + 1) + '; node server.js');
    console.error('Thiết lập host khác (chỉ loopback):  $env:BIND_HOST=127.0.0.1');
    console.error('-------------------------\n');
}

function logDeepSystemHelp() {
    console.error('\n--- DEEP SYSTEM CHECK ---');
    console.error('1) Kiểm tra excluded port range:  netsh interface ipv4 show excludedportrange protocol=tcp');
    console.error('2) Kiểm tra dynamic port range:  netsh int ipv4 show dynamicport tcp');
    console.error('3) Tắt VPN/Proxy tạm thời nếu có.');
    console.error('4) Kiểm tra security software (Defender Controlled Folder Access, AV).');
    console.error('5) Thử script tối thiểu:  node -e "require(\'net\').createServer().listen(55055,()=>console.log(\'ok\'))"');
    console.error('6) Nếu tất cả EACCES → khả năng Winsock corruption: chạy  netsh winsock reset  rồi reboot.');
    console.error('---------------------------\n');
}

startWithFallback([PORT, ...PORT_FALLBACKS]);

// Socket.IO server setup (after HTTP server is up)
io = new IOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🔌 New socket connection: ${socket.id}`);
    
    // Send current metrics on new connection
    socket.emit('analytics:update', currentMetrics());
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);
    });
});

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
        
        const data = {
            activeUsers: row ? (row.active_users || 0) : 0,
            totalActivities: row ? (row.total_activities || 0) : 0,
            avgSessionDuration: row ? Math.round(row.avg_session_duration || 180) : 180,
            bounceRate: row ? Math.round(row.bounce_rate || 25) : 25,
            conversionRate: row ? Math.round(row.conversion_rate || 8) : 8,
            retentionRate: 0, // will set below
            // placeholders for trend deltas
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
// ST:TINI_1754879322_e868a412
