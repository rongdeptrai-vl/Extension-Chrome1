// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
/**
 * TINI CRITICAL FIXES MODULE
 * Khắc phục 4 lỗi nghiêm trọng trong admin panel
 * 
 * LỖI 1: Tự ý nhảy sang tab khác
 * LỖI 2: Tải hình ảnh lên không được  
 * LỖI 3: Ngôn ngữ không thay đổi
 * LỖI 4: Chuyển thẳng tới admin panel khi đăng nhập
 */

class TINICriticalFixes {
    constructor() {
        this.navigationLocked = false;
        this.imageUploadFixed = false;
        this.languageSystemFixed = false;
        this.loginRedirectFixed = false;
        
        this.init();
    }

    init() {
        console.log('🚨 TINI Critical Fixes - Khắc phục 4 lỗi nghiêm trọng...');
        
        // Fix 1: Ngăn chặn tự động nhảy tab
        this.fixAutoNavigation();
        
        // Fix 2: Sửa upload hình ảnh
        this.fixImageUpload();
        
        // Fix 3: Sửa hệ thống ngôn ngữ  
        this.fixLanguageSystem();
        
        // Fix 4: Sửa login redirect
        this.fixLoginRedirect();
        
        // Monitor và ngăn chặn các lỗi tái phát
        this.setupErrorMonitoring();
        
        console.log('✅ Đã áp dụng tất cả critical fixes');
    }

    // ==========================================
    // FIX 1: NGĂN CHẶN TỰ ĐỘNG NHẢY TAB
    // ==========================================
    fixAutoNavigation() {
        console.log('🔧 Fix 1: Ngăn chặn tự động nhảy tab...');
        
        // Ghi đè tất cả setTimeout và setInterval có thể gây nhảy tab
        this.interceptTimers();
        
        // Ngăn chặn multiple navigation events
        this.preventMultipleNavigation();
        
        // Lock navigation trong thời gian ngắn sau mỗi click
        this.setupNavigationLock();
        
        console.log('✅ Fix 1: Navigation locking applied');
    }

    interceptTimers() {
        // Backup original functions
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        // Override setTimeout
        window.setTimeout = (callback, delay, ...args) => {
            // Kiểm tra nếu callback có chứa navigation code
            const callbackStr = callback.toString();
            if (callbackStr.includes('switchSection') || 
                callbackStr.includes('location.href') ||
                callbackStr.includes('redirect')) {
                console.log('🛡️ Blocked suspicious setTimeout:', callbackStr.substring(0, 100));
                return null;
            }
            return originalSetTimeout(callback, delay, ...args);
        };

        // Override setInterval  
        window.setInterval = (callback, delay, ...args) => {
            const callbackStr = callback.toString();
            if (callbackStr.includes('switchSection') || 
                callbackStr.includes('location.href') ||
                callbackStr.includes('redirect')) {
                console.log('🛡️ Blocked suspicious setInterval:', callbackStr.substring(0, 100));
                return null;
            }
            return originalSetInterval(callback, delay, ...args);
        };
    }

    preventMultipleNavigation() {
        let lastNavTime = 0;
        const minNavInterval = 500; // 500ms minimum between navigations
        
        // Override switchSection function
        if (window.tiniAdminPanel && window.tiniAdminPanel.switchSection) {
            const originalSwitchSection = window.tiniAdminPanel.switchSection.bind(window.tiniAdminPanel);
            
            window.tiniAdminPanel.switchSection = (sectionName) => {
                const now = Date.now();
                if (now - lastNavTime < minNavInterval) {
                    console.log('🛡️ Navigation throttled:', sectionName);
                    return;
                }
                
                if (this.navigationLocked) {
                    console.log('🔒 Navigation locked, ignoring:', sectionName);
                    return;
                }
                
                lastNavTime = now;
                this.navigationLocked = true;
                
                // Execute original function
                originalSwitchSection(sectionName);
                
                // Unlock after short delay
                setTimeout(() => {
                    this.navigationLocked = false;
                }, 300);
            };
        }
    }

