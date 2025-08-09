// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
export const API_CONFIG = {
    BASE_URL: process.env.API_URL || `http://localhost:${process.env.PORT || process.env.PANEL_PORT || 55055}/api`,
    ENDPOINTS: {
        SAVE_LANGUAGE: '/save-language',
        LOAD_PROFILE: '/load-profile',
        SAVE_PROFILE: '/save-profile',
        UPDATE_AVATAR: '/update-avatar',
        USER_MANAGEMENT: {
            LIST: '/users/list',
            CREATE: '/users/create',
            UPDATE: '/users/update',
            DELETE: '/users/delete'
        },
        SECURITY: {
            CHECK_STATUS: '/security/status',
            UPDATE_SETTINGS: '/security/settings'
        }
    },
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
};

// Helper function for building URLs
function getApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Export configuration
window.API_CONFIG = API_CONFIG;
window.getApiUrl = getApiUrl;
// ST:TINI_1754752705_e868a412
