// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Import dependencies check
if (!window.secureStorage) {
    throw new Error('SecureStorage is required but not loaded');
}

if (!window.API_CONFIG) {
    console.warn('API_CONFIG not found, using default endpoints');
}

// Default API configuration if not provided
const DEFAULT_API_CONFIG = {
    ENDPOINTS: {
        TRANSLATIONS: '/translations'
    }
};

// Helper function to get API URL
function getApiUrl(endpoint) {
    return `${window.API_CONFIG?.BASE_URL || ''}${endpoint}`;
}

class I18nSystem {
    constructor() {
        this.currentLanguage = window.secureStorage.get('adminLanguage', 'en');
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.apiConfig = window.API_CONFIG || DEFAULT_API_CONFIG;
        this.initialized = false;
        try {
            this.syncManager = new LanguageSyncManager();
        } catch (e) {
            console.warn('LanguageSyncManager not initialized:', e.message);
            this.syncManager = null;
        }
        this.pendingUpdates = new Set();
        this.componentRegistry = new Map();
        this.initializeAutoSync();
    }

    initializeAutoSync() {
        // Auto retry failed updates every 5 minutes
        setInterval(() => this.retryPendingUpdates(), 5 * 60 * 1000);
        
        // Add online listener to retry immediately when connection is restored
        window.addEventListener('online', () => this.retryPendingUpdates());
    }

    async initialize() {
        try {
            // Always load translations first
            await this.loadTranslations();

            // Then determine the provider priority
            if (chrome?.i18n) {
                this.provider = 'chrome';
                // Merge Chrome translations with our loaded ones
                const chromeKeys = Object.keys(this.translations[this.currentLanguage] || {});
                chromeKeys.forEach(key => {
                    const chromeMessage = chrome.i18n.getMessage(key);
                    if (chromeMessage) {
                        this.translations[this.currentLanguage][key] = chromeMessage;
                    }
                });
            } else if (window.tiniI18n && typeof window.tiniI18n.getMessage === 'function') {
                this.provider = 'tini';
            } else {
                this.provider = 'custom';
            }

            // Set initialized and notify
            this.initialized = true;
            window.dispatchEvent(new CustomEvent('i18n:initialized', {
                detail: { provider: this.provider, language: this.currentLanguage }
            }));

            console.log(`✅ I18n system initialized with provider: ${this.provider}`);
            return true;
        } catch (error) {
            console.error('❌ Error initializing i18n system:', error);
            this.translations = this.getFallbackTranslations();
            this.provider = 'custom';
            return false;
        }
    }

    // Add event support
    on(eventName, callback) {
        window.addEventListener(`i18n:${eventName}`, callback);
    }

    off(eventName, callback) {
        window.removeEventListener(`i18n:${eventName}`, callback);
    }

    async loadTranslations() {
        try {
            const cached = window.secureStorage.get('translations');
            if (cached && cached !== 'null' && cached !== 'undefined') {
                try {
                    this.translations = JSON.parse(cached);
                    return;
                } catch (parseError) {
                    console.warn('Failed to parse cached translations, reloading:', parseError);
                    window.secureStorage.set('translations', null); // Clear corrupted cache
                }
            }

            // Load from _locales folder; server serves from root with /_locales path
            const lang = this.currentLanguage || this.fallbackLanguage;
            const candidates = [
                `/_locales/${lang}/messages.json`,
                `_locales/${lang}/messages.json`,
                `admin-panel/_locales/${lang}/messages.json`,
                `../_locales/${lang}/messages.json`,
                `../../_locales/${lang}/messages.json`,
                `locales/${lang}/messages.json`
            ];            let loaded = null;
            for (const url of candidates) {
                try {
                    console.log(`🔍 Trying to load translations from: ${url}`);
                    const resp = await fetch(url, { cache: 'no-cache' });
                    if (resp.ok) {
                        loaded = await resp.json();
                        console.log(`✅ Successfully loaded translations from: ${url}`);
                        break;
                    }
                } catch (e) { 
                    console.warn(`❌ Failed to load from ${url}:`, e.message);
                }
            }

            if (!loaded) {
                console.warn('⚠️ No translation files found, using fallback');
                throw new Error('Translations file not found');
            }
            
            this.translations = { [lang]: loaded };
            window.secureStorage.set('translations', JSON.stringify(this.translations));
        } catch (error) {
            console.error('Error loading translations:', error);
            this.translations = this.getFallbackTranslations();
        }
    }

