// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Force refresh và debug I18n system
console.log('🔧 Force refreshing I18n system...');

// 1. Clear tất cả cache
if (window.secureStorage) {
    console.log('🗑️ Clearing translation cache...');
    window.secureStorage.set('translations', null);
    window.secureStorage.set('adminLanguage', 'zh'); // Force Chinese
}

// 2. Reload page để load translations mới
setTimeout(() => {
    console.log('🔄 Reloading page with cleared cache...');
    location.reload(true); // Force reload từ server
}, 500);
