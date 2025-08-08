// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Admin Panel Debug Script
console.log('🔍 [DEBUG] Admin Panel Debug Starting...');

// Check if we're in the right context
if (window.location.pathname.includes('admin-panel.html')) {
    console.log('✅ [DEBUG] In admin panel context');
    
    // Check for critical elements
    const checkElements = [
        'dashboard',
        'users', 
        'profile',
        'security',
        'settings',
        'analytics',
        'reports',
        'testing'
    ];
    
    checkElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ [DEBUG] Element found: ${id}`);
        } else {
            console.warn(`❌ [DEBUG] Element missing: ${id}`);
        }
    });
    
    // Check navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    console.log(`🔗 [DEBUG] Found ${navLinks.length} navigation links`);
    
    // Test click functionality
    setTimeout(() => {
        console.log('🖱️ [DEBUG] Testing navigation clicks...');
        
        navLinks.forEach((link, index) => {
            if (link.addEventListener) {
                console.log(`✅ [DEBUG] Nav link ${index} has event listener capability`);
            }
        });
    }, 1000);
    
} else {
    console.log('ℹ️ [DEBUG] Not in admin panel context');
}

// Global error catcher
window.addEventListener('error', function(e) {
    console.error('🚨 [DEBUG] Error caught:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
});

// Check for required objects
setTimeout(() => {
    const requiredObjects = [
        'TINIAdminPanel',
        'AdvancedModeSystem', 
        'SecuritySystem',
        'TestingZone'
    ];
    
    requiredObjects.forEach(obj => {
        if (window[obj]) {
            console.log(`✅ [DEBUG] ${obj} available`);
        } else {
            console.warn(`❌ [DEBUG] ${obj} not found`);
        }
    });
}, 2000);
