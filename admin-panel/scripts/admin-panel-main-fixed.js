// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
git// SECURE ADMIN HELPER - initialize via TINI_SYSTEM
if (window.SecureAdminHelper) {
    window.TINI_SYSTEM = window.TINI_SYSTEM || { utils: {} };
    window.TINI_SYSTEM.utils.adminHelper = new SecureAdminHelper();
} else {
    console.warn('Secure admin helper not available');
}

// TINI Security Fix - Auto-generated
if (typeof window !== 'undefined' && !window.TINI_SYSTEM) {
    console.warn('TINI namespace not loaded in admin-panel-main.js');
}

// TINI Admin Panel JavaScript

// Helper function for storage access
function getSecureStorage(key, defaultValue = null) {
    return window.TINI_SYSTEM?.utils?.secureStorage?.get(key) || 
           (window.secureGetStorage && window.secureGetStorage(key)) || 
           localStorage.getItem(key) || 
           defaultValue;
}

function setSecureStorage(key, value) {
    window.TINI_SYSTEM?.utils?.secureStorage?.set(key, value);
    window.secureSetStorage && window.secureSetStorage(key, value);
    localStorage.setItem(key, value);
}

// Enhanced functionality for all admin dashboard features

class TINIAdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.users = this.loadUsers();
        this.activities = this.loadActivities();
        this.systemStats = this.loadSystemStats();
        this.currentAvatar = getSecureStorage('adminAvatar') || null;
        
        // Initialize default user data if empty
        this.initializeDefaultUsers();
        
        // Initialize i18n system
        this.initializeI18nSystem();
        
        // Initialize language BEFORE any UI rendering
        this.initializeLanguageFirst();
        
        this.init();
    }
    
    initializeDefaultUsers() {
        // Only keep admin profile info for authentication
        const adminProfile = getSecureStorage('tiniAdminProfile');
        if (!adminProfile) {
            const defaultAdminProfile = {
                employeeId: 'ADMIN',
                username: 'admin',
                role: 'boss',
                name: 'System Administrator',
                email: 'admin@system.local',
                loginTime: new Date().toISOString()
            };
            
            setSecureStorage('tiniAdminProfile', JSON.stringify(defaultAdminProfile));
            console.log('🔑 Initialized admin authentication data only');
        }
        
        // Clear any existing user data - will load from API
        if (window.TINI_SYSTEM?.utils?.secureStorage) {
            window.TINI_SYSTEM.utils.secureStorage.remove('usersData');
            window.TINI_SYSTEM.utils.secureStorage.remove('tini_admin_users');
        }
        console.log('🧹 Cleared local user data - will use API server');
    }

    initializeI18nSystem() {
        console.log('🚫 AdminPanel i18n system disabled - using window.customI18n');
        this.i18nData = {};
    }

    initializeLanguageFirst() {
        const savedLang = getSecureStorage('adminLanguage') || 'zh';
        console.log('🌍 Admin panel language:', savedLang);

        if (window.customI18n && typeof window.customI18n.switchLanguage === 'function') {
            try {
                window.customI18n.switchLanguage(savedLang);
                console.log('✅ Language switched via customI18n');
            } catch (error) {
                console.error('❌ Error switching language:', error);
            }
        }
    }

    init() {
        console.log('🚀 TINI Admin Panel initializing...');
        
        try {
            // Initialize all components with individual error handling
            this.safeInitialize('setupNavigation', () => this.setupNavigation());
            this.safeInitialize('setupDashboardInteractions', () => this.setupDashboardInteractions());
            this.safeInitialize('setupUserManagement', () => this.setupUserManagement());
            this.safeInitialize('setupTestingZone', () => this.setupTestingZone());
            this.safeInitialize('setupLogout', () => this.setupLogout());
            this.safeInitialize('initProfileSection', () => this.initProfileSection());
            this.safeInitialize('setupSaveChanges', () => this.setupSaveChanges());
            this.safeInitialize('loadInitialData', () => this.loadInitialData());
            
            console.log('✅ TINI Admin Panel ready!');
            
        } catch (error) {
            console.error('❌ Error initializing TINI Admin Panel:', error);
        }
    }

    safeInitialize(name, func) {
        try {
            func();
            console.log(`✅ ${name} initialized`);
        } catch (error) {
            console.error(`❌ Error initializing ${name}:`, error);
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const section = link.getAttribute('data-section');
                const nav = link.getAttribute('data-nav');
                
                if (nav === 'logout') {
                    this.handleLogout();
                    return;
                }
                
                if (section) {
                    this.switchSection(section);
                    this.updateActiveNav(link);
                }
            });
        });
        
        console.log('✅ Navigation ready');
    }

    switchSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.classList.remove('active'));
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }
    }

    updateActiveNav(activeLink) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        activeLink.classList.add('active');
    }

    setupDashboardInteractions() {
        // Dashboard specific interactions
        console.log('✅ Dashboard interactions ready');
    }

    setupUserManagement() {
        // User management functionality
        console.log('✅ User management ready');
    }

    setupTestingZone() {
        // Testing zone functionality
        console.log('✅ Testing zone ready');
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
        console.log('✅ Logout functionality ready');
    }

    handleLogout() {
        const confirmed = confirm('🚪 Logout from Admin Panel?\n\n🗑️ This will:\n• Clear all cache and settings\n• Reset language preferences\n• Return to login screen\n\nContinue?');
        
        if (confirmed) {
            console.log('🚪 Admin logout with cache clear initiated...');
            
            // Show logout notification
            this.showNotification('🗑️ Clearing cache and logging out...', 'info');
            
            // Clear cache
            try {
                // Clear localStorage (keep only essential auth for re-login)
                const keysToKeep = ['adminUsername', 'adminPassword'];
                const allKeys = Object.keys(localStorage);
                let clearedCount = 0;
                
                allKeys.forEach(key => {
                    if (!keysToKeep.includes(key)) {
                        localStorage.removeItem(key);
                        clearedCount++;
                    }
                });
                
                // Clear sessionStorage  
                sessionStorage.clear();
                
                console.log(`🗑️ Cache cleared: ${clearedCount} localStorage keys removed`);
                
            } catch (error) {
                console.error('❌ Error clearing cache during logout:', error);
            }
            
            // Redirect after a short delay
            setTimeout(() => {
                console.log('🔄 Redirecting to login...');
                window.location.href = 'popup-clean.html';
            }, 1000);
        }
    }

    initProfileSection() {
        console.log('✅ Profile section ready');
    }

    setupSaveChanges() {
        console.log('✅ Save changes ready');
    }

    loadInitialData() {
        // Load initial data
        console.log('✅ Initial data loaded');
    }

    loadUsers() {
        return JSON.parse(getSecureStorage('tini_admin_users') || '[]');
    }

    loadActivities() {
        return JSON.parse(getSecureStorage('tini_admin_activities') || '[]');
    }

    loadSystemStats() {
        return JSON.parse(getSecureStorage('tini_admin_stats') || '{}');
    }

    showNotification(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 8px;
            padding: 15px 20px;
            color: white;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new TINIAdminPanel();
    console.log('🚀 TINI Admin Panel initialized successfully');
});

console.log('📄 admin-panel-main.js loaded');