    setupNavigationLock() {
        // Lock navigation after any click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                this.navigationLocked = true;
                setTimeout(() => {
                    this.navigationLocked = false;
                }, 500);
            }
        });
    }

    // ==========================================
    // FIX 2: SỬA UPLOAD HÌNH ẢNH
    // ==========================================
    fixImageUpload() {
        console.log('🔧 Fix 2: Sửa upload hình ảnh...');
        
        // Wait for DOM to be ready
        setTimeout(() => {
            this.setupImageUploadHandlers();
        }, 1000);
    }

    setupImageUploadHandlers() {
        // Find all upload buttons
        const uploadButtons = document.querySelectorAll('button[onclick*="upload"], button:contains("Upload"), .upload-btn');
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        console.log(`🖼️ Found ${uploadButtons.length} upload buttons and ${fileInputs.length} file inputs`);
        
        // Fix upload buttons
        uploadButtons.forEach((btn, index) => {
            // Remove any existing onclick
            btn.removeAttribute('onclick');
            
            // Add proper click handler
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`📤 Upload button ${index} clicked`);
                this.triggerFileUpload(btn);
            });
        });
        
        // Fix file inputs
        fileInputs.forEach((input, index) => {
            input.addEventListener('change', (e) => {
                console.log(`📁 File input ${index} changed`);
                this.handleFileSelection(e.target);
            });
        });
        
        // Create hidden file input if none exists
        if (fileInputs.length === 0) {
            this.createFileInput();
        }
        
        this.imageUploadFixed = true;
        console.log('✅ Fix 2: Image upload handlers setup complete');
    }

    triggerFileUpload(button) {
        // Find associated file input
        let fileInput = button.parentElement.querySelector('input[type="file"]');
        
        if (!fileInput) {
            // Create temporary file input
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            button.parentElement.appendChild(fileInput);
            
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target);
            });
        }
        
        fileInput.click();
    }

    handleFileSelection(input) {
        const file = input.files[0];
        if (!file) return;
        
        console.log(`📸 File selected:`, {
            name: file.name,
            size: file.size,
            type: file.type
        });
        
        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showNotification('❌ Vui lòng chọn file hình ảnh', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showNotification('❌ File quá lớn. Tối đa 5MB', 'error');
            return;
        }
        
        // Process image
        this.processImageFile(file, input);
    }

    processImageFile(file, input) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageData = e.target.result;
            console.log('✅ Image loaded successfully');
            
            // Find avatar/image display element
            this.updateImageDisplay(imageData, input);
            
            // Save to storage
            this.saveImageData(imageData);
            
            this.showNotification('✅ Hình ảnh đã được tải lên thành công!', 'success');
        };
        
        reader.onerror = () => {
            console.error('❌ Error reading file');
            this.showNotification('❌ Lỗi khi đọc file hình ảnh', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    updateImageDisplay(imageData, input) {
        // Find profile image elements
        const avatarElements = [
            document.querySelector('.profile-avatar img'),
            document.querySelector('.avatar img'),
            document.querySelector('.profile-image'),
            document.querySelector('[class*="avatar"]'),
            document.querySelector('[class*="profile"]')
        ].filter(el => el);
        
        avatarElements.forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = imageData;
            } else {
                el.style.backgroundImage = `url(${imageData})`;
            }
        });
        
        console.log(`🖼️ Updated ${avatarElements.length} image displays`);
    }

    saveImageData(imageData) {
        try {
            localStorage.setItem('tini_admin_avatar', imageData);
            console.log('💾 Image saved to localStorage');
        } catch (error) {
            console.error('❌ Error saving image:', error);
        }
    }

    createFileInput() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.id = 'hidden-file-input';
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target);
        });
        
        console.log('📁 Created hidden file input');
    }

    // ==========================================
    // FIX 3: SỬA HỆ THỐNG NGÔN NGỮ
    // ==========================================
    fixLanguageSystem() {
        console.log('🔧 Fix 3: Sửa hệ thống ngôn ngữ...');
        
        // Override language functions
        this.fixLanguageSelection();
        this.fixLanguageApplication();
        this.setupLanguageDropdowns();
        
        this.languageSystemFixed = true;
        console.log('✅ Fix 3: Language system fixed');
    }

    fixLanguageApplication() {
        console.log('🌐 Fixing language application system...');
        
        // Create a robust language application system
        if (!this.languageApplicationFixed) {
            this.languageApplicationFixed = true;
            
            // Setup auto-translation observer
            this.setupLanguageObserver();
            
            // Apply current language
            const currentLang = localStorage.getItem('tini_admin_language') || 'en';
            setTimeout(() => {
                this.applyLanguage(currentLang);
            }, 500);
        }
    }

    setupLanguageObserver() {
        // Watch for new elements being added to DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Apply translation to new elements
                            const currentLang = localStorage.getItem('tini_admin_language') || 'en';
                            this.translateElement(node, currentLang);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    translateElement(element, languageCode) {
        const translations = this.getTranslations(languageCode);
        
        // Translate the element itself
        if (element.hasAttribute && element.hasAttribute('data-i18n')) {
            const key = element.getAttribute('data-i18n');
            const translation = translations[key];
            if (translation) {
                element.textContent = translation;
            }
        }
        
        // Translate child elements
        if (element.querySelectorAll) {
            element.querySelectorAll('[data-i18n]').forEach(child => {
                const key = child.getAttribute('data-i18n');
                const translation = translations[key];
                if (translation) {
                    child.textContent = translation;
                }
            });
        }
    }

    fixLanguageSelection() {
        // Find language selectors
        setTimeout(() => {
            const languageSelects = document.querySelectorAll('select[class*="language"], #languageSelect, .language-select');
            
            languageSelects.forEach((select, index) => {
                console.log(`🌐 Setting up language select ${index}`);
                
                // Clear existing options
                select.innerHTML = '';
                
                // Add language options
                const languages = [
                    { code: 'en', name: 'English', flag: '🇺🇸' },
                    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
                    { code: 'zh', name: '中文', flag: '🇨🇳' },
                    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
                    { code: 'ko', name: '한국어', flag: '🇰🇷' }
                ];
                
                languages.forEach(lang => {
                    const option = document.createElement('option');
                    option.value = lang.code;
                    option.textContent = `${lang.flag} ${lang.name}`;
                    select.appendChild(option);
                });
                
                // Set current language
                const currentLang = localStorage.getItem('tini_admin_language') || 'en';
                select.value = currentLang;
                
                // Add change handler
                select.addEventListener('change', (e) => {
                    const newLang = e.target.value;
                    console.log(`🌐 Language changed to: ${newLang}`);
                    this.changeLanguage(newLang);
                });
            });
        }, 1500);
    }

    changeLanguage(languageCode) {
        console.log(`🌐 Changing language to: ${languageCode}`);
        
        // Save to storage
        localStorage.setItem('tini_admin_language', languageCode);
        
        // Apply immediately
        this.applyLanguage(languageCode);
        
        // Force refresh language system
        if (window.tiniLanguageSystem) {
            window.tiniLanguageSystem.currentLanguage = languageCode;
            window.tiniLanguageSystem.autoTranslatePage();
        }
        
        // Custom translation
        this.translatePageElements(languageCode);
        
        this.showNotification(`🌐 Đã chuyển sang ngôn ngữ: ${languageCode}`, 'success');
    }

    applyLanguage(languageCode) {
        // Get translations
        const translations = this.getTranslations(languageCode);
        
        // Apply to elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = translations[key];
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Apply to elements with data-translate
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = translations[key];
            if (translation) {
                element.textContent = translation;
            }
        });
    }

    getTranslations(languageCode) {
        // Basic translations for immediate use
        const translations = {
            'en': {
                dashboard: 'Dashboard',
                users: 'Users',
                profile: 'Profile',
                security: 'Security',
                settings: 'Settings',
                analytics: 'Analytics',
                reports: 'Reports',
                logout: 'Logout',
                save_changes: 'Save Changes',
                upload_image: 'Upload Image',
                full_name: 'Full Name',
                email_address: 'Email Address',
                employee_id: 'Employee ID'
            },
            'vi': {
                dashboard: 'Bảng Điều Khiển',
                users: 'Người Dùng',
                profile: 'Hồ Sơ',
                security: 'Bảo Mật',
                settings: 'Cài Đặt',
                analytics: 'Phân Tích',
                reports: 'Báo Cáo',
                logout: 'Đăng Xuất',
                save_changes: 'Lưu Thay Đổi',
                upload_image: 'Tải Lên Hình',
                full_name: 'Họ Tên',
                email_address: 'Địa Chỉ Email',
                employee_id: 'Mã Nhân Viên'
            },
            'zh': {
                dashboard: '仪表板',
                users: '用户',
                profile: '个人资料',
                security: '安全',
                settings: '设置',
                analytics: '分析',
                reports: '报告',
                logout: '登出',
                save_changes: '保存更改',
                upload_image: '上传图片',
                full_name: '全名',
                email_address: '电子邮件地址',
                employee_id: '员工ID'
            },
            'hi': {
                dashboard: 'डैशबोर्ड',
                users: 'उपयोगकर्ता',
                profile: 'प्रोफ़ाइल',
                security: 'सुरक्षा',
                settings: 'सेटिंग्स',
                analytics: 'विश्लेषण',
                reports: 'रिपोर्ट',
                logout: 'लॉग आउट',
                save_changes: 'परिवर्तन सहेजें',
                upload_image: 'छवि अपलोड करें',
                full_name: 'पूरा नाम',
                email_address: 'ईमेल पता',
                employee_id: 'कर्मचारी आईडी'
            },
            'ko': {
                dashboard: '대시보드',
                users: '사용자',
                profile: '프로필',
                security: '보안',
                settings: '설정',
                analytics: '분석',
                reports: '보고서',
                logout: '로그아웃',
                save_changes: '변경사항 저장',
                upload_image: '이미지 업로드',
                full_name: '전체 이름',
                email_address: '이메일 주소',
                employee_id: '직원 ID'
            }
        };
        
        return translations[languageCode] || translations['en'];
    }

    translatePageElements(languageCode) {
        const translations = this.getTranslations(languageCode);
        
        // Translate navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            const section = link.getAttribute('data-section');
            if (translations[section]) {
                const textElement = link.querySelector('.nav-text, span');
                if (textElement) {
                    textElement.textContent = translations[section];
                }
            }
        });
        
        // Translate buttons
        document.querySelectorAll('button').forEach(button => {
            const text = button.textContent.trim().toLowerCase();
            if (text.includes('save') && translations.save_changes) {
                button.textContent = translations.save_changes;
            }
            if (text.includes('upload') && translations.upload_image) {
                button.textContent = translations.upload_image;
            }
        });
    }

    setupLanguageDropdowns() {
        // Ensure all language dropdowns are populated
        setTimeout(() => {
            const selects = document.querySelectorAll('select');
            selects.forEach(select => {
                if (select.closest('[class*="language"]') || select.id.includes('language')) {
                    if (select.options.length === 0) {
                        this.populateLanguageSelect(select);
                    }
                }
            });
        }, 2000);
    }

    populateLanguageSelect(select) {
        const languages = [
            { code: 'en', name: 'English' },
            { code: 'vi', name: 'Tiếng Việt' },
            { code: 'zh', name: '中文' },
            { code: 'hi', name: 'हिन्दी' },
            { code: 'ko', name: '한국어' }
        ];
        
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            select.appendChild(option);
        });
        
        const currentLang = localStorage.getItem('tini_admin_language') || 'en';
        select.value = currentLang;
    }

    // ==========================================
    // FIX 4: SỬA LOGIN REDIRECT
    // ==========================================
    fixLoginRedirect() {
        console.log('🔧 Fix 4: Sửa login redirect...');
        
        // Override window.open calls
        this.interceptWindowOpen();
        
        // Fix popup admin buttons
        this.fixPopupAdminButtons();
        
        this.loginRedirectFixed = true;
        console.log('✅ Fix 4: Login redirect fixed');
    }

    interceptWindowOpen() {
        const originalWindowOpen = window.open;
        
        window.open = (url, target, features) => {
            // Check if trying to open admin panel automatically
            if (url && url.includes('admin') && url.includes('localhost')) {
                console.log('🛡️ Blocked automatic admin panel redirect:', url);
                
                // Instead show notification
                this.showNotification('🔐 Admin panel không tự động mở. Vui lòng click button để truy cập.', 'info');
                return null;
            }
            
            return originalWindowOpen(url, target, features);
        };
    }

    fixPopupAdminButtons() {
        // Find admin buttons in popup and fix them
        setTimeout(() => {
            const adminButtons = document.querySelectorAll('button[onclick*="admin"], [onclick*="admin-panel"]');
            
            adminButtons.forEach(button => {
                // Remove auto-open onclick
                button.removeAttribute('onclick');
                
                // Add proper click handler
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Show confirmation instead of auto-open
                    if (confirm('Bạn có muốn mở Admin Panel không?')) {
                        window.open('http://localhost:8099', '_blank');
                    }
                });
            });
            
            console.log(`🔧 Fixed ${adminButtons.length} admin buttons`);
        }, 1000);
    }

    // ==========================================
    // ERROR MONITORING & UTILITIES
    // ==========================================
    setupErrorMonitoring() {
        // Monitor for errors and auto-fix
        window.addEventListener('error', (e) => {
            if (e.message.includes('switchSection') || e.message.includes('navigation')) {
                console.log('🛡️ Navigation error detected, applying fix...');
                this.fixAutoNavigation();
            }
        });
        
        // Periodic health check
        setInterval(() => {
            this.healthCheck();
        }, 30000); // Check every 30 seconds
    }

    healthCheck() {
        const issues = [];
        
        if (!this.navigationLocked === undefined) issues.push('Navigation lock');
        if (!this.imageUploadFixed) issues.push('Image upload');
        if (!this.languageSystemFixed) issues.push('Language system');
        if (!this.loginRedirectFixed) issues.push('Login redirect');
        
        if (issues.length > 0) {
            console.log('🔧 Re-applying fixes for:', issues);
            this.init();
        }
    }

    showNotification(message, type = 'info') {
        // Use main admin panel notification if available
        if (window.tiniAdminPanel && window.tiniAdminPanel.showNotification) {
            window.tiniAdminPanel.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`📢 ${type.toUpperCase()}: ${message}`);
            
            // Simple toast notification
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#ff3d71' : type === 'success' ? '#00e676' : '#00f0ff'};
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                z-index: 10000;
                font-weight: bold;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }

    // Test all fixes
    testAllFixes() {
        console.log('🧪 Testing all critical fixes...');
        
        setTimeout(() => {
            console.log('🧪 Testing navigation lock...');
            if (window.tiniAdminPanel) {
                window.tiniAdminPanel.switchSection('users');
                window.tiniAdminPanel.switchSection('profile'); // Should be blocked
            }
        }, 1000);
        
        setTimeout(() => {
            console.log('🧪 Testing image upload...');
            const uploadBtn = document.querySelector('button:contains("Upload"), .upload-btn');
            if (uploadBtn) uploadBtn.click();
        }, 3000);
        
        setTimeout(() => {
            console.log('🧪 Testing language change...');
            this.changeLanguage('vi');
        }, 5000);
        
        setTimeout(() => {
            console.log('🧪 Testing language change back...');
            this.changeLanguage('en');
        }, 7000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.tiniCriticalFixes = new TINICriticalFixes();
        }, 2000);
    });
} else {
    setTimeout(() => {
        window.tiniCriticalFixes = new TINICriticalFixes();
    }, 2000);
}

// Export for global access
window.TINICriticalFixes = TINICriticalFixes;

console.log('🚨 TINI Critical Fixes Module loaded');
console.log('   Use: window.tiniCriticalFixes.testAllFixes() to test all fixes');