    // Component Registry Methods
    registerComponent(component, options = {}) {
        const id = options.id || `component_${Date.now()}`;
        this.componentRegistry.set(id, {
            component,
            options: {
                autoUpdate: options.autoUpdate ?? true,
                dependencies: options.dependencies || [],
                priority: options.priority || 0
            }
        });
        return id;
    }

    unregisterComponent(id) {
        return this.componentRegistry.delete(id);
    }

    getRegisteredComponents() {
        return Array.from(this.componentRegistry.entries());
    }

    // Update Queue Management
    async queueUpdate(componentId, translations) {
        try {
            const result = await this.syncManager.syncTranslations(translations);
            if (!result.success) {
                this.pendingUpdates.add({componentId, translations});
                console.warn(`Update for component ${componentId} queued for retry`);
            }
            return result;
        } catch (error) {
            console.error(`Error queuing update for component ${componentId}:`, error);
            this.pendingUpdates.add({componentId, translations});
            return { success: false, error };
        }
    }

    async retryPendingUpdates() {
        const updates = Array.from(this.pendingUpdates);
        for (const update of updates) {
            try {
                const result = await this.syncManager.syncTranslations(update.translations);
                if (result.success) {
                    this.pendingUpdates.delete(update);
                    console.log(`Successfully synced updates for component ${update.componentId}`);
                }
            } catch (error) {
                console.error(`Failed to sync updates for component ${update.componentId}:`, error);
            }
        }
    }

    // Enhanced Language Change Management
    async changeLanguage(newLang, options = {}) {
        const oldLanguage = this.currentLanguage;
        const components = this.getRegisteredComponents()
            .sort((a, b) => b[1].options.priority - a[1].options.priority);

        for (const [id, {component, options: componentOptions}] of components) {
            if (!componentOptions.autoUpdate) continue;

            try {
                await component.updateLanguage?.(newLang);
            } catch (error) {
                console.error(`Failed to update language for component ${id}:`, error);
                if (!options.continueOnError) {
                    throw new Error(`Language change failed at component ${id}`);
                }
            }
        }

        this.currentLanguage = newLang;
        window.secureStorage.set('adminLanguage', newLang);
        document.documentElement.setAttribute('lang', newLang);
        
        window.dispatchEvent(new CustomEvent('i18n:languageChanged', {
            detail: { 
                oldLanguage,
                newLanguage: newLang,
                translations: this.translations[newLang]
            }
        }));

        // Refresh UI after language change
        this.refreshUI();
        return true;
    }

    // Simple language setter
    async setLanguage(lang) {
        if (lang === this.currentLanguage) return true;
        
        this.currentLanguage = lang;
        window.secureStorage.set('adminLanguage', lang);
        document.documentElement.setAttribute('lang', lang);
        
        // Reload translations for the new language
        await this.loadTranslations();
        
        // Refresh UI
        this.refreshUI();
        
        console.log(`✅ Language changed to: ${lang}`);
        return true;
    }

    // Get message based on key and optional substitutions
    getMessage(key, substitutions = null) {
        try {
            switch (this.provider) {
                case 'chrome':
                    return chrome.i18n.getMessage(key, substitutions);
                case 'tini':
                    if (window.tiniI18n && typeof window.tiniI18n.getMessage === 'function') {
                        return window.tiniI18n.getMessage(key, substitutions);
                    }
                    return this.getCustomMessage(key, substitutions);
                case 'custom':
                    return this.getCustomMessage(key, substitutions);
                default:
                    return key;
            }
        } catch (error) {
            console.error(`❌ Error getting message for key ${key}:`, error);
            return key;
        }
    }

    getCustomMessage(key, substitutions = null) {
        // Tìm message từ current language hoặc fallback
        let messageData = this.translations[this.currentLanguage]?.[key] 
            || this.translations[this.fallbackLanguage]?.[key];
        
        // Nếu không tìm thấy, trả về key
        if (!messageData) {
            console.warn(`Translation not found for key: ${key}`);
            return key;
        }

        // Xử lý cấu trúc Chrome extension {message: "..."} hoặc string thường
        let message;
        if (typeof messageData === 'object' && messageData.message) {
            message = messageData.message;
        } else if (typeof messageData === 'string') {
            message = messageData;
        } else {
            console.warn(`Invalid message format for key: ${key}`, messageData);
            return key;
        }

        // Xử lý substitutions nếu có
        if (!substitutions) return message;

        return message.replace(/\{(\d+)\}/g, (match, index) => {
            return substitutions[index] !== undefined ? substitutions[index] : match;
        });
    }

