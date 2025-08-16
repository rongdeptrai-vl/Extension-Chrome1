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

// Dynamic Admin Panel base URL helper (added)
(function initPanelBaseHelper(){
  try {
    if (typeof window.getPanelBase !== 'function') {
      const DEFAULT_PORT = 55057; // Updated to match actual server port
      window.__tiniPanelPort = window.__tiniPanelPort || window.TINI_PANEL_PORT || localStorage.getItem('tini_panel_port') || DEFAULT_PORT;
      window.setPanelPort = function(p){ if(p){ window.__tiniPanelPort = p; localStorage.setItem('tini_panel_port', p); } };
      window.getPanelBase = function(){ return `http://localhost:${window.__tiniPanelPort}`; };
      // Auto-detect a live panel port (55057 -> 55055 -> 55056)
      window.resolvePanelBase = async function(){
        const seen = new Set();
        const current = Number(window.__tiniPanelPort || DEFAULT_PORT);
        const candidates = [current, 55057, 55055, 55056].filter(p=>{ if(seen.has(p)) return false; seen.add(p); return true; });
        const ping = async (port)=>{
          const url = `http://localhost:${port}/api/health`;
          const controller = new AbortController();
          const t = setTimeout(()=>controller.abort(), 1200);
          try {
            const res = await fetch(url, { method:'GET', signal: controller.signal, headers: { 'Accept': 'application/json' } });
            clearTimeout(t);
            if(res.ok) return true;
          } catch(_) { /* ignore */ }
          return false;
        };
        for(const p of candidates){
          const ok = await ping(p);
          if(ok){ window.setPanelPort(p); return `http://localhost:${p}`; }
        }
        return window.getPanelBase();
      };
      console.log('[popup] Panel base initialized ->', window.getPanelBase());
    }
  } catch(e){ console.warn('[popup] Panel base init failed:', e); }
})();

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
    
    // Initialize tab switching first so UI responds
    initializeTabSwitching();
    
    // Initialize device ID FIRST to check registration status
    // This will also initialize name helper after device check is complete
    initializeDeviceId();
    
    initializeAuthHandlers();
    initializeBlockerSelection && initializeBlockerSelection();
    initializeAdminPanel && initializeAdminPanel();
    initializeProductionMonitor && initializeProductionMonitor();
    
    // Only initialize advanced settings if we're in popup context
    const advEl = document.getElementById("advanced-settings");
    if (advEl && typeof initializeAdvancedSettings === 'function') {
        initializeAdvancedSettings();
    } else {
        // Silently skip if not present
    }
    
    // Load saved state
    loadSavedState && loadSavedState();
    
    // Apply initial constraints after a short delay to ensure all elements are ready
    setTimeout(() => {
        if (typeof applyDeviceRegisteredConstraint === 'function') {
            applyDeviceRegisteredConstraint();
        }
    }, 100);

    // Resolve panel base automatically
    if (typeof window.resolvePanelBase === 'function') {
        window.resolvePanelBase().then(base=>console.log('[popup] Resolved panel base:', base));
    }

    // Populate IP fields (internal/public)
    updateIpDisplay();
    
    console.log('✅ All popup handlers initialized successfully');
}

// Expose utility functions to global scope for testing
window.TINI_DEBUG = {
    markDeviceAsRegistered,
    clearDeviceRegistration,
    forceUpdateDeviceConstraintHint,
    getRegistrationInfo: () => window.__registeredDeviceInfo,
    getDeviceId: () => localStorage.getItem('device_id')
};

function updateIpDisplay() {
    const internalEl = document.getElementById('internalIp');
    const detectedEl = document.getElementById('detectedIp');

    if (internalEl) {
        internalEl.textContent = 'Detecting...';
        getInternalIP()
            .then(ip => {
                if (!ip || ip === '192.168.1.100') {
                    internalEl.textContent = 'Unavailable (Chrome privacy)';
                    internalEl.title = 'Chrome hạn chế truy cập IP nội bộ (mDNS/WebRTC). Đây là bình thường.';
                } else {
                    internalEl.textContent = ip;
                }
            })
            .catch(() => {
                internalEl.textContent = 'Unavailable';
            });
    }

    if (detectedEl) {
        getPublicIP()
            .then(ip => { detectedEl.textContent = ip || 'Unknown'; })
            .catch(() => { detectedEl.textContent = 'Unknown'; });
    }
}

async function getPublicIP() {
    try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
        clearTimeout(t);
        const data = await res.json();
        return data?.ip || 'Unknown';
    } catch (e) {
        return 'Unknown';
    }
}

// Event handlers initialization
function initializeTabSwitching() {
    console.log('🔧 Initializing tab switching...');
    
    // Tab navigation
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and forms
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding form
            const targetForm = tab.id === 'loginTab' ? 'loginForm' : 'registerForm';
            document.getElementById(targetForm)?.classList.add('active');

            // Hide global error messages when switching to Login tab
            if (targetForm === 'loginForm') {
                const messageContainer = document.getElementById('errorMessage');
                if (messageContainer) {
                    messageContainer.style.display = 'none';
                }
            }

            // NEW: when moving to Register, enforce device-registered constraint immediately
            if (targetForm === 'registerForm' && typeof applyDeviceRegisteredConstraint === 'function') {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    applyDeviceRegisteredConstraint();
                    // Force update hint if device is registered
                    forceUpdateDeviceConstraintHint();
                    if (window.__registeredDeviceInfo) {
                        const hint = document.getElementById('nameFormatHint');
                        if (hint) {
                            hint.textContent = 'Thiết Bị Này Đã Được Đăng Ký';
                            hint.style.color = '#e74c3c';
                            console.log('🔴 Forced hint update on tab switch');
                        }
                        // Show device registered message only on Register tab
                        const messageContainer = document.getElementById('errorMessage');
                        if (messageContainer && messageContainer.textContent.includes('Thiết bị này đã được đăng ký')) {
                            messageContainer.style.display = 'block';
                        }
                    }
                    // Also trigger name validation if there's content
                    const nameInput = document.getElementById('employeeName');
                    if (nameInput && nameInput.value.trim() && !window.__registeredDeviceInfo) {
                        nameInput.dispatchEvent(new Event('input'));
                    }
                }, 50);
            }
        });
    });
}

