// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Auto-set to Chinese when page loads
(function() {
    console.log('🌐 Auto-setting language to Chinese...');
    
    // Set Chinese as default language
    if (window.secureStorage) {
        window.secureStorage.set('adminLanguage', 'zh');
    }
    
    // Listen for when i18n system is ready
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(async () => {
            if (window.i18n) {
                console.log('Setting language to Chinese...');
                await window.i18n.setLanguage('zh');
                window.i18n.refreshUI();
            }
            
            // Backup manual update
            setTimeout(() => {
                const chineseMap = {
                    'nav_dashboard': '仪表板',
                    'nav_users': '用户管理',
                    'nav_profile': '个人资料', 
                    'nav_security': '安全设置',
                    'nav_settings': '系统设置',
                    'nav_analytics': '数据分析',
                    'nav_reports': '报告管理',
                    'metric_active_users': '活动用户',
                    'metric_response_time': '响应时间',
                    'metric_retention_rate': '留存率', 
                    'metric_threat_level': '威胁等级',
                    'logout': '退出登录',
                    'testing_zone': '测试区域'
                };
                
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const key = el.getAttribute('data-i18n');
                    if (chineseMap[key] && el.textContent !== chineseMap[key]) {
                        el.textContent = chineseMap[key];
                    }
                });
                
                console.log('✅ Chinese language applied');
            }, 2000);
        }, 1000);
    });
})();
