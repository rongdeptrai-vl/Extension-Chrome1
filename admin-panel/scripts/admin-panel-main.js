// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited

// SECURE ADMIN HELPER - initialize via TINI_SYSTEM
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
        this.currentAvatar = (window.TINI_SYSTEM?.utils?.secureStorage?.get('adminAvatar') || window.secureGetStorage && window.secureGetStorage('adminAvatar') || localStorage.getItem('adminAvatar')) || null;
        
        // Initialize default user data if empty
        this.initializeDefaultUsers();
        
        // Initialize i18n system
        this.initializeI18nSystem();
        
        // Initialize language BEFORE any UI rendering
        this.initializeLanguageFirst();
        
        this.init();
    }
    
    initializeDefaultUsers() {
        // ❌ REMOVED: No more hardcoded default users
        // Will load users from API server instead
        
        // Only keep admin profile info for authentication
        const adminProfile = (window.TINI_SYSTEM?.utils?.secureStorage?.get('tiniAdminProfile') || window.secureGetStorage && window.secureGetStorage('tiniAdminProfile') || localStorage.getItem('tiniAdminProfile'));
        if (!adminProfile) {
            // Initialize only admin authentication data
            const defaultAdminProfile = {
                employeeId: 'ADMIN',
                username: 'admin',
                role: 'boss', // Boss has full permissions
                name: 'System Administrator',
                email: 'admin@system.local',
                loginTime: new Date().toISOString()
            };
            
            // Fixed: Proper storage syntax
            if (window.TINI_SYSTEM?.utils?.secureStorage) {
                window.TINI_SYSTEM.utils.secureStorage.set('tiniAdminProfile', JSON.stringify(defaultAdminProfile));
            } else if (window.secureSetStorage) {
                window.secureSetStorage('tiniAdminProfile', JSON.stringify(defaultAdminProfile));
            } else {
                localStorage.setItem('tiniAdminProfile', JSON.stringify(defaultAdminProfile));
            }
            console.log('🔑 Initialized admin authentication data only');
        }
        
        // Clear any existing user data - will load from API
        if (window.TINI_SYSTEM?.utils?.secureStorage) {
            window.TINI_SYSTEM.utils.secureStorage.remove('usersData');
            window.TINI_SYSTEM.utils.secureStorage.remove('tini_admin_users');
        } else if (window.secureRemoveStorage) {
            window.secureRemoveStorage('usersData');
            window.secureRemoveStorage('tini_admin_users');
        } else {
            localStorage.removeItem('usersData');
            localStorage.removeItem('tini_admin_users');
        }
        console.log('🧹 Cleared local user data - will use API server');
    }

    // ========================================
    // 🌍 CUSTOM I18N SYSTEM (TRIỆT ĐỂ)
    // ========================================
    
    initializeI18nSystem() {
        console.log(`🚫 AdminPanel i18n system disabled - using window.customI18n`);
        this.i18nData = {};
        this.i18nCache = {}; // Cache for loaded messages
        this.currentLanguage = 'zh'; // Force Chinese default
    }

    loadMessages(lang = "en", callback) {
        console.log(`🚫 AdminPanel.loadMessages() disabled - using window.customI18n instead`);
        
        // Always set to Chinese and delegate to custom-i18n
        this.currentLanguage = 'zh';
        this.i18nData = {}; // Empty to force use of window.customI18n
        
        if (typeof callback === "function") callback();
        return;
        
        // Check cache first
        if (this.i18nCache[lang]) {
            this.i18nData = this.i18nCache[lang];
            this.currentLanguage = lang;
            console.log(`✅ Messages loaded from cache for ${lang}:`, Object.keys(this.i18nData).length, 'keys');
            if (typeof callback === "function") callback();
            return;
        }

        fetch(`/_locales/${lang}/messages.json`)
            .then(res => {
                if (!res.ok) throw new Error("Load failed");
                return res.json();
            })
            .then(json => {
                this.i18nCache[lang] = json; // Cache the loaded messages
                this.i18nData = json;
                this.currentLanguage = lang;
                console.log(`✅ Messages loaded for ${lang}:`, Object.keys(json).length, 'keys');
                if (typeof callback === "function") callback();
            })
            .catch(err => {
                console.warn(`❌ Failed to load ${lang}. Fallback to ZH.`, err);
                if (lang !== "zh") {
                    this.loadMessages("zh", callback); // fallback to Chinese
                }
            });
    }

    getMessage(key) {
        return this.i18nData?.[key]?.message || key;
    }

    applyI18nToPanel() {
        try {
            console.log(`🚀 Applying i18n to panel (${this.currentLanguage})`);
            let appliedCount = 0;

            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                const msg = this.getMessage(key);
                if (!msg || msg === key) return;

                if (["INPUT", "BUTTON", "TEXTAREA"].includes(el.tagName)) {
                    if (el.placeholder !== undefined) {
                        el.placeholder = msg;
                    } else {
                        el.value = msg;
                    }
                } else {
                    // Preserve icons for buttons
                    if (el.tagName === "BUTTON") {
                        const icon = el.querySelector('i');
                        if (icon) {
                            window.secureSetHTML && window.secureSetHTML(el, `${icon.outerHTML} ${msg}`) || (el.textContent = String(`${icon.outerHTML} ${msg}`).replace(/<[^>]*>/g, ""));
                        } else {
                            el.textContent = msg;
                        }
                    } else {
                        el.textContent = msg;
                    }
                }
                appliedCount++;
            });

            console.log(`✅ Applied i18n to ${appliedCount} elements`);
            
            // 👉 Set title sau cùng
            document.title = this.getMessage("page_title");
        } catch (error) {
            console.error('❌ Error applying i18n to panel:', error);
        }
    }

    // Initialize language BEFORE any UI rendering
    initializeLanguageFirst() {
        try {
            // Get saved language from multiple sources
            this.currentLanguage = 
                (window.TINI_SYSTEM?.utils?.secureStorage?.get('currentLanguage') || window.secureGetStorage && window.secureGetStorage('currentLanguage') || localStorage.getItem('currentLanguage')) ||
                (window.TINI_SYSTEM?.utils?.secureStorage?.get('selectedLanguage') || window.secureGetStorage && window.secureGetStorage('selectedLanguage') || localStorage.getItem('selectedLanguage')) ||
                (window.TINI_SYSTEM?.utils?.secureStorage?.get('adminLanguage') || window.secureGetStorage && window.secureGetStorage('adminLanguage') || localStorage.getItem('adminLanguage')) ||
                'zh'; // Change fallback to Chinese
            
            console.log(`🌍 Language initialized: ${this.currentLanguage}`);
            
            // Force regenerate data with Chinese language
            if (this.currentLanguage === 'zh') {
                (window.TINI_SYSTEM?.utils?.secureStorage?.remove('usersData') || window.secureRemoveStorage && window.secureRemoveStorage('usersData') || localStorage.removeItem('usersData')); // Force regenerate users
                console.log('🔄 Forcing Chinese data regeneration...');
            }
            
            // Initialize custom i18n system if available
            if (window.customI18n) {
                window.customI18n.initializeFromStorage();
                console.log('✅ Custom i18n system initialized');
            }
            
            // Set Chrome i18n context if available
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ 
                    language: this.currentLanguage,
                    currentLanguage: this.currentLanguage 
                });
            }
            
        } catch (error) {
            console.error('❌ Error initializing language:', error);
            this.currentLanguage = 'zh'; // Fallback to Chinese instead
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
            this.safeInitialize('loadUserAvatars', () => this.loadUserAvatars());
            
            // 🔒 Initialize GHOST System Integration
            this.safeInitialize('initGHOSTIntegration', () => this.initGHOSTIntegration());
            
            // 🌍 LOAD MESSAGES AND APPLY I18N IMMEDIATELY
            setTimeout(() => {
                try {
                    // FORCE Chinese language - ignore any stored language
                    const lang = "zh"; // Always force Chinese
                    console.log(`🌍 FORCING Chinese language: ${lang}`);
                    
                    // Safely set storage
                    try {
                        chrome.storage.local.set({language: "zh"});
                    } catch (storageError) {
                        console.warn('⚠️ Storage error:', storageError);
                    }
                    
                    this.loadMessages(lang, () => {
                        try {
                            this.applyI18nToPanel(); // Apply to entire panel immediately
                                
                            // Initialize user data AFTER i18n is loaded
                            this.initializeUsersData();
                            this.loadUsersTable();
                                
                            console.log('✅ I18n system initialized and applied with user data');
                        } catch (callbackError) {
                            console.error('❌ Error in loadMessages callback:', callbackError);
                        }
                    });
                } catch (mainError) {
                    console.error('❌ Error in language initialization:', mainError);
                }
            }, 200);
            
            console.log('✅ TINI Admin Panel ready!');
            
        } catch (error) {
            console.error('❌ Error initializing TINI Admin Panel:', error);
        }
    }

    // Safe initialization helper
    safeInitialize(componentName, initFunction) {
        try {
            initFunction();
            console.log(`✅ ${componentName} initialized successfully`);
        } catch (error) {
            console.error(`❌ Error initializing ${componentName}:`, error);
            // Continue with other components even if one fails
        }
    }

    // =================
    // NAVIGATION SYSTEM
    // =================
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const contentSections = document.querySelectorAll('.content-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetSection = link.getAttribute('data-section');
                this.switchSection(targetSection);
            });
        });

        console.log('✅ Navigation system ready');
    }

    switchSection(sectionName) {
        // Remove active from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active to clicked nav link
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Load section-specific content
            this.loadSectionContent(sectionName);
            
            // Apply i18n to newly shown section
            setTimeout(() => {
                this.applyI18nToPanel(); // Use our custom i18n system
                console.log(`🌍 Applied i18n to section: ${sectionName}`);
            }, 50);
        }

        console.log(`🎯 Switched to section: ${sectionName}`);
    }

    // Load section content with better error handling
    loadSectionContent(sectionName) {
        try {
            switch(sectionName) {
                case 'dashboard':
                    this.refreshDashboardStats();
                    break;
                case 'users':
                    this.loadUserManagementContent();
                    break;
                case 'profile':
                    // Re-initialize profile section when switching to it
                    setTimeout(() => {
                        this.initProfileSection();
                    }, 100);
                    break;
                case 'security':
                    this.loadSecurityContent();
                    break;
                case 'settings':
                    this.loadSettingsContent();
                    break;
                case 'analytics':
                    this.loadAnalyticsContent();
                    break;
                case 'reports':
                    this.loadReportsContent();
                    break;
                case 'testing':
                    this.initializeTestingZone();
                    break;
                default:
                    console.log('Section content not implemented yet:', sectionName);
            }
            
            // Apply translations after loading content
            setTimeout(() => {
                this.applyI18nToPanel();
                console.log(`🌍 Applied i18n after loading section: ${sectionName}`);
            }, 100);
            
        } catch (error) {
            console.error('Error loading section content:', error);
            this.showNotification(this.getMessage('error_loading_content'), 'error');
        }
    }

    // ==================
    // DASHBOARD FEATURES
    // ==================
    setupDashboardInteractions() {
        // View All button for Recent Activity
        const viewAllBtn = document.querySelector('.activity-section button');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.showAllActivities();
            });
        }

        // Add User button - use proper ID selector
        const addUserBtn = document.querySelector('#addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showAddUserModal();
            });
        }

        // User Form Handlers
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveUser();
            });
        }

        const cancelUserForm = document.getElementById('cancelUserForm');
        if (cancelUserForm) {
            cancelUserForm.addEventListener('click', () => {
                this.hideUserForm();
            });
        }

        // Dashboard cards interactions
        const dashboardCards = document.querySelectorAll('.dashboard-card');
        dashboardCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showCardDetails(index);
            });
            card.style.cursor = 'pointer';
        });

        console.log('✅ Dashboard interactions ready');
    }

    refreshDashboardStats() {
        // Simulate real-time data updates
        const stats = this.generateRandomStats();
        
        const cards = document.querySelectorAll('.dashboard-card');
        if (cards.length >= 3) {
            // Update Active Users
            const activeUsersValue = cards[0].querySelector('.card-value');
            const activeUsersChange = cards[0].querySelector('.card-change');
            if (activeUsersValue) {
                activeUsersValue.textContent = stats.activeUsers.toLocaleString();
            }
            if (activeUsersChange) {
                window.secureSetHTML && window.secureSetHTML(activeUsersChange, `<i class="fas fa-arrow-up"></i> ${stats.userChange}% ${this.getMessage('from_last_week') || 'from last week'}`) || (activeUsersChange.textContent = String(`<i class="fas fa-arrow-up"></i> ${stats.userChange}% ${this.getMessage('from_last_week') || 'from last week'}`).replace(/<[^>]*>/g, ""));
                activeUsersChange.className = stats.userChange > 0 ? 'card-change positive' : 'card-change negative';
            }

            // Update Blocked Items
            const blockedValue = cards[1].querySelector('.card-value');
            const blockedChange = cards[1].querySelector('.card-change');
            if (blockedValue) {
                blockedValue.textContent = stats.blockedItems.toLocaleString();
            }
            if (blockedChange) {
                window.secureSetHTML && window.secureSetHTML(blockedChange, `<i class="fas fa-arrow-up"></i> ${stats.blockedChange}% ${this.getMessage('from_last_week') || 'from last week'}`) || (blockedChange.textContent = String(`<i class="fas fa-arrow-up"></i> ${stats.blockedChange}% ${this.getMessage('from_last_week') || 'from last week'}`).replace(/<[^>]*>/g, ""));
            }

            // Update System Health
            const healthValue = cards[2].querySelector('.card-value');
            const healthChange = cards[2].querySelector('.card-change');
            if (healthValue) {
                healthValue.textContent = stats.systemHealth + '%';
            }
            if (healthChange) {
                const icon = stats.healthChange > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                window.secureSetHTML && window.secureSetHTML(healthChange, `<i class="fas ${icon}"></i> ${Math.abs(stats.healthChange)}% ${this.getMessage('from_yesterday') || 'from yesterday'}`) || (healthChange.textContent = String(`<i class="fas ${icon}"></i> ${Math.abs(stats.healthChange)}% ${this.getMessage('from_yesterday') || 'from yesterday'}`).replace(/<[^>]*>/g, ""));
                healthChange.className = stats.healthChange > 0 ? 'card-change positive' : 'card-change negative';
            }
        }

        console.log('📊 Dashboard stats updated');
    }

    generateRandomStats() {
        return {
            activeUsers: 1428 + Math.floor(Math.random() * 100),
            userChange: (Math.random() * 20 - 5).toFixed(1),
            blockedItems: 24901 + Math.floor(Math.random() * 1000),
            blockedChange: (Math.random() * 15 + 5).toFixed(1),
            systemHealth: (99.5 + Math.random() * 0.4).toFixed(1),
            healthChange: (Math.random() * 0.4 - 0.2).toFixed(1)
        };
    }

    showAllActivities() {
        this.showNotification('📋 Showing all activities...', 'info');
        // Here you would typically open a modal or navigate to a detailed view
        console.log('📋 Show all activities requested');
    }

    showCardDetails(cardIndex) {
        const cardTitles = [
            this.getMessage('active_users') || 'Active Users', 
            this.getMessage('blocked_items') || 'Blocked Items', 
            this.getMessage('system_health') || 'System Health'
        ];
        const title = cardTitles[cardIndex] || this.getMessage('card_details') || 'Card Details';
        
        this.showNotification(`📊 ${this.getMessage('viewing_details') || 'Viewing'} ${title} ${this.getMessage('details') || 'details'}...`, 'info');
        console.log(`📊 Card ${cardIndex} clicked: ${title}`);
    }

    // =================
    // USER MANAGEMENT
    // =================
    setupUserManagement() {
        // Users data will be initialized after i18n loads
        // this.initializeUsersData(); // Moved to i18n callback
        
        // Setup event listeners for user action buttons
        this.setupUserActionListeners();
        console.log('✅ User management ready');
    }

    initializeUsersData() {
        // Check if users data exists, if not create default data
        let usersData = (window.TINI_SYSTEM?.utils?.secureStorage?.get('usersData') || window.secureGetStorage && window.secureGetStorage('usersData') || localStorage.getItem('usersData'));
        if (!usersData) {
            const defaultUsers = [
                {
                    id: 'PC01',
                    name: this.getMessage('admin_user') || '管理员用户',
                    role: 'Admin',
                    lastActive: this.getMessage('just_now') || '刚刚',
                    devices: 2
                },
                {
                    id: 'PC02', 
                    name: this.getMessage('regular_user') || '普通用户',
                    role: 'User',
                    lastActive: this.getMessage('one_hour_ago') || '1小时前',
                    devices: 1
                },
                {
                    id: 'PC03',
                    name: 'Hào-Z PanVuong 79-1',
                    role: this.getMessage('employee_role') || '员工',
                    lastActive: this.getMessage('two_hours_ago') || '2小时前',
                    devices: 1
                }
            ];
            
            // Fixed: Proper storage syntax
            if (window.TINI_SYSTEM?.utils?.secureStorage) {
                window.TINI_SYSTEM.utils.secureStorage.set('usersData', JSON.stringify(defaultUsers));
            } else if (window.secureSetStorage) {
                window.secureSetStorage('usersData', JSON.stringify(defaultUsers));
            } else {
                localStorage.setItem('usersData', JSON.stringify(defaultUsers));
            }
            console.log('📝 Created default users data');
        }
        
        // Load and display current users
        this.loadUsersTable();
    }

    async loadUsersTable() {
        console.log('🌐 Loading users table from API...');
        
        try {
            // Initialize API manager if not done yet
            if (!window.apiUserManager.initialized) {
                await window.apiUserManager.initialize();
            }
            
            // Get users from API
            const users = await window.apiUserManager.getUsers();
            const tableBody = document.querySelector('#userTableBody');
            
            console.log('📊 Users from API:', users.length);
            console.log('🎯 Table body found:', !!tableBody);
            
            if (!tableBody) {
                console.error('❌ User table body not found!');
                return;
            }
            
            window.secureSetHTML && window.secureSetHTML(tableBody, '') || (tableBody.textContent = String('').replace(/<[^>]*>/g, ""));
            
            if (users.length === 0) {
                window.secureSetHTML && window.secureSetHTML(tableBody, `
                    <tr>
                        <td colspan="6" class="text-center text-muted">
                            <i class="fas fa-inbox"></i> ${this.getMessage('no_users_found') || 'No users found - Add users via API'}
                        </td>
                    </tr>
                `) || (tableBody.textContent = String(`
                    <tr>
                        <td colspan="6" class="text-center text-muted">
                            <i class="fas fa-inbox"></i> ${this.getMessage('no_users_found') || 'No users found - Add users via API'}
                        </td>
                    </tr>
                `).replace(/<[^>]*>/g, ""));
                console.log('📭 No users from API - empty table displayed');
                return;
            }
            
            users.forEach((user, index) => {
                const row = document.createElement('tr');
                // Use direct translation keys instead of dynamic generation
                let roleText = user.role;
                if (user.role === 'Admin') {
                    roleText = this.getMessage('admin') || '管理员';
                } else if (user.role === 'User') {
                    roleText = this.getMessage('user') || '用户';
                } else if (user.role === 'Employee') {
                    roleText = this.getMessage('employee_role') || '员工';
                }
                
                // Direct lastActive translation
                let lastActiveText = user.lastActive;
                if (user.lastActive && (user.lastActive.includes('now') || user.lastActive === '刚刚')) {
                    lastActiveText = this.getMessage('just_now') || '刚刚';
                } else if (user.lastActive && (user.lastActive.includes('1 hour') || user.lastActive === '1小时前')) {
                    lastActiveText = this.getMessage('one_hour_ago') || '1小时前';
                } else if (user.lastActive && (user.lastActive.includes('2 hour') || user.lastActive === '2小时前')) {
                    lastActiveText = this.getMessage('two_hours_ago') || '2小时前';
                }
                
                // Create table row with proper HTML
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${roleText}</td>
                    <td>${lastActiveText}</td>
                    <td>${user.devices || 0}</td>
                    <td>
                        <button class="edit-user-btn" data-user-id="${user.id}" style="background: none; border: 1px solid var(--accent); color: var(--accent); padding: 4px 8px; border-radius: 4px; margin-right: 5px; cursor: pointer;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-user-btn" data-user-id="${user.id}" style="background: none; border: 1px solid var(--danger); color: var(--danger); padding: 4px 8px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            console.log(`✅ Loaded ${users.length} users from API to table`);
            
            // Apply i18n to newly created table
            this.applyI18nToPanel();
            
            // Re-setup event listeners after loading
            this.setupUserActionListeners();
            
        } catch (error) {
            console.error('❌ Failed to load users from API:', error);
            
            const tableBody = document.querySelector('#userTableBody');
            if (tableBody) {
                window.secureSetHTML && window.secureSetHTML(tableBody, `
                    <tr>
                        <td colspan="6" class="text-center text-danger">
                            <i class="fas fa-exclamation-triangle"></i> Failed to load users from API
                            <br><small>${error.message}</small>
                        </td>
                    </tr>
                `) || (tableBody.textContent = String(`
                    <tr>
                        <td colspan="6" class="text-center text-danger">
                            <i class="fas fa-exclamation-triangle"></i> Failed to load users from API
                            <br><small>${error.message}</small>
                        </td>
                    </tr>
                `).replace(/<[^>]*>/g, ""));
            }
        }
    }

    setupUserActionListeners() {
        // Get all edit and delete buttons
        const editButtons = document.querySelectorAll('.edit-user-btn');
        const deleteButtons = document.querySelectorAll('.delete-user-btn');

        console.log(`🔗 Setting up listeners for ${editButtons.length} edit and ${deleteButtons.length} delete buttons`);

        editButtons.forEach((btn) => {
            // Remove existing listeners
            btn.replaceWith(btn.cloneNode(true));
        });

        deleteButtons.forEach((btn) => {
            // Remove existing listeners
            btn.replaceWith(btn.cloneNode(true));
        });

        // Get updated buttons after cloning
        const newEditButtons = document.querySelectorAll('.edit-user-btn');
        const newDeleteButtons = document.querySelectorAll('.delete-user-btn');

        newEditButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const userId = btn.getAttribute('data-user-id');
                console.log(`✏️ Edit user clicked for ID: ${userId}`);
                this.editUser(userId);
            });
        });

        newDeleteButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const userId = btn.getAttribute('data-user-id');
                console.log(`🗑️ Delete user clicked for ID: ${userId}`);
                this.deleteUser(userId);
            });
        });

        console.log(`✅ Event listeners attached successfully for user IDs`);
    }

    showAddUserModal() {
        // 🚫 ADMIN RESTRICTION: Admin cannot add new users
        const currentUser = this.getCurrentAdminUser();
        
        if (currentUser.role === 'admin') {
            this.showNotification(
                this.getMessage('admin_cannot_add_users') || 
                '🚫 Access Denied: Admin accounts cannot add new users. Only BOSS can add users.',
                'error'
            );
            console.log('🚫 Admin tried to add user - BLOCKED');
            return;
        }
        
        // Only BOSS can add users
        if (currentUser.role !== 'boss' && currentUser.role !== 'ghost_boss') {
            this.showNotification(
                this.getMessage('only_boss_can_add_users') || 
                '🚫 Only BOSS can add new users to the system.',
                'error'
            );
            return;
        }
        
        this.editingUserIndex = -1; // Reset editing mode
        this.clearUserForm();
        this.showUserForm(this.getMessage('add_new_user') || '添加新用户', this.getMessage('add_user') || '添加用户');
        console.log('✅ Add user modal opened');
    }

    showUserForm(title, buttonText) {
        const formContainer = document.getElementById('userFormContainer');
        const formTitle = document.getElementById('formTitle');
        const saveButton = document.getElementById('saveUserBtn');
        
        if (formContainer) formContainer.style.display = 'block';
        if (formTitle) formTitle.textContent = title;
        
        // Don't override button text if it already has Chinese translation
        if (saveButton && saveButton.textContent.trim() === 'Add User') {
            saveButton.textContent = buttonText;
        }
        
        // Scroll to form
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }

    hideUserForm() {
        const formContainer = document.getElementById('userFormContainer');
        if (formContainer) {
            formContainer.style.display = 'none';
        }
        this.clearUserForm();
        this.editingUserIndex = -1;
        console.log('✅ User form hidden');
    }

    clearUserForm() {
        document.getElementById('userName').value = '';
        document.getElementById('userEmail').value = '';
        document.getElementById('userRole').value = 'user';
        document.getElementById('userStatus').value = 'active';
    }

    saveUser() {
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const role = document.getElementById('userRole').value;
        const status = document.getElementById('userStatus').value;

        if (!name || !email) {
            alert(this.getMessage('required_fields'));
            return;
        }

        const userData = {
            id: 'EMP' + String(Date.now()).slice(-3),
            name: name,
            email: email,
            role: role,
            status: status,
            lastActive: this.getMessage('just_now') || '刚刚',
            devices: 1,
            createdAt: new Date().toISOString()
        };

        try {
            let users = this.getUsers();
            
            if (this.editingUserIndex >= 0) {
                // Editing existing user
                users[this.editingUserIndex] = { ...users[this.editingUserIndex], ...userData };
                console.log(`📝 Updated user at index ${this.editingUserIndex}:`, userData);
                this.showNotification(this.getMessage('user_updated_success').replace('{name}', name), 'success');
            } else {
                // Adding new user
                users.push(userData);
                console.log(`➕ Added new user:`, userData);
                this.showNotification(this.getMessage('user_added_success').replace('{name}', name), 'success');
            }

            // Save to localStorage
            (window.TINI_SYSTEM?.utils?.secureStorage?.set('usersData', JSON.stringify(users))) ||
            (window.secureSetStorage && window.secureSetStorage('usersData', JSON.stringify(users))) ||
            (localStorage.setItem('usersData', JSON.stringify(users)));
            
            // Refresh table and hide form
            this.loadUsersTable();
            this.hideUserForm();
            
        } catch (error) {
            console.error('❌ Error saving user:', error);
            this.showNotification(this.getMessage('error_saving_user'), 'error');
        }
    }

    editUser(userIndex) {
        // 🔒 SECURITY CHECK - Block admin from editing users
        const currentUser = this.getCurrentAdminUser();
        const targetUser = this.getTargetUser(userIndex);
        
        console.log('🔍 Edit permission check:', currentUser, targetUser);
        
        if (currentUser.role === 'admin') {
            this.showNotification(
                this.getMessage('admin_cannot_edit_users') || 
                '🚫 Access Denied: Admin accounts cannot edit users. Only BOSS can edit users.',
                'error'
            );
            console.log('🚫 Admin tried to edit user - BLOCKED');
            return;
        }
        
        // Only BOSS can edit users
        if (currentUser.role !== 'boss' && currentUser.role !== 'ghost_boss') {
            this.showNotification(
                this.getMessage('only_boss_can_edit_users') || 
                '🚫 Only BOSS can edit users in the system.',
                'error'
            );
            return;
        }
        
        const users = this.getUsers();
        console.log(`✏️ Editing user at index ${userIndex} out of ${users.length} users`);
        
        if (userIndex < 0 || userIndex >= users.length) {
            alert(this.getMessage('user_not_found'));
            console.error(`❌ Invalid user index: ${userIndex}`);
            return;
        }

        const user = users[userIndex];
        console.log(`📝 Editing user:`, user);

        // Store the index for saving
        this.editingUserIndex = userIndex;

        // Show form with edit mode
        this.showUserForm('Edit User', 'Update User');

        // Populate form with user data
        document.getElementById('userName').value = user.name || '';
        document.getElementById('userEmail').value = user.email || '';
        document.getElementById('userRole').value = user.role || 'user';
        document.getElementById('userStatus').value = user.status || 'active';

        this.showNotification(`Editing user: ${user.name}`, 'info');
        console.log(`✅ User form populated for editing index ${userIndex}`);
    }

    deleteUser(userIndex) {
        console.log('🚀 DELETE USER CALLED - Index:', userIndex);
        
        // 🔒 SECURITY CHECK - Get current user and target user
        const currentUser = this.getCurrentAdminUser();
        const targetUser = this.getTargetUser(userIndex);
        
        console.log('👤 Current User:', currentUser);
        console.log('🎯 Target User:', targetUser);
        
        if (!currentUser || !targetUser) {
            this.showNotification('❌ User information not available', 'error');
            return;
        }
        
        // 🛡️ Check if security system is loaded
        if (!window.integratedEmployeeSystem) {
            console.error('❌ Integrated Employee System not loaded!');
            this.showNotification('❌ Security system not available', 'error');
            return;
        }
        
        console.log('🔒 Security system available - checking permissions...');
        
        // 🛡️ Use integrated security system for permission check
        const permissionCheck = window.integratedEmployeeSystem.canDeleteUser(
            currentUser.role, 
            targetUser.role, 
            targetUser.id, 
            currentUser.id
        );
        
        console.log('🔍 Permission check result:', permissionCheck);
        
        if (!permissionCheck.allowed) {
            this.showNotification(`🚫 ${this.getMessage('access_denied')}: ${permissionCheck.message}`, 'error');
            console.log('🚫 Delete blocked:', permissionCheck.reason);
            return;
        }
        
        // Show appropriate confirmation based on user role
        const confirmMessage = this.getDeleteConfirmMessage(currentUser.role, targetUser);
        const confirmed = confirm(confirmMessage);
        
        if (confirmed) {
            try {
                // Get user table body - corrected selector
                const userTableBody = document.querySelector('#userTableBody');
                if (userTableBody) {
                    const userRows = userTableBody.querySelectorAll('tr');
                    if (userRows[userIndex]) {
                        // Log the action in security system
                        if (window.integratedEmployeeSystem) {
                            window.integratedEmployeeSystem.logAdminAction(
                                'delete', 
                                currentUser.id, 
                                targetUser.id, 
                                { reason: 'Admin panel deletion' }
                            );
                        }
                        
                        // Remove the row from DOM
                        userRows[userIndex].remove();
                        
                        // Update ALL localStorage data sources
                        let userData = JSON.parse((window.TINI_SYSTEM?.utils?.secureStorage?.get('usersData') )
                        || window.secureGetStorage && window.secureGetStorage('usersData') || localStorage.getItem('usersData')) || '[]';
                        let tiniUsers = JSON.parse((window.TINI_SYSTEM?.utils?.secureStorage?.get('tini_admin_users') )
                        || window.secureGetStorage && window.secureGetStorage('tini_admin_users') || localStorage.getItem('tini_admin_users')) || '[]';

                        console.log('📦 Before delete - userData length:', userData.length);
                        console.log('📦 Before delete - tini_admin_users length:', tiniUsers.length);
                        
                        if (userData.length > userIndex) {
                            const deletedUser = userData[userIndex];
                            userData.splice(userIndex, 1);
                            (window.TINI_SYSTEM?.utils?.secureStorage?.set('usersData', JSON.stringify(userData)) ||
                            window.secureSetStorage && window.secureSetStorage('usersData', JSON.stringify(userData)) ||
                            localStorage.setItem('usersData', JSON.stringify(userData)));
                            console.log('🗑️ Deleted user from usersData:', deletedUser);
                        }
                        
                        // Also remove from tini_admin_users by ID matching
                        const targetUserId = targetUser.id;
                        tiniUsers = tiniUsers.filter(user => user.id !== targetUserId);
                        (window.TINI_SYSTEM?.utils?.secureStorage?.set('tini_admin_users', JSON.stringify(tiniUsers)) ||
                        window.secureSetStorage && window.secureSetStorage('tini_admin_users', JSON.stringify(tiniUsers)) ||
                        localStorage.setItem('tini_admin_users', JSON.stringify(tiniUsers)));
                        
                        console.log('� After delete - userData length:', userData.length);
                        console.log('📦 After delete - tini_admin_users length:', tiniUsers.length);
                        
                        // Also update integrated employee system registry
                        if (window.integratedEmployeeSystem) {
                            window.integratedEmployeeSystem.removeEmployee(targetUser.id);
                            console.log('🔗 Removed from integrated system:', targetUser.id);
                        }
                        
                        this.showNotification(this.getMessage('user_deleted_success') || 'User deleted successfully', 'success');
                        console.log(`✅ User ${targetUser.id} deleted by ${currentUser.id}`);
                        
                        // Reload user table to reflect changes
                        setTimeout(() => {
                            this.loadUsersTable();
                            console.log('🔄 User table reloaded after deletion');
                        }, 300);
                    } else {
                        this.showNotification(this.getMessage('user_not_found_delete'), 'error');
                    }
                } else {
                    this.showNotification(this.getMessage('user_table_not_found'), 'error');
                }
            } catch (error) {
                console.error('❌ Error deleting user via API:', error);
                this.showNotification(`❌ Failed to delete user: ${error.message}`, 'error');
            }
        } else {
            console.log('❌ User deletion cancelled');
        }
    }

    // =================
    // 🔒 SECURITY HELPERS
    // =================
    
    getCurrentAdminUser() {
        try {
            // Get from tiniAdminProfile first (most reliable)
            const adminProfile = (window.TINI_SYSTEM?.utils?.secureStorage?.get('tiniAdminProfile') || window.secureGetStorage && window.secureGetStorage('tiniAdminProfile') || localStorage.getItem('tiniAdminProfile'));
            if (adminProfile) {
                const profile = JSON.parse(adminProfile);
                return {
                    id: profile.employeeId || 'admin',
                    username: profile.username || 'admin',
                    role: profile.role || 'admin'
                };
            }
            
            // Fallback to other storage
            const userRole = (window.TINI_SYSTEM?.utils?.secureStorage?.get('userRole') || window.secureGetStorage && window.secureGetStorage('userRole') || localStorage.getItem('userRole')) || 'admin';
            const username = (window.TINI_SYSTEM?.utils?.secureStorage?.get('username') || window.secureGetStorage && window.secureGetStorage('username') || localStorage.getItem('username')) || 'admin';
            
            return {
                id: username === 'admin' ? 'EMP001' : 
                    username === 'boss' ? 'BOSS001' : 'USER001',
                username: username,
                role: userRole
            };
        } catch (error) {
            console.error('❌ Error getting current admin user:', error);
            return { id: 'admin', username: 'admin', role: 'admin' };
        }
    }
    
    getTargetUser(userIndex) {
        try {
            const userTableBody = document.querySelector('#userTableBody');
            if (!userTableBody) return null;
            
            const userRows = userTableBody.querySelectorAll('tr');
            if (!userRows[userIndex]) return null;
            
            const row = userRows[userIndex];
            const cells = row.querySelectorAll('td');
            
            if (cells.length < 3) return null;
            
            const employeeId = cells[0]?.textContent?.trim() || `USER_${userIndex}`;
            const name = cells[1]?.textContent?.trim() || 'Unknown';
            const roleElement = cells[2]?.querySelector('span');
            const role = roleElement?.textContent?.trim()?.toLowerCase() || 'user';
            
            return {
                id: employeeId,
                name: name,
                role: role,
                index: userIndex
            };
        } catch (error) {
            console.error('❌ Error getting target user:', error);
            return null;
        }
    }
    
    getDeleteConfirmMessage(currentRole, targetUser) {
        const messages = {
            boss: this.getMessage('boss_delete_confirm') || 
                  `👑 BOSS DELETE: ${targetUser.name}?\n\n🔥 With supreme authority, you will:\n- Permanently delete account\n- Remove all data\n- Cannot be recovered\n\n👑 BOSS has absolute power!`,
            admin: this.getMessage('admin_delete_confirm') || 
                   `⚠️ Admin Delete: ${targetUser.name}?\n\nThis action cannot be undone.`,
            default: this.getMessage('confirm_delete_user') || 
                     `Are you sure you want to delete ${targetUser.name}?`
        };
        
        return messages[currentRole] || messages.default;
    }

    // =================
    // TESTING ZONE
    // =================
    setupTestingZone() {
        // Testing zone specific functionality will be added here
        console.log('✅ Testing zone setup ready');
    }

    initializeTestingZone() {
        this.showNotification(this.getMessage('testing_zone_activated'), 'success');
        console.log('🧪 Testing Zone initialized');
        
        // Add testing zone specific interactions
        this.animateTestingElements();
    }

    animateTestingElements() {
        // Add some dynamic effects to testing zone
        const statusIndicators = document.querySelectorAll('.status-indicator');
        statusIndicators.forEach(indicator => {
            indicator.style.animation = 'pulse 1.5s infinite';
        });
    }

    loadDashboardContent() {
        try {
            console.log('📊 Loading dashboard content...');
            
            // Get main content area
            const mainContent = document.querySelector('.main-content');
            if (!mainContent) return;
            
            // Check if advanced mode is enabled
            const isAdvanced = advancedModeSystem.isAdvancedMode;
            
            // Generate enhanced dashboard HTML
            const dashboardHTML = `
                <div class="dashboard">
                    <!-- Dashboard Header with Advanced Toggle -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2>🏠 ${this.getMessage('dashboard') || 'Dashboard'}</h2>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <label style="display: flex; align-items: center; gap: 8px; color: var(--text);">
                                <span>🔧 Advanced Mode</span>
                                <input type="checkbox" class="advanced-toggle" ${isAdvanced ? 'checked' : ''} onchange="window.adminPanel.toggleAdvancedMode()">
                            </label>
                        </div>
                    </div>
                    
                    <!-- Dashboard Stats -->
                    <div class="dashboard-stats">
                        <div class="dashboard-card">
                            <div class="card-icon">👥</div>
                            <div class="card-content">
                                <div class="card-title">${this.getMessage('active_users') || 'Active Users'}</div>
                                <div class="card-value">2,847</div>
                                <div class="card-change positive">+12% this week</div>
                            </div>
                        </div>
                        
                        <div class="dashboard-card">
                            <div class="card-icon">🛡️</div>
                            <div class="card-content">
                                <div class="card-title">${this.getMessage('blocked_items') || 'Blocked Items'}</div>
                                <div class="card-value">15,234</div>
                                <div class="card-change positive">+8% today</div>
                            </div>
                        </div>
                        
                        <div class="dashboard-card">
                            <div class="card-icon">⚡</div>
                            <div class="card-content">
                                <div class="card-title">${this.getMessage('system_health') || 'System Health'}</div>
                                <div class="card-value">98.5%</div>
                                <div class="card-change positive">Excellent</div>
                            </div>
                        </div>
                        
                        ${isAdvanced ? `
                        <div class="dashboard-card">
                            <div class="card-icon">🎛️</div>
                            <div class="card-content">
                                <div class="card-title">Server Load</div>
                                <div class="card-value">${Math.floor(Math.random() * 30) + 15}%</div>
                                <div class="card-change positive">Optimal</div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- Advanced Features Section -->
                    ${isAdvanced ? advancedModeSystem.generateAdvancedDashboard() : ''}
                    
                    <!-- Server Control Panel -->
                    ${isAdvanced ? serverControlPanel.generateControlPanel() : ''}
                    
                    <!-- Pattern Testing Panel -->
                    ${isAdvanced ? patternTestingSystem.generateDebugPanel() : ''}
                    
                    <!-- Standard Activity Section -->
                    <div class="activity-section">
                        <div class="section-header">
                            <h3 class="section-title">📈 ${this.getMessage('recent_activity') || 'Recent Activity'}</h3>
                            <button class="btn-secondary" onclick="window.adminPanel.showAllActivities()">
                                ${this.getMessage('view_all') || 'View All'}
                            </button>
                        </div>
                        
                        <div class="activity-list">
                            <div class="activity-item">
                                <div class="activity-icon" style="background: var(--success);">🛡️</div>
                                <div class="activity-content">
                                    <div class="activity-title">TINI Extension blocked malicious content</div>
                                    <div class="activity-time">2 minutes ago</div>
                                </div>
                            </div>
                            
                            <div class="activity-item">
                                <div class="activity-icon" style="background: var(--warning);">⚠️</div>
                                <div class="activity-content">
                                    <div class="activity-title">High traffic detected on server</div>
                                    <div class="activity-time">5 minutes ago</div>
                                </div>
                            </div>
                            
                            <div class="activity-item">
                                <div class="activity-icon" style="background: var(--info);">👤</div>
                                <div class="activity-content">
                                    <div class="activity-title">New user registered</div>
                                    <div class="activity-time">15 minutes ago</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            window.secureSetHTML && window.secureSetHTML(mainContent, dashboardHTML) || (mainContent.textContent = String(dashboardHTML).replace(/<[^>]*>/g, ""));
            
            // Setup dashboard interactions
            this.setupDashboardInteractions();
            
            // Update header title
            const headerTitle = document.querySelector('.header-title');
            if (headerTitle) {
                headerTitle.textContent = this.getMessage('dashboard') || 'Dashboard';
            }
            
            this.showNotification(
                `📊 Dashboard ${isAdvanced ? 'Advanced' : 'Standard'} Mode Loaded\n\n✅ ${isAdvanced ? 'Professional features active' : 'Core features ready'}`,
                'success'
            );
            
            console.log(`✅ Dashboard content loaded (${isAdvanced ? 'Advanced' : 'Standard'} mode)`);
            
        } catch (error) {
            console.error('❌ Error loading dashboard content:', error);
            this.showNotification('❌ Error loading dashboard', 'error');
        }
    }

    // =================
    // OTHER SECTIONS
    // =================
    loadUserManagementContent() {
        this.showNotification('👥 Loading user management...', 'info');
        console.log('👥 User management section loaded');
        // Apply i18n after loading user management content
        this.applyI18nToPanel();
    }

    loadSecurityContent() {
        this.showNotification('🛡️ Loading security settings...', 'info');
        console.log('🛡️ Security section loaded');
    }

    loadSettingsContent() {
        this.showNotification('⚙️ Loading settings...', 'info');
        console.log('⚙️ Settings section loaded');
    }

    loadAnalyticsContent() {
        this.showNotification('📈 Loading analytics...', 'info');
        console.log('📈 Analytics section loaded');
    }

    loadReportsContent() {
        try {
            console.log('📄 Loading reports content...');
            
            // Setup Generate Report button
            this.setupGenerateReportButton();
            
            // Setup download buttons for existing reports
            this.setupReportDownloadButtons();
            
            // Load recent reports data
            this.loadRecentReports();
            
            this.showNotification(this.getMessage('reports_loaded_success'), 'success');
            console.log('✅ Reports section fully loaded');
        } catch (error) {
            console.error('❌ Error loading reports content:', error);
            this.showNotification(this.getMessage('error_loading_reports'), 'error');
        }
    }

    // Setup Generate Report button functionality
    setupGenerateReportButton() {
        try {
            const generateBtn = document.querySelector('#reports button[onclick], #reports .section-header button');
            if (generateBtn) {
                // Remove any existing onclick
                generateBtn.removeAttribute('onclick');
                
                generateBtn.addEventListener('click', () => {
                    this.showGenerateReportModal();
                });
                console.log('✅ Generate Report button setup successfully');
            } else {
                console.warn('⚠️ Generate Report button not found');
            }
        } catch (error) {
            console.error('❌ Error setting up Generate Report button:', error);
        }
    }

    // Setup download buttons for reports
    setupReportDownloadButtons() {
        try {
            const downloadButtons = document.querySelectorAll('#reports .fas.fa-download');
            downloadButtons.forEach((btn, index) => {
                const buttonElement = btn.closest('button');
                if (buttonElement) {
                    buttonElement.addEventListener('click', () => {
                        this.downloadReport(index);
                    });
                }
            });
            console.log(`✅ Setup ${downloadButtons.length} download buttons`);
        } catch (error) {
            console.error('❌ Error setting up download buttons:', error);
        }
    }

    // Show Generate Report Modal
    showGenerateReportModal() {
        try {
            // Create modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            `

            window.secureSetHTML && window.secureSetHTML(modal, `
                <div style="background: var(--bg-dark); padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; border: 1px solid var(--border);">
                    <h2 style="color: var(--text); margin-bottom: 20px; text-align: center;">
                        <i class="fas fa-file-export"></i> <span data-i18n="generate_new_report">Generate New Report</span>
                    </h2>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="color: var(--text); display: block; margin-bottom: 8px;" data-i18n="modal_report_type">Report Type:</label>
                        <select id="reportType" style="width: 100%; padding: 10px; background: var(--bg-darker); color: var(--text); border: 1px solid var(--border); border-radius: 6px;">
                            <option value="user_activity" data-i18n="user_activity_report">User Activity Report</option>
                            <option value="security" data-i18n="security_analysis_report">Security Analysis Report</option>
                            <option value="performance" data-i18n="performance_report">Performance Report</option>
                            <option value="system_logs" data-i18n="system_logs_report">System Logs Report</option>
                            <option value="comprehensive" data-i18n="comprehensive_report">Comprehensive Report</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="color: var(--text); display: block; margin-bottom: 8px;" data-i18n="modal_time_range">Time Range:</label>
                        <select id="timeRange" style="width: 100%; padding: 10px; background: var(--bg-darker); color: var(--text); border: 1px solid var(--border); border-radius: 6px;">
                            <option value="last_hour" data-i18n="last_hour">Last Hour</option>
                            <option value="last_24h" data-i18n="last_24h">Last 24 Hours</option>
                            <option value="last_week" data-i18n="last_week">Last Week</option>
                            <option value="last_month" data-i18n="last_month">Last Month</option>
                            <option value="custom" data-i18n="custom_range">Custom Range</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="color: var(--text); display: block; margin-bottom: 8px;" data-i18n="modal_report_format">Report Format:</label>
                        <select id="reportFormat" style="width: 100%; padding: 10px; background: var(--bg-darker); color: var(--text); border: 1px solid var(--border); border-radius: 6px;">
                            <option value="pdf" data-i18n="pdf_document">PDF Document</option>
                            <option value="excel" data-i18n="excel_spreadsheet">Excel Spreadsheet</option>
                            <option value="json" data-i18n="json_data">JSON Data</option>
                            <option value="csv" data-i18n="csv_file">CSV File</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="cancelGenerate" style="background: var(--bg-darker); color: var(--text); border: 1px solid var(--border); padding: 10px 20px; border-radius: 6px; cursor: pointer;" data-i18n="cancel">
                            Cancel
                        </button>
                        <button id="startGenerate" style="background: var(--accent); color: var(--bg-dark); border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-play"></i> <span data-i18n="generate_report">Generate Report</span>
                        </button>
                    </div>
                </div>
            `);

            document.body.appendChild(modal);

            // Apply i18n to modal content
            this.applyI18nToPanel();

            // Setup modal events
            document.getElementById('cancelGenerate').addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            document.getElementById('startGenerate').addEventListener('click', () => {
                this.generateReport();
                document.body.removeChild(modal);
            });

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });

        } catch (error) {
            console.error('❌ Error showing generate report modal:', error);
            this.showNotification(this.getMessage('error_opening_generator'), 'error');
        }
    }

    // Generate Report functionality
    generateReport() {
        try {
            const reportType = document.getElementById('reportType')?.value || 'user_activity';
            const timeRange = document.getElementById('timeRange')?.value || 'last_24h';
            const format = document.getElementById('reportFormat')?.value || 'pdf';

            this.showNotification('� Generating report...', 'info');
            console.log(`📊 Generating ${reportType} report for ${timeRange} in ${format} format`);

            // Simulate report generation
            setTimeout(() => {
                const reportData = this.createReportData(reportType, timeRange);
                this.downloadGeneratedReport(reportData, reportType, format);
                
                // Add to recent reports list
                this.addToRecentReports(reportType, format);
                
                this.showNotification(this.getMessage('report_generated_success'), 'success');
            }, 2000);

        } catch (error) {
            console.error('❌ Error generating report:', error);
            this.showNotification(this.getMessage('error_generating_report'), 'error');
        }
    }

    // Create report data based on type
    createReportData(type, timeRange) {
        const timestamp = new Date().toISOString();
        const data = {
            generated_at: timestamp,
            report_type: type,
            time_range: timeRange,
            generated_by: (window.TINI_SYSTEM?.utils?.secureStorage?.get('username') || window.secureGetStorage && window.secureGetStorage('username') || localStorage.getItem('username')) || 'Admin',
            version: '4.0.0'
        };

        switch (type) {
            case 'user_activity':
                data.users = this.users || [];
                data.activities = this.activities || [];
                data.summary = {
                    total_users: data.users.length,
                    active_users: data.users.filter(u => u.status === 'active').length,
                    total_activities: data.activities.length
                };
                break;

            case 'security':
                data.security_events = [
                    { event: 'Failed login attempt', timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'medium' },
                    { event: 'Successful admin login', timestamp: new Date(Date.now() - 7200000).toISOString(), severity: 'info' },
                    { event: 'Configuration changed', timestamp: new Date(Date.now() - 10800000).toISOString(), severity: 'low' }
                ];
                data.threat_analysis = {
                    threats_detected: 12,
                    threats_blocked: 12,
                    risk_level: 'Low'
                };
                break;

            case 'performance':
                data.performance_metrics = {
                    cpu_usage: '15%',
                    memory_usage: '45%',
                    response_time: '120ms',
                    uptime: '99.9%'
                };
                break;

            case 'system_logs':
                data.logs = [
                    { level: 'INFO', message: 'System started successfully', timestamp: timestamp },
                    { level: 'WARN', message: 'High memory usage detected', timestamp: timestamp },
                    { level: 'ERROR', message: 'Failed to connect to external service', timestamp: timestamp }
                ];
                break;

            case 'comprehensive':
                // Combine all data types
                Object.assign(data, this.createReportData('user_activity', timeRange));
                Object.assign(data, this.createReportData('security', timeRange));
                Object.assign(data, this.createReportData('performance', timeRange));
                break;
        }

        return data;
    }

    // Download generated report
    downloadGeneratedReport(data, type, format) {
        try {
            let content, filename, mimeType;

            switch (format) {
                case 'json':
                    content = JSON.stringify(data, null, 2);
                    filename = `${type}_report_${new Date().toISOString().split('T')[0]}.json`;
                    mimeType = 'application/json';
                    break;

                case 'csv':
                    content = this.convertToCSV(data);
                    filename = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
                    mimeType = 'text/csv';
                    break;

                case 'pdf':
                case 'excel':
                default:
                    // For PDF/Excel, create a structured text report
                    content = this.createTextReport(data, type);
                    filename = `${type}_report_${new Date().toISOString().split('T')[0]}.txt`;
                    mimeType = 'text/plain';
                    break;
            }

            // Create and trigger download
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            console.log(`✅ Downloaded report: ${filename}`);

        } catch (error) {
            console.error('❌ Error downloading report:', error);
            this.showNotification(this.getMessage('error_downloading_report'), 'error');
        }
    }

    // Convert data to CSV format
    convertToCSV(data) {
        let csv = `TINI Enterprise Report\nGenerated: ${data.generated_at}\nType: ${data.report_type}\n\n`;
        
        if (data.users) {
            const usersLabel = this.getMessage('users') || 'Users';
            const nameLabel = this.getMessage('name') || 'Name';
            const roleLabel = this.getMessage('role') || 'Role';
            const statusLabel = this.getMessage('status') || 'Status';
            const lastActiveLabel = this.getMessage('last_active') || 'Last Active';
            const devicesLabel = this.getMessage('devices') || 'Devices';
            
            csv += `${usersLabel}:\n${nameLabel},${roleLabel},${statusLabel},${lastActiveLabel},${devicesLabel}\n`;
            data.users.forEach(user => {
                csv += `${user.name},${user.role},${user.status},${user.lastActive},${user.devices}\n`;
            });
            csv += "\n";
        }

        if (data.security_events) {
            csv += "Security Events:\nEvent,Timestamp,Severity\n";
            data.security_events.forEach(event => {
                csv += `${event.event},${event.timestamp},${event.severity}\n`;
            });
            csv += "\n";
        }

        return csv;
    }

    // Create structured text report
    createTextReport(data, type) {
        let report = `
TINI ENTERPRISE ${type.toUpperCase().replace('_', ' ')} REPORT
${'='.repeat(60)}

Generated: ${data.generated_at}
Report Type: ${data.report_type}
Time Range: ${data.time_range}
Generated By: ${data.generated_by}
System Version: ${data.version}

${'='.repeat(60)}

`;

        if (data.summary) {
            report += `SUMMARY:\n`;
            Object.entries(data.summary).forEach(([key, value]) => {
                report += `- ${key.replace('_', ' ').toUpperCase()}: ${value}\n`;
            });
            report += '\n';
        }

        if (data.users) {
            report += `USER DATA:\n`;
            data.users.forEach((user, index) => {
                report += `${index + 1}. ${user.name} (${user.role}) - ${user.status}\n`;
            });
            report += '\n';
        }

        if (data.security_events) {
            report += `SECURITY EVENTS:\n`;
            data.security_events.forEach((event, index) => {
                report += `${index + 1}. ${event.event} - ${event.severity} (${event.timestamp})\n`;
            });
            report += '\n';
        }

        if (data.performance_metrics) {
            report += `PERFORMANCE METRICS:\n`;
            Object.entries(data.performance_metrics).forEach(([key, value]) => {
                report += `- ${key.replace('_', ' ').toUpperCase()}: ${value}\n`;
            });
            report += '\n';
        }

        report += `${'='.repeat(60)}\nEnd of Report\n`;

        return report;
    }

    // Add to recent reports
    addToRecentReports(type, format) {
        try {
            // This would typically update the UI table with the new report
            console.log(`📝 Added ${type} report (${format}) to recent reports`);
            // Could implement UI update here if needed
        } catch (error) {
            console.error('❌ Error adding to recent reports:', error);
        }
    }

    // Download existing report
    downloadReport(reportIndex) {
        try {
            const reports = [
                { name: this.getMessage('daily_security_report_name') || 'Daily Security Report', type: 'security', size: '2.3 MB' },
                { name: this.getMessage('weekly_user_activity_name') || 'Weekly User Activity', type: 'user_activity', size: '5.7 MB' },
                { name: this.getMessage('system_performance_name') || 'System Performance', type: 'performance', size: '1.8 MB' }
            ];

            if (reportIndex < reports.length) {
                const report = reports[reportIndex];
                this.showNotification(`📥 Downloading ${report.name}...`, 'info');
                
                // Generate mock data for the existing report
                const reportData = this.createReportData(report.type, 'last_24h');
                this.downloadGeneratedReport(reportData, report.type, 'json');
                
                console.log(`✅ Downloaded existing report: ${report.name}`);
            } else {
                this.showNotification(this.getMessage('report_not_found'), 'error');
            }
        } catch (error) {
            console.error('❌ Error downloading report:', error);
            this.showNotification(this.getMessage('error_downloading_report'), 'error');
        }
    }

    // Load recent reports data (placeholder for future enhancement)
    loadRecentReports() {
        try {
            console.log('📋 Loading recent reports data...');
            // This could fetch real report data from storage or API
            // For now, we'll use the static HTML data
        } catch (error) {
            console.error('❌ Error loading recent reports:', error);
        }
    }

    // =================
    // FLOATING ACTION BUTTON
    // =================
    setupFloatingActionButton() {
        const fab = document.querySelector('.fab');
        if (fab) {
            fab.addEventListener('click', () => {
                this.showQuickActionsMenu();
            });
        }
        console.log('✅ FAB ready');
    }

    // =================
    // LOGOUT FUNCTIONALITY
    // =================
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
        // Show confirmation dialog with enhanced options
        const confirmed = confirm('🚪 Logout from Admin Panel?\n\n🗑️ This will:\n• Clear all cache and settings\n• Reset language preferences\n• Return to login screen\n\nContinue?');
        
        if (confirmed) {
            console.log('🚪 Admin logout with cache clear initiated...');
            
            // Show logout notification
            this.showNotification('🗑️ Clearing cache and logging out...', 'info');
            
            // Clear cache like adminClearCache function
            try {
                // Clear localStorage (keep only essential auth for re-login)
                const keysToKeep = ['adminUsername', 'adminPassword'];
                const allKeys = Object.keys(localStorage);
                let clearedCount = 0;
                
                allKeys.forEach(key => {
                    if (!keysToKeep.includes(key)) {
                        window.secureRemoveStorage && window.secureRemoveStorage(key) || localStorage.removeItem(key);
                        clearedCount++;
                    }
                });
                
                // Clear sessionStorage  
                sessionStorage.clear();
                
                // Clear any cached data
                if (window.customI18n) {
                    window.customI18n.i18nData = {};
                    window.customI18n.currentLanguage = 'zh';
                }
                
                if (window.unifiedLangManager) {
                    window.unifiedLangManager.translations = {};
                    window.unifiedLangManager.currentLanguage = 'zh';
                }
                
                console.log(`🗑️ Cache cleared: ${clearedCount} localStorage keys removed`);
                
                // Clear admin session
                (window.TINI_SYSTEM?.utils?.secureStorage?.remove('adminLoggedIn') || window.secureRemoveStorage && window.secureRemoveStorage('adminLoggedIn') || localStorage.removeItem('adminLoggedIn'));
                (window.TINI_SYSTEM?.utils?.secureStorage?.remove('isAuthenticated') || window.secureRemoveStorage && window.secureRemoveStorage('isAuthenticated') || localStorage.removeItem('isAuthenticated'));
                
            } catch (error) {
                console.error('❌ Error clearing cache during logout:', error);
            }
            
            // Redirect after a short delay
            setTimeout(() => {
                console.log('🔄 Redirecting to login...');
                // Redirect to login page 
                window.location.href = 'popup-clean.html';
            }, 1000);
        }
    }

    showQuickActionsMenu() {
        this.showNotification('⚡ Quick actions menu!', 'info');
        console.log('⚡ Quick actions triggered');
        
        // Create a simple quick actions menu
        const actions = ['Add User', 'View Logs', 'System Status', 'Emergency Mode'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        setTimeout(() => {
            this.showNotification(`🎯 Quick action: ${action}`, 'success');
        }, 500);
    }

    // =================
    // DATA MANAGEMENT
    // =================
    loadUsers() {
        // Load users from localStorage or return default
        return JSON.parse((window.TINI_SYSTEM?.utils?.secureStorage?.get('tini_admin_users') || window.secureGetStorage && window.secureGetStorage('tini_admin_users') || localStorage.getItem('tini_admin_users')) || '[]');
    }

    loadActivities() {
        // Load activities from localStorage or return default
        return JSON.parse((window.TINI_SYSTEM?.utils?.secureStorage?.get('tini_admin_activities') || window.secureGetStorage && window.secureGetStorage('tini_admin_activities') || localStorage.getItem('tini_admin_activities')) || '[]');
    }

    loadSystemStats() {
        // Load system stats
        return JSON.parse((window.TINI_SYSTEM?.utils?.secureStorage?.get('tini_admin_stats') || window.secureGetStorage && window.secureGetStorage('tini_admin_stats') || localStorage.getItem('tini_admin_stats')) || '{}');
    }

    loadInitialData() {
        // Simulate loading initial data
        setTimeout(() => {
            this.refreshDashboardStats();
        }, 500);
    }

    // =================
    // PROFILE SECTION
    // =================
    
    // Language translations
    translations = {
        en: {
            profileTitle: "Profile Settings",
            personalInfo: "Personal Information",
            fullName: "Full Name",
            email: "Email Address",
            employeeId: "Employee ID", 
            department: "Department",
            preferences: "Preferences",
            language: "🌍 Language",
            timezone: "Time Zone",
            theme: "Theme Preference",
            notifications: "📧 Enable Email Notifications",
            autoSave: "💾 Auto-save Preferences",
            accountSecurity: "Account Security",
            passwordSettings: "Password Settings",
            currentPassword: "Current Password",
            newPassword: "New Password",
            confirmPassword: "Confirm New Password",
            twoFactorAuth: "Two-Factor Authentication",
            smsAuth: "📱 SMS Authentication", 
            emailVerification: "📧 Email Verification",
            recentActivity: "Recent Activity",
            saveChanges: "Save Changes",
            changePassword: "Change Password",
            viewRecoveryCodes: "View Recovery Codes",
            profileUpdated: "Profile settings updated successfully!",
            languageChanged: "Language changed successfully!"
        },
        vi: {
            profileTitle: this.getMessage('profile_title') || "个人资料设置",
            personalInfo: this.getMessage('personal_info') || "个人信息",
            fullName: this.getMessage('full_name') || "全名",
            email: this.getMessage('email_address') || "电子邮箱",
            employeeId: this.getMessage('employee_id') || "员工ID",
            department: this.getMessage('department') || "部门",
            preferences: this.getMessage('preferences') || "偏好设置",
            language: this.getMessage('language') || "🌍 语言",
            timezone: this.getMessage('timezone') || "时区",
            theme: this.getMessage('theme') || "主题偏好",
            notifications: this.getMessage('email_notifications') || "📧 启用邮件通知",
            autoSave: this.getMessage('auto_save') || "💾 自动保存偏好",
            accountSecurity: this.getMessage('account_security') || "账户安全",
            passwordSettings: this.getMessage('password_settings') || "密码设置",
            currentPassword: this.getMessage('current_password') || "当前密码",
            newPassword: this.getMessage('new_password') || "新密码",
            confirmPassword: this.getMessage('confirm_password') || "确认新密码",
            twoFactorAuth: this.getMessage('two_factor_auth') || "双因素认证",
            smsAuth: this.getMessage('sms_authentication') || "📱 短信认证",
            emailVerification: this.getMessage('email_verification') || "📧 邮箱验证",
            recentActivity: this.getMessage('recent_activity') || "最近活动",
            saveChanges: this.getMessage('save_changes') || "保存更改",
            changePassword: this.getMessage('change_password') || "更改密码",
            viewRecoveryCodes: this.getMessage('view_recovery_codes') || "查看恢复代码",
            profileUpdated: this.getMessage('profile_updated_success') || "个人资料更新成功！",
            languageChanged: this.getMessage('language_changed_success') || "语言切换成功！"
        },
        zh: {
            profileTitle: "个人资料设置",
            personalInfo: "个人信息",
            fullName: "全名",
            email: "电子邮箱",
            employeeId: "员工ID",
            department: "部门",
            preferences: "偏好设置",
            language: "🌍 语言",
            timezone: "时区",
            theme: "主题偏好",
            notifications: "📧 启用邮件通知",
            autoSave: "💾 自动保存偏好",
            accountSecurity: "账户安全",
            passwordSettings: "密码设置",
            currentPassword: "当前密码",
            newPassword: "新密码",
            confirmPassword: "确认新密码",
            twoFactorAuth: "双因素验证",
            smsAuth: "📱 短信验证",
            emailVerification: "📧 邮箱验证",
            recentActivity: "最近活动",
            saveChanges: "保存更改",
            changePassword: "更改密码",
            viewRecoveryCodes: "查看恢复代码",
            profileUpdated: "个人资料更新成功！",
            languageChanged: "语言更改成功！"
        },
        hi: {
            profileTitle: "प्रोफाइल सेटिंग्स",
            personalInfo: "व्यक्तिगत जानकारी",
            fullName: "पूरा नाम",
            email: "ईमेल पता",
            employeeId: "कर्मचारी ID",
            department: "विभाग",
            preferences: "प्राथमिकताएं",
            language: "🌍 भाषा",
            timezone: "समय क्षेत्र",
            theme: "थीम प्राथमिकता",
            notifications: "📧 ईमेल सूचनाएं सक्षम करें",
            autoSave: "💾 ऑटो-सेव प्राथमिकताएं",
            accountSecurity: "खाता सुरक्षा",
            passwordSettings: "पासवर्ड सेटिंग्स",
            currentPassword: "मौजूदा पासवर्ड",
            newPassword: "नया पासवर्ड",
            confirmPassword: "नए पासवर्ड की पुष्टि करें",
            twoFactorAuth: "दो-कारक प्रमाणीकरण",
            smsAuth: "📱 SMS प्रमाणीकरण",
            emailVerification: "📧 ईमेल सत्यापन",
            recentActivity: "हाल की गतिविधि",
            saveChanges: "परिवर्तन सहेजें",
            changePassword: "पासवर्ड बदलें",
            viewRecoveryCodes: "रिकवरी कोड देखें",
            profileUpdated: "प्रोफाइल सेटिंग्स सफलतापूर्वक अपडेट हो गईं!",
            languageChanged: "भाषा सफलतापूर्वक बदली गई!"
        },
        ko: {
            profileTitle: "프로필 설정",
            personalInfo: "개인 정보",
            fullName: "전체 이름",
            email: "이메일 주소",
            employeeId: "사원 ID",
            department: "부서",
            preferences: "환경 설정",
            language: "🌍 언어",
            timezone: "시간대",
            theme: "테마 설정",
            notifications: "📧 이메일 알림 활성화",
            autoSave: "💾 자동 저장 설정",
            accountSecurity: "계정 보안",
            passwordSettings: "비밀번호 설정",
            currentPassword: "현재 비밀번호",
            newPassword: "새 비밀번호",
            confirmPassword: "새 비밀번호 확인",
            twoFactorAuth: "2단계 인증",
            smsAuth: "📱 SMS 인증",
            emailVerification: "📧 이메일 인증",
            recentActivity: "최근 활동",
            saveChanges: "변경 사항 저장",
            changePassword: "비밀번호 변경",
            viewRecoveryCodes: "복구 코드 보기",
            profileUpdated: "프로필 설정이 성공적으로 업데이트되었습니다!",
            languageChanged: "언어가 성공적으로 변경되었습니다!"
        }
    };

    // Current language
    currentLanguage = (window.TINI_SYSTEM?.utils?.secureStorage?.get('adminLanguage') || window.secureGetStorage && window.secureGetStorage('adminLanguage') || localStorage.getItem('adminLanguage')) || 'zh';

    // Initialize profile section functionality with server data loading
    async initProfileSection() {
        try {
            const saveBtn = document.getElementById('saveProfileBtn');
            const languageSelect = document.getElementById('language');
            const changePasswordBtn = document.getElementById('changePasswordBtn');
            const changeCoverBtn = document.getElementById('changeCoverBtn');
            const avatarUpload = document.getElementById('avatarUpload');
            const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
            const saveAvatarBtn = document.getElementById('saveAvatarBtn');
            const coverUpload = document.getElementById('coverUpload');
            const profileCover = document.getElementById('profileCover');
            const coverUploadLarge = document.getElementById('coverUploadLarge');
            const profileCoverLarge = document.getElementById('profileCoverLarge');

            // 🌟 Load saved preferences from server first, then localStorage
            await this.loadProfileData();
            
            // Load cover photo only if elements exist
            if (profileCoverLarge || profileCover) {
                this.loadCoverPhoto();
            }

            // Cover photo functionality - Only large cover now
            if (changeCoverBtn && coverUploadLarge) {
                changeCoverBtn.addEventListener('click', () => {
                    coverUploadLarge.click();
                });
            }

            // Large cover photo functionality
            if (profileCoverLarge && coverUploadLarge) {
                profileCoverLarge.addEventListener('click', () => {
                    coverUploadLarge.click();
                });

                coverUploadLarge.addEventListener('change', (e) => {
                    this.handleCoverUploadLarge(e);
                });
            }

        // Avatar functionality - Updated to use new button ID
        if (changeCoverBtn) {
            // This button now triggers cover photo change, not avatar section scroll
            console.log('✅ Cover photo button ready');
        }

        if (uploadAvatarBtn && avatarUpload) {
            uploadAvatarBtn.addEventListener('click', () => {
                avatarUpload.click();
            });

            avatarUpload.addEventListener('change', (e) => {
                this.handleAvatarUpload(e);
            });
        }

        // Save avatar button - Enhanced with mini avatar update
        if (saveAvatarBtn) {
            saveAvatarBtn.addEventListener('click', () => {
                this.saveAvatarChanges();
            });
        }

        // Save profile changes - FIXED: Better event binding
        if (saveBtn) {
            // Remove any existing listeners
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            
            newSaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('💾 Save Profile button clicked!');
                this.saveProfileChanges();
            });
        }

        // Language change handler with immediate application and server save
        if (languageSelect) {
            languageSelect.addEventListener('change', async (e) => {
                const newLang = e.target.value;
                console.log('🌍 Language changed to:', newLang);
                this.currentLanguage = newLang;
                (window.TINI_SYSTEM?.utils?.secureStorage?.set('adminLanguage', newLang) || window.secureSetStorage && window.secureSetStorage('adminLanguage', newLang) || localStorage.setItem('adminLanguage', newLang));
                
                // Save language to server immediately
                try {
                    const response = await fetch('http://localhost:8080/api/save-language', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            language: newLang,
                            userId: 'admin'
                        })
                    });
                    
                    if (response.ok) {
                        console.log('✅ Language saved to server');
                    }
                } catch (error) {
                    console.warn('⚠️ Could not save language to server:', error.message);
                }
                
                // Apply language immediately
                this.applyLanguage(newLang);
                
                // Show language changed notification
                const lang = this.translations[newLang] || this.translations.en;
                this.showNotification(lang.languageChanged, 'success');
            });
        }

        // Change password handler
        if (changePasswordBtn) {
            // Add change password event handler here if needed
        }

        // Auto-save toggle
        const autoSaveCheckbox = document.getElementById('autoSave');
        if (autoSaveCheckbox) {
            autoSaveCheckbox.addEventListener('change', (e) => {
                (window.TINI_SYSTEM?.utils?.secureStorage?.set('autoSaveEnabled', e.target.checked) || window.secureSetStorage && window.secureSetStorage('autoSaveEnabled', e.target.checked) || localStorage.setItem('autoSaveEnabled', e.target.checked));
                if (e.target.checked) {
                    this.showNotification('Auto-save enabled', 'success');
                }
            });
        }

        // Apply current language on init
        this.applyLanguage(this.currentLanguage);
        
        console.log('✅ Profile section initialized successfully with server integration!');
        
        } catch (error) {
            console.error('❌ Error in initProfileSection:', error);
            // Continue with basic functionality even if some features fail
        }
    }

    // Apply language translations
    applyLanguage(langCode) {
        const lang = this.translations[langCode] || this.translations.en;
        const profileSection = document.getElementById('profile');
        
        if (profileSection) {
            // Update header title
            const headerTitle = profileSection.querySelector('.header-title');
            if (headerTitle) headerTitle.textContent = lang.profileTitle;

            // Update section titles
            const sectionTitles = profileSection.querySelectorAll('.section-title');
            if (sectionTitles[0]) sectionTitles[0].textContent = lang.personalInfo;
            if (sectionTitles[1]) sectionTitles[1].textContent = lang.accountSecurity;
            if (sectionTitles[2]) sectionTitles[2].textContent = lang.recentActivity;

            // Update form labels and buttons
            const fullNameLabel = profileSection.querySelector('label[for="fullName"]');
            if (fullNameLabel) fullNameLabel.textContent = lang.fullName;

            const emailLabel = profileSection.querySelector('label[for="email"]');
            if (emailLabel) emailLabel.textContent = lang.email;

            const employeeIdLabel = profileSection.querySelector('label[for="employeeId"]');
            if (employeeIdLabel) employeeIdLabel.textContent = lang.employeeId;

            const departmentLabel = profileSection.querySelector('label[for="department"]');
            if (departmentLabel) departmentLabel.textContent = lang.department;

            const languageLabel = profileSection.querySelector('label[for="language"]');
            if (languageLabel) languageLabel.textContent = lang.language;

            const timezoneLabel = profileSection.querySelector('label[for="timezone"]');
            if (timezoneLabel) timezoneLabel.textContent = lang.timezone;

            const themeLabel = profileSection.querySelector('label[for="theme"]');
            if (themeLabel) themeLabel.textContent = lang.theme;

            // Update buttons
            const saveBtn = document.getElementById('saveProfileBtn');
            if (saveBtn) window.secureSetHTML && window.secureSetHTML(saveBtn, `<i class="fas fa-save"></i> ${lang.saveChanges}`) || (saveBtn.textContent = String(`<i class="fas fa-save"></i> ${lang.saveChanges}`).replace(/<[^>]*>/g, ""));

            const changePassBtn = document.getElementById('changePasswordBtn');
            if (changePassBtn) window.secureSetHTML && window.secureSetHTML(changePassBtn, `<i class="fas fa-key"></i> ${lang.changePassword}`) || (changePassBtn.textContent = String(`<i class="fas fa-key"></i> ${lang.changePassword}`).replace(/<[^>]*>/g, ""));

            // Update h3 titles
            const basicInfoH3 = profileSection.querySelector('h3');
            if (basicInfoH3 && (basicInfoH3.textContent.includes('Basic') || basicInfoH3.textContent.includes('个人信息') || basicInfoH3.textContent.includes('基本信息'))) {
                basicInfoH3.textContent = lang.personalInfo;
            }

            const preferencesH3 = profileSection.querySelectorAll('h3')[1];
            if (preferencesH3) preferencesH3.textContent = lang.preferences;

            const passwordH3 = profileSection.querySelectorAll('h3')[2];
            if (passwordH3) passwordH3.textContent = lang.passwordSettings;

            const twoFactorH3 = profileSection.querySelectorAll('h3')[3];
            if (twoFactorH3) twoFactorH3.textContent = lang.twoFactorAuth;
        }
    }

    // Load profile data from server first, fallback to localStorage
    async loadProfileData() {
        try {
            // 🌟 STEP 1: Try to load from server first
            console.log('🔄 Loading profile data from server...');
            
            try {
                const response = await fetch('http://localhost:8080/api/load-profile/admin', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data && Object.keys(result.data).length > 0) {
                        console.log('✅ Profile data loaded from server:', result.data);
                        
                        // Populate form fields with server data
                        this.populateFormFields(result.data);
                        
                        // Update current language from server
                        if (result.data.language) {
                            this.currentLanguage = result.data.language;
                            (window.TINI_SYSTEM?.utils?.secureStorage?.set('adminLanguage', result.data.language) ||
                            (window.secureSetStorage && window.secureSetStorage('adminLanguage', result.data.language)) ||
                            localStorage.setItem('adminLanguage', result.data.language));
                        }
                        
                        // Save to localStorage as cache
                        (window.TINI_SYSTEM?.utils?.secureStorage?.set('profileData', JSON.stringify(result.data))) ||
                        (window.secureSetStorage && window.secureSetStorage('profileData', JSON.stringify(result.data))) ||
                        (localStorage.setItem('profileData', JSON.stringify(result.data)));                        
                        this.showNotification('✅ Profile loaded from server', 'success');
                        return; // Success, no need for fallback
                    }
                }
            } catch (serverError) {
                console.warn('⚠️ Server not available, loading from localStorage:', serverError.message);
            }

            // 🌟 STEP 2: Fallback to localStorage if server fails
            console.log('🔄 Loading profile data from localStorage...');
            const savedData = JSON.parse((window.TINI_SYSTEM?.utils?.secureStorage?.get('profileData') || window.secureGetStorage && window.secureGetStorage('profileData') || localStorage.getItem('profileData')) || '{}');
            
            if (Object.keys(savedData).length > 0) {
                console.log('✅ Profile data loaded from localStorage:', savedData);
                this.populateFormFields(savedData);
                
                if (savedData.language) {
                    this.currentLanguage = savedData.language;
                }
            } else {
                console.log('ℹ️ No saved profile data found, using defaults');
            }

        } catch (error) {
            console.error('❌ Error loading profile data:', error);
        }
    }

    // Helper function to populate form fields
    populateFormFields(data) {
        const fields = ['fullName', 'email', 'department', 'employeeId', 'phone', 'language', 'timezone', 'theme'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && data[field]) {
                element.value = data[field];
            }
        });

        // Load checkbox states
        const checkboxes = ['notifications', 'autoSave'];
        checkboxes.forEach(field => {
            const element = document.getElementById(field);
            if (element && data[field] !== undefined) {
                element.checked = data[field];
            }
        });

        // Set language
        const languageSelect = document.getElementById('language');
        if (languageSelect && data.language) {
            languageSelect.value = data.language;
            this.currentLanguage = data.language;
        } else if (languageSelect) {
            languageSelect.value = this.currentLanguage;
        }

        // Update avatar display and status
        this.updateAvatarDisplay();
        this.updateAllAvatars(); // Update all avatar instances
        const savedAvatar = data.avatar || (window.TINI_SYSTEM?.utils?.secureStorage?.get('userAvatar') || window.secureGetStorage && window.secureGetStorage('userAvatar') || localStorage.getItem('userAvatar'));
        if (savedAvatar) {
            this.updateAvatarStatus('头像已设置');
        } else {
            this.updateAvatarStatus(this.getMessage('no_avatar') || '未设置头像');
        }

        console.log('✅ Form fields populated successfully');
    }

    // Save profile changes - Enhanced version WITH REAL API CALLS
    async saveProfileChanges() {
        try {
            console.log('💾 Starting to save profile changes...');
            
            // Get all form values with validation
            const profileData = {
                fullName: document.getElementById('fullName')?.value?.trim() || '',
                email: document.getElementById('email')?.value?.trim() || '',
                department: document.getElementById('department')?.value?.trim() || '',
                employeeId: document.getElementById('employeeId')?.value?.trim() || 'EMP001',
                phone: document.getElementById('phone')?.value?.trim() || '',
                language: document.getElementById('language')?.value || 'zh',
                timezone: document.getElementById('timezone')?.value || 'UTC+7',
                theme: document.getElementById('theme')?.value || 'dark',
                notifications: document.getElementById('notifications')?.checked || false,
                autoSave: document.getElementById('autoSave')?.checked || false,
                avatar: (window.TINI_SYSTEM?.utils?.secureStorage?.get('adminAvatar') || window.secureGetStorage && window.secureGetStorage('adminAvatar') || localStorage.getItem('adminAvatar')) || (window.TINI_SYSTEM?.utils?.secureStorage?.get('userAvatar') || window.secureGetStorage && window.secureGetStorage('userAvatar') || localStorage.getItem('userAvatar')) || '',
                avatarColor: (window.TINI_SYSTEM?.utils?.secureStorage?.get('avatarColor') || window.secureGetStorage && window.secureGetStorage('avatarColor') || localStorage.getItem('avatarColor')) || '#00e676',
                avatarInitials: (window.TINI_SYSTEM?.utils?.secureStorage?.get('avatarInitials') || window.secureGetStorage && window.secureGetStorage('avatarInitials') || localStorage.getItem('avatarInitials')) || 'AD',
                lastUpdated: new Date().toISOString(),
                username: (window.TINI_SYSTEM?.utils?.secureStorage?.get('username') || window.secureGetStorage && window.secureGetStorage('username') || localStorage.getItem('username')) || 'admin'
            };

            // Validation
            if (!profileData.fullName) {
                this.showNotification(this.getMessage('required_fullname') || '❌ 请输入姓名！', 'error');
                return;
            }

            if (profileData.email && !this.isValidEmail(profileData.email)) {
                this.showNotification(this.getMessage('invalid_email') || '❌ 邮箱格式不正确！', 'error');
                return;
            }

            // 🌟 STEP 1: SAVE TO SERVER FIRST (REAL PERSISTENCE)
            try {
                console.log('🚀 Saving to server API...');
                
                const response = await fetch('http://localhost:8080/api/save-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(profileData)
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Server save failed');
                }

                console.log('✅ Profile saved to server successfully:', result);

                // 🌟 STEP 2: Save language preference separately if changed
                const oldLanguage = this.currentLanguage;
                if (profileData.language && profileData.language !== oldLanguage) {
                    console.log(`🌍 Saving language change: ${oldLanguage} → ${profileData.language}`);
                    
                    const langResponse = await fetch('http://localhost:8080/api/save-language', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            language: profileData.language,
                            userId: profileData.employeeId
                        })
                    });

                    const langResult = await langResponse.json();
                    if (langResponse.ok && langResult.success) {
                        console.log('✅ Language saved to server:', langResult);
                    }
                }

            } catch (serverError) {
                console.error('❌ Server save failed:', serverError);
                this.showNotification(`⚠️ Server unavailable. Data saved locally only.`, 'warning');
                // Continue to save locally as fallback
            }

            // 🌟 STEP 3: Save to localStorage as backup (for offline functionality)
            (window.TINI_SYSTEM?.utils?.secureStorage?.set('profileData', JSON.stringify(profileData)) ||
            (window.secureSetStorage && window.secureSetStorage('profileData', JSON.stringify(profileData))) ||
            localStorage.setItem('profileData', JSON.stringify(profileData)));
            (window.TINI_SYSTEM?.utils?.secureStorage?.set('adminProfile', JSON.stringify(profileData)) ||
            (window.secureSetStorage && window.secureSetStorage('adminProfile', JSON.stringify(profileData))) ||
            localStorage.setItem('adminProfile', JSON.stringify(profileData)));
            (window.TINI_SYSTEM?.utils?.secureStorage?.set('adminLanguage', profileData.language) ||
            (window.secureSetStorage && window.secureSetStorage('adminLanguage', profileData.language)) ||
            localStorage.setItem('adminLanguage', profileData.language));
            (window.TINI_SYSTEM?.utils?.secureStorage?.set('userProfile', JSON.stringify(profileData)) ||
            (window.secureSetStorage && window.secureSetStorage('userProfile', JSON.stringify(profileData))) ||
            localStorage.setItem('userProfile', JSON.stringify(profileData)));
            
            console.log('✅ Profile data saved to localStorage as backup:', profileData);
            
            // 🌟 STEP 4: Update current language IMMEDIATELY if changed using CUSTOM I18N
            const oldLanguage = this.currentLanguage;
            if (profileData.language && profileData.language !== oldLanguage) {
                console.log(`🌍 CUSTOM I18N Language change: ${oldLanguage} → ${profileData.language}`);
                
                // 1. Update current language first
                this.currentLanguage = profileData.language;
                
                // 2. Save to ALL storage locations
                (window.TINI_SYSTEM?.utils?.secureStorage?.set('currentLanguage', profileData.language) || window.secureSetStorage && window.secureSetStorage('currentLanguage', profileData.language) || localStorage.setItem('currentLanguage', profileData.language));
                (window.TINI_SYSTEM?.utils?.secureStorage?.set('selectedLanguage', profileData.language) || window.secureSetStorage && window.secureSetStorage('selectedLanguage', profileData.language) || localStorage.setItem('selectedLanguage', profileData.language));
                (window.TINI_SYSTEM?.utils?.secureStorage?.set('adminLanguage', profileData.language) || window.secureSetStorage && window.secureSetStorage('adminLanguage', profileData.language) || localStorage.setItem('adminLanguage', profileData.language));
                
                // 3. Update Chrome storage if available
                if (typeof chrome !== 'undefined' && chrome.storage) {
                    chrome.storage.local.set({ 
                        language: profileData.language,
                        currentLanguage: profileData.language,
                        adminLanguage: profileData.language 
                    });
                }
                
                // 4. Use CUSTOM I18N for immediate language change
                if (window.customI18n) {
                    window.customI18n.changeLanguage(profileData.language).then(() => {
                        console.log('✅ Custom i18n language changed successfully');
                        
                        // Show success notification IN THE NEW LANGUAGE
                        setTimeout(() => {
                            const successMessage = window.customI18n.getMessage('profile_updated_success', 'Profile updated successfully!');
                            this.showNotification(`✅ ${successMessage}`, 'success');
                        }, 300);
                    });
                } else {
                    console.warn('⚠️ Custom i18n not available, falling back');
                    this.applyLanguageImmediately(profileData.language);
                }
            } else {
                // No language change, just show success
                setTimeout(() => {
                    const successMessage = window.customI18n ? 
                        window.customI18n.getMessage('profile_updated_success', 'Profile updated and saved to server!') :
                        'Profile updated and saved to server!';
                    this.showNotification(`✅ ${successMessage}`, 'success');
                }, 200);
            }

            // 🌟 STEP 5: Update UI elements immediately
            this.updateProfileUI(profileData);

        } catch (error) {
            console.error('❌ Error saving profile:', error);
            this.showNotification(this.getMessage('error_saving_profile') || '❌ 保存个人资料时出错！', 'error');
        }
    }

    // IMMEDIATE language application - NO DELAYS, NO RELOADS
    applyLanguageImmediately(newLanguage) {
        try {
            console.log(`🚀 FORCE applying language: ${newLanguage}`);
            
            // 1. Update tiniI18n system
            if (window.tiniI18n) {
                window.tiniI18n.currentLanguage = newLanguage;
                window.tiniI18n.applyI18n();
                console.log('✅ TiniI18n updated');
            }
            
            // 2. Update Chrome i18n if available  
            if (typeof chrome !== 'undefined' && chrome.i18n) {
                // Force Chrome to use new locale
                console.log('✅ Chrome i18n context updated');
            }
            
            // 3. Force update ALL UI elements immediately
            this.forceApplyI18nToAllSections();
            
            // 4. Update navigation specifically
            this.updateAllNavigationItems();
            this.updateAllDashboardElements();
            this.updateAllTableHeaders();
            
            // 5. Update page title and main sections
            this.updatePageTitleAndHeaders(newLanguage);
            
            // 6. Update status displays and activity feed
            this.updateStatusDisplays(newLanguage);
            
            // 7. Update form labels and inputs
            this.updateFormElements(newLanguage);
            
            console.log(`🎯 Language ${newLanguage} applied IMMEDIATELY to entire panel`);
            
        } catch (error) {
            console.error('❌ Error applying language immediately:', error);
        }
    }

    // Update page titles and section headers
    updatePageTitleAndHeaders(language) {
        try {
            const titleMappings = {
                '个人资料设置': this.getMessage('profile_settings') || '个人资料设置',
                '仪表板': this.getMessage('dashboard_title') || '仪表板',
                '用户管理': this.getMessage('user_management') || '用户管理',
                '报告': this.getMessage('reports_title') || '报告'
            };

            // Update main page title
            const pageTitle = document.querySelector('.header-title, .page-title, h1');
            if (pageTitle) {
                const currentText = pageTitle.textContent.trim();
                if (titleMappings[currentText]) {
                    pageTitle.textContent = titleMappings[currentText];
                }
            }

            // Update all section headers
            document.querySelectorAll('h2, h3, .section-title').forEach(header => {
                const text = header.textContent.trim();
                if (titleMappings[text]) {
                    header.textContent = titleMappings[text];
                }
            });

        } catch (error) {
            console.error('❌ Error updating page titles:', error);
        }
    }

    // Update status displays and activity feed 
    updateStatusDisplays(language) {
        try {
            // Update status text in activity feed
            document.querySelectorAll('.status_status_status').forEach(statusEl => {
                statusEl.textContent = this.getMessage('status') || 'Status';
            });

            // Update activity descriptions
            const activityMappings = {
                '活动': this.getMessage('activity') || '活动',
                '登录': this.getMessage('login') || '登录', 
                'failed': this.getMessage('failed') || 'failed',
                'completed': this.getMessage('completed') || 'completed'
            };

            document.querySelectorAll('.activity-item, .status-text').forEach(item => {
                let text = item.textContent.toLowerCase();
                Object.entries(activityMappings).forEach(([key, value]) => {
                    if (text.includes(key)) {
                        text = text.replace(key, value);
                    }
                });
                if (text !== item.textContent.toLowerCase()) {
                    item.textContent = text;
                }
            });

        } catch (error) {
            console.error('❌ Error updating status displays:', error);
        }
    }

    // Update form elements and labels
    updateFormElements(language) {
        try {
            // Update labels
            document.querySelectorAll('label').forEach(label => {
                const forAttr = label.getAttribute('for');
                if (forAttr) {
                    const messageKey = this.getLabelMessageKey(forAttr);
                    if (messageKey) {
                        const message = this.getMessage(messageKey);
                        if (message) label.textContent = message;
                    }
                }
            });

            // Update button text immediately
            document.querySelectorAll('button').forEach(btn => {
                const dataI18n = btn.getAttribute('data-i18n');
                if (dataI18n) {
                    const message = this.getMessage(dataI18n);
                    if (message) {
                        const icon = btn.querySelector('i');
                        if (icon) {
                            window.secureSetHTML && window.secureSetHTML(btn, `${icon.outerHTML} ${message}`) || (btn.textContent = String(`${icon.outerHTML} ${message}`).replace(/<[^>]*>/g, ""));
                        } else {
                            btn.textContent = message;
                        }
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error updating form elements:', error);
        }
    }

    // Helper to get message key for form labels
    getLabelMessageKey(forAttr) {
        const labelMappings = {
            'fullName': 'full_name',
            'email': 'email',
            'employeeId': 'employee_id', 
            'department': 'department',
            'phone': 'phone',
            'language': 'language',
            'timezone': 'timezone',
            'theme': 'theme'
        };
        return labelMappings[forAttr];
    }

    // Email validation helper
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Update profile UI immediately after save
    updateProfileUI(profileData) {
        try {
            // Update header user name
            const userNameElement = document.querySelector('.user-name, .admin-info .name');
            if (userNameElement && profileData.fullName) {
                userNameElement.textContent = profileData.fullName;
            }

            // Update avatar displays
            this.updateAvatarDisplay();

            // Update any profile displays in dashboard
            const profileNameElements = document.querySelectorAll('[data-profile="name"]');
            profileNameElements.forEach(el => {
                if (profileData.fullName) el.textContent = profileData.fullName;
            });

            const profileEmailElements = document.querySelectorAll('[data-profile="email"]');
            profileEmailElements.forEach(el => {
                if (profileData.email) el.textContent = profileData.email;
            });

            console.log('✅ Profile UI updated successfully');

        } catch (error) {
            console.error('❌ Error updating profile UI:', error);
        }
    }

    // Avatar upload handler
    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (file.size > 5 * 1024 * 1024) { // 5MB
            this.showNotification(this.getMessage('avatar_too_large') || '图片过大！请选择小于5MB的图片', 'error');
            return;
        }

        if (!file.type.startsWith('image/')) {
            this.showNotification(this.getMessage('invalid_image_file') || '请选择图片文件！', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarData = e.target.result;
            // Store temporarily, will save when user clicks "保存更改"
            this.tempAvatarData = avatarData;
            this.updateAvatarDisplay(avatarData);
            this.updateAvatarStatus('图片已上传 - 点击"保存更改"以保存');
            this.showNotification('图片已准备好！点击"保存更改"以保存。', 'info');
        };
        reader.readAsDataURL(file);
    }

    // Save avatar changes - Enhanced with all avatar updates
    saveAvatarChanges() {
        try {
            if (this.tempAvatarData) {
                (window.TINI_SYSTEM?.utils?.secureStorage?.set('userAvatar', this.tempAvatarData) || window.secureSetStorage && window.secureSetStorage('userAvatar', this.tempAvatarData) || localStorage.setItem('userAvatar', this.tempAvatarData));
                this.updateAvatarStatus(this.getMessage('avatar_saved_success') || '头像已成功保存');
                this.showNotification(this.getMessage('avatar_updated_interface') || '✅ 头像已保存并更新整个界面！', 'success');
                
                // Update all avatars throughout the interface
                this.updateAllAvatars();
                
                // Clear temp data
                this.tempAvatarData = null;
            } else {
                // No new image, just save status
                this.showNotification('没有变更需要保存', 'info');
            }
            
        } catch (error) {
            console.error('Error saving avatar:', error);
            this.showNotification(this.getMessage('avatar_save_error') || '保存头像时出错！', 'error');
        }
    }

    // Update avatar status display
    updateAvatarStatus(message) {
        const statusElement = document.getElementById('avatarStatus');
        if (statusElement) {
            statusElement.textContent = message;
            if (message.includes('成功')) {
                statusElement.style.background = 'rgba(0, 230, 118, 0.1)';
                statusElement.style.color = 'var(--success)';
            } else if (message.includes('准备') || message.includes('就绪')) {
                statusElement.style.background = 'rgba(255, 193, 7, 0.1)';
                statusElement.style.color = '#ffc107';
            } else {
                statusElement.style.background = '#333';
                statusElement.style.color = 'var(--text-secondary)';
            }
        }
    }

    // Update avatar display
    updateAvatarDisplay(tempData = null) {
        const previewAvatar = document.getElementById('previewAvatar');
        const savedAvatar = (window.TINI_SYSTEM?.utils?.secureStorage?.get('userAvatar') || window.secureGetStorage && window.secureGetStorage('userAvatar') || localStorage.getItem('userAvatar'));
        const displayData = tempData || savedAvatar;

        if (previewAvatar) {
            if (displayData) {
                previewAvatar.style.backgroundImage = `url(${displayData})`;
                previewAvatar.style.backgroundSize = 'cover';
                previewAvatar.style.backgroundPosition = 'center';
                window.secureSetHTML && window.secureSetHTML(previewAvatar, '') || (previewAvatar.textContent = String('').replace(/<[^>]*>/g, ""));
            } else {
                previewAvatar.style.backgroundImage = 'none';
                previewAvatar.style.background = '#2a2a2a';
                window.secureSetHTML && window.secureSetHTML(previewAvatar, '<i class="fas fa-user" style="font-size: 48px; color: #666;"></i>') || (previewAvatar.textContent = String('<i class="fas fa-user" style="font-size: 48px; color: #666;"></i>').replace(/<[^>]*>/g, ""));
            }
        }
        
        // Also update header avatar if no temp data
        if (!tempData) {
            const savedAvatar = (window.TINI_SYSTEM?.utils?.secureStorage?.get('userAvatar') || window.secureGetStorage && window.secureGetStorage('userAvatar') || localStorage.getItem('userAvatar'));
            this.updateHeaderAvatar(savedAvatar);
        }
    }

    // Change password functionality
    changePassword() {
        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('Please fill in all password fields', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showNotification('Password must be at least 8 characters long', 'error');
            return;
        }

        // Simulate password change
        this.showNotification('Password changed successfully!', 'success');
        
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }

    // Handle large cover photo upload
    handleCoverUploadLarge(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit for cover
                this.showNotification(this.getMessage('cover_too_large') || '❌ 封面图片过大！最大10MB。', 'error');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                this.showNotification(this.getMessage('invalid_cover_image') || '❌ 请选择有效的图片文件！', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const coverElement = document.getElementById('profileCoverLarge');
                const placeholder = document.getElementById('coverPlaceholderLarge');
                
                if (coverElement && placeholder) {
                    coverElement.style.backgroundImage = `url(${e.target.result})`;
                    coverElement.style.backgroundSize = 'cover';
                    coverElement.style.backgroundPosition = 'center';
                    placeholder.style.display = 'none';
                    
                    // Save to localStorage
                    (window.TINI_SYSTEM?.utils?.secureStorage?.set('userCoverPhoto', e.target.result) || window.secureSetStorage && window.secureSetStorage('userCoverPhoto', e.target.result) || localStorage.setItem('userCoverPhoto', e.target.result));
                    this.showNotification('✅ 封面图片已成功更改！', 'success');
                }
            };
            reader.readAsDataURL(file);
        }
    }

    // Handle cover photo upload (small version)
    handleCoverUpload(event) {
        // Use the same function as large cover
        this.handleCoverUploadLarge(event);
    }

    // Update all avatar displays throughout the interface
    updateAllAvatars() {
        const savedAvatar = (window.TINI_SYSTEM?.utils?.secureStorage?.get('userAvatar') || window.secureGetStorage && window.secureGetStorage('userAvatar') || localStorage.getItem('userAvatar'));
        
        // Update all avatar elements
        const avatarElements = [
            document.getElementById('previewAvatar'),
            document.getElementById('currentAvatar'),
            document.querySelector('.user-avatar') // Dashboard header
        ];

        avatarElements.forEach(element => {
            if (element) {
                if (savedAvatar) {
                    element.style.backgroundImage = `url(${savedAvatar})`;
                    element.style.backgroundSize = 'cover';
                    element.style.backgroundPosition = 'center';
                    window.secureSetHTML && window.secureSetHTML(element, '') || (element.textContent = String('').replace(/<[^>]*>/g, "")); // Remove placeholder icon
                } else {
                    element.style.backgroundImage = 'none';
                    window.secureSetHTML && window.secureSetHTML(element, '<i class="fas fa-user"></i>') || (element.textContent = String('<i class="fas fa-user"></i>').replace(/<[^>]*>/g, ""));
                }
            }
        });

        console.log('✅ All avatars updated');
    }

    // Load cover photo on page load
    loadCoverPhoto() {
        const savedCover = (window.TINI_SYSTEM?.utils?.secureStorage?.get('userCoverPhoto') || window.secureGetStorage && window.secureGetStorage('userCoverPhoto') || localStorage.getItem('userCoverPhoto'));
        if (savedCover) {
            // Load large cover only
            const coverElementLarge = document.getElementById('profileCoverLarge');
            const placeholderLarge = document.getElementById('coverPlaceholderLarge');
            
            if (coverElementLarge && placeholderLarge) {
                coverElementLarge.style.backgroundImage = `url(${savedCover})`;
                coverElementLarge.style.backgroundSize = 'cover';
                coverElementLarge.style.backgroundPosition = 'center';
                placeholderLarge.style.display = 'none';
            }
        }
    }

    // =================
    // SAVE CHANGES FUNCTIONALITY
    // =================
    setupSaveChanges() {
        try {
            // 1. Setup Save Profile Button
            const saveProfileBtn = document.getElementById('saveProfileBtn');
            if (saveProfileBtn) {
                saveProfileBtn.addEventListener('click', () => {
                    this.saveProfileChanges();
                });
                console.log('✅ Save profile button listener attached');
            }

            // 2. 🌍 SETUP LANGUAGE CHANGE EVENT (Custom I18n)
            const languageSelect = document.getElementById('language');
            if (languageSelect) {
                languageSelect.addEventListener('change', (e) => {
                    const newLang = e.target.value;
                    console.log(`🌍 Language changing to: ${newLang}`);
                    
                    // Save language to Chrome storage
                    chrome.storage.local.set({ language: newLang }, () => {
                        // Load new messages and apply immediately
                        this.loadMessages(newLang, () => {
                            this.applyI18nToPanel();
                            alert(this.getMessage("language_changed_success"));
                            console.log(`✅ Language changed to ${newLang} successfully`);
                        });
                    });
                });
                console.log('✅ Custom i18n language select listener attached');
            }

            // 3. Setup other save buttons if any
            const saveButtons = document.querySelectorAll('[data-i18n="save"], .save-btn');
            saveButtons.forEach(btn => {
                if (btn.id !== 'saveProfileBtn') { // Avoid duplicate listener
                    btn.addEventListener('click', () => {
                        // Apply i18n after any save operation
                        setTimeout(() => this.applyI18nToPanel(), 100);
                    });
                }
            });

        } catch (error) {
            console.error('❌ Error in setupSaveChanges:', error);
        }
    }

    // =================
    // AVATAR MANAGEMENT
    // =================
    loadUserAvatars() {
        try {
            // Load avatar for header mini avatar
            const savedAvatar = (window.TINI_SYSTEM?.utils?.secureStorage?.get('adminAvatar') || window.secureGetStorage && window.secureGetStorage('adminAvatar') || localStorage.getItem('adminAvatar'));
            if (savedAvatar) {
                this.updateHeaderAvatar(savedAvatar);
                this.updateProfileAvatar(savedAvatar);
                console.log('✅ User avatars loaded successfully');
            } else {
                console.log('ℹ️ No saved avatar found');
            }
        } catch (error) {
            console.error('❌ Error in loadUserAvatars:', error);
        }
    }

    updateHeaderAvatar(avatarData) {
        const headerAvatar = document.querySelector('.user-avatar');
        if (headerAvatar) {
            if (avatarData) {
                window.secureSetHTML && window.secureSetHTML(headerAvatar, '<img src="' + avatarData + '" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="Avatar">') || (headerAvatar.textContent = String('<img src="' + avatarData + '" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="Avatar">').replace(/<[^>]*>/g, ""));
            } else {
                // Reset to default icon if no avatar data
                window.secureSetHTML && window.secureSetHTML(headerAvatar, '<i class="fas fa-user" style="font-size: 16px"></i>') || (headerAvatar.textContent = String('<i class="fas fa-user" style="font-size: 16px"></i>').replace(/<[^>]*>/g, ""));
            }
        }
    }

    updateProfileAvatar(avatarData) {
        const profileAvatar = document.getElementById('previewAvatar');
        if (profileAvatar) {
            if (avatarData) {
                window.secureSetHTML && window.secureSetHTML(profileAvatar, '<img src="' + avatarData + '" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="Avatar">') || (profileAvatar.textContent = String('<img src="' + avatarData + '" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="Avatar">').replace(/<[^>]*>/g, ""));
            } else {
                window.secureSetHTML && window.secureSetHTML(profileAvatar, '<i class="fas fa-user" style="font-size: 48px; color: #666;"></i>') || (profileAvatar.textContent = String('<i class="fas fa-user" style="font-size: 48px; color: #666;"></i>').replace(/<[^>]*>/g, ""));
            }
        }
    }

    // =================
    // LANGUAGE SYSTEM INTEGRATION
    // =================
    initializeLanguageSystem() {
        try {
            console.log(`🌍 Admin Panel: Initializing language system with: ${this.currentLanguage}`);
            
            // Initialize Chrome i18n Helper if available
            if (window.tiniI18n) {
                console.log('✅ TINI i18n Helper found, syncing language...');
                
                // Sync language with our current setting
                window.tiniI18n.currentLanguage = this.currentLanguage;
                
                // Apply i18n immediately with our language
                window.tiniI18n.applyI18n();
                
                // Set up language change listener
                this.setupLanguageChangeListener();
                
                // Update language selector to reflect current language
                this.updateLanguageSelector();
                
                console.log(`✅ Admin Panel: Language system synchronized to ${this.currentLanguage}`);
            } else {
                console.log('⚠️ TINI i18n Helper not available, using Chrome i18n directly');
                this.applyLanguageImmediately(this.currentLanguage);
            }
            
        } catch (error) {
            console.error('❌ Error in initializeLanguageSystem:', error);
        }
    }

    // Setup language change listener for profile language selector
    setupLanguageChangeListener() {
        try {
            const languageSelect = document.getElementById('language');
            if (languageSelect && window.tiniI18n) {
                // Set current language in selector
                languageSelect.value = window.tiniI18n.currentLanguage;
                
                // Listen for changes
                languageSelect.addEventListener('change', async (event) => {
                    const newLanguage = event.target.value;
                    console.log(`🌍 Language change requested: ${newLanguage}`);
                    
                    try {
                        // Change language using i18n helper
                        await window.tiniI18n.changeLanguage(newLanguage);
                        
                        // Show success notification
                        this.showNotification(`Language changed to ${this.getLanguageName(newLanguage)}`, 'success');
                        
                        console.log(`✅ Language changed successfully to: ${newLanguage}`);
                    } catch (error) {
                        console.error('❌ Error changing language:', error);
                        this.showNotification('Error changing language', 'error');
                    }
                });
                
                console.log('✅ Language change listener setup complete');
            }
        } catch (error) {
            console.error('❌ Error setting up language change listener:', error);
        }
    }

    // Update language selector value
    updateLanguageSelector() {
        try {
            const languageSelect = document.getElementById('language');
            if (languageSelect && window.tiniI18n) {
                languageSelect.value = window.tiniI18n.currentLanguage;
                console.log(`✅ Language selector updated to: ${window.tiniI18n.currentLanguage}`);
            }
        } catch (error) {
            console.error('❌ Error updating language selector:', error);
        }
    }

    // Get language display name
    getLanguageName(code) {
        const names = {
            'vi': 'Tiếng Việt',
            'en': 'English', 
            'zh': '中文',
            'hi': 'हिन्दी',
            'ko': '한국어'
        };
        return names[code] || code;
    }

    // Fallback language system for when i18n helper isn't available
    initializeFallbackLanguageSystem() {
        try {
            console.log('🌍 Admin Panel: Initializing fallback language system...');
            
            // Get saved language
            const savedLanguage = (window.TINI_SYSTEM?.utils?.secureStorage?.get('adminLanguage') || window.secureGetStorage && window.secureGetStorage('adminLanguage') || localStorage.getItem('adminLanguage')) || 'zh';
            this.currentLanguage = savedLanguage;
            
            console.log(`🌍 Current language: ${this.currentLanguage}`);

            // Apply language immediately if we have translations
            if (this.translations && this.translations[this.currentLanguage]) {
                this.applyLanguageToAdminPanel(this.currentLanguage);
                console.log('✅ Admin Panel: Fallback language applied successfully');
            }
            
        } catch (error) {
            console.error('❌ Error in fallback language system:', error);
        }
    }

    // Force apply i18n to ALL sections of admin panel
    forceApplyI18nToAllSections() {
        try {
            console.log('🌍 Force applying i18n to ALL admin panel sections...');
            
            // Apply using i18n helper if available
            if (window.tiniI18n) {
                console.log('✅ Using TINI i18n helper for full panel translation');
                window.tiniI18n.applyI18n();
                
                // Force update all sections specifically  
                this.updateAllSectionTitles();
                this.updateAllNavigationItems();
                this.updateAllDashboardElements();
                this.updateAllTableHeaders();
                
                console.log('✅ All admin panel sections updated with i18n');
            } else {
                console.warn('⚠️ TINI i18n helper not available, using fallback');
                this.applyFallbackTranslationToAll();
            }
            
        } catch (error) {
            console.error('❌ Error in forceApplyI18nToAllSections:', error);
        }
    }

    // Update all section titles across admin panel
    updateAllSectionTitles() {
        try {
            const titleMappings = {
                '#dashboard .header-title': 'nav_dashboard',
                '#users .header-title': 'user_management', 
                '#profile .header-title': 'profile_settings',
                '#security .header-title': 'nav_security',
                '#settings .header-title': 'nav_settings',
                '#analytics .header-title': 'nav_analytics',
                '#reports .header-title': 'reports_title'
            };

            Object.entries(titleMappings).forEach(([selector, messageKey]) => {
                const element = document.querySelector(selector);
                if (element && window.tiniI18n) {
                    const message = window.tiniI18n.getMessage(messageKey);
                    if (message) element.textContent = message;
                }
            });
            
            console.log('✅ All section titles updated');
        } catch (error) {
            console.error('❌ Error updating section titles:', error);
        }
    }

    // Update all navigation items
    updateAllNavigationItems() {
        try {
            const navMappings = {
                '[data-section="dashboard"] span': 'nav_dashboard',
                '[data-section="users"] span': 'nav_users',
                '[data-section="profile"] span': 'nav_profile', 
                '[data-section="security"] span': 'nav_security',
                '[data-section="settings"] span': 'nav_settings',
                '[data-section="analytics"] span': 'nav_analytics',
                '[data-section="reports"] span': 'nav_reports',
                '#logoutBtn span': 'logout',
                '[data-section="testing"] span': 'testing_zone'
            };

            Object.entries(navMappings).forEach(([selector, messageKey]) => {
                const element = document.querySelector(selector);
                if (element && window.tiniI18n) {
                    const message = window.tiniI18n.getMessage(messageKey);
                    if (message) element.textContent = message;
                }
            });
            
            console.log('✅ All navigation items updated');
        } catch (error) {
            console.error('❌ Error updating navigation items:', error);
        }
    }

    // Update all dashboard elements
    updateAllDashboardElements() {
        try {
            // Dashboard stats cards
            const dashboardCards = document.querySelectorAll('#dashboard .dashboard-card .card-title');
            const cardKeys = ['active_users', 'blocked_items', 'system_health'];
            
            dashboardCards.forEach((card, index) => {
                if (cardKeys[index] && window.tiniI18n) {
                    const message = window.tiniI18n.getMessage(cardKeys[index]);
                    if (message) card.textContent = message;
                }
            });

            // Activity section
            const activityTitle = document.querySelector('#dashboard .activity-section .section-title');
            if (activityTitle && window.tiniI18n) {
                const message = window.tiniI18n.getMessage('recent_activity');
                if (message) activityTitle.textContent = message;
            }

            // User management section
            const userManagementTitle = document.querySelector('#dashboard h3');
            if (userManagementTitle && (userManagementTitle.textContent.includes('用户管理') || userManagementTitle.textContent.includes('用户管理')) && window.tiniI18n) {
                const message = window.tiniI18n.getMessage('user_management');
                if (message) userManagementTitle.textContent = message;
            }
            
            console.log('✅ All dashboard elements updated');
        } catch (error) {
            console.error('❌ Error updating dashboard elements:', error);
        }
    }

    // Update all table headers
    updateAllTableHeaders() {
        try {
            // User management table headers
            const userTableHeaders = document.querySelectorAll('#users table th, #dashboard table th');
            const userHeaderKeys = ['user_name', 'user_role', 'user_activity', 'user_devices', 'user_actions'];
            
            userTableHeaders.forEach((header, index) => {
                if (userHeaderKeys[index] && window.tiniI18n) {
                    const message = window.tiniI18n.getMessage(userHeaderKeys[index]);
                    if (message) header.textContent = message;
                }
            });

            // Reports table headers
            const reportTableHeaders = document.querySelectorAll('#reports table th');
            const reportHeaderKeys = ['report_name', 'report_type', 'report_generated', 'report_size', 'report_status', 'report_actions'];
            
            reportTableHeaders.forEach((header, index) => {
                if (reportHeaderKeys[index] && window.tiniI18n) {
                    const message = window.tiniI18n.getMessage(reportHeaderKeys[index]);
                    if (message) header.textContent = message;
                }
            });
            
            console.log('✅ All table headers updated');
        } catch (error) {
            console.error('❌ Error updating table headers:', error);
        }
    }

    // Apply language to admin panel elements
    applyLanguageToAdminPanel(langCode) {
        try {
            console.log(`🌍 Applying language ${langCode} to admin panel...`);
            
            const lang = this.translations[langCode] || this.translations.vi;
            if (!lang) {
                console.warn(`⚠️ No translations found for language: ${langCode}`);
                return;
            }

            // Apply to all elements with data-translate attribute
            const translateElements = document.querySelectorAll('[data-translate]');
            translateElements.forEach(element => {
                const key = element.getAttribute('data-translate');
                if (lang[key]) {
                    element.textContent = lang[key];
                }
            });

            // Apply to buttons with data-translate attribute specifically
            const buttons = document.querySelectorAll('button[data-translate]');
            buttons.forEach(button => {
                const key = button.getAttribute('data-translate');
                if (lang[key]) {
                    // Preserve icon and update text content
                    const icon = button.querySelector('i');
                    if (icon) {
                        window.secureSetHTML && window.secureSetHTML(button, icon.outerHTML + ' ' + lang[key]) || (button.textContent = String(icon.outerHTML + ' ' + lang[key]).replace(/<[^>]*>/g, ""));
                    } else {
                        button.textContent = lang[key];
                    }
                }
            });

            // Apply to specific profile elements
            const profileElements = {
                'profileTitle': '.profile-title, .header-title',
                'personalInfo': '.personal-info-title',
                'fullName': 'label[for="fullName"]',
                'email': 'label[for="email"]',
                'department': 'label[for="department"]',
                'language': 'label[for="language"]',
                'saveChanges': '#saveProfileBtn, .save-btn'
            };

            Object.entries(profileElements).forEach(([key, selector]) => {
                if (lang[key]) {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        if (el.tagName === 'BUTTON') {
                            window.secureSetHTML && window.secureSetHTML(el, `<i class="fas fa-save"></i> ${lang[key]}`) || (el.textContent = String(`<i class="fas fa-save"></i> ${lang[key]}`).replace(/<[^>]*>/g, ""));
                        } else {
                            el.textContent = lang[key];
                        }
                    });
                }
            });

            // Apply to navigation items
            const navTranslations = {
                'dashboard': this.getMessage('nav_dashboard') || '仪表板',
                'users': this.getMessage('nav_users') || '用户管理', 
                'analytics': this.getMessage('nav_analytics') || '数据分析',
                'security': this.getMessage('nav_security') || '安全设置',
                'settings': this.getMessage('nav_settings') || '系统设置',
                'reports': this.getMessage('nav_reports') || '报告',
                'profile': this.getMessage('nav_profile') || '个人资料'
            };

            Object.entries(navTranslations).forEach(([key, value]) => {
                const navElement = document.querySelector(`[data-section="${key}"] span`);
                if (navElement && langCode === 'vi') {
                    navElement.textContent = value;
                } else if (navElement && langCode === 'en') {
                    navElement.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                }
            });

            // Update language selector
            const languageSelect = document.getElementById('language');
            if (languageSelect) {
                languageSelect.value = langCode;
            }

            console.log(`✅ Admin panel language applied: ${langCode}`);

        } catch (error) {
            console.error('❌ Error applying language to admin panel:', error);
        }
    }

    // Enhanced language change handler
    onLanguageChange(newLanguage) {
        try {
            console.log(`🌍 Language changing from ${this.currentLanguage} to ${newLanguage}`);
            
            this.currentLanguage = newLanguage;
            (window.TINI_SYSTEM?.utils?.secureStorage?.set('adminLanguage', newLanguage) || window.secureSetStorage && window.secureSetStorage('adminLanguage', newLanguage) || localStorage.setItem('adminLanguage', newLanguage));
            
            // Apply language immediately
            this.applyLanguageToAdminPanel(newLanguage);
            
            // Also trigger external language system if available
            if (window.languageSystem && window.languageSystem.setLanguage) {
                window.languageSystem.setLanguage(newLanguage);
            }

            // Show success notification
            const lang = this.translations[newLanguage] || this.translations.vi;
            this.showNotification(
                `✅ ${lang.languageChanged || '语言切换成功！'}`, 
                'success'
            );

            console.log(`✅ Language changed successfully to: ${newLanguage}`);

        } catch (error) {
            console.error('❌ Error changing language:', error);
            this.showNotification('❌ 更换语言时出错！', 'error');
        }
    }

    // =================
    // ADVANCED MODE & DEBUG FEATURES
    // =================
    
    toggleAdvancedMode() {
        const newMode = advancedModeSystem.toggleAdvancedMode();
        this.showNotification(`🔧 Advanced Mode ${newMode ? 'ENABLED' : 'DISABLED'}\n\n${newMode ? '✅ Professional features unlocked' : '🔒 Standard mode activated'}`, newMode ? 'success' : 'info');
        
        // Reload current section to apply changes
        const activeSection = document.querySelector('.nav-link.active')?.textContent.trim();
        if (activeSection === 'Dashboard') {
            this.loadDashboardContent();
        }
    }
    
    setDefaultServer() {
        const select = document.getElementById('defaultModelSelect');
        if (select) {
            const model = select.value;
            (window.TINI_SYSTEM?.utils?.secureStorage?.set('defaultModel', model) || window.secureSetStorage && window.secureSetStorage('defaultModel', model) || localStorage.setItem('defaultModel', model));
            (window.TINI_SYSTEM?.utils?.secureStorage?.set('serverMode', 'default') || window.secureSetStorage && window.secureSetStorage('serverMode', 'default') || localStorage.setItem('serverMode', 'default'));
            
            this.showNotification(`🎯 Server Configuration Updated\n\nDefault model: ${model.toUpperCase()}\nMode: Single Server`, 'success');
        }
    }
    
    toggleMultiServer() {
        const toggle = document.getElementById('multiServerToggle');
        if (toggle) {
            const isMulti = toggle.checked;
            (window.TINI_SYSTEM?.utils?.secureStorage?.set('serverMode', isMulti ? 'multi' : 'default') || window.secureSetStorage && window.secureSetStorage('serverMode', isMulti ? 'multi' : 'default') || localStorage.setItem('serverMode', isMulti ? 'multi' : 'default'));
            
            this.showNotification(`⚡ Server Mode: ${isMulti ? 'Multi-Server' : 'Single Server'}\n\n${isMulti ? '✅ All 4 models available to users' : '🎯 Using default model only'}`, isMulti ? 'warning' : 'success');
        }
    }
    
    testPatternsOnInput() {
        const inputText = document.getElementById('debugInputText')?.value || '';
        if (!inputText.trim()) {
            this.showNotification('⚠️ No Input\n\nPlease paste HTML content to test patterns against.', 'warning');
            return;
        }
        const results = patternTestingSystem.testPatterns(inputText);
        const debugResults = document.getElementById('debugResults');
        if (debugResults) {
            debugResults.innerHTML = `
                <h4 style="color: var(--success); margin-bottom: 15px;">✅ Pattern Test Results</h4>
                ${results.map(result => `
                    <div style="background: var(--bg-darker); padding: 10px; margin: 10px 0; border-radius: 6px; border-left: 3px solid ${result.match ? 'var(--success)' : 'var(--danger)'};">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <strong>${result.match ? '✅' : '❌'} ${result.group}</strong>
                            <span style="color: var(--text-secondary);">${result.confidence || 0}% confidence</span>
                        </div>
                        <div style="font-family: monospace; font-size: 12px; color: var(--text-secondary);">
                            ${result.pattern}
                        </div>
                    </div>
                `).join('')}
            `;
        }
        const matches = results.filter(r => r.match).length;
        this.showNotification(`🧪 Pattern Testing Complete\n\n✅ ${results.length} patterns tested\n🎯 ${matches} matches found\n${matches > 0 ? '⚠️ Potential blocks identified' : '✅ No blocking patterns detected'}`, matches > 0 ? 'warning' : 'success');
    }

    // =================
    // NOTIFICATION SYSTEM  
    // =================
    showNotification(message, type = 'info') {
        try {
            console.log('📢 Showing notification:', message, 'Type:', type);
            const notification = document.createElement('div');
            // Set styles directly instead of using template literal
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.color = 'white';
            notification.style.padding = '15px 20px';
            notification.style.borderRadius = '8px';
            notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
            notification.style.zIndex = '10000';
            notification.style.animation = 'slideIn 0.3s ease';
            notification.style.maxWidth = '300px';
            notification.style.fontWeight = '500';
            // Set background color based on type
            switch(type) {
                case 'success':
                    notification.style.background = '#4CAF50';
                    break;
                case 'warning':
                    notification.style.background = '#FF9800';
                    break;
                case 'error':
                    notification.style.background = '#F44336';
                    break;
                default:
                    notification.style.background = '#2196F3';
            }
            notification.textContent = message;
            //set time out 3 seconds
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        } catch (error) {
            console.error('❌ Error showing notification:', error);
        }
    }
}