    // Helper method to update UI elements
    updateElements(elements, keyAttribute = 'data-i18n') {
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n') || element.getAttribute(keyAttribute) || element.getAttribute('data-i18n-key');
            if (key) {
                const translation = this.getMessage(key);
                console.log(`Translating "${key}" to "${translation}"`);
                if (translation && translation !== key) {
                    // Placeholder support
                    if (element.hasAttribute('data-i18n-placeholder')) {
                        const phKey = element.getAttribute('data-i18n-placeholder');
                        const phVal = this.getMessage(phKey);
                        if (phVal && element.placeholder !== undefined) element.placeholder = phVal;
                    }
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        if (!element.hasAttribute('data-i18n-placeholder')) {
                            // If key intended for placeholder
                            if (element.type !== 'button' && element.placeholder !== undefined) {
                                element.placeholder = translation;
                            } else {
                                element.value = translation;
                            }
                        }
                    } else {
                        element.textContent = translation;
                    }
                } else {
                    console.warn(`No translation found for key: ${key}`);
                }
            }
        });
    }

    // Refresh all translations in the UI
    refreshUI() {
        console.log('🔄 Refreshing UI translations...');
        const elements = document.querySelectorAll('[data-i18n],[data-i18n-key]');
        console.log(`Found ${elements.length} elements to translate`);
        this.updateElements(elements);
        // Apply placeholders separately
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const k = el.getAttribute('data-i18n-placeholder');
            const t = this.getMessage(k);
            if (t && el.placeholder !== undefined) el.placeholder = t;
        });
        window.dispatchEvent(new CustomEvent('i18n:refreshed', { detail: { language: this.currentLanguage } }));
        console.log('✅ UI refresh completed');
    }

    getFallbackTranslations() {
        return {
            en: {
                // Navigation
                'nav_dashboard': 'Dashboard',
                'nav_users': 'Users',
                'nav_profile': 'Profile',
                'nav_security': 'Security',
                'nav_settings': 'Settings',
                'nav_analytics': 'Analytics',
                'nav_reports': 'Reports',
                'admin_dashboard_title': 'TINI Admin Dashboard',
                'logout': 'Logout',
                'testing_zone': 'Testing Zone',
                'super_admin': 'Super Admin',
                'active_users': 'Active Users',
                'view_all': 'View All',
                // Metrics
                'metric_active_users': 'ACTIVE USERS',
                'metric_response_time': 'RESPONSE TIME',
                'metric_retention_rate': 'RETENTION RATE',
                'metric_threat_level': 'THREAT LEVEL',
                'incidents': 'incidents',
                // Security
                'security_no_threats': 'No active threats detected',
                'security_controls_matrix': 'Security Controls Matrix',
                'btn_refresh': 'Refresh',
                // Headers
                'header_total_reports': 'Total Reports',
                'header_pending_reports': 'Pending Reports', 
                'header_completed_reports': 'Completed Reports',
                'header_critical_reports': 'Critical Reports',
                // Months
                'month_january': 'January',
                'month_february': 'February',
                'month_march': 'March',
                'month_april': 'April',
                'month_may': 'May',
                'month_june': 'June',
                'month_july': 'July',
                'month_august': 'August',
                'month_september': 'September',
                'month_october': 'October',
                'month_november': 'November',
                'month_december': 'December'
            },
            vi: {
                // Navigation
                'nav_dashboard': 'Bảng Điều Khiển',
                'nav_users': 'Quản Lý Người Dùng',
                'nav_profile': 'Hồ Sơ',
                'nav_security': 'Bảo Mật',
                'nav_settings': 'Cài Đặt',
                'nav_analytics': 'Phân Tích',
                'nav_reports': 'Báo Cáo',
                'admin_dashboard_title': 'Bảng Điều Khiển TINI',
                'logout': 'Đăng Xuất',
                'testing_zone': 'Khu Vực Thử Nghiệm',
                'super_admin': 'Quản Trị Cấp Cao',
                'active_users': 'Người Dùng Hoạt Động',
                'view_all': 'Xem Tất Cả',
                // Metrics
                'metric_active_users': 'NGƯỜI DÙNG HOẠT ĐỘNG',
                'metric_response_time': 'THỜI GIAN PHẢN HỒI',
                'metric_retention_rate': 'TỶ LỆ GIỮ CHÂN',
                'metric_threat_level': 'MỨC ĐỘ NGUY HIỂM',
                'incidents': 'sự cố'
            },
            zh: {
                // Navigation
                'nav_dashboard': '仪表板',
                'nav_users': '用户管理',
                'nav_profile': '个人资料',
                'nav_security': '安全设置',
                'nav_settings': '系统设置',
                'nav_analytics': '数据分析',
                'nav_reports': '报告管理',
                'admin_dashboard_title': 'TINI 管理面板',
                'logout': '退出登录',
                'testing_zone': '测试区域',
                'super_admin': '超级管理员',
                'active_users': '活跃用户',
                'view_all': '查看全部',
                // Metrics
                'metric_active_users': '活跃用户',
                'metric_response_time': '响应时间',
                'metric_retention_rate': '留存率',
                'metric_threat_level': '威胁等级',
                'incidents': '事件',
                // Security
                'security_no_threats': '未检测到活动威胁',
                'security_controls_matrix': '安全控制矩阵',
                'btn_refresh': '刷新',
                // Headers
                'header_total_reports': '总报告',
                'header_pending_reports': '待处理报告',
                'header_completed_reports': '已完成报告',
                'header_critical_reports': '关键报告',
                // Months
                'month_january': '一月',
                'month_february': '二月',
                'month_march': '三月',
                'month_april': '四月',
                'month_may': '五月',
                'month_june': '六月',
                'month_july': '七月',
                'month_august': '八月',
                'month_september': '九月',
                'month_october': '十月',
                'month_november': '十一月',
                'month_december': '十二月'
            },
            hi: {
                // Navigation
                'nav_dashboard': 'डैशबोर्ड',
                'nav_users': 'उपयोगकर्ता प्रबंधन',
                'nav_profile': 'प्रोफ़ाइल',
                'nav_security': 'सुरक्षा',
                'nav_settings': 'सेटिंग्स',
                'nav_analytics': 'विश्लेषण',
                'nav_reports': 'रिपोर्ट',
                'admin_dashboard_title': 'TINI एडमिन डैशबोर्ड',
                'logout': 'लॉग आउट',
                'testing_zone': 'परीक्षण क्षेत्र',
                'super_admin': 'सुपर एडमिन',
                'active_users': 'सक्रिय उपयोगकर्ता',
                'view_all': 'सभी देखें',
                // Metrics
                'metric_active_users': 'सक्रिय उपयोगकर्ता',
                'metric_response_time': 'प्रतिक्रिया समय',
                'metric_retention_rate': 'प्रतिधारण दर',
                'metric_threat_level': 'खतरे का स्तर',
                'incidents': 'घटनाएं'
            },
            ko: {
                // Navigation
                'nav_dashboard': '대시보드',
                'nav_users': '사용자 관리',
                'nav_profile': '프로필',
                'nav_security': '보안',
                'nav_settings': '설정',
                'nav_analytics': '분석',
                'nav_reports': '보고서',
                'admin_dashboard_title': 'TINI 관리자 대시보드',
                'logout': '로그아웃',
                'testing_zone': '테스트 영역',
                'super_admin': '슈퍼 관리자',
                'active_users': '활성 사용자',
                'view_all': '모두 보기',
                // Metrics
                'metric_active_users': '활성 사용자',
                'metric_response_time': '응답 시간',
                'metric_retention_rate': '유지율',
                'metric_threat_level': '위험 수준',
                'incidents': '인시던트'
            }
        };
    }

    // Global helper methods
    static getInstance() {
        return window.i18n;
    }

    static t(key, substitutions = null) {
        return window.i18n ? window.i18n.getMessage(key, substitutions) : key;
    }

    // Helper method to load message from structured data
}

