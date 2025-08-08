// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Interactive Elements Handler for Admin Panel
console.log('🎮 [INTERACTIVE] Interactive Elements Handler Loading...');

class AdminPanelInteractiveElements {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupInteractiveElements());
        } else {
            this.setupInteractiveElements();
        }
    }

    setupInteractiveElements() {
        console.log('🎮 [INTERACTIVE] Setting up interactive elements...');
        
        // Setup dropdowns
        this.setupDropdowns();
        
        // Setup checkboxes
        this.setupCheckboxes();
        
        // Setup input fields
        this.setupInputFields();
        
        // Setup modals and popovers
        this.setupModals();
        
        // Setup tooltips
        this.setupTooltips();
        
        console.log('✅ [INTERACTIVE] All interactive elements setup complete');
    }

    setupDropdowns() {
        console.log('📋 [INTERACTIVE] Setting up dropdowns...');
        
        // Language dropdowns
        const languageSelects = document.querySelectorAll('#language, #languageSelect, select[id*="language"]');
        languageSelects.forEach(select => {
            // Populate language options if empty
            if (select.children.length === 0) {
                this.populateLanguageOptions(select);
            }
            
            select.addEventListener('change', (e) => {
                const selectedLang = e.target.value;
                console.log(`🌍 [INTERACTIVE] Language changed to: ${selectedLang}`);
                this.handleLanguageChange(selectedLang);
            });
        });

        // Theme dropdowns
        const themeSelects = document.querySelectorAll('#theme, select[id*="theme"]');
        themeSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const selectedTheme = e.target.value;
                console.log(`🎨 [INTERACTIVE] Theme changed to: ${selectedTheme}`);
                this.handleThemeChange(selectedTheme);
            });
        });

        // Timezone dropdowns
        const timezoneSelects = document.querySelectorAll('#timezone, select[id*="timezone"]');
        timezoneSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const selectedTimezone = e.target.value;
                console.log(`🕐 [INTERACTIVE] Timezone changed to: ${selectedTimezone}`);
                this.handleTimezoneChange(selectedTimezone);
            });
        });

        // Model selector for advanced mode
        const modelSelector = document.getElementById('modelSelector');
        if (modelSelector) {
            // Populate model options
            const models = ['GPT-4', 'GPT-3.5', 'Claude', 'Gemini'];
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.toLowerCase();
                option.textContent = model;
                modelSelector.appendChild(option);
            });

            modelSelector.addEventListener('change', (e) => {
                const selectedModel = e.target.value;
                console.log(`🤖 [INTERACTIVE] Model changed to: ${selectedModel}`);
                this.showNotification(`🤖 Model changed to: ${selectedModel}`, 'info');
            });
        }
    }

    setupCheckboxes() {
        console.log('☑️ [INTERACTIVE] Setting up checkboxes...');
        
        // Notification checkboxes
        const notificationCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        notificationCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const label = e.target.closest('label');
                const setting = label ? label.textContent.trim() : 'Unknown setting';
                const isEnabled = e.target.checked;
                
                console.log(`☑️ [INTERACTIVE] ${setting}: ${isEnabled ? 'enabled' : 'disabled'}`);
                this.handleCheckboxChange(setting, isEnabled);
            });
        });
    }

    setupInputFields() {
        console.log('📝 [INTERACTIVE] Setting up input fields...');
        
        // Profile input fields
        const profileInputs = document.querySelectorAll('#fullName, #email, #employeeId');
        profileInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const fieldName = e.target.id;
                const value = e.target.value;
                console.log(`📝 [INTERACTIVE] ${fieldName} changed: ${value}`);
            });

            input.addEventListener('blur', (e) => {
                this.validateInput(e.target);
            });
        });

        // Search inputs (if any)
        const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search"], input[placeholder*="tìm"]');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length > 2) {
                    this.handleSearch(query);
                }
            });
        });

        // Number inputs
        const numberInputs = document.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                const min = parseInt(e.target.min) || 0;
                const max = parseInt(e.target.max) || 999;
                
                if (value < min || value > max) {
                    this.showNotification(`⚠️ Giá trị phải từ ${min} đến ${max}`, 'warning');
                    e.target.value = Math.max(min, Math.min(max, value));
                }
            });
        });
    }

    setupModals() {
        console.log('🪟 [INTERACTIVE] Setting up modals...');
        
        // Create modal container if not exists
        if (!document.getElementById('modalContainer')) {
            const modalContainer = document.createElement('div');
            modalContainer.id = 'modalContainer';
            modalContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
                display: none;
                justify-content: center;
                align-items: center;
            `;
            document.body.appendChild(modalContainer);
        }
    }

    setupTooltips() {
        console.log('💬 [INTERACTIVE] Setting up tooltips...');
        
        // Add tooltips to buttons with title attributes
        const tooltipElements = document.querySelectorAll('[title]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.title);
            });

            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    // Event Handlers
    handleLanguageChange(language) {
        localStorage.setItem('tini_admin_language', language);
        this.showNotification(`🌍 Đã chuyển sang: ${this.getLanguageName(language)}`, 'success');
        
        // Apply language change immediately
        this.applyLanguageChange(language);
        
        // Apply language change if critical fixes is available
        if (window.tiniCriticalFixes && window.tiniCriticalFixes.changeLanguage) {
            window.tiniCriticalFixes.changeLanguage(language);
        }
    }

    populateLanguageOptions(select) {
        const languages = [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
            { code: 'zh', name: '中文', flag: '🇨🇳' },
            { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
            { code: 'ko', name: '한국어', flag: '🇰🇷' }
        ];
        
        select.innerHTML = ''; // Clear existing options
        
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = `${lang.flag} ${lang.name}`;
            select.appendChild(option);
        });
        
        // Set current language
        const currentLang = localStorage.getItem('tini_admin_language') || 'en';
        select.value = currentLang;
    }

    getLanguageName(code) {
        const languages = {
            'en': 'English',
            'vi': 'Tiếng Việt', 
            'zh': '中文',
            'hi': 'हिन्दी',
            'ko': '한국어'
        };
        return languages[code] || code;
    }

    applyLanguageChange(languageCode) {
        console.log(`🌍 [INTERACTIVE] Applying language: ${languageCode}`);
        
        // Get translations for the language
        const translations = this.getTranslations(languageCode);
        
        // Apply to elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email')) {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });
        
        // Apply to elements with data-translate attributes  
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
        
        // Update page title
        document.title = translations['admin_dashboard_title'] || 'TINI Admin Dashboard';
        
        console.log(`✅ [INTERACTIVE] Language applied: ${languageCode}`);
    }

    getTranslations(languageCode) {
        const translations = {
            'en': {
                'admin_dashboard_title': 'TINI Admin Dashboard',
                'nav_dashboard': 'Dashboard',
                'nav_users': 'Users',
                'nav_profile': 'Profile', 
                'nav_security': 'Security',
                'nav_settings': 'Settings',
                'nav_analytics': 'Analytics',
                'nav_reports': 'Reports',
                'logout': 'Logout',
                'admin_user': 'Administrator User',
                'super_admin': 'Super Administrator',
                'add_user': 'Add User',
                'save_changes': 'Save Changes',
                'upload_image': 'Upload Image',
                'save_avatar': 'Save Avatar'
            },
            'vi': {
                'admin_dashboard_title': 'Bảng Điều Khiển TINI',
                'nav_dashboard': 'Tổng Quan',
                'nav_users': 'Người Dùng',
                'nav_profile': 'Hồ Sơ',
                'nav_security': 'Bảo Mật', 
                'nav_settings': 'Cài Đặt',
                'nav_analytics': 'Phân Tích',
                'nav_reports': 'Báo Cáo',
                'logout': 'Đăng Xuất',
                'admin_user': 'Quản Trị Viên',
                'super_admin': 'Quản Trị Viên Cấp Cao',
                'add_user': 'Thêm Người Dùng',
                'save_changes': 'Lưu Thay Đổi',
                'upload_image': 'Tải Ảnh Lên',
                'save_avatar': 'Lưu Avatar'
            },
            'zh': {
                'admin_dashboard_title': 'TINI 管理仪表板',
                'nav_dashboard': '仪表板',
                'nav_users': '用户',
                'nav_profile': '档案',
                'nav_security': '安全',
                'nav_settings': '设置', 
                'nav_analytics': '分析',
                'nav_reports': '报告',
                'logout': '登出',
                'admin_user': '管理员用户',
                'super_admin': '超级管理员',
                'add_user': '添加用户',
                'save_changes': '保存更改',
                'upload_image': '上传图片',
                'save_avatar': '保存头像'
            }
        };
        
        return translations[languageCode] || translations['en'];
    }

    handleThemeChange(theme) {
        localStorage.setItem('tini_admin_theme', theme);
        this.showNotification(`🎨 Đã chuyển theme: ${theme}`, 'success');
        
        // Apply theme changes to CSS variables
        const root = document.documentElement;
        switch(theme) {
            case 'light':
                root.style.setProperty('--bg-dark', '#ffffff');
                root.style.setProperty('--text', '#000000');
                break;
            case 'dark':
                root.style.setProperty('--bg-dark', '#1a1a1a');
                root.style.setProperty('--text', '#ffffff');
                break;
        }
    }

    handleTimezoneChange(timezone) {
        localStorage.setItem('tini_admin_timezone', timezone);
        this.showNotification(`🕐 Đã đặt múi giờ: ${timezone}`, 'success');
    }

    handleCheckboxChange(setting, isEnabled) {
        const settingKey = `tini_admin_${setting.toLowerCase().replace(/\s+/g, '_')}`;
        localStorage.setItem(settingKey, isEnabled);
        
        this.showNotification(
            `☑️ ${setting}: ${isEnabled ? 'Bật' : 'Tắt'}`,
            isEnabled ? 'success' : 'info'
        );
    }

    validateInput(input) {
        const value = input.value.trim();
        const isValid = this.isValidInput(input.type, value);
        
        if (!isValid) {
            input.style.borderColor = '#ef4444';
            this.showNotification(`⚠️ ${input.id}: Dữ liệu không hợp lệ`, 'warning');
        } else {
            input.style.borderColor = '';
        }
        
        return isValid;
    }

    isValidInput(type, value) {
        switch(type) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'text':
                return value.length > 0;
            case 'number':
                return !isNaN(value) && value !== '';
            default:
                return true;
        }
    }

    handleSearch(query) {
        console.log(`🔍 [INTERACTIVE] Search: ${query}`);
        this.showNotification(`🔍 Tìm kiếm: ${query}`, 'info');
    }

    showModal(title, content, actions = []) {
        const modalContainer = document.getElementById('modalContainer');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div style="
                background: var(--bg-dark);
                border-radius: 12px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            ">
                <h2 style="margin: 0 0 16px 0; color: var(--text);">${title}</h2>
                <div style="color: var(--text-secondary); margin-bottom: 20px;">${content}</div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    ${actions.map(action => `
                        <button onclick="${action.onClick}" style="
                            padding: 8px 16px;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            background: ${action.type === 'primary' ? 'var(--accent)' : '#6b7280'};
                            color: white;
                        ">${action.text}</button>
                    `).join('')}
                    <button onclick="this.closest('#modalContainer').style.display='none'" style="
                        padding: 8px 16px;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        cursor: pointer;
                        background: transparent;
                        color: var(--text);
                    ">Đóng</button>
                </div>
            </div>
        `;

        modalContainer.style.display = 'flex';
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.id = 'customTooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 10001;
            pointer-events: none;
            white-space: nowrap;
        `;
        tooltip.textContent = text;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    }

    hideTooltip() {
        const tooltip = document.getElementById('customTooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    showNotification(message, type = 'info') {
        // Use the same notification system as button handlers
        if (window.adminPanelButtons && window.adminPanelButtons.showNotification) {
            window.adminPanelButtons.showNotification(message, type);
        } else {
            console.log(`🔔 [INTERACTIVE] ${type}: ${message}`);
        }
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminPanelInteractive = new AdminPanelInteractiveElements();
    });
} else {
    window.adminPanelInteractive = new AdminPanelInteractiveElements();
}

// Export for global access
window.AdminPanelInteractiveElements = AdminPanelInteractiveElements;
