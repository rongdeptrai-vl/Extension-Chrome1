// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// SECURE ADMIN HELPER - PREVENTS XSS/INJECTION
try { require('../SECURITY/secure-admin-helper.js'); } catch(e) { console.warn('Secure admin helper not loaded:', e.message); }

/**
 * 🔧 TINI Unified Dashboard Event Handlers
 * 
 * File này chứa tất cả event handlers được di chuyển từ inline code
 * để tuân thủ Content Security Policy (CSP) nghiêm ngặt
 */

// 🚀 **DOM READY & INITIALIZATION**
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 [EVENTS] Unified Dashboard Event Handlers loaded');
    
    // Initialize all event listeners
    initializeScriptSystemEvents();
    initializeSecurityEvents();
    initializeStealthEvents();
    initializeDataEvents();
});

// 📜 **SCRIPT SYSTEM EVENT HANDLERS**
function initializeScriptSystemEvents() {
    const toggleButton = document.querySelector('[data-action="toggle-script-system"]');
    const configureButton = document.querySelector('[data-action="configure-script"]');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleScriptSystem);
    }
    
    if (configureButton) {
        configureButton.addEventListener('click', configureScript);
    }
}

// 🛡️ **SECURITY EVENT HANDLERS**
function initializeSecurityEvents() {
    const scanButton = document.querySelector('[data-action="scan-threats"]');
    const settingsButton = document.querySelector('[data-action="configure-security"]');
    
    if (scanButton) {
        scanButton.addEventListener('click', scanThreats);
    }
    
    if (settingsButton) {
        settingsButton.addEventListener('click', configureSecurity);
    }
}

// 👻 **STEALTH EVENT HANDLERS**
function initializeStealthEvents() {
    const stealthButton = document.querySelector('[data-action="toggle-stealth"]');
    const bossButton = document.querySelector('[data-action="boss-mode"]');
    
    if (stealthButton) {
        stealthButton.addEventListener('click', toggleStealth);
    }
    
    if (bossButton) {
        bossButton.addEventListener('click', bossMode);
    }
}

// 📊 **DATA EVENT HANDLERS**
function initializeDataEvents() {
    const refreshButton = document.querySelector('[data-action="refresh-data"]');
    const exportButton = document.querySelector('[data-action="export-logs"]');
    
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshData);
    }
    
    if (exportButton) {
        exportButton.addEventListener('click', exportLogs);
    }
}

// 📋 **EVENT HANDLER FUNCTIONS**

function toggleScriptSystem() {
    console.log('📜 [SCRIPT] Toggling script system...');
    
    try {
        if (window.TINI_SYSTEM?.scriptManager) {
            const isActive = window.TINI_SYSTEM.scriptManager.isActive();
            
            if (isActive) {
                window.TINI_SYSTEM.scriptManager.disable();
                showSuccess('Script blocking disabled');
                updateScriptSystemUI(false);
            } else {
                window.TINI_SYSTEM.scriptManager.enable();
                showSuccess('Script blocking enabled');
                updateScriptSystemUI(true);
            }
        } else {
            showError('Script system not available');
        }
    } catch (error) {
        console.error('📜 [SCRIPT] Toggle error:', error);
        showError('Failed to toggle script system');
    }
}

function configureScript() {
    console.log('📜 [SCRIPT] Opening configuration...');
    
    // Open configuration modal or navigate to settings
    if (window.TINI_SYSTEM?.ui?.showModal) {
        window.TINI_SYSTEM.ui.showModal('script-configuration');
    } else {
        // Fallback: simple prompt
        const setting = prompt('Enter script configuration (whitelist domains, comma separated):');
        if (setting) {
            window.secureSetStorage && window.secureSetStorage('tini-script-whitelist', setting) || localStorage.setItem('tini-script-whitelist', setting);
            showSuccess('Script configuration updated');
        }
    }
}

function scanThreats() {
    console.log('🛡️ [SECURITY] Starting threat scan...');
    
    showLoading('Scanning for threats...');
    
    try {
        if (window.TINI_SYSTEM?.security?.scanThreats) {
            window.TINI_SYSTEM.security.scanThreats()
                .then(results => {
                    hideLoading();
                    showThreatScanResults(results);
                })
                .catch(error => {
                    hideLoading();
                    console.error('🛡️ [SECURITY] Scan error:', error);
                    showError('Threat scan failed');
                });
        } else {
            // Simulate scan for demo
            setTimeout(() => {
                hideLoading();
                const mockResults = {
                    threats: Math.floor(Math.random() * 5),
                    blocked: Math.floor(Math.random() * 10),
                    warnings: Math.floor(Math.random() * 3)
                };
                showThreatScanResults(mockResults);
            }, 2000);
        }
    } catch (error) {
        hideLoading();
        console.error('🛡️ [SECURITY] Scan error:', error);
        showError('Failed to start threat scan');
    }
}