function initializeAuthHandlers() {
    console.log('🔧 Initializing auth handlers...');
    
    // Add login handler
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Add register handler  
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
    }
    
    // Add admin login handler
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', handleAdminLogin);
    }
    
    // Add server test handler
    const testServerBtn = document.getElementById('testServerBtn');
    if (testServerBtn) {
        testServerBtn.addEventListener('click', handleTestServer);
    }
    
    // Add Enter key support for login form
    const employeeIdInput = document.getElementById('employeeId');
    if (employeeIdInput) {
        employeeIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
    
    const deviceIdInput = document.getElementById('deviceId');
    if (deviceIdInput) {
        deviceIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
}

function initializePopupComponents() {
    console.log('🚀 TINI Popup initializing...');
    
    // Initialize tab switching first so UI responds
    initializeTabSwitching();
    
    // Initialize device ID FIRST to check registration status
    // This will also initialize name helper after device check is complete
    initializeDeviceId();
    
    initializeAuthHandlers();
    
    // Initialize optional components if they exist
    if (typeof initializeBlockerSelection === 'function') {
        initializeBlockerSelection();
    }
    if (typeof initializeAdminPanel === 'function') {
        initializeAdminPanel();
    }
    if (typeof initializeProductionMonitor === 'function') {
        initializeProductionMonitor();
    }
    
    // Only initialize advanced settings if we're in popup context
    const advEl = document.getElementById("advanced-settings");
    if (advEl && typeof initializeAdvancedSettings === 'function') {
        initializeAdvancedSettings();
    }
    
    // Load saved state if function exists
    if (typeof loadSavedState === 'function') {
        loadSavedState();
    }
    
    // Initialize device fingerprint
    initializeDeviceFingerprint();

    // Populate IP fields (internal/public)
    updateIpDisplay();
    
    console.log('✅ All popup handlers initialized successfully');
}

// Stub functions for missing components
function initializeBlockerSelection() {
    console.log('🔧 Blocker selection initialized (stub)');
}

function initializeAdminPanel() {
    console.log('🔧 Admin panel initialized');
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', async () => {
            console.log('🔧 Admin button clicked');
            const base = (typeof window.resolvePanelBase === 'function') ? await window.resolvePanelBase() : (typeof getPanelBase==='function'? getPanelBase() : 'http://localhost:55055');
            openAdminPanelWindow(base);
        });
    }
    const adminPanelBar = document.getElementById('adminPanelBar');
    if (adminPanelBar) {
        adminPanelBar.style.cursor = 'pointer';
        adminPanelBar.addEventListener('click', async () => {
            console.log('🔧 Admin panel bar clicked');
            const base = (typeof window.resolvePanelBase === 'function') ? await window.resolvePanelBase() : (typeof getPanelBase==='function'? getPanelBase() : 'http://localhost:55055');
            openAdminPanelWindow(base);
        });
    }
}

function initializeProductionMonitor() {
    console.log('🔧 Production monitor initialized (stub)');
}

function loadSavedState() {
    console.log('🔧 Loading saved state (stub)');
}

// Stub functions for missing components
function initializeBlockerSelection() {
    console.log('🔧 Blocker selection initialized (stub)');
}

function initializeAdminPanel() {
    console.log('🔧 Admin panel initialized');
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', async () => {
            console.log('🔧 Admin button clicked');
            const base = (typeof window.resolvePanelBase === 'function') ? await window.resolvePanelBase() : (typeof getPanelBase==='function'? getPanelBase() : 'http://localhost:55055');
            openAdminPanelWindow(base);
        });
    }
    const adminPanelBar = document.getElementById('adminPanelBar');
    if (adminPanelBar) {
        adminPanelBar.style.cursor = 'pointer';
        adminPanelBar.addEventListener('click', async () => {
            console.log('🔧 Admin panel bar clicked');
            const base = (typeof window.resolvePanelBase === 'function') ? await window.resolvePanelBase() : (typeof getPanelBase==='function'? getPanelBase() : 'http://localhost:55055');
            openAdminPanelWindow(base);
        });
    }
}

function initializeProductionMonitor() {
    console.log('🔧 Production monitor initialized (stub)');
}

