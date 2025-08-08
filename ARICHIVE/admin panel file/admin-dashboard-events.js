// SECURE ADMIN HELPER - PREVENTS XSS/INJECTION
try { require('../SECURITY/secure-admin-helper.js'); } catch(e) { console.warn('Secure admin helper not loaded:', e.message); }

/**
 * 🔧 TINI Admin Dashboard Event Handlers
 * 
 * File này chứa tất cả event handlers được di chuyển từ inline code
 * để tuân thủ Content Security Policy (CSP) nghiêm ngặt
 */

// 🚀 **DOM READY & INITIALIZATION**
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 [EVENTS] Admin Dashboard Event Handlers loaded');
    
    // Initialize all event listeners
    initializeNavigationEvents();
    initializeAuthenticationEvents();
    initializeInterfaceEvents();
    initializeSecurityEvents();
});

// 🔗 **NAVIGATION EVENT HANDLERS**
function initializeNavigationEvents() {
    // Authentication button
    const authButton = document.querySelector('[data-action="authenticate"]');
    if (authButton) {
        authButton.addEventListener('click', function() {
            window.location.href = 'admin-authentication.html';
        });
    }
    
    // Back to popup button
    const backButton = document.querySelector('[data-action="back-to-popup"]');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'popup.html';
        });
    }
    
    // Navigation menu items
    document.querySelectorAll('.nav-item a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                // Handle navigation
                handleNavigation(href);
            }
        });
    });
}

// 🔐 **AUTHENTICATION EVENT HANDLERS**
function initializeAuthenticationEvents() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLoginSubmission();
        });
    }
    
    // Logout button
    const logoutButton = document.querySelector('[data-action="logout"]');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            handleLogout();
        });
    }
}

// 🎨 **INTERFACE EVENT HANDLERS**
function initializeInterfaceEvents() {
    // Interface version selector
    const versionSelector = document.getElementById('interfaceVersionSelector');
    if (versionSelector) {
        versionSelector.addEventListener('change', function() {
            handleInterfaceVersionChange(this.value);
        });
    }
    
    // Apply interface version button
    const applyButton = document.getElementById('applyInterfaceVersion');
    if (applyButton) {
        applyButton.addEventListener('click', function() {
            applyInterfaceVersion();
        });
    }
    
    // Theme toggle
    const themeToggle = document.querySelector('[data-action="toggle-theme"]');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            toggleTheme();
        });
    }
}

// 🛡️ **SECURITY EVENT HANDLERS**
function initializeSecurityEvents() {
    // Security action buttons
    document.querySelectorAll('[data-security-action]').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-security-action');
            handleSecurityAction(action);
        });
    });
    
    // Safe mode toggle
    const safeModeToggle = document.querySelector('[data-action="toggle-safe-mode"]');
    if (safeModeToggle) {
        safeModeToggle.addEventListener('click', function() {
            toggleSafeMode();
        });
    }
}

// 📋 **EVENT HANDLER FUNCTIONS**

function handleNavigation(href) {
    console.log('🔗 [NAV] Navigating to:', href);
    
    // Add loading state
    showLoadingState();
    
    // Navigate
    window.location.href = href;
}

function handleLoginSubmission() {
    console.log('🔐 [AUTH] Processing login...');
    
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!username || !password) {
        showError('Username and password are required');
        return;
    }
    
    // Process authentication
    authenticateUser(username, password);
}

function handleLogout() {
    console.log('🚪 [AUTH] Logging out...');
    
    // Clear authentication data
    if (window.TINI_SYSTEM?.utils?.secureStorage) {
        window.TINI_SYSTEM.utils.secureStorage.clear();
    } else {
        localStorage.clear();
        sessionStorage.clear();
    }
    
    // Redirect to login
    window.location.href = '/login';
}

function handleInterfaceVersionChange(version) {
    console.log('🎨 [UI] Interface version changed to:', version);
    
    // Update interface preview if available
    updateInterfacePreview(version);
}

function applyInterfaceVersion() {
    const selector = document.getElementById('interfaceVersionSelector');
    const version = selector?.value;
    
    if (!version) {
        showError('Please select an interface version');
        return;
    }
    
    console.log('🎨 [UI] Applying interface version:', version);
    
    // Apply version
    if (window.InterfaceVersionManager) {
        window.InterfaceVersionManager.applyVersion(version);
    }
    
    showSuccess('Interface version applied successfully');
}

function handleSecurityAction(action) {
    console.log('🛡️ [SECURITY] Executing action:', action);
    
    // Confirm dangerous actions
    if (['reset', 'shutdown', 'disable'].some(dangerous => action.includes(dangerous))) {
        if (!confirm(`Are you sure you want to execute: ${action}?`)) {
            return;
        }
    }
    
    // Execute security action
    executeSecurityAction(action);
}

