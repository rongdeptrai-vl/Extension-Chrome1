// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
const fs = require('fs');
const path = require('path');

// Danh sách tất cả keys bị thiếu với translations
const missingKeys = {
    "security_no_threats": {
        "en": "No active threats detected",
        "vi": "Không phát hiện mối đe dọa nào",
        "hi": "कोई सक्रिय खतरा नहीं मिला",
        "ko": "활성 위협이 감지되지 않음",
        "zh": "未检测到活动威胁"
    },
    "security_controls_matrix": {
        "en": "Security Controls Matrix",
        "vi": "Ma Trận Kiểm Soát Bảo Mật",
        "hi": "सुरक्षा नियंत्रण मैट्रिक्स",
        "ko": "보안 제어 매트릭스",
        "zh": "安全控制矩阵"
    },
    "btn_refresh": {
        "en": "Refresh",
        "vi": "Làm Mới",
        "hi": "ताज़ा करें",
        "ko": "새로고침",
        "zh": "刷新"
    },
    "header_total_reports": {
        "en": "Total Reports",
        "vi": "Tổng Báo Cáo",
        "hi": "कुल रिपोर्ट",
        "ko": "총 보고서",
        "zh": "总报告"
    },
    "header_pending_reports": {
        "en": "Pending Reports",
        "vi": "Báo Cáo Đang Chờ",
        "hi": "लंबित रिपोर्ट",
        "ko": "대기 중인 보고서",
        "zh": "待处理报告"
    },
    "header_completed_reports": {
        "en": "Completed Reports",
        "vi": "Báo Cáo Hoàn Thành",
        "hi": "पूर्ण रिपोर्ट",
        "ko": "완료된 보고서",
        "zh": "已完成报告"
    },
    "header_critical_reports": {
        "en": "Critical Reports",
        "vi": "Báo Cáo Quan Trọng",
        "hi": "महत्वपूर्ण रिपोर्ट",
        "ko": "중요 보고서",
        "zh": "关键报告"
    },
    "month_january": {
        "en": "January",
        "vi": "Tháng Một",
        "hi": "जनवरी",
        "ko": "1월",
        "zh": "一月"
    },
    "month_february": {
        "en": "February",
        "vi": "Tháng Hai",
        "hi": "फरवरी",
        "ko": "2월",
        "zh": "二月"
    },
    "month_march": {
        "en": "March",
        "vi": "Tháng Ba",
        "hi": "मार्च",
        "ko": "3월",
        "zh": "三月"
    },
    "month_april": {
        "en": "April",
        "vi": "Tháng Tư",
        "hi": "अप्रैल",
        "ko": "4월",
        "zh": "四月"
    },
    "month_may": {
        "en": "May",
        "vi": "Tháng Năm",
        "hi": "मई",
        "ko": "5월",
        "zh": "五月"
    },
    "month_june": {
        "en": "June",
        "vi": "Tháng Sáu",
        "hi": "जून",
        "ko": "6월",
        "zh": "六月"
    },
    "month_july": {
        "en": "July",
        "vi": "Tháng Bảy",
        "hi": "जुलाई",
        "ko": "7월",
        "zh": "七月"
    },
    "month_august": {
        "en": "August",
        "vi": "Tháng Tám",
        "hi": "अगस्त",
        "ko": "8월",
        "zh": "八月"
    },
    "month_september": {
        "en": "September",
        "vi": "Tháng Chín",
        "hi": "सितंबर",
        "ko": "9월",
        "zh": "九月"
    },
    "month_october": {
        "en": "October",
        "vi": "Tháng Mười",
        "hi": "अक्टूबर",
        "ko": "10월",
        "zh": "十月"
    },
    "month_november": {
        "en": "November",
        "vi": "Tháng Mười Một",
        "hi": "नवंबर",
        "ko": "11월",
        "zh": "十一月"
    },
    "month_december": {
        "en": "December",
        "vi": "Tháng Mười Hai",
        "hi": "दिसंबर",
        "ko": "12월",
        "zh": "十二月"
    },
    "charts_users_overview": {
        "en": "Users Overview",
        "vi": "Tổng Quan Người Dùng",
        "hi": "उपयोगकर्ता अवलोकन",
        "ko": "사용자 개요",
        "zh": "用户概览"
    },
    "charts_revenue_trends": {
        "en": "Revenue Trends",
        "vi": "Xu Hướng Doanh Thu",
        "hi": "राजस्व रुझान",
        "ko": "수익 동향",
        "zh": "收入趋势"
    },
    "charts_performance_metrics": {
        "en": "Performance Metrics",
        "vi": "Số Liệu Hiệu Suất",
        "hi": "प्रदर्शन मेट्रिक्स",
        "ko": "성능 지표",
        "zh": "性能指标"
    },
    "profile_section_basic": {
        "en": "Basic Information",
        "vi": "Thông Tin Cơ Bản",
        "hi": "बुनियादी जानकारी",
        "ko": "기본 정보",
        "zh": "基本信息"
    },
    "profile_section_security": {
        "en": "Security Settings",
        "vi": "Cài Đặt Bảo Mật",
        "hi": "सुरक्षा सेटिंग्स",
        "ko": "보안 설정",
        "zh": "安全设置"
    },
    "profile_section_permissions": {
        "en": "Permissions",
        "vi": "Quyền Hạn",
        "hi": "अनुमतियां",
        "ko": "권한",
        "zh": "权限"
    },
    "profile_section_activity": {
        "en": "Activity Log",
        "vi": "Nhật Ký Hoạt Động",
        "hi": "गतिविधि लॉग",
        "ko": "활동 로그",
        "zh": "活动日志"
    },
    "analytics_section_overview": {
        "en": "Analytics Overview",
        "vi": "Tổng Quan Phân Tích",
        "hi": "विश्लेषण अवलोकन",
        "ko": "분석 개요",
        "zh": "分析概览"
    },
    "analytics_section_reports": {
        "en": "Reports",
        "vi": "Báo Cáo",
        "hi": "रिपोर्ट",
        "ko": "보고서",
        "zh": "报告"
    },
    "analytics_section_insights": {
        "en": "Insights",
        "vi": "Thông Tin Chi Tiết",
        "hi": "अंतर्दृष्टि",
        "ko": "인사이트",
        "zh": "洞察"
    },
    "analytics_section_exports": {
        "en": "Data Exports",
        "vi": "Xuất Dữ Liệu",
        "hi": "डेटा निर्यात",
        "ko": "데이터 내보내기",
        "zh": "数据导出"
    }
};