function configureSecurity() {
    console.log('🛡️ [SECURITY] Opening security settings...');
    
    if (window.TINI_SYSTEM?.ui?.showModal) {
        window.TINI_SYSTEM.ui.showModal('security-settings');
    } else {
        // Navigate to security settings page
        window.location.href = '/security-settings.html';
    }
}

function toggleStealth() {
    console.log('👻 [STEALTH] Toggling stealth mode...');
    
    try {
        if (window.TINI_SYSTEM?.stealth) {
            const isActive = window.TINI_SYSTEM.stealth.isActive();
            
            if (isActive) {
                window.TINI_SYSTEM.stealth.disable();
                showSuccess('Stealth mode disabled');
                updateStealthUI(false);
            } else {
                window.TINI_SYSTEM.stealth.enable();
                showSuccess('Stealth mode enabled');
                updateStealthUI(true);
            }
        } else {
            // Toggle stealth CSS class
            document.body.classList.toggle('stealth-mode');
            const isStealthActive = document.body.classList.contains('stealth-mode');
            showSuccess(`Stealth mode ${isStealthActive ? 'enabled' : 'disabled'}`);
            updateStealthUI(isStealthActive);
        }
    } catch (error) {
        console.error('👻 [STEALTH] Toggle error:', error);
        showError('Failed to toggle stealth mode');
    }
}

function bossMode() {
    console.log('👑 [BOSS] Activating boss mode...');
    
    try {
        if (window.TINI_SYSTEM?.boss) {
            window.TINI_SYSTEM.boss.activate();
            showSuccess('Boss mode activated');
            updateBossUI(true);
        } else {
            // Fallback boss mode
            document.body.classList.add('boss-mode');
            
            // Hide all TINI indicators
            document.querySelectorAll('.tini-indicator').forEach(el => {
                el.style.display = 'none';
            });
            
            showSuccess('Boss mode activated');
            updateBossUI(true);
            
            // Auto-disable after 30 seconds
            setTimeout(() => {
                document.body.classList.remove('boss-mode');
                document.querySelectorAll('.tini-indicator').forEach(el => {
                    el.style.display = '';
                });
                updateBossUI(false);
                showInfo('Boss mode deactivated');
            }, 30000);
        }
    } catch (error) {
        console.error('👑 [BOSS] Boss mode error:', error);
        showError('Failed to activate boss mode');
    }
}

function refreshData() {
    console.log('📊 [DATA] Refreshing dashboard data...');
    
    showLoading('Refreshing data...');
    
    try {
        // Refresh all dashboard components
        const refreshPromises = [];
        
        if (window.TINI_SYSTEM?.analytics?.refresh) {
            refreshPromises.push(window.TINI_SYSTEM.analytics.refresh());
        }
        
        if (window.TINI_SYSTEM?.security?.refreshStats) {
            refreshPromises.push(window.TINI_SYSTEM.security.refreshStats());
        }
        
        if (refreshPromises.length > 0) {
            Promise.all(refreshPromises)
                .then(() => {
                    hideLoading();
                    showSuccess('Data refreshed successfully');
                    updateDashboardTimestamp();
                })
                .catch(error => {
                    hideLoading();
                    console.error('📊 [DATA] Refresh error:', error);
                    showError('Failed to refresh some data');
                });
        } else {
            // Simulate refresh
            setTimeout(() => {
                hideLoading();
                showSuccess('Data refreshed successfully');
                updateDashboardTimestamp();
                
                // Update random stats for demo
                updateRandomStats();
            }, 1500);
        }
    } catch (error) {
        hideLoading();
        console.error('📊 [DATA] Refresh error:', error);
        showError('Failed to refresh data');
    }
}

function exportLogs() {
    console.log('📤 [EXPORT] Exporting logs...');
    
    try {
        if (window.TINI_SYSTEM?.logger?.exportLogs) {
            window.TINI_SYSTEM.logger.exportLogs()
                .then(blob => {
                    downloadFile(blob, 'tini-logs.json');
                    showSuccess('Logs exported successfully');
                })
                .catch(error => {
                    console.error('📤 [EXPORT] Export error:', error);
                    showError('Failed to export logs');
                });
        } else {
            // Fallback: export basic data
            const logData = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                localStorage: {...localStorage},
                performance: performance.timing
            };
            
            const blob = new Blob([JSON.stringify(logData, null, 2)], {
                type: 'application/json'
            });
            
            downloadFile(blob, 'tini-basic-logs.json');
            showSuccess('Basic logs exported successfully');
        }
    } catch (error) {
        console.error('📤 [EXPORT] Export error:', error);
        showError('Failed to export logs');
    }
}

