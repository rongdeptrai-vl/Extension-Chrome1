// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI BACKGROUND SERVICE WORKER
 * Chrome Extension background script để quản lý toàn bộ hệ thống
 * Author: TINI Development
 * Version: 4.0 - Smart Content Detection
 */

// Background Service Worker Controller
class TINIBackgroundService {
    constructor() {
        this.version = '4.0';
        this.startTime = Date.now();
        this.activeTabsStatus = new Map();
        this.securityAlerts = [];
        this.recentThreats = [];
        this.currentRiskScore = 0;
        this.loadedModules = {
            core: true,
            security: false,
            ai: false,
            network: false,
            devices: false,
            advanced: false,
            monitoring: false,
            emergency: false,
            admin: false,
            stealth: false,
            server: false,
            antidetection: false
        };
        this.systemHealth = {
            status: 'INITIALIZING',
            lastCheck: Date.now(),
            errors: [],
            warnings: []
        };
        
        this.initialize();
    }
    
    async initialize() {
        console.log('🚀 TINI Background Service Worker v3.0 starting...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize system health monitoring
        this.startHealthMonitoring();
        
        // Initialize security monitoring
        this.initializeSecurityMonitoring();
        
        // Setup periodic tasks
        this.setupPeriodicTasks();
        
        this.systemHealth.status = 'ACTIVE';
        console.log('✅ TINI Background Service Worker initialized successfully');
    }
    
    setupEventListeners() {
        // Tab events
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.handleTabActivated(activeInfo);
        });
        
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdated(tabId, changeInfo, tab);
        });
        
        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
            this.handleTabRemoved(tabId, removeInfo);
        });
        
        // Runtime events
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleExtensionInstalled(details);
        });
        
        chrome.runtime.onStartup.addListener(() => {
            this.handleExtensionStartup();
        });
        
        // Message handling
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open for async responses
        });
        
        // Alarm events for periodic tasks
        chrome.alarms.onAlarm.addListener(async (alarm) => {
            await this.handleAlarm(alarm);
        });
    }
    
    async handleTabActivated(activeInfo) {
        console.log('📄 Tab activated:', activeInfo.tabId);
        
        try {
            const tab = await chrome.tabs.get(activeInfo.tabId);
            this.updateTabStatus(tab.id, {
                status: 'ACTIVE',
                url: tab.url,
                timestamp: Date.now()
            });
            
            // Perform security check on activated tab
            this.performTabSecurityCheck(tab);
            
        } catch (error) {
            console.error('❌ Error handling tab activation:', error);
        }
    }
    
    async handleTabUpdated(tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete' && tab.url) {
            console.log('🔄 Tab updated:', tabId, tab.url);
            
            this.updateTabStatus(tabId, {
                status: 'LOADED',
                url: tab.url,
                timestamp: Date.now()
            });
            
            // Check if content script injection is needed
            await this.checkContentScriptInjection(tab);
            
            // Perform domain-specific actions
            this.performDomainSpecificActions(tab);
        }
    }
    
    handleTabRemoved(tabId, removeInfo) {
        console.log('❌ Tab removed:', tabId);
        this.activeTabsStatus.delete(tabId);
    }
    
    handleExtensionInstalled(details) {
        console.log('📦 Extension installed/updated:', details.reason);
        
        if (details.reason === 'install') {
            this.onFirstInstall();
        } else if (details.reason === 'update') {
            this.onUpdate(details.previousVersion);
        }
    }
    
    handleExtensionStartup() {
        console.log('🔄 Extension startup detected');
        this.systemHealth.lastCheck = Date.now();
    }
    
    async handleMessage(message, sender, sendResponse) {
        console.log('📨 Background received message:', message.type || message.action, 'from:', sender.tab?.url);
        
        try {
            switch (message.type || message.action) {
                case 'CONTENT_INITIALIZED':
                    await this.handleContentInitialized(message.data, sender);
                    sendResponse({ status: 'ACKNOWLEDGED' });
                    break;
                    
                case 'SECURITY_EVENT':
                    await this.handleSecurityEvent(message.data, sender);
                    sendResponse({ status: 'SECURITY_EVENT_LOGGED' });
                    break;
                    
                case 'SCRIPT_TAMPERING':
                    await this.handleScriptTampering(message.data, sender);
                    sendResponse({ status: 'TAMPERING_LOGGED' });
                    break;
                    
                case 'GET_SYSTEM_STATUS':
                    sendResponse(await this.getSystemStatus());
                    break;
                    
                case 'GET_SECURITY_REPORT':
                    sendResponse(await this.generateSecurityReport());
                    break;
                    
                case 'get_module_status':
                    sendResponse({ modules: this.loadedModules });
                    break;
                    
                case 'get_risk_score':
                    sendResponse({ riskScore: this.currentRiskScore });
                    break;
                    
                case 'get_recent_threats':
                    sendResponse({ threats: this.recentThreats });
                    break;
                    
                case 'manual_security_scan':
                    await this.performManualSecurityScan();
                    sendResponse({ status: 'SCAN_COMPLETE' });
                    break;
                    
                case 'module_loaded':
                    this.updateLoadedModules(message.category, true);
                    sendResponse({ status: 'MODULE_STATUS_UPDATED' });
                    break;
                    
                case 'threat_detected':
                    this.handleThreatDetected(message.threat);
                    sendResponse({ status: 'THREAT_LOGGED' });
                    break;
                    
                case 'PING':
                    sendResponse({ 
                        status: 'ALIVE', 
                        timestamp: Date.now(),
                        version: this.version 
                    });
                    break;
                    
                default:
                    console.log('❓ Unknown message type:', message.type || message.action);
                    sendResponse({ error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('❌ Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }
    
    async handleAlarm(alarm) {
        console.log('⏰ Alarm triggered:', alarm.name);
        
        try {
            switch (alarm.name) {
                case 'health_check':
                    await this.performHealthCheck();
                    break;
                    
                case 'security_scan':
                    await this.performSecurityScan();
                    break;
                    
                case 'cleanup_old_data':
                    await this.performCleanup();
                    break;
                    
                default:
                    console.warn('⚠️ Unknown alarm:', alarm.name);
            }
        } catch (error) {
            console.error('❌ Error handling alarm:', alarm.name, error);
        }
    }
    
    async checkContentScriptInjection(tab) {
        if (!tab.url || 
            tab.url.startsWith('chrome://') || 
            tab.url.startsWith('chrome-extension://') ||
            tab.url.includes('admin-panel.html') ||
            tab.url.includes('localhost:8099/admin')) {
            console.log('⏭️ Skipping content script injection for:', tab.url);
            return; // Skip chrome internal pages and admin panel
        }

        // Respect big/restricted sites to avoid breakage/noise
        try {
            const u = new URL(tab.url);
            const host = u.hostname.replace(/^www\./,'');
            const BIG_SITES = [
                'google.com','bing.com','yahoo.com','duckduckgo.com','googleusercontent.com','chrome.google.com',
                'youtube.com','facebook.com','instagram.com','twitter.com','x.com','reddit.com',
                'amazon.com','wikipedia.org','github.com','gitlab.com','bitbucket.org','microsoft.com','apple.com'
            ];
            const isBig = BIG_SITES.some(h => host === h || host.endsWith('.'+h));
            if (isBig) {
                console.log('⏭️ Skip injection on big/restricted site:', host);
                return;
            }
            // Check host permission before programmatic injection (MV3 requirement)
            const originPattern = `${u.protocol}//${u.hostname}/*`;
            const hasPerm = await chrome.permissions.contains({ origins: [originPattern] }).catch(() => false);
            if (!hasPerm) {
                console.log('🔒 No host permission for', originPattern, '— skipping executeScript to avoid errors');
                return;
            }
        } catch(_) { /* ignore URL parse errors and continue */ }
        
        try {
            // Check if content script is already injected and working
            const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_STATUS' });
            
            if (response && response.status === 'ACTIVE') {
                console.log('✅ Content script already active on tab:', tab.id);
                return;
            }
        } catch (error) {
            // Content script not responding, need to inject
            console.log('🔄 Content script not responding, attempting injection on tab:', tab.id);
        }
        
        // Inject content scripts if needed
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['SECURITY/tini-validation-system.js', 'content-scripts/content.js']
            });
            
            console.log('✅ Content scripts injected successfully on tab:', tab.id);
            
        } catch (error) {
            console.error('❌ Failed to inject content scripts:', error);
            this.logSecurityAlert('INJECTION_FAILED', {
                tabId: tab.id,
                url: tab.url,
                error: error.message
            });
        }
    }
    
    performDomainSpecificActions(tab) {
        const hostname = new URL(tab.url).hostname;
        
        // Short video platform domain actions
        if (hostname.includes('shortvideo-platform.com') || hostname.includes('socialmedia1.com')) {
            this.activateContentBlocking(tab);
        }
        
        // Internal domain actions
        if (this.isInternalDomain(hostname)) {
            this.activateEnhancedSecurity(tab);
        }
        
        // Suspicious domain actions
        if (this.isSuspiciousDomain(hostname)) {
            this.activateThreatProtection(tab);
        }
    }
    
    async activateContentBlocking(tab) {
        console.log('🚫 Activating content blocking for tab:', tab.id);
        
        try {
            await chrome.tabs.sendMessage(tab.id, {
                type: 'ACTIVATE_CONTENT_BLOCKING',
                config: {
                    aggressiveMode: true,
                    liveContentBlocking: true
                }
            });
        } catch (error) {
            console.warn('⚠️ Could not activate content blocking:', error);
        }
    }
    
    async activateEnhancedSecurity(tab) {
        console.log('🛡️ Activating enhanced security for internal domain:', tab.id);
        
        try {
            await chrome.tabs.sendMessage(tab.id, {
                type: 'UPDATE_SECURITY_LEVEL',
                level: 'HIGH'
            });
        } catch (error) {
            console.warn('⚠️ Could not activate enhanced security:', error);
        }
    }
    
    async activateThreatProtection(tab) {
        console.log('🚨 Activating threat protection for suspicious domain:', tab.id);
        
        this.logSecurityAlert('SUSPICIOUS_DOMAIN_ACCESS', {
            tabId: tab.id,
            url: tab.url,
            timestamp: Date.now()
        });
    }
    
    async handleContentInitialized(data, sender) {
        console.log('✅ Content script initialized on:', data.domain);
        
        this.updateTabStatus(sender.tab.id, {
            status: 'CONTENT_READY',
            domain: data.domain,
            injectedScripts: data.injectedScripts,
            timestamp: data.timestamp
        });
    }
    
    async handleSecurityEvent(data, sender) {
        console.log('🚨 Security event received:', data);
        
        this.logSecurityAlert('CONTENT_SECURITY_EVENT', {
            tabId: sender.tab.id,
            url: sender.tab.url,
            eventData: data,
            timestamp: Date.now()
        });
        
        // Take action based on severity
        if (data.severity === 'CRITICAL') {
            await this.handleCriticalSecurityEvent(data, sender);
        }
    }
    
    async handleScriptTampering(data, sender) {
        console.log('⚠️ Script tampering detected:', data);
        
        this.logSecurityAlert('SCRIPT_TAMPERING', {
            tabId: sender.tab.id,
            url: sender.tab.url,
            script: data.script,
            timestamp: data.timestamp
        });
        
        // Attempt to re-inject the tampered script
        try {
            await chrome.tabs.sendMessage(sender.tab.id, {
                type: 'REINJECT_SCRIPTS'
            });
        } catch (error) {
            console.error('❌ Failed to reinject scripts:', error);
        }
    }
    
    async handleCriticalSecurityEvent(data, sender) {
        // Critical security event - take immediate action
        console.log('🚨 CRITICAL security event detected, taking action...');
        
        // Could block tab, show warning, etc.
        if (data.action === 'BLOCK_TAB') {
            try {
                await chrome.tabs.update(sender.tab.id, {
                    url: chrome.runtime.getURL('SECURITY/blocked.html')
                });
            } catch (error) {
                console.error('❌ Failed to block tab:', error);
            }
        }
    }
    
    updateTabStatus(tabId, status) {
        this.activeTabsStatus.set(tabId, {
            ...this.activeTabsStatus.get(tabId),
            ...status
        });
    }
    
    logSecurityAlert(type, data) {
        const alert = {
            type: type,
            data: data,
            timestamp: Date.now(),
            id: Date.now() + Math.random()
        };
        
        this.securityAlerts.push(alert);
        
        // Keep only last 1000 alerts
        if (this.securityAlerts.length > 1000) {
            this.securityAlerts = this.securityAlerts.slice(-1000);
        }
        
        console.log('📝 Security alert logged:', type);
    }
    
    startHealthMonitoring() {
        // Setup periodic health checks
        chrome.alarms.create('health_check', { periodInMinutes: 5 });
        chrome.alarms.create('security_scan', { periodInMinutes: 15 });
        chrome.alarms.create('cleanup_old_data', { periodInMinutes: 60 });
    }
    
    async performHealthCheck() {
        console.log('🔍 Performing system health check...');
        
        try {
            // Check if admin panel is open to avoid CORS issues
            const tabs = await chrome.tabs.query({});
            const adminPanelOpen = tabs.some(tab => 
                tab.url && (tab.url.includes('admin-panel.html') || tab.url.includes('localhost:8099/admin'))
            );
            
            if (adminPanelOpen) {
                console.log('⏭️ Skipping detailed health check - admin panel is open');
                this.systemHealth = {
                    timestamp: Date.now(),
                    activeTabs: this.activeTabsStatus.size,
                    securityAlerts: this.securityAlerts.length,
                    uptime: Date.now() - this.startTime,
                    status: 'ADMIN_PANEL_ACTIVE',
                    warnings: []
                };
                return;
            }
            
            const health = {
                timestamp: Date.now(),
                activeTabs: this.activeTabsStatus.size,
                securityAlerts: this.securityAlerts.length,
                uptime: Date.now() - this.startTime,
                memoryUsage: this.estimateMemoryUsage(),
                errors: [],
                warnings: []
            };
            
            // Check for issues
            if (health.activeTabs > 50) {
                health.warnings.push('High number of active tabs');
            }
            
            if (health.securityAlerts > 100) {
                health.warnings.push('High number of security alerts');
            }
            
            this.systemHealth = health;
            console.log('✅ Health check complete:', health);
        } catch (error) {
            console.error('❌ Health check failed:', error);
        }
    }
    
    async performSecurityScan() {
        console.log('🔍 Performing security scan...');
        
        try {
            // Scan recent security alerts for patterns
            const recentAlerts = this.securityAlerts.filter(alert => 
                Date.now() - alert.timestamp < 60 * 60 * 1000 // Last hour
            );
            
            const alertTypes = {};
            recentAlerts.forEach(alert => {
                alertTypes[alert.type] = (alertTypes[alert.type] || 0) + 1;
            });
            
            // Check for suspicious patterns
            Object.entries(alertTypes).forEach(([type, count]) => {
                if (count > 10) {
                    this.logSecurityAlert('SUSPICIOUS_PATTERN_DETECTED', {
                        alertType: type,
                        count: count,
                        timeframe: '1 hour'
                    });
                }
            });
            
            console.log('✅ Security scan complete, recent alerts:', alertTypes);
        } catch (error) {
            console.error('❌ Security scan failed:', error);
        }
    }
    
    async performCleanup() {
        console.log('🧹 Performing cleanup...');
        
        try {
            // Remove old inactive tabs from status
            const now = Date.now();
            for (const [tabId, status] of this.activeTabsStatus.entries()) {
                if (now - status.timestamp > 24 * 60 * 60 * 1000) { // 24 hours
                    this.activeTabsStatus.delete(tabId);
                }
            }
            
            // Clean old security alerts
            this.securityAlerts = this.securityAlerts.filter(alert =>
                now - alert.timestamp < 7 * 24 * 60 * 60 * 1000 // Keep 7 days
            );
            
            console.log('✅ Cleanup complete');
        } catch (error) {
            console.error('❌ Cleanup failed:', error);
        }
    }
    
    async getSystemStatus() {
        return {
            version: this.version,
            startTime: this.startTime,
            uptime: Date.now() - this.startTime,
            health: this.systemHealth,
            activeTabs: this.activeTabsStatus.size,
            securityAlerts: this.securityAlerts.length,
            recentAlerts: this.securityAlerts.slice(-10)
        };
    }
    
    async generateSecurityReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            timeframe: '24 hours',
            summary: {
                totalAlerts: this.securityAlerts.length,
                activeTabs: this.activeTabsStatus.size,
                systemHealth: this.systemHealth.status
            },
            alerts: this.securityAlerts.slice(-100),
            tabStatuses: Array.from(this.activeTabsStatus.entries()),
            recommendations: this.generateSecurityRecommendations()
        };
        
        return report;
    }
    
    generateSecurityRecommendations() {
        const recommendations = [];
        
        if (this.securityAlerts.length > 500) {
            recommendations.push('Consider reviewing security alert thresholds');
        }
        
        if (this.activeTabsStatus.size > 30) {
            recommendations.push('High number of active tabs detected');
        }
        
        return recommendations;
    }
    
    onFirstInstall() {
        console.log('🎉 TINI Extension installed for the first time');
        
        // Setup initial configuration
        chrome.storage.local.set({
            'tini_first_install': Date.now(),
            'tini_version': this.version,
            'tini_security_level': 'STANDARD'
        });
    }
    
    onUpdate(previousVersion) {
        console.log(`🔄 TINI Extension updated from ${previousVersion} to ${this.version}`);
        
        // Handle version-specific updates
        chrome.storage.local.set({
            'tini_last_update': Date.now(),
            'tini_previous_version': previousVersion,
            'tini_version': this.version
        });
    }
    
    initializeSecurityMonitoring() {
        console.log('🛡️ Security monitoring initialized');
        // Additional security monitoring setup
    }
    
    setupPeriodicTasks() {
        console.log('⏰ Periodic tasks setup complete');
        // Setup completed in startHealthMonitoring()
    }
    
    estimateMemoryUsage() {
        // Simple memory usage estimation
        const tabsMemory = this.activeTabsStatus.size * 0.1; // ~0.1MB per tab
        const alertsMemory = this.securityAlerts.length * 0.001; // ~1KB per alert
        
        return {
            estimated: tabsMemory + alertsMemory,
            unit: 'MB',
            details: {
                tabs: tabsMemory,
                alerts: alertsMemory
            }
        };
    }
    
    isInternalDomain(hostname) {
        return hostname === 'localhost' || 
               hostname.startsWith('192.168.') || 
               hostname.startsWith('10.') || 
               hostname.startsWith('172.16.') ||
               hostname.endsWith('.local');
    }
    
    isSuspiciousDomain(hostname) {
        const suspiciousDomains = [
            'suspicious-site.com',
            'suspicious-test.com'
            // Add more as needed
        ];
        
        return suspiciousDomains.some(domain => hostname.includes(domain));
    }
    
    performTabSecurityCheck(tab) {
        if (!tab.url) return;
        
        const hostname = new URL(tab.url).hostname;
        
        // Check against known threat lists
        if (this.isSuspiciousDomain(hostname)) {
            this.logSecurityAlert('SUSPICIOUS_DOMAIN_ACCESS', {
                tabId: tab.id,
                url: tab.url,
                hostname: hostname
            });
        }
    }
    
    updateLoadedModules(category, isLoaded) {
        if (this.loadedModules.hasOwnProperty(category)) {
            this.loadedModules[category] = isLoaded;
            console.log(`📦 Module ${category} status updated: ${isLoaded ? 'LOADED' : 'UNLOADED'}`);
        }
    }
    
    async performManualSecurityScan() {
        console.log('🔍 Performing manual security scan...');
        
        // Simulate scanning process
        this.currentRiskScore = Math.floor(Math.random() * 100);
        
        // Add a sample threat if risk is high
        if (this.currentRiskScore > 70) {
            this.recentThreats.push({
                type: 'High Risk Detected',
                description: 'Multiple suspicious activities',
                status: 'monitoring',
                timestamp: Date.now()
            });
        }
        
        // Keep only last 10 threats
        if (this.recentThreats.length > 10) {
            this.recentThreats = this.recentThreats.slice(-10);
        }
    }
    
    handleThreatDetected(threat) {
        console.log('🚨 Threat detected:', threat);
        
        this.recentThreats.push({
            ...threat,
            timestamp: Date.now()
        });
        
        // Update risk score based on threat severity
        if (threat.severity === 'critical') {
            this.currentRiskScore = Math.min(100, this.currentRiskScore + 30);
        } else if (threat.severity === 'high') {
            this.currentRiskScore = Math.min(100, this.currentRiskScore + 20);
        } else if (threat.severity === 'medium') {
            this.currentRiskScore = Math.min(100, this.currentRiskScore + 10);
        }
        
        // Keep only last 10 threats
        if (this.recentThreats.length > 10) {
            this.recentThreats = this.recentThreats.slice(-10);
        }
    }
}

// Initialize the background service
const tiniBackgroundService = new TINIBackgroundService();

// Make globally available for debugging
globalThis.TINI_BACKGROUND_SERVICE = tiniBackgroundService;

console.log('🎯 TINI Background Service Worker initialization complete');
// ST:TINI_1754716154_e868a412
// ST:TINI_1755432586_e868a412
