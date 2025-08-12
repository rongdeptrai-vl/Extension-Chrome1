// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: UNIFIED | Time: 2025-08-11T00:00:00Z
// Watermark: TINI_UNIFIED_I18N_MASTER | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited

/**
 * TINI UNIFIED I18N MASTER SYSTEM
 * ===============================
 * Hệ thống quản lý ngôn ngữ tối ưu và thống nhất
 * Gộp tất cả các tính năng i18n vào 1 file duy nhất
 * Loại bỏ xung đột và trùng lặp
 */

// Prevent duplicate class declaration
if (typeof TINIUnifiedI18n === 'undefined') {
    class TINIUnifiedI18n {
        constructor() {
            // Singleton pattern - chỉ cho phép 1 instance duy nhất
            if (window.TINIUnifiedI18n && window.TINIUnifiedI18n.instance) {
                return window.TINIUnifiedI18n.instance;
            }

        this.initialized = false;
        this.currentLanguage = 'en';
        this.fallbackLanguage = 'en';
        this.translations = {};
        this.cache = new Map();
        this.subscribers = new Set();
        this.loadQueue = new Set();
        
        // Supported languages với thông tin chi tiết
        this.supportedLanguages = {
            'en': { name: 'English', flag: '🇺🇸', direction: 'ltr' },
            'vi': { name: 'Tiếng Việt', flag: '🇻🇳', direction: 'ltr' },
            'zh': { name: '中文', flag: '🇨🇳', direction: 'ltr' },
            'hi': { name: 'हिंदी', flag: '🇮🇳', direction: 'ltr' },
            'ko': { name: '한국어', flag: '🇰🇷', direction: 'ltr' }
        };

        // Format helpers
        this.formatters = this.initializeFormatters();

        // Lưu instance vào global
        window.TINIUnifiedI18n = window.TINIUnifiedI18n || {};
        window.TINIUnifiedI18n.instance = this;

        // Auto initialize
        this.init();
    }

    /**
     * Khởi tạo hệ thống
     */
    async init() {
        if (this.initialized) return true;

        try {
            console.log('🚀 [UNIFIED-I18N] Initializing TINI Unified I18n System...');

            // 1. Load user preferences
            this.loadUserPreferences();

            // 2. Load translations
            await this.loadAllTranslations();

            // 3. Setup auto-detection
            this.setupLanguageDetection();

            // 4. Setup formatters
            this.setupFormatters();

            // 5. Setup event listeners
            this.setupEventListeners();

            // 6. Create global functions
            this.createGlobalFunctions();

            // 7. Auto translate page
            this.autoTranslatePage();

            this.initialized = true;
            console.log('✅ [UNIFIED-I18N] System initialized successfully');
            console.log(`🌍 Current language: ${this.currentLanguage}`);
            console.log(`📚 Loaded languages: ${Object.keys(this.translations).join(', ')}`);

            // Notify subscribers
            this.notifySubscribers('initialized', {
                language: this.currentLanguage,
                languages: Object.keys(this.translations)
            });

            return true;
        } catch (error) {
            console.error('❌ [UNIFIED-I18N] Initialization failed:', error);
            this.loadFallbackTranslations();
            return false;
        }
    }

    /**
     * Load user preferences từ các nguồn khác nhau
     */
    loadUserPreferences() {
        try {
            // Priority: secureStorage > localStorage > navigator
            let savedLang = null;

            if (window.secureStorage && window.secureStorage.get) {
                savedLang = window.secureStorage.get('adminLanguage') || 
                           window.secureStorage.get('language') ||
                           window.secureStorage.get('locale');
            }

            if (!savedLang && window.localStorage) {
                savedLang = localStorage.getItem('adminLanguage') ||
                           localStorage.getItem('language') ||
                           localStorage.getItem('locale');
            }

            if (!savedLang && navigator.language) {
                const navLang = navigator.language.split('-')[0];
                if (this.supportedLanguages[navLang]) {
                    savedLang = navLang;
                }
            }

            if (savedLang && this.supportedLanguages[savedLang]) {
                this.currentLanguage = savedLang;
            }

            console.log(`🔧 [UNIFIED-I18N] Language preference loaded: ${this.currentLanguage}`);
        } catch (error) {
            console.warn('⚠️ [UNIFIED-I18N] Error loading preferences:', error);
        }
    }

    /**
     * Load tất cả translations từ các nguồn có thể
     */
    async loadAllTranslations() {
        const loadPromises = Object.keys(this.supportedLanguages).map(lang => 
            this.loadLanguageTranslations(lang)
        );

        const results = await Promise.allSettled(loadPromises);
        
        let successCount = 0;
        results.forEach((result, index) => {
            const lang = Object.keys(this.supportedLanguages)[index];
            if (result.status === 'fulfilled' && result.value) {
                successCount++;
            } else {
                console.warn(`⚠️ [UNIFIED-I18N] Failed to load ${lang}:`, result.reason);
            }
        });

        console.log(`📚 [UNIFIED-I18N] Loaded ${successCount}/${results.length} languages`);

        // Ensure current language is loaded
        if (!this.translations[this.currentLanguage]) {
            console.warn(`⚠️ [UNIFIED-I18N] Current language ${this.currentLanguage} not loaded, falling back to ${this.fallbackLanguage}`);
            this.currentLanguage = this.fallbackLanguage;
        }
    }

    /**
     * Load translations cho 1 ngôn ngữ cụ thể
     */
    async loadLanguageTranslations(language) {
        if (this.translations[language]) {
            return this.translations[language];
        }

        try {
            // Danh sách các path có thể có file messages.json
            const candidatePaths = [
                `_locales/${language}/messages.json`,
                `locales/${language}/messages.json`,
            ];

            let translations = null;

            for (const path of candidatePaths) {
                try {
                    console.log(`🔍 [UNIFIED-I18N] Trying to load ${language} from: ${path}`);
                    const response = await fetch(path, { 
                        cache: 'no-cache',
                        headers: {
                            'Accept': 'application/json',
                            'Cache-Control': 'no-cache'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data && typeof data === 'object') {
                            translations = data;
                            console.log(`✅ [UNIFIED-I18N] Successfully loaded ${language} from: ${path}`);
                            break;
                        }
                    }
                } catch (error) {
                    console.debug(`🔍 [UNIFIED-I18N] Path ${path} failed:`, error.message);
                }
            }

            if (translations) {
                this.translations[language] = translations;
                this.cache.set(`translations_${language}`, translations);
                return translations;
            } else {
                console.warn(`⚠️ [UNIFIED-I18N] No translations found for ${language}`);
                return null;
            }
        } catch (error) {
            console.error(`❌ [UNIFIED-I18N] Error loading ${language}:`, error);
            return null;
        }
    }

    /**
     * Get translated message
     */
    getMessage(key, substitutions = null) {
        try {
            // Check cache first
            const cacheKey = `${this.currentLanguage}_${key}_${JSON.stringify(substitutions)}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            let message = null;

            // Try current language
            if (this.translations[this.currentLanguage] && this.translations[this.currentLanguage][key]) {
                const msgData = this.translations[this.currentLanguage][key];
                message = typeof msgData === 'string' ? msgData : msgData.message;
            }

            // Try fallback language
            if (!message && this.currentLanguage !== this.fallbackLanguage) {
                if (this.translations[this.fallbackLanguage] && this.translations[this.fallbackLanguage][key]) {
                    const msgData = this.translations[this.fallbackLanguage][key];
                    message = typeof msgData === 'string' ? msgData : msgData.message;
                }
            }

            // Return key if no translation found
            if (!message) {
                console.debug(`🔍 [UNIFIED-I18N] No translation found for key: ${key}`);
                message = key;
            }

            // Handle substitutions
            if (message && substitutions) {
                if (Array.isArray(substitutions)) {
                    substitutions.forEach((sub, index) => {
                        message = message.replace(new RegExp(`\\$${index + 1}`, 'g'), sub);
                    });
                } else if (typeof substitutions === 'object') {
                    Object.keys(substitutions).forEach(placeholder => {
                        message = message.replace(
                            new RegExp(`\\{${placeholder}\\}`, 'g'), 
                            substitutions[placeholder]
                        );
                    });
                } else {
                    message = message.replace(/\$1/g, substitutions);
                }
            }

            // Cache result
            this.cache.set(cacheKey, message);
            return message;
        } catch (error) {
            console.error(`❌ [UNIFIED-I18N] Error getting message for key ${key}:`, error);
            return key;
        }
    }

    /**
     * Set current language
     */
    async setLanguage(language) {
        if (!this.supportedLanguages[language]) {
            console.warn(`⚠️ [UNIFIED-I18N] Unsupported language: ${language}`);
            return false;
        }

        if (this.currentLanguage === language) {
            return true;
        }

        try {
            const oldLanguage = this.currentLanguage;
            this.currentLanguage = language;

            // Load translations if not already loaded
            if (!this.translations[language]) {
                await this.loadLanguageTranslations(language);
            }

            // Clear cache
            this.cache.clear();

            // Save preference
            this.saveLanguagePreference();

            // Update page
            this.updatePageContent();

            // Notify subscribers
            this.notifySubscribers('languageChanged', {
                from: oldLanguage,
                to: language,
                language: language
            });

            console.log(`🌍 [UNIFIED-I18N] Language changed to: ${language}`);
            return true;
        } catch (error) {
            console.error(`❌ [UNIFIED-I18N] Error setting language to ${language}:`, error);
            return false;
        }
    }

    /**
     * Update all page content
     */
    updatePageContent() {
        try {
            // Update elements with data-i18n attribute
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (key) {
                    const translation = this.getMessage(key);
                    
                    if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'password')) {
                        element.placeholder = translation;
                    } else if (element.tagName === 'INPUT' && element.type === 'submit') {
                        element.value = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            });

            // Update elements với data-i18n-html (cho HTML content)
            const htmlElements = document.querySelectorAll('[data-i18n-html]');
            htmlElements.forEach(element => {
                const key = element.getAttribute('data-i18n-html');
                if (key) {
                    element.innerHTML = this.getMessage(key);
                }
            });

            // Update title
            const titleElement = document.querySelector('[data-i18n-title]');
            if (titleElement) {
                const key = titleElement.getAttribute('data-i18n-title');
                document.title = this.getMessage(key);
            }

            console.log(`🔄 [UNIFIED-I18N] Page content updated for language: ${this.currentLanguage}`);
        } catch (error) {
            console.error('❌ [UNIFIED-I18N] Error updating page content:', error);
        }
    }

    /**
     * Auto translate page on load
     */
    autoTranslatePage() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.updatePageContent());
        } else {
            this.updatePageContent();
        }
    }

    /**
     * Initialize formatters for different data types
     */
    initializeFormatters() {
        return {
            date: (date, lang = null) => this.formatDate(date, lang),
            time: (time, lang = null) => this.formatTime(time, lang),
            datetime: (datetime, lang = null) => this.formatDateTime(datetime, lang),
            number: (number, lang = null) => this.formatNumber(number, lang),
            currency: (amount, currency = null, lang = null) => this.formatCurrency(amount, currency, lang),
            percentage: (value, lang = null) => this.formatPercentage(value, lang),
            fileSize: (bytes, lang = null) => this.formatFileSize(bytes, lang)
        };
    }

    /**
     * Format date theo ngôn ngữ hiện tại
     */
    formatDate(date, lang = null) {
        const language = lang || this.currentLanguage;
        const locale = this.getLocaleForLanguage(language);
        
        try {
            return new Date(date).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('⚠️ [UNIFIED-I18N] Date format error:', error);
            return new Date(date).toLocaleDateString('en-US');
        }
    }

    /**
     * Format time theo ngôn ngữ hiện tại
     */
    formatTime(time, lang = null) {
        const language = lang || this.currentLanguage;
        const locale = this.getLocaleForLanguage(language);
        
        try {
            return new Date(time).toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            console.warn('⚠️ [UNIFIED-I18N] Time format error:', error);
            return new Date(time).toLocaleTimeString('en-US');
        }
    }

    /**
     * Format datetime
     */
    formatDateTime(datetime, lang = null) {
        return `${this.formatDate(datetime, lang)} ${this.formatTime(datetime, lang)}`;
    }

    /**
     * Format number theo ngôn ngữ hiện tại
     */
    formatNumber(number, lang = null) {
        const language = lang || this.currentLanguage;
        const locale = this.getLocaleForLanguage(language);
        
        try {
            return new Intl.NumberFormat(locale).format(number);
        } catch (error) {
            console.warn('⚠️ [UNIFIED-I18N] Number format error:', error);
            return number.toString();
        }
    }

    /**
     * Format currency
     */
    formatCurrency(amount, currency = null, lang = null) {
        const language = lang || this.currentLanguage;
        const locale = this.getLocaleForLanguage(language);
        const curr = currency || this.getCurrencyForLanguage(language);
        
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: curr
            }).format(amount);
        } catch (error) {
            console.warn('⚠️ [UNIFIED-I18N] Currency format error:', error);
            return `${curr} ${amount}`;
        }
    }

    /**
     * Format percentage
     */
    formatPercentage(value, lang = null) {
        const language = lang || this.currentLanguage;
        const locale = this.getLocaleForLanguage(language);
        
        try {
            return new Intl.NumberFormat(locale, {
                style: 'percent',
                minimumFractionDigits: 1,
                maximumFractionDigits: 2
            }).format(value / 100);
        } catch (error) {
            console.warn('⚠️ [UNIFIED-I18N] Percentage format error:', error);
            return `${value}%`;
        }
    }

    /**
     * Format file size
     */
    formatFileSize(bytes, lang = null) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        const formattedSize = this.formatNumber(Math.round(size * 100) / 100, lang);
        return `${formattedSize} ${units[unitIndex]}`;
    }

    /**
     * Get locale string for language
     */
    getLocaleForLanguage(language) {
        const localeMap = {
            'en': 'en-US',
            'vi': 'vi-VN',
            'zh': 'zh-CN',
            'hi': 'hi-IN',
            'ko': 'ko-KR'
        };
        return localeMap[language] || 'en-US';
    }

    /**
     * Get currency for language
     */
    getCurrencyForLanguage(language) {
        const currencyMap = {
            'en': 'USD',
            'vi': 'VND',
            'zh': 'CNY',
            'hi': 'INR',
            'ko': 'KRW'
        };
        return currencyMap[language] || 'USD';
    }

    /**
     * Setup language detection
     */
    setupLanguageDetection() {
        // Detect system language changes
        if ('language' in navigator) {
            const updateLanguage = () => {
                const browserLang = navigator.language.split('-')[0];
                if (this.supportedLanguages[browserLang] && browserLang !== this.currentLanguage) {
                    console.log(`🔍 [UNIFIED-I18N] System language changed to: ${browserLang}`);
                    // Optionally auto-switch (commented out for now)
                    // this.setLanguage(browserLang);
                }
            };

            window.addEventListener('languagechange', updateLanguage);
        }
    }

    /**
     * Setup formatters
     */
    setupFormatters() {
        // Make formatters available globally
        window.formatDate = this.formatDate.bind(this);
        window.formatTime = this.formatTime.bind(this);
        window.formatDateTime = this.formatDateTime.bind(this);
        window.formatNumber = this.formatNumber.bind(this);
        window.formatCurrency = this.formatCurrency.bind(this);
        window.formatPercentage = this.formatPercentage.bind(this);
        window.formatFileSize = this.formatFileSize.bind(this);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'language' || e.key === 'adminLanguage') {
                if (e.newValue && e.newValue !== this.currentLanguage) {
                    this.setLanguage(e.newValue);
                }
            }
        });

        // Listen for manual DOM updates
        const observer = new MutationObserver((mutations) => {
            let hasNewI18nElements = false;
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.hasAttribute && node.hasAttribute('data-i18n')) {
                            hasNewI18nElements = true;
                        }
                        if (node.querySelectorAll) {
                            const i18nElements = node.querySelectorAll('[data-i18n], [data-i18n-html]');
                            if (i18nElements.length > 0) {
                                hasNewI18nElements = true;
                            }
                        }
                    }
                });
            });

            if (hasNewI18nElements) {
                setTimeout(() => this.updatePageContent(), 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Create global functions for backward compatibility
     */
    createGlobalFunctions() {
        // Main translation function
        window.t = (key, substitutions = null) => this.getMessage(key, substitutions);
        window.translate = window.t;
        window.__ = window.t;

        // Language functions
        window.setLanguage = (lang) => this.setLanguage(lang);
        window.getCurrentLanguage = () => this.currentLanguage;
        window.getSupportedLanguages = () => Object.keys(this.supportedLanguages).map(code => ({
            code,
            ...this.supportedLanguages[code]
        }));

        // Update functions
        window.updatePageTranslations = () => this.updatePageContent();
        window.reloadTranslations = () => this.loadAllTranslations();

        // Compatibility with existing systems
        window.tiniI18n = {
            getMessage: window.t,
            setLanguage: window.setLanguage,
            getCurrentLanguage: window.getCurrentLanguage,
            getSupportedLanguages: window.getSupportedLanguages,
            updateAllTranslations: window.updatePageTranslations,
            translate: window.t
        };

        window.i18n = window.tiniI18n;
        window.i18nSystem = this;

        console.log('🔗 [UNIFIED-I18N] Global functions created for compatibility');
    }

    /**
     * Save language preference
     */
    saveLanguagePreference() {
        try {
            if (window.secureStorage && window.secureStorage.set) {
                window.secureStorage.set('adminLanguage', this.currentLanguage);
                window.secureStorage.set('language', this.currentLanguage);
            }

            if (window.localStorage) {
                localStorage.setItem('adminLanguage', this.currentLanguage);
                localStorage.setItem('language', this.currentLanguage);
            }

            console.log(`💾 [UNIFIED-I18N] Language preference saved: ${this.currentLanguage}`);
        } catch (error) {
            console.warn('⚠️ [UNIFIED-I18N] Error saving language preference:', error);
        }
    }

    /**
     * Load fallback translations
     */
    loadFallbackTranslations() {
        console.log('📚 [UNIFIED-I18N] Loading fallback translations...');
        
        this.translations = {
            en: {
                loading: { message: 'Loading...' },
                error: { message: 'Error' },
                success: { message: 'Success' },
                warning: { message: 'Warning' },
                confirm: { message: 'Confirm' },
                cancel: { message: 'Cancel' },
                save: { message: 'Save' },
                delete: { message: 'Delete' },
                edit: { message: 'Edit' },
                view: { message: 'View' },
                search: { message: 'Search' },
                close: { message: 'Close' },
                reports_submit_generate: { message: 'Generate Report' },
                report_generation_note: { message: 'This will take 2-5 seconds to generate the report, complex reports may take longer' },
                refresh: { message: 'Refresh' },
                back: { message: 'Back' },
                next: { message: 'Next' },
                previous: { message: 'Previous' },
                submit: { message: 'Submit' },
                open: { message: 'Open' },
                help: { message: 'Help' },
                about: { message: 'About' },
                contact: { message: 'Contact' },
                privacy: { message: 'Privacy Policy' },
                terms: { message: 'Terms of Service' },
                notification: { message: 'Notification' },
                message: { message: 'Message' },
                today: { message: 'Today' },
                yesterday: { message: 'Yesterday' },
                tomorrow: { message: 'Tomorrow' },
                yes: { message: 'Yes' },
                no: { message: 'No' },
                welcome: { message: 'Welcome' },
                goodbye: { message: 'Goodbye' },
                dashboard_empty_state: { message: 'No data available' },
                no_data_available: { message: 'No data available' },
                coming_soon: { message: 'Coming soon' },
                not_available: { message: 'Not available' },
                empty_field: { message: 'Empty field' },
                no_description: { message: 'No description' },
                unknown: { message: 'Unknown' },
                none: { message: 'None' },
                not_set: { message: 'Not set' },
                placeholder_text: { message: 'Placeholder text' },
                default_value: { message: 'Default value' },
                empty_content: { message: 'Empty content' },
                no_content: { message: 'No content' },
                data_loading: { message: 'Loading data' },
                content_loading: { message: 'Loading content' },
                please_wait: { message: 'Please wait' },
                initializing: { message: 'Initializing' },
                connecting: { message: 'Connecting' },
                processing_data: { message: 'Processing data' },
                generating_report: { message: 'Generating report' },
                fetching_data: { message: 'Fetching data' },
                updating: { message: 'Updating' },
                synchronizing: { message: 'Synchronizing' },
                saving: { message: 'Saving' },
                loading_content: { message: 'Loading content' },
                preparing: { message: 'Preparing' },
                in_progress: { message: 'In progress' },
                pending: { message: 'Pending' },
                standby_mode: { message: 'Standby mode' },
                offline: { message: 'Offline' },
                disconnected: { message: 'Disconnected' },
                unavailable: { message: 'Unavailable' },
                maintenance: { message: 'Under maintenance' },
                error_occurred: { message: 'An error occurred' },
                failed_to_load: { message: 'Failed to load' },
                connection_failed: { message: 'Connection failed' },
                timeout: { message: 'Timeout' },
                retry: { message: 'Retry' },
                try_again: { message: 'Try again' },
                reload: { message: 'Reload' },
                no_data: { message: 'No data' },
                empty: { message: 'Empty' },
                null_value: { message: 'Null' },
                undefined_value: { message: 'Undefined' },
                status_ready: { message: 'Ready' },
                status_processing: { message: 'Processing' },
                generate_new_report: { message: 'Generate New Report' },
                modal_report_type: { message: 'Report Type:' },
                user_activity_report: { message: 'User Activity Report' },
                security_analysis_report: { message: 'Security Analysis Report' },
                system_logs_report: { message: 'System Logs Report' },
                comprehensive_report: { message: 'Comprehensive Report' },
                modal_time_range: { message: 'Time Range:' },
                last_hour: { message: 'Last Hour' },
                last_24h: { message: 'Last 24 Hours' },
                last_week: { message: 'Last Week' },
                last_month: { message: 'Last Month' },
                custom_range: { message: 'Custom Range' },
                modal_report_format: { message: 'Report Format:' },
                pdf_document: { message: 'PDF Document' },
                excel_spreadsheet: { message: 'Excel Spreadsheet' },
                json_data: { message: 'JSON Data' },
                active_users_label: { message: '活跃用户' },
                response_time_label: { message: '响应时间' },
                retention_rate_label: { message: '留存率' },
                security_incidents_label: { message: '安全事件' },
                chart_active_users: { message: '活跃用户图表' },
                chart_response_time: { message: '响应时间图表' },
                chart_retention_rate: { message: '留存率图表' },
                chart_security_incidents: { message: '安全事件图表' },
                users: { message: '用户' },
                milliseconds: { message: '毫秒' },
                ms: { message: '毫秒' },
                percentage: { message: '百分比' },
                rate: { message: '速度' }
            }
        };
    }

    /**
     * Subscribe to language events
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    /**
     * Notify subscribers of events
     */
    notifySubscribers(event, data) {
        this.subscribers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('❌ [UNIFIED-I18N] Error in subscriber callback:', error);
            }
        });

        // Also emit DOM events
        window.dispatchEvent(new CustomEvent(`tini-i18n-${event}`, { detail: data }));
    }

    /**
     * Get language info
     */
    getLanguageInfo(language = null) {
        const lang = language || this.currentLanguage;
        return this.supportedLanguages[lang] || this.supportedLanguages[this.fallbackLanguage];
    }

    /**
     * Check if language is supported
     */
    isLanguageSupported(language) {
        return !!this.supportedLanguages[language];
    }

    /**
     * Get all available translations
     */
    getAllTranslations() {
        return this.translations;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ [UNIFIED-I18N] Cache cleared');
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            currentLanguage: this.currentLanguage,
            loadedLanguages: Object.keys(this.translations),
            cacheSize: this.cache.size,
            subscriberCount: this.subscribers.size,
            supportedLanguages: Object.keys(this.supportedLanguages)
        };
    }
}

// Initialize the system immediately (but only once)
if (!window.tiniUnifiedI18n && !window.TINI_I18N_LOADING) {
    window.TINI_I18N_LOADING = true;
    console.log('🚀 [UNIFIED-I18N] Creating TINI Unified I18n instance...');
    window.tiniUnifiedI18n = new TINIUnifiedI18n();
    window.TINI_I18N_LOADING = false;
} else if (window.tiniUnifiedI18n) {
    console.log('🔄 [UNIFIED-I18N] Instance already exists, skipping duplicate creation');
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIUnifiedI18n;
}

} // End of TINIUnifiedI18n class guard
// ST:TINI_1754998490_e868a412
