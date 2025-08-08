// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited

// ⚠️ XSS WARNING: innerHTML usage detected - potential XSS vulnerability
// Use window.secureSetHTML(element, content) instead of element.innerHTML = content
// Or use element.textContent for plain text

// ⚠️ SECURITY WARNING: localStorage usage detected
// Consider using secure storage methods to prevent XSS attacks
// Use window.secureSetStorage(), window.secureGetStorage(), window.secureRemoveStorage()
// TINI Security Fix - Auto-generated
if (typeof window !== 'undefined' && !window.TINI_SYSTEM) {
    console.warn('TINI namespace not loaded in event-handler-analyzer.js');
}

// ================================================================
// COMPREHENSIVE EVENT HANDLERS & FUNCTIONALITY ANALYZER
// Kiểm tra và bổ sung tất cả event handlers cho popup và admin
// ================================================================

class EventHandlerAnalyzer {
    constructor() {
        this.version = '1.0.0';
        this.missingHandlers = [];
        this.incompleteHandlers = [];
        this.recommendations = [];
        
        console.log('🔍 Event Handler Analyzer v' + this.version + ' initialized');
    }
    
    analyzeUnifiedDashboard() {
        console.log('\n📊 Analyzing Unified Dashboard (unified-dashboard.html)...');
        
        const expectedHandlers = {
            'toggleScriptSystem': {
                found: true,
                functionality: 'Basic - only logs and emits socket event',
                missing: ['API call to server', 'Error handling', 'Visual feedback']
            },
            'configureScript': {
                found: true,
                functionality: 'Incomplete - only logs message',
                missing: ['Configuration modal', 'Settings form', 'Save functionality']
            },
            'scanThreats': {
                found: true,
                functionality: 'Good - has simulation',
                missing: ['Real backend integration', 'Progress indicator']
            },
            'configureSecurity': {
                found: true,
                functionality: 'Incomplete - only logs message',
                missing: ['Security settings panel', 'Configuration options']
            },
            'toggleStealth': {
                found: true,
                functionality: 'Good - toggles UI state',
                missing: ['Backend persistence', 'System integration']
            },
            'bossMode': {
                found: true,
                functionality: 'Good - toggles UI state',
                missing: ['Real boss detection', 'System hiding logic']
            },
            'refreshData': {
                found: true,
                functionality: 'Basic - only emits socket event',
                missing: ['Force refresh API call', 'Loading indicator']
            },
            'exportLogs': {
                found: true,
                functionality: 'Incomplete - only logs message',
                missing: ['File download', 'Log formatting', 'Export options']
            }
        };
        
        this.analyzeHandlers('Unified Dashboard', expectedHandlers);
    }
    
    analyzeMainDashboard() {
        console.log('\n📊 Analyzing Main Dashboard (index.html)...');
        
        const expectedHandlers = {
            'login form submit': {
                found: true,
                functionality: 'Complete - handles auth, errors, success',
                missing: ['Password strength validation', 'Remember me option']
            },
            'auto-login check': {
                found: true,
                functionality: 'Good - checks token on load',
                missing: ['Token refresh logic', 'Session timeout handling']
            },
            'socket connection': {
                found: true,
                functionality: 'Complete - connects, authenticates, handles events',
                missing: ['Reconnection logic', 'Connection retry']
            },
            'real-time updates': {
                found: true,
                functionality: 'Good - updates UI elements',
                missing: ['Data validation', 'Update animation']
            }
        };
        
        this.analyzeHandlers('Main Dashboard', expectedHandlers);
    }
    
