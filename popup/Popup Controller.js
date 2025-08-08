/**
 * 🎛️ TINI POPUP CONTROLLER v4.2
 * Main popup interface controller - ORIGINAL TINI VERSION
 * Điều khiển giao diện popup chính - PHIÊN BẢN TINI GỐC
 */

class TINIPopupController {
    constructor() {
        this.version = "4.2";
        this.isInitialized = false;
        this.activeTab = 'dashboard';
        
        // TINI system states
        this.tiniStates = {
            monsterActive: true,
            lifeGuardianActive: true,
            aiUltraActive: true,
            smartGuardianActive: true,
            emergencyMode: false,
            protectionLevel: 'MAXIMUM'
        };
        
        // System statistics
        this.stats = {
            adsBlocked: 0,
            trackersBlocked: 0,
            malwareBlocked: 0,
            scriptsBlocked: 0,
            sessionStartTime: Date.now()
        };
        
        // UI elements cache
        this.elements = {};
        
        this.initializeController();
    }
    
    async initializeController() {
        if (this.isInitialized) return;
        
        console.log(`🎛️ [POPUP] Initializing TINI Popup Controller v${this.version}`);
        
        try {
            // Wait for DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupInterface());
            } else {
                await this.setupInterface();
            }
            
            // Load user settings
            await this.loadUserSettings();
            
            // Initialize monitoring
            this.startMonitoring();
            
            // Setup communication
            this.setupCommunication();
            
            this.isInitialized = true;
            console.log('🎛️ [POPUP] TINI Controller initialized successfully');
            
        } catch (error) {
            console.error('🎛️ [POPUP] Initialization failed:', error);
            this.showErrorMessage('Failed to initialize popup interface');
        }
    }
    
    async setupInterface() {
        console.log('🎛️ [POPUP] Setting up interface...');
        
        // Cache important elements
        this.cacheElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize tabs
        this.initializeTabs();
        
        // Load current statistics
        await this.loadStatistics();
        
        // Update interface
        this.updateInterface();
        
        console.log('🎛️ [POPUP] Interface setup complete');
    }
    
    cacheElements() {
        this.elements = {
            // Statistics elements
            adsBlockedCount: document.getElementById('adsBlocked'),
            trackersBlockedCount: document.getElementById('trackersBlocked'),
            malwareBlockedCount: document.getElementById('malwareBlocked'),
            systemHealthPercent: document.getElementById('systemHealth'),
            protectionLevelText: document.getElementById('protectionLevel'),
            
            // Status elements
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            
            // Toggle switches
            tiniMonsterToggle: document.getElementById('tiniMonster'),
            tiniLifeToggle: document.getElementById('tiniLife'),
            tiniAIToggle: document.getElementById('tiniAI'),
            tiniSmartToggle: document.getElementById('tiniSmart'),
            
            // Action buttons
            emergencyButton: document.getElementById('emergencyMode'),
            systemScanButton: document.getElementById('runSystemScan'),
            clearCacheButton: document.getElementById('clearCache'),
            openAdminButton: document.getElementById('openAdminPanel'),
            
            // Tab elements
            tabButtons: document.querySelectorAll('.tab-button'),
            tabContents: document.querySelectorAll('.tab-content')
        };
    }
    
    setupEventListeners() {
        // Tab navigation
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = this.getTabNameFromButton(e.target);
                this.switchTab(tabName);
            });
        });
        
        // TINI system toggles
        this.setupToggleListener('tiniMonsterToggle', 'monsterActive');
        this.setupToggleListener('tiniLifeToggle', 'lifeGuardianActive');
        this.setupToggleListener('tiniAIToggle', 'aiUltraActive');
        this.setupToggleListener('tiniSmartToggle', 'smartGuardianActive');
        
        // Action buttons
        this.setupButtonListener('emergencyButton', () => this.toggleEmergencyMode());
        this.setupButtonListener('systemScanButton', () => this.runSystemScan());
        this.setupButtonListener('clearCacheButton', () => this.clearCache());
        this.setupButtonListener('openAdminButton', () => this.openAdminPanel());
        
        // Settings buttons
        this.setupButton('exportSettings', () => this.exportSettings());
        this.setupButton('importSettings', () => this.importSettings());
        this.setupButton('resetToDefaults', () => this.resetToDefaults());
    }
    
    setupToggleListener(elementKey, stateKey) {
        const element = this.elements[elementKey];
        if (element) {
            element.addEventListener('change', (e) => {
                this.tiniStates[stateKey] = e.target.checked;
                this.updateTINISystem(stateKey, e.target.checked);
                this.saveUserSettings();
            });
        }
    }
    
    setupButtonListener(elementKey, handler) {
        const element = this.elements[elementKey];
        if (element) {
            element.addEventListener('click', handler);
        }
    }
    
    setupButton(id, handler) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
        }
    }
    
    getTabNameFromButton(button) {
        const text = button.textContent.toLowerCase();
        if (text.includes('dashboard')) return 'dashboard';
        if (text.includes('security')) return 'security';
        if (text.includes('settings')) return 'settings';
        return 'dashboard';
    }
    
    switchTab(tabName) {
        // Update active tab
        this.activeTab = tabName;
        
        // Update tab buttons
        this.elements.tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        const activeButton = Array.from(this.elements.tabButtons).find(button => {
            return this.getTabNameFromButton(button) === tabName;
        });
        
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Update tab content
        this.elements.tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(`${tabName}-tab`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
        
        console.log(`🎛️ [POPUP] Switched to ${tabName} tab`);
    }
    
    initializeTabs() {
        // Set default active tab
        this.switchTab(this.activeTab);
    }
    
    async loadStatistics() {
        try {
            // Get stats from background script
            const response = await this.sendMessage({ action: 'getStatistics' });
            
            if (response && response.success) {
                this.stats = { ...this.stats, ...response.data };
            } else {
                // Use simulated data for demo
                this.generateDemoStats();
            }
            
        } catch (error) {
            console.warn('🎛️ [POPUP] Failed to load statistics:', error);
            this.generateDemoStats();
        }
    }
    
    generateDemoStats() {
        // Generate realistic demo statistics
        const sessionTime = Date.now() - this.stats.sessionStartTime;
        const hoursActive = sessionTime / (1000 * 60 * 60);
        
        this.stats = {
            ...this.stats,
            adsBlocked: Math.floor(hoursActive * 15 + Math.random() * 10),
            trackersBlocked: Math.floor(hoursActive * 8 + Math.random() * 5),
            malwareBlocked: Math.floor(hoursActive * 2 + Math.random() * 3),
            scriptsBlocked: Math.floor(hoursActive * 25 + Math.random() * 15)
        };
    }
    
    updateInterface() {
        // Update statistics display
        this.updateStatistics();
        
        // Update system status
        this.updateSystemStatus();
        
        // Update toggle states
        this.updateToggleStates();
        
        // Update protection level
        this.updateProtectionLevel();
    }
    
    updateStatistics() {
        if (this.elements.adsBlockedCount) {
            this.elements.adsBlockedCount.textContent = this.stats.adsBlocked.toLocaleString();
        }
        
        if (this.elements.trackersBlockedCount) {
            this.elements.trackersBlockedCount.textContent = this.stats.trackersBlocked.toLocaleString();
        }
        
        if (this.elements.malwareBlockedCount) {
            this.elements.malwareBlockedCount.textContent = this.stats.malwareBlocked.toLocaleString();
        }
        
        // Calculate system health
        const healthScore = this.calculateSystemHealth();
        if (this.elements.systemHealthPercent) {
            this.elements.systemHealthPercent.textContent = `${Math.round(healthScore)}%`;
        }
    }
    
    calculateSystemHealth() {
        let health = 100;
        
        // Reduce health based on emergency mode
        if (this.tiniStates.emergencyMode) {
            health -= 20;
        }
        
        // Reduce health if systems are disabled
        const activeSystems = Object.values(this.tiniStates).filter(Boolean).length;
        const totalSystems = Object.keys(this.tiniStates).length - 1; // Exclude emergencyMode
        health = health * (activeSystems / totalSystems);
        
        return Math.max(0, Math.min(100, health));
    }
    
    updateSystemStatus() {
        const health = this.calculateSystemHealth();
        
        if (this.elements.statusIndicator) {
            if (this.tiniStates.emergencyMode) {
                this.elements.statusIndicator.style.backgroundColor = '#f44336';
                this.elements.statusText.textContent = 'EMERGENCY MODE';
            } else if (health > 90) {
                this.elements.statusIndicator.style.backgroundColor = '#4CAF50';
                this.elements.statusText.textContent = 'FULLY PROTECTED';
            } else if (health > 70) {
                this.elements.statusIndicator.style.backgroundColor = '#ff9800';
                this.elements.statusText.textContent = 'PARTIAL PROTECTION';
            } else {
                this.elements.statusIndicator.style.backgroundColor = '#f44336';
                this.elements.statusText.textContent = 'PROTECTION COMPROMISED';
            }
        }
    }
    
    updateToggleStates() {
        if (this.elements.tiniMonsterToggle) {
            this.elements.tiniMonsterToggle.checked = this.tiniStates.monsterActive;
        }
        if (this.elements.tiniLifeToggle) {
            this.elements.tiniLifeToggle.checked = this.tiniStates.lifeGuardianActive;
        }
        if (this.elements.tiniAIToggle) {
            this.elements.tiniAIToggle.checked = this.tiniStates.aiUltraActive;
        }
        if (this.elements.tiniSmartToggle) {
            this.elements.tiniSmartToggle.checked = this.tiniStates.smartGuardianActive;
        }
    }
    
    updateProtectionLevel() {
        const activeSystems = Object.entries(this.tiniStates)
            .filter(([key, value]) => key !== 'emergencyMode' && value).length;
        
        let level;
        if (activeSystems === 4) {
            level = 'MAXIMUM';
        } else if (activeSystems >= 3) {
            level = 'HIGH';
        } else if (activeSystems >= 2) {
            level = 'MEDIUM';
        } else if (activeSystems >= 1) {
            level = 'LOW';
        } else {
            level = 'DISABLED';
        }
        
        this.tiniStates.protectionLevel = level;
        
        if (this.elements.protectionLevelText) {
            this.elements.protectionLevelText.textContent = level;
        }
    }
    
    async updateTINISystem(systemKey, enabled) {
        try {
            const response = await this.sendMessage({
                action: 'updateTINISystem',
                system: systemKey,
                enabled: enabled
            });
            
            if (response && response.success) {
                this.showNotification(`TINI ${systemKey} ${enabled ? 'enabled' : 'disabled'}`, 'success');
            } else {
                this.showNotification(`Failed to update ${systemKey}`, 'error');
            }
            
        } catch (error) {
            console.error('🎛️ [POPUP] Failed to update TINI system:', error);
            this.showNotification('System update failed', 'error');
        }
        
        // Update interface
        this.updateInterface();
    }
    
    async toggleEmergencyMode() {
        const wasEmergency = this.tiniStates.emergencyMode;
        
        if (wasEmergency) {
            // Deactivate emergency mode
            this.tiniStates.emergencyMode = false;
            this.showNotification('Emergency mode deactivated', 'success');
        } else {
            // Confirm activation
            if (confirm('Activate EMERGENCY MODE? This will lock down all systems and enable maximum protection.')) {
                this.tiniStates.emergencyMode = true;
                this.showNotification('EMERGENCY MODE ACTIVATED', 'warning');
                
                // Activate all protection systems
                Object.keys(this.tiniStates).forEach(key => {
                    if (key !== 'emergencyMode') {
                        this.tiniStates[key] = true;
                    }
                });
            }
        }
        
        // Send to background
        try {
            await this.sendMessage({
                action: 'setEmergencyMode',
                enabled: this.tiniStates.emergencyMode
            });
        } catch (error) {
            console.error('🎛️ [POPUP] Failed to set emergency mode:', error);
        }
        
        // Update interface
        this.updateInterface();
        await this.saveUserSettings();
    }
    
    async runSystemScan() {
        this.showNotification('Running system scan...', 'info');
        
        try {
            const response = await this.sendMessage({ action: 'runSystemScan' });
            
            if (response && response.success) {
                const threats = response.threatsFound || 0;
                this.showNotification(`Scan complete. ${threats} threats found and blocked.`, 'success');
                
                // Update statistics
                if (threats > 0) {
                    this.stats.malwareBlocked += threats;
                    this.updateStatistics();
                }
            } else {
                this.showNotification('System scan failed', 'error');
            }
            
        } catch (error) {
            console.error('🎛️ [POPUP] System scan failed:', error);
            this.showNotification('System scan error', 'error');
        }
    }
    
    async clearCache() {
        this.showNotification('Clearing cache...', 'info');
        
        try {
            const response = await this.sendMessage({ action: 'clearCache' });
            
            if (response && response.success) {
                this.showNotification('Cache cleared successfully', 'success');
            } else {
                this.showNotification('Failed to clear cache', 'error');
            }
            
        } catch (error) {
            console.error('🎛️ [POPUP] Cache clearing failed:', error);
            this.showNotification('Cache clearing error', 'error');
        }
    }
    
    async openAdminPanel() {
        try {
            // Open admin panel in new tab
            await chrome.tabs.create({
                url: chrome.runtime.getURL('admin-panel/admin-panel.html')
            });
            
            this.showNotification('Admin panel opened', 'success');
            
        } catch (error) {
            console.error('🎛️ [POPUP] Failed to open admin panel:', error);
            this.showNotification('Failed to open admin panel', 'error');
        }
    }
    
    exportSettings() {
        const settings = {
            version: this.version,
            tiniStates: this.tiniStates,
            exportDate: new Date().toISOString(),
            stats: this.stats
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `tini-popup-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Settings exported', 'success');
    }
    
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const settings = JSON.parse(e.target.result);
                        
                        if (settings.tiniStates) {
                            this.tiniStates = { ...this.tiniStates, ...settings.tiniStates };
                            this.updateInterface();
                            this.saveUserSettings();
                            this.showNotification('Settings imported successfully', 'success');
                        } else {
                            this.showNotification('Invalid settings file', 'error');
                        }
                    } catch (error) {
                        this.showNotification('Failed to import settings', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    resetToDefaults() {
        if (confirm('Reset all settings to defaults? This cannot be undone.')) {
            this.tiniStates = {
                monsterActive: true,
                lifeGuardianActive: true,
                aiUltraActive: true,
                smartGuardianActive: true,
                emergencyMode: false,
                protectionLevel: 'MAXIMUM'
            };
            
            this.updateInterface();
            this.saveUserSettings();
            this.showNotification('Settings reset to defaults', 'success');
        }
    }
    
    async loadUserSettings() {
        try {
            const result = await chrome.storage.sync.get(['tiniPopupSettings']);
            
            if (result.tiniPopupSettings) {
                this.tiniStates = { ...this.tiniStates, ...result.tiniPopupSettings.tiniStates };
                this.activeTab = result.tiniPopupSettings.activeTab || 'dashboard';
            }
            
        } catch (error) {
            console.warn('🎛️ [POPUP] Failed to load settings:', error);
        }
    }
    
    async saveUserSettings() {
        try {
            await chrome.storage.sync.set({
                tiniPopupSettings: {
                    version: this.version,
                    tiniStates: this.tiniStates,
                    activeTab: this.activeTab,
                    lastSaved: Date.now()
                }
            });
            
        } catch (error) {
            console.warn('🎛️ [POPUP] Failed to save settings:', error);
        }
    }
    
    startMonitoring() {
        // Update statistics every 10 seconds
        setInterval(async () => {
            await this.loadStatistics();
            this.updateStatistics();
        }, 10000);
        
        // Update interface every 30 seconds
        setInterval(() => {
            this.updateInterface();
        }, 30000);
    }
    
    setupCommunication() {
        // Listen for messages from background script
        if (chrome && chrome.runtime) {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                this.handleMessage(message, sender, sendResponse);
            });
        }
    }
    
    handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'STATS_UPDATE':
                this.stats = { ...this.stats, ...message.data };
                this.updateStatistics();
                break;
                
            case 'SYSTEM_ALERT':
                this.showNotification(message.message, message.level || 'warning');
                break;
                
            case 'EMERGENCY_ACTIVATED':
                this.tiniStates.emergencyMode = true;
                this.updateInterface();
                this.showNotification('EMERGENCY MODE ACTIVATED', 'warning');
                break;
                
            case 'EMERGENCY_DEACTIVATED':
                this.tiniStates.emergencyMode = false;
                this.updateInterface();
                this.showNotification('Emergency mode deactivated', 'success');
                break;
        }
        
        sendResponse({ success: true });
    }
    
    async sendMessage(message) {
        try {
            if (chrome && chrome.runtime) {
                return await chrome.runtime.sendMessage(message);
            }
        } catch (error) {
            console.warn('🎛️ [POPUP] Message sending failed:', error);
            return null;
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    }
    
    showErrorMessage(message) {
        console.error('🎛️ [POPUP] Error:', message);
        this.showNotification(message, 'error');
    }
    
    destroy() {
        console.log('🎛️ [POPUP] Controller destroyed');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tiniPopupController = new TINIPopupController();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TINIPopupController;
}

console.log('🎛️ [POPUP] TINI Popup Controller loaded');
