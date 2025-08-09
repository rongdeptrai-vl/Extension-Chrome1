// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI I18n Helper
// Utility functions for international admin panel

class TINIi18nHelper {
    constructor() {
        this.dateFormats = {
            'en': { locale: 'en-US', options: { year: 'numeric', month: 'long', day: 'numeric' } },
            'vi': { locale: 'vi-VN', options: { year: 'numeric', month: 'long', day: 'numeric' } },
            'zh': { locale: 'zh-CN', options: { year: 'numeric', month: 'long', day: 'numeric' } },
            'hi': { locale: 'hi-IN', options: { year: 'numeric', month: 'long', day: 'numeric' } },
            'ko': { locale: 'ko-KR', options: { year: 'numeric', month: 'long', day: 'numeric' } }
        };

        this.numberFormats = {
            'en': { locale: 'en-US' },
            'vi': { locale: 'vi-VN' },
            'zh': { locale: 'zh-CN' },
            'hi': { locale: 'hi-IN' },
            'ko': { locale: 'ko-KR' }
        };

        this.currencyFormats = {
            'en': { locale: 'en-US', currency: 'USD' },
            'vi': { locale: 'vi-VN', currency: 'VND' },
            'zh': { locale: 'zh-CN', currency: 'CNY' },
            'hi': { locale: 'hi-IN', currency: 'INR' },
            'ko': { locale: 'ko-KR', currency: 'KRW' }
        };
    }

    // Format date according to current language
    formatDate(date, lang = null) {
        const currentLang = lang || this.getCurrentLanguage();
        const format = this.dateFormats[currentLang] || this.dateFormats['en'];
        
        try {
            return new Date(date).toLocaleDateString(format.locale, format.options);
        } catch (e) {
            console.warn('🌍 [I18N] Date format error:', e);
            return new Date(date).toLocaleDateString('en-US');
        }
    }