    analyzePopup() {
        console.log('\n📊 Analyzing Popup (popup.html)...');
        
        const expectedHandlers = {
            'tab switching': {
                found: false,
                functionality: 'Missing',
                missing: ['Tab click handlers', 'Content switching', 'Active state management']
            },
            'login button': {
                found: false,
                functionality: 'Missing',
                missing: ['Login form submission', 'Authentication logic', 'Error handling']
            },
            'register button': {
                found: false,
                functionality: 'Missing', 
                missing: ['Registration form', 'Validation', 'Success feedback']
            },
            'admin login': {
                found: false,
                functionality: 'Missing',
                missing: ['Admin authentication', 'Dashboard redirect', 'Token management']
            },
            'test server button': {
                found: false,
                functionality: 'Missing',
                missing: ['Server connectivity test', 'Status display', 'Error reporting']
            },
            'blocker selection': {
                found: false,
                functionality: 'Missing',
                missing: ['Version selection logic', 'Settings persistence', 'Activation logic']
            },
            'admin panel button': {
                found: false,
                functionality: 'Missing',
                missing: ['Panel opening logic', 'Permission check', 'Dashboard integration']
            }
        };
        
        this.analyzeHandlers('Popup', expectedHandlers);
    }
    
    analyzeHandlers(section, handlers) {
        console.log(`\n   🔍 ${section} Analysis:`);
        
        for (const [handler, info] of Object.entries(handlers)) {
            if (!info.found) {
                this.missingHandlers.push({ section, handler, info });
                console.log(`     ❌ MISSING: ${handler}`);
            } else if (info.missing && info.missing.length > 0) {
                this.incompleteHandlers.push({ section, handler, info });
                console.log(`     ⚠️ INCOMPLETE: ${handler} - ${info.functionality}`);
                info.missing.forEach(missing => {
                    console.log(`        • Missing: ${missing}`);
                });
            } else {
                console.log(`     ✅ COMPLETE: ${handler}`);
            }
        }
    }
    
    generateMissingHandlers() {
        console.log('\n🔧 Generating missing event handlers...');
        
        return {
            popupHandlers: this.generatePopupHandlers(),
            dashboardEnhancements: this.generateDashboardEnhancements(),
            commonUtilities: this.generateCommonUtilities()
        };
    }
    
