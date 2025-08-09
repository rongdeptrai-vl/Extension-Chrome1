// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 58a24a1 | Time: 2025-08-09T15:18:25Z
// Watermark: TINI_1754752705_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI Admin Panel Demo Bypass
 * Temporary authentication bypass for demonstration purposes
 */

// Add demo bypass functionality
(function() {
    'use strict';
    
    // Wait for the admin panel to load
    setTimeout(() => {
        // Check if we're on the admin panel page
        if (window.location.pathname.includes('admin-panel.html')) {
            console.log('🎭 Demo Mode: Bypassing authentication for demonstration');
            
            // Simulate successful authentication
            if (typeof window.SecureAdminHelper !== 'undefined') {
                const helper = window.SecureAdminHelper;
                
                // Set demo auth status
                helper.setSecureData('tini_secure_admin_auth_status', 'authenticated');
                helper.setSecureData('tini_secure_admin_username', 'admin');
                helper.setSecureData('tini_secure_admin_role', 'super_admin');
                helper.setSecureData('tini_secure_admin_session', Date.now().toString());
                
                console.log('✅ Demo authentication set');
            }
            
            // Ensure panels are visible
            const contentSections = document.querySelectorAll('.content-section');
            contentSections.forEach(section => {
                section.style.display = 'block';
            });
            
            // Auto-navigate to Analytics for demo
            setTimeout(() => {
                const analyticsNav = document.querySelector('[data-nav="analytics"]');
                if (analyticsNav) {
                    console.log('📊 Auto-navigating to Analytics for demo');
                    analyticsNav.click();
                }
            }, 2000);
        }
    }, 500);
})();
