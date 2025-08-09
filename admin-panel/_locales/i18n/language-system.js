// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI Language System
// Complete language management system for admin panel

class TINILanguageSystem {
    constructor() {
        this.initialized = false;
        this.currentLanguage = 'en';
        this.fallbackLanguage = 'en';
        this.autoDetect = true;
        this.translations = {};
        this.formatters = {};
        this.init();
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🌐 [LANG-SYS] Initializing Language System...');
        
        try {
            await this.loadSystemTranslations();
            this.setupAutoDetection();
            this.setupFormatters();
            this.setupEventListeners();
            this.loadUserPreferences();
            
            this.initialized = true;
            console.log('🌐 [LANG-SYS] Language System initialized successfully');
            
            // Auto-translate page if ready
            this.autoTranslatePage();
        } catch (error) {
            console.error('🌐 [LANG-SYS] Initialization failed:', error);
        }
    }

    async loadSystemTranslations() {
        // Load additional system-specific translations
        this.translations = {
            system: {
                'en': {
                    loading: 'Loading...',
                    error: 'Error',
                    success: 'Success',
                    warning: 'Warning',
                    info: 'Information',
                    confirm: 'Confirm',
                    cancel: 'Cancel',
                    save: 'Save',
                    delete: 'Delete',
                    edit: 'Edit',
                    view: 'View',
                    search: 'Search',
                    filter: 'Filter',
                    sort: 'Sort',
                    refresh: 'Refresh',
                    close: 'Close',
                    open: 'Open',
                    minimize: 'Minimize',
                    maximize: 'Maximize'
                },
                'vi': {
                    loading: 'Đang tải...',
                    error: 'Lỗi',
                    success: 'Thành công',
                    warning: 'Cảnh báo',
                    info: 'Thông tin',
                    confirm: 'Xác nhận',
                    cancel: 'Hủy',
                    save: 'Lưu',
                    delete: 'Xóa',
                    edit: 'Sửa',
                    view: 'Xem',
                    search: 'Tìm kiếm',
                    filter: 'Lọc',
                    sort: 'Sắp xếp',
                    refresh: 'Làm mới',
                    close: 'Đóng',
                    open: 'Mở',
                    minimize: 'Thu nhỏ',
                    maximize: 'Phóng to'
                },
                'zh': {
                    loading: '加载中...',
                    error: '错误',
                    success: '成功',
                    warning: '警告',
                    info: '信息',
                    confirm: '确认',
                    cancel: '取消',
                    save: '保存',
                    delete: '删除',
                    edit: '编辑',
                    view: '查看',
                    search: '搜索',
                    filter: '筛选',
                    sort: '排序',
                    refresh: '刷新',
                    close: '关闭',
                    open: '打开',
                    minimize: '最小化',
                    maximize: '最大化'
                },
                'hi': {
                    loading: 'लोड हो रहा है...',
                    error: 'त्रुटि',
                    success: 'सफलता',
                    warning: 'चेतावनी',
                    info: 'जानकारी',
                    confirm: 'पुष्टि करें',
                    cancel: 'रद्द करें',
                    save: 'सहेजें',
                    delete: 'हटाएं',
                    edit: 'संपादित करें',
                    view: 'देखें',
                    search: 'खोजें',
                    filter: 'फिल्टर',
                    sort: 'क्रमबद्ध करें',
                    refresh: 'ताज़ा करें',
                    close: 'बंद करें',
                    open: 'खोलें',
                    minimize: 'छोटा करें',
                    maximize: 'बड़ा करें'
                },
                'ko': {
                    loading: '로딩 중...',
                    error: '오류',
                    success: '성공',
                    warning: '경고',
                    info: '정보',
                    confirm: '확인',
                    cancel: '취소',
                    save: '저장',
                    delete: '삭제',
                    edit: '편집',
                    view: '보기',
                    search: '검색',
                    filter: '필터',
                    sort: '정렬',
                    refresh: '새로고침',
                    close: '닫기',
                    open: '열기',
                    minimize: '최소화',
                    maximize: '최대화'
                }
            }
        };
    }

