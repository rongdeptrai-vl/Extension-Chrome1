// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: ebdabf3 | Time: 2025-08-09T05:09:14Z
// Watermark: TINI_1754716154_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Admin Panel Bootstrap (module)
// Ensures TINIAdminPanel is available before creating the instance to avoid race conditions

// Load main module explicitly to guarantee evaluation order
import './admin-panel-main.js';

(function bootstrap() {
    const MAX_WAIT_MS = 5000; // stop trying after 5s
    const INTERVAL_MS = 50;
    let waited = 0;

    function tryInit() {
        try {
            if (!window.adminPanel && typeof window.TINIAdminPanel === 'function') {
                window.adminPanel = new window.TINIAdminPanel();
                console.log('🚀 AdminPanel bootstrap initialized');
                return true;
            }
        } catch (e) {
            console.error('❌ AdminPanel bootstrap error:', e);
            return true; // stop looping on hard error
        }
        return false;
    }

    function start() {
        if (tryInit()) return;
        const timer = setInterval(() => {
            waited += INTERVAL_MS;
            if (tryInit() || waited >= MAX_WAIT_MS) {
                clearInterval(timer);
                if (!window.adminPanel) {
                    console.error('❌ Failed to initialize AdminPanel: TINIAdminPanel not available');
                }
            }
        }, INTERVAL_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
