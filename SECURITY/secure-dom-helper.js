// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8d90861 | Time: 2025-08-16T16:29:42Z
// Watermark: TINI_1755361782_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🛡️ SECURE DOM HELPER - TINI SECURITY
 * Safe DOM manipulation without innerHTML vulnerabilities
 */

class SecureDOMHelper {
    constructor() {
        this.version = '1.0';
        console.log('🛡️ SECURE DOM HELPER LOADED - innerHTML vulnerabilities prevented!');
    }

    /**
     * Safely set SVG content without innerHTML injection risks
     * @param {HTMLElement} container - Target container element
     * @param {string} svgContent - SVG content to insert
     */
    setSafeSVGContent(container, svgContent) {
        if (!container || typeof svgContent !== 'string') {
            console.warn('🚨 [SECURE-DOM] Invalid parameters provided');
            return false;
        }

        try {
            // Parse and sanitize SVG content
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgContent, 'image/svg+xml');
            
            // Check for parsing errors
            const parseError = doc.querySelector('parsererror');
            if (parseError) {
                console.error('🚨 [SECURE-DOM] SVG parsing error:', parseError.textContent);
                return false;
            }

            // Extract the SVG element
            const svgElement = doc.documentElement;
            
            // Validate it's actually an SVG
            if (svgElement.tagName.toLowerCase() !== 'svg') {
                console.error('🚨 [SECURE-DOM] Content is not valid SVG');
                return false;
            }

            // Remove any potentially dangerous attributes
            this.sanitizeSVGElement(svgElement);

            // Clear container safely and append the sanitized SVG
            this.clearContainer(container);
            const importedSVG = document.importNode(svgElement, true);
            container.appendChild(importedSVG);

            return true;
        } catch (error) {
            console.error('🚨 [SECURE-DOM] Error setting SVG content:', error);
            return false;
        }
    }

    /**
     * Safely clear container content
     * @param {HTMLElement} container - Container to clear
     */
    clearContainer(container) {
        if (!container) return;
        
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    /**
     * Sanitize SVG element by removing dangerous attributes
     * @param {Element} svgElement - SVG element to sanitize
     */
    sanitizeSVGElement(svgElement) {
        const dangerousAttributes = [
            'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
            'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
            'onselect', 'onkeydown', 'onkeypress', 'onkeyup',
            'onabort', 'oncanplay', 'oncanplaythrough', 'ondurationchange',
            'onemptied', 'onended', 'onloadeddata', 'onloadedmetadata',
            'onloadstart', 'onpause', 'onplay', 'onplaying', 'onprogress',
            'onratechange', 'onseeked', 'onseeking', 'onstalled', 'onsuspend',
            'ontimeupdate', 'onvolumechange', 'onwaiting'
        ];

        const removeAttributes = (element) => {
            dangerousAttributes.forEach(attr => {
                if (element.hasAttribute(attr)) {
                    element.removeAttribute(attr);
                    console.warn(`🛡️ [SECURE-DOM] Removed dangerous attribute: ${attr}`);
                }
            });

            // Recursively sanitize child elements
            Array.from(element.children).forEach(child => {
                removeAttributes(child);
            });
        };

        removeAttributes(svgElement);
    }

    /**
     * Safely set text content (XSS safe)
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text content to set
     */
    setSafeTextContent(element, text) {
        if (!element || typeof text !== 'string') {
            console.warn('🚨 [SECURE-DOM] Invalid parameters for text content');
            return false;
        }

        try {
            element.textContent = text; // textContent is XSS safe
            return true;
        } catch (error) {
            console.error('🚨 [SECURE-DOM] Error setting text content:', error);
            return false;
        }
    }

    /**
     * Create safe HTML elements without injection risks
     * @param {string} tagName - Tag name for the element
     * @param {Object} attributes - Safe attributes to set
     * @param {string} textContent - Text content (optional)
     */
    createSafeElement(tagName, attributes = {}, textContent = '') {
        try {
            const element = document.createElement(tagName);
            
            // Set safe attributes
            Object.entries(attributes).forEach(([key, value]) => {
                if (this.isSafeAttribute(key)) {
                    element.setAttribute(key, value);
                } else {
                    console.warn(`🛡️ [SECURE-DOM] Skipped unsafe attribute: ${key}`);
                }
            });

            if (textContent) {
                element.textContent = textContent;
            }

            return element;
        } catch (error) {
            console.error('🚨 [SECURE-DOM] Error creating element:', error);
            return null;
        }
    }

    /**
     * Check if an attribute is safe to use
     * @param {string} attributeName - Name of the attribute
     */
    isSafeAttribute(attributeName) {
        const safeAttributes = [
            'id', 'class', 'data-', 'aria-', 'role', 'title', 'alt',
            'src', 'href', 'width', 'height', 'style', 'type',
            'name', 'value', 'placeholder', 'disabled', 'readonly'
        ];

        return safeAttributes.some(safe => 
            attributeName === safe || attributeName.startsWith(safe)
        ) && !this.isEventAttribute(attributeName);
    }

    /**
     * Check if attribute is an event handler
     * @param {string} attributeName - Name of the attribute
     */
    isEventAttribute(attributeName) {
        return attributeName.toLowerCase().startsWith('on');
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureDOMHelper;
} else if (typeof window !== 'undefined') {
    window.SecureDOMHelper = SecureDOMHelper;
    window.secureDOMHelper = new SecureDOMHelper();
}
