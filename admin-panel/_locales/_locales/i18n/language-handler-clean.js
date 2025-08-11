// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI Language Handler - Updated for External I18n System
// NO HARDCODE - Uses external JSON files only

class TINILanguageHandler {
    constructor() {
        this.initialized = false;
        this.currentLanguage = 'en';
        this.init();
    }

    init() {
        if (this.initialized) return;
        
        this.waitForI18n(() => {
            this.setupLanguageSelector();
            this.setupLanguageEvents();
            this.autoTranslateOnLoad();
            this.initialized = true;
            
            console.log('🔤 [LANG] Language Handler initialized');
        });
    }

    waitForI18n(callback) {
        if (window.i18n) {
            callback();
        } else {
            setTimeout(() => this.waitForI18n(callback), 100);
        }
    }

    setupLanguageSelector() {
        // Setup language selector in profile section
        const languageSelect = document.getElementById('language');
        if (languageSelect && languageSelect.options.length === 0) {
            const languages = [
                { code: 'en', name: 'English', flag: '🇺🇸' },
                { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
                { code: 'zh', name: '中文', flag: '🇨🇳' },
                { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
                { code: 'ko', name: '한국어', flag: '🇰🇷' }
            ];
            
            languages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.code;
                option.textContent = `${lang.flag} ${lang.name}`;
                if (lang.code === window.i18n.getCurrentLanguage()) {
                    option.selected = true;
                }
                languageSelect.appendChild(option);
            });

            // Add change event listener
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
            
            console.log('🌍 [LANG] Language selector populated');
        }
    }

    setupLanguageEvents() {
        // Listen for language change events
        window.addEventListener('languageChanged', (event) => {
            this.currentLanguage = event.detail.language;
            this.updateLanguageUI();
            console.log(`🔄 [LANG] Language changed to: ${this.currentLanguage}`);
        });
    }

    async changeLanguage(newLang) {
        if (!window.i18n) {
            console.error('❌ [LANG] I18n system not available');
            return;
        }

        try {
            await window.i18n.changeLanguage(newLang);
            this.currentLanguage = newLang;
            this.updateLanguageUI();
            
            // Show success message
            this.showLanguageChangeSuccess(newLang);
            
            console.log(`✅ [LANG] Successfully changed to: ${newLang}`);
        } catch (error) {
            console.error('❌ [LANG] Failed to change language:', error);
        }
    }

    updateLanguageUI() {
        // Update language display elements
        const currentLangElements = document.querySelectorAll('.current-language');
        const languageInfo = window.i18n?.getLanguageInfo() || { name: 'English', flag: '🇺🇸' };
        
        currentLangElements.forEach(element => {
            element.textContent = `${languageInfo.flag} ${languageInfo.name}`;
        });

        // Update header language indicator if exists
        const headerLangIndicator = document.querySelector('.language-indicator');
        if (headerLangIndicator) {
            headerLangIndicator.textContent = languageInfo.flag;
            headerLangIndicator.title = languageInfo.name;
        }
    }

    showLanguageChangeSuccess(language) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'language-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent);
            color: var(--bg-dark);
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        
        const languageNames = {
            'en': '🇺🇸 English',
            'vi': '🇻🇳 Tiếng Việt',
            'zh': '🇨🇳 中文',
            'hi': '🇮🇳 हिन्दी',
            'ko': '🇰🇷 한국어'
        };
        
        notification.textContent = `Language changed to ${languageNames[language] || language}`;
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    autoTranslateOnLoad() {
        // Auto-translate when page loads
        if (window.i18n) {
            window.i18n.updatePageContent();
            this.updateLanguageUI();
        }
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
            { code: 'zh', name: '中文', flag: '🇨🇳' },
            { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
            { code: 'ko', name: '한국어', flag: '🇰🇷' }
        ];
    }
}

// CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .language-notification {
        animation: slideIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// Initialize language handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tiniLanguageHandler = new TINILanguageHandler();
    console.log('🚀 [LANG] Language Handler ready');
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINILanguageHandler;
}
// ST:TINI_1754879322_e868a412
