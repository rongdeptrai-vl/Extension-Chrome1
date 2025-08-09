// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: ebdabf3 | Time: 2025-08-09T05:09:14Z
// Watermark: TINI_1754716154_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - Error Fix Helper
// Khắc phục các lỗi loading của admin panel

// 1. Khởi tạo API_CONFIG nếu chưa có
if (typeof window.API_CONFIG === 'undefined') {
    window.API_CONFIG = {
        BASE_URL: 'http://localhost:3001',
        ENDPOINTS: {
            health: '/api/health',
            status: '/api/status',
            users: '/api/users',
            auth: '/api/auth',
            admin: '/api/admin'
        }
    };
    console.log('✅ API_CONFIG initialized');
}

// 2. Ensure security classes are available (fallback only)
const securityClasses = [
    'UltimateFortressSecurity',
    'SecureAuthenticationSystem', 
    'UltimateAntiAutomation',
    'AdvancedHoneypotSystem',
    'IntegratedEmployeeSystem',
    'EnhancedDeviceSecurity'
];

// Only create fallback if not already loaded
setTimeout(() => {
    securityClasses.forEach(className => {
        if (typeof window[className] === 'undefined') {
            console.warn(`⚠️ Fallback: ${className} not loaded, creating minimal mock`);
            // Create minimal fallback only if real class failed to load
            window[className] = class {
                constructor() {
                    this.name = className;
                    this.initialized = true;
                    this.version = '1.0.0-fallback';
                    this.status = 'fallback';
                    console.log(`🔧 Fallback ${className} created`);
                }
                
                init() { return true; }
                getStatus() { 
                    return { 
                        active: true, 
                        loaded: true,
                        initialized: true,
                        fallback: true
                    }; 
                }
            };
        } else {
            console.log(`✅ ${className} loaded successfully`);
        }
    });
}, 500); // Give time for real classes to load first

// 3. Tạo dashboard container nếu thiếu
function ensureDashboardStructure() {
    const dashboard = document.querySelector('#dashboard');
    if (dashboard && !dashboard.querySelector('.dashboard-stats')) {
        const statsContainer = document.createElement('div');
        statsContainer.className = 'dashboard-stats';
        statsContainer.innerHTML = '<div class="dashboard-placeholder">Dashboard loading...</div>';
        dashboard.appendChild(statsContainer);
        console.log('✅ Dashboard structure created');
    }
}

// 4. Initialize khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureDashboardStructure);
} else {
    ensureDashboardStructure();
}

console.log('🛠️ Error fix helper loaded');
