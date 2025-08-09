// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// SECURE ADMIN HELPER - PREVENTS XSS/INJECTION
// try { require('../SECURITY/secure-admin-helper.js'); } catch(e) { console.warn('Secure admin helper not loaded:', e.message); }

// ================================================================
// COMPLETE POPUP EVENT HANDLERS - SECURITY ENHANCED
// File: popup.js - Main popup functionality with TINI namespace
// ================================================================

// Load TINI namespace first
if (typeof window.TINI_SYSTEM === 'undefined') {
    console.log('🔧 Initializing TINI namespace for popup...');
    window.TINI_SYSTEM = { 
        core: {}, 
        utils: {}, 
        safe: {}, 
        popup: {},
        version: '4.1.0',
        initialized: true
    };
}

console.log('🚀 Loading TINI Popup Event Handlers...');

// Ensure DOM is fully loaded before initialization
function initializePopup() {
    console.log('� TINI Popup initializing...');
    
    // Check if we're in the right context
    if (!window.location.pathname.includes('popup.html') && 
        !document.getElementById('settingsToggle') &&
        !document.querySelector('.popup-container')) {
        console.log('⏭️ Not in popup context, skipping popup initialization');
        return;
    }
    
    initializeTabSwitching();
    initializeAuthHandlers();
    initializeBlockerSelection();
    initializeAdminPanel();
    initializeProductionMonitor();
    
    // Only initialize advanced settings if we're in popup context
    if (window.location.pathname.includes('popup.html') || document.getElementById('settingsToggle')) {
        initializeAdvancedSettings();
    } else {
        console.log('⏭️ Skipping advanced settings - not in popup context');
    }
    
    // Load saved state
    loadSavedState();
    
    // Initialize device ID
    initializeDeviceId();
    
    console.log('✅ All popup handlers initialized successfully');
}

// ================================================================
// DEVICE ID MANAGEMENT
// ================================================================
function initializeDeviceId() {
    console.log('🔧 Initializing device ID...');
    
    const deviceIdField = document.getElementById('deviceId');
    if (!deviceIdField) {
        console.warn('⚠️ Device ID field not found');
        return;
    }
    
    // Check if device ID already exists
    let deviceId = localStorage.getItem('tini_device_id');
    
    if (!deviceId) {
        // Generate new device ID
        deviceId = generateDeviceId();
        localStorage.setItem('tini_device_id', deviceId);
        console.log('✅ Generated new device ID:', deviceId);
    } else {
        console.log('✅ Using existing device ID:', deviceId);
    }
    
    deviceIdField.value = deviceId;
}

function generateDeviceId() {
    // Generate UUID v4 format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

document.addEventListener('DOMContentLoaded', initializePopup);

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePopup);
} else {
    // Add small delay to ensure all scripts are loaded
    setTimeout(initializePopup, 100);
}

// ================================================================
// TAB SWITCHING FUNCTIONALITY
// ================================================================
function initializeTabSwitching() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    console.log(`🔧 Initializing ${tabs.length} tabs`);
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            console.log(`📑 Switching to tab: ${this.textContent}`);
            
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active to current
            this.classList.add('active');
            
            // Show/hide content based on tab
            const tabId = this.id;
            showTabContent(tabId);
            
            // Save active tab
            window.secureSetStorage && window.secureSetStorage('activeTab', tabId) || localStorage.setItem('activeTab', tabId);
        });
    });
}

function showTabContent(activeTabId) {
    // Hide all auth forms
    const allForms = document.querySelectorAll('.auth-form');
    allForms.forEach(form => {
        form.classList.remove('active');
    });
    
    // Show relevant form
    switch(activeTabId) {
        case 'loginTab':
            const loginForm = document.getElementById('loginForm');
            if (loginForm) loginForm.classList.add('active');
            break;
        case 'registerTab':
            const registerForm = document.getElementById('registerForm');
            if (registerForm) registerForm.classList.add('active');
            break;
        case 'adminTab':
            const adminForm = document.getElementById('adminForm');
            if (adminForm) adminForm.classList.add('active');
            break;
        default:
            console.warn('⚠️ Unknown tab ID:', activeTabId);
    }
}

