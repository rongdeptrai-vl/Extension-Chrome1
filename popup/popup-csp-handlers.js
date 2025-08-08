// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * 🛡️ TINI POPUP CSP HANDLERS v2.8
 * Content Security Policy compliant event handlers for popup
 * Trình xử lý tuân thủ CSP cho popup interface
 */

class TINIPopupCSPHandlers {
    constructor() {
        this.version = "2.8";
        this.handlers = new Map();
        this.eventCache = new WeakMap();
        this.securityContext = 'popup';
        
        this.initializeCSPHandlers();
    }
    
    initializeCSPHandlers() {
        console.log(`🛡️ [CSP] Initializing CSP Handlers v${this.version}`);
        
        // Setup secure event delegation
        this.setupSecureEventDelegation();
        
        // Register secure handlers
        this.registerSecureHandlers();
        
        // Setup security monitoring
        this.setupSecurityMonitoring();
        
        console.log('🛡️ [CSP] CSP handlers initialized');
    }
    
    setupSecureEventDelegation() {
        // Central event delegation to avoid inline handlers
        document.addEventListener('click', (event) => {
            this.handleSecureClick(event);
        });
        
        document.addEventListener('change', (event) => {
            this.handleSecureChange(event);
        });
        
        document.addEventListener('submit', (event) => {
            this.handleSecureSubmit(event);
        });
        
        document.addEventListener('keydown', (event) => {
            this.handleSecureKeydown(event);
        });
    }
    
    handleSecureClick(event) {
        const target = event.target;
        const action = target.getAttribute('data-action');
        const handler = target.getAttribute('data-handler');
        
        if (action) {
            event.preventDefault();
            this.executeSecureAction(action, target, event);
        } else if (handler) {
            event.preventDefault();
            this.executeSecureHandler(handler, target, event);
        }
        
        // Handle special elements
        if (target.classList.contains('tab-button')) {
            this.handleTabClick(target, event);
        } else if (target.classList.contains('action-button')) {
            this.handleActionButton(target, event);
        } else if (target.classList.contains('emergency-button')) {
            this.handleEmergencyButton(target, event);
        }
    }
    
    handleSecureChange(event) {
        const target = event.target;
        const changeAction = target.getAttribute('data-change-action');
        
        if (changeAction) {
            this.executeSecureAction(changeAction, target, event);
        }
        
        // Handle toggle switches
        if (target.type === 'checkbox' && target.classList.contains('toggle-switch')) {
            this.handleToggleChange(target, event);
        }
        
        // Handle select dropdowns
        if (target.tagName === 'SELECT') {
            this.handleSelectChange(target, event);
        }
    }
    
    handleSecureSubmit(event) {
        const form = event.target;
        const submitAction = form.getAttribute('data-submit-action');
        
        if (submitAction) {
            event.preventDefault();
            this.executeSecureAction(submitAction, form, event);
        }
    }
    