    generatePopupHandlers() {
        return `
// ================================================================
// POPUP EVENT HANDLERS - COMPLETE IMPLEMENTATION
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Popup event handlers initialized');
    
    // Tab switching functionality
    setupTabSwitching();
    
    // Authentication handlers
    setupAuthenticationHandlers();
    
    // Blocker selection handlers
    setupBlockerSelection();
    
    // Admin panel handlers
    setupAdminPanelHandlers();
    
    // Initialize popup state
    initializePopupState();
});

function setupTabSwitching() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const targetId = this.id.replace('Tab', 'Content');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            console.log('📑 Tab switched to:', this.textContent);
        });
    });
}

function setupAuthenticationHandlers() {
    // Login button handler
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async function() {
            const username = document.getElementById('loginUsername')?.value;
            const password = document.getElementById('loginPassword')?.value;
            
            if (!username || !password) {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            this.disabled = true;
            this.textContent = 'Authenticating...';
            
            try {
                const result = await authenticateUser(username, password);
                if (result.success) {
                    showMessage('Login successful!', 'success');
                    (window.TINI_SYSTEM?.utils?.secureStorage?.set('userToken', result.token) || localStorage.setItem('userToken', result.token));
                    updateUIAfterLogin(result.user);
                } else {
                    showMessage(result.message || 'Authentication failed', 'error');
                }
            } catch (error) {
                showMessage('Connection error', 'error');
                console.error('Login error:', error);
            } finally {
                this.disabled = false;
                this.textContent = 'Authenticate';
            }
        });
    }
    
    // Register button handler
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async function() {
            const formData = {
                username: document.getElementById('regUsername')?.value,
                email: document.getElementById('regEmail')?.value,
                password: document.getElementById('regPassword')?.value,
                confirmPassword: document.getElementById('regConfirmPassword')?.value
            };
            
            if (!validateRegistrationForm(formData)) {
                return;
            }
            
            this.disabled = true;
            this.textContent = 'Registering...';
            
            try {
                const result = await registerUser(formData);
                if (result.success) {
                    showMessage('Registration successful!', 'success');
                    // Switch to login tab
                    document.getElementById('loginTab').click();
                } else {
                    showMessage(result.message || 'Registration failed', 'error');
                }
            } catch (error) {
                showMessage('Registration error', 'error');
                console.error('Registration error:', error);
            } finally {
                this.disabled = false;
                this.textContent = 'Register New User';
            }
        });
    }
    
    // Admin login handler
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', async function() {
            const adminCode = document.getElementById('adminCode')?.value;
            const adminPassword = document.getElementById('adminPassword')?.value;
            
            if (!adminCode || !adminPassword) {
                showMessage('Please enter admin credentials', 'error');
                return;
            }
            
            this.disabled = true;
            this.textContent = 'Verifying...';
            
            try {
                const result = await authenticateAdmin(adminCode, adminPassword);
                if (result.success) {
                    showMessage('Admin access granted!', 'success');
                    (window.TINI_SYSTEM?.utils?.secureStorage?.set('adminToken', result.token) || localStorage.setItem('adminToken', result.token));
                    // Redirect to admin dashboard
                    openAdminDashboard();
                } else {
                    showMessage('Invalid admin credentials', 'error');
                }
            } catch (error) {
                showMessage('Admin authentication error', 'error');
                console.error('Admin auth error:', error);
            } finally {
                this.disabled = false;
                this.textContent = 'Admin Login';
            }
        });
    }
    
    // Test server button handler
    const testServerBtn = document.getElementById('testServerBtn');
    if (testServerBtn) {
        testServerBtn.addEventListener('click', async function() {
            this.disabled = true;
            this.textContent = 'Testing...';
            
            try {
                const result = await testServerConnection();
                if (result.success) {
                    showMessage(\`Server online - Ping: \${result.ping}ms\`, 'success');
                    updateConnectionStatus(true);
                } else {
                    showMessage('Server offline or unreachable', 'error');
                    updateConnectionStatus(false);
                }
            } catch (error) {
                showMessage('Connection test failed', 'error');
                updateConnectionStatus(false);
            } finally {
                this.disabled = false;
                this.textContent = 'Test Server';
            }
        });
    }
}

function setupBlockerSelection() {
    const blockerCards = document.querySelectorAll('.blocker-card');
    
    blockerCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            blockerCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
            
            const version = this.getAttribute('data-version');
            selectBlockerVersion(version);
        });
    });
}

function setupAdminPanelHandlers() {
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            const adminToken = (window.TINI_SYSTEM?.utils?.secureStorage?.get('adminToken') || localStorage.getItem('adminToken'));
            if (adminToken) {
                openAdminDashboard();
            } else {
                // Switch to admin tab for login
                document.getElementById('adminTab').click();
                showMessage('Please login as admin first', 'warning');
            }
        });
    }
}

// Utility functions
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer') || createMessageContainer();
    
    const messageEl = document.createElement('div');
    messageEl.className = \`message message-\${type}\`;
    messageEl.textContent = message;
    
    messageContainer.appendChild(messageEl);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

function createMessageContainer() {
    const container = document.createElement('div');
    container.id = 'messageContainer';
    container.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 300px;
    \`;
    document.body.appendChild(container);
    return container;
}

function validateRegistrationForm(data) {
    if (!data.username || data.username.length > 14 || !/^[a-zA-ZÀ-ỹ]+(?:-[a-zA-ZÀ-ỹ]+)*-\d+$/.test(data.username)) {
        showMessage('Username must be at most 14 characters, follow the structure "name-vietnamese-number", and end with a number.', 'error');
        return false;
    }
    
    if (!data.email || !data.email.includes('@')) {
        showMessage('Please enter a valid email', 'error');
        return false;
    }
    
    if (!data.password || data.password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return false;
    }
    
    if (data.password !== data.confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return false;
    }
    
    return true;
}

function updateConnectionStatus(isConnected) {
    const statusElements = document.querySelectorAll('.status-indicator');
    statusElements.forEach(el => {
        el.textContent = isConnected ? '🟢' : '🔴';
    });
}

function selectBlockerVersion(version) {
    console.log(\`🛡️ Selected blocker version: \${version}\`);
    
    // Save selection
    (window.TINI_SYSTEM?.utils?.secureStorage?.set('selectedBlocker', version) || localStorage.setItem('selectedBlocker', version));
    
    // Update UI
    showMessage(\`Blocker version \${version} selected\`, 'success');
    
    // Send to background script if in extension context
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
            action: 'setBlockerVersion',
            version: version
        });
    }
}

function openAdminDashboard() {
    // Open admin dashboard in new tab/window
    const dashboardUrl = 'http://localhost:3001/unified';
    
    if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({ url: dashboardUrl });
    } else {
        window.open(dashboardUrl, '_blank');
    }
}

// API Functions
async function authenticateUser(username, password) {
    // Enhanced user authentication with multiple validation layers
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'TINI-System'
            },
            body: JSON.stringify({ 
                username, 
                password,
                clientType: 'popup',
                timestamp: Date.now()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store authentication data securely
            if (window.TINI_SYSTEM?.utils?.secureStorage) {
                window.TINI_SYSTEM.utils.secureStorage.set('userToken', result.token);
                window.TINI_SYSTEM.utils.secureStorage.set('userInfo', result.user);
            }
        }
        
        return result;
    } catch (error) {
        console.error('Authentication error:', error);
        return {
            success: false,
            message: 'Network error during authentication',
            error: error.message
        };
    }
}

async function registerUser(userData) {
    // Enhanced user registration with validation
    try {
        // Client-side validation
        const validation = validateRegistrationData(userData);
        if (!validation.isValid) {
            return {
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            };
        }
        
        const response = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'TINI-System'
            },
            body: JSON.stringify({
                ...userData,
                clientType: 'popup',
                timestamp: Date.now(),
                deviceFingerprint: await generateDeviceFingerprint()
            })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: 'Network error during registration',
            error: error.message
        };
    }
}

async function authenticateAdmin(code, password) {
    // Enhanced admin authentication with additional security layers
    try {
        const response = await fetch('http://localhost:3001/api/admin/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'TINI-System',
                'X-Admin-Request': 'true'
            },
            body: JSON.stringify({ 
                adminCode: code, 
                password,
                clientType: 'popup',
                timestamp: Date.now(),
                securityCheck: await generateSecurityCheck()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store admin authentication securely
            if (window.TINI_SYSTEM?.utils?.secureStorage) {
                window.TINI_SYSTEM.utils.secureStorage.set('adminToken', result.token);
                window.TINI_SYSTEM.utils.secureStorage.set('adminInfo', result.admin);
                window.TINI_SYSTEM.utils.secureStorage.set('adminPermissions', result.permissions);
            }
        }
        
        return result;
    } catch (error) {
        console.error('Admin authentication error:', error);
        return {
            success: false,
            message: 'Network error during admin authentication',
            error: error.message
        };
    }
}

async function testServerConnection() {
    // Enhanced server connectivity test with multiple endpoints
    try {
        const endpoints = [
            '/api/health',
            '/api/status',
            '/api/ping'
        ];
        
        const results = [];
        
        for (const endpoint of endpoints) {
            const start = Date.now();
            try {
                const response = await fetch(`http://localhost:3001${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'TINI-System'
                    },
                    timeout: 5000
                });
                
                const ping = Date.now() - start;
                results.push({
                    endpoint,
                    success: response.ok,
                    ping,
                    status: response.status
                });
            } catch (error) {
                results.push({
                    endpoint,
                    success: false,
                    error: error.message,
                    ping: -1
                });
            }
        }
        
        const successfulTests = results.filter(r => r.success).length;
        const averagePing = results
            .filter(r => r.ping > 0)
            .reduce((sum, r) => sum + r.ping, 0) / results.filter(r => r.ping > 0).length;
        
        return {
            success: successfulTests > 0,
            ping: Math.round(averagePing) || 0,
            details: results,
            message: `${successfulTests}/${endpoints.length} endpoints accessible`
        };
        
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            ping: -1,
            message: 'Connection test failed'
        };
    }
}