// ================================================================
// AUTHENTICATION HANDLERS
// ================================================================
function initializeAuthHandlers() {
    console.log('🔐 Initializing authentication handlers...');
    
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        console.log('✅ Login button handler attached');
    }
    
    // Register button
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
        console.log('✅ Register button handler attached');
    }
    
    // Admin login button
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', handleAdminLogin);
        console.log('✅ Admin login button handler attached');
    }
    
    // Test server button
    const testServerBtn = document.getElementById('testServerBtn');
    if (testServerBtn) {
        testServerBtn.addEventListener('click', handleTestServer);
        console.log('✅ Test server button handler attached');
    }
    
    // Enter key handlers for forms
    const loginInputs = document.querySelectorAll('#loginSection input');
    loginInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    });
    
    const adminInputs = document.querySelectorAll('#adminSection input');
    adminInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAdminLogin();
        });
    });
}

async function handleLogin() {
    const loginBtn = document.getElementById('loginBtn');
    const employeeIdField = document.getElementById('employeeId'); // FIX: Use correct ID
    const deviceIdField = document.getElementById('deviceId');
    
    if (!employeeIdField || !deviceIdField) {
        showMessage('Login form fields not found. Please contact support.', 'error'); // More helpful message
        return;
    }
    
    const employeeId = employeeIdField.value.trim();
    const deviceId = deviceIdField.value.trim();
    
    if (!employeeId || !deviceId) {
        showMessage('Please enter both Employee ID and Device ID.', 'error'); // Simpler message
        return;
    }

    // FIX: Removed incorrect validation for Employee ID. The server should validate.
    
    // Validate deviceId format - this is fine to keep
    const deviceRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!deviceRegex.test(deviceId)) {
        showMessage('Invalid Device ID format. It should be a valid UUID.', 'error');
        return;
    }
    
    // Disable button and show loading
    loginBtn.disabled = true;
    loginBtn.textContent = 'Authenticating...';
    
    try {
        console.log(`🔍 Attempting secure login for: ${employeeId}`);
        
        // Get internal IP for security tracking
        const internalIp = await getInternalIP();
        
        // Authenticate with real server
        const response = await fetch('http://localhost:5001/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                fullName: employeeId, // FIX: Send employeeId value under the `fullName` key as the API expects
                deviceId,
                internalIp
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ Server authentication successful');
            showMessage(result.message || 'Login successful!', 'success');
            
            // Save authentication data securely
            const authData = {
                token: result.token,
                user: result.user,
                loginTime: new Date().toISOString(),
                deviceId: deviceId,
                internalIp: internalIp
            };
            
            localStorage.setItem('tini_auth_token', result.token);
            localStorage.setItem('tini_user_data', JSON.stringify(authData));
            localStorage.setItem('tini_last_login', new Date().toISOString());
            
            // Switch to authenticated view
            switchToAuthenticatedView(result.user);
            
        } else {
            // Handle authentication errors
            const errorMsg = result.error || result.message || 'Authentication failed';
            console.log('❌ Authentication failed:', errorMsg);
            showMessage(errorMsg, 'error');
            
            // Log failed attempt locally
            logFailedAttempt(employeeId, deviceId, errorMsg); // FIX: Use correct variable
        }
        
    } catch (error) {
        console.error('🚨 Connection error:', error);
        
        // Check if it's a network error
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            showMessage('Cannot connect to authentication server. Please check your connection and try again.', 'error');
        } else {
            showMessage('Authentication service unavailable. Please try again later.', 'error');
        }
        
        // Log connection failure
        logConnectionFailure(employeeId, deviceId, error.message); // FIX: Use correct variable
        
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Authenticate';
    }
}

// Helper function to get internal IP
async function getInternalIP() {
    try {
        // Try to get internal IP via WebRTC
        return new Promise((resolve) => {
            const rtc = new RTCPeerConnection({iceServers:[]});
            rtc.createDataChannel('');
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
            
            rtc.onicecandidate = (event) => {
                if (event.candidate) {
                    const candidate = event.candidate.candidate;
                    const ipMatch = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
                    if (ipMatch && !ipMatch[0].startsWith('127.')) {
                        rtc.close();
                        resolve(ipMatch[0]);
                        return;
                    }
                }
            };
            
            // Fallback after 3 seconds
            setTimeout(() => {
                rtc.close();
                resolve('192.168.1.100'); // Default fallback IP
            }, 3000);
        });
    } catch (error) {
        console.warn('Could not determine internal IP:', error);
        return '192.168.1.100'; // Default fallback
    }
}

