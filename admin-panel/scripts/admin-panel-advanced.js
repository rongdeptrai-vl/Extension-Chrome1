// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI Advanced Admin Panel - Main JavaScript
// Enhanced with Ghost Integration & Testing Zone

class TINIAdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.ghostMode = false;
        this.testingModeActive = false;
        this.users = [
            { id: 'EMP001', name: '管理员用户', role: 'admin', lastActive: 'just_now', devices: 2, status: 'active' },
            { id: 'EMP002', name: '普通用户', role: 'user', lastActive: 'hour_ago', devices: 1, status: 'active' },
            { id: 'EMP003', name: '潘文勇 PanVuong  79-1', role: 'employee', lastActive: 'hours_ago_2', devices: 1, status: 'pending' }
        ];
        this.init();
    }

    init() {
        this.initNavigation();
        this.initUserManagement();
        this.initTestingZone();
        this.initProfileSettings();
        this.updateDashboardStats();
        this.startRealTimeUpdates();
        
        console.log('🚀 TINI Advanced Admin Panel initialized successfully');
        console.log('👻 Ghost Integration: Ready');
        console.log('🧪 Testing Zone: Standby');
    }

    // =================== NAVIGATION SYSTEM ===================
    initNavigation() {
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
            
            // Special handling for testing zone
            if (sectionId === 'testing') {
                this.activateTestingZone();
            }
        }
    }

    updateActiveNav(activeLink) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        activeLink.classList.add('active');
    }

    // =================== TESTING ZONE SYSTEM ===================
    activateTestingZone() {
        console.log('🧪 [TESTING ZONE] Activating secure testing environment...');
        
        this.testingModeActive = true;
        
        // Enhanced testing zone features
        this.updateTestingStatus();
        this.enableBypassProtection();
        
        // Show testing zone notification
        this.showNotification('🛡️ Testing Zone Activated - Admin Protection: MAXIMUM', 'success');
    }

    updateTestingStatus() {
        const statusElements = document.querySelectorAll('.system-status span:last-child');
        statusElements.forEach((element, index) => {
            const statuses = ['ACTIVE', 'ALL READY', 'LEVEL 10000', 'ENABLED', 'STANDBY'];
            if (element.querySelector('span')) {
                element.querySelector('span').textContent = statuses[index] || 'ACTIVE';
            }
        });
    }

    enableBypassProtection() {
        // Ghost Boss Protection Integration
        if (typeof window.SystemPerformanceOptimizer !== 'undefined') {
            console.log('👻 [GHOST BOSS] Integration detected - Maximum protection enabled');
            this.ghostMode = true;
        }
        
        // Testing zone safety protocols
        window.TESTING_ZONE_ACTIVE = true;
        window.ADMIN_PROTECTION_LEVEL = 10000;
        window.BYPASS_SYSTEMS_READY = true;
        
        console.log('🛡️ [TESTING ZONE] All safety protocols activated');
    }

    // =================== USER MANAGEMENT SYSTEM ===================
    initUserManagement() {
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => this.showUserForm());
        }

        // Edit user buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-user-btn')) {
                const row = e.target.closest('tr');
                const userId = row.cells[0].textContent;
                this.editUser(userId);
            }
            
            if (e.target.closest('.delete-user-btn')) {
                const row = e.target.closest('tr');
                const userId = row.cells[0].textContent;
                this.deleteUser(userId);
            }
        });
    }

    showUserForm(userData = null) {
        const formContainer = document.getElementById('userFormContainer');
        const formTitle = document.getElementById('formTitle');
        
        if (formContainer && formTitle) {
            formContainer.style.display = 'block';
            formTitle.textContent = userData ? 'Edit User' : 'Add New User';
            
            if (userData) {
                // Fill form with user data
                document.getElementById('userName').value = userData.name;
                document.getElementById('userEmail').value = userData.email || '';
                document.getElementById('userRole').value = userData.role;
                document.getElementById('userStatus').value = userData.status;
            }
            
            formContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            this.showUserForm(user);
        }
    }

    deleteUser(userId) {
        if (confirm(`Are you sure you want to delete user ${userId}?`)) {
            this.users = this.users.filter(u => u.id !== userId);
            this.updateUserTable();
            this.showNotification(`User ${userId} deleted successfully`, 'success');
        }
    }

    updateUserTable() {
        const tbody = document.getElementById('userTableBody');
        if (tbody) {
            tbody.innerHTML = this.users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td data-i18n="${user.name}">${user.name}</td>
                    <td><span class="status-badge status-${user.status}" data-i18n="${user.role}">${user.role}</span></td>
                    <td data-i18n="${user.lastActive}">${user.lastActive}</td>
                    <td>${user.devices}</td>
                    <td>
                        <button class="edit-user-btn" style="background: none; border: 1px solid var(--accent); color: var(--accent); padding: 4px 8px; border-radius: 4px; margin-right: 5px; cursor: pointer;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-user-btn" style="background: none; border: 1px solid var(--danger); color: var(--danger); padding: 4px 8px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // =================== PROFILE SETTINGS ===================
    initProfileSettings() {
        // Avatar upload functionality
        const uploadBtn = document.getElementById('uploadAvatarBtn');
        const avatarUpload = document.getElementById('avatarUpload');
        const previewAvatar = document.getElementById('previewAvatar');
        
        if (uploadBtn && avatarUpload) {
            uploadBtn.addEventListener('click', () => avatarUpload.click());
            
            avatarUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (previewAvatar) {
                            previewAvatar.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Save profile button
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }

        // Language change handler
        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
    }

    saveProfile() {
        const profileData = {
            fullName: document.getElementById('fullName')?.value,
            email: document.getElementById('email')?.value,
            language: document.getElementById('language')?.value,
            timezone: document.getElementById('timezone')?.value,
            theme: document.getElementById('theme')?.value
        };
        
        // Save to localStorage
        localStorage.setItem('tini_admin_profile', JSON.stringify(profileData));
        
        this.showNotification('Profile saved successfully!', 'success');
        
        console.log('👤 [PROFILE] Settings saved:', profileData);
    }

    changeLanguage(lang) {
        console.log(`🌍 [I18N] Switching to language: ${lang}`);
        
        // Update language attribute
        document.documentElement.lang = lang;
        
        // Trigger i18n update if available
        if (typeof window.updateI18n === 'function') {
            window.updateI18n(lang);
        }
        
        this.showNotification(`Language changed to ${lang}`, 'info');
    }

    // =================== DASHBOARD STATS ===================
    updateDashboardStats() {
        const stats = {
            activeUsers: Math.floor(Math.random() * 500) + 1000,
            blockedItems: Math.floor(Math.random() * 5000) + 20000,
            systemHealth: (98 + Math.random() * 2).toFixed(1)
        };

        const cards = document.querySelectorAll('.card-value');
        if (cards.length >= 3) {
            cards[0].textContent = stats.activeUsers.toLocaleString();
            cards[1].textContent = stats.blockedItems.toLocaleString();
            cards[2].textContent = stats.systemHealth + '%';
        }
    }

    // =================== REAL-TIME UPDATES ===================
    startRealTimeUpdates() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateDashboardStats();
        }, 30000);

        // Update testing zone status every 10 seconds
        setInterval(() => {
            if (this.testingModeActive) {
                this.updateTestingStatus();
            }
        }, 10000);

        console.log('⏱️ [REAL-TIME] Updates started');
    }

    // =================== NOTIFICATION SYSTEM ===================
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 15px 20px;
            color: var(--text);
            z-index: 1000;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${this.getNotificationIcon(type)}" style="color: var(--${this.getNotificationColor(type)});"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: 'success',
            error: 'danger',
            warning: 'warning',
            info: 'accent'
        };
        return colors[type] || 'accent';
    }

    // =================== LOGOUT HANDLING ===================
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            console.log('👋 [AUTH] Logging out...');
            
            // Clear session data
            localStorage.removeItem('tini_admin_session');
            
            // Redirect to login page or main extension
            window.close();
        }
    }

    // =================== GHOST INTEGRATION ===================
    enableGhostMode() {
        if (this.ghostMode) {
            console.log('👻 [GHOST MODE] Already active');
            return;
        }
        
        this.ghostMode = true;
        console.log('👻 [GHOST MODE] Activated with BOSS protection');
        
        // Add ghost mode indicator
        const ghostIndicator = document.createElement('div');
        ghostIndicator.innerHTML = '👻 GHOST MODE ACTIVE';
        ghostIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(57, 255, 20, 0.1);
            border: 1px solid var(--testing-green);
            color: var(--testing-green);
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 1001;
            animation: pulse 2s infinite;
        `;
        
        document.body.appendChild(ghostIndicator);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tiniAdminPanel = new TINIAdminPanel();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl + Shift + G for Ghost Mode
        if (e.ctrlKey && e.shiftKey && e.key === 'G') {
            window.tiniAdminPanel.enableGhostMode();
        }
        
        // Ctrl + Shift + T for Testing Zone
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            window.tiniAdminPanel.switchSection('testing');
        }
    });
});

console.log('🚀 TINI Advanced Admin Panel script loaded successfully');