    handleSecureKeydown(event) {
        // Handle keyboard shortcuts securely
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'e':
                    event.preventDefault();
                    this.executeSecureAction('toggleEmergency', event.target, event);
                    break;
                case 's':
                    event.preventDefault();
                    this.executeSecureAction('runScan', event.target, event);
                    break;
                case 'r':
                    event.preventDefault();
                    this.executeSecureAction('refreshStats', event.target, event);
                    break;
            }
        }
        
        // ESC key handling
        if (event.key === 'Escape') {
            this.executeSecureAction('closeModals', event.target, event);
        }
    }
    
    executeSecureAction(action, element, event) {
        // Validate action against whitelist
        if (!this.isActionSecure(action)) {
            console.warn(`🛡️ [CSP] Blocked insecure action: ${action}`);
            return;
        }
        
        try {
            switch (action) {
                case 'switchTab':
                    this.secureTabSwitch(element, event);
                    break;
                case 'toggleFeature':
                    this.secureFeatureToggle(element, event);
                    break;
                case 'runSystemScan':
                    this.secureSystemScan(element, event);
                    break;
                case 'clearCache':
                    this.secureClearCache(element, event);
                    break;
                case 'openAdminPanel':
                    this.secureOpenAdmin(element, event);
                    break;
                case 'toggleEmergency':
                    this.secureEmergencyToggle(element, event);
                    break;
                case 'exportSettings':
                    this.secureExportSettings(element, event);
                    break;
                case 'importSettings':
                    this.secureImportSettings(element, event);
                    break;
                case 'resetSettings':
                    this.secureResetSettings(element, event);
                    break;
                case 'refreshStats':
                    this.secureRefreshStats(element, event);
                    break;
                case 'closeModals':
                    this.secureCloseModals(element, event);
                    break;
                default:
                    console.warn(`🛡️ [CSP] Unknown action: ${action}`);
            }
        } catch (error) {
            console.error(`🛡️ [CSP] Error executing action ${action}:`, error);
            this.reportSecurityEvent('action_execution_error', { action, error: error.message });
        }
    }
    
    executeSecureHandler(handlerName, element, event) {
        const handler = this.handlers.get(handlerName);
        
        if (handler && typeof handler === 'function') {
            try {
                handler.call(this, element, event);
            } catch (error) {
                console.error(`🛡️ [CSP] Handler execution error: ${handlerName}`, error);
                this.reportSecurityEvent('handler_execution_error', { handler: handlerName, error: error.message });
            }
        } else {
            console.warn(`🛡️ [CSP] Handler not found: ${handlerName}`);
        }
    }
    
    isActionSecure(action) {
        const secureActions = [
            'switchTab', 'toggleFeature', 'runSystemScan', 'clearCache',
            'openAdminPanel', 'toggleEmergency', 'exportSettings',
            'importSettings', 'resetSettings', 'refreshStats', 'closeModals'
        ];
        
        return secureActions.includes(action);
    }
    
    registerSecureHandlers() {
        // Register all popup handlers securely
        this.handlers.set('tabNavigation', this.createTabNavigationHandler());
        this.handlers.set('featureToggle', this.createFeatureToggleHandler());
        this.handlers.set('systemAction', this.createSystemActionHandler());
        this.handlers.set('settingsAction', this.createSettingsActionHandler());
        this.handlers.set('emergencyAction', this.createEmergencyActionHandler());
    }
    
    createTabNavigationHandler() {
        return (element, event) => {
            const tabName = element.getAttribute('data-tab');
            if (tabName) {
                this.secureTabSwitch(element, event);
            }
        };
    }
    
    createFeatureToggleHandler() {
        return (element, event) => {
            const feature = element.getAttribute('data-feature');
            const enabled = element.checked;
            
            if (feature) {
                this.secureFeatureToggle(element, event);
            }
        };
    }
    
    createSystemActionHandler() {
        return (element, event) => {
            const actionType = element.getAttribute('data-system-action');
            
            switch (actionType) {
                case 'scan':
                    this.secureSystemScan(element, event);
                    break;
                case 'cache':
                    this.secureClearCache(element, event);
                    break;
                case 'admin':
                    this.secureOpenAdmin(element, event);
                    break;
            }
        };
    }
    
    createSettingsActionHandler() {
        return (element, event) => {
            const settingsAction = element.getAttribute('data-settings-action');
            
            switch (settingsAction) {
                case 'export':
                    this.secureExportSettings(element, event);
                    break;
                case 'import':
                    this.secureImportSettings(element, event);
                    break;
                case 'reset':
                    this.secureResetSettings(element, event);
                    break;
            }
        };
    }
    
    createEmergencyActionHandler() {
        return (element, event) => {
            this.secureEmergencyToggle(element, event);
        };
    }
    
    // Secure action implementations
    secureTabSwitch(element, event) {
        const tabName = element.getAttribute('data-tab') || 
                       element.textContent.toLowerCase().replace(/[^a-z]/g, '');
        
        if (window.tiniPopupController) {
            window.tiniPopupController.switchTab(tabName);
        }
        
        this.reportSecurityEvent('tab_switch', { tab: tabName });
    }
    
    secureFeatureToggle(element, event) {
        const feature = element.getAttribute('data-feature') || element.id;
        const enabled = element.checked;
        
        if (window.tiniPopupController) {
            window.tiniPopupController.updateTINISystem(feature, enabled);
        }
        
        this.reportSecurityEvent('feature_toggle', { feature, enabled });
    }
    
    async secureSystemScan(element, event) {
        this.setElementLoading(element, true);
        
        try {
            if (window.tiniPopupController) {
                await window.tiniPopupController.runSystemScan();
            }
        } finally {
            this.setElementLoading(element, false);
        }
        
        this.reportSecurityEvent('system_scan', {});
    }
    
    async secureClearCache(element, event) {
        this.setElementLoading(element, true);
        
        try {
            if (window.tiniPopupController) {
                await window.tiniPopupController.clearCache();
            }
        } finally {
            this.setElementLoading(element, false);
        }
        
        this.reportSecurityEvent('cache_clear', {});
    }
    
    async secureOpenAdmin(element, event) {
        try {
            if (window.tiniPopupController) {
                await window.tiniPopupController.openAdminPanel();
            }
        } catch (error) {
            console.error('🛡️ [CSP] Failed to open admin panel:', error);
        }
        
        this.reportSecurityEvent('admin_panel_open', {});
    }
    
    async secureEmergencyToggle(element, event) {
        try {
            if (window.tiniPopupController) {
                await window.tiniPopupController.toggleEmergencyMode();
            }
        } catch (error) {
            console.error('🛡️ [CSP] Emergency toggle failed:', error);
        }
        
        this.reportSecurityEvent('emergency_toggle', {});
    }
    
    secureExportSettings(element, event) {
        try {
            if (window.tiniPopupController) {
                window.tiniPopupController.exportSettings();
            }
        } catch (error) {
            console.error('🛡️ [CSP] Settings export failed:', error);
        }
        
        this.reportSecurityEvent('settings_export', {});
    }
    
    secureImportSettings(element, event) {
        try {
            if (window.tiniPopupController) {
                window.tiniPopupController.importSettings();
            }
        } catch (error) {
            console.error('🛡️ [CSP] Settings import failed:', error);
        }
        
        this.reportSecurityEvent('settings_import', {});
    }
    
    secureResetSettings(element, event) {
        try {
            if (window.tiniPopupController) {
                window.tiniPopupController.resetToDefaults();
            }
        } catch (error) {
            console.error('🛡️ [CSP] Settings reset failed:', error);
        }
        
        this.reportSecurityEvent('settings_reset', {});
    }
    
    secureRefreshStats(element, event) {
        try {
            if (window.tiniPopupController) {
                window.tiniPopupController.loadStatistics();
            }
        } catch (error) {
            console.error('🛡️ [CSP] Stats refresh failed:', error);
        }
        
        this.reportSecurityEvent('stats_refresh', {});
    }
    
    secureCloseModals(element, event) {
        // Close any open modals or dialogs
        const modals = document.querySelectorAll('.modal.active, .dialog.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        
        this.reportSecurityEvent('modals_closed', { count: modals.length });
    }
    
    // UI helper methods
    handleTabClick(element, event) {
        event.preventDefault();
        this.secureTabSwitch(element, event);
    }
    
    handleActionButton(element, event) {
        event.preventDefault();
        const action = element.getAttribute('data-action');
        if (action) {
            this.executeSecureAction(action, element, event);
        }
    }
    
    handleEmergencyButton(element, event) {
        event.preventDefault();
        this.secureEmergencyToggle(element, event);
    }
    
    handleToggleChange(element, event) {
        this.secureFeatureToggle(element, event);
    }
    
    handleSelectChange(element, event) {
        const changeAction = element.getAttribute('data-change-action');
        if (changeAction) {
            this.executeSecureAction(changeAction, element, event);
        }
    }
    
    setElementLoading(element, loading) {
        if (loading) {
            element.classList.add('loading');
            element.disabled = true;
            const originalText = element.textContent;
            element.setAttribute('data-original-text', originalText);
            element.textContent = 'Loading...';
        } else {
            element.classList.remove('loading');
            element.disabled = false;
            const originalText = element.getAttribute('data-original-text');
            if (originalText) {
                element.textContent = originalText;
                element.removeAttribute('data-original-text');
            }
        }
    }
    
    setupSecurityMonitoring() {
        // Monitor for potential CSP violations
        document.addEventListener('securitypolicyviolation', (event) => {
            console.warn('🛡️ [CSP] Security policy violation:', event);
            this.reportSecurityEvent('csp_violation', {
                blockedURI: event.blockedURI,
                violatedDirective: event.violatedDirective,
                originalPolicy: event.originalPolicy
            });
        });
        
        // Monitor for inline script attempts
        this.monitorInlineScripts();
    }
    
    monitorInlineScripts() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'SCRIPT' && node.innerHTML.trim()) {
                        console.warn('🛡️ [CSP] Inline script detected and blocked');
                        node.remove();
                        this.reportSecurityEvent('inline_script_blocked', {
                            content: node.innerHTML.substring(0, 100)
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    reportSecurityEvent(eventType, data) {
        const securityEvent = {
            type: 'SECURITY_EVENT',
            eventType: eventType,
            timestamp: new Date().toISOString(),
            context: this.securityContext,
            data: data,
            userAgent: navigator.userAgent
        };
        
        // Send to background script for logging
        if (chrome && chrome.runtime) {
            chrome.runtime.sendMessage(securityEvent).catch(err => {
                console.warn('🛡️ [CSP] Failed to report security event:', err);
            });
        }
        
        console.log('🛡️ [CSP] Security event:', securityEvent);
    }
    
    // Public API for secure element creation
    createSecureButton(text, action, className = '') {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `secure-button ${className}`;
        button.setAttribute('data-action', action);
        return button;
    }
    
    createSecureToggle(feature, checked = false) {
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.className = 'toggle-switch secure-toggle';
        toggle.checked = checked;
        toggle.setAttribute('data-feature', feature);
        return toggle;
    }
    
    createSecureTab(tabName, text) {
        const tab = document.createElement('button');
        tab.textContent = text;
        tab.className = 'tab-button secure-tab';
        tab.setAttribute('data-tab', tabName);
        return tab;
    }
    
    // Cleanup
    destroy() {
        this.handlers.clear();
        console.log('🛡️ [CSP] CSP handlers destroyed');
    }
}

// Initialize CSP handlers
document.addEventListener('DOMContentLoaded', () => {
    window.tiniCSPHandlers = new TINIPopupCSPHandlers();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIPopupCSPHandlers;
}

console.log('🛡️ [CSP] CSP handlers loaded');
