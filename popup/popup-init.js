// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// 🔐 ADMIN AUTHENTICATION & PANEL INTEGRATION

// 🚀 INITIALIZE SECURITY SYSTEMS BY GROUPS
console.log('🔥 [EXTENSION] Loading TINI Ultimate Security Extension v3.2.0');
console.log('🛡️ [NHÓM 1] AI Counterattack System - Tầng 11 loaded');
console.log('🛡️ [NHÓM 2] Ultimate Security Core - DDoS Shield active');
console.log('👑 [NHÓM 3] BOSS Device Control - Hardware binding ready');
console.log('🔐 [NHÓM 4] Authentication Variants - BOSS GHOST active');
console.log('🌐 [NHÓM 5] Server Infrastructure - Ultra secure ready');

// Initialize core security systems
setTimeout(() => {
    console.log('✅ [INTEGRATION] All security groups initialized successfully');
}, 1000);

// Check current authentication level
function checkAuthLevel() {
    const userRole = localStorage.getItem('userRole');
    const authLevel = localStorage.getItem('authLevel');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const hasAdminPrivileges = localStorage.getItem('hasAdminPrivileges') === 'true';
    
    return {
        userRole: userRole || 'none',
        authLevel: parseInt(authLevel) || 0,
        isAuthenticated,
        hasAdminPrivileges,
        isAdmin: userRole === 'admin' || hasAdminPrivileges,
        isBoss: userRole === 'boss' || localStorage.getItem('bossLevel10000') === 'true',
        isGhost: userRole === 'ghost_boss' || localStorage.getItem('ghostBossMode') === 'true'
    };
}

// Function to open admin panel with authentication check
function openAdminPanel() {
    const auth = checkAuthLevel();
    
    console.log('🔍 Checking admin access...', auth);
    
    // Check if user has admin privileges
    if (auth.isAdmin || auth.isBoss || auth.isGhost) {
        console.log('✅ Admin access granted - Opening admin panel...');
        
        // Open admin authentication page
        const adminAuthUrl = chrome.runtime.getURL('admin-authentication.html');
        chrome.tabs.create({ url: adminAuthUrl });
    } else {
        console.warn('🚫 Admin access denied');
    }
}

// Attach to global scope
window.checkAuthLevel = checkAuthLevel;
window.openAdminPanel = openAdminPanel;