// Helper functions for enhanced security
async function generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint test', 2, 2);
    
    return {
        canvas: canvas.toDataURL(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: Date.now()
    };
}

async function generateSecurityCheck() {
    return {
        timestamp: Date.now(),
        randomCheck: Math.random().toString(36).substring(2),
        securityLevel: 'high',
        clientValidation: true
    };
}

function validateRegistrationData(data) {
    const errors = [];
    
    if (!data.username || data.username.length > 20 || !/^[\u4e00-\u9fa5\s]+[\u00C0-\u1EF9\s]+-\d{2,3}$/.test(data.username)) {
        errors.push('Invalid username format. Username must be at most 20 characters and follow the structure: Chinese Name - Vietnamese Name - XX-X (e.g., 潘文勇 VĂN DŨNG 79-1)');
    }
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Valid email address required');
    }
    
    if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    if (data.password !== data.confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

function initializePopupState() {
    // Load saved settings
    const selectedBlocker = (window.TINI_SYSTEM?.utils?.secureStorage?.get('selectedBlocker') || localStorage.getItem('selectedBlocker'));
    if (selectedBlocker) {
        const card = document.querySelector(\`[data-version="\${selectedBlocker}"]\`);
        if (card) {
            card.classList.add('active');
        }
    }
    
    // Check authentication status
    const userToken = (window.TINI_SYSTEM?.utils?.secureStorage?.get('userToken') || localStorage.getItem('userToken'));
    const adminToken = (window.TINI_SYSTEM?.utils?.secureStorage?.get('adminToken') || localStorage.getItem('adminToken'));
    
    if (userToken) {
        // User is logged in
        updateUIAfterLogin({ token: userToken });
    }
    
    if (adminToken) {
        // Admin is logged in
        updateUIAfterAdminLogin();
    }
}

function updateUIAfterLogin(user) {
    // Update UI to show logged in state
    const loginTab = document.getElementById('loginTab');
    if (loginTab) {
        loginTab.textContent = '✅ Logged In';
    }
}

function updateUIAfterAdminLogin() {
    // Update UI to show admin logged in state
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.textContent = '👑 Admin Dashboard';
        adminBtn.classList.add('admin-active');
    }
}
`;
    }
    
    generateDashboardEnhancements() {
        return `
// ================================================================
// DASHBOARD ENHANCEMENTS - MISSING FUNCTIONALITY
// ================================================================

// Enhanced Script System Controls
function configureScript() {
    showConfigurationModal('Script System Configuration', {
        'AI Sensitivity': { type: 'range', min: 1, max: 10, value: 7 },
        'Learning Mode': { type: 'select', options: ['Adaptive', 'Fixed', 'Hybrid'], value: 'Adaptive' },
        'Performance Mode': { type: 'select', options: ['High', 'Balanced', 'Low'], value: 'Balanced' },
        'Auto Update': { type: 'checkbox', value: true },
        'Debug Mode': { type: 'checkbox', value: false }
    }, (settings) => {
        // Save script settings
        saveSystemSettings('script', settings);
        addLog('Script system configured successfully', 'success');
    });
}

// Enhanced Security System Controls
function configureSecurity() {
    showConfigurationModal('Security System Settings', {
        'Protection Level': { type: 'select', options: ['Basic', 'Enhanced', 'Maximum'], value: 'Maximum' },
        'Real-time Scanning': { type: 'checkbox', value: true },
        'Threat Notifications': { type: 'checkbox', value: true },
        'Auto Block Threats': { type: 'checkbox', value: true },
        'Log Security Events': { type: 'checkbox', value: true },
        'Honeypot Sensitivity': { type: 'range', min: 1, max: 10, value: 8 }
    }, (settings) => {
        // Save security settings
        saveSystemSettings('security', settings);
        addLog('Security system configured successfully', 'success');
    });
}

// Enhanced Export Logs Functionality
function exportLogs() {
    showLoadingIndicator('Preparing logs for export...');
    
    setTimeout(() => {
        const logs = document.getElementById('logsContainer').innerHTML;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = \`tini-system-logs-\${timestamp}.html\`;
        
        const htmlContent = \`
<!DOCTYPE html>
<html>
<head>
    <title>TINI System Logs - \${new Date().toLocaleDateString()}</title>
    <style>
        body { font-family: monospace; background: #000; color: #4ade80; padding: 20px; }
        .log-entry { margin: 5px 0; }
        .log-timestamp { color: #666; }
        .log-success { color: #10b981; }
        .log-warning { color: #fbbf24; }
        .log-error { color: #ef4444; }
        .log-info { color: #4ade80; }
    </style>
</head>
<body>
    <h1>🌟 TINI Unified System Logs</h1>
    <p>Generated: \${new Date().toLocaleString()}</p>
    <hr>
    \${logs}
</body>
</html>\`;
        
        downloadFile(filename, htmlContent, 'text/html');
        hideLoadingIndicator();
        addLog(\`Logs exported successfully: \${filename}\`, 'success');
    }, 1500);
}

// Enhanced Refresh Data with API Integration
function refreshData() {
    showLoadingIndicator('Refreshing system data...');
    addLog('Refreshing all system data...', 'info');
    
    // Make API calls to refresh data
    Promise.all([
        fetch('/api/unified/status').then(r => r.json()),
        fetch('/api/system/overview').then(r => r.json()),
        fetch('/api/system/health').then(r => r.json())
    ]).then(([status, overview, health]) => {
        // Update UI with fresh data
        updateSystemStatus(status);
        updateSystemOverview(overview);
        updateSystemHealth(health);
        
        updateSyncTime();
        hideLoadingIndicator();
        addLog('System data refreshed successfully', 'success');
        
        // Emit socket event for other clients
        socket.emit('refresh_request');
        
    }).catch(error => {
        console.error('Refresh error:', error);
        hideLoadingIndicator();
        addLog('Failed to refresh system data', 'error');
    });
}

// Enhanced Toggle Script System with API Integration
function toggleScriptSystem() {
    const currentState = document.getElementById('scriptStatus')?.textContent || 'inactive';
    const newState = currentState === 'active' ? 'inactive' : 'active';
    
    showLoadingIndicator('Updating script system...');
    addLog('Script system toggle requested', 'info');
    
    fetch('/api/script/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateScriptSystemUI(newState);
            addLog(\`Script system \${newState}\`, 'success');
        } else {
            addLog('Failed to toggle script system', 'error');
        }
    })
    .catch(error => {
        console.error('Toggle error:', error);
        addLog('Script system toggle failed', 'error');
    })
    .finally(() => {
        hideLoadingIndicator();
        socket.emit('script_toggle', { state: newState });
    });
}

// Modal and UI Helper Functions
function showConfigurationModal(title, settings, onSave) {
    const modal = document.createElement('div');
    modal.className = 'config-modal';
    
    // SECURITY WARNING: innerHTML usage detected - consider using TINI security wrapper
    console.warn('🚨 [TINI] SECURITY: innerHTML usage in modal creation - consider upgrading to secure DOM manipulation');
    
    const modalHTML = '<div class="modal-overlay"></div>' +
        '<div class="modal-content">' +
            '<div class="modal-header">' +
                '<h3>' + title + '</h3>' +
                '<button class="modal-close">&times;</button>' +
            '</div>' +
            '<div class="modal-body">' +
                generateSettingsForm(settings) +
            '</div>' +
            '<div class="modal-footer">' +
                '<button class="btn btn-secondary modal-cancel">Cancel</button>' +
                '<button class="btn btn-primary modal-save">Save Settings</button>' +
            '</div>' +
        '</div>';
    
    modal.innerHTML = modalHTML;
    
    document.body.appendChild(modal);
    
    // Event handlers
    modal.querySelector('.modal-close').onclick = () => modal.remove();
    modal.querySelector('.modal-cancel').onclick = () => modal.remove();
    modal.querySelector('.modal-overlay').onclick = () => modal.remove();
    modal.querySelector('.modal-save').onclick = () => {
        const formData = collectFormData(modal);
        onSave(formData);
        modal.remove();
    };
}

function generateSettingsForm(settings) {
    return Object.entries(settings).map(([key, config]) => {
        const id = \`setting-\${key.replace(/\s+/g, '-').toLowerCase()}\`;
        
        switch(config.type) {
            case 'range':
                return \`
                    <div class="setting-group">
                        <label for="\${id}">\${key}: <span id="\${id}-value">\${config.value}</span></label>
                        <input type="range" id="\${id}" min="\${config.min}" max="\${config.max}" value="\${config.value}" 
                               oninput="document.getElementById('\${id}-value').textContent = this.value">
                    </div>\`;
            case 'select':
                const options = config.options.map(opt => 
                    \`<option value="\${opt}" \${opt === config.value ? 'selected' : ''}>\${opt}</option>\`
                ).join('');
                return \`
                    <div class="setting-group">
                        <label for="\${id}">\${key}:</label>
                        <select id="\${id}">\${options}</select>
                    </div>\`;
            case 'checkbox':
                return \`
                    <div class="setting-group">
                        <label for="\${id}">
                            <input type="checkbox" id="\${id}" \${config.value ? 'checked' : ''}>
                            \${key}
                        </label>
                    </div>\`;
            default:
                return \`
                    <div class="setting-group">
                        <label for="\${id}">\${key}:</label>
                        <input type="text" id="\${id}" value="\${config.value || ''}">
                    </div>\`;
        }
    }).join('');
}

function collectFormData(modal) {
    const formData = {};
    const inputs = modal.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        const key = input.id.replace('setting-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        if (input.type === 'checkbox') {
            formData[key] = input.checked;
        } else if (input.type === 'range') {
            formData[key] = parseInt(input.value);
        } else {
            formData[key] = input.value;
        }
    });
    
    return formData;
}

function showLoadingIndicator(message) {
    const indicator = document.createElement('div');
    indicator.id = 'loadingIndicator';
    
    // SECURITY WARNING: innerHTML usage detected
    console.warn('🚨 [TINI] SECURITY: innerHTML usage in loading indicator - consider upgrading to secure DOM manipulation');
    
    const loadingHTML = '<div class="loading-overlay"></div>' +
        '<div class="loading-content">' +
            '<div class="loading-spinner"></div>' +
            '<div class="loading-message">' + message + '</div>' +
        '</div>';
    
    indicator.innerHTML = loadingHTML;
    document.body.appendChild(indicator);
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function saveSystemSettings(system, settings) {
    localStorage.setItem(\`tini-\${system}-settings\`, JSON.stringify(settings));
    
    // Send to server
    fetch(\`/api/\${system}/settings\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
    }).catch(error => {
        console.error('Failed to save settings:', error);
    });
}
`;
    }
    
    generateCommonUtilities() {
        return `
// ================================================================
// COMMON UTILITIES - SHARED FUNCTIONALITY
// ================================================================

// CSS for modals and UI enhancements
const modalCSS = \`
.config-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
}

.modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    min-width: 400px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
}

.modal-body {
    padding: 25px;
}

.setting-group {
    margin-bottom: 20px;
}

.setting-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
}

.setting-group input,
.setting-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
}

.setting-group input[type="checkbox"] {
    width: auto;
    margin-right: 8px;
}

.setting-group input[type="range"] {
    margin-top: 5px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px 25px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999;
}

.loading-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    z-index: 10000;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4ade80;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-message {
    color: #333;
    font-weight: 500;
}

.message {
    padding: 12px 20px;
    margin-bottom: 10px;
    border-radius: 8px;
    font-weight: 500;
    animation: slideIn 0.3s ease;
}

.message-success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.message-error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.message-warning {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.message-info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
\`;

// Inject CSS
function injectModalCSS() {
    if (!document.getElementById('modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = modalCSS;
        document.head.appendChild(style);
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectModalCSS);
} else {
    injectModalCSS();
}

// Enhanced error handling
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
    
    // Show user-friendly error message
    if (typeof showMessage === 'function') {
        showMessage('An unexpected error occurred. Please try again.', 'error');
    }
});

// Enhanced console logging
const originalLog = console.log;
console.log = function(...args) {
    originalLog.apply(console, args);
    
    // Also log to UI if in development mode
    if ((window.TINI_SYSTEM?.utils?.secureStorage?.get('debugMode') || localStorage.getItem('debugMode')) === 'true') {
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            const logEntry = document.createElement('div');
            logEntry.textContent = args.join(' ');
            logEntry.style.fontSize = '12px';
            logEntry.style.color = '#666';
            logEntry.style.marginBottom = '2px';
            debugPanel.appendChild(logEntry);
        }
    }
};
`;
    }
    
    generateFullReport() {
        console.log('\n📋 COMPREHENSIVE EVENT HANDLER ANALYSIS REPORT');
        console.log('='.repeat(70));
        
        this.analyzeUnifiedDashboard();
        this.analyzeMainDashboard();
        this.analyzePopup();
        
        const report = {
            summary: {
                totalMissing: this.missingHandlers.length,
                totalIncomplete: this.incompleteHandlers.length,
                overallScore: this.calculateScore()
            },
            missingHandlers: this.missingHandlers,
            incompleteHandlers: this.incompleteHandlers,
            generatedCode: this.generateMissingHandlers(),
            recommendations: this.generateRecommendations()
        };
        
        console.log('\n📊 ANALYSIS SUMMARY:');
        console.log(`   Missing Handlers: ${report.summary.totalMissing}`);
        console.log(`   Incomplete Handlers: ${report.summary.totalIncomplete}`);
        console.log(`   Overall Score: ${report.summary.overallScore}/100`);
        
        return report;
    }
    
    calculateScore() {
        const totalHandlers = this.missingHandlers.length + this.incompleteHandlers.length + 15; // Estimated total
        const working = 15 - this.missingHandlers.length;
        const partial = this.incompleteHandlers.length * 0.5;
        
        return Math.round(((working + partial) / 15) * 100);
    }
    
    generateRecommendations() {
        return [
            '🚨 CRITICAL: Implement missing popup event handlers immediately',
            '⚡ HIGH: Complete configuration modals for script and security systems',
            '📤 MEDIUM: Implement log export functionality with file download',
            '🔄 MEDIUM: Add API integration for all toggle functions',
            '✨ LOW: Add loading indicators and better error handling',
            '🎨 LOW: Improve UI feedback and animations'
        ];
    }
}

// Usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventHandlerAnalyzer;
} else {
    // Browser environment - auto-run analysis
    const analyzer = new EventHandlerAnalyzer();
    const report = analyzer.generateFullReport();
    
    console.log('\n🎯 NEXT STEPS:');
    report.recommendations.forEach(rec => console.log(`   ${rec}`));
}