function toggleSafeMode() {
    console.log('🔧 [SECURITY] Toggling safe mode...');
    
    const currentMode = window.TINI_ROLE_CONTEXT?.safeMode || false;
    const newMode = !currentMode;
    
    // Send request to toggle safe mode
    toggleSafeModeRequest(newMode);
}

function toggleTheme() {
    console.log('🎨 [UI] Toggling theme...');
    
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    window.secureSetStorage && window.secureSetStorage('theme', newTheme) || localStorage.setItem('theme', newTheme);
    
    showSuccess(`Theme changed to ${newTheme} mode`);
}

// 🔧 **UTILITY FUNCTIONS**

function showLoadingState() {
    const body = document.body;
    body.style.cursor = 'wait';
    
    // Add loading overlay if not exists
    if (!document.getElementById('loadingOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-size: 18px;
        `;
        window.secureSetHTML && window.secureSetHTML(overlay, '🔄 Loading...') || (overlay.textContent = String('🔄 Loading...').replace(/<[^>]*>/g, ""));
        body.appendChild(overlay);
    }
}

function hideLoadingState() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
    document.body.style.cursor = 'default';
}

function showError(message) {
    console.error('❌ [ERROR]', message);
    
    // Create error toast
    showToast(message, 'error');
}

function showSuccess(message) {
    console.log('✅ [SUCCESS]', message);
    
    // Create success toast
    showToast(message, 'success');
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
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 🔄 **ASYNC FUNCTIONS**

async function authenticateUser(username, password) {
    try {
        showLoadingState();
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store authentication data
            if (window.TINI_SYSTEM?.utils?.secureStorage) {
                window.TINI_SYSTEM.utils.secureStorage.set('authToken', data.token);
                window.TINI_SYSTEM.utils.secureStorage.set('userRole', data.user.role);
            } else {
                window.secureSetStorage && window.secureSetStorage('authToken', data.token) || localStorage.setItem('authToken', data.token);
                window.secureSetStorage && window.secureSetStorage('userRole', data.user.role) || localStorage.setItem('userRole', data.user.role);
            }
            
            showSuccess('Authentication successful');
            
            // Reload page to apply authentication
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showError(data.message || 'Authentication failed');
        }
        
    } catch (error) {
        console.error('🔐 [AUTH] Authentication error:', error);
        showError('Connection error. Please try again.');
    } finally {
        hideLoadingState();
    }
}

async function executeSecurityAction(action) {
    try {
        showLoadingState();
        
        const response = await fetch('/api/security/action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ action })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(`Security action '${action}' executed successfully`);
        } else {
            showError(data.error || 'Security action failed');
        }
        
    } catch (error) {
        console.error('🛡️ [SECURITY] Action error:', error);
        showError('Failed to execute security action');
    } finally {
        hideLoadingState();
    }
}

async function toggleSafeModeRequest(enable) {
    try {
        const response = await fetch('/api/security/safe-mode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ enable })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(`Safe mode ${enable ? 'enabled' : 'disabled'}`);
            
            // Update UI
            updateSafeModeUI(enable);
        } else {
            showError(data.error || 'Failed to toggle safe mode');
        }
        
    } catch (error) {
        console.error('🔧 [SECURITY] Safe mode error:', error);
        showError('Failed to toggle safe mode');
    }
}

function updateInterfacePreview(version) {
    // Update interface preview if available
    const preview = document.getElementById('interfacePreview');
    if (preview) {
        preview.textContent = `Interface Version: ${version}`;
    }
}

function updateSafeModeUI(safeMode) {
    const indicator = document.querySelector('.safe-mode-indicator');
    if (indicator) {
        indicator.textContent = safeMode ? '🔧 Safe Mode: ON' : '🛡️ Safe Mode: OFF';
        indicator.style.color = safeMode ? '#f59e0b' : '#10b981';
    }
}

function getAuthToken() {
    if (window.TINI_SYSTEM?.utils?.secureStorage) {
        return window.TINI_SYSTEM.utils.secureStorage.get('authToken');
    }
    return window.secureGetStorage && window.secureGetStorage('authToken') || localStorage.getItem('authToken');
}

// 🚀 **EXPORT FOR EXTERNAL USE**
window.AdminDashboardEvents = {
    handleNavigation,
    handleLoginSubmission,
    handleLogout,
    showError,
    showSuccess,
    showToast
};

console.log('✅ [EVENTS] Admin Dashboard Event Handlers initialized');
