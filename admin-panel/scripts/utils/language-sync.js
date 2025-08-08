// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Ensure API_CONFIG exists to avoid ReferenceError
const API_CONFIG = window.API_CONFIG || { ENDPOINTS: { LOG_SERVER: '/log' } };
// Stub queue class for language sync tasks
class LanguageQueue {
    constructor() { this.items = []; }
    enqueue(fn) { this.items.push(fn); }
    dequeue() { return this.items.shift(); }
    size() { return this.items.length; }
}
// Expose LanguageQueue globally
window.LanguageQueue = LanguageQueue;
// Stub admin endpoints for opening panel
const ADMIN_ENDPOINTS = {
    PRIMARY: '/admin',
    SECONDARY: '/admin-fallback',
    UNIFIED: '/admin-unified'
};
// Advanced Logging System
class Logger {
    static #instance;
    static #MAX_LOGS = 1000;
    
    constructor() {
        this.logs = [];
        this.serverEndpoint = API_CONFIG.ENDPOINTS.LOG_SERVER;
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new Logger();
        }
        return this.#instance;
    }

    log(level, message, data = {}) {
        const entry = {
            timestamp: Date.now(),
            level,
            component: 'LANG-SYNC',
            message,
            data
        };

        this.logs.push(entry);
        if (this.logs.length > Logger.#MAX_LOGS) {
            this.logs.shift();
        }

        // Console output với màu
        const emoji = {
            debug: '🐛',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            fatal: '💀'
        };

        console[level === 'fatal' ? 'error' : level]
            (`${emoji[level]} [${entry.component}] ${message}`);

        // Gửi error logs về server
        if (level === 'error' || level === 'fatal') {
            this.reportToServer(entry);
        }
    }

    async reportToServer(entry) {
        try {
            await fetch(this.serverEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });
        } catch (err) {
            console.error('Failed to send log to server:', err);
        }
    }

    debug(msg, data) { this.log('debug', msg, data); }
    info(msg, data) { this.log('info', msg, data); }
    warn(msg, data) { this.log('warn', msg, data); }
    error(msg, data) { this.log('error', msg, data); }
    fatal(msg, data) { this.log('fatal', msg, data); }
}

// Singleton instance
const logger = Logger.getInstance();

// Language sync states with metadata
const SyncState = {
    IDLE: {
        code: 'idle',
        canRetry: false,
        description: 'System is idle'
    },
    SYNCING: {
        code: 'syncing',
        canRetry: false,
        description: 'Synchronization in progress'
    },
    ERROR: {
        code: 'error',
        canRetry: true,
        description: 'Error occurred during sync'
    },
    SUCCESS: {
        code: 'success',
        canRetry: false,
        description: 'Sync completed successfully'
    }
};

// Cache Manager for translations
class TranslationCache {
    constructor(timeout = 30 * 60 * 1000) { // 30 minutes default
        this.cache = new Map();
        this.timeout = timeout;
    }

    set(lang, data) {
        this.cache.set(lang, {
            timestamp: Date.now(),
            data
        });
    }

    get(lang) {
        const cached = this.cache.get(lang);
        if (!cached) return null;
        if (this.isExpired(lang)) {
            this.cache.delete(lang);
            return null;
        }
        return cached.data;
    }

    isExpired(lang) {
        const cached = this.cache.get(lang);
        return cached && (Date.now() - cached.timestamp > this.timeout);
    }

    clear() {
        this.cache.clear();
    }
}

class LanguageSyncManager {
    constructor(config = {}) {
        try {
            this.queue = new LanguageQueue();
        } catch (e) {
            console.warn('LanguageQueue not available:', e.message);
            this.queue = null;
        }
        this.retryAttempts = config.retryAttempts || 3;
        this.retryDelay = config.retryDelay || 1000;
        this.state = SyncState.IDLE;
        this.cache = new TranslationCache(config.cacheTimeout);
        this.lastSync = null;
        this.syncHistory = [];
        
        function openAdminPanel() {
          // Thử endpoint chính trước
          tryEndpoint(ADMIN_ENDPOINTS.PRIMARY)
            .catch(() => tryEndpoint(ADMIN_ENDPOINTS.SECONDARY))
            .catch(() => tryEndpoint(ADMIN_ENDPOINTS.UNIFIED))
            .catch(showInlineAdminPanel);
        }
        this.lastSync = null;
        this.syncHistory = [];

        // Thêm listener cho online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    handleOnline() {
        Logger.info('🌐 Network connection restored - checking for pending syncs');
        if (this.state === SyncState.ERROR) {
            this.retryFailedSync();
        }
    }

    handleOffline() {
        Logger.info('📴 Network connection lost - queuing syncs');
        this.state = SyncState.ERROR;
    }

    async retryFailedSync() {
        if (this.syncHistory.length === 0) return;
        
        const lastSync = this.syncHistory[this.syncHistory.length - 1];
        if (lastSync.status === 'error') {
            Logger.info(`🔄 Retrying failed sync for language: ${lastSync.langCode}`);
            await this.syncWithServer(lastSync.langCode, lastSync.userId);
        }
    }