// Global helper functions for easy access
window.t = function(key, substitutions = null) {
    return window.i18n ? window.i18n.getMessage(key, substitutions) : key;
};

window.setLanguage = function(lang) {
    return window.i18n ? window.i18n.setLanguage(lang) : false;
};

window.getCurrentLanguage = function() {
    return window.i18n ? window.i18n.currentLanguage : 'en';
};

// Initialize singleton instance with safety checks
(async function() {
    try {
        if (window.i18n) {
            console.warn('⚠️ I18nSystem already initialized');
            return;
        }

        // Create and initialize instance
        const i18n = new I18nSystem();
        await i18n.initialize();
        
        // Make globally available
        window.i18n = i18n;

        // Initial UI refresh - wait for DOM if needed
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => i18n.refreshUI(), 100);
            });
        } else {
            setTimeout(() => i18n.refreshUI(), 100);
        }

        // Also refresh when any dynamic content is added
        const observer = new MutationObserver(() => {
            const newElements = document.querySelectorAll('[data-i18n]:not([data-i18n-processed])');
            if (newElements.length > 0) {
                i18n.updateElements(newElements);
                newElements.forEach(el => el.setAttribute('data-i18n-processed', 'true'));
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        console.log('✅ I18nSystem initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize I18nSystem:', error);
    }
})();
// ST:TINI_1754716154_e868a412
// ST:TINI_1754752705_e868a412
// ST:TINI_1754879322_e868a412
