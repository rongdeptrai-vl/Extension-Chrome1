// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Emergency CSP Fix for TINI Extension
// Handles Content Security Policy issues and ensures script execution

(function() {
    'use strict';
    
    // CSP Emergency Handler
    class EmergencyCSPFix {
        constructor() {
            this.init();
        }
        
        init() {
            this.fixInlineScripts();
            this.handleCSPViolations();
            this.setupErrorHandling();
        }
        
        fixInlineScripts() {
            // Fix inline script execution issues
            const scripts = document.querySelectorAll('script[src]');
            scripts.forEach(script => {
                if (!script.hasAttribute('data-csp-fixed')) {
                    script.setAttribute('data-csp-fixed', 'true');
                    this.ensureScriptExecution(script);
                }
            });
        }
        
        ensureScriptExecution(script) {
            script.addEventListener('error', (e) => {
                console.warn('CSP Script error:', e);
                this.retryScriptLoad(script);
            });
        }
        
        retryScriptLoad(script) {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            newScript.setAttribute('data-csp-retry', 'true');
            
            // Remove old script and add new one
            script.parentNode.removeChild(script);
            document.head.appendChild(newScript);
        }
        
        handleCSPViolations() {
            document.addEventListener('securitypolicyviolation', (e) => {
                console.warn('CSP Violation:', e.violatedDirective, e.blockedURI);
                this.reportCSPViolation(e);
            });
        }
        
        reportCSPViolation(event) {
            // Log CSP violations for debugging
            const violation = {
                directive: event.violatedDirective,
                blocked: event.blockedURI,
                document: event.documentURI,
                timestamp: Date.now()
            };
            
            localStorage.setItem('tini_csp_violations', 
                JSON.stringify([...this.getStoredViolations(), violation].slice(-10))
            );
        }
        
        getStoredViolations() {
            try {
                return JSON.parse(localStorage.getItem('tini_csp_violations') || '[]');
            } catch {
                return [];
            }
        }
        
        setupErrorHandling() {
            window.addEventListener('error', (e) => {
                if (e.message.includes('CSP') || e.message.includes('Content Security Policy')) {
                    console.warn('CSP-related error detected:', e.message);
                    this.handleCSPError(e);
                }
            });
        }
        
        handleCSPError(error) {
            // Attempt to recover from CSP errors
            if (error.filename && error.filename.includes('.js')) {
                console.log('Attempting to recover from CSP error for:', error.filename);
                // Could implement recovery logic here
            }
        }
    }
    
    // Initialize CSP fix when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new EmergencyCSPFix();
        });
    } else {
        new EmergencyCSPFix();
    }
    
    // Export for other scripts
    window.EmergencyCSPFix = EmergencyCSPFix;
    
})();