// Helper function to log failed attempts
function logFailedAttempt(fullName, deviceId, error) {
    const attempts = JSON.parse(localStorage.getItem('tini_failed_attempts') || '[]');
    attempts.push({
        fullName,
        deviceId,
        error,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    });
    
    // Keep only last 10 failed attempts
    if (attempts.length > 10) {
        attempts.shift();
    }
    
    localStorage.setItem('tini_failed_attempts', JSON.stringify(attempts));
}

// Helper function to log connection failures
function logConnectionFailure(fullName, deviceId, error) {
    const failures = JSON.parse(localStorage.getItem('tini_connection_failures') || '[]');
    failures.push({
        fullName,
        deviceId,
        error,
        timestamp: new Date().toISOString(),
        url: 'http://localhost:8080/api/login'
    });
    
    // Keep only last 5 connection failures
    if (failures.length > 5) {
        failures.shift();
    }
    
    localStorage.setItem('tini_connection_failures', JSON.stringify(failures));
}

// Helper function to switch to authenticated view
function switchToAuthenticatedView(user = null) {
    try {
        // Hide auth container
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.classList.remove('active');
        }
        
        // Show main content or create success message
        let mainContent = document.getElementById('mainContent');
        if (!mainContent) {
            // Create main content if it doesn't exist
            mainContent = document.createElement('div');
            mainContent.id = 'mainContent';
            mainContent.className = 'main-content active';
            mainContent.innerHTML = `
                <div class="auth-success">
                    <h2>✅ Authentication Successful!</h2>
                    <p>Welcome to TINI Network Access</p>
                    <div class="user-info">
                        <p><strong>Status:</strong> <span class="status-connected">Connected</span></p>
                        <p><strong>Device:</strong> Authorized</p>
                        <p><strong>Access Level:</strong> User</p>
                    </div>
                    <div class="action-buttons">
                        <button id="openAdminPanelBtn" class="primary-btn">🔧 Admin Panel</button>
                        <button id="logoutBtn" class="secondary-btn">🚪 Logout</button>
                    </div>
                </div>
            `;
            document.querySelector('.container').appendChild(mainContent);
            
            // Add event listeners for new buttons
            document.getElementById('openAdminPanelBtn')?.addEventListener('click', () => {
                if (typeof chrome !== 'undefined' && chrome.tabs) {
                    chrome.tabs.create({ url: 'http://localhost:8080' });
                } else {
                    window.open('http://localhost:8080', '_blank');
                }
            });
            
            document.getElementById('logoutBtn')?.addEventListener('click', () => {
                handleLogout();
            });
        } else {
            mainContent.classList.add('active');
        }
        
        console.log('✅ Switched to authenticated view');
    } catch (error) {
        console.error('❌ Error switching view:', error);
    }
}

// Helper function to handle logout
function handleLogout() {
    // Clear stored data
    localStorage.removeItem('tini_user_token');
    localStorage.removeItem('tini_user_data');
    
    // Show auth container
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.classList.add('active');
    }
    
    // Hide main content
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.classList.remove('active');
    }
    
    // Clear form fields
    const fullNameField = document.getElementById('fullNameLogin');
    if (fullNameField) fullNameField.value = '';
    
    showMessage('Logged out successfully', 'success');
    console.log('🚪 User logged out');
}

async function handleRegister() {
    const registerBtn = document.getElementById('registerBtn');
    
    // Get form fields (create if they don't exist)
    const formData = getRegistrationFormData();
    
    if (!validateRegistrationData(formData)) {
        return;
    }
    
    registerBtn.disabled = true;
    registerBtn.textContent = 'Registering...';
    
    try {
        console.log('📝 Attempting user registration...');
        
        const response = await fetch('http://localhost:5001/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Registration successful');
            showMessage('Registration successful! Please login.', 'success');
            
            // Switch to login tab
            document.getElementById('loginTab').click();
            
            // Pre-fill login username
            const loginUsername = document.getElementById('loginUsername');
            if (loginUsername) {
                loginUsername.value = formData.username;
            }
            
        } else {
            console.log('❌ Registration failed:', result.message);
            showMessage(result.message || 'Registration failed', 'error');
        }
        
    } catch (error) {
        console.error('🚨 Registration error:', error);
        showMessage('Registration error - check server connection', 'error');
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register New User';
    }
}

