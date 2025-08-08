// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited

// ⚠️ SECURITY WARNING: localStorage usage detected
// Consider using secure storage methods to prevent XSS attacks
// Use window.secureSetStorage(), window.secureGetStorage(), window.secureRemoveStorage()
// TINI Security Fix - Auto-generated
if (typeof window !== 'undefined' && !window.TINI_SYSTEM) {
    console.warn('TINI namespace not loaded in post docker.js');
}

// COMPLETE EXTENSION REBUILD - Post Docker Update Fix
// Rebuilds all functionality from scratch

(function() {
    'use strict';
    
    console.log('🔄 COMPLETE REBUILD: Starting system reconstruction...');
    
    // Global state management
    window.extensionState = {
        initialized: false,
        authenticated: false,
        currentUser: null,
        systemReady: false
    };
    
    // Core admin credentials (hardcoded for reliability)
    const ADMIN_CREDENTIALS = {
        'admin': 'admin123',
        'boss': 'boss123', 
        'ghost_boss': 'ghost123',
        'ADMIN': 'admin123',
        'BOSS': 'boss123'
    };
    
    // 1. REBUILD AUTHENTICATION SYSTEM
    function rebuildAuthSystem() {
        console.log('🔐 Rebuilding authentication system...');
        
        // Create fallback auth system
        window.authSystem = {
            authenticate: function(username, password) {
                if (ADMIN_CREDENTIALS[username] === password) {
                    const user = {
                        username: username,
                        role: username.toLowerCase(),
                        isAdmin: true,
                        isBoss: username.toLowerCase().includes('boss'),
                        timestamp: Date.now()
                    };
                    
                    // Set localStorage
                    (window.TINI_SYSTEM?.utils?.secureStorage?.set('isAuthenticated', 'true') || localStorage.setItem('isAuthenticated', 'true'));
                    (window.TINI_SYSTEM?.utils?.secureStorage?.set('userRole', user.role) || localStorage.setItem('userRole', user.role));
                    (window.TINI_SYSTEM?.utils?.secureStorage?.set('hasAdminPrivileges', 'true') || localStorage.setItem('hasAdminPrivileges', 'true'));
                    (window.TINI_SYSTEM?.utils?.secureStorage?.set('authLevel', '9999') || localStorage.setItem('authLevel', '9999'));
                    (window.TINI_SYSTEM?.utils?.secureStorage?.set('currentUser', JSON.stringify(user) || localStorage.setItem('currentUser', JSON.stringify(user)));
                    
                    window.extensionState.authenticated = true;
                    window.extensionState.currentUser = user;
                    
                    console.log('✅ Authentication successful:', user);
                    return { success: true, user: user };
                }
                
                return { success: false, message: 'Invalid credentials' };
            },
            
            isAuthenticated: function() {
                return (window.TINI_SYSTEM?.utils?.secureStorage?.get('isAuthenticated') || localStorage.getItem('isAuthenticated')) === 'true';
            },
            
            getCurrentUser: function() {
                const userData = (window.TINI_SYSTEM?.utils?.secureStorage?.get('currentUser') || localStorage.getItem('currentUser'));
                return userData ? JSON.parse(userData) : null;
            },
            
            logout: function() {
                localStorage.clear();
                window.extensionState.authenticated = false;
                window.extensionState.currentUser = null;
            }
        };
        
        console.log('✅ Auth system rebuilt');
    }
    
    // 2. REBUILD EVENT HANDLERS
    function rebuildEventHandlers() {
        console.log('🎯 Rebuilding event handlers...');
        
        // Login button handler
        function handleLogin() {
            console.log('🔐 Login triggered');
            
            const usernameInput = document.getElementById('adminUsername') || document.getElementById('deviceId');
            const passwordInput = document.getElementById('adminPassword') || document.getElementById('password');
            const errorDisplay = document.getElementById('adminErrorMessage') || document.getElementById('errorMessage');
            
            if (!usernameInput || !passwordInput) {
                alert('Input fields not found!');
                return;
            }
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!username || !password) {
                showError(errorDisplay, 'Please enter username and password');
                return;
            }
            
            const result = window.authSystem.authenticate(username, password);
            
            if (result.success) {
                showSuccess('Authentication successful! Redirecting...');
                setTimeout(() => {
                    showMainContent();
                }, 1000);
            } else {
                showError(errorDisplay, result.message);
            }
        }
        
        // Admin panel handler
        function handleAdminPanel() {
            console.log('🛡️ Admin panel access requested');
            
            if (!window.authSystem.isAuthenticated()) {
                alert('Please authenticate first!');
                return;
            }
            
            const adminPanelUrl = chrome.runtime.getURL('admin-panel.html');
            chrome.tabs.create({ url: adminPanelUrl }, (tab) => {
                if (chrome.runtime.lastError) {
                    console.error('Failed to open admin panel:', chrome.runtime.lastError);
                    // Fallback: try to open in same tab
                    window.location.href = adminPanelUrl;
                } else {
                    console.log('✅ Admin panel opened successfully');
                }
            });
        }
        
        // Register handler
        function handleRegister() {
            console.log('📝 Register triggered');
            
            const nameInput = document.getElementById('employeeName');
            if (!nameInput) {
                alert('Registration form not found!');
                return;
            }
            
            const name = nameInput.value.trim();
            if (!name) {
                alert('Please enter your full name');
                return;
            }
            
            // Simulate registration
            alert('🎉 Registration submitted! Contact admin for approval.');
            nameInput.value = '';
        }
        
        // Attach handlers to all possible buttons
        function attachHandlers() {
            // Login buttons
            const loginButtons = [
                'loginBtn', 'adminLoginBtn', 'authenticateBtn'
            ];
            
            loginButtons.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.onclick = handleLogin;
                    btn.addEventListener('click', handleLogin);
                    console.log(`✅ Attached login handler to ${id}`);
                }
            });
            
            // Admin panel buttons
            const adminButtons = [
                'adminBtn', 'adminPanel', 'adminPanelBtn', 'openAdminPanel'
            ];
            
            adminButtons.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.onclick = handleAdminPanel;
                    btn.addEventListener('click', handleAdminPanel);
                    console.log(`✅ Attached admin handler to ${id}`);
                }
            });
            
            // Register buttons
            const registerButtons = ['registerBtn', 'submitRegistration'];
            
            registerButtons.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.onclick = handleRegister;
                    btn.addEventListener('click', handleRegister);
                    console.log(`✅ Attached register handler to ${id}`);
                }
            });
            
            // Tab switching
            setupTabSwitching();
        }
        
        // Setup tab switching
        function setupTabSwitching() {
            const tabs = ['loginTab', 'registerTab', 'adminTab'];
            const forms = ['loginForm', 'registerForm', 'adminForm'];
            
            tabs.forEach((tabId, index) => {
                const tab = document.getElementById(tabId);
                if (tab) {
                    tab.onclick = () => switchToTab(index);
                    tab.addEventListener('click', () => switchToTab(index));
                }
            });
            
            function switchToTab(activeIndex) {
                // Hide all forms
                forms.forEach(formId => {
                    const form = document.getElementById(formId);
                    if (form) {
                        form.style.display = 'none';
                        form.classList.remove('active');
                    }
                });
                
                // Remove active from all tabs
                tabs.forEach(tabId => {
                    const tab = document.getElementById(tabId);
                    if (tab) tab.classList.remove('active');
                });
                
                // Show active form
                const activeForm = document.getElementById(forms[activeIndex]);
                const activeTab = document.getElementById(tabs[activeIndex]);
                
                if (activeForm) {
                    activeForm.style.display = 'block';
                    activeForm.classList.add('active');
                }
                
                if (activeTab) {
                    activeTab.classList.add('active');
                }
                
                console.log(`✅ Switched to ${tabs[activeIndex]}`);
            }
        }
        
        // Initialize handlers
        attachHandlers();
        
        console.log('✅ Event handlers rebuilt');
    }
    
    // 3. REBUILD UI FUNCTIONS
    function rebuildUIFunctions() {
        console.log('🎨 Rebuilding UI functions...');
        
        window.showMainContent = function() {
            const authContainer = document.querySelector('.auth-container');
            const mainContent = document.querySelector('.main-content');
            
            if (authContainer) {
                authContainer.style.display = 'none';
            }
            
            if (mainContent) {
                mainContent.style.display = 'block';
                mainContent.classList.add('active');
            }
            
            console.log('✅ Main content displayed');
        };
        
        window.showError = function(element, message) {
            if (element) {
                element.textContent = message;
                element.style.display = 'block';
                element.style.color = '#ff3d71';
            } else {
                alert('Error: ' + message);
            }
        };
        
        window.showSuccess = function(message) {
            const successDiv = document.createElement('div');
            successDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #00e676; color: white; padding: 15px; border-radius: 5px; z-index: 9999;';
            successDiv.textContent = message;
            document.body.appendChild(successDiv);
            
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 3000);
        };
        
        console.log('✅ UI functions rebuilt');
    }
    
    // 4. REBUILD ADMIN PANEL INTEGRATION
    function rebuildAdminPanelIntegration() {
        console.log('🛡️ Rebuilding admin panel integration...');
        
        window.openAdminPanel = function() {
            console.log('🔍 Opening admin panel...');
            
            if (!window.authSystem.isAuthenticated()) {
                alert('Please authenticate first!');
                return;
            }
            
            try {
                const adminPanelUrl = chrome.runtime.getURL('admin-panel.html');
                
                // Try to open in new tab
                chrome.tabs.create({ url: adminPanelUrl }, (tab) => {
                    if (chrome.runtime.lastError) {
                        console.error('Chrome tabs API failed:', chrome.runtime.lastError);
                        // Fallback: direct navigation
                        window.open(adminPanelUrl, '_blank');
                    } else {
                        console.log('✅ Admin panel opened in new tab');
                    }
                });
                
            } catch (error) {
                console.error('Admin panel open failed:', error);
                alert('Failed to open admin panel. Check console for details.');
            }
        };
        
        console.log('✅ Admin panel integration rebuilt');
    }
    
    // 5. INITIALIZE COMPLETE REBUILD
    function initializeRebuild() {
        console.log('🚀 Initializing complete rebuild...');
        
        // Check if already authenticated
        if ((window.TINI_SYSTEM?.utils?.secureStorage?.get('isAuthenticated') || localStorage.getItem('isAuthenticated')) === 'true') {
            window.extensionState.authenticated = true;
            const userData = (window.TINI_SYSTEM?.utils?.secureStorage?.get('currentUser') || localStorage.getItem('currentUser'));
            if (userData) {
                window.extensionState.currentUser = JSON.parse(userData);
            }
            
            // Show main content if authenticated
            setTimeout(() => {
                window.showMainContent();
            }, 500);
        }
        
        window.extensionState.systemReady = true;
        console.log('✅ Complete rebuild initialized');
        
        // Add debug helper
        window.debugExtension = function() {
            console.log('🔍 Extension Debug Info:');
            console.log('State:', window.extensionState);
            console.log('Auth System:', window.authSystem);
            console.log('LocalStorage:', {
                isAuthenticated: (window.TINI_SYSTEM?.utils?.secureStorage?.get('isAuthenticated') || localStorage.getItem('isAuthenticated')),
                userRole: (window.TINI_SYSTEM?.utils?.secureStorage?.get('userRole') || localStorage.getItem('userRole')),
                currentUser: (window.TINI_SYSTEM?.utils?.secureStorage?.get('currentUser') || localStorage.getItem('currentUser'))
            });
        };
    }
    
    // MAIN EXECUTION
    function executeRebuild() {
        console.log('⚡ EXECUTING COMPLETE REBUILD...');
        
        try {
            rebuildAuthSystem();
            rebuildUIFunctions();
            rebuildAdminPanelIntegration();
            rebuildEventHandlers();
            initializeRebuild();
            
            console.log('🎉 COMPLETE REBUILD SUCCESSFUL!');
            
            // Show success notification
            setTimeout(() => {
                if (window.showSuccess) {
                    window.showSuccess('🔄 Extension rebuilt successfully! All buttons should work now.');
                }
            }, 1000);
            
        } catch (error) {
            console.error('💥 REBUILD FAILED:', error);
            alert('Rebuild failed: ' + error.message);
        }
    }
    
    // Execute when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executeRebuild);
    } else {
        executeRebuild();
    }
    
    // Also execute after short delays to catch late elements
    setTimeout(executeRebuild, 1000);
    setTimeout(executeRebuild, 3000);
    
    console.log('🔄 COMPLETE REBUILD SYSTEM LOADED');
    
})();
