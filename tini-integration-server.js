// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🌐 TINI SERVICE DISCOVERY & INTEGRATION SERVER
 * Central hub for discovering and connecting all TINI project servers
 */

const http = require('http');
const url = require('url');

// Service Registry - All TINI servers
const SERVICE_REGISTRY = {
    'panel': {
        name: 'Panel Server',
        port: 55057,
        path: '/admin',
        health: '/api/health',
        description: 'Admin Panel UI'
    },
    'gateway': {
        name: 'Gateway Server', 
        port: 8099,
        path: '/',
        health: '/',
        description: 'Request Gateway'
    },
    'api': {
        name: 'API Server',
        port: 5001,
        path: '/api',
        health: '/',
        description: 'REST API Backend'
    },
    'dashboard': {
        name: 'Dashboard Server',
        port: 3004,
        path: '/dashboard',
        health: '/',
        description: 'Dashboard Interface'
    },
    'security': {
        name: 'Security Server',
        port: 6906,
        path: '/security',
        health: '/status',
        description: 'Security Monitoring'
    },
    'auth': {
        name: 'Authentication Server',
        port: 3002,
        path: '/api/auth',
        health: '/api/health',
        description: 'Authentication + MFA'
    },
    'mysql': {
        name: 'MySQL Database',
        port: 3306,
        path: '/',
        health: null,
        description: 'Database Server'
    }
};

// Helper function to check service health
async function checkServiceHealth(service) {
    if (!service.health) return { status: 'unknown', message: 'No health endpoint' };
    
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: service.port,
            path: service.health,
            method: 'GET',
            timeout: 3000
        };

        const req = http.request(options, (res) => {
            if (res.statusCode === 200) {
                resolve({ status: 'healthy', message: 'Service is running' });
            } else {
                resolve({ status: 'unhealthy', message: `HTTP ${res.statusCode}` });
            }
        });

        req.on('error', () => {
            resolve({ status: 'down', message: 'Service not responding' });
        });

        req.on('timeout', () => {
            resolve({ status: 'timeout', message: 'Service timeout' });
        });

        req.end();
    });
}

// Proxy/Forward requests to appropriate service
async function forwardRequest(req, res, targetService) {
    const service = SERVICE_REGISTRY[targetService];
    if (!service) {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Service not found'}));
        return;
    }

    const targetUrl = url.parse(req.url);
    const options = {
        hostname: 'localhost',
        port: service.port,
        path: targetUrl.path,
        method: req.method,
        headers: {
            ...req.headers,
            'X-Forwarded-For': req.socket.remoteAddress,
            'X-Forwarded-Proto': 'http',
            'X-Forwarded-Host': req.headers.host
        }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error(`❌ Proxy error to ${targetService}:`, err.message);
        res.writeHead(502, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Service unavailable'}));
    });

    req.pipe(proxyReq);
}

// Create main integration server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`📡 ${req.method} ${pathname}`);

    // Service Discovery endpoint
    if (pathname === '/api/services') {
        const services = {};
        
        for (const [key, service] of Object.entries(SERVICE_REGISTRY)) {
            const health = await checkServiceHealth(service);
            services[key] = {
                ...service,
                health: health,
                url: `http://localhost:${service.port}${service.path}`
            };
        }

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
            success: true,
            timestamp: new Date().toISOString(),
            services: services,
            summary: {
                total: Object.keys(services).length,
                healthy: Object.values(services).filter(s => s.health.status === 'healthy').length,
                down: Object.values(services).filter(s => s.health.status === 'down').length
            }
        }, null, 2));
        return;
    }

    // Health check endpoint
    if (pathname === '/api/health') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
            success: true,
            service: 'TINI Integration Server',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        }));
        return;
    }

    // Service proxy routes
    if (pathname.startsWith('/panel/')) {
        return forwardRequest(req, res, 'panel');
    }
    if (pathname.startsWith('/api/auth/')) {
        return forwardRequest(req, res, 'auth');
    }
    if (pathname.startsWith('/api/')) {
        return forwardRequest(req, res, 'api');
    }
    if (pathname.startsWith('/dashboard/')) {
        return forwardRequest(req, res, 'dashboard');
    }
    if (pathname.startsWith('/security/')) {
        return forwardRequest(req, res, 'security');
    }

    // Root endpoint - Service overview
    if (pathname === '/') {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>TINI Integration Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .service { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
        .status { padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; }
        .healthy { background: #28a745; }
        .down { background: #dc3545; }
        .unknown { background: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 TINI Integration Server</h1>
            <p>Central hub for all TINI project services</p>
        </div>
        
        <div class="services" id="services">
            <div style="text-align: center; grid-column: 1/-1;">
                <p>Loading services...</p>
            </div>
        </div>
    </div>

    <script>
        fetch('/api/services')
            .then(r => r.json())
            .then(data => {
                const container = document.getElementById('services');
                container.innerHTML = '';
                
                Object.entries(data.services).forEach(([key, service]) => {
                    const statusClass = service.health.status === 'healthy' ? 'healthy' : 
                                       service.health.status === 'down' ? 'down' : 'unknown';
                    
                    container.innerHTML += \`
                        <div class="service">
                            <h3>\${service.name}</h3>
                            <p><strong>Port:</strong> \${service.port}</p>
                            <p><strong>Description:</strong> \${service.description}</p>
                            <p><strong>Status:</strong> <span class="status \${statusClass}">\${service.health.status.toUpperCase()}</span></p>
                            <p><strong>URL:</strong> <a href="\${service.url}" target="_blank">\${service.url}</a></p>
                        </div>
                    \`;
                });
            })
            .catch(err => {
                document.getElementById('services').innerHTML = '<p>Error loading services</p>';
            });
    </script>
</body>
</html>`;
        
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
        return;
    }

    // 404 for unknown routes
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Route not found'}));
});

const PORT = process.env.PORT || 8080; // Main integration port, configurable via ENV
server.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 TINI Integration Server running on port ${PORT}`);
    console.log(`🌐 Service Discovery: http://localhost:${PORT}/api/services`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/`);
    console.log('✅ Ready to coordinate all TINI services');
});

module.exports = server;