// =================
// 🔍 DEBUG FUNCTIONS & ADVANCED FEATURES
// =================

// Advanced Mode System from legacy admin panel
class AdvancedModeSystem {
    constructor() {
        this.isAdvancedMode = (window.TINI_SYSTEM?.utils?.secureStorage?.get('advancedMode') || window.secureGetStorage && window.secureGetStorage('advancedMode') || localStorage.getItem('advancedMode')) === 'true';
        this.models = {
            lite: { name: 'TINI LITE', color: '#00f0ff', icon: 'fas fa-heart', activeUsers: 1250 },
            flash: { name: 'TINI FLASH', color: '#ffd93d', icon: 'fas fa-bolt', activeUsers: 2140 },
            power: { name: 'TINI POWER', color: '#ff3d71', icon: 'fas fa-fire', activeUsers: 890 },
            smart: { name: 'TINI SMART', color: '#a78bfa', icon: 'fas fa-brain', activeUsers: 1580 }
        };
    }

    toggleAdvancedMode() {
        this.isAdvancedMode = !this.isAdvancedMode;
        window.TINI_SYSTEM?.utils?.secureStorage?.set('advancedMode', this.isAdvancedMode.toString());
        window.secureSetStorage && window.secureSetStorage('advancedMode', this.isAdvancedMode.toString());
        localStorage.setItem('advancedMode', this.isAdvancedMode.toString());
        
        // Sync all toggles
        document.querySelectorAll('.advanced-toggle').forEach(toggle => {
            toggle.checked = this.isAdvancedMode;
        });
        
        console.log(`🔧 Advanced Mode ${this.isAdvancedMode ? 'ENABLED' : 'DISABLED'}`);
        return this.isAdvancedMode;
    }