function updateIpDisplay() {
    const internalEl = document.getElementById('internalIp');
    const detectedEl = document.getElementById('detectedIp');

    if (internalEl) {
        internalEl.textContent = 'Detecting...';
        getInternalIP()
            .then(ip => {
                if (!ip || ip === '192.168.1.100') {
                    internalEl.textContent = 'Unavailable (Chrome privacy)';
                    internalEl.title = 'Chrome hạn chế truy cập IP nội bộ (mDNS/WebRTC). Đây là bình thường.';
                } else {
                    internalEl.textContent = ip;
                }
            })
            .catch(() => {
                internalEl.textContent = 'Unavailable';
            });
    }

    if (detectedEl) {
        getPublicIP()
            .then(ip => { detectedEl.textContent = ip || 'Unknown'; })
            .catch(() => { detectedEl.textContent = 'Unknown'; });
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
        showMessage('Login form fields not found. Please contact support.', 'error');
        return;
    }
    
    const employeeId = employeeIdField.value.trim();
    const deviceId = deviceIdField.value.trim();
    
    if (!employeeId || !deviceId) {
        showMessage('Please enter both Employee ID and Device ID.', 'error');
        return;
    }

    // Local cooldown to prevent rapid clicks
    const remainLogin = getCooldownRemaining('tini_cooldown_login');
    if (remainLogin > 0) {
        showMessage(`Waiting... ${remainLogin}s.`, 'error');
        startCountdown(loginBtn, remainLogin, 'Authenticate');
        return;
    }

    // Validate deviceId format - this is fine to keep
    const deviceRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!deviceRegex.test(deviceId)) {
        showMessage('Invalid Device ID format. It should be a valid UUID.', 'error');
        return;
    }
    
    // Disable button and show loading
    loginBtn.disabled = true;
    loginBtn.textContent = 'Authenticating...';
    let underBackoff = false;

    // Start a short local cooldown window
    setCooldown('tini_cooldown_login', LOCAL_COOLDOWN_LOGIN || 3);
    
    try {
        console.log(`🔍 Attempting secure login for: ${employeeId}`);
        // Ensure correct base
        const base = (typeof window.resolvePanelBase === 'function') ? await window.resolvePanelBase() : (typeof getPanelBase==='function'? getPanelBase() : 'http://localhost:55055');
        // Get internal IP for security tracking
        const internalIp = await getInternalIP();
        // Get device fingerprint
        const deviceFingerprint = window.deviceFingerprint ? window.deviceFingerprint.hash : null;
        console.log('🔍 Including device fingerprint in login request:', deviceFingerprint ? 'Yes' : 'No');
        // Authenticate with real server
        const response = await fetch(base + '/api/auth/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                username: employeeId,
                deviceId: deviceId,
                fingerprint: deviceFingerprint,
                internalIp: internalIp,
                userAgent: navigator.userAgent
            })
        });
        
        const result = await response.json();
        
        // Handle 429 backoff from server
        if (response.status === 429) {
            const sec = parseRetryAfterSeconds(response, result) ?? 10;
            showMessage(`Bạn thử quá nhanh, vui lòng thử lại sau ${sec} giây.`, 'error');
            startCountdown(loginBtn, sec, 'Authenticate');
            setCooldown('tini_cooldown_login', sec);
            underBackoff = true;
            return;
        }
        
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
        if (!underBackoff) {
            const remain = getCooldownRemaining('tini_cooldown_login');
            if (remain > 0) {
                startCountdown(loginBtn, remain, 'Authenticate');
            } else {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Authenticate';
            }
        }
    }
}

// Check if employee name already exists on server
async function checkEmployeeNameExists(name) {
    try {
        const base = (typeof window.resolvePanelBase === 'function') ? await window.resolvePanelBase() : (typeof getPanelBase==='function'? getPanelBase() : 'http://localhost:55055');
        const controller = new AbortController();
        const to = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`${base}/api/register/check?name=${encodeURIComponent(name)}`, { method: 'GET', signal: controller.signal });
        clearTimeout(to);
        let exists = null;
        if (res.ok) {
            const data = await res.json().catch(()=>({}));
            exists = !!data.nameExists;
        }
        // Fallback to local cache if server says not exists or unknown
        if (exists !== true && nameExistsLocally(name)) return true;
        return exists;
    } catch {
        // On error, fallback to local cache
        return nameExistsLocally(name) ? true : null;
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
        url: (typeof window.getPanelBase==='function'? window.getPanelBase() : 'http://localhost:55055') + '/api/auth/validate'
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
            document.getElementById('openAdminPanelBtn')?.addEventListener('click', async () => {
                const base = (typeof window.resolvePanelBase === 'function') ? await window.resolvePanelBase() : getPanelBase();
                openAdminPanelWindow(base);
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
    if (!registerBtn) return;

    // Hard stop if this device has already been registered
    if (window.__registeredDeviceInfo) {
        // Only show message if user is on Register tab or trying to register
        const currentTab = document.querySelector('.tab-btn.active');
        const isRegisterTab = currentTab && currentTab.id === 'registerTab';
        if (isRegisterTab) {
            showMessage('Thiết bị này đã được đăng ký. Vui lòng dùng thiết bị khác hoặc liên hệ admin.', 'error');
        }
        applyDeviceRegisteredConstraint && applyDeviceRegisteredConstraint();
        return;
    }

    // Read name from UI and normalize to "A - B - NN" as server expects
    const rawName = document.getElementById('employeeName')?.value?.trim() || '';
    const fullName = normalizeEmployeeName(rawName);
    if (!fullName) {
        showMessage('Tên không đúng định dạng. Dùng: Tên Telegram Nội Bộ Của Bạn', 'error');
        return;
    }
    
    // Local cooldown to prevent rapid clicks
    const remainReg = getCooldownRemaining('tini_cooldown_register');
    if (remainReg > 0) {
        showMessage(`Vui lòng đợi ${remainReg}s rồi thử lại.`, 'error');
        startCountdown(registerBtn, remainReg, 'Register');
        return;
    }

    // Get unified device ID
    const deviceId = localStorage.getItem('device_id') || document.getElementById('deviceId')?.value?.trim();
    if (!deviceId) {
        showMessage('Không tìm thấy Device ID. Vui lòng mở lại popup.', 'error');
        return;
    }

    // Best-effort internal IP
    const internalIp = await getInternalIP();
    
    // Get device fingerprint
    const deviceFingerprint = window.deviceFingerprint ? window.deviceFingerprint.hash : null;
    console.log('🔍 Including device fingerprint in registration:', deviceFingerprint ? 'Yes' : 'No');

    registerBtn.disabled = true;
    registerBtn.textContent = 'Registering...';
    let underBackoff = false;
    
    // Start a short local cooldown window
    setCooldown('tini_cooldown_register', LOCAL_COOLDOWN_REGISTER || 5);

    try {
        // Add timeout to avoid hanging UI
        const controller = new AbortController();
        const to = setTimeout(() => controller.abort(), 8000);
        const base = (typeof window.resolvePanelBase === 'function') ? await window.resolvePanelBase() : getPanelBase();
        const res = await fetch(base + '/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fullName, 
                deviceId, 
                internalIp,
                fingerprint: deviceFingerprint,
                userAgent: navigator.userAgent
            }),
            signal: controller.signal
        });
        clearTimeout(to);

        const result = await res.json().catch(() => ({}));

        // Handle 429 backoff from server
        if (res.status === 429) {
            const sec = parseRetryAfterSeconds(res, result) ?? 10;
            showMessage(`Bạn thử quá nhanh, vui lòng thử lại sau ${sec} giây.`, 'error');
            startCountdown(registerBtn, sec, 'Register');
            setCooldown('tini_cooldown_register', sec);
            underBackoff = true;
            return;
        }

        if (res.ok && result.success) {
            showMessage('Registration successful! Please login.', 'success');
            // Cache locally so duplicate hint updates immediately
            addLocalRegisteredName(fullName);
            
            // Cache device registration info for future sessions
            const deviceId = localStorage.getItem('device_id');
            if (deviceId) {
                const registrationInfo = {
                    fullName: fullName,
                    deviceId: deviceId,
                    registeredAt: new Date().toISOString(),
                    source: 'registration_success'
                };
                localStorage.setItem(`device_registered_${deviceId}`, JSON.stringify(registrationInfo));
                console.log('💾 Cached device registration info locally');
            }
            
            document.getElementById('loginTab')?.click();
            const employeeIdField = document.getElementById('employeeId');
            if (employeeIdField) employeeIdField.value = fullName;
        } else {
            let msg = result.error || result.message || `Registration failed (HTTP ${res.status})`;
            if (res.status === 409 && result.code) {
                if (result.code === 'NAME_EXISTS') msg = 'Tên nhân viên đã được đăng ký. Vui lòng đăng nhập hoặc dùng tên khác.';
                else if (result.code === 'DEVICE_EXISTS') msg = 'Thiết bị này đã được đăng ký. Vui lòng dùng thiết bị khác hoặc liên hệ admin.';
                else if (result.code === 'NAME_AND_DEVICE_EXISTS') msg = 'Tên và thiết bị đã được đăng ký.';
            }
            showMessage(msg, 'error');
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            showMessage('Registration request timed out. Please try again.', 'error');
        } else if (error.message && error.message.includes('fetch')) {
            showMessage(`Cannot connect to server at ${getPanelBase()}. Please check if server is running.`, 'error');
        } else {
            showMessage(`Registration error: ${error.message || String(error)}`, 'error');
        }
    } finally {
        if (!underBackoff) {
            const remain = getCooldownRemaining('tini_cooldown_register');
            if (remain > 0) {
                startCountdown(registerBtn, remain, 'Register');
            } else {
                registerBtn.disabled = false;
                registerBtn.textContent = 'Register';
            }
        }
    }
}

