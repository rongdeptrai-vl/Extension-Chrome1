// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
class SecureStorageUtil {
    constructor() {
        this.tiniSystem = window.TINI_SYSTEM?.utils?.secureStorage;
        this.secureStorage = window.secureGetStorage && window.secureSetStorage;
    }

    get(key, defaultValue = null) {
        try {
            return (
                this.tiniSystem?.get(key) ||
                (this.secureStorage && window.secureGetStorage(key)) ||
                localStorage.getItem(key) ||
                defaultValue
            );
        } catch (error) {
            console.error(`❌ Error getting key ${key}:`, error);
            return defaultValue;
        }
    }

    set(key, value) {
        try {
            if (this.tiniSystem) {
                this.tiniSystem.set(key, value);
            }
            if (this.secureStorage) {
                window.secureSetStorage(key, value);
            }
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error(`❌ Error setting key ${key}:`, error);
            return false;
        }
    }

    remove(key) {
        try {
            if (this.tiniSystem) {
                this.tiniSystem.remove(key);
            }
            if (this.secureStorage) {
                window.secureSetStorage(key, null);
            }
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`❌ Error removing key ${key}:`, error);
            return false;
        }
    }
}

// Initialize singleton instance
window.secureStorage = new SecureStorageUtil();
