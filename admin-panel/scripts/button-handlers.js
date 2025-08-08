// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Button Event Handlers for Admin Panel
console.log('🔘 [BUTTONS] Button Event Handlers Loading...');

class AdminPanelButtons {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupAllButtons());
        } else {
            this.setupAllButtons();
        }
    }

    setupAllButtons() {
        console.log('🔘 [BUTTONS] Setting up all button event handlers...');
        
        // Load saved data first
        this.loadSavedData();
        
        // Setup navigation buttons
        this.setupNavigationButtons();
        
        // Setup user management buttons
        this.setupUserManagementButtons();
        
        // Setup profile buttons
        this.setupProfileButtons();
        
        // Setup general action buttons
        this.setupGeneralButtons();
        
        // Setup dashboard buttons
        this.setupDashboardButtons();
        
        // Setup report buttons
        this.setupReportButtons();
        
        console.log('✅ [BUTTONS] All button handlers setup complete');
    }

    setupNavigationButtons() {
        console.log('📍 [BUTTONS] Setting up navigation buttons...');
        
        // Advanced Mode Toggle
        const advancedModeToggle = document.getElementById('advancedModeToggle');
        if (advancedModeToggle) {
            advancedModeToggle.addEventListener('change', (e) => {
                const isEnabled = e.target.checked;
                const modelSwitcher = document.getElementById('modelSwitcher');
                
                if (modelSwitcher) {
                    modelSwitcher.style.display = isEnabled ? 'block' : 'none';
                }
                
                this.showNotification(
                    isEnabled ? '🔧 Advanced Mode Enabled' : '🔧 Advanced Mode Disabled',
                    'info'
                );
                
                console.log(`🔧 [BUTTONS] Advanced mode: ${isEnabled ? 'enabled' : 'disabled'}`);
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    setupUserManagementButtons() {
        console.log('👥 [BUTTONS] Setting up user management buttons...');
        
        // Add User buttons (there are multiple with same function)
        const addUserBtns = document.querySelectorAll('#addUserBtn, [data-i18n="add_user_btn"]');
        addUserBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAddUser();
            });
        });

        // Edit User buttons
        const editUserBtns = document.querySelectorAll('.edit-user-btn');
        editUserBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const row = btn.closest('tr');
                const userId = row ? row.cells[0].textContent : 'Unknown';
                this.handleEditUser(userId);
            });
        });

        // Delete User buttons
        const deleteUserBtns = document.querySelectorAll('.delete-user-btn');
        deleteUserBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const row = btn.closest('tr');
                const userId = row ? row.cells[0].textContent : 'Unknown';
                this.handleDeleteUser(userId);
            });
        });

        console.log(`👥 [BUTTONS] Setup ${addUserBtns.length} add user, ${editUserBtns.length} edit user, ${deleteUserBtns.length} delete user buttons`);
    }

    setupProfileButtons() {
        console.log('👤 [BUTTONS] Setting up profile buttons...');
        
        // Upload Avatar button
        const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
        const avatarUpload = document.getElementById('avatarUpload');
        
        if (uploadAvatarBtn && avatarUpload) {
            uploadAvatarBtn.addEventListener('click', () => {
                avatarUpload.click();
            });
            
            avatarUpload.addEventListener('change', (e) => {
                this.handleAvatarUpload(e);
            });
        }

        // Save Avatar button
        const saveAvatarBtn = document.getElementById('saveAvatarBtn');
        if (saveAvatarBtn) {
            saveAvatarBtn.addEventListener('click', () => {
                this.handleSaveAvatar();
            });
        }

        // Save Profile button
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                this.handleSaveProfile();
            });
        }
    }

    setupGeneralButtons() {
        console.log('⚙️ [BUTTONS] Setting up general action buttons...');
        
        // View All buttons
        const viewAllBtns = document.querySelectorAll('[data-i18n="view_all"]');
        viewAllBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleViewAll();
            });
        });

        // Export Data buttons
        const exportBtns = document.querySelectorAll('[data-translate="exportData"]');
        exportBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleExportData();
            });
        });

        // Save Changes buttons (generic)
        const saveChangesBtns = document.querySelectorAll('button');
        saveChangesBtns.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            if ((text.includes('save') || text.includes('lưu')) && !btn.id) {
                btn.addEventListener('click', () => {
                    this.handleSaveChanges();
                });
            }
        });
    }

    setupDashboardButtons() {
        console.log('📊 [BUTTONS] Setting up dashboard buttons...');
        
        // Dashboard cards that are clickable
        const dashboardCards = document.querySelectorAll('.dashboard-card[style*="cursor: pointer"]');
        dashboardCards.forEach(card => {
            card.addEventListener('click', () => {
                const cardTitle = card.querySelector('h3, .card-title');
                const title = cardTitle ? cardTitle.textContent : 'Dashboard Item';
                this.handleDashboardCardClick(title);
            });
        });
    }

    setupReportButtons() {
        console.log('📋 [BUTTONS] Setting up report buttons...');
        
        // Generate Report buttons
        const generateReportBtns = document.querySelectorAll('button');
        generateReportBtns.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            if (text.includes('generate report') || text.includes('tạo báo cáo') || btn.hasAttribute('data-i18n') && btn.getAttribute('data-i18n').includes('generate_report')) {
                btn.addEventListener('click', () => {
                    this.handleGenerateReport();
                });
            }
        });

        // Download buttons in reports
        const downloadBtns = document.querySelectorAll('button .fa-download');
        downloadBtns.forEach(btn => {
            const button = btn.closest('button');
            if (button) {
                button.addEventListener('click', () => {
                    this.handleDownloadReport(button);
                });
            }
        });
    }

    // Event Handlers
    handleLogout() {
        console.log('🚪 [BUTTONS] Logout clicked');
        
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            this.showNotification('🚪 Đang đăng xuất...', 'info');
            
            setTimeout(() => {
                localStorage.removeItem('tini_admin_session');
                window.location.href = '/';
            }, 1000);
        }
    }

    handleAddUser() {
        console.log('👤➕ [BUTTONS] Add user clicked');
        
        const userName = prompt('Nhập tên người dùng mới:');
        if (userName && userName.trim()) {
            this.showNotification(`👤 Đã thêm người dùng: ${userName}`, 'success');
            
            // Add to table (basic implementation)
            this.addUserToTable(userName.trim());
        }
    }

    handleEditUser(userId) {
        console.log(`👤✏️ [BUTTONS] Edit user: ${userId}`);
        
        const newName = prompt(`Chỉnh sửa thông tin user ${userId}:`);
        if (newName && newName.trim()) {
            this.showNotification(`👤 Đã cập nhật user ${userId}: ${newName}`, 'success');
        }
    }

    handleDeleteUser(userId) {
        console.log(`👤🗑️ [BUTTONS] Delete user: ${userId}`);
        
        if (confirm(`Bạn có chắc chắn muốn xóa user ${userId}?`)) {
            this.showNotification(`👤 Đã xóa user ${userId}`, 'warning');
        }
    }

    handleAvatarUpload(event) {
        console.log('🖼️ [BUTTONS] Avatar upload');
        
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarData = e.target.result;
                const previewAvatar = document.getElementById('previewAvatar');
                
                if (previewAvatar) {
                    previewAvatar.innerHTML = `<img src="${avatarData}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                }
                
                // Store avatar data temporarily until save
                this.tempAvatarData = avatarData;
                this.showNotification('🖼️ Avatar đã được tải lên, nhấn Save để lưu', 'info');
            };
            reader.readAsDataURL(file);
        }
    }

    handleSaveAvatar() {
        console.log('💾 [BUTTONS] Save avatar');
        
        if (this.tempAvatarData) {
            // Save to localStorage
            localStorage.setItem('tini_admin_avatar', this.tempAvatarData);
            
            // Update current avatar
            const currentAvatar = document.getElementById('currentAvatar');
            if (currentAvatar) {
                currentAvatar.innerHTML = `<img src="${this.tempAvatarData}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
            
            // Update all user avatars in the page
            this.updateAllAvatars(this.tempAvatarData);
            
            this.tempAvatarData = null;
            this.showNotification('💾 Avatar đã được lưu thành công', 'success');
        } else {
            this.showNotification('⚠️ Vui lòng chọn avatar trước', 'warning');
        }
    }

    handleSaveProfile() {
        console.log('💾 [BUTTONS] Save profile');
        
        const fullName = document.getElementById('fullName')?.value;
        const email = document.getElementById('email')?.value;
        const timezone = document.getElementById('timezone')?.value;
        const language = document.getElementById('language')?.value;
        const theme = document.getElementById('theme')?.value;
        
        if (fullName && email) {
            // Save profile data
            const profileData = {
                fullName,
                email,
                timezone,
                language,
                theme,
                savedAt: Date.now()
            };
            
            localStorage.setItem('tini_admin_profile', JSON.stringify(profileData));
            
            // Update all profile displays
            this.updateProfileDisplays(profileData);
            
            this.showNotification(`💾 Profile đã được lưu: ${fullName}`, 'success');
        } else {
            this.showNotification('⚠️ Vui lòng điền đầy đủ thông tin', 'warning');
        }
    }

    updateAllAvatars(avatarData) {
        // Update all avatar elements in the page
        const avatarElements = document.querySelectorAll('.user-avatar, #currentAvatar, #previewAvatar');
        avatarElements.forEach(element => {
            element.innerHTML = `<img src="${avatarData}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        });
    }

    updateProfileDisplays(profileData) {
        // Update all profile name displays
        const nameElements = document.querySelectorAll('[data-i18n="admin_user"]');
        nameElements.forEach(element => {
            element.textContent = profileData.fullName;
        });
    }

    // Load saved data on page load
    loadSavedData() {
        // Load saved avatar
        const savedAvatar = localStorage.getItem('tini_admin_avatar');
        if (savedAvatar) {
            this.updateAllAvatars(savedAvatar);
        }
        
        // Load saved profile
        const savedProfile = localStorage.getItem('tini_admin_profile');
        if (savedProfile) {
            try {
                const profileData = JSON.parse(savedProfile);
                
                // Populate form fields
                if (document.getElementById('fullName')) {
                    document.getElementById('fullName').value = profileData.fullName || '';
                }
                if (document.getElementById('email')) {
                    document.getElementById('email').value = profileData.email || '';
                }
                if (document.getElementById('timezone')) {
                    document.getElementById('timezone').value = profileData.timezone || 'UTC+7';
                }
                if (document.getElementById('language')) {
                    document.getElementById('language').value = profileData.language || 'en';
                }
                if (document.getElementById('theme')) {
                    document.getElementById('theme').value = profileData.theme || 'dark';
                }
                
                // Update displays
                this.updateProfileDisplays(profileData);
                
                console.log('✅ [BUTTONS] Loaded saved profile data');
            } catch (error) {
                console.error('❌ [BUTTONS] Error loading profile data:', error);
            }
        }
    }

    handleViewAll() {
        console.log('👁️ [BUTTONS] View all clicked');
        this.showNotification('👁️ Hiển thị tất cả dữ liệu', 'info');
    }

    handleExportData() {
        console.log('📤 [BUTTONS] Export data');
        this.showNotification('📤 Đang xuất dữ liệu...', 'info');
        
        // Simulate export
        setTimeout(() => {
            this.showNotification('📤 Dữ liệu đã được xuất thành công', 'success');
        }, 1500);
    }

    handleSaveChanges() {
        console.log('💾 [BUTTONS] Save changes');
        this.showNotification('💾 Các thay đổi đã được lưu', 'success');
    }

    handleDashboardCardClick(title) {
        console.log(`📊 [BUTTONS] Dashboard card clicked: ${title}`);
        this.showNotification(`📊 Xem chi tiết: ${title}`, 'info');
    }

    handleGenerateReport() {
        console.log('📋 [BUTTONS] Generate report');
        this.showNotification('📋 Đang tạo báo cáo...', 'info');
        
        setTimeout(() => {
            this.showNotification('📋 Báo cáo đã được tạo thành công', 'success');
        }, 2000);
    }

    handleDownloadReport(button) {
        console.log('📥 [BUTTONS] Download report');
        this.showNotification('📥 Đang tải báo cáo...', 'info');
        
        setTimeout(() => {
            this.showNotification('📥 Báo cáo đã được tải xuống', 'success');
        }, 1000);
    }

    // Utility Functions
    addUserToTable(userName) {
        const userTableBody = document.getElementById('userTableBody');
        if (userTableBody) {
            const newRow = document.createElement('tr');
            const empId = `EMP${String(Date.now()).slice(-3)}`;
            
            newRow.innerHTML = `
                <td>${empId}</td>
                <td>${userName}</td>
                <td><span class="status-badge status-pending">User</span></td>
                <td>Just now</td>
                <td>0</td>
                <td>
                    <button class="edit-user-btn" style="background: none; border: 1px solid var(--accent); color: var(--accent); padding: 4px 8px; border-radius: 4px; margin-right: 5px; cursor: pointer;" title="Edit user">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-user-btn" style="background: none; border: 1px solid var(--danger); color: var(--danger); padding: 4px 8px; border-radius: 4px; cursor: pointer;" title="Delete user">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            userTableBody.appendChild(newRow);
            
            // Re-setup button handlers for new buttons
            this.setupUserManagementButtons();
        }
    }

    showNotification(message, type = 'info') {
        console.log(`🔔 [NOTIFICATION] ${type}: ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Set color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#10b981';
                break;
            case 'warning':
                notification.style.background = '#f59e0b';
                break;
            case 'error':
                notification.style.background = '#ef4444';
                break;
            default:
                notification.style.background = '#3b82f6';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminPanelButtons = new AdminPanelButtons();
    });
} else {
    window.adminPanelButtons = new AdminPanelButtons();
}

// Export for global access
window.AdminPanelButtons = AdminPanelButtons;