    async syncWithServer(langCode, userId) {
        logger.info(`Starting sync for language: ${langCode}`, { langCode, userId });
        this.state = SyncState.SYNCING.code;
        let attempts = 0;

        // Kiểm tra cache trước
        const cached = this.cache.get(langCode);
        if (cached) {
            logger.debug(`Using cached translations for ${langCode}`);
            return cached;
        }

        const sync = async () => {
            try {
                const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SAVE_LANGUAGE), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ language: langCode, userId })
                });

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }

                // Parse và validate response
                const translations = await response.json();
                this.validateTranslations(translations);

                // Cache kết quả
                this.cache.set(langCode, translations);

                // Cập nhật trạng thái thành công
                this.state = SyncState.SUCCESS.code;
                this.lastSync = {
                    timestamp: Date.now(),
                    langCode,
                    userId,
                    status: 'success',
                    translations: translations
                };
                this.syncHistory.push(this.lastSync);

                Logger.info(`✅ Language sync successful: ${langCode}`);
                return true;
            } catch (error) {
                Logger.error(`❌ Sync attempt ${attempts + 1} failed: ${error.message}`);
                attempts++;
                
                if (attempts < this.retryAttempts) {
                    const delay = this.retryDelay * attempts;
                    Logger.info(`⏳ Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return sync();
                }

                // Lưu lại sync thất bại để có thể thử lại sau
                this.state = SyncState.ERROR;
                this.lastSync = {
                    timestamp: Date.now(),
                    langCode,
                    userId,
                    status: 'error',
                    error: error.message
                };
                this.syncHistory.push(this.lastSync);

                throw error;
            }
        };

        return this.queue.add(sync);
    }

    async getServerLanguage(userId) {
        Logger.info(`📡 Fetching server language for user: ${userId}`);
        try {
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_LANGUAGE + '/' + userId));
            if (!response.ok) throw new Error('Failed to fetch server language');
            const data = await response.json();
            Logger.info(`✅ Server language fetched: ${data.language}`);
            return data.language;
        } catch (error) {
            Logger.error(`❌ Failed to get server language: ${error.message}`);
            return null;
        }
    }

    // Kiểm tra trạng thái đồng bộ
    getStatus() {
        return {
            state: this.state,
            lastSync: this.lastSync,
            pendingSyncs: this.queue.size(),
            history: this.syncHistory
        };
    }

    // Validation methods
    validateTranslations(translations) {
        if (!translations || typeof translations !== 'object') {
            throw new Error('Invalid translations format');
        }

        // Kiểm tra cấu trúc translation
        for (const [lang, messages] of Object.entries(translations)) {
            if (typeof messages !== 'object') {
                throw new Error(`Invalid messages format for language: ${lang}`);
            }

            // Kiểm tra từng message
            for (const [key, value] of Object.entries(messages)) {
                if (typeof value !== 'string') {
                    throw new Error(`Invalid message format for key: ${key} in language: ${lang}`);
                }
            }
        }
    }

    // Health check methods
    async checkHealth() {
        try {
            const healthStatus = {
                status: 'healthy',
                components: {
                    cache: this.checkCacheHealth(),
                    queue: this.checkQueueHealth(),
                    server: await this.checkServerHealth()
                },
                timestamp: Date.now()
            };

            // Tính toán overall status
            if (Object.values(healthStatus.components).some(c => c.status === 'error')) {
                healthStatus.status = 'error';
            } else if (Object.values(healthStatus.components).some(c => c.status === 'warning')) {
                healthStatus.status = 'warning';
            }

            return healthStatus;
        } catch (error) {
            logger.error('Health check failed', error);
            return {
                status: 'error',
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    checkCacheHealth() {
        return {
            status: 'healthy',
            size: this.cache.cache.size,
            oldestEntry: Math.min(...Array.from(this.cache.cache.values())
                .map(entry => entry.timestamp))
        };
    }

    checkQueueHealth() {
        return {
            status: this.queue.size() > 100 ? 'warning' : 'healthy',
            queueSize: this.queue.size(),
            lastProcessed: this.lastSync?.timestamp
        };
    }

    async checkServerHealth() {
        try {
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH_CHECK), {
                method: 'GET',
                timeout: 5000
            });

            return {
                status: response.ok ? 'healthy' : 'error',
                responseTime: response.headers.get('X-Response-Time'),
                lastChecked: Date.now()
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                lastChecked: Date.now()
            };
        }
    }

    // Xóa lịch sử sync cũ
    clearHistory() {
        this.syncHistory = this.syncHistory.slice(-10); // Giữ lại 10 sync gần nhất
    }
}

// Expose class globally for other scripts
window.LanguageSyncManager = LanguageSyncManager;
// Initialize singleton instance on window
window.languageSyncManager = new LanguageSyncManager({
    retryAttempts: 3,
    retryDelay: 1000,
    cacheTimeout: 30 * 60 * 1000 // 30 minutes
});