    // Format time according to current language
    formatTime(date, lang = null) {
        const currentLang = lang || this.getCurrentLanguage();
        const format = this.dateFormats[currentLang] || this.dateFormats['en'];
        
        try {
            return new Date(date).toLocaleTimeString(format.locale, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            console.warn('🌍 [I18N] Time format error:', e);
            return new Date(date).toLocaleTimeString('en-US');
        }
    }

    // Format datetime according to current language
    formatDateTime(date, lang = null) {
        return `${this.formatDate(date, lang)} ${this.formatTime(date, lang)}`;
    }

    // Format number according to current language
    formatNumber(number, lang = null) {
        const currentLang = lang || this.getCurrentLanguage();
        const format = this.numberFormats[currentLang] || this.numberFormats['en'];
        
        try {
            return new Intl.NumberFormat(format.locale).format(number);
        } catch (e) {
            console.warn('🌍 [I18N] Number format error:', e);
            return number.toString();
        }
    }

    // Format currency according to current language
    formatCurrency(amount, lang = null) {
        const currentLang = lang || this.getCurrentLanguage();
        const format = this.currencyFormats[currentLang] || this.currencyFormats['en'];
        
        try {
            return new Intl.NumberFormat(format.locale, {
                style: 'currency',
                currency: format.currency
            }).format(amount);
        } catch (e) {
            console.warn('🌍 [I18N] Currency format error:', e);
            return `${format.currency} ${amount}`;
        }
    }

    // Format percentage
    formatPercentage(value, lang = null) {
        const currentLang = lang || this.getCurrentLanguage();
        const format = this.numberFormats[currentLang] || this.numberFormats['en'];
        
        try {
            return new Intl.NumberFormat(format.locale, {
                style: 'percent',
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }).format(value / 100);
        } catch (e) {
            console.warn('🌍 [I18N] Percentage format error:', e);
            return `${value}%`;
        }
    }

    // Get relative time (e.g., "2 hours ago")
    getRelativeTime(date, lang = null) {
        const currentLang = lang || this.getCurrentLanguage();
        const format = this.dateFormats[currentLang] || this.dateFormats['en'];
        
        try {
            const rtf = new Intl.RelativeTimeFormat(format.locale, { numeric: 'auto' });
            const diff = new Date(date) - new Date();
            
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (Math.abs(days) > 0) return rtf.format(days, 'day');
            if (Math.abs(hours) > 0) return rtf.format(hours, 'hour');
            if (Math.abs(minutes) > 0) return rtf.format(minutes, 'minute');
            return rtf.format(seconds, 'second');
        } catch (e) {
            console.warn('🌍 [I18N] Relative time format error:', e);
            return this.formatDateTime(date, currentLang);
        }
    }

    // Pluralization helper
    pluralize(count, singular, plural = null, lang = null) {
        const currentLang = lang || this.getCurrentLanguage();
        
        // Language-specific pluralization rules
        const rules = {
            'en': (n) => n === 1 ? singular : (plural || `${singular}s`),
            'vi': (n) => plural || singular, // Vietnamese doesn't typically pluralize
            'zh': (n) => plural || singular, // Chinese doesn't typically pluralize
            'hi': (n) => n === 1 ? singular : (plural || `${singular}s`),
            'ko': (n) => plural || singular  // Korean doesn't typically pluralize
        };

        const rule = rules[currentLang] || rules['en'];
        return rule(count);
    }

    // Format file size
    formatFileSize(bytes, lang = null) {
        const currentLang = lang || this.getCurrentLanguage();
        
        const units = {
            'en': ['B', 'KB', 'MB', 'GB', 'TB'],
            'vi': ['B', 'KB', 'MB', 'GB', 'TB'],
            'zh': ['字节', 'KB', 'MB', 'GB', 'TB'],
            'hi': ['B', 'KB', 'MB', 'GB', 'TB'],
            'ko': ['바이트', 'KB', 'MB', 'GB', 'TB']
        };

        const unitLabels = units[currentLang] || units['en'];
        
        if (bytes === 0) return `0 ${unitLabels[0]}`;
        
        const k = 1024;
        const dm = 1;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
        return `${this.formatNumber(size, currentLang)} ${unitLabels[i]}`;
    }

    // Get text direction for language
    getTextDirection(lang = null) {
        const currentLang = lang || this.getCurrentLanguage();
        
        // RTL languages (none in our current set, but prepared for future)
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        
        return rtlLanguages.includes(currentLang) ? 'rtl' : 'ltr';
    }

    // Get language name in native script
    getLanguageName(lang, displayLang = null) {
        const currentLang = displayLang || this.getCurrentLanguage();
        
        const names = {
            'en': {
                'en': 'English',
                'vi': 'Vietnamese', 
                'zh': 'Chinese',
                'hi': 'Hindi',
                'ko': 'Korean'
            },
            'vi': {
                'en': 'Tiếng Anh',
                'vi': 'Tiếng Việt',
                'zh': 'Tiếng Trung',
                'hi': 'Tiếng Hindi',
                'ko': 'Tiếng Hàn'
            },
            'zh': {
                'en': '英语',
                'vi': '越南语',
                'zh': '中文',
                'hi': '印地语',
                'ko': '韩语'
            },
            'hi': {
                'en': 'अंग्रेजी',
                'vi': 'वियतनामी',
                'zh': 'चीनी',
                'hi': 'हिन्दी',
                'ko': 'कोरियन'
            },
            'ko': {
                'en': '영어',
                'vi': '베트남어',
                'zh': '중국어',
                'hi': '힌디어',
                'ko': '한국어'
            }
        };

        return names[currentLang]?.[lang] || lang;
    }

    // Update all timestamps on page
    updateTimestamps() {
        const elements = document.querySelectorAll('[data-timestamp]');
        elements.forEach(el => {
            const timestamp = el.getAttribute('data-timestamp');
            if (timestamp) {
                el.textContent = this.getRelativeTime(timestamp);
            }
        });
    }

    // Update all numbers on page
    updateNumbers() {
        const elements = document.querySelectorAll('[data-number]');
        elements.forEach(el => {
            const number = parseFloat(el.getAttribute('data-number'));
            if (!isNaN(number)) {
                el.textContent = this.formatNumber(number);
            }
        });
    }

    // Update all currencies on page
    updateCurrencies() {
        const elements = document.querySelectorAll('[data-currency]');
        elements.forEach(el => {
            const amount = parseFloat(el.getAttribute('data-currency'));
            if (!isNaN(amount)) {
                el.textContent = this.formatCurrency(amount);
            }
        });
    }

    // Get current language
    getCurrentLanguage() {
        if (window.tiniI18n) {
            return window.tiniI18n.currentLanguage;
        }
        if (window.tiniLanguageHandler) {
            return window.tiniLanguageHandler.getCurrentLanguage();
        }
        return 'en';
    }

    // Initialize helpers for current page
    init() {
        // Set text direction
        document.documentElement.dir = this.getTextDirection();
        
        // Update all formatted elements
        this.updateTimestamps();
        this.updateNumbers();
        this.updateCurrencies();
        
        // Auto-update timestamps every minute
        setInterval(() => this.updateTimestamps(), 60000);
        
        console.log('🌍 [I18N] Helper initialized for language:', this.getCurrentLanguage());
    }
}

// Create global instance
window.tiniI18nHelper = new TINIi18nHelper();

// Global convenience functions
window.formatDate = (date, lang) => window.tiniI18nHelper.formatDate(date, lang);
window.formatTime = (date, lang) => window.tiniI18nHelper.formatTime(date, lang);
window.formatDateTime = (date, lang) => window.tiniI18nHelper.formatDateTime(date, lang);
window.formatNumber = (number, lang) => window.tiniI18nHelper.formatNumber(number, lang);
window.formatCurrency = (amount, lang) => window.tiniI18nHelper.formatCurrency(amount, lang);
window.formatPercentage = (value, lang) => window.tiniI18nHelper.formatPercentage(value, lang);
window.getRelativeTime = (date, lang) => window.tiniI18nHelper.getRelativeTime(date, lang);
window.formatFileSize = (bytes, lang) => window.tiniI18nHelper.formatFileSize(bytes, lang);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.tiniI18nHelper.init(), 200);
    });
} else {
    setTimeout(() => window.tiniI18nHelper.init(), 200);
}

console.log('🌍 [I18N] TINI I18n Helper loaded successfully');
// ST:TINI_1754716154_e868a412
