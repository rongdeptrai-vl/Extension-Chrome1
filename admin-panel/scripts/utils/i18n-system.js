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

            // Load from _locales folder; try admin-panel local first, then relative paths
            const lang = this.currentLanguage || this.fallbackLanguage;
            const candidates = [
                `_locales/${lang}/messages.json`,
                `/_locales/${lang}/messages.json`,
                `../../_locales/${lang}/messages.json`,
                `../_locales/${lang}/messages.json`
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
        const message = this.translations[this.currentLanguage]?.[key] 
            || this.translations[this.fallbackLanguage]?.[key]
            || key;

        if (!substitutions) return message;

        return message.replace(/\{(\d+)\}/g, (match, index) => {
            return substitutions[index] !== undefined ? substitutions[index] : match;
        });
    }

    // Helper method to update UI elements
    updateElements(elements, keyAttribute = 'data-i18n-key') {
        elements.forEach(element => {
            const key = element.getAttribute(keyAttribute) || element.getAttribute('data-i18n');
            if (key) {
                const translation = this.getMessage(key);
                if (translation) {
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
                }
            }
        });
    }

    // Refresh all translations in the UI
    refreshUI() {
        const elements = document.querySelectorAll('[data-i18n],[data-i18n-key]');
        this.updateElements(elements, 'data-i18n-key');
        // Apply placeholders separately
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const k = el.getAttribute('data-i18n-placeholder');
            const t = this.getMessage(k);
            if (t && el.placeholder !== undefined) el.placeholder = t;
        });
        window.dispatchEvent(new CustomEvent('i18n:refreshed', { detail: { language: this.currentLanguage } }));
    }

    getFallbackTranslations() {
        return {
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
                
                // Profile & Password
                'account_security': '账户安全',
                'change_password': '修改密码',
                'password_settings': '密码设置',
                'current_password': '当前密码',
                'new_password': '新密码',
                'confirm_new_password': '确认新密码',
                'enter_current_password': '输入当前密码',
                'enter_new_password': '输入新密码',
                'confirm_new_password_placeholder': '确认新密码',
                'two_factor_auth': '双因素认证',
                
                // User Management
                'user_name': '用户名',
                'user_role': '角色',
                'user_status': '状态',
                'user_actions': '操作',
                'add_user_btn': '添加用户',
                'view_all': '查看全部',
                'admin_user': '管理员用户',
                'super_admin': '超级管理员',
                
                // Dashboard
                'active_users': '活跃用户',
                'blocked_items': '被阻止项目',
                'system_health': '系统健康',
                'new_this_week': '本周新增',
                'from_yesterday': '自昨天',
                'recent_activity_title': '最近活动',
                
                // Common
                'loading': '加载中...',
                'error': '错误',
                'success': '成功',
                'confirm': '确认',
                'delete': '删除',
                'edit': '编辑',
                'save_changes': '保存更改',
                'cancel': '取消'
            },
            en: {
                // Navigation
                'nav_dashboard': 'Dashboard',
                'nav_users': 'User Management',
                'nav_profile': 'Profile',
                'nav_security': 'Security',
                'nav_settings': 'Settings',
                'nav_analytics': 'Analytics',
                'nav_reports': 'Reports',
                
                // User Management
                'user_name': 'Username',
                'user_role': 'Role',
                'user_status': 'Status',
                'user_actions': 'Actions',
                
                // Profile
                'profile_title': 'Profile Settings',
                'save_changes': 'Save Changes',
                'cancel': 'Cancel',
                
                // Common
                'loading': 'Loading...',
                'error': 'Error',
                'success': 'Success',
                'confirm': 'Confirm',
                'delete': 'Delete',
                'edit': 'Edit'
            }
        };
    }
}

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

        // Initial UI refresh
        i18n.refreshUI();

        console.log('✅ I18nSystem initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize I18nSystem:', error);
    }
})();
// ST:TINI_1754716154_e868a412
// ST:TINI_1754752705_e868a412