// Live helper: validate and auto-format employee name
function initializeEmployeeNameHelper() {
    const input = document.getElementById('employeeName');
    const hint = document.getElementById('nameFormatHint');
    if (!input) return;

    const setHint = (msg, ok = false, level = 'warn') => {
        if (!hint) return;
        // If device already registered, always show the red message regardless
        if (window.__registeredDeviceInfo) {
            hint.textContent = 'Thiết Bị Này Đã Được Đăng Ký';
            hint.style.color = '#e74c3c';
            return;
        }
        hint.textContent = msg;
        if (ok) hint.style.color = '#2ecc71';
        else if (level === 'error') hint.style.color = '#e74c3c';
        else hint.style.color = '#f1c40f';
    };

    let debounceId;
    const checkAndHint = async (value) => {
        // IMPORTANT: Immediately stop if device is already registered
        if (window.__registeredDeviceInfo) {
            console.log('🛑 Device already registered, skipping name validation');
            setHint('Thiết Bị Này Đã Được Đăng Ký', false, 'error');
            return;
        }
        
        console.log('✅ Device not registered, proceeding with name validation for:', value);
        const s = (value || '').trim().replace(/\s+/g, ' ');
        if (s.length === 0) { setHint('Định dạng: 潘文勇 VĂN DŨNG 79-1 hoặc 潘文勇 VĂN DŨNG 79'); return; }
        if (s.length < 10 || s.length > 25) { setHint('Độ dài 10–25 ký tự (kể cả dấu)'); return; }
        const formatted = normalizeEmployeeName(s);
        if (!formatted) { setHint('Sai định dạng. Ví dụ: 朋友 THÀNH 93 hoặc 朋友 THÀNH 93-1'); return; }
        // Format OK -> check duplicate on server
        setHint('Đang kiểm tra trùng tên...', false, 'warn');
        const exists = await checkEmployeeNameExists(formatted);
        if (exists === true) {
            setHint('Tên nhân viên đã tồn tại', false, 'error');
        } else if (exists === false) {
            setHint('Tên Hợp lệ', true);
        } else {
            setHint('Hợp lệ (không kiểm tra được trùng tên)', true);
        }
    };

    input.addEventListener('input', () => {
        // Skip validation completely if device is registered
        if (window.__registeredDeviceInfo) {
            setHint('Thiết Bị Này Đã Được Đăng Ký', false, 'error');
            return;
        }
        clearTimeout(debounceId);
        debounceId = setTimeout(() => checkAndHint(input.value), 400);
    });
    input.addEventListener('blur', () => {
        // Skip validation completely if device is registered
        if (window.__registeredDeviceInfo) {
            setHint('Thiết Bị Này Đã Được Đăng Ký', false, 'error');
            return;
        }
        clearTimeout(debounceId);
        checkAndHint(input.value);
    });
    // Also apply device-registered state immediately on focus
    input.addEventListener('focus', () => { 
        if (window.__registeredDeviceInfo) {
            setHint('Thiết Bị Này Đã Được Đăng Ký', false, 'error');
            console.log('🔴 Applied constraint on focus');
            return;
        }
        applyDeviceRegisteredConstraint(); 
    });

    // Force update on any user interaction if device is registered
    input.addEventListener('keydown', () => {
        if (window.__registeredDeviceInfo) {
            setTimeout(() => {
                setHint('Thiết Bị Này Đã Được Đăng Ký', false, 'error');
                forceUpdateDeviceConstraintHint();
            }, 10);
        }
    });
    
    // Also override on paste event
    input.addEventListener('paste', () => {
        if (window.__registeredDeviceInfo) {
            setTimeout(() => {
                setHint('Thiết Bị Này Đã Được Đăng Ký', false, 'error');
                forceUpdateDeviceConstraintHint();
            }, 50);
        }
    });

    // Initial state - only check if device is not registered
    if (!window.__registeredDeviceInfo) {
        console.log('🔍 Device not registered, proceeding with name validation');
        checkAndHint(input.value);
    } else {
        console.log('🛑 Device already registered, setting constraint hint');
        setHint('Thiết Bị Này Đã Được Đăng Ký', false, 'error');
    }
    
    // Additional safety: force update after a small delay
    setTimeout(() => {
        if (window.__registeredDeviceInfo) {
            console.log('🔄 Force updating hint after delay');
            setHint('Thiết Bị Này Đã Được Đăng Ký', false, 'error');
            forceUpdateDeviceConstraintHint();
        }
    }, 200);
    
    // Periodic check to ensure hint stays correct (safety net)
    setInterval(() => {
        if (window.__registeredDeviceInfo) {
            const hint = document.getElementById('nameFormatHint');
            if (hint && hint.textContent !== 'Thiết Bị Này Đã Được Đăng Ký') {
                console.log('🔄 Correcting hint via periodic check');
                forceUpdateDeviceConstraintHint();
            }
        }
    }, 1000);
}

