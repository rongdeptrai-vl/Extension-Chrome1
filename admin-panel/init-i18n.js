// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Initialize I18n System properly
(function() {
    // Đợi tất cả scripts load xong
    window.addEventListener('load', async function() {
        console.log('🚀 Window loaded, initializing I18n System...');
        
        try {
            // Đợi thêm 1 giây để đảm bảo tất cả đã ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Initialize I18nSystem
            window.i18nSystem = new I18nSystem();
            
            // Set provider to custom để dùng _locales
            window.i18nSystem.provider = 'custom';
            
            console.log('🔄 Loading translations...');
            // Load translations
            await window.i18nSystem.loadTranslations();
            
            console.log('🈳 Setting language to Chinese...');
            // Set language to Chinese
            await window.i18nSystem.setLanguage('zh');
            
            // Create global translation function
            window.t = function(key, substitutions = null) {
                return window.i18nSystem.getMessage(key, substitutions);
            };
            
            // Create global language setter
            window.setLanguage = async function(lang) {
                return await window.i18nSystem.setLanguage(lang);
            };
            
            // Update all elements immediately
            console.log('🔄 Updating all elements...');
            window.i18nSystem.updateElements();
            
            console.log('✅ I18n System initialized successfully');
            console.log('Current language:', window.i18nSystem.currentLanguage);
            console.log('Loaded translations for languages:', Object.keys(window.i18nSystem.translations));
            
            // Test a few translations
            const testKeys = ['add_new_user', 'status', 'suspended'];
            testKeys.forEach(key => {
                const translation = window.t(key);
                console.log(`${key}: "${translation}"`);
            });
            
        } catch (error) {
            console.error('❌ Failed to initialize I18n System:', error);
        }
    });
})();
