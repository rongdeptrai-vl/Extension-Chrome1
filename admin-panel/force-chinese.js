// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
// Manual force update to Chinese
console.log('🇨🇳 Force updating to Chinese...');

// Chinese translations map
const chineseTranslations = {
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
    'testing_zone': '测试区域',
    'super_admin': '超级管理员',
    'active_users': '活跃用户',
    'view_all': '查看全部'
};

// Update all elements with data-i18n
document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (chineseTranslations[key]) {
        console.log(`Updating ${key}: "${el.textContent}" → "${chineseTranslations[key]}"`);
        el.textContent = chineseTranslations[key];
    } else {
        console.warn(`No Chinese translation for: ${key}`);
    }
});

// Also update the chart labels manually if needed
setTimeout(() => {
    // Look for any remaining English text in metric labels
    document.querySelectorAll('.metric-label').forEach(el => {
        const text = el.textContent.trim();
        if (text.includes('METRIC_') || text.includes('ACTIVE') || text.includes('RESPONSE') || text.includes('RETENTION') || text.includes('THREAT')) {
            const key = el.getAttribute('data-i18n');
            if (key && chineseTranslations[key]) {
                el.textContent = chineseTranslations[key];
                console.log(`Fixed metric label: ${text} → ${chineseTranslations[key]}`);
            }
        }
    });
}, 1000);

console.log('✅ Force Chinese update completed');