// Manual function to mark device as registered (for testing or manual override)
function markDeviceAsRegistered(fullName) {
    const deviceId = localStorage.getItem('device_id');
    if (deviceId) {
        const registrationInfo = {
            fullName: fullName || 'Manual Override',
            deviceId: deviceId,
            registeredAt: new Date().toISOString(),
            source: 'manual_override'
        };
        localStorage.setItem(`device_registered_${deviceId}`, JSON.stringify(registrationInfo));
        window.__registeredDeviceInfo = registrationInfo;
        console.log('🔧 Manually marked device as registered');
        
        // Update UI immediately
        showRegisteredDeviceInfo(registrationInfo);
        applyDeviceRegisteredConstraint();
        forceUpdateDeviceConstraintHint();
        
        return true;
    }
    return false;
}

// Function to clear device registration (for testing)
function clearDeviceRegistration() {
    const deviceId = localStorage.getItem('device_id');
    if (deviceId) {
        localStorage.removeItem(`device_registered_${deviceId}`);
        window.__registeredDeviceInfo = null;
        console.log('🗑️ Cleared device registration');
        
        // Update UI
        const hint = document.getElementById('nameFormatHint');
        if (hint) {
            hint.textContent = 'Định dạng: 潘文勇 VĂN DŨNG 79-1 hoặc 潘文勇 VĂN DŨNG 79';
            hint.style.color = '#f1c40f';
        }
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.disabled = false;
            registerBtn.title = '';
        }
        
        return true;
    }
    return false;
}

// Force update device constraint hint
function forceUpdateDeviceConstraintHint() {
    if (window.__registeredDeviceInfo) {
        const hint = document.getElementById('nameFormatHint');
        if (hint) {
            hint.textContent = 'Thiết Bị Này Đã Được Đăng Ký';
            hint.style.color = '#e74c3c';
            console.log('🔴 Force updated device constraint hint');
        }
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.disabled = true;
            registerBtn.title = 'Thiết bị này đã được đăng ký';
        }
        return true;
    }
    return false;
}

// Improve normalization to support multi-word Vietnamese name
function normalizeEmployeeName(input) {
    if (!input) return '';
    const s = input.trim().replace(/\s+/g, ' ');
    if (s.length < 10 || s.length > 25) return '';

    // Strict spaced format: 中文名 VIỆT_LÓT VIỆT_THẬT 93 or 93-1
    const spacedStrict = s.match(/^(?<zh>[\p{Script=Han}]+)\s+(?<vi1>[\p{L}]+)\s+(?<vi2>[\p{L}]+)\s(?<code>\d{2}(?:-\d)?)$/u);
    if (spacedStrict && spacedStrict.groups) {
        const zh = spacedStrict.groups.zh;
        const vi1 = spacedStrict.groups.vi1;
        const vi2 = spacedStrict.groups.vi2;
        const code = spacedStrict.groups.code;
        return `${zh} ${vi1} ${vi2} ${code}`;
    }

    return '';
}

// Missing auth handler functions
async function handleAdminLogin() {
    console.log('🔑 Admin login requested');
    showMessage('Admin login feature not yet implemented', 'info');
}

async function handleTestServer() {
    console.log('🔧 Testing server connection');
    showMessage('Testing server connection...', 'info');
    
    try {
        const response = await fetch(getPanelBase() + '/api/health', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            showMessage('Server connection successful!', 'success');
        } else {
            showMessage(`Server returned status: ${response.status}`, 'error');
        }
    } catch (error) {
        console.error('Server test failed:', error);
        showMessage('Cannot connect to server. Please check if it\'s running.', 'error');
    }
}

