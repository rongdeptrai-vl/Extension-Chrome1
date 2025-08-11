// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Debug script chạy trong console để test i18n
console.log('🔍 Debug i18n system...');

// Test basic functions
console.log('Current language:', window.getCurrentLanguage ? window.getCurrentLanguage() : 'undefined');
console.log('i18n object:', typeof window.i18n);
console.log('t function:', typeof window.t);

// Test specific keys
const testKeys = ['metric_active_users', 'metric_response_time', 'metric_retention_rate', 'metric_threat_level'];
testKeys.forEach(key => {
    console.log(`${key}:`, window.t ? window.t(key) : 'window.t not available');
});

// Set language to Chinese
if (window.setLanguage) {
    console.log('Setting language to zh...');
    window.setLanguage('zh');
    
    // Test again after language change
    setTimeout(() => {
        console.log('After language change:');
        testKeys.forEach(key => {
            console.log(`${key}:`, window.t(key));
        });
        
        // Force refresh UI
        if (window.i18n && window.i18n.refreshUI) {
            window.i18n.refreshUI();
        }
    }, 500);
} else {
    console.log('setLanguage function not available');
}