// Danh sách ngôn ngữ
const languages = ['en', 'vi', 'hi', 'ko', 'zh'];
const localesPath = path.join(__dirname, '_locales');

console.log('🔧 Adding missing keys to all languages...\n');

let totalAdded = 0;

languages.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'messages.json');
    
    if (fs.existsSync(filePath)) {
        // Đọc tệp hiện tại
        const currentMessages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let addedCount = 0;
        
        console.log(`📝 Processing ${lang.toUpperCase()}...`);
        
        // Thêm từng key thiếu
        Object.keys(missingKeys).forEach(key => {
            if (!currentMessages[key] && missingKeys[key][lang]) {
                currentMessages[key] = {
                    "message": missingKeys[key][lang]
                };
                addedCount++;
                console.log(`   ✅ Added: ${key} = "${missingKeys[key][lang]}"`);
            }
        });
        
        if (addedCount > 0) {
            // Sắp xếp keys theo thứ tự abc
            const sortedMessages = {};
            Object.keys(currentMessages).sort().forEach(key => {
                sortedMessages[key] = currentMessages[key];
            });
            
            // Ghi lại tệp với format đẹp
            const jsonString = JSON.stringify(sortedMessages, null, 2);
            fs.writeFileSync(filePath, jsonString, 'utf8');
            
            console.log(`   📊 Added ${addedCount} new keys`);
            totalAdded += addedCount;
        } else {
            console.log(`   ℹ️  No new keys needed`);
        }
        
        console.log(`   📄 Total keys: ${Object.keys(currentMessages).length}\n`);
    } else {
        console.log(`❌ ${lang.toUpperCase()}: File not found\n`);
    }
});

console.log(`✅ Completed! Added ${totalAdded} total keys across all languages.`);
console.log(`\n🔄 Next steps:`);
console.log(`1. Copy updated _locales to admin-panel: Copy-Item -Path "_locales" -Destination "admin-panel\\_locales" -Recurse -Force`);
console.log(`2. Refresh the browser to see changes`);
console.log(`3. All missing translation keys should now be resolved!`);