// Helper to open Admin Panel in a separate window (popup)
function openAdminPanelWindow(adminURL) {
    try {
        if (typeof chrome !== 'undefined' && chrome.windows && chrome.windows.create) {
            chrome.windows.create({ url: adminURL, type: 'popup', width: 1200, height: 800, focused: true }, (win) => {
                if (chrome.runtime && chrome.runtime.lastError) {
                    console.error('❌ Chrome windows error:', chrome.runtime.lastError);
                    window.open(adminURL, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                }
            });
        } else {
            window.open(adminURL, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        }
    } catch (e) {
        console.error('❌ Failed to open admin window:', e);
        window.open(adminURL, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    }
}

// Device ID management
async function initializeDeviceId() {
    console.log('🔧 Initializing device ID...');
    
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        // Generate new device ID
        deviceId = generateUUID();
        localStorage.setItem('device_id', deviceId);
        console.log('📱 Generated new device ID:', deviceId);
    } else {
        console.log('📱 Using existing device ID:', deviceId);
    }
    
    // Set device ID in form field
    const deviceIdField = document.getElementById('deviceId');
    if (deviceIdField) {
        deviceIdField.value = deviceId;
    }

    // Always sync with database first (database is the source of truth)
    try {
        console.log('🌐 Syncing with database first...');
        
        // Check if there's any registration for current device
        let info = await checkRegisteredDevice(deviceId);
        
        // If current device not found, check if we need to sync with existing registration
        if (!info) {
            console.log('🔍 Device not found, checking for existing registrations to sync...');
            const base = (typeof window.resolvePanelBase === 'function') ? await window.resolvePanelBase() : (typeof getPanelBase==='function'? getPanelBase() : 'http://localhost:55055');
            
            try {
                // Try to get all registrations to see if we need to sync
                const response = await fetch(`${base}/api/registrations/all`, { 
                    method: 'GET', 
                    headers: {'Accept':'application/json'} 
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.registrations && data.registrations.length > 0) {
                        // Use the first/latest registration found
                        const registration = data.registrations[0];
                        console.log('🔄 Found existing registration, syncing device ID:', registration);
                        
                        // Update localStorage with correct device ID from database
                        deviceId = registration.device_id;
                        localStorage.setItem('device_id', deviceId);
                        console.log('✅ Updated localStorage device_id to:', deviceId);
                        
                        // Update form fields
                        if (deviceIdField) {
                            deviceIdField.value = deviceId;
                        }
                        
                        const employeeNameField = document.getElementById('employeeName');
                        if (employeeNameField && registration.full_name) {
                            employeeNameField.value = registration.full_name;
                        }
                        
                        // Re-check with correct device ID
                        info = await checkRegisteredDevice(deviceId);
                    }
                }
            } catch (syncError) {
                console.warn('⚠️ Database sync failed:', syncError.message);
            }
        }
        
        window.__registeredDeviceInfo = info || null;
        
        if (info) {
            console.log('✅ Device registration found and synced:', info);
            // Cache the registration info locally (only as backup)
            localStorage.setItem(`device_registered_${deviceId}`, JSON.stringify(info));
            showRegisteredDeviceInfo(info);
        } else {
            console.log('ℹ️ No device registration found in database');
            // Clear any stale cache
            localStorage.removeItem(`device_registered_${deviceId}`);
        }
        
        applyDeviceRegisteredConstraint();
        initializeEmployeeNameHelper();
        
        // Force update hint if there's already content in the name field
        setTimeout(() => {
            if (info) {
                const nameInput = document.getElementById('employeeName');
                const hint = document.getElementById('nameFormatHint');
                if (nameInput && hint) {
                    hint.textContent = 'Thiết Bị Này Đã Được Đăng Ký';
                    hint.style.color = '#e74c3c';
                    console.log('🔄 Forced hint update after device registration check');
                }
            }
            // Also call the dedicated function
            forceUpdateDeviceConstraintHint();
        }, 100);
        
    } catch (e) {
        console.warn('Error checking device registration:', e);
        // Fallback: assume device is not registered if server check fails
        window.__registeredDeviceInfo = null;
        initializeEmployeeNameHelper();
    }
    
    return deviceId;
}

// NEW: Apply device-registered constraint to Register form hint and button
function applyDeviceRegisteredConstraint(){
    const hint = document.getElementById('nameFormatHint');
    const registerBtn = document.getElementById('registerBtn');
    const nameInput = document.getElementById('employeeName');
    const info = window.__registeredDeviceInfo;
    
    if (info) {
        if (hint) { 
            hint.textContent = 'Thiết Bị Này Đã Được Đăng Ký'; 
            hint.style.color = '#e74c3c';
            console.log('🔴 Applied device registered constraint to hint');
        }
        if (registerBtn) { 
            registerBtn.disabled = true; 
            registerBtn.title = 'Thiết bị này đã được đăng ký';
            registerBtn.style.backgroundColor = '#666666';
            registerBtn.style.color = '#999999';
        }
        if (nameInput) { 
            nameInput.disabled = true; 
            nameInput.title = 'Không thể nhập tên - thiết bị đã được đăng ký';
            nameInput.placeholder = 'Thiết bị đã được đăng ký';
        }
        return true;
    } else {
        if (registerBtn) { 
            registerBtn.disabled = false; 
            registerBtn.title = '';
            registerBtn.style.backgroundColor = '';
            registerBtn.style.color = '';
        }
        if (nameInput) { 
            nameInput.disabled = false; 
            nameInput.title = '';
            nameInput.placeholder = '潘文勇 Tên Telegram 79-1';
        }
        // Reset hint to default when device is not registered
        if (hint && hint.textContent === 'Thiết Bị Này Đã Được Đăng Ký') {
            hint.textContent = 'Định dạng: 潘文勇 VĂN DŨNG 79-1 hoặc 潘文勇 VĂN DŨNG 79';
            hint.style.color = '#f1c40f';
        }
        return false;
    }
}

// Query server if current device is registered
async function checkRegisteredDevice(deviceId){
    try{
        const base = (typeof window.resolvePanelBase === 'function') ? await window.resolvePanelBase() : (typeof getPanelBase==='function'? getPanelBase() : 'http://localhost:55057');
        const controller = new AbortController();
        const to = setTimeout(()=>controller.abort(), 2000);
        const res = await fetch(`${base}/api/device/check?deviceId=${encodeURIComponent(deviceId)}`, { method:'GET', signal: controller.signal, headers:{'Accept':'application/json'} });
        clearTimeout(to);
        if(!res.ok) return null;
        const data = await res.json().catch(()=>null);
        if (data && data.success && data.exists) return data.device;
        return null;
    }catch(e){ return null; }
}

// Show registered device info in the login form (above Authenticate button)
function showRegisteredDeviceInfo(device){
    try{
        const registerForm = document.getElementById('registerForm');
        if(!registerForm) return;
        // Persist globally for hint logic
        window.__registeredDeviceInfo = device || null;
        // container element shown in Register section
        let box = document.getElementById('registeredDeviceBox');
        if(!box){
            box = document.createElement('div');
            box.id = 'registeredDeviceBox';
            box.className = 'message-container info-message';
            const ipArea = document.getElementById('ipDetectionArea');
            if (ipArea && ipArea.parentNode === registerForm) {
                // insert right below the IP area so it’s visible as in screenshot #2
                registerForm.insertBefore(box, ipArea.nextSibling);
            } else {
                registerForm.appendChild(box);
            }
        }
        // FORCE HIDE: Don't show the big warning box - we only use the small hint
        box.style.display = 'none';
        
        const registerBtn = document.getElementById('registerBtn');
        if(!device){
            box.style.display = 'none';
            if (registerBtn) { registerBtn.disabled = false; registerBtn.title = ''; }
            return;
        }
        // DISABLED: Don't show big warning box anymore, only use small hint
        // Show message and lock the register button as this device is already registered
        // DISABLED: Remove big warning box display
        // box.style.display = 'block';
        // box.className = 'message-container error-message';
        // box.textContent = `Thiết bị này đã được đăng ký cho: ${device.fullName || 'Unknown'}. Vui lòng dùng thiết bị khác hoặc liên hệ admin.`;
        
        // Just disable the register button
        if (registerBtn) {
            registerBtn.disabled = true;
            registerBtn.title = 'Thiết bị này đã được đăng ký';
        }
        // Update the small hint as well
        applyDeviceRegisteredConstraint();
    }catch{}
}

// Device Fingerprint System
async function generateDeviceFingerprint() {
    console.log('🔍 Generating device fingerprint...');
    
    const fingerprint = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth
        },
        plugins: Array.from(navigator.plugins).map(p => p.name).sort(),
        webgl: getWebGLFingerprint(),
        canvas: getCanvasFingerprint(),
        fonts: await getAvailableFonts(),
        timestamp: new Date().toISOString()
    };
    
    // Create fingerprint hash
    const fingerprintString = JSON.stringify(fingerprint);
    const fingerprintHash = await hashFingerprint(fingerprintString);
    
    console.log('🔍 Device fingerprint generated:', fingerprintHash.substring(0, 16) + '...');
    
    // Store fingerprint data
    localStorage.setItem('device_fingerprint', fingerprintHash);
    localStorage.setItem('device_fingerprint_data', fingerprintString);
    
    return {
        hash: fingerprintHash,
        data: fingerprint
    };
}

