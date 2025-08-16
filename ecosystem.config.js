// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
module.exports = {
  apps: [
    {
      name: 'panel-server',
      script: 'admin-panel/server.js',
      env: { 
        PORT: 55057, 
        NODE_ENV: 'production', 
        PORT_FALLBACKS: '55058,55059' 
      }
    },
    {
      name: 'gateway-server',
      script: 'scripts/start-gateway.js',
      env: { 
        PORT: 8099, 
        NODE_ENV: 'production' 
      }
    },
    {
      name: 'api-server',
      script: 'core/api-server.js',
      env: { 
        PORT: 5001, 
        NODE_ENV: 'production' 
      }
    },
    {
      name: 'dashboard-server',
      script: 'core/admin-dashboard-server.js',
      env: { 
        ADMIN_PORT: 3004, 
        NODE_ENV: 'production', 
        ADMIN_PORT_FALLBACKS: '3005,3006' 
      }
    },
    {
      name: 'auth-server',
      script: 'admin-panel/minimal-auth-server.js',
      env: { 
        NODE_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'integration-server',
      script: 'tini-integration-server.js',
      env: { 
        NODE_ENV: 'production',
        PORT: 9090
      }
    },
    {
      name: 'security-master',
      script: 'TINI-ULTIMATE-SECURITY-MASTER-V2.js',
      env: { 
        NODE_ENV: 'production',
        SECURITY_API_PORT: 9999
      }
    }
  ]
};
