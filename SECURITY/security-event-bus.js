// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI Security Event Bus v1.0
 * Hệ thống trung chuyển sự kiện an ninh nội bộ.
 *
 * Đây là "kênh bộ đàm" trung tâm cho tất cả các module bảo mật.
 * Các module sẽ "phát" (emit) các sự kiện khi phát hiện điều gì đó,
 * và "lắng nghe" (on) các sự kiện từ các module khác hoặc từ AI chỉ huy.
 *
 * @version 1.0
 */

(function() {
    'use strict';

    console.log('📡 [BUS] Initializing TINI Security Event Bus...');

    class SecurityEventBus {
        constructor() {
            // Nơi lưu trữ tất cả các sự kiện và các hàm lắng nghe tương ứng.
            // Ví dụ: { 'tini:block-ip': [function1, function2] }
            this.events = {};
        }

        /**
         * Đăng ký lắng nghe một sự kiện.
         * @param {string} eventName - Tên của sự kiện (ví dụ: 'tini:block-ip').
         * @param {function} listener - Hàm sẽ được gọi khi sự kiện được phát ra.
         */
        on(eventName, listener) {
            if (!this.events[eventName]) {
                this.events[eventName] = [];
            }
            this.events[eventName].push(listener);
            console.log(`📡 [BUS] Listener registered for event: ${eventName}`);
        }

        /**
         * Phát ra một sự kiện để các module khác lắng nghe.
         * @param {string} eventName - Tên của sự kiện.
         * @param {object} payload - Dữ liệu đi kèm với sự kiện (ví dụ: { ip: '1.2.3.4' }).
         */
        emit(eventName, payload) {
            console.log(`📡 [BUS] Emitting event: ${eventName}`, payload || '');
            if (this.events[eventName]) {
                this.events[eventName].forEach(listener => {
                    try {
                        listener(payload);
                    } catch (error) {
                        console.error(`📡 [BUS] Error in listener for event ${eventName}:`, error);
                    }
                });
            }
        }

        /**
         * Hủy đăng ký lắng nghe một sự kiện.
         * @param {string} eventName - Tên của sự kiện.
         * @param {function} listenerToRemove - Hàm lắng nghe cần được xóa.
         */
        off(eventName, listenerToRemove) {
            if (!this.events[eventName]) {
                return;
            }

            this.events[eventName] = this.events[eventName].filter(
                listener => listener !== listenerToRemove
            );
            console.log(`📡 [BUS] Listener removed for event: ${eventName}`);
        }
    }

    // Tạo một thực thể duy nhất của Event Bus và gắn nó vào đối tượng window
    // để tất cả các script khác có thể truy cập một cách dễ dàng.
    if (!window.TINI_SECURITY_BUS) {
        window.TINI_SECURITY_BUS = new SecurityEventBus();
        console.log('✅ [BUS] TINI Security Event Bus is now live.');
    }

})();