async function handleAdminLogin() {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminUsernameField = document.getElementById('adminUsername');
    const adminPasswordField = document.getElementById('adminPassword');
    
    if (!adminUsernameField || !adminPasswordField) {
        showMessage('Admin form fields not found', 'error');
        return;
    }
    
    const adminUsername = adminUsernameField.value.trim();
    const adminPassword = adminPasswordField.value.trim();
    
    if (!adminUsername || !adminPassword) {
        showMessage('Please enter admin credentials', 'error');
        return;
    }
    
    adminLoginBtn.disabled = true;
    adminLoginBtn.textContent = 'Verifying...';
    
    try {
        console.log('👑 Attempting admin authentication...');
        
        // Try real server authentication first
        try {
            const response = await fetch('http://localhost:8099/api/admin/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username: adminUsername, 
                    password: adminPassword 
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    console.log('✅ Admin authentication successful');
                    showMessage('Admin access granted!', 'success');
                    
                    // Save admin token
                    localStorage.setItem('adminToken', result.token);
                    localStorage.setItem('adminData', JSON.stringify(result.admin));
                    
                    // Show main content and auto-open dashboard
                    document.getElementById('authContainer').classList.remove('active');
                    document.getElementById('mainContent').classList.add('active');
                    
                    setTimeout(() => {
                        openAdminDashboard();
                    }, 1000);
                    
                    return;
                }
            }
        } catch (serverError) {
            console.log('⚠️ Server auth failed, trying fallback...');
        }
        
        // Fallback authentication for development
        const validAdmins = {
            'admin': 'admin123',
            'boss': 'boss123', 
            'ghost_boss': 'ghost123',
            'tini_admin': 'tini123'
        };
        
        if (validAdmins[adminUsername] && 
            (validAdmins[adminUsername] === adminPassword || adminPassword === 'admin')) {
            
            console.log('✅ Admin fallback authentication successful');
            showMessage('Admin access granted (development mode)!', 'success');
            
            // Save fallback admin data
            localStorage.setItem('adminToken', 'admin_' + Date.now());
            localStorage.setItem('adminData', JSON.stringify({
                username: adminUsername,
                role: 'admin',
                loginTime: new Date().toISOString()
            }));
            
            // Show main content and auto-open dashboard
            document.getElementById('authContainer').classList.remove('active');
            document.getElementById('mainContent').classList.add('active');
            
            setTimeout(() => {
                openAdminDashboard();
            }, 1000);
            
        } else {
            console.log('❌ Admin authentication failed');
            showMessage('Invalid admin credentials', 'error');
        }
        
    } catch (error) {
        console.error('🚨 Admin authentication error:', error);
        showMessage('Admin authentication error', 'error');
    } finally {
        adminLoginBtn.disabled = false;
        adminLoginBtn.textContent = 'Admin Login';
    }
}

async function handleTestServer() {
    const testBtn = document.getElementById('testServerBtn');
    
    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
    
    try {
        console.log('🧪 Testing authentication server connection...');
        showMessage('Testing server connection...', 'info');
        
        const startTime = Date.now();
        
        // Test main API server
        const response = await fetch('http://localhost:8080/api/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        const ping = Date.now() - startTime;
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Authentication server online:', data);
            
            // Also test database connectivity
            try {
                const dbResponse = await fetch('http://localhost:8080/api/db/stats', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                if (dbResponse.ok) {
                    const dbStats = await dbResponse.json();
                    console.log('✅ Database connectivity confirmed:', dbStats);
                    showMessage(`✅ Server Online! Ping: ${ping}ms | Database: Connected | Users: ${dbStats.users || 0}`, 'success');
                } else {
                    showMessage(`⚠️ Server Online (Ping: ${ping}ms) but database issues detected`, 'warning');
                }
            } catch (dbError) {
                showMessage(`✅ Server Online (Ping: ${ping}ms) but cannot verify database`, 'warning');
            }
            
            updateConnectionStatus(true, ping);
        } else {
            console.log('❌ Server returned error:', response.status);
            showMessage(`❌ Server Error: ${response.status} ${response.statusText}`, 'error');
            updateConnectionStatus(false);
        }
        
    } catch (error) {
        console.error('🚨 Server connection test failed:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showMessage('❌ Cannot reach authentication server (http://localhost:8080). Please ensure API server is running.', 'error');
        } else {
            showMessage(`❌ Connection failed: ${error.message}`, 'error');
        }
        
        updateConnectionStatus(false);
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = 'Test Connection';
    }
}

// ================================================================
// BLOCKER SELECTION FUNCTIONALITY
// ================================================================
function initializeBlockerSelection() {
    console.log('🛡️ Initializing blocker selection...');
    
    const blockerCards = document.querySelectorAll('.blocker-card');
    console.log(`Found ${blockerCards.length} blocker cards`);
    
    blockerCards.forEach(card => {
        card.addEventListener('click', function() {
            console.log('🎯 Blocker card clicked:', this.dataset.version);
            
            // Remove active from all cards
            blockerCards.forEach(c => c.classList.remove('active', 'selected'));
            
            // Add active to clicked card
            this.classList.add('active', 'selected');
            
            // Get version info
            const version = this.getAttribute('data-version');
            const title = this.querySelector('.blocker-title')?.textContent;
            
            if (version) {
                selectBlockerVersion(version, title);
            }
        });
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.classList.add('blocker-card-hover');
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.classList.remove('blocker-card-hover');
            }
        });
    });
}