// WebGL fingerprint
function getWebGLFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return 'WebGL not supported';
        
        const renderer = gl.getParameter(gl.RENDERER);
        const vendor = gl.getParameter(gl.VENDOR);
        const version = gl.getParameter(gl.VERSION);
        const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
        
        return {
            renderer,
            vendor,
            version,
            shadingLanguageVersion
        };
    } catch (e) {
        return 'WebGL error';
    }
}

// Canvas fingerprint
function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Draw text with different styles
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('TINI Device Detection 🔍', 2, 2);
        
        ctx.font = '11px Times';
        ctx.fillText('Test string 123', 4, 20);
        
        // Draw shapes
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgb(255,0,255)';
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        
        return canvas.toDataURL();
    } catch (e) {
        return 'Canvas error';
    }
}

// Font detection
async function getAvailableFonts() {
    const testFonts = [
        'Arial', 'Times New Roman', 'Courier New', 'Helvetica', 'Georgia',
        'Verdana', 'Comic Sans MS', 'Impact', 'Arial Black', 'Tahoma',
        'Century Gothic', 'Lucida Console', 'Garamond', 'MS Sans Serif',
        'MS Serif', 'Palatino Linotype', 'Symbol', 'Webdings', 'Wingdings'
    ];
    
    const availableFonts = [];
    
    for (const font of testFonts) {
        if (await isFontAvailable(font)) {
            availableFonts.push(font);
        }
    }
    
    return availableFonts.sort();
}

// Check if font is available
function isFontAvailable(font) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Test text
        const testText = 'Test Font Detection';
        
        // Default font baseline
        ctx.font = '12px monospace';
        const baselineWidth = ctx.measureText(testText).width;
        
        // Test font
        ctx.font = `12px "${font}", monospace`;
        const testWidth = ctx.measureText(testText).width;
        
        // Font is available if width differs from baseline
        resolve(testWidth !== baselineWidth);
    });
}

