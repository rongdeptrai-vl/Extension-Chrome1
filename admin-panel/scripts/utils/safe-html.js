// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
class SafeHtmlUtil {
    constructor() {
        // Load DOMPurify if available
        this.purifier = window.DOMPurify || null;
        this.allowedTags = ['b', 'i', 'em', 'strong', 'span', 'div', 'p', 'br'];
        this.allowedAttributes = ['class', 'id', 'style'];
    }

    setHTML(element, html) {
        if (!element) return false;

        try {
            // Use secureSetHTML if available
            if (window.secureSetHTML) {
                return window.secureSetHTML(element, html);
            }

            // Use DOMPurify if available
            if (this.purifier) {
                element.innerHTML = this.purifier.sanitize(html, {
                    ALLOWED_TAGS: this.allowedTags,
                    ALLOWED_ATTR: this.allowedAttributes
                });
                return true;
            }

            // Fallback: Basic HTML sanitization
            const sanitized = this.basicSanitize(html);
            element.innerHTML = sanitized;
            return true;

        } catch (error) {
            console.error('❌ Error setting safe HTML:', error);
            // Ultimate fallback: Plain text
            element.textContent = this.stripHtml(html);
            return false;
        }
    }

    basicSanitize(html) {
        // Remove potentially dangerous tags and attributes
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/(on\w+)="[^"]*"/g, '')
            .replace(/(on\w+)='[^']*'/g, '');
    }

    stripHtml(html) {
        return String(html).replace(/<[^>]*>/g, '');
    }

    // Safe method to set text content
    setText(element, text) {
        if (!element) return false;
        try {
            element.textContent = text;
            return true;
        } catch (error) {
            console.error('❌ Error setting text:', error);
            return false;
        }
    }
}

// Initialize singleton instance
window.safeHtml = new SafeHtmlUtil();