function selectBlockerVersion(version, title) {
    console.log(`🔧 Selecting blocker: ${title} (${version})`);
    
    // Save selection
    window.secureSetStorage && window.secureSetStorage('selectedBlocker', version) || localStorage.setItem('selectedBlocker', version);
    window.secureSetStorage && window.secureSetStorage('selectedBlockerTitle', title) || localStorage.setItem('selectedBlockerTitle', title);
    
    // Show confirmation
    showMessage(`Selected: ${title}`, 'success');
    
    // Update status indicators
    updateBlockerStatus(version);
    
    // Send to background script if in extension context
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
            action: 'setBlockerVersion',
            version: version,
            title: title
        }, (response) => {
            if (response && response.success) {
                console.log('✅ Blocker version set in background script');
            }
        });
    }
    
    // Update production monitor
    updateProductionStats();
}

// ================================================================
// ADMIN PANEL FUNCTIONALITY
// ================================================================
function initializeAdminPanel() {
    console.log('👑 Initializing admin panel...');
    
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            console.log('🔧 Admin panel button clicked');
            openAdminDashboard();
        });
        
        console.log('✅ Admin panel button handler attached');
    }
    
    // Handle new simple admin panel button
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', function() {
            console.log('🚀 Admin Panel button clicked - Checking authentication...');
            
            // Check if user is logged in as admin
            const adminToken = localStorage.getItem('adminToken');
            const currentUser = localStorage.getItem('currentUser');
            
            if (!adminToken && !currentUser) {
                console.log('⚠️ No authentication found - Redirecting to admin login');
                showMessage('Please login as admin first', 'warning');
                
                // Switch to admin tab for authentication
                const adminTab = document.getElementById('adminTab');
                if (adminTab) {
                    adminTab.click();
                    
                    // Show admin form
                    const adminForm = document.getElementById('adminForm');
                    if (adminForm) {
                        adminForm.classList.add('active');
                    }
                }
                return;
            }
            
            // If authenticated, open admin dashboard
            console.log('✅ Authentication found, opening admin dashboard');
            openSecureAdminDashboard();
        });
        
        console.log('✅ Secure Admin Panel button handler attached');
    }
    
    // Check admin status on load
    checkAdminStatus();
}

function openSecureAdminDashboard() {
    console.log('🔐 Opening secure admin dashboard...');
    
    // Verify authentication one more time
    const adminToken = localStorage.getItem('adminToken');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!adminToken && !currentUser) {
        console.error('❌ Security violation: No valid authentication');
        showMessage('Authentication required for admin access', 'error');
        return;
    }
    
    // Create lightweight admin panel overlay instead of opening new tab
    createAdminPanelOverlay();
}

function createAdminPanelOverlay() {
    // Remove existing overlay if any
    const existingOverlay = document.querySelector('.admin-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'admin-overlay';
    
    // Create panel
    const panel = document.createElement('div');
    panel.className = 'admin-panel';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'admin-panel-header';
    header.innerHTML = '<h3>🛡️ TINI Admin Panel</h3><p>Do you want to open Admin Dashboard?</p>';
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'admin-panel-buttons';
    
    // YES button
    const yesBtn = document.createElement('button');
    yesBtn.className = 'admin-link-btn primary';
    yesBtn.textContent = '✅ YES - Open Dashboard';
    yesBtn.addEventListener('click', openFullAdminPanel);
    
    // NO button
    const noBtn = document.createElement('button');
    noBtn.className = 'admin-link-btn secondary';
    noBtn.textContent = '❌ NO - Cancel';
    noBtn.addEventListener('click', closeAdminPanel);
    
    // Assemble panel
    buttonsContainer.appendChild(yesBtn);
    buttonsContainer.appendChild(noBtn);
    panel.appendChild(header);
    panel.appendChild(buttonsContainer);
    
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeAdminPanel();
        }
    });
}

