// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 55548f4 | Time: 2025-08-08T06:33:01Z
// Watermark: TINI_1754634781_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// TINI Advanced I18n System
// Multi-language support for Admin Panel

class TINI_I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.supportedLanguages = ['en', 'vi', 'zh', 'hi', 'ko'];
        
        this.init();
    }

    init() {
        this.loadTranslations();
        this.detectLanguage();
        this.setupLanguageObserver();
        
        console.log('🌍 [I18N] Multi-language system initialized');
    }

    loadTranslations() {
        // English (Default)
        this.translations.en = {
            // Navigation
            nav_dashboard: "Dashboard",
            nav_users: "Users", 
            nav_profile: "Profile",
            nav_security: "Security",
            nav_settings: "Settings",
            nav_analytics: "Analytics",
            nav_reports: "Reports",
            logout: "Logout",
            testing_zone: "Testing Zone",
            
            // Dashboard Headers & Titles
            admin_dashboard_title: "TINI Admin Dashboard",
            super_admin: "Super Administrator",
            welcome_back: "Welcome Back",
            header_title: "Dashboard",
            
            // Dashboard Stats
            active_users: "Active Users",
            blocked_items: "Blocked Items",
            system_health: "System Health",
            new_this_week: "12.5% new this week",
            from_yesterday: "0.1% from yesterday",
            minutes_ago_2: "2 minutes ago",
            minutes_ago_15: "15 minutes ago",
            hour_ago: "1 hour ago",
            hours_ago_2: "2 hours ago",
            hours_ago_3: "3 hours ago",
            just_now: "Just now",
            
            // Dashboard Activity Table
            recent_activity_title: "Recent Activity",
            view_all: "View All",
            table_user: "User",
            table_action: "Action",
            table_version: "Version",
            table_time: "Time",
            table_status: "Status",
            switched_to_power: "Switched to POWER",
            login_attempt: "Login attempt",
            updated_settings: "Updated settings",
            device_registration: "Device registration",
            active: "Active",
            failed: "Failed",
            completed: "Completed",
            pending: "Pending",
            inactive: "Inactive",
            
            // Testing Zone
            bypass_testing_zone: "BYPASS TESTING ZONE",
            admin_safe_environment: "🔒 100% Admin Safe Environment",
            admin_notification: "💻 Admin Notification:",
            admin_notification_text: "Don't worry anymore! I have created this super secure testing bypass environment for administrators. Here, administrators can test bypasses and will never be 'stuck' or blocked. Everything is protected by BOSS permission level 10000!",
            absolute_safety_guarantee: "Absolute Safety Guarantee",
            admin_cannot_be_blocked: "Admin cannot be blocked in this environment",
            all_bypass_systems_integrated: "All bypass systems inherited and integrated",
            boss_protection_highest_level: "BOSS protection always operates at the highest level",
            emergency_rescue_ready: "Emergency rescue ready if any problems arise",
            bypass_systems_status: "BYPASS SYSTEMS STATUS",
            all_ready: "ALL READY",
            
            // User Management
            user_management: "User Management",
            user_management_title: "User Management",
            add_user_btn: "Add User",
            add_user: "Add User",
            employee_id: "Employee ID",
            employee_id_col: "Employee ID",
            name: "Name",
            name_col: "Name",
            role: "Role",
            role_col: "Role",
            last_active: "Last Active",
            last_active_col: "Last Active",
            devices: "Devices",
            devices_col: "Devices",
            actions: "Actions",
            actions_col: "Actions",
            admin_user: "Administrator User",
            regular_user: "Regular User",
            employee_user_3: "PanVuong Employee",
            admin: "Admin",
            user: "User",
            employee: "Employee",
            manager: "Manager",
            total_users: "Total Users",
            active_sessions: "Active Sessions",
            admin_users: "Admin Users",
            new_this_week_users: "1 new this week",
            active_rate: "66% active rate",
            super_admin_level: "Super admin level",
            
            // Profile Settings
            profile_settings: "Profile Settings",
            avatar_cover: "Avatar & Cover",
            avatar: "Avatar",
            personal_info: "Personal Information",
            full_name: "Full Name",
            email: "Email Address",
            save_changes: "Save Changes",
            preferences: "Preferences & Settings",
            language: "🌍 Language",
            timezone: "Time Zone",
            theme: "Theme Preference",
            upload_image: "Upload Image",
            save_avatar: "Save Avatar",
            
            // Security Settings
            security_settings: "Security Settings",
            threat_level: "Threat Level",
            blocked_threats: "Blocked Threats",
            security_score: "Security Score",
            all_systems_secure: "All systems secure",
            from_last_week: "from last week",
            excellent_security: "Excellent security",
            
            // System Settings
            system_settings: "System Settings",
            general_settings: "General Settings",
            application_settings: "Application Settings",
            performance_settings: "Performance Settings",
            enable_auto_updates: "Enable auto-updates",
            enable_telemetry: "Enable telemetry",
            hardware_acceleration: "Hardware acceleration",
            debug_mode: "Debug mode",
            
            // Analytics & Reports
            analytics_insights: "Analytics & Insights",
            page_views: "Page Views",
            blocked_ads: "Blocked Ads",
            performance_score: "Performance Score",
            increase: "increase",
            excellent: "Excellent",
            reports_analytics: "Reports & Logs",
            generate_reports: "Generate Reports",
            generate_report: "Generate Report",
            security_report: "Security Report",
            usage_report: "Usage Report",
            system_report: "System Report",
            security_analysis: "Generate comprehensive security analysis",
            usage_analysis: "Analyze user activity and statistics",
            system_analysis: "Generate system performance report",
            
            // Form Actions & Buttons
            save: "Save",
            edit: "Edit",
            delete: "Delete",
            cancel: "Cancel",
            confirm: "Confirm",
            close: "Close",
            open: "Open",
            refresh: "Refresh",
            search: "Search",
            filter: "Filter",
            export: "Export",
            import: "Import",
            
            // Status Messages
            loading: "Loading...",
            saving: "Saving...",
            saved: "Saved successfully",
            error: "Error occurred",
            success: "Success",
            warning: "Warning",
            info: "Information",
            
            // Additional missing keys
            enable_notifications: "Enable notifications",
            enable_auto_save: "Auto-save settings",
            low: "LOW",
            medium: "MEDIUM",
            high: "HIGH",
            critical: "CRITICAL",
            
            // Common button text
            upload: "Upload",
            download: "Download",
            copy: "Copy",
            paste: "Paste",
            cut: "Cut",
            undo: "Undo",
            redo: "Redo",
            select_all: "Select All",
            
            // Status and results
            no_results: "No results found",
            empty_state: "No data available",
            connection_error: "Connection error",
            server_error: "Server error",
            permission_denied: "Permission denied",
            access_denied: "Access denied",
            file_not_found: "File not found",
            invalid_input: "Invalid input",
            
            // Confirmation messages
            are_you_sure: "Are you sure?",
            delete_confirmation: "This action cannot be undone",
            unsaved_changes: "You have unsaved changes",
            leave_page: "Leave this page?",
            
            // File operations
            file_upload: "File Upload",
            file_download: "File Download",
            file_size: "File Size",
            file_type: "File Type",
            file_name: "File Name",
            
            // Date and time
            date: "Date",
            time: "Time",
            datetime: "Date & Time",
            created_at: "Created",
            updated_at: "Updated",
            expires_at: "Expires"
        };

        // Vietnamese
        this.translations.vi = {
            // Navigation
            nav_dashboard: "Bảng Điều Khiển",
            nav_users: "Người Dùng",
            nav_profile: "Hồ Sơ",
            nav_security: "Bảo Mật",
            nav_settings: "Cài Đặt",
            nav_analytics: "Phân Tích",
            nav_reports: "Báo Cáo",
            logout: "Đăng Xuất",
            testing_zone: "Khu Vực Thử Nghiệm",
            
            // Dashboard Headers & Titles
            admin_dashboard_title: "Bảng Điều Khiển TINI",
            super_admin: "Quản Trị Cấp Cao",
            welcome_back: "Chào Mừng Trở Lại",
            header_title: "Bảng Điều Khiển",
            
            // Dashboard Stats
            active_users: "Người Dùng Hoạt Động",
            blocked_items: "Mục Bị Chặn",
            system_health: "Sức Khỏe Hệ Thống",
            new_this_week: "12.5% mới tuần này",
            from_yesterday: "0.1% từ hôm qua",
            minutes_ago_2: "2 phút trước",
            minutes_ago_15: "15 phút trước",
            hour_ago: "1 giờ trước",
            hours_ago_2: "2 giờ trước",
            hours_ago_3: "3 giờ trước",
            just_now: "Vừa xong",
            
            // Dashboard Activity Table
            recent_activity_title: "Hoạt Động Gần Đây",
            view_all: "Xem Tất Cả",
            table_user: "Người Dùng",
            table_action: "Hành Động",
            table_version: "Phiên Bản",
            table_time: "Thời Gian",
            table_status: "Trạng Thái",
            switched_to_power: "Chuyển sang POWER",
            login_attempt: "Thử đăng nhập",
            updated_settings: "Cập nhật cài đặt",
            device_registration: "Đăng ký thiết bị",
            active: "Hoạt Động",
            failed: "Thất Bại",
            completed: "Hoàn Thành",
            pending: "Chờ Xử Lý",
            inactive: "Không Hoạt Động",
            
            // Testing Zone
            bypass_testing_zone: "KHU VỰC THỬ NGHIỆM BYPASS",
            admin_safe_environment: "🔒 Môi Trường An Toàn 100% Cho Admin",
            admin_notification: "💻 Thông Báo Admin:",
            admin_notification_text: "Đừng lo lắng nữa! Tôi đã tạo môi trường thử nghiệm bypass siêu an toàn này cho quản trị viên. Ở đây, admin có thể test bypass mà không bao giờ bị 'kẹt' hay bị chặn. Mọi thứ đều được bảo vệ bởi quyền BOSS cấp 10000!",
            absolute_safety_guarantee: "Đảm Bảo An Toàn Tuyệt Đối",
            admin_cannot_be_blocked: "Admin không thể bị chặn trong môi trường này",
            all_bypass_systems_integrated: "Tất cả hệ thống bypass đã được tích hợp",
            boss_protection_highest_level: "Bảo vệ BOSS luôn hoạt động ở mức cao nhất",
            emergency_rescue_ready: "Cứu hộ khẩn cấp sẵn sàng nếu có vấn đề",
            bypass_systems_status: "TRẠNG THÁI HỆ THỐNG BYPASS",
            all_ready: "SẴN SÀNG",
            
            // User Management
            user_management: "Quản Lý Người Dùng",
            user_management_title: "Quản Lý Người Dùng",
            add_user_btn: "Thêm Người Dùng",
            add_user: "Thêm Người Dùng",
            employee_id: "Mã Nhân Viên",
            employee_id_col: "Mã NV",
            name: "Tên",
            name_col: "Tên",
            role: "Vai Trò",
            role_col: "Vai Trò",
            last_active: "Hoạt Động Cuối",
            last_active_col: "Hoạt Động",
            devices: "Thiết Bị",
            devices_col: "Thiết Bị",
            actions: "Thao Tác",
            actions_col: "Thao Tác",
            admin_user: "Người Dùng Quản Trị",
            regular_user: "Người Dùng Thường",
            employee_user_3: "Nhân Viên PanVuong",
            admin: "Quản Trị",
            user: "Người Dùng",
            employee: "Nhân Viên",
            manager: "Quản Lý",
            total_users: "Tổng Người Dùng",
            active_sessions: "Phiên Hoạt Động",
            admin_users: "Người Dùng Quản Trị",
            new_this_week_users: "1 mới tuần này",
            active_rate: "66% tỷ lệ hoạt động",
            super_admin_level: "Cấp độ siêu quản trị",
            
            // Profile Settings
            profile_settings: "Cài Đặt Hồ Sơ",
            avatar_cover: "Ảnh Đại Diện & Bìa",
            avatar: "Ảnh Đại Diện",
            personal_info: "Thông Tin Cá Nhân",
            full_name: "Họ Và Tên",
            email: "Địa Chỉ Email",
            save_changes: "Lưu Thay Đổi",
            preferences: "Tùy Chọn & Cài Đặt",
            language: "🌍 Ngôn Ngữ",
            timezone: "Múi Giờ",
            theme: "Chủ Đề Giao Diện",
            upload_image: "Tải Lên Hình",
            save_avatar: "Lưu Ảnh Đại Diện",
            
            // Security Settings
            security_settings: "Cài Đặt Bảo Mật",
            threat_level: "Mức Độ Đe Dọa",
            blocked_threats: "Mối Đe Dọa Đã Chặn",
            security_score: "Điểm Bảo Mật",
            all_systems_secure: "Tất cả hệ thống an toàn",
            from_last_week: "từ tuần trước",
            excellent_security: "Bảo mật xuất sắc",
            
            // System Settings
            system_settings: "Cài Đặt Hệ Thống",
            general_settings: "Cài Đặt Chung",
            application_settings: "Cài Đặt Ứng Dụng",
            performance_settings: "Cài Đặt Hiệu Suất",
            enable_auto_updates: "Bật cập nhật tự động",
            enable_telemetry: "Bật thu thập dữ liệu",
            hardware_acceleration: "Tăng tốc phần cứng",
            debug_mode: "Chế độ gỡ lỗi",
            
            // Analytics & Reports
            analytics_insights: "Phân Tích & Thông Tin Chi Tiết",
            page_views: "Lượt Xem Trang",
            blocked_ads: "Quảng Cáo Đã Chặn",
            performance_score: "Điểm Hiệu Suất",
            increase: "tăng",
            excellent: "Xuất Sắc",
            reports_analytics: "Báo Cáo & Nhật Ký",
            generate_reports: "Tạo Báo Cáo",
            generate_report: "Tạo Báo Cáo",
            security_report: "Báo Cáo Bảo Mật",
            usage_report: "Báo Cáo Sử Dụng",
            system_report: "Báo Cáo Hệ Thống",
            security_analysis: "Tạo phân tích bảo mật toàn diện",
            usage_analysis: "Phân tích hoạt động và thống kê người dùng",
            system_analysis: "Tạo báo cáo hiệu suất hệ thống",
            
            // Form Actions & Buttons
            save: "Lưu",
            edit: "Sửa",
            delete: "Xóa",
            cancel: "Hủy",
            confirm: "Xác Nhận",
            close: "Đóng",
            open: "Mở",
            refresh: "Làm Mới",
            search: "Tìm Kiếm",
            filter: "Lọc",
            export: "Xuất",
            import: "Nhập",
            
            // Status Messages
            loading: "Đang tải...",
            saving: "Đang lưu...",
            saved: "Đã lưu thành công",
            error: "Đã xảy ra lỗi",
            success: "Thành Công",
            warning: "Cảnh Báo",
            info: "Thông Tin",
            
            // Time & Date
            today: "Hôm nay",
            yesterday: "Hôm qua",
            this_week: "Tuần này",
            last_week: "Tuần trước",
            this_month: "Tháng này",
            last_month: "Tháng trước"
        };

        // Chinese (Simplified)
        this.translations.zh = {
            // Navigation
            nav_dashboard: "仪表板",
            nav_users: "用户",
            nav_profile: "个人资料",
            nav_security: "安全",
            nav_settings: "设置",
            nav_analytics: "分析",
            nav_reports: "报告",
            logout: "登出",
            testing_zone: "测试区域",
            
            // Dashboard Headers & Titles
            admin_dashboard_title: "TINI 管理仪表板",
            super_admin: "超级管理员",
            welcome_back: "欢迎回来",
            header_title: "仪表板",
            
            // Dashboard Stats
            active_users: "活跃用户",
            blocked_items: "被阻止项目",
            system_health: "系统健康",
            new_this_week: "本周新增 12.5%",
            from_yesterday: "昨天减少 0.1%",
            minutes_ago_2: "2分钟前",
            minutes_ago_15: "15分钟前",
            hour_ago: "1小时前",
            hours_ago_2: "2小时前",
            hours_ago_3: "3小时前",
            just_now: "刚刚",
            
            // Dashboard Activity Table
            recent_activity_title: "最近活动",
            view_all: "查看全部",
            table_user: "用户",
            table_action: "操作",
            table_version: "版本",
            table_time: "时间",
            table_status: "状态",
            switched_to_power: "切换到POWER",
            login_attempt: "登录尝试",
            updated_settings: "更新设置",
            device_registration: "设备注册",
            active: "活跃",
            failed: "失败",
            completed: "已完成",
            pending: "待处理",
            inactive: "不活跃",
            
            // Testing Zone
            bypass_testing_zone: "绕过测试区域",
            admin_safe_environment: "🔒 100% 管理员安全环境",
            admin_notification: "💻 管理员通知:",
            admin_notification_text: "不要再担心了！我已经为管理员创建了这个超级安全的测试绕过环境。在这里，管理员可以测试绕过而永远不会被'卡住'或被阻止。一切都受到 BOSS 权限级别 10000 的保护！",
            absolute_safety_guarantee: "绝对安全保证",
            admin_cannot_be_blocked: "管理员在此环境中不会被阻止",
            all_bypass_systems_integrated: "所有绕过系统已继承并集成",
            boss_protection_highest_level: "BOSS 保护始终在最高级别运行",
            emergency_rescue_ready: "如有任何问题，紧急救援随时待命",
            bypass_systems_status: "绕过系统状态",
            all_ready: "全部就绪",
            
            // User Management
            user_management: "用户管理",
            user_management_title: "用户管理",
            add_user_btn: "添加用户",
            add_user: "添加用户",
            employee_id: "员工ID",
            employee_id_col: "员工ID",
            name: "姓名",
            name_col: "姓名",
            role: "角色",
            role_col: "角色",
            last_active: "最后活动",
            last_active_col: "最后活动",
            devices: "设备",
            devices_col: "设备",
            actions: "操作",
            actions_col: "操作",
            admin_user: "管理员用户",
            regular_user: "普通用户",
            employee_user_3: "PanVuong员工",
            admin: "管理员",
            user: "用户",
            employee: "员工",
            manager: "经理",
            total_users: "用户总数",
            active_sessions: "活跃会话",
            admin_users: "管理员用户",
            new_this_week_users: "本周新增1个",
            active_rate: "66% 活跃率",
            super_admin_level: "超级管理员级别",
            
            // Profile Settings
            profile_settings: "个人资料设置",
            avatar_cover: "头像和封面",
            avatar: "头像",
            personal_info: "个人信息",
            full_name: "全名",
            email: "电子邮件地址",
            save_changes: "保存更改",
            preferences: "偏好设置",
            language: "🌍 语言",
            timezone: "时区",
            theme: "主题偏好",
            upload_image: "上传图片",
            save_avatar: "保存头像",
            
            // Security Settings
            security_settings: "安全设置",
            threat_level: "威胁级别",
            blocked_threats: "已阻止威胁",
            security_score: "安全评分",
            all_systems_secure: "所有系统安全",
            from_last_week: "自上周以来",
            excellent_security: "优秀的安全性",
            
            // System Settings
            system_settings: "系统设置",
            general_settings: "常规设置",
            application_settings: "应用程序设置",
            performance_settings: "性能设置",
            enable_auto_updates: "启用自动更新",
            enable_telemetry: "启用遥测",
            hardware_acceleration: "硬件加速",
            debug_mode: "调试模式",
            
            // Analytics & Reports
            analytics_insights: "分析与洞察",
            page_views: "页面浏览量",
            blocked_ads: "已阻止广告",
            performance_score: "性能评分",
            increase: "增长",
            excellent: "优秀",
            reports_analytics: "报告与日志",
            generate_reports: "生成报告",
            generate_report: "生成报告",
            security_report: "安全报告",
            usage_report: "使用报告",
            system_report: "系统报告",
            security_analysis: "生成全面的安全分析",
            usage_analysis: "分析用户活动和统计数据",
            system_analysis: "生成系统性能报告",
            
            // Form Actions & Buttons
            save: "保存",
            edit: "编辑",
            delete: "删除",
            cancel: "取消",
            confirm: "确认",
            close: "关闭",
            open: "打开",
            refresh: "刷新",
            search: "搜索",
            filter: "筛选",
            export: "导出",
            import: "导入",
            
            // Status Messages
            loading: "加载中...",
            saving: "保存中...",
            saved: "保存成功",
            error: "发生错误",
            success: "成功",
            warning: "警告",
            info: "信息",
            
            // Time & Date
            today: "今天",
            yesterday: "昨天",
            this_week: "本周",
            last_week: "上周",
            this_month: "本月",
            last_month: "上月"
        };

        // Hindi  
        this.translations.hi = {
            // Navigation
            nav_dashboard: "डैशबोर्ड",
            nav_users: "उपयोगकर्ता",
            nav_profile: "प्रोफ़ाइल",
            nav_security: "सुरक्षा",
            nav_settings: "सेटिंग्स",
            nav_analytics: "विश्लेषणात्मक",
            nav_reports: "रिपोर्ट",
            logout: "लॉग आउट",
            testing_zone: "परीक्षण क्षेत्र",
            
            // Dashboard Headers & Titles
            admin_dashboard_title: "TINI व्यवस्थापक डैशबोर्ड",
            super_admin: "सुपर एडमिनिस्ट्रेटर",
            welcome_back: "वापसी पर स्वागत है",
            header_title: "डैशबोर्ड",
            
            // Dashboard Stats
            active_users: "सक्रिय उपयोगकर्ता",
            blocked_items: "अवरुद्ध आइटम",
            system_health: "सिस्टम स्वास्थ्य",
            new_this_week: "इस सप्ताह 12.5% नया",
            from_yesterday: "कल से 0.1%",
            minutes_ago_2: "2 मिनट पहले",
            minutes_ago_15: "15 मिनट पहले",
            hour_ago: "1 घंटे पहले",
            hours_ago_2: "2 घंटे पहले",
            hours_ago_3: "3 घंटे पहले",
            just_now: "अभी-अभी",
            
            // Dashboard Activity Table
            recent_activity_title: "हाल की गतिविधि",
            view_all: "सभी देखें",
            table_user: "उपयोगकर्ता",
            table_action: "क्रिया",
            table_version: "संस्करण",
            table_time: "समय",
            table_status: "स्थिति",
            switched_to_power: "POWER पर स्विच किया",
            login_attempt: "लॉगिन प्रयास",
            updated_settings: "सेटिंग्स अपडेट की",
            device_registration: "डिवाइस पंजीकरण",
            active: "सक्रिय",
            failed: "असफल",
            completed: "पूर्ण",
            pending: "लंबित",
            inactive: "निष्क्रिय",
            
            // Testing Zone
            bypass_testing_zone: "बाईपास परीक्षण क्षेत्र",
            admin_safe_environment: "🔒 100% व्यवस्थापक सुरक्षित वातावरण",
            admin_notification: "💻 व्यवस्थापक अधिसूचना:",
            admin_notification_text: "अब चिंता न करें! मैंने व्यवस्थापकों के लिए यह सुपर सिक्योर टेस्टिंग बाईपास वातावरण बनाया है। यहाँ, व्यवस्थापक बाईपास का परीक्षण कर सकते हैं और कभी भी 'फंस' या अवरुद्ध नहीं होंगे। सब कुछ BOSS अनुमति स्तर 10000 द्वारा संरक्षित है!",
            absolute_safety_guarantee: "पूर्ण सुरक्षा गारंटी",
            admin_cannot_be_blocked: "इस वातावरण में व्यवस्थापक को अवरुद्ध नहीं किया जा सकता",
            all_bypass_systems_integrated: "सभी बाईपास सिस्टम विरासत में मिले और एकीकृत हैं",
            boss_protection_highest_level: "BOSS सुरक्षा हमेशा उच्चतम स्तर पर काम करती है",
            emergency_rescue_ready: "यदि कोई समस्या आती है तो आपातकालीन बचाव तैयार है",
            bypass_systems_status: "बाईपास सिस्टम स्थिति",
            all_ready: "सभी तैयार",
            
            // User Management
            user_management: "उपयोगकर्ता प्रबंधन",
            user_management_title: "उपयोगकर्ता प्रबंधन",
            add_user_btn: "उपयोगकर्ता जोड़ें",
            add_user: "उपयोगकर्ता जोड़ें",
            employee_id: "कर्मचारी आईडी",
            employee_id_col: "कर्मचारी आईडी",
            name: "नाम",
            name_col: "नाम",
            role: "भूमिका",
            role_col: "भूमिका",
            last_active: "अंतिम सक्रिय",
            last_active_col: "अंतिम सक्रिय",
            devices: "उपकरण",
            devices_col: "उपकरण",
            actions: "क्रियाएं",
            actions_col: "क्रियाएं",
            admin_user: "व्यवस्थापक उपयोगकर्ता",
            regular_user: "नियमित उपयोगकर्ता",
            employee_user_3: "PanVuong कर्मचारी",
            admin: "व्यवस्थापक",
            user: "उपयोगकर्ता",
            employee: "कर्मचारी",
            manager: "प्रबंधक",
            total_users: "कुल उपयोगकर्ता",
            active_sessions: "सक्रिय सत्र",
            admin_users: "व्यवस्थापक उपयोगकर्ता",
            new_this_week_users: "इस सप्ताह 1 नया",
            active_rate: "66% सक्रिय दर",
            super_admin_level: "सुपर व्यवस्थापक स्तर",
            
            // Profile Settings
            profile_settings: "प्रोफ़ाइल सेटिंग्स",
            avatar_cover: "अवतार और कवर",
            avatar: "अवतार",
            personal_info: "व्यक्तिगत जानकारी",
            full_name: "पूरा नाम",
            email: "ईमेल पता",
            save_changes: "परिवर्तन सहेजें",
            preferences: "प्राथमिकताएं और सेटिंग्स",
            language: "🌍 भाषा",
            timezone: "समयक्षेत्र",
            theme: "थीम प्राथमिकता",
            upload_image: "छवि अपलोड करें",
            save_avatar: "अवतार सहेजें",
            
            // Security Settings
            security_settings: "सुरक्षा सेटिंग्स",
            threat_level: "खतरे का स्तर",
            blocked_threats: "अवरुद्ध खतरे",
            security_score: "सुरक्षा स्कोर",
            all_systems_secure: "सभी सिस्टम सुरक्षित",
            from_last_week: "पिछले सप्ताह से",
            excellent_security: "उत्कृष्ट सुरक्षा",
            
            // System Settings
            system_settings: "सिस्टम सेटिंग्स",
            general_settings: "सामान्य सेटिंग्स",
            application_settings: "एप्लिकेशन सेटिंग्स",
            performance_settings: "प्रदर्शन सेटिंग्स",
            enable_auto_updates: "स्वचालित अपडेट सक्षम करें",
            enable_telemetry: "टेलीमेट्री सक्षम करें",
            hardware_acceleration: "हार्डवेयर त्वरण",
            debug_mode: "डिबग मोड",
            
            // Analytics & Reports
            analytics_insights: "विश्लेषिकी और अंतर्दृष्टि",
            page_views: "पृष्ठ दृश्य",
            blocked_ads: "अवरुद्ध विज्ञापन",
            performance_score: "प्रदर्शन स्कोर",
            increase: "वृद्धि",
            excellent: "उत्कृष्ट",
            reports_analytics: "रिपोर्ट और लॉग",
            generate_reports: "रिपोर्ट जेनरेट करें",
            generate_report: "रिपोर्ट जेनरेट करें",
            security_report: "सुरक्षा रिपोर्ट",
            usage_report: "उपयोग रिपोर्ट",
            system_report: "सिस्टम रिपोर्ट",
            security_analysis: "व्यापक सुरक्षा विश्लेषण जेनरेट करें",
            usage_analysis: "उपयोगकर्ता गतिविधि और आंकड़ों का विश्लेषण करें",
            system_analysis: "सिस्टम प्रदर्शन रिपोर्ट जेनरेट करें",
            
            // Form Actions & Buttons
            save: "सहेजें",
            edit: "संपादित करें",
            delete: "हटाएं",
            cancel: "रद्द करें",
            confirm: "पुष्टि करें",
            close: "बंद करें",
            open: "खोलें",
            refresh: "ताज़ा करें",
            search: "खोजें",
            filter: "फिल्टर",
            export: "निर्यात",
            import: "आयात",
            
            // Status Messages
            loading: "लोड हो रहा है...",
            saving: "सहेज रहा है...",
            saved: "सफलतापूर्वक सहेजा गया",
            error: "त्रुटि हुई",
            success: "सफलता",
            warning: "चेतावनी",
            info: "जानकारी",
            
            // Time & Date
            today: "आज",
            yesterday: "कल",
            this_week: "इस सप्ताह",
            last_week: "पिछले सप्ताह",
            this_month: "इस महीने",
            last_month: "पिछले महीने"
        };

        // Korean
        this.translations.ko = {
            // Navigation
            nav_dashboard: "대시보드",
            nav_users: "사용자",
            nav_profile: "프로필",
            nav_security: "보안",
            nav_settings: "설정",
            nav_analytics: "분석",
            nav_reports: "리포트",
            logout: "로그아웃",
            testing_zone: "테스트 구역",
            
            // Dashboard Headers & Titles
            admin_dashboard_title: "TINI 관리자 대시보드",
            super_admin: "슈퍼 관리자",
            welcome_back: "다시 오신 것을 환영합니다",
            header_title: "대시보드",
            
            // Dashboard Stats
            active_users: "활성 사용자",
            blocked_items: "차단된 항목",
            system_health: "시스템 상태",
            new_this_week: "이번 주 12.5% 증가",
            from_yesterday: "어제부터 0.1% 감소",
            minutes_ago_2: "2분 전",
            minutes_ago_15: "15분 전",
            hour_ago: "1시간 전",
            hours_ago_2: "2시간 전",
            hours_ago_3: "3시간 전",
            just_now: "방금 전",
            
            // Dashboard Activity Table
            recent_activity_title: "최근 활동",
            view_all: "전체 보기",
            table_user: "사용자",
            table_action: "작업",
            table_version: "버전",
            table_time: "시간",
            table_status: "상태",
            switched_to_power: "POWER로 전환",
            login_attempt: "로그인 시도",
            updated_settings: "설정 업데이트",
            device_registration: "장치 등록",
            active: "활성",
            failed: "실패",
            completed: "완료",
            pending: "대기 중",
            inactive: "비활성",
            
            // Testing Zone
            bypass_testing_zone: "바이패스 테스트 구역",
            admin_safe_environment: "🔒 100% 관리자 안전 환경",
            admin_notification: "💻 관리자 알림:",
            admin_notification_text: "더 이상 걱정하지 마세요! 관리자를 위한 이 슈퍼 보안 테스트 바이패스 환경을 만들었습니다. 여기서 관리자는 바이패스를 테스트할 수 있으며 절대 '막히거나' 차단되지 않습니다. 모든 것이 BOSS 권한 레벨 10000으로 보호됩니다!",
            absolute_safety_guarantee: "절대 안전 보장",
            admin_cannot_be_blocked: "이 환경에서는 관리자가 차단될 수 없습니다",
            all_bypass_systems_integrated: "모든 바이패스 시스템이 상속되고 통합되었습니다",
            boss_protection_highest_level: "BOSS 보호는 항상 최고 수준에서 작동합니다",
            emergency_rescue_ready: "문제가 발생하면 긴급 구조가 준비되어 있습니다",
            bypass_systems_status: "바이패스 시스템 상태",
            all_ready: "모두 준비됨",
            
            // User Management
            user_management: "사용자 관리",
            user_management_title: "사용자 관리",
            add_user_btn: "사용자 추가",
            add_user: "사용자 추가",
            employee_id: "직원 ID",
            employee_id_col: "직원 ID",
            name: "이름",
            name_col: "이름",
            role: "역할",
            role_col: "역할",
            last_active: "마지막 활동",
            last_active_col: "마지막 활동",
            devices: "장치",
            devices_col: "장치",
            actions: "작업",
            actions_col: "작업",
            admin_user: "관리자 사용자",
            regular_user: "일반 사용자",
            employee_user_3: "PanVuong 직원",
            admin: "관리자",
            user: "사용자",
            employee: "직원",
            manager: "매니저",
            total_users: "총 사용자",
            active_sessions: "활성 세션",
            admin_users: "관리자 사용자",
            new_this_week_users: "이번 주 신규 1명",
            active_rate: "66% 활성 비율",
            super_admin_level: "슈퍼 관리자 레벨",
            
            // Profile Settings
            profile_settings: "프로필 설정",
            avatar_cover: "아바타 및 커버",
            avatar: "아바타",
            personal_info: "개인 정보",
            full_name: "전체 이름",
            email: "이메일 주소",
            save_changes: "변경사항 저장",
            preferences: "환경설정",
            language: "🌍 언어",
            timezone: "시간대",
            theme: "테마 설정",
            upload_image: "이미지 업로드",
            save_avatar: "아바타 저장",
            
            // Security Settings
            security_settings: "보안 설정",
            threat_level: "위협 수준",
            blocked_threats: "차단된 위협",
            security_score: "보안 점수",
            all_systems_secure: "모든 시스템 안전",
            from_last_week: "지난 주부터",
            excellent_security: "우수한 보안",
            
            // System Settings
            system_settings: "시스템 설정",
            general_settings: "일반 설정",
            application_settings: "애플리케이션 설정",
            performance_settings: "성능 설정",
            enable_auto_updates: "자동 업데이트 활성화",
            enable_telemetry: "텔레메트리 활성화",
            hardware_acceleration: "하드웨어 가속",
            debug_mode: "디버그 모드",
            
            // Analytics & Reports
            analytics_insights: "분석 및 통찰",
            page_views: "페이지 조회수",
            blocked_ads: "차단된 광고",
            performance_score: "성능 점수",
            increase: "증가",
            excellent: "우수",
            reports_analytics: "보고서 및 로그",
            generate_reports: "보고서 생성",
            generate_report: "보고서 생성",
            security_report: "보안 보고서",
            usage_report: "사용 보고서",
            system_report: "시스템 보고서",
            security_analysis: "포괄적인 보안 분석 생성",
            usage_analysis: "사용자 활동 및 통계 분석",
            system_analysis: "시스템 성능 보고서 생성",
            
            // Form Actions & Buttons
            save: "저장",
            edit: "편집",
            delete: "삭제",
            cancel: "취소",
            confirm: "확인",
            close: "닫기",
            open: "열기",
            refresh: "새로고침",
            search: "검색",
            filter: "필터",
            export: "내보내기",
            import: "가져오기",
            
            // Status Messages
            loading: "로딩 중...",
            saving: "저장 중...",
            saved: "성공적으로 저장됨",
            error: "오류 발생",
            success: "성공",
            warning: "경고",
            info: "정보",
            
            // Time & Date
            today: "오늘",
            yesterday: "어제",
            this_week: "이번 주",
            last_week: "지난 주",
            this_month: "이번 달",
            last_month: "지난 달"
        };
    }

    detectLanguage() {
        // Try to get saved language
        const savedLang = localStorage.getItem('tini_admin_language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLanguage = savedLang;
        } else {
            // Detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (this.supportedLanguages.includes(browserLang)) {
                this.currentLanguage = browserLang;
            }
        }
        
        console.log(`🌍 [I18N] Language detected: ${this.currentLanguage}`);
    }

    translate(key) {
        const translation = this.translations[this.currentLanguage]?.[key] 
            || this.translations[this.fallbackLanguage]?.[key] 
            || key;
            
        return translation;
    }

    setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`🌍 [I18N] Unsupported language: ${lang}`);
            return;
        }
        
        this.currentLanguage = lang;
        localStorage.setItem('tini_admin_language', lang);
        this.updateAllTranslations();
        
        console.log(`🌍 [I18N] Language changed to: ${lang}`);
    }

    updateAllTranslations() {
        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email')) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update title
        const titleElements = document.querySelectorAll('title[data-i18n]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.translate(key);
        });

        // Trigger custom event for other systems
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        }));
    }

    setupLanguageObserver() {
        // Observe for new elements with data-i18n
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            const elements = node.querySelectorAll('[data-i18n]');
                            elements.forEach(element => {
                                const key = element.getAttribute('data-i18n');
                                const translation = this.translate(key);
                                element.textContent = translation;
                            });
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    getSupportedLanguages() {
        return [
            { code: 'en', name: '🇺🇸 English (United States)', nativeName: 'English' },
            { code: 'vi', name: '🇻🇳 Tiếng Việt (Vietnamese)', nativeName: 'Tiếng Việt' },
            { code: 'zh', name: '🇨🇳 中文 (Chinese Simplified)', nativeName: '中文' },
            { code: 'hi', name: '🇮🇳 हिन्दी (Hindi - India)', nativeName: 'हिन्दी' },
            { code: 'ko', name: '🇰🇷 한국어 (Korean)', nativeName: '한국어' }
        ];
    }
}

// Initialize global I18n system
window.tiniI18n = new TINI_I18n();

// Global helper function
window.t = function(key) {
    return window.tiniI18n.translate(key);
};

// Global update function
window.updateI18n = function(lang) {
    window.tiniI18n.setLanguage(lang);
};

console.log('🌍 [I18N] TINI Advanced I18n System loaded successfully');
// ST:TINI_1754716154_e868a412