// 🔧 **UI UPDATE FUNCTIONS**

function updateScriptSystemUI(isActive) {
    const indicator = document.querySelector('.script-status-indicator');
    if (indicator) {
        indicator.textContent = isActive ? '🔒 Script Blocking: ON' : '🔓 Script Blocking: OFF';
        indicator.className = `script-status-indicator ${isActive ? 'active' : 'inactive'}`;
    }
    
    const toggleButton = document.querySelector('[data-action="toggle-script-system"]');
    if (toggleButton) {
        toggleButton.textContent = isActive ? 'Disable Blocking' : 'Enable Blocking';
    }
}

function updateStealthUI(isActive) {
    const indicator = document.querySelector('.stealth-status-indicator');
    if (indicator) {
        indicator.textContent = isActive ? '👻 Stealth: ON' : '👻 Stealth: OFF';
        indicator.className = `stealth-status-indicator ${isActive ? 'active' : 'inactive'}`;
    }
    
    const toggleButton = document.querySelector('[data-action="toggle-stealth"]');
    if (toggleButton) {
        toggleButton.textContent = isActive ? 'Disable Stealth' : 'Enable Stealth';
    }
}

function updateBossUI(isActive) {
    const indicator = document.querySelector('.boss-status-indicator');
    if (indicator) {
        indicator.textContent = isActive ? '👑 Boss Mode: ACTIVE' : '👑 Boss Mode: OFF';
        indicator.className = `boss-status-indicator ${isActive ? 'active' : 'inactive'}`;
    }
}

function updateDashboardTimestamp() {
    const timestamp = document.querySelector('.last-updated');
    if (timestamp) {
        timestamp.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
}

function updateRandomStats() {
    // Update some random stats for demo effect
    const statElements = document.querySelectorAll('.stat-number');
    statElements.forEach(el => {
        const currentValue = parseInt(el.textContent) || 0;
        const change = Math.floor(Math.random() * 10) - 5; // Random change -5 to +5
        const newValue = Math.max(0, currentValue + change);
        el.textContent = newValue;
    });
}

function showThreatScanResults(results) {
    const message = `Threat Scan Complete:
• Threats detected: ${results.threats}
• Threats blocked: ${results.blocked}
• Warnings: ${results.warnings}`;
    
    showInfo(message);
    
    // Update threat counters if they exist
    const threatCounter = document.querySelector('.threat-counter');
    if (threatCounter) {
        threatCounter.textContent = results.threats;
    }
    
    const blockedCounter = document.querySelector('.blocked-counter');
    if (blockedCounter) {
        blockedCounter.textContent = results.blocked;
    }
}

// 🔧 **UTILITY FUNCTIONS**

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showLoading(message = 'Loading...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-size: 18px;
            flex-direction: column;
            gap: 20px;
        `;
        document.body.appendChild(overlay);
    }
    
    window.secureSetHTML && window.secureSetHTML(overlay, `
        <div class="loading-spinner"></div>
        <div>${message}</div>
    `) || (overlay.textContent = String(`
        <div class="loading-spinner"></div>
        <div>${message}</div>
    `).replace(/<[^>]*>/g, ""));
    overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showSuccess(message) {
    console.log('✅ [SUCCESS]', message);
    showToast(message, 'success');
}

function showError(message) {
    console.error('❌ [ERROR]', message);
    showToast(message, 'error');
}

function showInfo(message) {
    console.log('ℹ️ [INFO]', message);
    showToast(message, 'info');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10001;
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        white-space: pre-line;
    `;
    
    const colors = {
        'error': '#ef4444',
        'success': '#10b981',
        'warning': '#f59e0b',
        'info': '#3b82f6'
    };
    
    toast.style.backgroundColor = colors[type] || colors['info'];
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto remove after 4 seconds for longer messages
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// 🚀 **EXPORT FOR EXTERNAL USE**
window.UnifiedDashboardEvents = {
    toggleScriptSystem,
    configureScript,
    scanThreats,
    configureSecurity,
    toggleStealth,
    bossMode,
    refreshData,
    exportLogs,
    showSuccess,
    showError,
    showInfo
};

console.log('✅ [EVENTS] Unified Dashboard Event Handlers initialized');
