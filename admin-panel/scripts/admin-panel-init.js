// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: ebdabf3 | Time: 2025-08-09T05:09:14Z
// Watermark: TINI_1754716154_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Admin Panel Bootstrap Script
// Extracted from inline script to fix CSP violations

(function(){
    function start(){
        try {
            // Guard against multiple inits
            if (!window.adminPanel && typeof window.TINIAdminPanel === 'function') {
                window.adminPanel = new window.TINIAdminPanel();
                console.log('🚀 AdminPanel bootstrap initialized');
            }
        } catch (e) {
            console.error('❌ AdminPanel bootstrap error:', e);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
