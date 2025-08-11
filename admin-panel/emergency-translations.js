// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Emergency fallback translations loader
(function() {
    console.log('🆘 Loading emergency fallback translations...');
    
    // Inline Chinese translations cho tất cả keys bị thiếu
    const chineseTranslations = {
        // User management
        "add_new_user": "添加新用户",
        "status": "状态", 
        "suspended": "已暂停",
        "basic_info": "基本信息",
        "timezone_utc7": "UTC+7时区",
        "timezone_utc8": "UTC+8时区", 
        "timezone_utc9": "UTC+9时区",
        "timezone_utc530": "UTC+5:30时区",
        "timezone_utc0": "UTC+0时区",
        "timezone_utcm5": "UTC-5时区",
        
        // Loading states
        "loading": "加载中...",
        "loading_data": "正在加载数据...",
        "loading_charts": "正在加载图表...",
        
        // Themes
        "theme_dark": "深色主题",
        "theme_light": "浅色主题", 
        "theme_auto": "自动主题",
        "theme_neutral": "中性主题",
        "theme_professional": "专业主题",
        
        // Navigation
        "nav_dashboard": "仪表板",
        "nav_users": "用户管理",
        "nav_profile": "个人资料",
        "nav_security": "安全设置",
        "nav_settings": "系统设置",
        "nav_analytics": "数据分析",
        "nav_reports": "报告中心",
        "testing_zone": "测试区域",
        "logout": "退出登录",
        
        // Dashboard
        "admin_dashboard_title": "TINI管理面板",
        "active_users": "活跃用户",
        "blocked_items": "阻止项目",
        "system_health": "系统健康",
        "new_this_week": "本周新增",
        "from_yesterday": "较昨日",
        "super_admin": "超级管理员",
        
        // Tables
        "table_user": "用户",
        "table_action": "操作",
        "table_version": "版本",
        "table_time": "时间",
        "table_status": "状态",
        
        // Activity
        "recent_activity_title": "最近活动",
        "switched_to_power": "切换到POWER模式",
        "login_attempt": "登录尝试",
        "updated_settings": "更新设置",
        "device_registration": "设备注册",
        "minutes_ago_2": "2分钟前",
        "minutes_ago_15": "15分钟前",
        "hour_ago": "1小时前",
        "hours_ago_3": "3小时前",
        "active": "活跃",
        "failed": "失败",
        "completed": "已完成",
        "pending": "待处理",
        
        // User Management
        "user_management_title": "用户管理",
        "add_user_btn": "添加用户",
        "employee_id_col": "员工编号",
        "name_col": "姓名",
        "role_col": "角色",
        "last_active_col": "最后活动",
        "devices_col": "设备数",
        "actions_col": "操作",
        "admin_user": "管理员用户",
        "regular_user": "普通用户",
        "admin": "管理员",
        "user": "用户",
        "just_now": "刚刚",
        
        // Email and notifications
        "email_notifications": "邮件通知",
        "auto_save": "自动保存",
        "account_security": "账户安全",
        "change_password": "更改密码",
        "password_settings": "密码设置", 
        "current_password": "当前密码",
        "new_password": "新密码",
        "confirm_new_password": "确认新密码",
        "two_factor_auth": "双重身份验证",
        "two_fa_enabled": "双重验证已启用",
        "account_protected": "账户已保护",
        "sms_authentication": "短信验证",
        "email_verification": "邮箱验证",
        "view_recovery_codes": "查看恢复代码",
        "recent_activity": "最近活动",
        
        // Profile
        "activity": "活动",
        "ip_address": "IP地址", 
        "device": "设备",
        "profile_updated": "档案已更新",
        "windows_pc": "Windows电脑",
        "admin_login": "管理员登录",
        "chrome_browser": "Chrome浏览器",
        "hours_ago": "小时前",
        "password_changed": "密码已更改",
        "days_ago": "天前",
        
        // Time periods
        "time_last_24h": "过去24小时",
        "time_last_7d": "过去7天", 
        "time_last_30d": "过去30天",
        "btn_refresh": "刷新",
        
        // Security
        "security_active_threats": "活跃威胁",
        "security_blocked_today": "今日已阻止",
        "security_active_threats_value": "检测到0个威胁",
        "security_blocked_today_value": "今日阻止0个",
        "security_risk_score": "风险评分",
        "security_risk_score_value": "低风险",
        "trend_down_12": "下降12%",
        "trend_flat": "无变化", 
        "trend_up_secure": "安全性提高",
        "trend_up": "上升趋势",
        "security_patch_level": "安全补丁级别",
        "security_patch_level_value": "最新",
        "security_threat_timeline": "威胁时间线",
        "security_no_threats": "未检测到威胁",
        "security_controls_matrix": "安全控制矩阵",
        "security_control_mfa": "多重身份验证",
        "security_enabled": "已启用",
        "security_disabled": "已禁用",
        "security_control_password_policy": "密码策略",
        "security_control_ip_filtering": "IP过滤",
        "security_control_rate_limit": "速率限制", 
        "security_control_intrusion_detection": "入侵检测",
        "security_control_waf": "Web应用防火墙",
        "security_settings": "安全设置",
        
        // Analytics
        "analytics_insights": "数据分析洞察",
        "analytics_avg_session": "平均会话时长",
        "analytics_bounce_rate": "跳出率",
        "analytics_conversion_rate": "转化率",
        "analytics_user_retention": "用户留存",
        "analytics_traffic_title": "流量分析",
        "analytics_performance_title": "性能指标",
        "analytics_retention_title": "用户留存分析",
        "analytics_security_title": "安全分析",
        "metric_active_users": "活跃用户",
        "metric_response_time": "响应时间",
        "metric_retention_rate": "留存率",
        "metric_threat_level": "威胁级别",
        "incidents": "事件",
        "users": "用户",
        "btn_export_data": "导出数据",
        
        // Additional missing keys
        "download": "下载",
        "view": "查看", 
        "share": "分享",
        "cancel": "取消",
        "processing": "处理中",
        "ready": "已完成",
        "failed": "失败",
        "hours_ago": "小时前",
        "days_ago": "天前",
        "just_now": "刚刚",
        
        // Reports
        "reports_analytics": "报告与日志",
        "reports_total": "总报告数",
        "reports_avg_time": "平均生成时间", 
        "reports_success_rate": "成功率",
        "reports_in_queue": "队列中报告",
        "recent_reports_list": "最近报告列表",
        "report_creation": "创建新报告",
        "reports_field_type": "报告类型",
        "reports_field_range": "时间范围",
        "reports_field_format": "输出格式", 
        "reports_field_notify": "完成时发送通知",
        "reports_submit_generate": "生成报告",
        "reports_filter_status": "所有状态",
        "reports_filter_search": "搜索报告...",
        "reports_no_results": "没有找到符合条件的报告",
        "create_report": "创建报告",
        "user_activity_type": "用户活动报告",
        "security_type": "安全分析报告", 
        "performance_type": "性能监控报告",
        "compliance_type": "合规审计报告",
        "time_last_24h": "过去24小时",
        "time_last_7d": "过去7天",
        "time_last_30d": "过去30天",
        "time_last_90d": "过去90天",
        "status_ready": "已完成",
        "status_processing": "处理中", 
        "status_failed": "失败",
        "reports_total": "总报告数",
        "reports_avg_time": "平均生成时间", 
        "reports_success_rate": "成功率",
        "reports_queue": "队列中报告",
        "recent_reports_list": "最近报告列表",
        "report_creation": "创建新报告",
        "reports_field_type": "报告类型",
        "reports_field_range": "时间范围",
        "reports_field_format": "输出格式",
        "reports_field_notify": "完成时发送通知",
        "reports_submit_generate": "生成报告",
        "create_report": "创建报告",
        "user_activity_type": "用户活动报告",
        "security_type": "安全分析报告", 
        "performance_type": "性能监控报告",
        "compliance_type": "合规审计报告",
        "format_pdf": "PDF格式",
        "format_csv": "CSV格式",
        "format_excel": "Excel格式",
        "time_last_24h": "过去24小时",
        "time_last_7d": "过去7天",
        "time_last_30d": "过去30天",
        "time_last_90d": "过去90天",
        "status_ready": "已完成",
        "status_processing": "处理中", 
        "status_failed": "失败",
        "reports_filter_status": "所有状态",
        "reports_no_results": "没有找到符合条件的报告"
    };
    
    // Force apply translations immediately
    window.emergencyTranslations = chineseTranslations;
    
    // Create emergency translation function
    window.t = function(key) {
        return chineseTranslations[key] || key;
    };
    
    // Apply to all data-i18n elements immediately
    function applyEmergencyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        let updatedCount = 0;
        
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = chineseTranslations[key];
            if (translation && translation !== key) {
                el.textContent = translation;
                updatedCount++;
                console.log(`🔄 Updated ${key} -> ${translation}`);
            }
        });
        
        // Also handle loading text that doesn't have data-i18n
        const loadingElements = document.querySelectorAll('.stat-value, .metric-value');
        loadingElements.forEach(el => {
            if (el.textContent.includes('Loading')) {
                el.textContent = '加载中...';
                updatedCount++;
            }
        });
        
        console.log(`✅ Applied ${updatedCount} emergency translations`);
    }
    
    // Apply immediately and also on DOM changes
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyEmergencyTranslations);
    } else {
        applyEmergencyTranslations();
    }
    
    // Reapply every 2 seconds for dynamic content
    setInterval(applyEmergencyTranslations, 2000);
    
    console.log('🆘 Emergency fallback translations loaded and active');
})();