    setupAutoDetection() {
        if (!this.autoDetect) return;
        
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        const langCode = browserLang.split('-')[0];
        
        // Check if detected language is supported
        if (this.isLanguageSupported(langCode)) {
            this.currentLanguage = langCode;
            console.log(`🌐 [LANG-SYS] Auto-detected language: ${langCode}`);
        }
    }

    setupFormatters() {
        // Setup regional formatters
        this.formatters = {
            'en': {
                currency: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
                date: new Intl.DateTimeFormat('en-US'),
                number: new Intl.NumberFormat('en-US'),
                percent: new Intl.NumberFormat('en-US', { style: 'percent' })
            },
            'vi': {
                currency: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }),
                date: new Intl.DateTimeFormat('vi-VN'),
                number: new Intl.NumberFormat('vi-VN'),
                percent: new Intl.NumberFormat('vi-VN', { style: 'percent' })
            },
            'zh': {
                currency: new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }),
                date: new Intl.DateTimeFormat('zh-CN'),
                number: new Intl.NumberFormat('zh-CN'),
                percent: new Intl.NumberFormat('zh-CN', { style: 'percent' })
            },
            'hi': {
                currency: new Intl.NumberFormat('hi-IN', { style: 'currency', currency: 'INR' }),
                date: new Intl.DateTimeFormat('hi-IN'),
                number: new Intl.NumberFormat('hi-IN'),
                percent: new Intl.NumberFormat('hi-IN', { style: 'percent' })
            },
            'ko': {
                currency: new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }),
                date: new Intl.DateTimeFormat('ko-KR'),
                number: new Intl.NumberFormat('ko-KR'),
                percent: new Intl.NumberFormat('ko-KR', { style: 'percent' })
            }
        };
    }

    setupEventListeners() {
        // Listen for system language change requests
        document.addEventListener('systemLanguageChange', (e) => {
            this.setLanguage(e.detail.language);
        });

        // Listen for translation requests
        document.addEventListener('translationRequest', (e) => {
            const result = this.translate(e.detail.key, e.detail.params);
            e.detail.callback(result);
        });

        // Listen for format requests
        document.addEventListener('formatRequest', (e) => {
            const result = this.format(e.detail.type, e.detail.value);
            e.detail.callback(result);
        });
    }

    loadUserPreferences() {
        try {
            const stored = localStorage.getItem('tini_language_preferences');
            if (stored) {
                const prefs = JSON.parse(stored);
                if (prefs.language && this.isLanguageSupported(prefs.language)) {
                    this.currentLanguage = prefs.language;
                }
                if (typeof prefs.autoDetect === 'boolean') {
                    this.autoDetect = prefs.autoDetect;
                }
                console.log('🌐 [LANG-SYS] User preferences loaded:', prefs);
            }
        } catch (error) {
            console.warn('🌐 [LANG-SYS] Failed to load user preferences:', error);
        }
    }

    saveUserPreferences() {
        try {
            const prefs = {
                language: this.currentLanguage,
                autoDetect: this.autoDetect,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('tini_language_preferences', JSON.stringify(prefs));
            console.log('🌐 [LANG-SYS] User preferences saved');
        } catch (error) {
            console.error('🌐 [LANG-SYS] Failed to save user preferences:', error);
        }
    }

    setLanguage(lang) {
        if (!this.isLanguageSupported(lang)) {
            console.warn(`🌐 [LANG-SYS] Unsupported language: ${lang}`);
            return false;
        }

        const oldLang = this.currentLanguage;
        this.currentLanguage = lang;
        
        console.log(`🌐 [LANG-SYS] Language changed: ${oldLang} → ${lang}`);
        
        // Save preference
        this.saveUserPreferences();
        
        // Trigger translation update across all systems
        this.triggerTranslationUpdate();
        
        // Dispatch event for other systems
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { 
                language: lang, 
                previousLanguage: oldLang 
            }
        }));
        
        return true;
    }

    triggerTranslationUpdate() {
        // Update all systems that depend on language
        
        // Update i18n system
        if (window.tiniI18n && window.tiniI18n.setLanguage) {
            window.tiniI18n.setLanguage(this.currentLanguage);
        }
        
        // Update language handler
        if (window.tiniLanguageHandler && window.tiniLanguageHandler.changeLanguage) {
            window.tiniLanguageHandler.changeLanguage(this.currentLanguage);
        }
        
        // Update i18n helper
        if (window.tiniI18nHelper && window.tiniI18nHelper.init) {
            window.tiniI18nHelper.init();
        }
        
        // Update Ghost integration
        if (window.tiniGhostIntegration && window.tiniGhostIntegration.updateGhostLanguage) {
            window.tiniGhostIntegration.updateGhostLanguage(this.currentLanguage);
        }
        
        console.log('🌐 [LANG-SYS] Translation update triggered across all systems');
    }

    translate(key, params = {}) {
        // First try main i18n system
        if (window.tiniI18n && window.tiniI18n.translate) {
            const result = window.tiniI18n.translate(key, params);
            if (result !== key) return result;
        }
        
        // Fallback to system translations
        const systemTranslation = this.translations.system[this.currentLanguage]?.[key];
        if (systemTranslation) {
            return this.interpolate(systemTranslation, params);
        }
        
        // Fallback language
        const fallbackTranslation = this.translations.system[this.fallbackLanguage]?.[key];
        if (fallbackTranslation) {
            return this.interpolate(fallbackTranslation, params);
        }
        
        return key; // Return key if no translation found
    }

    interpolate(text, params) {
        if (!params || typeof params !== 'object') return text;
        
        return text.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    format(type, value) {
        const formatter = this.formatters[this.currentLanguage];
        if (!formatter) return value.toString();
        
        try {
            switch (type) {
                case 'currency':
                    return formatter.currency.format(value);
                case 'date':
                    return formatter.date.format(new Date(value));
                case 'number':
                    return formatter.number.format(value);
                case 'percent':
                    return formatter.percent.format(value / 100);
                default:
                    return value.toString();
            }
        } catch (error) {
            console.warn(`🌐 [LANG-SYS] Format error for ${type}:`, error);
            return value.toString();
        }
    }

    isLanguageSupported(lang) {
        return this.translations.system.hasOwnProperty(lang);
    }

    getSupportedLanguages() {
        return Object.keys(this.translations.system).map(code => ({
            code,
            name: this.getLanguageDisplayName(code)
        }));
    }

    getLanguageDisplayName(lang) {
        const names = {
            'en': 'English',
            'vi': 'Tiếng Việt',
            'zh': '中文',
            'hi': 'हिन्दी',
            'ko': '한국어'
        };
        return names[lang] || lang;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    autoTranslatePage() {
        // Trigger auto-translation if DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.triggerTranslationUpdate(), 300);
            });
        } else {
            setTimeout(() => this.triggerTranslationUpdate(), 300);
        }
    }

    // Development helper methods
    addTranslation(category, lang, key, value) {
        if (!this.translations[category]) {
            this.translations[category] = {};
        }
        if (!this.translations[category][lang]) {
            this.translations[category][lang] = {};
        }
        this.translations[category][lang][key] = value;
        
        console.log(`🌐 [LANG-SYS] Translation added: ${category}.${lang}.${key} = "${value}"`);
    }

    getTranslationStats() {
        const stats = {};
        Object.keys(this.translations).forEach(category => {
            stats[category] = {};
            Object.keys(this.translations[category]).forEach(lang => {
                stats[category][lang] = Object.keys(this.translations[category][lang]).length;
            });
        });
        return stats;
    }
}

// Initialize Language System
window.tiniLanguageSystem = new TINILanguageSystem();

// Global convenience functions
window.systemTranslate = function(key, params) {
    return window.tiniLanguageSystem ? window.tiniLanguageSystem.translate(key, params) : key;
};

window.systemFormat = function(type, value) {
    return window.tiniLanguageSystem ? window.tiniLanguageSystem.format(type, value) : value;
};

window.systemSetLanguage = function(lang) {
    return window.tiniLanguageSystem ? window.tiniLanguageSystem.setLanguage(lang) : false;
};

window.getSystemLanguage = function() {
    return window.tiniLanguageSystem ? window.tiniLanguageSystem.getCurrentLanguage() : 'en';
};

console.log('🌐 [LANG-SYS] TINI Language System loaded successfully');
// ST:TINI_1754716154_e868a412
