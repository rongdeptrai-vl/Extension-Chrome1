// © 2024 TINI COMPANY - CONFIDENTIAL
// Employee: rongdeptrai-vl <rongdz2307@gmail.com>
// Commit: 8035ae4 | Time: 2025-08-11T02:28:42Z
// Watermark: TINI_1754879322_e868a412 | TINI_WATERMARK
// WARNING: Unauthorized distribution is prohibited
const fs = require('fs');
const path = require('path');

// Tất cả keys bị thiếu từ ảnh console
const securityKeys = {
    // Time-related keys
    "time_last_24h": {
        "en": "Last 24 Hours",
        "vi": "24 Giờ Qua", 
        "hi": "पिछले 24 घंटे",
        "ko": "지난 24시간",
        "zh": "过去24小时"
    },
    "time_last_7d": {
        "en": "Last 7 Days",
        "vi": "7 Ngày Qua",
        "hi": "पिछले 7 दिन", 
        "ko": "지난 7일",
        "zh": "过去7天"
    },
    "time_last_30d": {
        "en": "Last 30 Days",
        "vi": "30 Ngày Qua",
        "hi": "पिछले 30 दिन",
        "ko": "지난 30일", 
        "zh": "过去30天"
    },
    
    // Button keys
    "btn_refresh": {
        "en": "Refresh",
        "vi": "Làm Mới",
        "hi": "रीफ्रेश",
        "ko": "새로고침",
        "zh": "刷新"
    },
    
    // Security keys
    "security_active_threats": {
        "en": "Active Threats",
        "vi": "Mối Đe Dọa Hoạt Động",
        "hi": "सक्रिय खतरे",
        "ko": "활성 위협",
        "zh": "活跃威胁"
    },
    "security_blocked_today": {
        "en": "Blocked Today",
        "vi": "Đã Chặn Hôm Nay",
        "hi": "आज अवरुद्ध",
        "ko": "오늘 차단됨",
        "zh": "今日已阻止"
    },
    "security_active_threats_value": {
        "en": "0 threats detected",
        "vi": "0 mối đe dọa được phát hiện",
        "hi": "0 खतरे का पता चला",
        "ko": "0개 위협 감지됨",
        "zh": "检测到0个威胁"
    },
    "security_blocked_today_value": {
        "en": "0 blocked today",
        "vi": "0 đã chặn hôm nay",
        "hi": "आज 0 अवरुद्ध",
        "ko": "오늘 0개 차단",
        "zh": "今日阻止0个"
    },
    "security_risk_score": {
        "en": "Risk Score",
        "vi": "Điểm Rủi Ro",
        "hi": "जोखिम स्कोर",
        "ko": "위험 점수",
        "zh": "风险评分"
    },
    "security_risk_score_value": {
        "en": "Low Risk",
        "vi": "Rủi Ro Thấp",
        "hi": "कम जोखिम",
        "ko": "낮은 위험",
        "zh": "低风险"
    },
    
    // Trend keys
    "trend_down_12": {
        "en": "Down 12%",
        "vi": "Giảm 12%",
        "hi": "12% कम",
        "ko": "12% 감소",
        "zh": "下降12%"
    },
    "trend_flat": {
        "en": "No Change",
        "vi": "Không Thay Đổi",
        "hi": "कोई बदलाव नहीं",
        "ko": "변화 없음",
        "zh": "无变化"
    },
    "trend_up_secure": {
        "en": "Security Improved",
        "vi": "Bảo Mật Được Cải Thiện",
        "hi": "सुरक्षा में सुधार",
        "ko": "보안 개선됨",
        "zh": "安全性提高"
    },
    "trend_up": {
        "en": "Trending Up",
        "vi": "Xu Hướng Tăng",
        "hi": "बढ़ता रुझान",
        "ko": "상승 추세",
        "zh": "上升趋势"
    },
    
    // Security patch level
    "security_patch_level": {
        "en": "Security Patch Level",
        "vi": "Mức Độ Bản Vá Bảo Mật",
        "hi": "सुरक्षा पैच स्तर",
        "ko": "보안 패치 수준",
        "zh": "安全补丁级别"
    },
    "security_patch_level_value": {
        "en": "Up to Date",
        "vi": "Cập Nhật Mới Nhất",
        "hi": "अद्यतन",
        "ko": "최신 상태",
        "zh": "最新"
    },
    
    // Security threat timeline
    "security_threat_timeline": {
        "en": "Threat Timeline",
        "vi": "Dòng Thời Gian Mối Đe Dọa",
        "hi": "खतरा समयरेखा",
        "ko": "위협 타임라인",
        "zh": "威胁时间线"
    },
    
    // Security controls
    "security_no_threats": {
        "en": "No Threats Detected",
        "vi": "Không Phát Hiện Mối Đe Dọa",
        "hi": "कोई खतरा नहीं मिला",
        "ko": "위협 감지되지 않음",
        "zh": "未检测到威胁"
    },
    "security_controls_matrix": {
        "en": "Security Controls Matrix",
        "vi": "Ma Trận Kiểm Soát Bảo Mật",
        "hi": "सुरक्षा नियंत्रण मैट्रिक्स",
        "ko": "보안 제어 매트릭스",
        "zh": "安全控制矩阵"
    },
    "security_control_mfa": {
        "en": "Multi-Factor Authentication",
        "vi": "Xác Thực Đa Yếu Tố",
        "hi": "बहु-कारक प्रमाणीकरण",
        "ko": "다중 인증",
        "zh": "多重身份验证"
    },
    "security_enabled": {
        "en": "Enabled",
        "vi": "Đã Bật",
        "hi": "सक्षम",
        "ko": "활성화됨",
        "zh": "已启用"
    },
    "security_disabled": {
        "en": "Disabled",
        "vi": "Đã Tắt",
        "hi": "अक्षम",
        "ko": "비활성화됨",
        "zh": "已禁用"
    },
    "security_control_password_policy": {
        "en": "Password Policy",
        "vi": "Chính Sách Mật Khẩu",
        "hi": "पासवर्ड नीति",
        "ko": "암호 정책",
        "zh": "密码策略"
    },
    "security_control_ip_filtering": {
        "en": "IP Filtering",
        "vi": "Lọc IP",
        "hi": "आईपी फ़िल्टरिंग",
        "ko": "IP 필터링",
        "zh": "IP过滤"
    },
    "security_control_rate_limit": {
        "en": "Rate Limiting",
        "vi": "Giới Hạn Tốc Độ",
        "hi": "दर सीमा",
        "ko": "속도 제한",
        "zh": "速率限制"
    },
    "security_control_intrusion_detection": {
        "en": "Intrusion Detection",
        "vi": "Phát Hiện Xâm Nhập",
        "hi": "घुसपैठ का पता लगाना",
        "ko": "침입 탐지",
        "zh": "入侵检测"
    },
    "security_control_waf": {
        "en": "Web Application Firewall",
        "vi": "Tường Lửa Ứng Dụng Web",
        "hi": "वेब एप्लिकेशन फ़ायरवॉल",
        "ko": "웹 애플리케이션 방화벽",
        "zh": "Web应用防火墙"
    },
    
    // Analytics keys
    "btn_export_data": {
        "en": "Export Data",
        "vi": "Xuất Dữ Liệu",
        "hi": "डेटा निर्यात करें",
        "ko": "데이터 내보내기",
        "zh": "导出数据"
    },
    "analytics_avg_session": {
        "en": "Average Session Duration",
        "vi": "Thời Gian Phiên Trung Bình",
        "hi": "औसत सत्र अवधि",
        "ko": "평균 세션 시간",
        "zh": "平均会话时长"
    }
};

// Danh sách ngôn ngữ
const languages = ['en', 'vi', 'hi', 'ko', 'zh'];
const localesPath = path.join(__dirname, '_locales');

console.log('🔧 Adding security and UI keys from console errors...\n');

let totalAdded = 0;

languages.forEach(lang => {
    const filePath = path.join(localesPath, lang, 'messages.json');
    
    if (fs.existsSync(filePath)) {
        // Đọc tệp hiện tại
        const currentMessages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let addedCount = 0;
        
        console.log(`📝 Processing ${lang.toUpperCase()}...`);
        
        // Thêm từng key thiếu
        Object.keys(securityKeys).forEach(key => {
            if (!currentMessages[key] && securityKeys[key][lang]) {
                currentMessages[key] = {
                    "message": securityKeys[key][lang]
                };
                addedCount++;
                console.log(`   ✅ Added: ${key} = "${securityKeys[key][lang]}"`);
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
console.log(`1. Copy updated _locales to admin-panel`);
console.log(`2. Clear browser cache and refresh`);
console.log(`3. Check console for any remaining missing keys`);
