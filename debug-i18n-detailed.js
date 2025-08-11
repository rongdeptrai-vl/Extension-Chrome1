// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Debug script để kiểm tra i18n system
console.log('🔍 Starting I18n Debug...');

// 1. Kiểm tra I18nSystem đã load chưa
if (typeof window.I18nSystem !== 'undefined') {
    console.log('✅ I18nSystem is loaded');
    console.log('Current language:', window.I18nSystem.currentLanguage);
    
    // 2. Kiểm tra messages đã load chưa
    console.log('Available languages:', Object.keys(window.I18nSystem.messages || {}));
    
    // 3. Test một số keys cụ thể
    const testKeys = [
        'time_last_24h',
        'security_active_threats', 
        'security_risk_score',
        'trend_up',
        'btn_refresh'
    ];
    
    console.log('\n📝 Testing key translations:');
    testKeys.forEach(key => {
        const translation = window.I18nSystem.getMessage(key);
        console.log(`${key}: "${translation}"`);
    });
    
    // 4. Force set language to Chinese
    console.log('\n🇨🇳 Forcing language to Chinese...');
    window.I18nSystem.setLanguage('zh');
    
    // 5. Test lại translations sau khi đổi ngôn ngữ
    console.log('\n📝 Testing after language change:');
    testKeys.forEach(key => {
        const translation = window.I18nSystem.getMessage(key);
        console.log(`${key}: "${translation}"`);
    });
    
    // 6. Update tất cả elements
    console.log('\n🔄 Updating all elements...');
    window.I18nSystem.updateElements();
    
} else {
    console.log('❌ I18nSystem not loaded yet');
    
    // Đợi 2 giây rồi thử lại
    setTimeout(() => {
        console.log('🔄 Retrying I18n check...');
        if (window.I18nSystem) {
            window.I18nSystem.setLanguage('zh');
            window.I18nSystem.updateElements();
            console.log('✅ Language set to Chinese on retry');
        } else {
            console.log('❌ I18nSystem still not available');
        }
    }, 2000);
}

// 7. Kiểm tra các elements có data-i18n
console.log('\n🔍 Checking data-i18n elements:');
const i18nElements = document.querySelectorAll('[data-i18n]');
console.log(`Found ${i18nElements.length} elements with data-i18n`);

i18nElements.forEach((el, index) => {
    if (index < 10) { // Chỉ log 10 elements đầu
        console.log(`Element ${index}: data-i18n="${el.getAttribute('data-i18n')}", text="${el.textContent}"`);
    }
});

console.log('\n✅ Debug completed!');