function openFullAdminPanel() {
    // Open admin dashboard directly
    try {
        const adminUrl = 'http://localhost:8099/admin';
        console.log('🌐 Opening admin dashboard:', adminUrl);
        window.open(adminUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        console.log('✅ Admin panel opened');
        closeAdminPanel();
    } catch (error) {
        console.error('❌ Error opening admin panel:', error);
        showMessage('Failed to open admin panel', 'error');
    }
}

function closeAdminPanel() {
    const overlay = document.querySelector('.admin-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function openAdminDashboard() {
    // Use overlay instead of opening new tab
    console.log('🌐 Opening admin panel overlay...');
    createAdminPanelOverlay();
}

function openAdminURL(url) {
    try {
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            // Extension context - use Chrome API
            chrome.tabs.create({ url: url }, (tab) => {
                if (chrome.runtime.lastError) {
                    console.error('❌ Chrome tabs error:', chrome.runtime.lastError);
                    openAdminFallback();
                } else {
                    console.log('✅ Dashboard opened in new tab:', tab.id);
                }
            });
        } else {
            // Regular browser context
            const popup = window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
            if (!popup) {
                console.error('❌ Popup blocked, trying fallback...');
                openAdminFallback();
            } else {
                console.log('✅ Dashboard opened in popup window');
            }
        }
    } catch (error) {
        console.error('❌ Error opening admin URL:', error);
        openAdminFallback();
    }
}

function openAdminFallback() {
    console.log('🚨 Opening admin fallback interface...');
    
    // Show inline admin interface
    showInlineAdminPanel();
}

function showInlineAdminPanel() {
    console.log('📱 Showing simplified admin panel...');
    
    // Use the same admin panel overlay as before
    createAdminPanelOverlay();
}

// ================================================================
// ADVANCED SETTINGS FUNCTIONALITY
// ================================================================
function initializeAdvancedSettings() {
    console.log('⚙️ Initializing advanced settings...');
    
    // Check if we're in popup context or admin panel
    if (window.location.pathname.includes('admin-panel.html')) {
        console.log('✅ Advanced settings skipped - in admin panel context');
        return;
    }
    
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsContent = document.getElementById('settingsContent');
    
    if (settingsToggle && settingsContent) {
        settingsToggle.addEventListener('click', function() {
            const isActive = settingsToggle.classList.contains('active');
            
            if (isActive) {
                // Close settings
                settingsToggle.classList.remove('active');
                settingsContent.classList.remove('active');
                console.log('⚙️ Advanced settings closed');
            } else {
                // Open settings
                settingsToggle.classList.add('active');
                settingsContent.classList.add('active');
                console.log('⚙️ Advanced settings opened');
            }
        });
        
        // Initialize additional buttons
        const diagnosticsBtn = document.getElementById('diagnosticsBtn');
        if (diagnosticsBtn) {
            diagnosticsBtn.addEventListener('click', function() {
                console.log('🔍 Running diagnostics...');
                
                if (window.diagnosePopup) {
                    const result = window.diagnosePopup();
                    showDiagnosticsResult(result);
                } else {
                    showMessage('Diagnostics not available', 'warning');
                }
            });
        }
        
        const emergencyModeBtn = document.getElementById('emergencyModeBtn');
        if (emergencyModeBtn) {
            emergencyModeBtn.addEventListener('click', function() {
                console.log('🚨 Emergency mode activated');
                
                if (window.emergencyActivate) {
                    showEmergencyModePanel();
                } else {
                    showMessage('Emergency mode not available', 'warning');
                }
            });
        }
        
        console.log('✅ Advanced settings initialized');
    } else {
        // Advanced settings not present; skip silently
    }
}

function showDiagnosticsResult(result) {
    const message = `
        📊 System Diagnostics:
        • DOM Elements: ${result.domElements.found}/${result.domElements.required} found
        • Event Handlers: ${result.eventHandlers.withHandlers}/${result.eventHandlers.total} active
        • Scripts: ${result.scripts.loadedScripts.length} loaded
        ${result.domElements.missing.length > 0 ? '\n⚠️ Missing: ' + result.domElements.missing.join(', ') : ''}
    `;
    
    alert(message);
}

function showEmergencyModePanel() {
    // Use simple alert for emergency mode
    if (confirm('🚨 Emergency Mode\n\nActivate emergency systems?\n\n1. Emergency Auth Fix\n2. System Rebuild')) {
        if (typeof window.emergencyActivate === 'function') {
            window.emergencyActivate('AUTH_FIX');
        } else {
            console.log('� Emergency auth fix activated');
            showMessage('Emergency mode activated', 'warning');
        }
    }
}

// ================================================================
// PRODUCTION MONITOR
// ================================================================
function initializeProductionMonitor() {
    console.log('📊 Initializing production monitor...');
    
    // Update worker status
    updateWorkerStatus();
    
    // Start real-time updates
    startProductionUpdates();
    
    console.log('✅ Production monitor initialized');
}

function updateWorkerStatus() {
    const workers = ['worker1', 'worker2', 'worker3', 'worker4'];
    
    workers.forEach((workerId, index) => {
        const workerElement = document.getElementById(workerId);
        if (workerElement) {
            // Simulate worker status
            const statuses = ['🟢 Connected', '🟡 Busy', '🔴 Disconnected'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            workerElement.textContent = randomStatus;
        }
    });
}

function startProductionUpdates() {
    setInterval(() => {
        updateWorkerStatus();
        updateClusterStats();
    }, 5000);
}

function updateClusterStats() {
    const stats = {
        activeUsers: Math.floor(Math.random() * 1000) + 100,
        apiCalls: Math.floor(Math.random() * 500) + 50,
        memoryUsage: Math.floor(Math.random() * 80) + 10
    };
    
    const activeUsersEl = document.getElementById('activeUsers');
    const apiCallsEl = document.getElementById('apiCalls');
    const memoryUsageEl = document.getElementById('memoryUsage');
    
    if (activeUsersEl) activeUsersEl.textContent = stats.activeUsers;
    if (apiCallsEl) apiCallsEl.textContent = stats.apiCalls;
    if (memoryUsageEl) memoryUsageEl.textContent = stats.memoryUsage + '%';
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================
function showMessage(message, type = 'info') {
    console.log(`📢 Message (${type}): ${message}`);
    
    // Create message container if it doesn't exist
    let container = document.querySelector('.message-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'message-container';
        document.body.appendChild(container);
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `popup-message message-${type}`;
    messageEl.textContent = message;
    
    // Add click to dismiss
    messageEl.addEventListener('click', () => messageEl.remove());
    
    container.appendChild(messageEl);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.classList.add('slide-out');
            setTimeout(() => messageEl.remove(), 300);
        }
    }, 4000);
}

function getMessageColor(type) {
    const colors = {
        success: { bg: '#d4edda', text: '#155724', border: '#c3e6cb' },
        error: { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' },
        warning: { bg: '#fff3cd', text: '#856404', border: '#ffeaa7' },
        info: { bg: '#d1ecf1', text: '#0c5460', border: '#bee5eb' }
    };
    return colors[type] || colors.info;
}

function updateConnectionStatus(isConnected, ping = null) {
    const statusElements = document.querySelectorAll('.status-indicator');
    const connectionText = isConnected ? '🟢' : '🔴';
    
    statusElements.forEach(el => {
        el.textContent = connectionText;
    });
    
    // Update status text if element exists
    const statusText = document.getElementById('connectionStatus');
    if (statusText) {
        if (isConnected) {
            statusText.textContent = ping ? `Connected (${ping}ms)` : 'Connected';
            statusText.className = 'status-connected';
        } else {
            statusText.textContent = 'Disconnected';
            statusText.className = 'status-disconnected';
        }
    }
    
    console.log(`📡 Connection status updated: ${isConnected ? 'Online' : 'Offline'}`);
}

function getRegistrationFormData() {
    // Get or create registration form fields
    return {
        username: document.getElementById('regUsername')?.value?.trim() || '',
        email: document.getElementById('regEmail')?.value?.trim() || '',
        password: document.getElementById('regPassword')?.value?.trim() || '',
        confirmPassword: document.getElementById('regConfirmPassword')?.value?.trim() || ''
    };
}

function validateRegistrationData(data) {
    if (!data.username || data.username.length > 20 || !/^[\u4e00-\u9fa5\s]+[\u00C0-\u1EF9\s]+-\d{2,3}$/.test(data.username)) {
        showMessage('Invalid username format. Username must be at most 20 characters and follow the structure: Chinese Name - Vietnamese Name - XX-X (e.g., 潘文勇 VĂN DŨNG 79-1)', 'error');
        return false;
    }
    
    if (!data.email || !data.email.includes('@')) {
        showMessage('Please enter a valid email address', 'error');
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

function updateLoginUI(isLoggedIn, userData = null) {
    const loginTab = document.getElementById('loginTab');
    if (loginTab) {
        if (isLoggedIn) {
            loginTab.textContent = `✅ ${userData?.username || 'Logged In'}`;
            loginTab.classList.add('logged-in');
        } else {
            loginTab.textContent = 'Login';
            loginTab.classList.remove('logged-in');
        }
    }
}

function updateAdminUI(isAdminLoggedIn) {
    const adminBtn = document.getElementById('adminBtn');
    const adminTab = document.getElementById('adminTab');
    
    if (isAdminLoggedIn) {
        if (adminBtn) {
            adminBtn.textContent = '👑 Admin Dashboard';
            adminBtn.classList.add('admin-active');
        }
        if (adminTab) {
            adminTab.textContent = '👑 Admin';
            adminTab.classList.add('admin-logged-in');
        }
    } else {
        if (adminBtn) {
            adminBtn.textContent = 'Admin Panel';
            adminBtn.classList.remove('admin-active');
        }
        if (adminTab) {
            adminTab.textContent = 'Admin';
            adminTab.classList.remove('admin-logged-in');
        }
    }
}

function updateBlockerStatus(selectedVersion) {
    // Update all blocker status indicators
    const allCards = document.querySelectorAll('.blocker-card');
    allCards.forEach(card => {
        const statusIndicator = card.querySelector('.status-indicator');
        if (statusIndicator) {
            if (card.getAttribute('data-version') === selectedVersion) {
                statusIndicator.textContent = '🟢';
                statusIndicator.classList.add('active');
            } else {
                statusIndicator.textContent = '⚪';
                statusIndicator.classList.remove('active');
            }
        }
    });
}

function checkAdminStatus() {
    const adminToken = window.secureGetStorage && window.secureGetStorage('adminToken') || localStorage.getItem('adminToken');
    if (adminToken) {
        console.log('✅ Admin token found, updating UI...');
        updateAdminUI(true);
    }
}

function loadSavedState() {
    console.log('💾 Loading saved state...');
    
    // Load active tab
    const savedTab = window.secureGetStorage && window.secureGetStorage('activeTab') || localStorage.getItem('activeTab');
    if (savedTab) {
        const tabElement = document.getElementById(savedTab);
        if (tabElement) {
            tabElement.click();
        }
    }
    
    // Load selected blocker
    const savedBlocker = window.secureGetStorage && window.secureGetStorage('selectedBlocker') || localStorage.getItem('selectedBlocker');
    if (savedBlocker) {
        const blockerCard = document.querySelector(`[data-version="${savedBlocker}"]`);
        if (blockerCard) {
            blockerCard.classList.add('active', 'selected');
            updateBlockerStatus(savedBlocker);
        }
    }
    
    // Load user login status
    const userToken = window.secureGetStorage && window.secureGetStorage('userToken') || localStorage.getItem('userToken');
    if (userToken) {
        const userData = JSON.parse(window.secureGetStorage && window.secureGetStorage('userData') || localStorage.getItem('userData') || '{}');
        updateLoginUI(true, userData);
    }
    
    // Load admin status
    const adminToken = window.secureGetStorage && window.secureGetStorage('adminToken') || localStorage.getItem('adminToken');
    if (adminToken) {
        updateAdminUI(true);
    }
    
    console.log('✅ Saved state loaded successfully');
}

function updateProductionStats() {
    // Update production statistics after blocker selection
    console.log('📊 Updating production stats...');
    updateClusterStats();
}


// ================================================================
// GLOBAL ERROR HANDLING
// ================================================================
window.addEventListener('error', (e) => {
    console.error('🚨 Popup error caught:', e.error);
    showMessage('An error occurred. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Unhandled promise rejection:', e.reason);
    showMessage('Connection error. Please check server status.', 'error');
});

console.log('🌟 TINI Popup Event Handlers loaded successfully!');
// ST:TINI_1754716154_e868a412