    generateAdvancedDashboard() {
        if (!this.isAdvancedMode) return '';
        
        return `
            <div class="advanced-dashboard-section">
                <div>
                    <h3 style="color: var(--accent); margin-bottom: 20px;">🎛️ Professional Model Management</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        ${Object.entries(this.models).map(([key, model]) => `
                            <div class="model-card ${key} active">
                                <div class="model-header">
                                    <div class="model-name">
                                        <i class="${model.icon}"></i> ${model.name}
                                    </div>
                                    <div class="model-status online">Online</div>
                                </div>
                                <div class="model-stats">
                                    <div class="stat-row">
                                        <span class="stat-label">Active Users:</span>
                                        <span class="stat-value">${model.activeUsers.toLocaleString()}</span>
                                    </div>
                                    <div class="stat-row">
                                        <span class="stat-label">CPU Usage:</span>
                                        <span class="stat-value">${Math.floor(Math.random() * 30) + 20}%</span>
                                    </div>
                                    <div class="stat-row">
                                        <span class="stat-label">Memory:</span>
                                        <span class="stat-value">${Math.floor(Math.random() * 200) + 100}MB</span>
                                    </div>
                                </div>
                                <div class="model-actions">
                                    <button class="btn-model btn-configure" data-model="${key}">
                                        <i class="fas fa-cog"></i> Configure
                                    </button>
                                    <button class="btn-model btn-deactivate" data-model="${key}">
                                        <i class="fas fa-pause"></i> Pause
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

// Server Control Panel System
class ServerControlPanel {
    constructor() {
        this.serverMode = (window.TINI_SYSTEM?.utils?.secureStorage?.get('serverMode') || window.secureGetStorage && window.secureGetStorage('serverMode') || localStorage.getItem('serverMode')) || 'default';
        this.defaultModel = (window.TINI_SYSTEM?.utils?.secureStorage?.get('defaultModel') || window.secureGetStorage && window.secureGetStorage('defaultModel') || localStorage.getItem('defaultModel')) || 'flash';
    }

    generateControlPanel() {
        return `
            <div class="server-control-section">
                <h3 style="color: var(--accent); margin-bottom: 15px;">🎛️ Server Control Panel</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: var(--card-bg); padding: 15px; border-radius: 8px; border: 1px solid var(--border);">
                        <h4 style="color: var(--accent); margin-bottom: 10px;">🎯 Default Mode</h4>
                        <select id="defaultModelSelect" style="width: 100%; padding: 8px; background: var(--bg-darker); border: 1px solid var(--border); border-radius: 4px; color: var(--text); margin-bottom: 10px;">
                            <option value="lite" ${this.defaultModel === 'lite' ? 'selected' : ''}>TINI LIFE</option>
                            <option value="flash" ${this.defaultModel === 'flash' ? 'selected' : ''}>TINI FLASH</option>
                            <option value="power" ${this.defaultModel === 'power' ? 'selected' : ''}>TINI POWER</option>
                            <option value="smart" ${this.defaultModel === 'smart' ? 'selected' : ''}>TINI SMART</option>
                        </select>
                        <button onclick="window.adminPanel.setDefaultServer()" style="background: var(--accent); color: var(--bg-dark); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">
                            Set as Default
                        </button>
                    </div>
                    
                    <div style="background: var(--card-bg); padding: 15px; border-radius: 8px; border: 1px solid var(--border);">
                        <h4 style="color: var(--warning); margin-bottom: 10px;">⚡ Multi-Server Mode</h4>
                        <label style="display: flex; align-items: center; justify-content: space-between;">
                            <span>Enable All Servers</span>
                            <input type="checkbox" id="multiServerToggle" ${this.serverMode === 'multi' ? 'checked' : ''} onchange="window.adminPanel.toggleMultiServer()">
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
}

// Pattern Testing & Debug System
class PatternTestingSystem {
    constructor() {
        this.patterns = [
            { pattern: 'div[data-e2e="video-player"]', group: 'TikTok Video Blocker' },
            { pattern: '*video*container*', group: 'TikTok Video Blocker' },
            { pattern: 'div[class*="advertisement"]', group: 'Ad Content Detector' },
            { pattern: '/video.*player/i', group: 'Video Content Detector' }
        ];
    }

    generateDebugPanel() {
        return `
            <div class="debug-panel-section">
                <h3 style="color: var(--accent); margin-bottom: 15px;">🧪 Signal Pattern Testing</h3>
                <div style="display: grid; gap: 20px;">
                    <div style="background: var(--card-bg); padding: 15px; border-radius: 8px;">
                        <h4 style="margin-bottom: 10px;">Input HTML for Testing</h4>
                        <textarea id="debugInputText" placeholder="Paste HTML content here..." style="width: 100%; height: 100px; background: var(--bg-darker); border: 1px solid var(--border); border-radius: 4px; color: var(--text); padding: 10px;"></textarea>
                        <button onclick="window.adminPanel.testPatternsOnInput()" style="margin-top: 10px; background: var(--accent); color: var(--bg-dark); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                            Test Patterns
                        </button>
                    </div>
                    
                    <div id="debugResults" style="background: var(--card-bg); padding: 15px; border-radius: 8px;">
                        <h4 style="color: var(--success); margin-bottom: 15px;">✅ Debug Results</h4>
                        <div style="color: var(--text-secondary); text-align: center; padding: 20px;">
                            Run pattern tests to see results here...
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    testPatterns(inputText) {
        if (!inputText.trim()) return [];
        
        return this.patterns.map(pattern => ({
            ...pattern,
            match: Math.random() > 0.3, // Simulate pattern matching
            confidence: Math.floor(Math.random() * 40) + 60
        }));
    }
}

// Initialize advanced systems
const advancedModeSystem = new AdvancedModeSystem();
const serverControlPanel = new ServerControlPanel();
const patternTestingSystem = new PatternTestingSystem();
function debugSecurity() {
    console.log('🔍 === SECURITY DEBUG START ===');
    
    // Check if integrated system is loaded
    console.log('1. Integrated System Status:', {
        'integratedEmployeeSystem': !!window.integratedEmployeeSystem,
        'IntegratedEmployeeSystem': !!window.IntegratedEmployeeSystem
    });
    // Check current admin user
    console.log('2. Current Admin User:');
    if (window.adminPanel) {
        const currentUser = window.adminPanel.getCurrentAdminUser();
        console.log('   - Current User:', currentUser);
    } else {
        console.log('   - Admin Panel not available');
 }
    
    // Check localStorage
    console.log('3. LocalStorage Data:');
    console.log('   - userRole:', (window.TINI_SYSTEM?.utils?.secureStorage?.get('userRole') || window.secureGetStorage && window.secureGetStorage('userRole') || localStorage.getItem('userRole')));
    console.log('   - username:', (window.TINI_SYSTEM?.utils?.secureStorage?.get('username') || window.secureGetStorage && window.secureGetStorage('username') || localStorage.getItem('username')));
    console.log('   - tiniAdminProfile:', (window.TINI_SYSTEM?.utils?.secureStorage?.get('tiniAdminProfile') || window.secureGetStorage && window.secureGetStorage('tiniAdminProfile') || localStorage.getItem('tiniAdminProfile')));
    console.log('   - usersData length:', JSON.parse((window.TINI_SYSTEM?.utils?.secureStorage?.get('usersData') || window.secureGetStorage && window.secureGetStorage('usersData') || localStorage.getItem('usersData')) || '[]').length);
    console.log('   - advancedMode:', (window.TINI_SYSTEM?.utils?.secureStorage?.get('advancedMode') || window.secureGetStorage && window.secureGetStorage('advancedMode') || localStorage.getItem('advancedMode')));
    console.log('   - serverMode:', (window.TINI_SYSTEM?.utils?.secureStorage?.get('serverMode') || window.secureGetStorage && window.secureGetStorage('serverMode') || localStorage.getItem('serverMode')));
    
    // Test security method directly
    console.log('4. Security Test:');
    if (window.integratedEmployeeSystem) {
        const testResult = window.integratedEmployeeSystem.canDeleteUser('admin', 'admin', 'EMP002', 'EMP001');
        console.log('   - Admin delete admin test:', testResult);
    } else {
        console.log('   - Security system not available for testing');
    }
    
    console.log('🔍 === SECURITY DEBUG END ===');
    
    // Show alert with summary
    const status = {
        integratedSystem: !!window.integratedEmployeeSystem,
        adminPanel: !!window.adminPanel,
        userRole: (window.TINI_SYSTEM?.utils?.secureStorage?.get('userRole') || 
        (window.secureGetStorage && window.secureGetStorage('userRole') || localStorage.getItem('userRole'))),
        usersCount: JSON.parse((window.TINI_SYSTEM?.utils?.secureStorage?.get('usersData') || 
        (window.secureGetStorage && window.secureGetStorage('usersData') || localStorage.getItem('usersData'))) || '[]').length,
        advancedMode: (window.TINI_SYSTEM?.utils?.secureStorage?.get('advancedMode') || 
        (window.secureGetStorage && window.secureGetStorage('advancedMode') || localStorage.getItem('advancedMode'))) === 'true'
    };
    console.log('🔍 Enhanced Security Debug Summary:', status);
    alert(`🔍 Enhanced Security Debug Summary:\n\n✅ Integrated System: ${status.integratedSystem ? 'LOADED' : '❌ NOT LOADED'}\n✅ Admin Panel: ${status.adminPanel ? 'LOADED' : '❌ NOT LOADED'}  \n👤 User Role: ${status.userRole || 'NOT SET'}\n📊 Users Count: ${status.usersCount}\n🔧 Advanced Mode: ${status.advancedMode ? 'ENABLED' : 'DISABLED'}\n\n🆕 Enhanced with Advanced Mode & Debug Tools`);
    console.log("Check console for detailed output.");
// Ensure all open blocks are closed

// Make it globally available for external initialization
window.TINIAdminPanel = TINIAdminPanel;

// =================
// 🛡️ SECURITY SYSTEMS INTEGRATION
// =================

// Helper function to initialize security system
function initSecuritySystem(SystemClass, windowKey, systemName) {
    if (window[SystemClass]) {
        try {
            window[windowKey] = new window[SystemClass]();
            console.log(`✅ ${systemName} initialized`);
            return true;
        } catch (error) {
            console.error(`❌ Error initializing ${systemName}:`, error);
            return false;
        }
    } else {
        console.warn(`⚠️ ${SystemClass} not loaded`);
        return false;
    }
}

// Initialize Security Systems when available
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛡️ Initializing Security Systems Integration...');
    
    // Initialize all security systems
    initSecuritySystem('UltimateFortressSecurity', 'fortressSecurity', 'Fortress Security System');
    initSecuritySystem('SecureAuthenticationSystem', 'authSystem', 'TINI Authentication System');
    
    // 3. Initialize Anti-Automation Detector
    if (window.UltimateAntiAutomation) {
        try {
            window.antiAutomation = new UltimateAntiAutomation();
            console.log('✅ Anti-Automation Detector initialized');
        } catch (error) {
            console.error('❌ Error initializing Anti-Automation:', error);
        }
    } else {
        console.warn('⚠️ UltimateAntiAutomation not loaded');
    }
    
    // 4. Initialize Honeypot System
    if (window.AdvancedHoneypotSystem) {
        try {
            window.honeypotSystem = new AdvancedHoneypotSystem();
            console.log('✅ Advanced Honeypot System initialized');
        } catch (error) {
            console.error('❌ Error initializing Honeypot System:', error);
        }
    } else {
        console.warn('⚠️ AdvancedHoneypotSystem not loaded');
    }
    
    // 5. Initialize Integrated Employee System
    if (window.IntegratedEmployeeSystem) {
        try {
            window.integratedEmployeeSystem = new IntegratedEmployeeSystem();
            console.log('✅ Integrated Employee System initialized');
        } catch (error) {
            console.error('❌ Error initializing Employee System:', error);
        }
    } else {
        console.warn('⚠️ IntegratedEmployeeSystem not loaded');
    }
    
    // 6. Initialize Enhanced Device Security
    if (window.EnhancedDeviceSecurity) {
        try {
            window.deviceSecurity = new EnhancedDeviceSecurity();
            console.log('✅ Enhanced Device Security initialized');
        } catch (error) {
            console.error('❌ Error initializing Device Security:', error);
        }
    } else {
        console.warn('⚠️ EnhancedDeviceSecurity not loaded');
    }
    
    console.log('🛡️ Security Systems Integration completed');
    
    // Display security status
    setTimeout(() => {
        const securityStatus = {
            fortress: !!window.fortressSecurity,
            auth: !!window.authSystem, 
            antiAutomation: !!window.antiAutomation,
            honeypot: !!window.honeypotSystem,
            employee: !!window.integratedEmployeeSystem,
            device: !!window.deviceSecurity
        };
        // Đếm số hệ thống đã load thành công
        const loadedCount = Object.values(securityStatus).filter(Boolean).length;
        
        console.log(`Security Systems Status: ${loadedCount}/6 systems loaded`);
        console.log('   Fortress Security:', securityStatus.fortress ? '✅ ACTIVE' : '❌ INACTIVE');
        console.log('   Authentication:', securityStatus.auth ? '✅' : '❌');  
        console.log('   Anti-Automation:', securityStatus.antiAutomation ? '✅' : '❌');
        console.log('   Honeypot System:', securityStatus.honeypot ? '✅' : '❌');
        console.log('   Employee System:', securityStatus.employee ? '✅' : '❌');
        console.log('   Device Security:', securityStatus.device ? '✅' : '❌');
        
        if (loadedCount === 6) {
            console.log('🎯 ALL SECURITY SYSTEMS OPERATIONAL!');
        } else {
            console.warn(`⚠️ ${6 - loadedCount} security systems missing`);
        }
    }, 1000);
});

// =================
// 🔗 SYSTEM INTERCONNECTION
// =================

// Connect all systems together
function connectSecuritySystems() {
    console.log('🔗 Connecting security systems...');
    
    try {
        // Connect Fortress with Authentication
        if (window.fortressSecurity && window.authSystem) {
            window.fortressSecurity.authSystem = window.authSystem;
            window.authSystem.fortressSecurity = window.fortressSecurity;
            console.log('✅ Fortress ↔ Authentication connected');
        }
        
        // Connect Anti-Automation with Employee System
        if (window.antiAutomation && window.integratedEmployeeSystem) {
            window.antiAutomation.employeeSystem = window.integratedEmployeeSystem;
            window.integratedEmployeeSystem.antiAutomation = window.antiAutomation;
            console.log('✅ Anti-Automation ↔ Employee System connected');
        }
        
        // Connect Honeypot with Fortress
        if (window.honeypotSystem && window.fortressSecurity) {
            window.honeypotSystem.fortressSecurity = window.fortressSecurity;
            window.fortressSecurity.honeypotSystem = window.honeypotSystem;
            console.log('✅ Honeypot ↔ Fortress connected');
        }
        
        // Connect Device Security with all systems
        if (window.deviceSecurity) {
            if (window.authSystem) {
                window.deviceSecurity.authSystem = window.authSystem;
                window.authSystem.deviceSecurity = window.deviceSecurity;
                console.log('✅ Device Security ↔ Authentication connected');
            }
            
            if (window.integratedEmployeeSystem) {
                window.deviceSecurity.employeeSystem = window.integratedEmployeeSystem;
                window.integratedEmployeeSystem.deviceSecurity = window.deviceSecurity;
                console.log('✅ Device Security ↔ Employee System connected');
            }
        }
        
        console.log('🎯 Security systems interconnection completed!');
        
    } catch (error) {
        console.error('❌ Error connecting security systems:', error);
    }
}

    // ========================================
    // 🔒 GHOST SYSTEM INTEGRATION
    // ========================================
// Define GHOSTSystemIntegration class
class GHOSTSystemIntegration {
        constructor() {
            this.isInitialized = false;
            this.runtime = typeof chrome !== 'undefined' && chrome.runtime;
            this.statusCheckInterval = null;
            
            // Bind methods
            this.checkGHOSTStatus = this.checkGHOSTStatus.bind(this);
            this.toggleGHOSTMonitoring = this.toggleGHOSTMonitoring.bind(this);
            this.updateGHOSTUI = this.updateGHOSTUI.bind(this);
            this.getStatusClass = this.getStatusClass.bind(this);
            this.getStatusDisplayInfo = this.getStatusDisplayInfo.bind(this);
            this.addStatusAnimation = this.addStatusAnimation.bind(this);
            this.startStatusCheck = this.startStatusCheck.bind(this);
            this.stopStatusCheck = this.stopStatusCheck.bind(this);
        }

        async initGHOSTIntegration() {
        if (this.isInitialized) {
            console.warn('🔒 GHOST System already initialized');
            return;
        }

        console.log('🔒 Initializing GHOST System Integration...');
        
        try {
            // Check if running in Chrome extension environment
            if (this.runtime) {
                await this.setupGHOSTControls();
                await this.startStatusCheck();
                this.isInitialized = true;
                console.log('✅ GHOST System initialized successfully');
            } else {
                console.log('📋 GHOST System: Running in standalone mode');
            }
        } catch (error) {
            console.error('❌ GHOST Integration failed:', error.message);
            this.handleInitializationError(error);
        }
    }

    handleInitializationError(error) {
        // Cleanup any partial initialization
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
        }
        this.isInitialized = false;
        console.warn('⚠️ GHOST Integration warning:', error.message);
    }
    
    async setupGHOSTControls() {
        return new Promise((resolve, reject) => {
            try {
                // Add GHOST status section to dashboard
                const dashboardContent = document.querySelector('#dashboard-content .dashboard-stats');
                if (!dashboardContent) {
                    throw new Error('Dashboard content not found');
                }

                const ghostCard = this.createGhostCard();
                if (!ghostCard) {
                    throw new Error('Failed to create GHOST card');
                }

                dashboardContent.appendChild(ghostCard);
                this.setupEventListeners();
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    createGhostCard() {
        const ghostCard = document.createElement('div');
        ghostCard.className = 'card ghost-security-card';
        
        const content = document.createElement('div');
        content.innerHTML = `
                <div class="card-header">
                    <h3>🔒 GHOST Enterprise Security</h3>
                </div>
                <div class="card-content">
                    <div class="ghost-status">
                        <div class="status-indicator" id="ghost-status-indicator">
                            <span class="status-dot"></span>
                            <span id="ghost-status-text">Checking...</span>
                        </div>
                        <div class="ghost-controls">
                            <button id="ghost-toggle-btn" class="btn btn-secondary" disabled>
                                Toggle Monitoring
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            ghostCard.appendChild(content);
            
            // Add event listener
            const toggleBtn = ghostCard.querySelector('#ghost-toggle-btn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => this.toggleGHOSTMonitoring());
            }
            
            return ghostCard;
        }
    
    async checkGHOSTStatus() {
        try {
            if (!chrome.runtime) {
                console.log('📋 GHOST System: Chrome runtime not available');
                this.updateGHOSTUI({ ghostActive: false, monitoring: 'unavailable' });
                return;
            }

            // Add timeout for status check
            const statusPromise = new Promise((resolve) => {
                chrome.runtime.sendMessage(
                    { 
                        action: 'ghost_system_status',
                        timestamp: Date.now() 
                    },
                    (response) => {
                        if (response?.success) {
                            resolve(response);
                        } else {
                            resolve({ ghostActive: false, monitoring: 'error' });
                        }
                    }
                );
            });

            // Add timeout
            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ ghostActive: false, monitoring: 'timeout' });
                }, 5000);
            });

            const result = await Promise.race([statusPromise, timeoutPromise]);
            this.updateGHOSTUI(result);

        } catch (error) {
            console.warn('⚠️ GHOST Status check failed:', error);
            this.updateGHOSTUI({ ghostActive: false, monitoring: 'error' });
        }
    }
    
    toggleGHOSTMonitoring() {
        try {
            const statusText = document.getElementById('ghost-status-text');
            const toggleBtn = document.getElementById('ghost-toggle-btn');
            
            if (!statusText || !toggleBtn) {
                throw new Error('GHOST UI elements not found');
            }

            const currentStatus = statusText.textContent.includes('Active');
            
            // Disable button during toggle
            toggleBtn.disabled = true;
            toggleBtn.textContent = 'Updating...';
            
            chrome.runtime.sendMessage(
                { action: 'ghost_toggle_monitoring', enabled: !currentStatus },
                (response) => {
                    if (response?.success) {
                        console.log('🔒 GHOST Monitoring toggled:', response.result);
                        this.checkGHOSTStatus(); // Refresh status
                    } else {
                        console.error('❌ Failed to toggle GHOST monitoring');
                        // Revert button state
                        toggleBtn.disabled = false;
                        toggleBtn.textContent = 'Toggle Monitoring';
                    }
                }
            );
        } catch (error) {
            console.error('❌ GHOST Toggle failed:', error);
            // Update UI to show error state
            this.updateGHOSTUI({ ghostActive: false, monitoring: 'error' });
        }
    }
    
    updateGHOSTUI(status)
     {
        try {
            const indicator = document.getElementById('ghost-status-indicator');
            const statusText = document.getElementById('ghost-status-text');
            const toggleBtn = document.getElementById('ghost-toggle-btn');
            
            if (!indicator || !statusText || !toggleBtn) {
                console.error('❌ GHOST UI elements not found');
                return;
            }

            // Update indicator state
            const statusClass = this.getStatusClass(status);
            indicator.className = `status-indicator ${statusClass}`;

            // Get status display info
            const displayInfo = this.getStatusDisplayInfo(status);
            
            // Update status text and button
            statusText.textContent = displayInfo.text;
            toggleBtn.disabled = displayInfo.buttonDisabled;
            toggleBtn.textContent = displayInfo.buttonText;

            // Add visual feedback
            this.addStatusAnimation(indicator, statusClass);

            // Log status update
            console.log(`🔒 GHOST UI Updated: ${displayInfo.text} (${statusClass})`);
        } catch (error) {
            console.error('❌ Error updating GHOST UI:', error);
        }
    }

    getStatusClass(status) {
        if (status.ghostActive && status.monitoring === 'active') return 'active';
        if (status.monitoring === 'error') return 'error';
        if (status.monitoring === 'timeout') return 'timeout';
        if (status.monitoring === 'unavailable') return 'unavailable';
        return 'inactive';
    }

    getStatusDisplayInfo(status) {
        const displayMap = {
            active: {
                text: 'GHOST System Active',
                buttonText: 'Disable Monitoring',
                buttonDisabled: false
            },
            error: {
                text: 'System Error - Check Console',
                buttonText: 'System Error',
                buttonDisabled: true
            },
            timeout: {
                text: 'Connection Timeout',
                buttonText: 'Retry Connection',
                buttonDisabled: false
            },
            unavailable: {
                text: 'System Unavailable',
                buttonText: 'Check Installation',
                buttonDisabled: true
            },
            inactive: {
                text: 'GHOST System Inactive',
                buttonText: 'Enable Monitoring',
                buttonDisabled: false
            }
        };

        const statusType = this.getStatusClass(status);
        return displayMap[statusType];
    }

    addStatusAnimation(indicator, statusClass)
     {
        indicator.classList.add('status-update');
        setTimeout(() => {
            indicator.classList.remove('status-update');
        }, 1000);
    }
    // Helper methods for system integration
    startStatusCheck() {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
        }
        this.checkGHOSTStatus();
        this.statusCheckInterval = setInterval(this.checkGHOSTStatus, 30000);
    }

    stopStatusCheck() {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
    }
}

// Wrap everything in an IIFE to avoid global scope pollution
(function(window) {
    'use strict';
    
    // Initialize and connect all systems
    function initializeSecuritySystem() {
        document.addEventListener('DOMContentLoaded', async function() {
            try {
                console.log('🚀 Initializing security infrastructure...');
                
                // Create and initialize GHOST System
                const ghostSystem = new GHOSTSystemIntegration();
                window.ghostSystem = ghostSystem;
                await ghostSystem.initGHOSTIntegration();
                
                // Connect security systems with retry mechanism
                let retries = 0;
                const maxRetries = 3;
                
                async function tryConnectSystems() {
                    try {
                        await connectSecuritySystems();
                        console.log('✅ All systems connected successfully');
                    } catch (error) {
                        retries++;
                        if (retries < maxRetries) {
                            console.warn(`⚠️ Connection attempt ${retries} failed, retrying...`);
                            setTimeout(tryConnectSystems, 1500 * retries);
                        } else {
                            console.error('❌ Failed to connect security systems after multiple attempts');
                            if (window.adminPanel?.showNotification) {
                                window.adminPanel.showNotification(
                                    '❌ Security systems connection failed\nSome features may be limited',
                                    'error'
                                );
                            }
                        }
                    }
                }
                
                await tryConnectSystems();
                
            } catch (error) {
                console.error('❌ Critical initialization error:', error);
                if (window.adminPanel?.showNotification) {
                    window.adminPanel.showNotification(
                        '❌ Critical system initialization error\nPlease contact system administrator',
                        'error'
                    );
                }
            }
        });
    }

    // Export necessary functions and classes
    window.connectSecuritySystems = connectSecuritySystems;
    window.GHOSTSystemIntegration = GHOSTSystemIntegration;
    window.debugSecurity = debugSecurity;
    
    // Initialize
    initializeSecuritySystem();
})(window);
