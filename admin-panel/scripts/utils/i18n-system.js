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
        this.currentLanguage = window.secureStorage.get('adminLanguage', 'zh');
        this.translations = {};
        this.fallbackLanguage = 'zh';
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
            } else if (window.tiniI18n) {
                this.provider = 'tini';
                // Keep our translations as fallback for tiniI18n
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
            if (cached) {
                this.translations = JSON.parse(cached);
                return;
            }

            // Load from local _locales folder
            // Đường dẫn đúng tới thư mục _locales ở cấp extension root
            const translationsPath = `../../_locales/${this.currentLanguage}/messages.json`;
            const response = await fetch(translationsPath);
            this.translations = await response.json();
            
            // Cache translations
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
                    return window.tiniI18n.getMessage(key, substitutions);
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
            const key = element.getAttribute(keyAttribute);
            if (key) {
                const translation = this.getMessage(key);
                if (translation) {
                    if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                        element.placeholder = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            }
        });
    }

    // Refresh all translations in the UI
    refreshUI() {
        const elements = document.querySelectorAll('[data-i18n-key]');
        this.updateElements(elements);

        window.dispatchEvent(new CustomEvent('i18n:refreshed', {
            detail: { language: this.currentLanguage }
        }));
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
                
                // User Management
                'user_name': '用户名',
                'user_role': '角色',
                'user_status': '状态',
                'user_actions': '操作',
                
                // Profile
                'profile_title': '个人资料',
                'save_changes': '保存更改',
                'cancel': '取消',
                
                // Common
                'loading': '加载中...',
                'error': '错误',
                'success': '成功',
                'confirm': '确认',
                'delete': '删除',
                'edit': '编辑'
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