// Hash fingerprint with HMAC-SHA256
async function hashFingerprint(fingerprintString) {
    try {
        // Use a consistent pepper (in production, this should be from env)
        const pepper = 'TINI_FINGERPRINT_PEPPER_2025';
        const encoder = new TextEncoder();
        
        // Import pepper as key
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(pepper),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        // Create HMAC
        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(fingerprintString)
        );
        
        // Convert to hex string
        const hashArray = Array.from(new Uint8Array(signature));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    } catch (e) {
        console.warn('Crypto API not available, using fallback hash');
        // Fallback to simple hash
        let hash = 0;
        for (let i = 0; i < fingerprintString.length; i++) {
            const char = fingerprintString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
}

// Initialize device fingerprint system
async function initializeDeviceFingerprint() {
    console.log('🔍 Initializing device fingerprint system...');
    
    try {
        const existingFingerprint = localStorage.getItem('device_fingerprint');
        let fingerprintData;
        
        if (existingFingerprint) {
            console.log('🔍 Using existing device fingerprint');
            fingerprintData = {
                hash: existingFingerprint,
                data: JSON.parse(localStorage.getItem('device_fingerprint_data') || '{}')
            };
        } else {
            console.log('🔍 Generating new device fingerprint...');
            fingerprintData = await generateDeviceFingerprint();
        }
        
        // Display fingerprint info in UI
        displayFingerprintInfo(fingerprintData);
        
        return fingerprintData;
    } catch (error) {
        console.error('❌ Error initializing device fingerprint:', error);
        showMessage('Device fingerprint generation failed', 'error');
        return null;
    }
}

// Display fingerprint information in UI
function displayFingerprintInfo(fingerprintData) {
    // Add fingerprint info to login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm && fingerprintData) {
        // Check if fingerprint info already exists
        let fingerprintInfo = document.getElementById('deviceFingerprintInfo');
        if (!fingerprintInfo) {
            fingerprintInfo = document.createElement('div');
            fingerprintInfo.id = 'deviceFingerprintInfo';
            fingerprintInfo.className = 'device-fingerprint-info';
            
            // Insert before the authenticate button
            const authButton = document.getElementById('loginBtn');
            if (authButton && authButton.parentNode) {
                authButton.parentNode.insertBefore(fingerprintInfo, authButton);
            }
        }
        
        fingerprintInfo.innerHTML = `
            <div class="fingerprint-header">
                <span class="fingerprint-icon">🔍</span>
                <span class="fingerprint-title">Device Recognition</span>
            </div>
            <div class="fingerprint-details">
                <span class="fingerprint-id">ID: ${fingerprintData.hash.substring(0, 12)}...</span>
                <span class="fingerprint-status">Status: Detected</span>
            </div>
        `;
        
        console.log('✅ Device fingerprint info displayed in UI');
    }
}

// Generate UUID v4
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Message display utility
function showMessage(message, type = 'info') {
    console.log(`📢 [${type.toUpperCase()}] ${message}`);
    
    // Try to find error message container
    let messageContainer = document.getElementById('errorMessage');
    if (!messageContainer) {
        // Create message container if it doesn't exist
        messageContainer = document.createElement('div');
        messageContainer.id = 'errorMessage';
        messageContainer.className = 'message-container';
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            authContainer.appendChild(messageContainer);
        }
    }
    
    if (messageContainer) {
        messageContainer.textContent = message;
        messageContainer.className = `message-container ${type === 'error' ? 'error-message' : type === 'success' ? 'success-message' : 'info-message'}`;
        messageContainer.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    }
}

// Local cache for registered names (client-side fallback)
function getLocalRegisteredNames(){
    try { return JSON.parse(localStorage.getItem('tini_registered_names') || '[]'); } catch { return []; }
}
function addLocalRegisteredName(name){
    const arr = getLocalRegisteredNames();
    const normalized = normalizeEmployeeName(name) || String(name || '').trim();
    if (normalized && !arr.includes(normalized)) {
        arr.push(normalized);
        localStorage.setItem('tini_registered_names', JSON.stringify(arr));
    }
}
function nameExistsLocally(name){
    const arr = getLocalRegisteredNames();
    const normalized = normalizeEmployeeName(name) || String(name || '').trim();
    return !!normalized && arr.includes(normalized);
}

// Backoff helpers to show “Bạn thử quá nhanh, vui lòng thử lại sau X giây” and disable button with countdown
function parseRetryAfterSeconds(res, result){
    try{
        const h = res && res.headers ? res.headers.get('Retry-After') : null;
        const v = h ? parseInt(h, 10) : (result && typeof result.retryAfter === 'number' ? result.retryAfter : NaN);
        return Number.isFinite(v) && v > 0 ? v : null;
    }catch{ return null; }
}
function startCountdown(button, seconds, originalText){
    if (!button) return;
    let remain = Math.max(1, Math.ceil(Number(seconds) || 0));
    const orig = originalText || button.textContent;
    button.disabled = true;
    button.textContent = `Đợi ${remain}s`;
    const timer = setInterval(() => {
        remain -= 1;
        if (remain <= 0) {
            clearInterval(timer);
            button.disabled = false;
            button.textContent = orig;
        } else {
            button.textContent = `Đợi ${remain}s`;
        }
    }, 1000);
}

// Local click cooldown helpers
const LOCAL_COOLDOWN_LOGIN = 3; // seconds
const LOCAL_COOLDOWN_REGISTER = 5; // seconds
function getCooldownRemaining(key){
    try{
        const until = parseInt(localStorage.getItem(key) || '0', 10);
        const remain = Math.ceil((until - Date.now())/1000);
        return remain > 0 ? remain : 0;
    }catch{ return 0; }
}
function setCooldown(key, seconds){
    try{
        const s = Math.max(1, Math.ceil(Number(seconds) || 0));
        const until = Date.now() + s*1000;
        localStorage.setItem(key, String(until));
    }catch{ /* ignore */ }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing popup...');
    
    // Check if we're in popup context
    if (window.location.pathname.includes('popup.html') || 
        document.getElementById('authContainer') ||
        document.querySelector('.popup-container')) {
        
        console.log('✅ In popup context, starting initialization...');
        initializePopupComponents();
    } else {
        console.log('⏭️ Not in popup context, skipping initialization');
    }
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM hasn't finished loading yet
    console.log('🔄 DOM still loading, waiting for DOMContentLoaded...');
} else {
    // DOM has already loaded
    console.log('🔄 DOM already loaded, initializing popup...');
    if (window.location.pathname.includes('popup.html') || 
        document.getElementById('authContainer') ||
        document.querySelector('.popup-container')) {
        
        console.log('✅ In popup context, starting initialization...');
        initializePopupComponents();
    }
}

//# sourceMappingURL=popup.js.map// ST:TINI_1755361782_e868a412
