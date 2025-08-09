// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI Language Handler
// Advanced language management for Admin Panel

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
        if (window.tiniI18n) {
            callback();
        } else {
            setTimeout(() => this.waitForI18n(callback), 100);
        }
    }

    setupLanguageSelector() {
        // Setup language selector in profile section
        const languageSelect = document.getElementById('language');
        if (languageSelect && !languageSelect.hasChildNodes()) {
            const languages = window.tiniI18n.getSupportedLanguages();
            
            languages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.code;
                option.textContent = lang.name;
                if (lang.code === window.tiniI18n.currentLanguage) {
                    option.selected = true;
                }
                languageSelect.appendChild(option);
            });

            // Add change event listener
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }

        // Setup theme selector
        const themeSelect = document.getElementById('theme');
        if (themeSelect && !themeSelect.hasChildNodes()) {
            const themes = [
                { value: 'dark', name: '🌙 Dark Theme (Professional)' },
                { value: 'auto', name: '🔄 Auto (System Based)' },
                { value: 'light', name: '☀️ Light Theme' }
            ];

            themes.forEach(theme => {
                const option = document.createElement('option');
                option.value = theme.value;
                option.textContent = theme.name;
                if (theme.value === 'dark') {
                    option.selected = true;
                }
                themeSelect.appendChild(option);
            });
        }
    }

    setupLanguageEvents() {
        // Listen for language change events
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateLanguageSelector();
            this.saveLanguagePreference();
        });

        // Listen for profile save events
        document.addEventListener('profileSaved', (e) => {
            this.saveAllPreferences();
        });
    }

    changeLanguage(newLang) {
        if (window.tiniI18n) {
            window.tiniI18n.setLanguage(newLang);
            this.showLanguageChangeNotification(newLang);
        }
    }

    updateLanguageSelector() {
        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
        }
    }

    saveLanguagePreference() {
        const profile = this.getStoredProfile();
        profile.language = this.currentLanguage;
        profile.lastLanguageChange = new Date().toISOString();
        this.saveProfile(profile);
    }

    saveAllPreferences() {
        const profile = this.getStoredProfile();
        
        // Get all form values
        const fullName = document.getElementById('fullName')?.value;
        const email = document.getElementById('email')?.value;
        const language = document.getElementById('language')?.value;
        const timezone = document.getElementById('timezone')?.value;
        const theme = document.getElementById('theme')?.value;

        // Update profile
        if (fullName) profile.fullName = fullName;
        if (email) profile.email = email;
        if (language) profile.language = language;
        if (timezone) profile.timezone = timezone;
        if (theme) profile.theme = theme;
        
        profile.lastUpdated = new Date().toISOString();
        this.saveProfile(profile);

        console.log('💾 [LANG] Profile preferences saved:', profile);
    }

    getStoredProfile() {
        try {
            const stored = localStorage.getItem('tini_admin_profile');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.warn('🔤 [LANG] Failed to parse stored profile:', e);
            return {};
        }
    }

    saveProfile(profile) {
        try {
            localStorage.setItem('tini_admin_profile', JSON.stringify(profile));
            
            // Dispatch event for other systems
            document.dispatchEvent(new CustomEvent('profileUpdated', {
                detail: { profile }
            }));
        } catch (e) {
            console.error('🔤 [LANG] Failed to save profile:', e);
        }
    }

    autoTranslateOnLoad() {
        // Auto-translate when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.translatePage(), 100);
            });
        } else {
            setTimeout(() => this.translatePage(), 100);
        }
    }

    translatePage() {
        if (window.tiniI18n) {
            window.tiniI18n.updateAllTranslations();
            console.log('🔤 [LANG] Page auto-translated');
        }
    }

    showLanguageChangeNotification(newLang) {
        const langNames = {
            'en': 'English',
            'vi': 'Tiếng Việt', 
            'zh': '中文',
            'hi': 'हिन्दी',
            'ko': '한국어'
        };

        const message = `Language changed to ${langNames[newLang] || newLang}`;
        
        // Use admin panel notification system if available
        if (window.tiniAdminPanel && window.tiniAdminPanel.showNotification) {
            window.tiniAdminPanel.showNotification(message, 'success');
        } else {
            console.log(`🌍 [LANG] ${message}`);
        }
    }

    // Public API methods
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return window.tiniI18n ? window.tiniI18n.getSupportedLanguages() : [];
    }

    isLanguageSupported(lang) {
        const supported = this.getSupportedLanguages();
        return supported.some(l => l.code === lang);
    }
}

// Initialize language handler
window.tiniLanguageHandler = new TINILanguageHandler();

// Global convenience functions
window.changeLanguage = function(lang) {
    if (window.tiniLanguageHandler) {
        window.tiniLanguageHandler.changeLanguage(lang);
    }
};

window.getCurrentLanguage = function() {
    return window.tiniLanguageHandler ? window.tiniLanguageHandler.getCurrentLanguage() : 'en';
};

console.log('🔤 [LANG] TINI Language Handler loaded successfully');
// ST:TINI_1754716154_e868a412
