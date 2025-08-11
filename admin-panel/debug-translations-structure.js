// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Debug translations structure chi tiết
(function() {
    setTimeout(() => {
        console.log('🔍 DEBUGGING TRANSLATIONS STRUCTURE...');
        
        if (window.i18nSystem) {
            console.log('✅ I18nSystem found');
            console.log('Current language:', window.i18nSystem.currentLanguage);
            console.log('Provider:', window.i18nSystem.provider);
            
            // Check translations object structure
            console.log('📋 Translations object keys:', Object.keys(window.i18nSystem.translations));
            
            // Check specific language data
            const currentLang = window.i18nSystem.currentLanguage;
            console.log(`📋 ${currentLang} translations:`, window.i18nSystem.translations[currentLang]);
            
            // Test specific keys
            const testKeys = ['add_new_user', 'status', 'suspended'];
            testKeys.forEach(key => {
                const rawData = window.i18nSystem.translations[currentLang]?.[key];
                const translation = window.i18nSystem.getMessage(key);
                console.log(`🔍 Key "${key}":`, {
                    rawData: rawData,
                    translation: translation,
                    type: typeof rawData
                });
            });
            
            // Check if any keys exist
            if (window.i18nSystem.translations[currentLang]) {
                const allKeys = Object.keys(window.i18nSystem.translations[currentLang]);
                console.log(`📊 Total keys in ${currentLang}:`, allKeys.length);
                console.log('📝 First 10 keys:', allKeys.slice(0, 10));
                console.log('📝 Sample key data:', window.i18nSystem.translations[currentLang][allKeys[0]]);
            }
            
        } else {
            console.log('❌ I18nSystem not found');
        }
        
        // Test manual fetch
        console.log('🔗 Testing manual fetch...');
        fetch('_locales/zh/messages.json')
            .then(response => {
                console.log('Fetch response:', response.status, response.statusText);
                return response.json();
            })
            .then(data => {
                console.log('📁 Manual fetch data keys:', Object.keys(data).length);
                console.log('📝 Sample manual data:', data.add_new_user);
            })
            .catch(error => {
                console.error('❌ Manual fetch failed:', error);
            });
            
    }, 3000);
})();
